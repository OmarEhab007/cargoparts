import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

// Simple toast implementation - this would normally be more sophisticated
export function toast(options: ToastOptions) {
  // For now, just log to console - in a real app this would trigger a toast notification
  console.log(`Toast [${options.variant || 'default'}]:`, options.title, options.description);
  
  // You could also show a browser alert for immediate feedback during development
  if (typeof window !== 'undefined') {
    // Create a simple notification div
    const toastDiv = document.createElement('div');
    toastDiv.textContent = `${options.title}${options.description ? ': ' + options.description : ''}`;
    toastDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${options.variant === 'destructive' ? '#ef4444' : options.variant === 'success' ? '#22c55e' : '#374151'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(toastDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(toastDiv)) {
        document.body.removeChild(toastDiv);
      }
    }, options.duration || 3000);
  }
}

// Hook for managing toasts (simplified version)
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      ...options,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, options.duration || 3000);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toasts,
    toast: addToast,
    dismiss: removeToast,
  };
}