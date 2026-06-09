'use client';

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
          style={{ backgroundColor: '#0f0f14' }}
        >
          <AlertTriangle size={48} color="#ef4444" className="mb-4" />
          <h2 className="text-lg font-bold mb-2" style={{ color: '#e8e8ed' }}>
            Something went wrong
          </h2>
          <p className="text-sm mb-6" style={{ color: '#8888a0' }}>
            The app encountered an error. Your data is safe in local storage.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#4a9eff', color: '#ffffff' }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
