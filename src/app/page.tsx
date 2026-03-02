'use client';

import React, { useState } from 'react';
import Image from "next/image";
import { Header } from "../components/Header";
import LoadingScreen from "../components/LoadingScreen";
import LockerGateway from "../components/LockerGateway";
import { SkillsSection } from "../components/SkillsSection";
import { ProjectsSection } from "../components/ProjectsSection";
import { Box, Typography, Button, useMediaQuery } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { HexShape } from '../components/shared/HexShape';
import { SocialLinks } from '../components/SocialLinks';
import { THEME_COLORS } from '../theme/constants';
import { Cpu, Terminal } from 'lucide-react';
import ManualAnalysisButton from '../components/ManualAnalysisButton';

import { ContactSection } from "../components/ContactSection";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export default function Home() {
  const [appState, setAppState] = useState<'loading' | 'locked' | 'home'>('locked');
  const [currentSection, setCurrentSection] = useState(0);
  const [isEngineerMode, setIsEngineerMode] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleLoadingComplete = () => setAppState('locked');
  const handleUnlock = () => setAppState('home');

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      if (isMobile) {
        scrollContainerRef.current.scrollTo({
          top: index * window.innerHeight,
          behavior: 'smooth'
        });
      } else {
        scrollContainerRef.current.scrollTo({
          left: index * window.innerWidth,
          behavior: 'smooth'
        });
      }
      setCurrentSection(index);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollTop } = e.currentTarget;
    const { innerWidth, innerHeight } = window;

    if (isMobile) {
      const newSection = Math.round(scrollTop / innerHeight);
      if (newSection !== currentSection) setCurrentSection(newSection);
    } else {
      const newSection = Math.round(scrollLeft / innerWidth);
      if (newSection !== currentSection) setCurrentSection(newSection);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {appState === 'loading' && (
        <motion.div key="loading" exit={{ opacity: 0 }}>
          <LoadingScreen onComplete={handleLoadingComplete} />
        </motion.div>
      )}

      {appState === 'locked' && (
        <motion.div key="locker" exit={{ opacity: 0 }}>
          <LockerGateway onUnlock={handleUnlock} />
        </motion.div>
      )}

      {appState === 'home' && (
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Box
            sx={{
              height: '100dvh',
              width: '100vw',
              overflow: 'hidden',
              background: `radial-gradient(circle, ${THEME_COLORS.darkAzure} 0%, #000f24 70%, #000000 100%)`,
              color: 'text.primary',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {/* Skip to main content — ADA keyboard nav */}
            <Box
              component="a"
              href="#main-content"
              sx={{
                position: 'absolute',
                left: '-9999px',
                top: 'auto',
                zIndex: 9999,
                '&:focus': {
                  left: '50%',
                  top: '12px',
                  transform: 'translateX(-50%)',
                  bgcolor: THEME_COLORS.royalBlue,
                  color: 'white',
                  px: 3, py: 1,
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                },
              }}
            >
              Skip to main content
            </Box>

            {/* SEO H1 - Visually Hidden */}
            <Typography
              component="h1"
              sx={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: '0'
              }}
            >
              Alfar Abusalihu | Full-Stack Developer & AI Solutions Architect
            </Typography>

            <Header title={['Dashboard', 'Projects', 'Contact'][currentSection]} />

            {/* Navigation Indicators */}
            <Box
              sx={{
                position: 'fixed',
                bottom: { xs: 20, md: 30 },
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2,
                zIndex: 100,
                background: 'rgba(0,8,20,0.8)',
                backdropFilter: 'blur(10px)',
                px: 3,
                py: 1,
                borderRadius: '50px',
                border: '1px solid rgba(192, 192, 192, 0.2)'
              }}
              role="tablist"
            >
              {(['Dashboard', 'Projects', 'Contact'] as const).map((name, idx) => (
                <Box
                  key={idx}
                  role="tab"
                  aria-selected={currentSection === idx}
                  aria-label={`Go to ${name} section`}
                  tabIndex={0}
                  onClick={() => scrollToSection(idx)}
                  onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && scrollToSection(idx)}
                  sx={{
                    width: currentSection === idx ? 24 : 8,
                    height: 8,
                    borderRadius: '4px',
                    background: currentSection === idx ? THEME_COLORS.royalBlue : 'rgba(192, 192, 192, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Box>

            {/* Navigation Arrows */}
            <AnimatePresence>
              {currentSection > 0 && (
                <motion.div
                  key="prev-arrow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 100 }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Button
                      onClick={() => scrollToSection(currentSection - 1)}
                      aria-label="Previous Section"
                      sx={{ minWidth: 0, p: 1, color: THEME_COLORS.royalBlue, display: { xs: 'none', md: 'flex' } }}
                    >
                      <ChevronLeftIcon sx={{ fontSize: 50 }} />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
              {currentSection < 2 && (
                <motion.div
                  key="next-arrow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 100 }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Button
                      onClick={() => scrollToSection(currentSection + 1)}
                      aria-label="Next Section"
                      sx={{ minWidth: 0, p: 1, color: THEME_COLORS.royalBlue, display: { xs: 'none', md: 'flex' } }}
                    >
                      <ChevronRightIcon sx={{ fontSize: 50 }} />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Scroll Container */}
            <Box
              id="main-content"
              component="main"
              ref={scrollContainerRef}
              onScroll={handleScroll}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                overflowX: { xs: 'hidden', md: 'auto' },
                overflowY: { xs: 'auto', md: 'hidden' },
                scrollSnapType: { xs: 'none', md: 'x mandatory' },
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                cursor: { xs: 'default', md: 'grab' },
                '&:active': { cursor: { xs: 'default', md: 'grabbing' } }
              }}
            >
              {/* SECTION 1: DASHBOARD */}
              <Box
                component="section"
                aria-label="Dashboard and Skills Overview"
                sx={{
                  minWidth: '100vw',
                  height: { xs: 'auto', md: '100%' },
                  minHeight: { xs: '100dvh', md: 'auto' },
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  scrollSnapAlign: { xs: 'none', md: 'start' },
                  flexShrink: 0,
                  pt: { xs: '80px', md: 0 },
                  px: { xs: 3, sm: 6, md: 8, lg: 12 },
                  position: 'relative'
                }}
              >
                {/* Left Side: Hero (Static) */}
                <Box sx={{ width: { xs: '100%', md: '40%' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 8 }, pr: { md: 6, lg: 10 }, borderRight: { md: '1px solid rgba(192, 192, 192, 0.1)' }, mb: { xs: 6, md: 0 } }}>
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
                    <HexShape size={isMobile ? 120 : 200} color={THEME_COLORS.deepNavy} stroke={THEME_COLORS.silver} strokeWidth={2} style={{ marginBottom: isMobile ? '12px' : '24px' }}>
                      <div style={{ position: 'relative', width: '100%', height: '100%', clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)', overflow: 'hidden' }}>
                        <Image
                          src="/profile.jpg"
                          alt="Alfar Abusalihu — Full-Stack Developer & AI Systems Architect"
                          fill
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center 10%',
                            transform: 'scale(0.96)',
                            transition: 'transform 0.3s ease'
                          }}
                          priority
                        />
                      </div>
                    </HexShape>
                  </motion.div>

                  <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 900, mb: 1 }}>
                      Alfar <span style={{ color: THEME_COLORS.silver }}>Abusalihu</span>
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 2, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: THEME_COLORS.royalBlue, display: 'block' }}>
                      Full-Stack Developer
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, fontWeight: 300, lineHeight: 1.6, maxWidth: 350, mx: 'auto', color: 'text.secondary', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                      Specialized in building high-performance web applications and AI-driven solutions.
                    </Typography>
                    <SocialLinks />
                  </Box>
                </Box>

                {/* Right Side: Skills (Scrollable) */}
                <Box sx={{ flex: 1, height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 8 }, pl: { md: 6, lg: 10 }, overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                  <SkillsSection />
                </Box>
              </Box>

              {/* SECTION 2: PROJECTS */}
              <Box
                component="section"
                aria-label="Featured Projects Showroom"
                sx={{
                  minWidth: '100vw',
                  height: { xs: 'auto', md: '100%' },
                  minHeight: { xs: '100dvh', md: 'auto' },
                  scrollSnapAlign: { xs: 'none', md: 'start' },
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  pt: { xs: '80px', md: '40px' },
                  px: { xs: 3, sm: 6, md: 10, lg: 16 },
                  position: 'relative',
                  overflowY: 'visible',
                  overflowX: 'hidden',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' }
                }}
              >
                <ProjectsSection isEngineerMode={isEngineerMode} isVisible={currentSection === 1} />
              </Box>

              {/* SECTION 3: CONTACT */}
              <Box
                component="section"
                aria-label="Get In Touch"
                sx={{
                  minWidth: '100vw',
                  height: { xs: 'auto', md: '100%' },
                  minHeight: { xs: '100dvh', md: 'auto' },
                  scrollSnapAlign: { xs: 'none', md: 'start' },
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  pt: { xs: '80px', md: 0 },
                  px: { xs: 3, sm: 10, md: 12 },
                  position: 'relative'
                }}
              >
                <ContactSection />
              </Box>
            </Box>
            {/* Engineer Mode Toggle + Manual Analysis */}
            <Box
              sx={{
                position: 'fixed',
                bottom: { xs: '85px', md: '30px' },
                right: { xs: '20px', md: '40px' },
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 1.5
              }}
            >
              {/* Manual Analysis Button — sits above Engineer Mode */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    whiteSpace: 'nowrap',
                    color: THEME_COLORS.silver,
                    fontWeight: 900,
                    letterSpacing: 1,
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    display: { xs: 'none', md: 'block' },
                    opacity: 0.7,
                  }}
                >
                  Verify Live Sync
                </Typography>
                <ManualAnalysisButton />
              </Box>

              {/* Engineer Mode Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    whiteSpace: 'nowrap',
                    color: isEngineerMode ? THEME_COLORS.royalBlue : THEME_COLORS.silver,
                    fontWeight: 900,
                    letterSpacing: 1,
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    display: { xs: 'none', md: 'block' },
                    opacity: 0.8,
                  }}
                >
                  {isEngineerMode ? 'Engineer Mode Active' : 'Go Engineer Mode'}
                </Typography>
                <Button
                  onClick={() => setIsEngineerMode(!isEngineerMode)}
                  aria-label={isEngineerMode ? 'Switch to Recruiter Mode' : 'Switch to Engineer Mode'}
                  aria-pressed={isEngineerMode}
                  sx={{
                    minWidth: 0,
                    width: { xs: '45px', md: '55px' },
                    height: { xs: '45px', md: '55px' },
                    borderRadius: '12px',
                    bgcolor: isEngineerMode ? THEME_COLORS.royalBlue : 'rgba(192, 192, 192, 0.1)',
                    color: isEngineerMode ? 'white' : THEME_COLORS.silver,
                    border: `1px solid ${isEngineerMode ? 'white' : 'rgba(192, 192, 192, 0.2)'}`,
                    backdropFilter: 'blur(10px)',
                    boxShadow: isEngineerMode ? `0 0 20px ${THEME_COLORS.royalBlue}80` : 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: isEngineerMode ? THEME_COLORS.royalBlue : 'rgba(192, 192, 192, 0.2)',
                      transform: 'translateY(-2px)'
                    },
                  }}
                >
                  {isEngineerMode ? <Cpu size={24} /> : <Terminal size={24} />}
                </Button>
              </Box>
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}