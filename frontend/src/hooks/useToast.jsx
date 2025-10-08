import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext({
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
});

let counter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast) => {
      const id = ++counter;
      const payload = {
        id,
        type: toast.type || 'info',
        message: toast.message || '',
        duration: typeof toast.duration === 'number' ? toast.duration : 3500,
      };
      setToasts((prev) => [...prev, payload]);
      if (payload.duration > 0) {
        setTimeout(() => removeToast(id), payload.duration);
      }
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toasts, showToast, removeToast }), [toasts, showToast, removeToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => useContext(ToastContext);

export default ToastProvider;
