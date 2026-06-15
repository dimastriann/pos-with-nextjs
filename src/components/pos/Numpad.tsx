'use client';
import { motion } from 'motion/react';
import { NumpadMode } from '@/types/POSContext';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface NumpadProps {
  mode: NumpadMode;
  inputValue: string;
  onPress: (char: string) => void;
  onModeChange: (mode: NumpadMode) => void;
  onPayment: () => void;
  canPay: boolean;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+/-', '0', '.'];

export default function Numpad({
  mode,
  inputValue,
  onPress,
  onModeChange,
  onPayment,
  canPay,
}: NumpadProps) {
  return (
    <div className="p-2 select-none">
      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-1 mb-2">
        {(['qty', 'disc', 'price'] as NumpadMode[]).map((m) => (
          <Button
            key={m}
            size="sm"
            variant={mode === m ? 'default' : 'ghost'}
            onClick={() => onModeChange(m)}
            className="text-xs font-bold uppercase"
          >
            {m === 'disc' ? 'Disc %' : m}
          </Button>
        ))}
      </div>

      {/* Input display */}
      <div className="bg-muted rounded-lg px-3 py-2 text-right font-mono text-lg font-bold text-foreground mb-2 min-h-[44px]">
        {inputValue || '0'}
      </div>

      {/* Digit grid */}
      <div className="grid grid-cols-3 gap-1 mb-1">
        {DIGITS.map((char) => (
          <motion.div
            key={char}
            whileTap={{ scale: 0.88 }}
            transition={{ duration: 0.08 }}
          >
            <Button
              variant="outline"
              onClick={() => onPress(char)}
              className="h-12 w-full text-base font-semibold"
            >
              {char}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Delete + Payment */}
      <div className="grid grid-cols-3 gap-1 mt-1">
        <Button
          variant="outline"
          onClick={() => onPress('del')}
          className="col-span-1 h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <Delete className="h-4 w-4" />
        </Button>
        <Button
          onClick={onPayment}
          disabled={!canPay}
          className="col-span-2 h-12 text-base font-bold"
        >
          Payment
        </Button>
      </div>
    </div>
  );
}
