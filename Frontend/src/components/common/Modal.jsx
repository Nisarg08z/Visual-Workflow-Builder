import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh] animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-semibold focus:outline-none"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Title */}
        {title && (
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {title}
          </h3>
        )}

        {/* Modal Content */}
        <div className="text-gray-700">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
