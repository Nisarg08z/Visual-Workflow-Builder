import React from "react";
import Lottie from "lottie-react";
import aiAnimation from "../../assets/auth-animation.json"

const Animation = () => {
  return (
    <div className="w-96 h-96 mb-8 flex items-center justify-center">
      <Lottie animationData={aiAnimation} loop />
    </div>
  );
};

export default Animation;