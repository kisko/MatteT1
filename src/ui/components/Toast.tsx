import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, Flame, CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'milestone' | 'streak' | 'info';
  title: string;
  description: string;
  icon?: 'sparkles' | 'trophy' | 'flame' | 'check' | 'alert';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'streak':
        return <Flame className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'milestone':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'streak':
        return 'border-amber-500/40 bg-slate-900/95 text-amber-200';
      case 'milestone':
        return 'border-yellow-500/40 bg-slate-900/95 text-yellow-100';
      case 'success':
        return 'border-emerald-500/40 bg-slate-900/95 text-emerald-100';
      default:
        return 'border-indigo-500/40 bg-slate-900/95 text-indigo-100';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${getBorderColor()}`}
    >
      <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white leading-tight mb-1">{toast.title}</h4>
        <p className="text-xs text-slate-300 leading-relaxed">{toast.description}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white transition-colors p-1"
        aria-label="Lukk"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
