from flask import Flask, request, send_file
from flask.helpers import url_for
from flask_cors import CORS, cross_origin

import os

from werkzeug.utils import redirect, secure_filename

UPLOAD_FOLDER = 'inputs/whole_imgs'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
            # for i in range(len(imgs)):
                # print(i)
            for img in imgs:
                fname = secure_filename(img.filename)
                img.save(os.path.join(app.config['UPLOAD_FOLDER'], fname))
        
        return redirect(url_for('applyGfpGan'))

@app.route('/apply-gfp-gan', methods=['POST', 'GET', 'OPTIONS'])
@cross_origin()
def applyGfpGan():
    return "data"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)