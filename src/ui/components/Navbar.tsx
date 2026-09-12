import React from 'react';
import { Flame, Award, Sun, Moon, BookOpen } from 'lucide-react';

interface NavbarProps {
  streakDays: number;
  totalSolved: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  streakDays,
  totalSolved,
  isDark,
  onToggleTheme,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-900/80 dark:bg-slate-900/80 border-b border-slate-800 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 group text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                MatteT1
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 uppercase tracking-wide">
                LK20 1T
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interaktiv matematikk for VG1
            </p>
          </div>
        </button>

        {/* Stats & Controls */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Streak Counter */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-amber-400 font-semibold text-sm shadow-sm"
            title="Samanhengende øvingsdager (Streak)"
          >
            <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
            <span>{streakDays} dager</span>
          </div>

          {/* Solved Tasks Counter */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-emerald-400 font-semibold text-sm shadow-sm"
            title="Totalt løste oppgaver"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>{totalSolved} løst</span>
          </div>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title={isDark ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-indigo-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
