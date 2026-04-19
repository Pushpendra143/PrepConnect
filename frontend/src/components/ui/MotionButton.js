import * as React from 'react';
import { motion } from 'motion/react';
import { Slot } from 'components/ui/MotionSlot';

function MotionButton({
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = false,
  ...props
}) {
  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      whileTap={{ scale: tapScale }}
      whileHover={{ scale: hoverScale }}
      {...props}
    />
  );
}

export { MotionButton };
