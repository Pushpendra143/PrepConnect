import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { MotionButton } from 'components/ui/MotionButton';
import { useControlledState } from 'hooks/useControlledState';

function CopyButton({
  className = '',
  content,
  copied,
  onCopiedChange,
  onClick,
  variant = 'ghost',
  size = 'default',
  delay = 3000,
  ...props
}) {
  const [isCopied, setIsCopied] = useControlledState({
    value: copied,
    onChange: onCopiedChange,
  });

  const SIZE_CLASSES = {
    default: 'copy-btn-default',
    xs: 'copy-btn-xs',
    sm: 'copy-btn-sm',
  };

  const handleCopy = React.useCallback(
    (e) => {
      onClick?.(e);
      if (copied) return;
      if (content) {
        navigator.clipboard
          .writeText(content)
          .then(() => {
            setIsCopied(true);
            onCopiedChange?.(true, content);
            setTimeout(() => {
              setIsCopied(false);
              onCopiedChange?.(false);
            }, delay);
          })
          .catch((error) => {
            console.error('Error copying command', error);
          });
      }
    },
    [onClick, copied, content, setIsCopied, onCopiedChange, delay]
  );

  const Icon = isCopied ? CheckIcon : CopyIcon;

  const classes = ['copy-btn', SIZE_CLASSES[size] || '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <MotionButton
      data-slot="copy-button"
      className={classes}
      onClick={handleCopy}
      {...props}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={isCopied ? 'check' : 'copy'}
          data-slot="copy-button-icon"
          initial={{ scale: 0, opacity: 0.4, filter: 'blur(4px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={{ scale: 0, opacity: 0.4, filter: 'blur(4px)' }}
          transition={{ duration: 0.25 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </MotionButton>
  );
}

export { CopyButton };
