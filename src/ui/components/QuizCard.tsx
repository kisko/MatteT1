import React, { useState } from 'react';
import { Check, X, HelpCircle, FileText, ArrowRight, RefreshCw, RotateCcw } from 'lucide-react';
import { Task } from '../../domain/model/task/Task.js';
import { AnswerValue } from '../../domain/model/task/value-objects/StudentAnswer.js';
import { ExtendedEvaluationResult } from '../../domain/services/TaskEvaluatorService.js';
import { MathView } from '../MathView.js';
import { HintDrawer } from './HintDrawer.js';
import { MisconceptionBanner } from './MisconceptionBanner.js';
import { SolutionStepsModal } from './SolutionStepsModal.js';
import { HintGeneratorService } from '../../domain/services/HintGeneratorService.js';

interface QuizCardProps {
  task: Task;
  taskIndex: number;
  totalTasks: number;
  onSubmitAnswer: (answerValue: AnswerValue, hintsUsedCount: number, reasoning?: string) => Promise<ExtendedEvaluationResult | null>;
  onNextTask: () => void;
  isLastTask: boolean;
  isExamMode: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  task,
  taskIndex,
  totalTasks,
  onSubmitAnswer,
  onNextTask,
  isLastTask,
  isExamMode,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [evaluation, setEvaluation] = useState<ExtendedEvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const hints = HintGeneratorService.getHintsForTask(task);
  const answerType = task.correctAnswer.type;
  const numericPrecision = answerType === 'numeric' ? task.correctAnswer.precision : undefined;
  const answerGuidance =
    answerType === 'numeric'
      ? `Skriv bare tallet. Du kan bruke komma eller punktum som desimalskilletegn.${
          numericPrecision === undefined
            ? ''
            : ` Oppgaven forventer ${numericPrecision} desimal${numericPrecision === 1 ? '' : 'er'}.`
        }`
      : answerType === 'expression'
      ? 'Skriv et eksakt uttrykk når det er mulig, for eksempel x + 2, (x - 3)(x + 3) eller sqrt(2).'
      : answerType === 'text'
      ? 'Skriv et kort svar med egne ord.'
      : 'Velg alternativet som svarer best på oppgaven.';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && selectedOptionIndex === null) || isSubmitting) return;

    setIsSubmitting(true);
    setInputError(null);

    let answerValue: AnswerValue;
    switch (task.correctAnswer.type) {
      case 'numeric': {
        const numericValue = Number(inputValue.replace(',', '.'));
        if (!Number.isFinite(numericValue)) {
          setInputError('Skriv inn et gyldig tall, for eksempel 3,14 eller -2.');
          setIsSubmitting(false);
          return;
        }
        answerValue = { type: 'numeric', value: numericValue };
        break;
      }
      case 'multipleChoice':
        answerValue = {
          type: 'multipleChoice',
          selectedOptionIndex: selectedOptionIndex ?? -1,
        };
        break;
      case 'text':
        answerValue = { type: 'text', text: inputValue };
        break;
      default:
        answerValue = { type: 'expression', latex: inputValue };
    }

    const res = await onSubmitAnswer(answerValue, currentHintLevel, reasoning);
    setEvaluation(res);
    setIsSubmitting(false);
  };

  const handleRetry = () => {
    setEvaluation(null);
    setInputError(null);
  };

  const handleNextClick = () => {
    setInputValue('');
    setSelectedOptionIndex(null);
    setReasoning('');
    setEvaluation(null);
    setCurrentHintLevel(0);
    onNextTask();
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-8 backdrop-blur-md min-w-0 overflow-hidden">
      {/* Top Bar: Progress and Difficulty */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80">
            Oppgave {taskIndex + 1} av {totalTasks}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-slate-400 truncate max-w-[120px] sm:max-w-none">
            {task.category.mainTopic.replace(/_/g, ' ')}
          </span>
        </div>

        <span
          className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border ${
            task.difficulty.level === 'LETT'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : task.difficulty.level === 'MIDDELS'
              ? 'bg-amber-950 text-amber-300 border-amber-800'
              : 'bg-rose-950 text-rose-300 border-rose-800'
          }`}
        >
          {task.difficulty.level}
        </span>
      </div>

      {/* Title & Task Description */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-white mb-3">
          {task.title.value}
        </h2>
        <div className="text-lg text-slate-200 leading-relaxed bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
          <MathView latex={task.description.rawLatex} />
        </div>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleFormSubmit} className="mb-6">
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          {task.correctAnswer.type === 'multipleChoice'
            ? 'Velg ett alternativ:'
            : task.correctAnswer.type === 'text'
            ? 'Skriv svaret ditt:'
            : 'Ditt svar (tall eller matematisk uttrykk):'}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          {task.correctAnswer.type === 'multipleChoice' ? (
            <div className="grid w-full gap-2 sm:grid-cols-2">
              {(task.correctAnswer.options ?? []).map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSelectedOptionIndex(index);
                    setInputValue(String(index));
                  }}
                  disabled={Boolean(evaluation)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:opacity-60 ${
                    selectedOptionIndex === index
                      ? 'border-indigo-400 bg-indigo-950 text-indigo-100'
                      : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <span className="mr-2 font-bold text-slate-400">{String.fromCharCode(65 + index)}.</span>
                  <MathView latex={option} />
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setInputError(null);
              }}
              disabled={isExamMode ? Boolean(evaluation) : evaluation?.result.isCorrect}
              inputMode={answerType === 'numeric' ? 'decimal' : 'text'}
              aria-describedby="answer-guidance"
              placeholder={
                task.correctAnswer.type === 'numeric'
                  ? 'f.eks. 3.14 eller 4'
                  : task.correctAnswer.type === 'text'
                  ? 'Skriv et kort svar'
                  : 'f.eks. x + 2 eller (x-3)(x+3)'
              }
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-base placeholder-slate-500 disabled:opacity-60"
            />
          )}
          {isExamMode && (
            <div className="w-full">
              <label htmlFor="reasoning" className="mb-2 block text-xs font-semibold text-slate-400">
                Begrunnelse <span className="font-normal text-slate-500">(valgfritt)</span>
              </label>
              <textarea
                id="reasoning"
                value={reasoning}
                onChange={(event) => setReasoning(event.target.value)}
                disabled={Boolean(evaluation)}
                placeholder="Skriv én kort setning hvis du vil vise hvordan du tenkte."
                rows={2}
                className="min-h-16 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
              <p className="mt-1.5 text-xs text-slate-500">Du kan levere svaret uten å skrive en begrunnelse.</p>
            </div>
          )}
          <button
            type="submit"
            disabled={
              (!inputValue.trim() && selectedOptionIndex === null) ||
              isSubmitting ||
              Boolean(evaluation)
            }
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-sm transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 border border-indigo-500/40"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span>Sjekk svar</span>
            )}
          </button>
        </div>
        <p id="answer-guidance" className="mt-2 text-xs leading-relaxed text-slate-400">
          {answerGuidance}
        </p>
        {inputError && (
          <p className="mt-2 text-sm text-rose-300" role="alert">
            {inputError}
          </p>
        )}
      </form>

      {/* Evaluation Feedback */}
      {evaluation && !isExamMode && (
        <div className="mb-6 animate-fadeIn">
          {evaluation.result.isCorrect ? (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 flex items-start gap-3">
              <Check className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-300 text-base">Riktig besvart!</h4>
                <div className="text-sm mt-1">
                  <MathView latex={evaluation.result.feedbackLatex} />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/60 text-rose-200 flex items-start gap-3">
              <X className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-300 text-base">Ikke helt der ennå</h4>
                <div className="text-sm mt-1">
                  <MathView latex={evaluation.result.feedbackLatex} />
                </div>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
                Prøv igjen
              </button>
            </div>
          )}

          {/* Misconception Advice if detected */}
          {evaluation.misconception && (
            <MisconceptionBanner misconception={evaluation.misconception} />
          )}
        </div>
      )}

      {/* Hints Section */}
      {currentHintLevel > 0 && (
        <HintDrawer
          hints={hints}
          currentHintLevel={currentHintLevel}
          onRequestNextHint={() => setCurrentHintLevel((prev) => prev + 1)}
        />
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          {!isExamMode && currentHintLevel < hints.length && (
            <button
              onClick={() => setCurrentHintLevel((prev) => prev + 1)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>
                {currentHintLevel === 0 ? 'Vis hint' : 'Flere hint'}
              </span>
            </button>
          )}

          {!isExamMode && (
            <button
              onClick={() => setShowSolutionModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Se fullstendig forklaring</span>
            </button>
          )}
        </div>

        {evaluation && (
          <button
            onClick={handleNextClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all ml-auto"
          >
            <span>{isLastTask ? 'Fullfør sesjon' : 'Neste oppgave'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Solution Modal */}
      <SolutionStepsModal
        isOpen={showSolutionModal}
        onClose={() => setShowSolutionModal(false)}
        solutionSteps={task.solutionSteps}
      />
    </div>
  );
};
