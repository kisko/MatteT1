import React from 'react';
import { Flame, Award, Sun, Moon, BookOpen, TableProperties } from 'lucide-react';

interface NavbarProps {
  streakDays: number;
  totalSolved: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onGoHome: () => void;
  onOpenMatrix: () => void;
  isMatrixActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  streakDays,
  totalSolved,
  isDark,
  onToggleTheme,
  onGoHome,
  onOpenMatrix,
  isMatrixActive,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-slate-900/90 dark:bg-slate-900/90 border-b border-slate-800 dark:border-slate-800 transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto min-h-14 sm:min-h-16 px-3 py-2 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 sm:gap-3 group text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
            <div className="w-full h-full bg-slate-900 dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                MatteT1
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 uppercase tracking-wide">
                LK20 1T
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Interaktiv matematikk for VG1
            </p>
          </div>
        </button>

        {/* Stats & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenMatrix}
            className={`p-2 rounded-xl border transition-colors ${
              isMatrixActive
                ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Åpne kompetansematrisen"
            aria-label="Åpne kompetansematrisen"
          >
            <TableProperties className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Streak Counter */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-amber-400 font-semibold text-xs sm:text-sm shadow-sm"
            title="Sammenhengende øvingsdager (Streak)"
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline">{streakDays} dager</span>
            <span className="sm:hidden">{streakDays}d</span>
          </div>

          {/* Solved Tasks Counter */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-emerald-400 font-semibold text-xs sm:text-sm shadow-sm"
            title="Totalt løste oppgaver"
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="hidden sm:inline">{totalSolved} løst</span>
            <span className="sm:hidden">{totalSolved}</span>
          </div>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title={isDark ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
          >
            {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
