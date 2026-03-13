import { Variants } from "framer-motion";

// ===== SIMPLE, CLEAN ANIMATIONS =====

// Basic transitions
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0 }
};

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -10 }
};

export const fadeInDown: Variants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: 10 }
};

export const fadeInLeft: Variants = {
    initial: { opacity: 0, x: -15 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, x: 15 }
};

export const fadeInRight: Variants = {
    initial: { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, x: -15 }
};

export const slideInRight: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20 }
};

export const slideInLeft: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20 }
};

export const slideInUp: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 15 }
};

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95 }
};

export const scaleInSpring: Variants = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, scale: 0.92 }
};

// Container / stagger
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: { staggerChildren: 0.05 }
    }
};

export const staggerItem: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } }
};

export const staggerFast: Variants = {
    initial: {},
    animate: {
        transition: { staggerChildren: 0.03 }
    }
};

export const staggerSlow: Variants = {
    initial: {},
    animate: {
        transition: { staggerChildren: 0.1 }
    }
};

// Interactive — simplified, no complex shadows
export const cardHover: Variants = {
    initial: {},
    whileHover: {
        y: -2,
        transition: { duration: 0.15 }
    },
    whileTap: { y: 0, scale: 0.98 }
};

export const buttonTap: Variants = {
    initial: {},
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
};

export const listItemHover: Variants = {
    initial: {},
    whileHover: { x: 3, backgroundColor: 'rgba(255,255,255,0.05)' },
    whileTap: { scale: 0.99 }
};

// Page transitions — no blur filter
export const pageTransition: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0 }
};

export const pageEnter: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -10 }
};

export const pageExit: Variants = {
    initial: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

// Agent-specific — simplified, opacity-only pulses
export const agentPulse = (state: 'running' | 'idle' | 'dead' | 'error' | 'paused'): Variants => {
    switch (state) {
        case 'running':
            return {
                initial: {},
                animate: {
                    opacity: [1, 0.8, 1],
                    transition: { duration: 1.5, repeat: Infinity }
                }
            };
        case 'idle':
            return {
                initial: {},
                animate: {
                    opacity: [0.6, 0.4, 0.6],
                    transition: { duration: 3, repeat: Infinity }
                }
            };
        case 'paused':
            return {
                initial: {},
                animate: {
                    opacity: [0.7, 0.5, 0.7],
                    transition: { duration: 2, repeat: Infinity }
                }
            };
        case 'error':
            return {
                initial: {},
                animate: {
                    opacity: [1, 0.3, 1],
                    transition: { duration: 0.8, repeat: Infinity }
                }
            };
        case 'dead':
        default:
            return {
                initial: {},
                animate: {}
            };
    }
};

export const agentCardVariants = (state: string): Variants => {
    return {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        exit: { opacity: 0, scale: 0.95 }
    };
};

export const statusDotVariants = (state: string): Variants => {
    return {
        initial: { scale: 0 },
        animate: { scale: 1, transition: { duration: 0.15 } }
    };
};

// System state transitions — simple
export const systemWakeUp: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export const systemSleep: Variants = {
    initial: { opacity: 1 },
    animate: { opacity: 0.5, transition: { duration: 0.8 } }
};

export const healthTransition: Variants = {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 8 }
};

// Assistant animations — simplified, no spring
export const panelSlideUp: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 15 }
};

export const messageEnter = (role: 'user' | 'aria'): Variants => {
    return {
        initial: { opacity: 0, x: role === 'user' ? 10 : -10, y: 5 },
        animate: { opacity: 1, x: 0, y: 0, transition: { duration: 0.25 } }
    };
};

export const typingIndicator: Variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.8 }
};

export const actionCardEnter: Variants = {
    initial: { opacity: 0, height: 0, marginTop: 0 },
    animate: { opacity: 1, height: 'auto', marginTop: 12, transition: { duration: 0.25 } },
    exit: { opacity: 0, height: 0, marginTop: 0, overflow: 'hidden' }
};

// Notification — simple
export const toastEnter: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: 20 }
};

export const toastExit: Variants = {
    initial: { opacity: 1 },
    exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
};

// Data visualisation
export const barGrow = (targetWidth: number): Variants => {
    return {
        initial: { width: 0 },
        animate: { width: `${targetWidth}%`, transition: { duration: 0.8 } }
    };
};

export const numberCount: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } }
};

export const confidenceBar = (from: number, to: number, color: string): Variants => {
    return {
        initial: { width: `${from}%`, backgroundColor: color },
        animate: { width: `${to}%`, backgroundColor: color, transition: { duration: 0.6 } }
    };
};

// Special — replaced heavy effects with clean fades
export const particleFloat: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: [0, 0.6, 0],
        transition: { duration: 3, repeat: Infinity }
    }
};

export const neonPulse = (color: string): Variants => {
    return {
        initial: { opacity: 0.8 },
        animate: {
            opacity: [0.8, 1, 0.8],
            transition: { duration: 2, repeat: Infinity }
        }
    };
};

export const rotatingRing: Variants = {
    initial: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 4, repeat: Infinity, ease: 'linear' } }
};
