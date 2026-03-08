import { Variants } from "framer-motion";

// Basic transitions
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0 }
};

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20 }
};

export const fadeInDown: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: 20 }
};

export const fadeInLeft: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: 20 }
};

export const fadeInRight: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20 }
};

export const slideInRight: Variants = {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } },
    exit: { opacity: 0, x: '100%' }
};

export const slideInLeft: Variants = {
    initial: { opacity: 0, x: '-100%' },
    animate: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } },
    exit: { opacity: 0, x: '-100%' }
};

export const slideInUp: Variants = {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } },
    exit: { opacity: 0, y: '100%' }
};

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9 }
};

export const scaleInSpring: Variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 200 } },
    exit: { opacity: 0, scale: 0.8 }
};

// Container/stagger
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: { staggerChildren: 0.1 }
    },
    exit: {
        transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
};

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

export const staggerFast: Variants = {
    initial: {},
    animate: {
        transition: { staggerChildren: 0.05 }
    }
};

export const staggerSlow: Variants = {
    initial: {},
    animate: {
        transition: { staggerChildren: 0.2 }
    }
};

// Interactive
export const cardHover: Variants = {
    initial: {},
    whileHover: {
        y: -4,
        boxShadow: '0 10px 30px rgba(0,255,136,0.15)',
        transition: { duration: 0.2 }
    },
    whileTap: { y: 0, scale: 0.98 }
};

export const buttonTap: Variants = {
    initial: {},
    whileHover: { scale: 1.02, filter: 'brightness(1.1)' },
    whileTap: { scale: 0.95 }
};

export const listItemHover: Variants = {
    initial: {},
    whileHover: { x: 4, backgroundColor: 'rgba(255,255,255,0.05)' },
    whileTap: { scale: 0.99 }
};

// Page transitions
export const pageTransition: Variants = {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.5 } },
    exit: { opacity: 0, filter: 'blur(10px)' }
};

export const pageEnter: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20 }
};

export const pageExit: Variants = {
    initial: { opacity: 1 },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
};

// Agent-specific
export const agentPulse = (state: 'running' | 'idle' | 'dead' | 'error' | 'paused'): Variants => {
    switch (state) {
        case 'running':
            return {
                initial: {},
                animate: {
                    scale: [1, 1.15, 1],
                    opacity: [1, 0.7, 1],
                    transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
                }
            };
        case 'idle':
            return {
                initial: {},
                animate: {
                    scale: [1, 1.08, 1],
                    opacity: [0.6, 0.4, 0.6],
                    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }
            };
        case 'paused':
            return {
                initial: {},
                animate: {
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 0.5, 0.8],
                    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }
            };
        case 'error':
            return {
                initial: {},
                animate: {
                    opacity: [1, 0.3, 1],
                    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
                }
            };
        case 'dead':
        default:
            return {
                initial: {},
                animate: {},
            };
    }
};

export const agentCardVariants = (state: string): Variants => {
    const isError = state === 'error';
    return {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            borderColor: isError ? 'rgba(255,0,110,0.5)' : undefined,
            boxShadow: isError ? '0 0 15px rgba(255,0,110,0.2)' : undefined
        },
        exit: { opacity: 0, scale: 0.95 }
    };
};

export const statusDotVariants = (state: string): Variants => {
    return {
        initial: { scale: 0 },
        animate: { scale: 1, transition: { type: 'spring', damping: 10, stiffness: 300 } }
    };
};

// System state transitions
export const systemWakeUp: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
};

export const systemSleep: Variants = {
    initial: { opacity: 1, filter: 'saturate(1)' },
    animate: { opacity: 0.5, filter: 'saturate(0.2)', transition: { duration: 1 } }
};

export const healthTransition: Variants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
};

// Assistant animations
export const panelSlideUp: Variants = {
    initial: { opacity: 0, y: 50, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    exit: { opacity: 0, y: 20, scale: 0.95 }
};

export const messageEnter = (role: 'user' | 'aria'): Variants => {
    return {
        initial: { opacity: 0, x: role === 'user' ? 20 : -20, y: 10 },
        animate: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', damping: 20, stiffness: 150 } }
    };
};

export const typingIndicator: Variants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.5 }
};

export const actionCardEnter: Variants = {
    initial: { opacity: 0, height: 0, marginTop: 0 },
    animate: { opacity: 1, height: 'auto', marginTop: 12, transition: { type: 'spring', damping: 20, stiffness: 150 } },
    exit: { opacity: 0, height: 0, marginTop: 0, overflow: 'hidden' }
};

// Notification
export const toastEnter: Variants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 200 } },
    exit: { opacity: 0, scale: 0.9, y: -20 }
};

export const toastExit: Variants = {
    initial: { opacity: 1 },
    exit: { opacity: 0, scale: 0.9, x: 100, transition: { duration: 0.2 } }
};

// Data
export const barGrow = (targetWidth: number): Variants => {
    return {
        initial: { width: 0 },
        animate: { width: `${targetWidth}%`, transition: { duration: 1, ease: 'easeOut' } }
    };
};

export const numberCount: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const confidenceBar = (from: number, to: number, color: string): Variants => {
    return {
        initial: { width: `${from}%`, backgroundColor: color },
        animate: { width: `${to}%`, backgroundColor: color, transition: { duration: 0.8, ease: 'easeOut' } }
    };
};

// Special
export const particleFloat: Variants = {
    initial: { y: 0, opacity: 0 },
    animate: {
        y: [0, -20, 0],
        opacity: [0, 1, 0],
        transition: { duration: 3, repeat: Infinity, ease: 'linear' }
    }
};

export const neonPulse = (color: string): Variants => {
    return {
        initial: { boxShadow: `0 0 5px ${color}` },
        animate: {
            boxShadow: [`0 0 5px ${color}`, `0 0 20px ${color}`, `0 0 5px ${color}`],
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }
    };
};

export const rotatingRing: Variants = {
    initial: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 4, repeat: Infinity, ease: 'linear' } }
};
