import React from "react";
import './loader.css';

export default function Loader() {
    let circleClasses = 'h-3 w-3 border-2 border-zinc-600 rounded-full';

    return (
        <div className='flex absolute justify-center bg-black/10 items-center w-full h-screen loader-position m-0'>
            <div className="flex flex-col items-center justify-center bg-zinc-100 px-8 py-6 rounded-lg shadow-md">
                <div className="flex">
                    <div className={`${circleClasses} mr-1 animate-bounce`}></div>
                    <div className={`${circleClasses} mr-1 animate-bounce200`}></div>
                    <div className={`${circleClasses} animate-bounce400`}></div>
                </div>
                <p className="mt-4">Your image is getting restored. </p>
                <p>Please wait...</p>
            </div>
        </div>
    );
}