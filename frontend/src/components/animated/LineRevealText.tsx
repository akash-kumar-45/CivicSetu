"use client";

import React from "react";
import { motion } from "framer-motion";

interface LineRevealProps {
  lines: string[];
  className?: string;
  lineClassName?: string;
}

export function LineRevealText({ lines, className = "", lineClassName = "" }: LineRevealProps) {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 35, rotateX: 45 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 90,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`overflow-hidden perspective-1000 ${className}`}
    >
      {lines.map((line, index) => (
        <div key={index} className="overflow-hidden">
          <motion.div variants={child} className={lineClassName}>
            {line}
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}
