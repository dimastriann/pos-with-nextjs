'use client'
import React, {useState} from "react";
import { Card, CardContent } from "@/app/components/generic/product-card";
import { Button } from "@/app/components/generic/control-button";
import { Numpad } from "@/app/types/Numpad";
import { OrderLine, Product } from "@/app/types/Product";


interface PosOrder {
    products: any[];
    orderLines: OrderLine[];
    setOrderLines: Function;
    setScreen: () => void
}


export function PosOrderScreen({setScreen, products, orderLines, setOrderLines}: PosOrder) {
    // const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
    const [selectedLine, setSelectedLine] = useState<number | null>(null);
    const [numpadMode, setNumpadMode] = useState<Numpad>("qty");
    const [inputValue, setInputValue] = useState<string>("");
    

    const addProduct = (product: Product) => {
        console.log("add")
        setOrderLines((prev: OrderLine[]) => {
            console.log("prev", prev)
          const existing = prev.find((line) => line.id === product.id);
          if (existing) {
            return prev.map((line) =>
              line.id === product.id ? { ...line, qty: line.qty + 1 } : line
            );
          }
          console.log("ret", [...prev, { ...product, qty: 1, discount: 0 }])
          return [...prev, { ...product, qty: 1, discount: 0 }];
        });
      };
    
    //   const applyNumpadValue = () => {
    //     if (selectedLine === null) return;
    //     const value = parseFloat(inputValue);
    //     if (isNaN(value)) return;
    //     setOrderLines((prev) =>
    //       prev.map((line, idx) =>
    //         idx === selectedLine ? { ...line, [numpadMode]: value } : line
    //       )
    //     );
    //     setInputValue("");
    //   };
    
      const handleNumpadPress = (char: string) => {
        if (char === "clear") {
          setInputValue("");
        } else if (char === "del") {
          setInputValue((prev) => prev.slice(0, -1));
        } else {
          setInputValue((prev) => prev + char);
        }
      };

    return (
        <div className="p-4 grid grid-cols-12 gap-4 h-screen">
            <div className="col-span-8 overflow-y-auto">
                <h2 className="text-xl font-bold mb-2">Products</h2>
                <div className="grid grid-cols-3 gap-2">
                    {products.map((product) => (
                        <Card key={product.id} className="cursor-pointer" onClick={() => addProduct(product)}>
                            <CardContent className="p-2">
                                <p className="font-semibold">{product.title}</p>
                                <p className="text-sm">${product.price}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="col-span-4 border-l pl-4 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold mb-2 text-center">Customer A</h2>
                    <div className="space-y-2 overflow-y-auto max-h-64">
                        {orderLines.map((line, index) => (
                            <Card
                                key={line.id}
                                onClick={() => setSelectedLine(index)}
                                className={`cursor-pointer ${selectedLine === index ? "border-blue-500 border-2" : ""}`}
                            >
                                <CardContent className="p-2 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{line.title}</p>
                                        <p className="text-sm">Qty: {line.qty}, Price: ${line.price}, Discount: {line.discount}%</p>
                                    </div>
                                    <p className="font-bold">${(line.price * line.qty * (1 - line?.discount / 100)).toFixed(2)}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {orderLines.length && (
                    <div className="mt-4">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <Button>Refund</Button>
                            <Button>Customer Note</Button>
                            <Button>Enter Code</Button>
                            <Button>Discount %</Button>
                        </div>

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
                )}
            </div>
        </div>
    )
}