import React from "react";
import { Button } from "@/app/components/generic/control-button";
import { usePos } from "@/app/page";


interface LoginProps {
    // username: string;
    // password: string; 
    // setUserName: (val: string) => void;
    // setPassword: (val: string) => void; 
    onLogin: () => void
}

type LoginPropsType = {
  onLogin: () => void
}

export function LoginScreen({onLogin}: LoginPropsType){
  const {username, password, setUserName, setPassword} = usePos();
    return (
        <form className="h-screen flex items-center justify-center">
          <div className="p-8 rounded-lg shadow-xl space-y-4">
            <h1 className="text-xl font-bold text-center">Cashier Login Toko ABC</h1>
            <input
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              // onKeyUp={onLogin}
              placeholder="Enter username"
              className="border rounded p-2 w-full"
            />
            <input
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              // onKeyUp={onLogin}
              placeholder="Enter Password"
              className="border rounded p-2 w-full"
            />
            <Button type="submit" className="w-full" onClick={onLogin}>Login</Button>
          </div>
        </form>
      );
}
