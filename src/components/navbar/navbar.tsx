import React from "react";
import './navbar.css';

export default function Navbar() {
    return (
        <div className="flex flex-col flex-1 bg-zinc-100 p-4 border-b-2 border-zinc-300 justify-center items-center">
            <h1 className="text-lg font-bold uppercase">GFP-GAN App<sup className="text-orange-700 ml-1">[beta]</sup></h1>
            <a href="https://github.com/noobyogi0010/gfp-gan-app" className="flex items-center text-xs text-zinc-500 hover:underline mt-1">
                Visit the Github Repo 
            </a>
        </div>
    )
}
