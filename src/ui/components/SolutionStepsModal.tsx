import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { SolutionStep } from '../../domain/model/task/value-objects/SolutionStep.js';
import { MathView } from '../MathView.js';

interface SolutionStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  solutionSteps: ReadonlyArray<SolutionStep>;
}

export const SolutionStepsModal: React.FC<SolutionStepsModalProps> = ({
  isOpen,
  onClose,
  solutionSteps,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">
              Fullstendig løsningsforslag
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stegvis gjennomgang */}
        <div className="overflow-y-auto my-4 pr-1 space-y-4">
          {solutionSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {step.stepNumber}
                </span>
                <h4 className="font-semibold text-slate-100">
                  {step.title}
                </h4>
              </div>

              <div className="text-sm text-slate-300 ml-8 leading-relaxed">
                <MathView latex={step.latexExplanation} />

                {step.formulaLatex && (
                  <div className="mt-2 p-2 rounded bg-slate-900/80 border border-slate-800">
                    <MathView latex={`$$${step.formulaLatex}$$`} displayMode={true} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/20"
          >
            Lukk løsning
          </button>
        </div>
      </div>
    </div>
  );
};
