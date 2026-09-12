import React from 'react';
import { Lk20Topic1T, Lk20TopicNames } from '../../domain/model/task/value-objects/Lk20Category.js';
import { CategoryMastery } from '../../domain/model/progress/UserProgress.js';
import { ArrowRight, Calculator, Equal, FunctionSquare, TrendingUp, PieChart, Triangle, Code2 } from 'lucide-react';

interface CategoryCardProps {
  topic: Lk20Topic1T;
  mastery: CategoryMastery;
  onStart: (topic: Lk20Topic1T) => void;
}

const topicDetails: Record<
  Lk20Topic1T,
  { description: string; icon: React.ReactNode; color: string }
> = {
  [Lk20Topic1T.TALL_OG_ALGEBRA]: {
    description: 'Potenser, rader, kvadratsetninger, polynomdivisjon og rasjonale uttrykk.',
    icon: <Calculator className="w-6 h-6 text-indigo-400" />,
    color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 hover:border-indigo-400/60',
  },
  [Lk20Topic1T.LIGNINGER_OG_ULIKHETER]: {
    description: 'Lineære & andregradsligninger, ulikheter og fortegnsskjema.',
    icon: <Equal className="w-6 h-6 text-pink-400" />,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 hover:border-pink-400/60',
  },
  [Lk20Topic1T.FUNKSJONER]: {
    description: 'Polynom-, rasjonale-, potens- og eksponentialfunksjoner. Nullpunkter og topp/bunnpunkter.',
    icon: <FunctionSquare className="w-6 h-6 text-cyan-400" />,
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover:border-cyan-400/60',
  },
  [Lk20Topic1T.DERIVASJON_OG_VEKSTFART]: {
    description: 'Gjennomsnittlig & momentan vekstfart, grenseverdier og den deriverte som stigningstall.',
    icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-400/60',
  },
  [Lk20Topic1T.TRIGONOMETRI]: {
    description: 'Sinus, cosinus og tangens, trekantberegninger, arealsetningen og sinus- og cosinussetningen.',
    icon: <Triangle className="w-6 h-6 text-violet-400" />,
    color: 'from-violet-500/20 to-fuchsia-500/20 border-violet-500/30 hover:border-violet-400/60',
  },
  [Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING]: {
    description: 'Algoritmisk tenkning, programmering, bevis, modellering, digitale verktøy og kritisk vurdering.',
    icon: <Code2 className="w-6 h-6 text-sky-400" />,
    color: 'from-sky-500/20 to-cyan-500/20 border-sky-500/30 hover:border-sky-400/60',
  },
  [Lk20Topic1T.SANNSYNLIGHET]: {
    description: 'Venn-diagram, valgtre, betinget sannsynlighet og kombinatorikk.',
    icon: <PieChart className="w-6 h-6 text-amber-400" />,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-400/60',
  },
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  topic,
  mastery,
  onStart,
}) => {
  const details = topicDetails[topic];
  const title = Lk20TopicNames[topic];

  return (
    <div
      className={`group relative rounded-2xl bg-gradient-to-br ${details.color} p-6 border backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between`}
    >
      <div>
        {/* Header med Ikon og Tittel */}
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-inner">
            {details.icon}
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900/70 text-slate-300 border border-slate-700/50">
            {mastery.masteryPercentage}% Mestring
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {details.description}
        </p>
      </div>

      <div>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Mestringsnivå</span>
            <span>
              {mastery.tasksCorrect} av {mastery.tasksAttempted} løst riktig
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900/80 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${mastery.masteryPercentage}%` }}
            />
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStart(topic)}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-indigo-600 text-white font-semibold text-sm border border-slate-700 hover:border-indigo-500 flex items-center justify-center gap-2 shadow-lg transition-all group-hover:bg-indigo-600 group-hover:border-indigo-400"
        >
          <span>Åpne leksjon</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
