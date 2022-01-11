import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import Loader from "../loader/loader";
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

// base url of the server
// const baseUrl = " http://192.168.29.226:8080/";
const baseUrl = "https://gfp-gan-server-m2zkvmhava-uc.a.run.app/";

export default function FileUpload() {

    // const to deal with api loading, and response
    const [isLoading, setIsLoading] = useState(false);
    let [gfpGanResult, setGfpGanResult] = useState<any[]>([]);

    // const to store the selected images
    const [files, setFiles] = useState([]);

    // to handle the drop functionality
    const onDrop = useCallback(acceptedFiles => {
        setFiles(acceptedFiles.map((file:File) => 
            Object.assign(file, {
                preview: URL.createObjectURL(file),
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
        accept: 'image/jpeg, image/png, image/jpg, image/svg',
        maxFiles: 3,
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

    /**
     * Function Name: applyGfpGan
     * Parameters: None
     * Description: This function calls the backend api that applies GFP-GAN on all the uploaded files and returns an array of restored images.
     * Return: void
     */
    function applyGfpGan() {

        // enable loader
        setIsLoading(true);

        // initialize form data to send to api
        let formData = new FormData();

        // iterate over selected files and add it to formdata
        files.forEach((elem:any, index:number) => {
            formData.append("img"+index, elem.img);
        });

        // make the api call
        axios({
            method: "post",
            url: baseUrl+"upload",
            data: formData,
            headers: {"Content-Type": "multipart/form-data"},
        })
        .then((res:any) => {
            // set the restored images to result var
            setGfpGanResult(res?.data);
            
            // disable loader
            setIsLoading(false);
        }).catch(err => {
            // in case of error disable loader and console the error
            console.log(err)
            setIsLoading(false);
        })
    }

    /**
     * Function Name: removeFile
     * Parameters: index (Number)
     * Description: This function removes the given index value from the files array.
     * Return: void
     */
    function removeFile(index:number) {
        // create a copy of existing input file array
        const newFiles = [...files];

        // remove the given index from the new copy array
        newFiles.splice(index, 1);

        // overwrite the existing files array with the updated new array
        setFiles(newFiles);
    }

    /**
     * Function Name: downloadFile
     * Parameters: index (Number)
     * Description: This function downloads the given index file from the result array.
     * Return: void
     */
    function downloadFile(index:number) {
        // create a copy of existing result array
        const newFiles = [...gfpGanResult];

        // get the base64 url for the image to be downloaded
        const src = `data:image/png;base64,`+newFiles[index].substring(2, newFiles[index].length-2);

        // create a anchor tag in the dom
        // this anchor tag will be used to download the selected image
        const dwnldLink = document.createElement('a');

        // assign base64 url as href to the anchor tag we created above
        dwnldLink.href = src;

        // give a random name to the file in order to download it
        dwnldLink.download = `img`+(index+1)+`.png`;

        // fire the click event on the anchor tag
        dwnldLink.click();
        
    }

    // component to display each selected file
    const thumbs = files.map((file:any, index:number) => (
        <div key={file.name} className="flex flex-col justify-center items-center bg-zinc-100 border-dashed border-2 border-zinc-300 rounded-lg m-2 p-4">
            <img src={file.preview} alt={file.name} className="max-h-32 rounded-lg" />

            {/* button to remove a selected file */}
            <button className="flex px-4 bg-red-600 text-white mt-4 rounded-lg padding-y font-medium text-sm items-center justify-center" onClick={() => {removeFile(index)}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Remove</span>
            </button>
        </div>
    ));
    
    // component to display restored images
    const resG = gfpGanResult?.map((file:any, index:number) => (
                <div key={index} className="flex flex-col justify-center items-center md:mx-14 my-4 flex-wrap bg-zinc-100 border-dashed border-2 border-zinc-300 rounded-lg p-4">
                    {/* as we are getting base64 string from backend we need to trim the unwanted chars from it and then assign it as src to img tag */}
                    <img src={`data:image/png;base64,`+file.substring(2, file.length-2)} alt={file.name} className="max-h-32 md:max-h-44 rounded-lg" />
                    
                    {/* button to download the restored image */}
                    <button className="flex px-4 bg-green-600 text-white mt-4 rounded-lg padding-y font-medium text-sm" onClick={() => downloadFile(index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download
                    </button>
                </div>
            ));
        
    // to do clean up
    // this will remove the object URLs from the window that we created while selecting images
    useEffect(() => () => {
        files.forEach((file:any) => URL.revokeObjectURL(file.preview));
    }, [files]);

    return (
        <div className="flex flex-col justify-center items-center">
            {/* render the loader whenever an api call is made */}
            {
                isLoading ?
                <div>
                    <Loader />
                </div> :
                ''
            }

            {/* render the restorted images returned by the server */}
            <div className="flex justify-center items-center mx-14 flex-wrap">
                {resG}
            </div>
            
            {/* dropzone section */}
            <div {...getRootProps({style})} className="flex flex-1 justify-center mx-14 my-4 bg-zinc-100 border-dashed border-2 border-zinc-300 rounded-lg p-4">
                <input {...getInputProps()} />
                <h2 className="text-center font-semibold text-zinc-500 text-sm">Drag and drop your images here, or click to select images <br /><span className="font-bold">(Max 3 images)</span> </h2>
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
