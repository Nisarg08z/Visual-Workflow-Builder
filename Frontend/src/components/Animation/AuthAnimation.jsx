import React from "react";
import Lottie from "lottie-react";
import aiAnimation from "../../assets/AuthAnimation.json";

const AuthAnimation = () => {
  return (
    <div className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
      <Lottie animationData={aiAnimation} loop />
    </div>
  );
};

export default AuthAnimation;
