import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-900 border border-red-500/50 rounded-xl p-8 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-red-400 mb-4">
                            Algo salió mal
                        </h1>
                        <p className="text-slate-300 mb-6">
                            Ha ocurrido un error inesperado. Por favor, recarga la página para continuar.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-500 transition-colors"
                        >
                            Recargar Página
                        </button>
                        {this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-slate-400 cursor-pointer hover:text-white">
                                    Detalles técnicos
                                </summary>
                                <pre className="mt-2 text-xs text-slate-500 bg-slate-950 p-4 rounded overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
