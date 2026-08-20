/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise React Error Boundary
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Global Error Handling Framework
 * Version: 1.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class EnterpriseErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    const eventId = `ui_err_${Math.random().toString(36).substring(2, 10)}`;
    return {
      hasError: true,
      error,
      errorInfo: null,
      eventId,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[EnterpriseErrorBoundary] React UI Component Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleReloadPage = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = process.env.NODE_ENV !== 'production';

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-rose-500/20 backdrop-blur-md">
          <Card className="max-w-xl w-full p-6 space-y-6 border-rose-500/30 bg-slate-950 text-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block">
                  {this.props.moduleName || 'System Interface Fault'}
                </span>
                <h3 className="text-lg font-black text-white">
                  An unexpected UI exception occurred
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-semibold">
                حدث خطأ غير متوقع أثناء عرض هذه الواجهة. تم تسجيل هذه الحالة تلقائياً للفحص المباشر.
              </p>
              <p className="text-slate-400">
                The user interface encountered an isolated error. Your active session data remains safe.
              </p>
              {this.state.eventId && (
                <div className="pt-2">
                  <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/10 inline-block">
                    Event Reference ID: <span className="text-[#00F0FF]">{this.state.eventId}</span>
                  </span>
                </div>
              )}
            </div>

            {isDev && this.state.error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-40">
                <div className="font-bold mb-1">{this.state.error.toString()}</div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-rose-400/80 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={this.handleReset}
                className="gap-2 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة / Retry View</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReloadPage}
                className="gap-2 text-xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span>تحديث الصفحة / Reload Page</span>
              </Button>
            </div>
          </Card>
        </div>
      );
    }

  return this.props.children;
  }
}
