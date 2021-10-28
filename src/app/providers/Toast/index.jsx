import {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';

import Alert from 'react-bootstrap/Alert';
import "./style.css";

const initialToast = {
  message: '',
  variant: 'success',
  visible: false,
};

export const ToastContext = createContext({});

export const ToastProvider = ({children}) => {
  const [toast, setToast] = useState(initialToast);
  const timeout = useRef();

  const showToast = useCallback(args => {
    setToast({...initialToast, visible: true, ...args});
  }, []);

  const hideToast = useCallback(() => {
    setToast({...toast, visible: false});
  }, [toast]);

  useEffect(() => {
    if (toast.visible) {
      timeout.current = setTimeout(hideToast, 1500);
      return () => {
        if (timeout.current) {
          clearTimeout(timeout.current);
        }
      };
    }
  }, [hideToast, toast]);

  return (
    <ToastContext.Provider
      value={{
        hideToast,
        showToast,
        toast,
      }}>
      <Alert show={toast.visible} className="toast-component" variant={toast.variant}>
        <p className="mb-0">{toast.message}</p>
      </Alert>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
    const toast = useContext(ToastContext);
    if (!toast) {
        throw new Error("toast must be defined");
    }
    return toast;
};
