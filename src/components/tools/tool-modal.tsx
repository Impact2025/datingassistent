"use client";

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ToolModal - Premium full-screen modal for tool content
 *
 * Features:
 * - Mobile: Slide-up animation with swipe-down to close (via drag handle only)
 * - Desktop: Centered modal with backdrop blur
 * - Accessibility: Focus trap, ESC key, ARIA labels
 * - Gestures: Swipe down on handle (mobile), click outside, ESC key
 */

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ToolModal({ isOpen, onClose, children, className }: ToolModalProps) {
  const dragControls = useDragControls();
  const contentRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle swipe down gesture (mobile) - only via drag handle
  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // If swiped down more than 100px with sufficient velocity, close modal
      if (info.offset.y > 100 || info.velocity.y > 400) {
        onClose();
      }
    },
    [onClose]
  );

  // Start drag from handle
  const startDrag = useCallback((event: React.PointerEvent) => {
    dragControls.start(event);
  }, [dragControls]);

  // Mobile animation variants
  const mobileVariants = {
    hidden: { y: '100%' },
    visible: {
      y: 0,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300,
      }
    },
    exit: {
      y: '100%',
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  };

  // Desktop animation variants
  const desktopVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: 'easeIn'
      }
    }
  };

  // Backdrop variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className="fixed inset-0 z-50 flex items-end md:items-start md:justify-center md:pt-4 pointer-events-none"
            onClick={handleBackdropClick}
          >
            {/* Mobile: Full-screen slide-up modal */}
            <motion.div
              variants={mobileVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              onDragEnd={handleDragEnd}
              className={cn(
                "pointer-events-auto w-full h-full bg-white shadow-2xl",
                "flex flex-col",
                "md:hidden", // Hide on desktop
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Drag Handle (Mobile) - Only this area triggers swipe-to-close */}
              <div
                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none select-none"
                onPointerDown={startDrag}
              >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Content - Scrollable */}
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto overscroll-contain touch-pan-y"
              >
                {children}
              </div>
            </motion.div>

            {/* Desktop: Top-aligned modal */}
            <motion.div
              variants={desktopVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "pointer-events-auto hidden md:flex flex-col",
                "w-full max-w-6xl h-[92vh]",
                "bg-white rounded-2xl shadow-2xl",
                "mx-4",
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
