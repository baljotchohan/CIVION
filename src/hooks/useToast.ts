import { useToastContext, Toast } from '../contexts/ToastContext';

export const useToast = () => {
    const { toasts, toast, dismissToast } = useToastContext();
    return { toasts, toast, dismiss: dismissToast };
};
