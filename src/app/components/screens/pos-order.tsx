'use client'
import React, {useState} from "react";
import { Card, CardContent } from "@/app/components/generic/product-card";
import { Button } from "@/app/components/generic/control-button";
import { NumpadType } from "@/app/types/NumpadType";
import { OrderLineType, ProductType } from "@/app/types/Product";
import Numpad from "@/components/numpad"
import { OrderLine } from "@/components/order/orderline";


interface PosOrder {
    products: any[];
    orderLines: OrderLineType[];
    setOrderLines: Function;
    setScreen: () => void
}


export function PosOrderScreen({setScreen, products, orderLines, setOrderLines}: PosOrder) {
    // const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
    const [selectedLine, setSelectedLine] = useState<number | null>(null);
    const [numpadMode, setNumpadMode] = useState<NumpadType>("qty");
    const [inputValue, setInputValue] = useState<string>("");
    

    const addProduct = (product: ProductType) => {
        console.log("add")
        setOrderLines((prev: OrderLineType[]) => {
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

    const deleteLine = (line: OrderLineType) => {
        console.info(arguments, line)
        setOrderLines((orderLine: OrderLineType[]) => {
            return orderLine.filter((l) => l.id !== line.id);

        })
    }
    
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
            <div className="col-span-7 overflow-y-auto">
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
            <div className="control-button col-span-1 overflow-x-auto">
                <div className="grid grid-cols-1 gap-2">
                    <Button className="uppercase" onClick={() => alert("control button")}>Refund</Button>
                    <Button className="uppercase" onClick={() => alert("control button")}>Customer Note</Button>
                    <Button className="uppercase" onClick={() => alert("control button")}>Enter Code</Button>
                    <Button className="uppercase" onClick={() => alert("control button")}>Discount %</Button>
                    <Button className="uppercase" onClick={() => alert("control button")}>Discount Rp</Button>
                </div>
            </div>

            <div className="col-span-4 border-l pl-4 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold mb-2 text-center border-1 p-1 rounded-lg bg-blue-500 text-white cursor-pointer">Customer A</h2>
                    <div className="space-y-2 overflow-y-auto max-h-96">
                        {orderLines.map((line, index) => (
                            <OrderLine
                                key={line.id}
                                onClick={() => setSelectedLine(index)}
                                className={`cursor-pointer relative ${selectedLine === index ? "border-blue-500 border-2" : ""}`}
                            >
                                <div className="p-2 flex justify-between items-center relative">
                                    <div>
                                        <p className="font-semibold">{line.title}</p>
                                        <p className="text-sm">Qty: {line.qty}, Price: ${line.price}, Discount: {line.discount}%</p>
                                    </div>
                                    <p className="font-bold">${(line.price * line.qty * (1 - line?.discount / 100)).toFixed(2)}</p>
                                    {/* <div className="absolute top-0 right-4 mb-2"><i>x</i></div> */}
                                </div>
                                <div className="absolute top-0 right-4" onClick={(event) => {event.preventDefault(); deleteLine(line)}}>x</div>
                            </OrderLine>
                        ))}
                    </div>
                </div>

                {!!orderLines.length && (
                    <div className="">
                        <Numpad />
                    </div>
                )}
            </div>
        </div>
    )
}