import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- ERROR BOUNDARY ---
interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { 
    hasError: false, 
    error: null, 
    errorInfo: null 
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 p-8 flex flex-col items-center justify-center text-red-900 font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-red-100 max-w-2xl w-full">
            <h1 className="text-3xl font-black mb-4 flex items-center gap-3">
              <i className="fa-solid fa-bug text-red-500"></i>
              Ops! Algo deu errado.
            </h1>
            <p className="mb-6 text-red-700 font-medium">Ocorreu um erro crítico na aplicação. Tente recarregar.</p>
            
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/30 active:scale-95 uppercase tracking-wide"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- MOUNT ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);