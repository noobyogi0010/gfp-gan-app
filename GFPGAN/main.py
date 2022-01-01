from genericpath import isfile
from posixpath import join
import torch
import torchvision.transforms as transforms
from PIL import Image

from flask import Flask, request, send_file, jsonify
from flask.helpers import url_for
from flask_cors import CORS, cross_origin

import argparse
import os
import sys
import cv2
import glob
import numpy as np
# from basicsr.utils import isfile, join
import basicsr
import base64
import json

from werkzeug.utils import redirect, secure_filename

from gfpgan import GFPGANer

UPLOAD_FOLDER = 'inputs/whole_imgs'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def convertToBase64(filePath):
    with open(filePath, "rb") as img:
        return base64.b64encode(img.read())


@app.route("/upload", methods=['POST', 'OPTIONS'])
@cross_origin()
def uploadImages():
    src = 'inputs/whole_imgs/'
    des = 'inputs/saved/'
    out = 'results/restored_imgs'

    for f in os.listdir(src):
        os.remove(os.path.join(src, f))
    for f in os.listdir(des):
        os.remove(os.path.join(des, f))
    for f in os.listdir(out):
        os.remove(os.path.join(out, f))

    if request.method == 'POST':
        if len(request.files) < 1:
        # if 'file' not in request.files:
            print('No file found.')
            return 'No file found.', 500

        imgs = []
        for img in request.files:
            print(request.files[img].filename)
            imgs.append(request.files[img])
        print(imgs, len(imgs))
        if len(imgs) > 0:
            for img in imgs:
                fname = secure_filename(img.filename)
                img.save(os.path.join(app.config['UPLOAD_FOLDER'], fname))
        
        return redirect(url_for('applyGfpGan'))

@app.route('/apply-gfp-gan', methods=['POST', 'GET', 'OPTIONS'])
@cross_origin()
def applyGfpGan():
    """Inference demo for GFPGAN.
    All credit to Xintao et al. at https://github.com/TencentARC/GFPGAN for writing this script i've adapted here for Flask. 
    """

    parser = argparse.ArgumentParser()
    parser = argparse.ArgumentParser()
    parser.add_argument('--upscale', type=int, default=2, help='The final upsampling scale of the image')
    parser.add_argument('--arch', type=str, default='clean', help='The GFPGAN architecture. Option: clean | original')
    parser.add_argument('--channel', type=int, default=2, help='Channel multiplier for large networks of StyleGAN2')
    parser.add_argument('--model_path', type=str, default='GFPGANCleanv1-NoCE-C2.pth')
    parser.add_argument('--bg_upsampler', type=str, default='realesrgan', help='background upsampler')
    parser.add_argument(
        '--bg_tile', type=int, default=400, help='Tile size for background sampler, 0 for no tile during testing')
    parser.add_argument('--test_path', type=str, default='upload/', help='Input folder')
    parser.add_argument('--suffix', type=str, default=None, help='Suffix of the restored faces')
    parser.add_argument('--only_center_face', action='store_true', help='Only restore the center face')
    parser.add_argument('--aligned', action='store_true', help='Input are aligned faces')
    parser.add_argument('--paste_back', action='store_false', help='Paste the restored faces back to images')
    parser.add_argument('--save_root', type=str, default='results', help='Path to save root')
    parser.add_argument(
        '--ext',
        type=str,
        default='auto',
        help='Image extension. Options: auto | jpg | png, auto means using the same extension as inputs')

    sys.argv = ['--model_path GFPGANCleanv1-NoCE-C2.pth --upscale 2 --test_path inputs/whole_imgs --save_root results/restored_imgs --bg_upsampler realesrgan']

    args = parser.parse_args()
    if args.test_path.endswith('/'):
        args.test_path = args.test_path[:-1]
    os.makedirs(args.save_root, exist_ok=True)

    # background upsampler
    if args.bg_upsampler == 'realesrgan':
        if not torch.cuda.is_available():
            # import warnings
            # warnings.warn('The unoptimized RealESRGAN is very slow on CPU. We do not use it. ',
            #               'If you really want to use it, please modify the corresponding codes.')
            print('The unoptimized RealESRGAN is very slow on CPU. We do not use it. ',
                          'If you really want to use it, please modify the corresponding codes.')
            bg_upsampler = None
        else:
            from realesrgan import RealESRGANer
            bg_upsampler = RealESRGANer(
                scale=2,
                model_path='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth',
                tile=args.bg_tile,
                tile_pad=10,
                pre_pad=0,
                half=True
            )
    else:
        bg_upsampler = None
    
    args.test_path = 'inputs/whole_imgs'

    restorer = GFPGANer(
        model_path=args.model_path,
        upscale=args.upscale,
        arch=args.arch,
        channel_multiplier=args.channel,
        bg_upsampler=bg_upsampler
    )
    iList = sorted(glob.glob(os.path.join(args.test_path, '*')))
    print(iList, '**')

    count = 4

    for iPath in iList:
        count -= 1
        if count == 0:
            break
        print('yes')
        iName = os.path.basename(iPath)
        print(f'Processing {iName} ...')
        name, ext = os.path.splitext(iName)
        inpImg = cv2.imread(iPath, cv2.IMREAD_COLOR)

        croppedFaces, restoredFaces, restoredImg = restorer.enhance(
            inpImg, has_aligned=args.aligned, only_center_face=args.only_center_face, paste_back=args.paste_back
        )

        # save faces
        for i, (cFace, rFace) in enumerate(zip(croppedFaces, restoredFaces)):
            print('1')
            # save cropped face
            saveCropPath = os.path.join(args.save_root, 'cropped_faces', f'{name}_{i:02d}.png')
            # cv2.imwrite(cFace, saveCropPath)
            cv2.imwrite(saveCropPath, cFace)

            # save restored face
            if args.suffix is not None:
                saveFaceName = f'{name}_{i:02d}_{args.suffix}.png'
            else:
                saveFaceName = f'{name}_{i:02d}.png'
            saveRestorePath = os.path.join(args.save_root, 'restored_faces', saveFaceName)
            # cv2.imwrite(rFace, saveRestorePath)
            cv2.imwrite(saveRestorePath, rFace)

            # save comparision image
            cmpImg = np.concatenate((cFace, rFace), axis=1)
            # cv2.imwrite(cmpImg, os.path.join(args.save_root, 'cmp', f'{name}_{i:02d}.png'))
            cv2.imwrite(os.path.join(args.save_root, 'cmp', f'{name}_{i:02d}.png'), cmpImg)

        # save restored image
        if restoredImg is not None:
            if args.ext == 'auto':
                extension = ext[1:]
            else:
                extension = args.ext

            if args.suffix is not None:
                saveRestorePath = os.path.join(args.save_root, 'restored_imgs', f'{name}_{args.suffix}.{extension}')
            else:
                saveRestorePath = os.path.join(args.save_root, 'restored_imgs', f'{name}.{extension}')
            # cv2.imwrite(restoredImg, saveRestorePath)
            cv2.imwrite(saveRestorePath, restoredImg)

    onlyFiles = [f for f in os.listdir('results/restored_imgs') if isfile(join('results/restored_imgs', f))]
    if '.DS_Store' in onlyFiles:
        onlyFiles.remove('.DS_Store')
    
    resFileNames = next(os.walk(args.save_root + 'restored_imgs'), (None, None, []))[2]
    resp = []
    for img in onlyFiles:
        with open(args.save_root+'/restored_imgs/'+img, 'rb') as file:
            resp.append(str(base64.b64encode(file.read())))
    
    print(onlyFiles)
    print(type(resp))

    # return "done"
    return jsonify(resp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)