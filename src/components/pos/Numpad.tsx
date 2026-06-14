'use client';
import React from 'react';
import { NumpadMode } from '@/types/POSContext';

interface NumpadProps {
  mode: NumpadMode;
  inputValue: string;
  onPress: (char: string) => void;
  onModeChange: (mode: NumpadMode) => void;
  onPayment: () => void;
  canPay: boolean;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+/-', '0', '.'];

export default function Numpad({ mode, inputValue, onPress, onModeChange, onPayment, canPay }: NumpadProps) {
  return (
    <div className="p-2 select-none">
      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-1 mb-2">
        {(['qty', 'disc', 'price'] as NumpadMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`py-1.5 rounded text-xs font-bold uppercase transition-colors ${
              mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {m === 'disc' ? 'Disc %' : m}
          </button>
        ))}
      </div>

      {/* Input display */}
      <div className="bg-gray-100 rounded-lg px-3 py-2 text-right font-mono text-lg font-bold text-gray-800 mb-2 min-h-[40px]">
        {inputValue || '0'}
      </div>

      {/* Digit grid */}
      <div className="grid grid-cols-3 gap-1 mb-1">
        {DIGITS.map((char) => (
          <button
            key={char}
            onClick={() => onPress(char)}
            className="py-3 rounded-lg font-semibold text-sm bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Delete + Payment */}
      <div className="grid grid-cols-3 gap-1 mt-1">
        <button
          onClick={() => onPress('del')}
          className="col-span-1 py-3 rounded-lg font-semibold text-sm bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
        >
          ⌫
        </button>
        <button
          onClick={onPayment}
          disabled={!canPay}
          className="col-span-2 py-3 rounded-lg font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Payment
        </button>
      </div>
    </div>
  );
}
