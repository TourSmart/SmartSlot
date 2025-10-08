import { useToast } from '../hooks/useToast.jsx';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container" role="status" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <div className="toast__content">{t.message}</div>
          <button type="button" className="toast__close" aria-label="Dismiss" onClick={() => removeToast(t.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
