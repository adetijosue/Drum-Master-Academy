import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DMA ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
          <div className="glass-card p-8 sm:p-12 max-w-md w-full text-center space-y-6 border border-rose-500/20">
            <div className="inline-flex p-4 rounded-full bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-10 h-10 text-rose-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Oups, quelque chose a planté
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Une erreur inattendue est survenue. Réessayez ou retournez à l'accueil.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-zinc-950/60 border border-white/5 rounded-lg p-3 text-left">
                <p className="text-[11px] font-mono text-zinc-500 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center gap-2 btn-gold py-3 rounded-lg text-sm font-bold"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
              <a
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-white/10 text-zinc-300 hover:bg-white/5 py-3 rounded-lg text-sm font-semibold transition-colors"
              >
                <Home className="w-4 h-4" />
                Accueil
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
