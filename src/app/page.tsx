'use client'

import React, { createContext, useState, useEffect, useContext } from "react";

import { Screens } from "@/app/types/Screen";
import { OrderLineType } from "@/app/types/Product"
import { POSContenxtType, defaultPOSContext } from "@/app/types/POSContext";
import { LoginScreen } from "@/app/components/screens/login";
import { PosOrderScreen } from "@/app/components/screens/pos-order";
import { PaymentScreen } from "@/app/components/screens/payment";
import { ReceiptScreen } from "@/app/components/screens/receipt";
import { SummaryScreen } from "@/app/components/screens/summary";


const POSContext = createContext<POSContenxtType>(defaultPOSContext);
export const usePos = () => useContext(POSContext);

export default function POS() {
	const [screen, setScreen] = useState<Screens>("login");
	const [username, setUserName] = useState("");
	const [password, setPassword] = useState("");
	const [orderLines, setOrderLines] = useState<OrderLineType[]>([]);
	const [selectedLine, setSelectedLine] = useState<number | null>(null);
	const [products, setProducts] = useState<any[]>([]);

	const posContextValue = {
		screen, 
		setScreen,
		username,
		setUserName,
		password,
		setPassword
	}

	useEffect(() => {
		fetch("https://fakestoreapi.com/products")
		  .then(res => res.json())
		  .then(data => setProducts(data));
	  }, []);

	const handleLogin = () => {
		console.log(arguments)
		if (username.trim()) setScreen("pos_order");
	};
	const total = orderLines.reduce((sum, line) => sum + line.price * line.qty * (1 - line.discount / 100), 0);
	console.log("total", total)

	// Screen components mapping
	const screenComponents: Record<Screens, React.ReactNode> = {
		login: (
			<LoginScreen 
				// username={username} 
				// password={password} 
				// setUserName={setUserName} 
				// setPassword={setPassword} 
				onLogin={handleLogin} 
				/>
		),
		pos_order: (
			<PosOrderScreen 
				products={products} 
				orderLines={orderLines} 
				setOrderLines={setOrderLines}
				setScreen={() => setScreen("payment")} />
		),
		payment: (
			<PaymentScreen total={total} onPay={() => setScreen("receipt")} onBack={() => setScreen("pos_order")} />
		),
		receipt: (
			<ReceiptScreen orderLines={orderLines} total={total} onNewOrder={() => {
				setOrderLines([]);
				setSelectedLine(null);
				setScreen("pos_order");
			}} />
		),
		summary: (
			<SummaryScreen />
		)
	};

	// Render the appropriate screen component
	return <POSContext.Provider value={posContextValue}>
		{screenComponents[screen]}
		</POSContext.Provider>;
}
