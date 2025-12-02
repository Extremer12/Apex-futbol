import { useState, useCallback } from 'react';

/**
 * Custom hook for managing notification state
 * @returns Notification state and helper functions
 */
export const useNotification = () => {
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const clearNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return {
        notification,
        showNotification,
        clearNotification
    };
};
