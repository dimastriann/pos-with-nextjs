'use client';
import { useEffect, useRef } from 'react';

const MIN_BARCODE_LENGTH = 3;
const CHAR_INTERVAL_MS = 80; // chars arriving faster than this = scanner input
const IDLE_RESET_MS = 500; // clear buffer if no key for this long

/**
 * Detects USB HID barcode scanner input (rapid chars ending in Enter).
 * Skips when an input/textarea/select element is focused so normal typing
 * is never intercepted.
 */
export function useBarcodeScanner(
  onScan: (barcode: string) => void,
  enabled = true,
) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const clearBuffer = () => {
      bufferRef.current = '';
      lastKeyTimeRef.current = 0;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Let normal typing through when an input is focused
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const now = Date.now();
      const timeSinceLast = now - lastKeyTimeRef.current;

      // Reset stale buffer
      if (lastKeyTimeRef.current > 0 && timeSinceLast > CHAR_INTERVAL_MS) {
        clearBuffer();
      }

      // Schedule auto-clear if scanner stops mid-sequence
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(clearBuffer, IDLE_RESET_MS);

      if (e.key === 'Enter') {
        const scanned = bufferRef.current.trim();
        if (scanned.length >= MIN_BARCODE_LENGTH) {
          onScan(scanned);
        }
        clearBuffer();
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        return;
      }

      // Only accumulate printable single characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        lastKeyTimeRef.current = now;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [onScan, enabled]);
}
