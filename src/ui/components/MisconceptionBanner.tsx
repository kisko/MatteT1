import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Misconception } from '../../domain/model/task/Misconception.js';
import { MathView } from '../MathView.js';

interface MisconceptionBannerProps {
  misconception: Misconception;
}

export const MisconceptionBanner: React.FC<MisconceptionBannerProps> = ({
  misconception,
}) => {
  return (
    <div className="rounded-xl bg-amber-950/40 border border-amber-500/50 p-4 my-3 text-amber-200">
      <div className="flex items-center gap-2 font-bold text-amber-400 mb-1 text-sm">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <span>Feilanalytisk råd: {misconception.title}</span>
      </div>
      <p className="text-xs text-amber-200/90 mb-2">
        {misconception.descriptionLatex}
      </p>
      <div className="p-2.5 rounded-lg bg-amber-900/30 border border-amber-800/40 text-sm font-medium text-amber-100">
        <MathView latex={misconception.tipLatex} />
      </div>
    </div>
  );
};
