import React from "react";
import { Button } from "@/app/components/generic/control-button";
import Numpad from "@/components/numpad";
import PaymentMethod from "@/components/payment/payment-mathod";
import PaymentLine from "@/components/payment/payment-line";


interface PaymentProps {
    total: number;
    onPay: () => void;
    onBack: () => void
}

export const PaymentScreen = ({ total, onPay, onBack }: PaymentProps) => (
    <div className="h-screen flex flex-12/12 flex-wrap justify-center items-center">
        <div className="flex-1">
            <h1 className="text-2xl font-bold mb-4">Payment</h1>
        </div>
        <div className="flex-1">
            <div className="grid grid-cols-1 gap-2">
                {["Bank ABC", "CASH", "QRIS", "Bank XYA"].map((method, index) => (
                    <PaymentMethod key={index}>{method}</PaymentMethod>
                    ))
                }
            </div>
            <div className="grid grid-cols-1 gap-2 mt-[2rem]">
                {[{method: "Bank", amount: 100000}, {method: "CASH", amount: 50000}].map((payLine, index) => (
                    <PaymentLine key={index}>
                        <div className="flex-1">{payLine.method}</div>
                        <div className="flex-1">{payLine.amount}</div>
                    </PaymentLine>
                    ))
                }
            </div>
            <p className="mb-4">Total: ${total.toFixed(2)}</p>
        </div>
        <div className="flex-1">
            <Numpad />
            <Button className="mb-2" onClick={onPay}>Pay & Print Receipt</Button>
            <Button variant="outline" onClick={onBack}>Back</Button>
        </div>
    </div>
);
