import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const GenericModal = ({
  isOpen,
  onClose,
  title,
  children,
  type = 'success',
  autoCloseDuration = null
}) => {
  useEffect(() => {
    let timer;
    if (isOpen && autoCloseDuration) {
      timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, onClose, autoCloseDuration]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={`absolute max-w-md w-full mx-4 p-6 rounded-lg shadow-lg text-white text-center transform transition-all duration-300 pointer-events-auto ${
          isSuccess ? 'bg-green-500' : 'bg-red-500'
        }`}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="flex flex-col items-center">
          {isSuccess ? (
            <FaCheckCircle className="text-white text-4xl mb-2" />
          ) : (
            <FaExclamationCircle className="text-white text-4xl mb-2" />
          )}
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <div className="mb-4">{children}</div>
          {!autoCloseDuration && (
            <button
              onClick={onClose}
              className="bg-white text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-100 transition duration-200"
            >
              Stäng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenericModal;
