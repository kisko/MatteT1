import React, { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, Check, CheckCircle2, ChevronDown, Layers3, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { MathView } from '../../MathView.js';

const GRAPH_WIDTH = 640;
const GRAPH_HEIGHT = 300;
const X_MIN = -6;
const X_MAX = 6;
const Y_MIN = -10;
const Y_MAX = 12;

function toGraphX(value: number): number {
  return ((value - X_MIN) / (X_MAX - X_MIN)) * GRAPH_WIDTH;
}

function toGraphY(value: number): number {
  return GRAPH_HEIGHT - ((value - Y_MIN) / (Y_MAX - Y_MIN)) * GRAPH_HEIGHT;
}

function formatNumber(value: number): string {
  if (Math.abs(value) < 0.005) return '0';
  return Number(value.toFixed(2)).toString();
}

/**
 * Utforskerlaben: den åpne sandkassen der eleven endrer koeffisienter og
 * undersøker hva som skjer, før noe skal regnes ut.
 */
export const ParabolaSandbox: React.FC = () => {
  const [a, setA] = useState(-1);
  const [b, setB] = useState(2);
  const [c, setC] = useState(3);
  const [selectedHypothesis, setSelectedHypothesis] = useState<string | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [challengeAnswer, setChallengeAnswer] = useState<'correct' | 'incorrect' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDerivation, setShowDerivation] = useState(false);
  const [predictionChoices, setPredictionChoices] = useState<string[]>([]);
  const [observationChoices, setObservationChoices] = useState<string[]>([]);

  useEffect(() => {
    if (!isPlaying) return;

    const animation = window.setInterval(() => {
      setC((current) => {
        const next = current + 0.5;
        return next > 8 ? -6 : next;
      });
    }, 700);

    return () => window.clearInterval(animation);
  }, [isPlaying]);

  const model = useMemo(() => {
    const vertexX = a === 0 ? null : -b / (2 * a);
    const vertexY = vertexX === null ? null : a * vertexX ** 2 + b * vertexX + c;
    const discriminant = b ** 2 - 4 * a * c;
    const linearRoot = a === 0 && b !== 0 ? -c / b : null;
    const roots = discriminant < 0 || a === 0
      ? []
      : [(-b - Math.sqrt(discriminant)) / (2 * a), (-b + Math.sqrt(discriminant)) / (2 * a)]
          .sort((left, right) => left - right);
    const points = Array.from({ length: 121 }, (_, index) => {
      const x = X_MIN + index * 0.1;
      return { x, y: a * x ** 2 + b * x + c };
    });
    return { vertexX, vertexY, discriminant, linearRoot, roots, points };
  }, [a, b, c]);

  const path = model.points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${toGraphX(point.x).toFixed(1)} ${toGraphY(point.y).toFixed(1)}`)
    .join(' ');

  const expression = `${a === 1 ? '' : a === -1 ? '-' : `${formatNumber(a)} `}x^2 ${b >= 0 ? '+ ' : '- '}${formatNumber(Math.abs(b))}x ${c >= 0 ? '+ ' : '- '}${formatNumber(Math.abs(c))}`;
  const tableValues = [-2, -1, 0, 1, 2].map((x) => ({ x, y: a * x ** 2 + b * x + c }));

  const reset = () => {
    setA(-1);
    setB(2);
    setC(3);
    setSelectedHypothesis(null);
    setShowInsight(false);
    setChallengeAnswer(null);
    setIsPlaying(false);
    setShowDerivation(false);
    setPredictionChoices([]);
    setObservationChoices([]);
  };

  const toggleChoice = (setChoices: React.Dispatch<React.SetStateAction<string[]>>, choice: string) => {
    setChoices((current) => current.includes(choice) ? current.filter((item) => item !== choice) : [...current, choice]);
  };

  const getChoiceFeedback = (choice: string, phase: 'prediction' | 'observation') => {
    const feedback: Record<string, { isCorrect: boolean; explanation: string }> = phase === 'prediction'
      ? {
          'Grafen flyttes oppover.': { isCorrect: true, explanation: 'Riktig. Når c øker, øker f(x) med samme mengde for alle x-verdier.' },
          'Grafen flyttes nedover.': { isCorrect: false, explanation: 'Ikke her. En større c flytter grafen opp, ikke ned.' },
          'Formen på grafen er den samme.': { isCorrect: true, explanation: 'Riktig. a og b er uendret, så åpning og symmetriakse er de samme.' },
          'Grafen blir smalere.': { isCorrect: false, explanation: 'Ikke her. Grafens bredde styres av a, ikke av c.' },
        }
      : {
          'Grafen flyttes oppover.': { isCorrect: true, explanation: 'Riktig. Hele grafen får større y-verdi når c øker.' },
          'Toppunktets x-koordinat er uendret.': { isCorrect: true, explanation: 'Riktig. x-koordinaten er -b/(2a), og verken a eller b ble endret.' },
          'Nullpunktene kan endres.': { isCorrect: true, explanation: 'Riktig. Når grafen flyttes, kan den krysse x-aksen på andre steder.' },
          'Grafens åpning endres.': { isCorrect: false, explanation: 'Ikke her. Åpningen styres av a, og a er konstant i dette eksperimentet.' },
        };
    return feedback[choice];
  };

  const predictionOptions = [
    'Grafen flyttes oppover.',
    'Grafen flyttes nedover.',
    'Formen på grafen er den samme.',
    'Grafen blir smalere.',
  ];
  const observationOptions = [
    'Grafen flyttes oppover.',
    'Toppunktets x-koordinat er uendret.',
    'Nullpunktene kan endres.',
    'Grafens åpning endres.',
  ];
  const predictionComplete = predictionChoices.length === 2 && predictionChoices.includes('Grafen flyttes oppover.') && predictionChoices.includes('Formen på grafen er den samme.');
  const observationComplete = observationChoices.length === 3 && observationChoices.includes('Grafen flyttes oppover.') && observationChoices.includes('Toppunktets x-koordinat er uendret.') && observationChoices.includes('Nullpunktene kan endres.');

  return (
    <div>
      <div className="mb-6 max-w-3xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">Utforskerlab</p>
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl">Se hva funksjonen gjør.</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">Endre koeffisientene, legg merke til mønstrene og test en påstand. Her er målet å undersøke før du regner.</p>
      </div>

      <section className="mb-5 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5" aria-labelledby="lab-flow-heading">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-400">Slik arbeider du</p>
            <h2 id="lab-flow-heading" className="mt-1 text-lg font-bold text-white">Fra gjetning til matematisk forklaring</h2>
          </div>
          <ol className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            {['Forutsi', 'Utforsk', 'Dokumenter', 'Forklar'].map((step, index) => (
              <li key={step} className={`rounded-lg border px-3 py-2 ${index === 0 ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-100' : 'border-slate-700 bg-slate-800/60 text-slate-400'}`}>
                <span className="mr-1.5 font-black">{index + 1}.</span>{step}
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3">
            <span className="block text-sm font-bold text-cyan-100">Før du endrer noe: hva tror du skjer når <MathView latex="$c$" /> øker?</span>
            <span className="mt-1 block text-xs text-cyan-100/70">Velg alle påstandene du tror er riktige.</span>
            <div className="mt-3 grid gap-2">
              {predictionOptions.map((choice) => (
                <label key={choice} className={`cursor-pointer rounded-lg border p-2.5 text-sm transition-colors ${predictionChoices.includes(choice) ? getChoiceFeedback(choice, 'prediction').isCorrect ? 'border-emerald-400/60 bg-emerald-950/30' : 'border-rose-400/60 bg-rose-950/30' : 'border-slate-700 bg-slate-950/50 hover:border-cyan-400/60'}`}>
                  <span className="flex items-start gap-2 text-slate-200">
                  <input type="checkbox" checked={predictionChoices.includes(choice)} onChange={() => toggleChoice(setPredictionChoices, choice)} className="mt-0.5 h-4 w-4 accent-cyan-400" />
                  <span>{choice}</span>
                  </span>
                  {predictionChoices.includes(choice) && <span className={`mt-2 block pl-6 text-xs leading-relaxed ${getChoiceFeedback(choice, 'prediction').isCorrect ? 'text-emerald-200' : 'text-rose-200'}`}>{getChoiceFeedback(choice, 'prediction').explanation}</span>}
                </label>
              ))}
            </div>
            <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${predictionComplete ? 'bg-emerald-400/15 text-emerald-200' : 'bg-slate-950/40 text-slate-400'}`}>
              {predictionComplete ? <CheckCircle2 className="h-4 w-4" /> : <span className="font-bold">{predictionChoices.length}</span>}
              <span>{predictionComplete ? 'Dette steget er ferdig. Du har funnet begge de riktige påstandene.' : 'Du er ferdig når du har valgt alle riktige påstander og fjernet eventuelle røde valg.'}</span>
            </div>
          </label>
        </div>
        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3 text-xs leading-relaxed text-emerald-100/70">
          Du får tilbakemelding på hvert valg med én gang. Du kan endre valgene mens du undersøker.
        </div>
      </section>

      <div className="grid gap-5">
        <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-4 shadow-2xl sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Modell</p>
              <div className="mt-1 text-xl font-bold text-cyan-200"><MathView latex={`$f(x) = ${expression}$`} /></div>
            </div>
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"><RotateCcw className="h-4 w-4" /> Nullstill</button>
          </div>

          <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-950/20 p-3 sm:p-4">
            <p className="text-sm leading-relaxed text-amber-100">
              <span className="font-bold">Oppdrag:</span> Endre bare én koeffisient om gangen. Se på grafen, toppunktet, nullpunktene og tabellen før du velger hvilke observasjoner som stemmer.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-2 sm:p-4">
            <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} className="h-auto w-full" role="img" aria-label={`Grafen til f av x lik ${expression}`}>
              <rect width={GRAPH_WIDTH} height={GRAPH_HEIGHT} fill="#020617" />
              {Array.from({ length: 13 }, (_, index) => {
                const x = X_MIN + index;
                return (
                  <g key={`x-${x}`}>
                    <line x1={toGraphX(x)} x2={toGraphX(x)} y1={0} y2={GRAPH_HEIGHT} stroke="#1e293b" strokeWidth="1" />
                    {x % 2 === 0 && <text x={toGraphX(x)} y={toGraphY(0) + 18} textAnchor="middle" fill="#94a3b8" fontSize="11">{x}</text>}
                  </g>
                );
              })}
              {Array.from({ length: 23 }, (_, index) => {
                const y = Y_MIN + index;
                return (
                  <g key={`y-${y}`}>
                    <line x1={0} x2={GRAPH_WIDTH} y1={toGraphY(y)} y2={toGraphY(y)} stroke="#1e293b" strokeWidth="1" />
                    {y % 2 === 0 && y !== 0 && <text x={toGraphX(0) - 8} y={toGraphY(y) + 4} textAnchor="end" fill="#94a3b8" fontSize="11">{y}</text>}
                  </g>
                );
              })}
              <line x1={toGraphX(0)} x2={toGraphX(0)} y1={0} y2={GRAPH_HEIGHT} stroke="#64748b" strokeWidth="1.5" />
              <line x1={0} x2={GRAPH_WIDTH} y1={toGraphY(0)} y2={toGraphY(0)} stroke="#64748b" strokeWidth="1.5" />
              <text x={GRAPH_WIDTH - 8} y={toGraphY(0) - 8} textAnchor="end" fill="#cbd5e1" fontSize="12" fontWeight="600">x</text>
              <text x={toGraphX(0) + 8} y={14} fill="#cbd5e1" fontSize="12" fontWeight="600">y</text>
              <path d={path} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
              {model.vertexX !== null && model.vertexY !== null && model.vertexY >= Y_MIN && model.vertexY <= Y_MAX && (
                <circle cx={toGraphX(model.vertexX)} cy={toGraphY(model.vertexY)} r="5" fill="#fbbf24" />
              )}
              {model.roots.filter((root) => root >= X_MIN && root <= X_MAX).map((root) => <circle key={root} cx={toGraphX(root)} cy={toGraphY(0)} r="4" fill="#fb7185" />)}
              {model.linearRoot !== null && model.linearRoot >= X_MIN && model.linearRoot <= X_MAX && <circle cx={toGraphX(model.linearRoot)} cy={toGraphY(0)} r="4" fill="#fb7185" />}
            </svg>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ['a', a, setA, -2, 2, 'Åpning'],
              ['b', b, setB, -6, 6, 'Helning'],
              ['c', c, setC, -6, 8, 'Skjæring'],
            ].map(([label, value, setter, min, max, description]) => (
              <label key={label as string} className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                <span className="flex items-center justify-between text-sm font-bold text-slate-200"><span>{label as string}</span><span className="text-cyan-300">{formatNumber(value as number)}</span></span>
                <input type="range" min={min as number} max={max as number} step="0.5" value={value as number} onChange={(event) => (setter as (value: number) => void)(Number(event.target.value))} className="mt-3 w-full accent-cyan-400" />
                <span className="mt-1 block text-xs text-slate-400">{description as string}</span>
              </label>
            ))}
          </div>

          <label className="mt-5 block rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-4">
            <span className="block text-sm font-bold text-emerald-100">Dokumenter observasjonen</span>
            <span className="mt-1 block text-xs leading-relaxed text-emerald-100/70">Etter at du har økt <MathView latex="$c$" />, velg alle observasjonene som stemmer.</span>
            <div className="mt-3 grid gap-2">
              {observationOptions.map((choice) => (
                <label key={choice} className={`cursor-pointer rounded-lg border p-2.5 text-sm transition-colors ${observationChoices.includes(choice) ? getChoiceFeedback(choice, 'observation').isCorrect ? 'border-emerald-400/60 bg-emerald-950/30' : 'border-rose-400/60 bg-rose-950/30' : 'border-slate-700 bg-slate-950/50 hover:border-emerald-400/60'}`}>
                  <span className="flex items-start gap-2 text-slate-200">
                  <input type="checkbox" checked={observationChoices.includes(choice)} onChange={() => toggleChoice(setObservationChoices, choice)} className="mt-0.5 h-4 w-4 accent-emerald-400" />
                  <span>{choice}</span>
                  </span>
                  {observationChoices.includes(choice) && <span className={`mt-2 block pl-6 text-xs leading-relaxed ${getChoiceFeedback(choice, 'observation').isCorrect ? 'text-emerald-200' : 'text-rose-200'}`}>{getChoiceFeedback(choice, 'observation').explanation}</span>}
                </label>
              ))}
            </div>
            <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${observationComplete ? 'bg-emerald-400/15 text-emerald-200' : 'bg-slate-950/40 text-slate-400'}`}>
              {observationComplete ? <CheckCircle2 className="h-4 w-4" /> : <span className="font-bold">{observationChoices.length}</span>}
              <span>{observationComplete ? 'Dette steget er ferdig. Du har identifisert hele mønsteret.' : 'Velg videre til alle riktige observasjoner er markert, og fjern valg som får rød forklaring.'}</span>
            </div>
          </label>

          <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)]">
            <section className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-bold text-cyan-100"><Layers3 className="h-4 w-4" /> Flere representasjoner</h2>
                  <p className="mt-1 text-xs leading-relaxed text-cyan-100/70">Samme funksjon kan fortelle ulike ting avhengig av formen.</p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                <div className="min-w-0 rounded-lg bg-slate-950/60 p-3 sm:p-4">
                  <span className="block text-[11px] uppercase tracking-wide text-slate-400">Standardform</span>
                  <MathView className="representation-math mt-2" latex={`$${expression}$`} />
                </div>
                <div className="min-w-0 rounded-lg bg-slate-950/60 p-3 sm:p-4">
                  <span className="block text-[11px] uppercase tracking-wide text-slate-400">Toppunktform</span>
                  <MathView className="representation-math mt-2" latex={model.vertexX === null ? 'ikke relevant' : `$${formatNumber(a)}(x ${model.vertexX >= 0 ? '-' : '+'} ${formatNumber(Math.abs(model.vertexX))})^2 ${model.vertexY! >= 0 ? '+' : '-'} ${formatNumber(Math.abs(model.vertexY ?? 0))}$`} />
                </div>
                <div className="min-w-0 rounded-lg bg-slate-950/60 p-3 sm:p-4 md:col-span-2">
                  <span className="block text-[11px] uppercase tracking-wide text-slate-400">Løsninger</span>
                  <span className="mt-2 block font-mono text-base text-cyan-200">{model.linearRoot !== null ? `x = ${formatNumber(model.linearRoot)}` : model.roots.length === 0 ? 'Ingen reelle løsninger' : model.roots.map(formatNumber).join(' og ')}</span>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-cyan-500/20 bg-slate-950/40 p-3 sm:p-4">
                <button onClick={() => setShowDerivation((visible) => !visible)} className="flex w-full items-center justify-between gap-3 text-left text-sm font-bold text-cyan-100">
                  <span>Slik fant vi toppunkt og løsninger</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showDerivation ? 'rotate-180' : ''}`} />
                </button>
                {showDerivation && (
                  <div className="mt-4 space-y-4 border-t border-slate-800 pt-4 text-sm text-slate-300">
                    <div className="grid gap-3">
                      <div className="rounded-lg bg-slate-900/80 p-3">
                        <span className="text-xs font-bold uppercase tracking-wide text-amber-300">1. x-koordinaten</span>
                        <p className="mt-2 leading-relaxed">For en andregradsfunksjon finner vi symmetriaksen med formelen:</p>
                        <MathView className="representation-math mt-2" latex={String.raw`$x_v = \frac{-b}{2a}$`} />
                        <MathView className="representation-math mt-2" latex={String.raw`$x_v = \frac{-(${formatNumber(b)})}{2\cdot(${formatNumber(a)})} = ${formatNumber(model.vertexX ?? 0)}$`} />
                      </div>
                      <div className="rounded-lg bg-slate-900/80 p-3">
                        <span className="text-xs font-bold uppercase tracking-wide text-amber-300">2. y-koordinaten</span>
                        <p className="mt-2 leading-relaxed">Sett x-koordinaten inn i funksjonen for å finne høyden:</p>
                        <MathView className="representation-math mt-2" latex={`$y_v = f(${formatNumber(model.vertexX ?? 0)}) = ${formatNumber(model.vertexY ?? 0)}$`} />
                      </div>
                      <div className="rounded-lg bg-slate-900/80 p-3">
                        {a === 0 ? (
                          <div className="mt-2 space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wide text-amber-300">3. Løs likningen</span>
                            <p className="mt-2 leading-relaxed">Når <MathView latex="$a=0$" />, er dette en førstegradslikning:</p>
                            <MathView className="representation-math" latex={b === 0 ? String.raw`$0\cdot x + (${formatNumber(c)}) = 0$` : String.raw`$${formatNumber(b)}x + (${formatNumber(c)}) = 0$`} />
                            <MathView className="representation-math" latex={b === 0 ? (c === 0 ? String.raw`$\text{alle }x\text{ er løsninger}$` : String.raw`$\text{ingen løsninger}$`) : String.raw`$x = \frac{-(${formatNumber(c)})}{${formatNumber(b)}} = ${formatNumber(model.linearRoot ?? 0)}$`} />
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-bold uppercase tracking-wide text-amber-300">3. Nullpunktene</span>
                            <p className="mt-2 leading-relaxed">Først finner vi diskriminanten:</p>
                            <MathView className="representation-math mt-2" latex={String.raw`$D = (${formatNumber(b)})^2 - 4\cdot(${formatNumber(a)})\cdot(${formatNumber(c)}) = ${formatNumber(model.discriminant)}$`} />
                            <p className="mt-2 leading-relaxed">Deretter bruker vi abc-formelen:</p>
                            {model.roots.length > 0 ? (
                              <div className="mt-2 space-y-2">
                                <MathView className="representation-math" latex={String.raw`$x_1 = \frac{-b - \sqrt{D}}{2a} = ${formatNumber(model.roots[0])}$`} />
                                <MathView className="representation-math" latex={String.raw`$x_2 = \frac{-b + \sqrt{D}}{2a} = ${formatNumber(model.roots[1] ?? model.roots[0])}$`} />
                              </div>
                            ) : (
                              <MathView className="representation-math mt-2" latex={String.raw`$D < 0 \Rightarrow \text{ingen reelle løsninger}$`} />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <p className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3 leading-relaxed text-cyan-100">Legg merke til sammenhengen: toppunktet beskriver hvor grafen snur, mens nullpunktene beskriver hvor grafen møter x-aksen. Du kan endre <MathView latex="$a$" />, <MathView latex="$b$" /> eller <MathView latex="$c$" /> og følge hvordan mellomregningen endres.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="h-fit self-start rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-fuchsia-100">Se en endring over tid</h2>
                  <p className="mt-1 text-xs leading-relaxed text-fuchsia-100/70">Følg hvordan grafen flyttes når <MathView latex="$c$" /> endres.</p>
                </div>
                <button onClick={() => setIsPlaying((playing) => !playing)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-fuchsia-400 px-3 py-2 text-xs font-black text-slate-950 hover:bg-fuchsia-300" aria-label={isPlaying ? 'Stopp animasjon' : 'Start animasjon'}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Stopp' : 'Spill av'}
                </button>
              </div>
              <div className="mt-4 rounded-lg border border-fuchsia-400/20 bg-slate-950/30 p-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-fuchsia-200/70">
                  <span>c = -6</span>
                  <span>c = 8</span>
                </div>
                <div className="relative mt-2 h-1 rounded-full bg-fuchsia-200/20">
                  <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-fuchsia-200 bg-fuchsia-400" />
                  <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-fuchsia-200 bg-fuchsia-400" />
                  <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-fuchsia-300" />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-fuchsia-100/70">Stopp når du ser mønsteret. Hva endrer seg, og hva er konstant?</p>
              </div>
            </section>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:p-5" aria-labelledby="meaning-heading">
          <div className="mb-5 max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-400">Fra observasjon til forklaring</p>
            <h2 id="meaning-heading" className="mt-1 text-xl font-bold text-white">Bruk det du ser til å bygge en matematisk forklaring</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">Først finner du et mønster, så bruker du tallene som bevis, og til slutt tester du om forklaringen holder.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-5">
            <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">1. Finn mønsteret</p><h3 className="mt-1 font-bold text-amber-100">Hva legger du merke til?</h3><p className="mt-1 text-sm leading-relaxed text-amber-100/70">Velg påstandene som beskriver endringen du undersøkte.</p></div></div>
            <div className="mt-4 space-y-2">
              {['Når a blir mer negativ, vender grafen mer nedover.', 'c bestemmer alltid toppunktet.', 'Nullpunktene viser hvor grafen krysser x-aksen.'].map((hypothesis) => (
                <button key={hypothesis} onClick={() => setSelectedHypothesis(hypothesis)} className={`w-full rounded-xl border p-3 text-left text-sm transition-colors ${selectedHypothesis === hypothesis ? 'border-amber-300 bg-amber-300/15 text-amber-100' : 'border-amber-500/20 bg-slate-900/40 text-slate-300 hover:border-amber-400/50'}`}>{hypothesis}</button>
              ))}
            </div>
            {selectedHypothesis && <button onClick={() => setShowInsight(true)} className="mt-3 w-full rounded-xl bg-amber-400 px-3 py-2.5 text-sm font-black text-slate-950 hover:bg-amber-300">Undersøk påstanden</button>}
            {showInsight && (
              <div className="mt-3 rounded-xl border border-amber-500/20 bg-slate-950/50 p-3 text-sm leading-relaxed text-amber-100">
                {selectedHypothesis?.startsWith('Når a') && <p>Ja, i denne modellen gir en mer negativ <MathView latex="$a$" /> en smalere graf som vender nedover. Prøv likevel en annen verdi for <MathView latex="$b$" /> og se om toppunktet flytter seg.</p>}
                {selectedHypothesis?.startsWith('c bestemmer') && <p>Nei. <MathView latex="$c$" /> bestemmer skjæringen med y-aksen, mens toppunktet avhenger av alle koeffisientene.</p>}
                {selectedHypothesis?.startsWith('Nullpunktene') && <p>Ja. Nullpunktene er verdiene der <MathView latex="$f(x)=0$" />. Prøv å endre <strong>c</strong> og se hvordan grafen flyttes i forhold til x-aksen.</p>}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">2. Finn beviset</p>
            <h3 className="mt-1 font-bold text-white">Hvordan vet du det?</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">Tallene oversetter grafen til noe du kan kontrollere. Toppunktet viser hvor grafen snur, og diskriminanten sier hvor mange nullpunkter som er mulige.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-800 p-3"><span className="block text-xs text-slate-400">Toppunkt</span><strong className="text-amber-300">{model.vertexX === null ? 'ikke relevant' : `(${formatNumber(model.vertexX)}, ${formatNumber(model.vertexY ?? 0)})`}</strong></div>
              <div className="rounded-lg bg-slate-800 p-3"><span className="block text-xs text-slate-400">Diskriminant</span><strong className="text-cyan-300">{formatNumber(model.discriminant)}</strong></div>
            </div>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-700"><table className="w-full text-sm"><thead className="bg-slate-800 text-left text-xs uppercase text-slate-400"><tr><th className="px-3 py-2">x</th><th className="px-3 py-2">f(x)</th></tr></thead><tbody>{tableValues.map((row) => <tr key={row.x} className="border-t border-slate-800"><td className="px-3 py-2 text-slate-300">{row.x}</td><td className="px-3 py-2 font-mono text-cyan-200">{formatNumber(row.y)}</td></tr>)}</tbody></table></div>
          </section>

          <section className="rounded-2xl border border-indigo-500/25 bg-indigo-950/20 p-5">
            <div className="flex items-start gap-2 text-indigo-200"><BrainCircuit className="mt-0.5 h-5 w-5" /><div><p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">3. Test forklaringen</p><h3 className="mt-1 font-bold">Kan påstanden holde?</h3></div></div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">Bruk grafen og observasjonene dine, ikke magefølelsen, når du vurderer denne vanlige elevfeilen:</p>
            <p className="mt-2 rounded-lg border border-indigo-400/20 bg-slate-950/30 p-3 text-sm leading-relaxed text-indigo-100">«Når <MathView latex="$a$" /> blir mindre, blir alltid toppunktet lavere.»</p>
            <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => setChallengeAnswer('correct')} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:border-indigo-400">Ja</button><button onClick={() => setChallengeAnswer('incorrect')} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:border-indigo-400">Nei</button></div>
            {challengeAnswer && <p className={`mt-3 flex items-start gap-2 text-sm leading-relaxed ${challengeAnswer === 'incorrect' ? 'text-emerald-300' : 'text-rose-300'}`}>{challengeAnswer === 'incorrect' ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : null}{challengeAnswer === 'incorrect' ? 'Godt sett. Toppunktet avhenger av både a, b og c. Endre b og c for å finne et moteksempel.' : 'Prøv å endre b og c også. Påstanden gjelder ikke alltid.'}</p>}
          </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ParabolaSandbox;
