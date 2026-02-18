'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ error, errorInfo });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="max-w-md w-full bg-card rounded-xl p-8 shadow-2xl">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💥</div>
                            <h1 className="text-2xl font-bold text-text mb-2">Oops! Something went wrong</h1>
                            <p className="text-muted mb-6">
                                Don't worry, your vending machine layout is safe. Try refreshing the page.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Refresh Page
                                </button>

                                <button
                                    onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Try Again
                                </button>
                            </div>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-6 text-left">
                                    <summary className="cursor-pointer text-red-400 font-medium">Error Details</summary>
                                    <pre className="mt-2 text-xs text-muted bg-background/50 p-3 rounded">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}