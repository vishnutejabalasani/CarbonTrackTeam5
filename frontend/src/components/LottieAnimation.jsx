import React from "react";
import LottieComponent from "lottie-react";

const Lottie = LottieComponent?.default || LottieComponent;

function LottieSkeleton({ className = "w-32 h-32" }) {
  return (
    <div className={`flex items-center justify-center bg-emerald-500/10 rounded-2xl animate-pulse ${className}`}>
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function LottieAnimation({
  animationData,
  className = "w-48 h-48",
  loop = true,
  autoplay = true,
  style,
}) {
  if (!animationData || typeof Lottie !== "function") {
    return <LottieSkeleton className={className} />;
  }

  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  );
}
