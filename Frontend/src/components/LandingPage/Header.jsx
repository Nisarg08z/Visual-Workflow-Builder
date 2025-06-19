import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={isVisible ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="top-0 left-0 w-full z-50 bg-gradient-to-br  shadow-md px-6 py-4 flex justify-between items-center"
    >
      <h1 className="text-2xl font-bold text-orange-500">Visual Builder</h1>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className="rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 font-medium shadow-sm hover:shadow-md  relative px-6 py-2 overflow-hidden group"
      >
        <span className="relative z-10">Login</span>

        {/* glow appears only on hover */}
        <span className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-20 blur-md transition duration-300 rounded-md z-0" />
        <span className="absolute inset-0 border border-orange-400 rounded-md opacity-0 group-hover:opacity-50 transition duration-300 z-0 animate-none group-hover:animate-pulse" />
      </motion.button>
    </motion.header>
  );
};

export default Header;
