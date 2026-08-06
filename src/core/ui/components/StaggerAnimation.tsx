import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function StaggerContainer({ children, className, as = "div", ...props }: HTMLMotionProps<any> & { as?: any }) {
  const Component = motion[as as keyof typeof motion] || motion.div;
  return (
    <Component
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({ children, className, as = "div", ...props }: HTMLMotionProps<any> & { as?: any }) {
  const Component = motion[as as keyof typeof motion] || motion.div;
  return (
    <Component
      variants={itemVariants}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
