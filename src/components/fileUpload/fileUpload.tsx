import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import './fileUpload.css';

// base styles for dropzone
const baseStyle = {
    transition: 'border .3s ease-in-out'
};

const activeStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

const baseUrl = " http://192.168.29.226:5000/";

export default function FileUpload() {

    // const to deal with api loading, error and response
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    let [gfpGanResult, setGfpGanResult] = useState<any[]>([]);
    // let imgData: any = [];
    let resData: any = [];

    // const to store the selected images
    const [files, setFiles] = useState([]);
    // const [imgData, setImgData] = useState([]);

    // to handle the drop functionality
    const onDrop = useCallback(acceptedFiles => {
        setFiles(acceptedFiles.map((file:File) => 
            Object.assign(file, {
                preview: URL.createObjectURL(file),
                // img: blobToBase64(file),
                img: file
            })
        
        ));
    }, []);

    // getting the params from dropzone and initializing the dropzone with allowed file types
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        onDrop,
        accept: 'image/jpeg, image/png, image/jpg, image/svg'
    });

    // applying styles to different events of dropzone
    const style:any = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive? activeStyle: {}),
        ...(isDragAccept? acceptStyle: {}),
        ...(isDragReject? rejectStyle: {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);

    function blobToBase64(blob: Blob) {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    // make api call
    /**
     * TODO: This function utilizes the already built GFP-GAN API created on Hugging Face. Need to explore this in near future.
     */
    /*
     function getHRImages() {

        let imgData: any = [];

        // append each img under the same key so that it goes as an array of files to server
        files.forEach(async (elem: any, index: number) => {
            // console.log(elem.img)
            // imgData.push(await blobToBase64(elem.img));
            // console.log(await blobToBase64(elem.img))
            // blobToBase64(elem.img).then((res: any) => {
            //     console.log(res);
            //     imgData.push(res);
            // });
            imgData.push(elem.img);
        });
        const imgRes = await Promise.all(imgData);
        console.log('>>> hello data ', imgData);
        console.log('>>> hello res ', imgRes);

        fetch(
            "https://hf.space/gradioiframe/akhaliq/GFPGAN/api/predict",
            {
                method: "POST",
                body: JSON.stringify({
                    "data": imgRes
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then((res:any) => {
            return res.json();
        }).then((jsonRes: any) => {
            console.log('>>>> hurray', jsonRes);
            resData = jsonRes;
            // setGfpGanResult(jsonRes.data.map((file:any) => {
            //     Object.assign(gfpGanResult, {
            //         ...file
            //     })
            // }))
            // const newData = [...gfpGanResult, jsonRes.data]
            setGfpGanResult([...jsonRes?.data]);
        }).finally(() => {
            console.log('>>> Magic ', gfpGanResult)
            console.log('>>> Magic no 2  ', resData)
            console.log('The End');
        })

    }
    */

    function applyGfpGan() {
        let formData = new FormData();

        files.forEach((elem:any, index:number) => {
            formData.append("img"+index, elem.img);
        });

        axios({
            method: "post",
            url: baseUrl+"upload",
            data: formData,
            headers: {"Content-Type": "multipart/form-data"},
        }).then(res => {
            console.log(res);
        }).catch(err => {
            console.log(err)
        })
    }

    // to remove a certain selected image
    function removeFile(index:number) {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    }

    // component to display each selected file
    const thumbs = files.map((file:any, index:number) => (
        <div key={file.name} className="flex flex-col justify-center items-center bg-zinc-100 border-dashed border-2 border-zinc-300 rounded-lg m-2 p-4">
            <img src={file.preview} alt={file.name} className="max-h-32 rounded-lg" />

            {/* button to remove a selected file */}
            <button className="text-red-600 mt-4" onClick={() => {removeFile(index)}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    ));
    
    const resG = gfpGanResult?.map((file:any) => (
                <div>
                    <img src={file} alt="" />
                </div>
            ));
        
    // to do clean up
    useEffect(() => () => {
        files.forEach((file:any) => URL.revokeObjectURL(file.preview));
    }, [files]);

    return (
        <div className="flex flex-col justify-center">
            {/* {gfpGanResult.length>0? resG: console.log('>>>', gfpGanResult)} */}
            { 
                gfpGanResult.length>0 ?
                    resG :
                    console.log('>>>> nope')
            }
            {/* dropzone section */}
            <div {...getRootProps({style})} className="flex flex-1 justify-center mx-14 my-4 bg-zinc-100 border-dashed border-2 border-zinc-300 rounded-lg p-4">
                <input {...getInputProps()} />
                <h2 className="font-semibold text-zinc-500 text-sm">Drag and drop your images here, or click to select images</h2>
            </div>
            
            {/* selected images preview section */}
            <div className="flex justify-center items-center mx-14 flex-wrap">
                {thumbs}
            </div>

            {/* button to make the api call to the model */}
            <div className="flex justify-center">
                <button 
                    className=" transition ease-in-out delay-150 px-4 py-2 md:px-6 md:py-4 my-4 rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-700 hover:to-blue-700 duration-300 uppercase font-semibold text-sm md:font-bold md:text-base lg:text-lg"
                    onClick={applyGfpGan}>
                    Apply GFP-GAN
                </button>
            </div>
        </div>
    );
}
