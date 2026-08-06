import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedInteractionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function AnimatedInteraction({ children, className, ...props }: AnimatedInteractionProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
      style={{ display: 'inline-block' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
