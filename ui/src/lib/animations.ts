import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

export const slideInRight: Variants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 }
};

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
};

export const staggerContainer: Variants = {
    animate: { transition: { staggerChildren: 0.07 } }
};

export const agentPulse = (state: string): Variants => ({
    initial: { scale: 1, opacity: state === 'running' ? 1 : state === 'idle' ? 0.6 : 0.4 },
    animate: state === 'running'
        ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1], transition: { duration: 1, repeat: Infinity } }
        : state === 'idle'
            ? { scale: [1, 1.08, 1], opacity: [0.6, 0.4, 0.6], transition: { duration: 3, repeat: Infinity } }
            : { scale: 1, opacity: 0.4 }
});

export const systemWakeUp: Variants = {
    initial: { opacity: 0.3, filter: 'grayscale(100%)' },
    animate: { opacity: 1, filter: 'grayscale(0%)', transition: { duration: 1.5, ease: 'easeOut' } }
};

export const transitionSpring = { type: 'spring', stiffness: 300, damping: 25 };
