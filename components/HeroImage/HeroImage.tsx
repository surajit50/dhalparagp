"use client";

import { useState, useCallback, useEffect, memo } from "react";
import Image from "next/image";
import { herosectionImageSrc } from "@/constants";
import {
  MdOutlineArrowCircleLeft,
  MdOutlineArrowCircleRight,
} from "react-icons/md";

const AUTOPLAY_INTERVAL = 5000;
const INITIAL_INDEX = 0;

const NavigationButton = memo(
  ({
    onClick,
    direction,
    icon: Icon,
  }: {
    onClick: () => void;
    direction: "prev" | "next";
    icon: typeof MdOutlineArrowCircleLeft | typeof MdOutlineArrowCircleRight;
  }) => (
    <button
      onClick={onClick}
      className="p-2 text-white rounded-full backdrop-blur-sm bg-black/30 hover:bg-black/50 transition-all transform hover:scale-110"
      aria-label={`${direction} image`}
    >
      <Icon size={32} />
    </button>
  )
);

NavigationButton.displayName = "NavigationButton";

export default function HeroImage() {
  const [state, setState] = useState({
    index: INITIAL_INDEX,
    isHovered: false,
    autoPlay: true,
  });

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      index: (prev.index + 1) % herosectionImageSrc.length,
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      index:
        (prev.index - 1 + herosectionImageSrc.length) %
        herosectionImageSrc.length,
    }));
  }, []);

  const handleMouseEnter = useCallback(() => {
    setState((prev) => ({ ...prev, isHovered: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setState((prev) => ({ ...prev, isHovered: false }));
  }, []);

  // Auto change functionality
  useEffect(() => {
    if (!state.autoPlay || state.isHovered) return;

    const intervalId = setInterval(nextStep, AUTOPLAY_INTERVAL);
    return () => clearInterval(intervalId);
  }, [state.autoPlay, state.isHovered, nextStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          nextStep();
          break;
        case "ArrowLeft":
          prevStep();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStep, prevStep]);

  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-xl shadow-xl group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {herosectionImageSrc.map((image, i) => (
        <Image
          key={image.altname}
          src={image.imgsrc}
          alt={image.altname}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={i === INITIAL_INDEX}
          quality={80}
          className={`absolute inset-0 object-cover transition-all duration-500 ${
            i === state.index ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      <div
        className={`absolute inset-0 flex items-center justify-between px-4 transition-opacity ${
          state.isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <NavigationButton
          onClick={prevStep}
          direction="prev"
          icon={MdOutlineArrowCircleLeft}
        />
        <NavigationButton
          onClick={nextStep}
          direction="next"
          icon={MdOutlineArrowCircleRight}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {herosectionImageSrc.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === state.index ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
