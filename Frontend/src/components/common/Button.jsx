import React from 'react';

const Button = ({ children, onClick, type = 'primary', iconClass }) => {
  const baseClasses = "flex items-center justify-center font-bold rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 transition transform hover:scale-105 active:scale-95 duration-200 ease-in-out";
  const primaryClasses = "px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:ring-blue-500";
  const secondaryClasses = "px-6 py-3 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 focus:ring-gray-400";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${type === 'primary' ? primaryClasses : secondaryClasses}`}
    >
      {iconClass && <i className={`${iconClass} mr-2`}></i>}
      {children}
    </button>
  );
};

export default Button;
