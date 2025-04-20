import React from "react";
import { Button } from "@/app/components/generic/control-button";


interface PaymentProps {
    total: number;
    onPay: () => void;
    onBack: () => void
}

export const PaymentScreen = ({ total, onPay, onBack }: PaymentProps) => (
    <div className="h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">Payment</h1>
        <p className="mb-4">Total: ${total.toFixed(2)}</p>
        <Button className="mb-2" onClick={onPay}>Pay & Print Receipt</Button>
        <Button variant="outline" onClick={onBack}>Back</Button>
    </div>
);
