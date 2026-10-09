'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { THEME_COLORS } from '../../theme/constants';

interface SectionCarouselProps {
  children: React.ReactNode[];
  sectionName?: string;
}

export const SectionCarousel = ({ children, sectionName = 'section' }: SectionCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = React.Children.count(children);
  const containerRef = useRef<HTMLDivElement>(null);

  // Navigate to specific slide
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
    }
  }, [totalSlides]);

  // Navigate to next/previous
  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Swipe handlers
  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 50;
      if (info.offset.x > swipeThreshold) {
        goToPrev();
      } else if (info.offset.x < -swipeThreshold) {
        goToNext();
      }
    },
    [goToNext, goToPrev]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // If only one slide, render without carousel controls
  if (totalSlides <= 1) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Slide Container */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          touchAction: 'pan-y',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {React.Children.toArray(children)[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Navigation Dots - Bottom Center */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 16, md: 24 },
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1.5,
          zIndex: 100,
          background: 'rgba(0,8,20,0.85)',
          backdropFilter: 'blur(12px)',
          px: 2.5,
          py: 1.2,
          borderRadius: '50px',
          border: '1px solid rgba(192,192,192,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        role="tablist"
        aria-label={`${sectionName} slides navigation`}
      >
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <Box
            key={idx}
            role="tab"
            aria-selected={currentSlide === idx}
            aria-label={`Go to slide ${idx + 1}`}
            tabIndex={0}
            onClick={() => goToSlide(idx)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(idx);
              }
            }}
            component={motion.div}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            sx={{
              width: currentSlide === idx ? 32 : 10,
              height: 10,
              borderRadius: '5px',
              background:
                currentSlide === idx
                  ? `linear-gradient(90deg, ${THEME_COLORS.royalBlue}, ${THEME_COLORS.silver})`
                  : 'rgba(192,192,192,0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              border:
                currentSlide === idx
                  ? `1px solid ${THEME_COLORS.royalBlue}80`
                  : '1px solid transparent',
              boxShadow:
                currentSlide === idx
                  ? `0 0 12px ${THEME_COLORS.royalBlue}40`
                  : 'none',
            }}
          />
        ))}
      </Box>

      {/* Arrow Navigation Buttons - Optional Desktop Only */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
        }}
      >
        {/* Previous Button */}
        {currentSlide > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 90,
            }}
          >
            <IconButton
              onClick={goToPrev}
              aria-label="Previous slide"
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'rgba(0,8,20,0.8)',
                backdropFilter: 'blur(10px)',
                color: THEME_COLORS.silver,
                border: '1px solid rgba(192,192,192,0.2)',
                '&:hover': {
                  bgcolor: THEME_COLORS.royalBlue,
                  color: 'white',
                  borderColor: THEME_COLORS.royalBlue,
                },
              }}
            >
              <ChevronLeft size={24} />
            </IconButton>
          </motion.div>
        )}

        {/* Next Button */}
        {currentSlide < totalSlides - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 90,
            }}
          >
            <IconButton
              onClick={goToNext}
              aria-label="Next slide"
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'rgba(0,8,20,0.8)',
                backdropFilter: 'blur(10px)',
                color: THEME_COLORS.silver,
                border: '1px solid rgba(192,192,192,0.2)',
                '&:hover': {
                  bgcolor: THEME_COLORS.royalBlue,
                  color: 'white',
                  borderColor: THEME_COLORS.royalBlue,
                },
              }}
            >
              <ChevronRight size={24} />
            </IconButton>
          </motion.div>
        )}
      </Box>

      {/* Swipe Indicator (Mobile) */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          alignItems: 'center',
          gap: 1,
          color: 'rgba(192,192,192,0.4)',
          fontSize: '0.7rem',
          fontWeight: 600,
          pointerEvents: 'none',
        }}
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: currentSlide === 0 ? 1 : 0 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ←
        </motion.div>
        Swipe
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.div>
      </Box>
    </Box>
  );
};
