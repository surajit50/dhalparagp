"use client";
import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const notices = [
  "YEARLY GRAMSANSAD SAVA 201: FIXTURE",
  "TENDER NOTICE",
  "TENDER NOTICE",
  "TENDER NOTICE",
  "TENDER NOTICE",
  "TENDER NOTICE",
  "TENDER NOTICE",
  // Add more notices as needed
];

const Notice: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-center mb-2">
    <span className="text-blue-500 mr-2">➤</span>
    <span>{text}</span>
  </li>
);

const NoticeBoard: React.FC = () => {
  const controls = useAnimation();

  useEffect(() => {
    const height = notices.length * 24; // Height of each notice item
    controls.start({
      y: [0, -height],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 10,
          ease: "linear",
        },
      },
    });
  }, [controls]);

  const handleMouseEnter = () => {
    controls.stop();
  };

  const handleMouseLeave = () => {
    const height = notices.length * 24; // Height of each notice item
    controls.start({
      y: [0, -height],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 10,
          ease: "linear",
        },
      },
    });
  };

  return (
    <div className="p-4 rounded-md overflow-hidden h-72">
      <h2 className="text-center mb-4 font-bold bg-gray-500">NOTICE BOARD</h2>
      <div className="overflow-hidden h-72 relative">
        <motion.div
          animate={controls}
          onHoverStart={handleMouseEnter}
          onHoverEnd={handleMouseLeave}
        >
          <ul>
            {notices.map((notice, index) => (
              <Notice key={index} text={notice} />
            ))}
          </ul>
          <ul>
            {notices.map((notice, index) => (
              <Notice key={index + notices.length} text={notice} />
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default NoticeBoard;
