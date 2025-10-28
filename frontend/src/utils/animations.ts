// Animation variants for consistent animations throughout the app
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
  transition: { duration: 0.3 },
};

export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
  transition: { duration: 0.3 },
};

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: 0.2 },
};

// Stagger container for animating children in sequence
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// List item animation for staggered lists
export const listItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Page transition animations (constitution: 0.3s smooth)
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

// Button hover animations (constitution: 0.2s ease-in-out)
export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: 'easeInOut' },
};

// Form validation feedback (constitution: immediate with 0.2s animation)
export const formError = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.2 },
};

// Hero section staggered entrance (constitution: 0.5s total)
export const heroStagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const heroItem = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

// Dropdown menu animations (constitution: 0.3s with cubic-bezier easing)
export const dropdownMenu = {
  initial: { opacity: 0, scale: 0.95, y: -10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -10 },
  transition: {
    duration: 0.3,
    ease: [0.16, 1, 0.3, 1], // cubic-bezier
  },
};

// Intersection observer hook setup for scroll animations
export const useIntersectionObserver = (threshold = 0.1) => {
  // This would be implemented with useEffect and IntersectionObserver
  // For now, return default values
  return { ref: null, inView: true };
};
