import React from "react";
import './navbar.css';

export default function Navbar() {
    return (
        <div className="flex flex-1 bg-zinc-100 p-4 border-b-2 border-zinc-300 justify-center items-center">
            <h1 className="text-lg font-bold uppercase">GFP-GAN App</h1>
        </div>
    )
}