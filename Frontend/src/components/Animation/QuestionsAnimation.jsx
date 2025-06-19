import React from "react";
import Lottie from "lottie-react";
import diagonalAnimation from "../../assets/QuestionsAnimation.json";

const QuestionsAnimation = ({ className = "" }) => {
  return (
    <div className={`pointer-events-none z-0 ${className}`}>
      <Lottie animationData={diagonalAnimation} loop autoplay />
    </div>
  );
};

export default QuestionsAnimation;
