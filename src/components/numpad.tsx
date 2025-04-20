import React from "react";
import { usePos } from "@/app/page";


export default function Numpad({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const {setScreen} = usePos();

    return (
        <div className={`p-2 ${className}`} {...props}>
            <div className="grid grid-cols-4 gap-2 numpad-button">
                {["1", "2", "3", "qty", "4", "5", "6", "disc", "7", "8", "9", "price", "+/-", "0", ".", "del"].map((char, idx) => (
                    // <Button
                    //     key={idx}
                    //     className={`${char === numpadMode ? "bg-blue-500 text-white active" : ""}`}
                    //     onClick={() => {
                    //         if (["qty", "price", "disc"].includes(char)) {
                    //             setNumpadMode(char as any);
                    //         } else if (char === "del") {
                    //             handleNumpadPress("del");
                    //         } else if (char === "+/-") {
                    //             setInputValue((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
                    //         } else {
                    //             handleNumpadPress(char);
                    //         }
                    //     }}
                    // >
                    //     {char.toUpperCase()}
                    // </Button>
                    <button key={idx} className="px-2 py-2 rounded-lg font-semibold text-sm cursor-pointer bg-blue-600 text-white hover:bg-blue-700 uppercase" onClick={() => console.info(char)}>{char}</button>
                ))}
                <div className="col-span-4">
                    <div className="flex items-center justify-between mt-2">
                        <button className="mt-4 px-4 py-2 w-full cursor-pointer bg-blue-600 rounded-lg font-semibold text-sm text-white hover:bg-blue-700 uppercase" onClick={() => setScreen("payment")}>Payment</button>
                    </div>
                </div>
            </div>
        </div>
    )
}