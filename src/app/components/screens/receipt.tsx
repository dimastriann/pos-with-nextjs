import React from "react";
import { Button } from "@/app/components/generic/control-button";
import { OrderLine } from "@/app/types/Product"


interface ReceiptProps {
    orderLines: OrderLine[];
    total: number;
    onNewOrder: () => void
}

export const ReceiptScreen = ({ orderLines, total, onNewOrder }: ReceiptProps) => (
    <div className="h-screen p-8">
        <h1 className="text-xl font-bold mb-4">Receipt</h1>
        <ul className="mb-4">
            {orderLines.map((line, index) => (
                <li key={index}>
                    {line.name} x{line.qty} - ${line.price} @ {line.discount}% → $
                    {(line.qty * line.price * (1 - line.discount / 100)).toFixed(2)}
                </li>
            ))}
        </ul>
        <p className="font-bold">Total: ${total.toFixed(2)}</p>
        <Button className="mt-4" onClick={onNewOrder}>New Order</Button>
    </div>
);