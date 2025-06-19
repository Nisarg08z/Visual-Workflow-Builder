import React from "react";
import Lottie from "lottie-react";
import animationData from "../../assets/HeroSectionAnimation.json";
import FadeInOnScroll from "../layout/FadeInOnScroll";
import "../../styles/hero.css";

const HeroSection = () => {
  return (
    <FadeInOnScroll>
      <section className="flex flex-col md:flex-row items-center justify-center gap-12 px-6 py-10 min-h-10">
        {/* Left: Animation */}
        <div className="flex items-center justify-center w-full md:w-1/2">
          <div className="w-96 h-96 rounded-full overflow-hidden">
            <Lottie animationData={animationData} loop />
          </div>
        </div>

        {/* Right: Text */}
        <div className="flex flex-col items-center text-center md:w-1/2 gap-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text gradient-text leading-snug">
            Build Workflows Visually
          </h2>
          <p className="text-gray-500 fade-in text-lg px-4 md:px-0">
            Design and execute AI-powered workflows without writing complex code.
            Drag, drop, connect, and run with ease.
          </p>
          <button className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 font-medium shadow-sm hover:shadow-md mt-2 px-6 py-2 rounded-full ">
            Start Building
          </button>
        </div>
      </section>
    </FadeInOnScroll>
  );
};

export default HeroSection;
