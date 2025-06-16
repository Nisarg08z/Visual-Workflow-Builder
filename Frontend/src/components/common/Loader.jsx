// src/components/common/Loader.jsx
import React from "react";

const Loader = ({ text = "Loading..." }) => (
  <div className="text-center text-gray-500 py-4 animate-pulse">{text}</div>
);

export default Loader;
