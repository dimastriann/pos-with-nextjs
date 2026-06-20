import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[580px] gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-5">
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[70vh] px-6 pb-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
