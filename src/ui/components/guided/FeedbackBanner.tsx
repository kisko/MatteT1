import React from 'react';
import { AlertTriangle, CheckCircle2, Eye, Info, Lightbulb } from 'lucide-react';
import { GuidedFeedback } from '../../../domain/model/guided/GuidedSession.js';
import {
  MisconceptionType,
  MISCONCEPTION_INFO,
} from '../../../domain/model/task/Misconception.js';
import { MathView } from '../../MathView.js';

export interface FeedbackBannerProps {
  feedback: GuidedFeedback;
  /** Tilbys når rådet er å hente hintet. */
  onUseHint?: () => void;
  /** Tilbys når rådet er å få steget vist. */
  onReveal?: () => void;
  hintAlreadyUsed?: boolean;
}

const toneStyles: Record<GuidedFeedback['tone'], { frame: string; title: string; icon: React.ReactNode }> = {
  correct: {
    frame: 'border-emerald-400/40 bg-emerald-500/10',
    title: 'text-emerald-200',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-300" />,
  },
  incorrect: {
    frame: 'border-rose-400/40 bg-rose-500/10',
    title: 'text-rose-200',
    icon: <AlertTriangle className="h-5 w-5 text-rose-300" />,
  },
  revealed: {
    frame: 'border-amber-400/40 bg-amber-500/10',
    title: 'text-amber-200',
    icon: <Eye className="h-5 w-5 text-amber-300" />,
  },
  hint: {
    frame: 'border-amber-400/40 bg-amber-500/10',
    title: 'text-amber-200',
    icon: <Lightbulb className="h-5 w-5 text-amber-300" />,
  },
  info: {
    frame: 'border-cyan-400/30 bg-cyan-500/10',
    title: 'text-cyan-200',
    icon: <Info className="h-5 w-5 text-cyan-300" />,
  },
};

/**
 * Tilbakemeldingen etter hver handling: hva skjedde, hvorfor, og hva eleven
 * kan gjøre nå. Handlingen følger rådet fra domenet, slik at eleven aldri
 * står fast uten utvei.
 */
export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  feedback,
  onUseHint,
  onReveal,
  hintAlreadyUsed = false,
}) => {
  const style = toneStyles[feedback.tone];
  const misconception =
    feedback.misconceptionType && feedback.misconceptionType !== MisconceptionType.NONE
      ? MISCONCEPTION_INFO[feedback.misconceptionType as Exclude<MisconceptionType, MisconceptionType.NONE>]
      : undefined;

  const showHintAction = feedback.advice?.tone === 'hint' && !hintAlreadyUsed && Boolean(onUseHint);
  const showRevealAction = feedback.advice?.tone === 'reveal' && Boolean(onReveal);

  return (
    <div
      className={`guided-fade-in rounded-2xl border p-3.5 sm:p-4 ${style.frame}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{style.icon}</span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold ${style.title}`}>{feedback.title}</p>
          <div className="mt-1 text-sm leading-relaxed text-slate-200">
            <MathView latex={feedback.message} />
          </div>

          {misconception && (
            <p className="mt-2 rounded-xl border border-slate-700/70 bg-slate-950/50 p-2.5 text-xs leading-relaxed text-slate-300">
              <span className="font-bold text-slate-200">{misconception.title}:</span>{' '}
              <MathView latex={misconception.tip} />
            </p>
          )}

          {feedback.advice && (
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{feedback.advice.message}</p>
          )}

          {(showHintAction || showRevealAction) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {showHintAction && (
                <button
                  type="button"
                  onClick={onUseHint}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/15 px-3 py-2 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-400/25"
                >
                  <Lightbulb className="h-4 w-4" /> Hent hintet
                </button>
              )}
              {showRevealAction && (
                <button
                  type="button"
                  onClick={onReveal}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition-colors hover:bg-slate-700"
                >
                  <Eye className="h-4 w-4" /> Vis meg dette steget
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackBanner;
