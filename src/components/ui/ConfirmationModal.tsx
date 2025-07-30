'use client';

import { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  type,
  message,
  autoClose = true,
  autoCloseDelay = 3000
}: ConfirmationModalProps) {
  useEffect(() => {
    if (isOpen && autoClose && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, type, autoCloseDelay, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
  const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all duration-300 ease-in-out sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
          {/* Close button */}
          <button
            type="button"
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div>
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${bgColor} animate-scale-in`}>
              {isSuccess ? (
                <svg className={`h-6 w-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className={`h-6 w-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            {/* Message */}
            <div className="mt-3 text-center sm:mt-5">
              <h3 className={`text-base font-semibold leading-6 ${textColor}`} id="modal-title">
                {isSuccess ? 'Success!' : 'Error'}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isSuccess 
                  ? 'bg-green-600 hover:bg-green-500 focus-visible:outline-green-600' 
                  : 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600'
              }`}
              onClick={onClose}
            >
              {isSuccess ? 'Continue' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}