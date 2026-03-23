import { createContext, useContext, useCallback } from 'react';
import { toast as sonnerToast, Toaster } from 'sonner';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, type = 'success') => {
    if (type === 'error') {
      sonnerToast.error(message);
    } else {
      sonnerToast.success(message);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: { fontFamily: 'inherit' },
          duration: 3000,
        }}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
