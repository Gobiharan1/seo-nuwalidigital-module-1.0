
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-bkg-light border border-red-500/30 rounded-[2rem] max-w-md w-full p-8 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 mx-auto">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-center text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary text-center text-sm mb-8">{message}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 rounded-xl bg-surface hover:bg-surface-hover text-sm font-bold transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black transition-all shadow-lg shadow-red-600/20">Confirm Delete</button>
        </div>
      </div>
    </div>
  );
};
