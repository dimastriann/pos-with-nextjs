import React from "react";

export function Numpad({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`p-2 ${className}`} {...props}>
            <div className="grid grid-cols-4 gap-2 numpad-button">
                {["1", "2", "3", "qty", "4", "5", "6", "disc", "7", "8", "9", "price", "+/-", "0", ".", "del"].map((char, idx) => (
                    <Button
                        key={idx}
                        className={`${char === numpadMode ? "bg-blue-500 text-white active" : ""}`}
                        onClick={() => {
                            if (["qty", "price", "disc"].includes(char)) {
                                setNumpadMode(char as any);
                            } else if (char === "del") {
                                handleNumpadPress("del");
                            } else if (char === "+/-") {
                                setInputValue((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
                            } else {
                                handleNumpadPress(char);
                            }
                        }}
                    >
                        {char.toUpperCase()}
                    </Button>
                ))}
                <div className="col-span-4">
                    <div className="flex items-center justify-between mt-2">
                        <Button className="mt-4 w-full" onClick={setScreen}>Payment</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}