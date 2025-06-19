import React, { useRef, useEffect } from "react";
import Lottie from "lottie-react";
import aiAnimation from "../../assets/PartitionAnimation.json";

const HomeAnimation = () => {
  const topRef = useRef();
  const bottomRef = useRef();

  useEffect(() => {
    if (topRef.current) topRef.current.setSpeed(0.5);
    if (bottomRef.current) bottomRef.current.setSpeed(0.5);
  }, []);

  return (
    <div className="flex flex-col justify-center w-full h-full leading-none">
      {/* Top Animation */}
      <div className="overflow-hidden m-0 p-0">
        <Lottie lottieRef={topRef} animationData={aiAnimation} loop autoplay />
      </div>

      {/* Bottom Animation (Flipped, perfectly attached) */}
      <div className="overflow-hidden m-0 p-0 rotate-180">
        <Lottie lottieRef={bottomRef} animationData={aiAnimation} loop autoplay />
      </div>
    </div>
  );
};

export default HomeAnimation;
