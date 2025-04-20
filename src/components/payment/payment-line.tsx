import React from "react";

export default function PaymentLine({ children, ...props }: React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
    return (
        <div className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer text-center flex flex-wrap" {...props}>{children}</div>
    )
}