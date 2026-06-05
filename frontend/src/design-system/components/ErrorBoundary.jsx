import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ERP ErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
    if (!this.props.onRetry) window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center p-6">
          <Card padding="lg" className="max-w-md w-full text-center">
            <AlertTriangle className="mx-auto text-warning mb-3" size={32} />
            <h2 className="erp-h2">Something went wrong</h2>
            <p className="erp-caption mt-2">
              {this.props.fallbackMessage ||
                'This section failed to load. You can retry or refresh the page.'}
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-3 text-left text-[10px] bg-surface-muted p-2 rounded-erp overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <Button variant="accent" className="mt-4" onClick={this.handleRetry} leftIcon={RefreshCw}>
              Retry
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
