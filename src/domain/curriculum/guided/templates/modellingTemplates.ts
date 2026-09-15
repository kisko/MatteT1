import { Lk20Topic1T } from '../../../model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../../../model/task/Misconception.js';
import { ExerciseTemplate } from '../../../model/guided/ExerciseTemplate.js';
import {
  distinctOptions,
  intBetween,
  num,
  pickFrom,
  right,
  signedNumber,
  wrong,
} from './seed.js';

interface ModellingContext {
  readonly noun: string;
  readonly unit: string;
  readonly fixedName: string;
  readonly perUnitName: string;
}

const contexts: readonly ModellingContext[] = [
  { noun: 'elsparkesykkel', unit: 'minutt', fixedName: 'startpris', perUnitName: 'minuttpris' },
  { noun: 'treningssenter', unit: 'økt', fixedName: 'medlemsavgift', perUnitName: 'pris per økt' },
  { noun: 'utleiebil', unit: 'kilometer', fixedName: 'startleie', perUnitName: 'kilometerpris' },
  { noun: 'strømavtale', unit: 'kWh', fixedName: 'fastledd', perUnitName: 'pris per kWh' },
];

const buildModelTemplate: ExerciseTemplate = {
  id: 'T-MOD-01',
  topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
  goalId: 'MOD-01',
  skillLabel: 'Modellering',
  title: 'Sett opp modellen',
  description: 'Oversette en situasjon til et matematisk uttrykk.',
  variantCount: 160,
  generate: (seed) => {
    const context = pickFrom(seed, 1, contexts);
    const fixed = pickFrom(seed, 2, [39, 49, 79, 99, 149, 199] as const);
    const perUnit = pickFrom(seed, 3, [4, 6, 9, 12, 15, 25] as const);
    const count = intBetween(seed, 4, 4, 12);

    const total = fixed + perUnit * count;
    const swappedTotal = fixed * count + perUnit;
    const bothTimesCount = (fixed + perUnit) * count;

    return {
      id: `T-MOD-01-s${seed}`,
      topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
      goalId: 'MOD-01',
      skillLabel: 'Modellering',
      title: `Hva koster det å bruke ${context.noun}en?`,
      situation: `En ${context.noun} har ${context.fixedName} på ${fixed} kroner og ${context.perUnitName} på ${perUnit} kroner per ${context.unit}.`,
      problemLatex: String.raw`$K(x) = ?$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: `Hvilket uttrykk beskriver prisen for $x$ ${context.unit}?`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$K(x) = ${fixed} + ${perUnit}x$`,
              `Riktig. ${fixed} kroner betales én gang, og ${perUnit} kroner for hver ${context.unit}.`
            ),
            [
              wrong(
                'byttet-om',
                String.raw`$K(x) = ${fixed}x + ${perUnit}$`,
                `Da ville ${context.fixedName} blitt betalt for hver ${context.unit}. Den betales bare én gang.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'alt-ganget',
                String.raw`$K(x) = (${fixed} + ${perUnit})x$`,
                `Her ganges begge prisene med $x$. Bare ${context.perUnitName} gjelder per ${context.unit}.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$K(x) = ${fixed} + ${perUnit}x$`,
          rationale: `En lineær modell har ett ledd som betales uansett, og ett ledd som vokser med bruken.`,
          hint: `Hva betaler du selv om du bruker den i 0 ${context.unit}?`,
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [fixed, perUnit], tone: 'primary', label: 'K(x)' }],
            markers: [{ x: 0, y: fixed, label: `${context.fixedName}: ${fixed}`, tone: 'accent' }],
            xRange: [0, count + 4],
            caption: `Grafen starter på ${fixed} og stiger med ${perUnit} per ${context.unit}.`,
          },
        },
        {
          kind: 'transform',
          prompt: `Hva koster ${count} ${context.unit}?`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$K(${count}) = ${fixed} + ${perUnit}\cdot ${count} = ${total}$ kroner`,
              `Riktig. ${perUnit} · ${count} = ${perUnit * count}, pluss ${fixed} i ${context.fixedName}.`
            ),
            [
              wrong(
                'ganget-fast',
                String.raw`$K(${count}) = ${fixed}\cdot ${count} + ${perUnit} = ${swappedTotal}$ kroner`,
                `${context.fixedName} skal ikke ganges med antall ${context.unit}.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'ganget-begge',
                String.raw`$K(${count}) = (${fixed} + ${perUnit})\cdot ${count} = ${bothTimesCount}$ kroner`,
                `Bare ${context.perUnitName} ganges med antallet.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$K(${count}) = ${total}$ kroner`,
          rationale: 'Å bruke modellen er å sette inn tallet og følge regnerekkefølgen.',
          hint: `Gang ${perUnit} med ${count} først.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: context.fixedName, value: fixed, tone: 'accent' },
              { label: `${perUnit} · ${count}`, value: perUnit * count, tone: 'primary' },
              { label: `til sammen ${total}`, value: total, tone: 'correct' },
            ],
            caption: 'Totalen er de to leddene lagt sammen.',
          },
        },
        {
          kind: 'interpret',
          prompt: `Hva betyr tallet ${perUnit} i modellen?`,
          options: distinctOptions(
            right(
              'riktig',
              `Prisen øker med ${perUnit} kroner for hver ekstra ${context.unit}`,
              'Riktig. Stigningstallet er prisen per enhet.'
            ),
            [
              wrong(
                'startpris',
                `Det er ${context.fixedName}`,
                `${context.fixedName} er ${fixed} kroner, og den er konstantleddet.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'totalpris',
                'Det er totalprisen',
                `Totalprisen avhenger av hvor mye du bruker. Her er den ${total} kroner for ${count} ${context.unit}.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$${perUnit}$ kroner per ${context.unit}`,
          rationale: 'I $K(x) = b + ax$ er $a$ prisen per enhet og $b$ det du betaler uansett.',
          hint: `Hva skjer med prisen om du bruker én ${context.unit} mer?`,
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [fixed, perUnit], tone: 'primary', label: 'K(x)' }],
            markers: [
              { x: count, y: total, label: `${count} ${context.unit}`, tone: 'correct' },
              { x: count + 1, y: total + perUnit, label: `+${perUnit}`, tone: 'accent' },
            ],
            xRange: [0, count + 4],
            caption: `Ett skritt bortover koster ${perUnit} kroner mer.`,
          },
        },
      ],
      answerLatex: String.raw`$K(x) = ${fixed} + ${perUnit}x$ og $K(${count}) = ${total}$ kroner`,
      takeaway: 'Finn først hva som betales én gang, og hva som betales per enhet. Da er modellen nesten ferdig.',
    };
  },
};

const budgetTemplate: ExerciseTemplate = {
  id: 'T-MOD-02',
  topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
  goalId: 'MOD-02',
  skillLabel: 'Lineær modell',
  title: 'Modell med budsjett',
  description: 'Finne hvor mye du får for pengene, og tolke svaret.',
  variantCount: 144,
  generate: (seed) => {
    const context = pickFrom(seed, 1, contexts);
    const fixed = pickFrom(seed, 2, [40, 60, 80, 100] as const);
    const perUnit = pickFrom(seed, 3, [15, 25, 30, 45] as const);
    const whole = intBetween(seed, 4, 3, 8);
    // Budsjettet legges slik at grensen aldri blir et helt tall. Da er
    // tolkningen (rund ned) selve poenget i siste steg.
    const budget = fixed + perUnit * whole + Math.round(perUnit / 2);

    const exactLimit = (budget - fixed) / perUnit;
    const costForWhole = fixed + perUnit * whole;
    const costForOneMore = fixed + perUnit * (whole + 1);

    return {
      id: `T-MOD-02-s${seed}`,
      topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
      goalId: 'MOD-02',
      skillLabel: 'Lineær modell',
      title: `Hvor mye rekker ${budget} kroner?`,
      situation: `En ${context.noun} koster ${fixed} kroner i ${context.fixedName} og ${perUnit} kroner per ${context.unit}. Du har ${budget} kroner, og du betaler per hele ${context.unit}.`,
      problemLatex: String.raw`$${fixed} + ${perUnit}x \le ${budget}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvordan skrives situasjonen matematisk?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$${fixed} + ${perUnit}x \le ${budget}$`,
              'Riktig. Du kan bruke opp til budsjettet, så dette er en ulikhet.'
            ),
            [
              wrong(
                'likhet',
                String.raw`$${fixed} + ${perUnit}x = ${budget}$`,
                'Du må ikke bruke opp alt. «Maksimalt» gir en ulikhet, ikke en likhet.'
              ),
              wrong(
                'feil-retning',
                String.raw`$${fixed} + ${perUnit}x \ge ${budget}$`,
                'Denne sier at du skal bruke *minst* budsjettet. Det er motsatt av hva du har råd til.',
                MisconceptionType.SIGN_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$${fixed} + ${perUnit}x \le ${budget}$`,
          rationale: 'Et budsjett er en øvre grense, og øvre grenser skrives som ulikheter.',
          hint: 'Har du råd til å bruke mer enn budsjettet?',
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [fixed, perUnit], tone: 'primary', label: 'kostnad' },
              { kind: 'polynomial', coefficients: [budget], tone: 'accent', label: 'budsjett' },
            ],
            markers: [{ x: exactLimit, y: budget, label: 'grensen', tone: 'error' }],
            xRange: [0, whole + 3],
            caption: 'Der den skrå linjen krysser budsjettlinjen, er pengene brukt opp.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Løs ulikheten for $x$.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$${perUnit}x \le ${budget - fixed} \Rightarrow x \le ${num(exactLimit, 2)}$`,
              `Riktig. Trekk fra ${context.fixedName} først, og del deretter på ${perUnit}.`
            ),
            [
              wrong(
                'la-til',
                String.raw`$${perUnit}x \le ${budget + fixed} \Rightarrow x \le ${num((budget + fixed) / perUnit, 2)}$`,
                `${context.fixedName} skal trekkes fra budsjettet, ikke legges til.`,
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'opp-ned',
                String.raw`$x \le \frac{${perUnit}}{${budget - fixed}}$`,
                'Brøken står opp ned. Del det du har igjen på prisen per enhet.'
              ),
            ]
          ),
          resultLatex: String.raw`$x \le ${num(exactLimit, 2)}$`,
          rationale: `Vi delte på ${perUnit}, som er positivt, så ulikhetstegnet står uendret.`,
          hint: `Hvor mange kroner har du igjen etter ${context.fixedName}?`,
          visual: {
            kind: 'numberline',
            min: 0,
            max: whole + 3,
            intervals: [{ from: 0, to: exactLimit, label: `x ≤ ${num(exactLimit, 2)}`, tone: 'correct' }],
            points: [{ value: exactLimit, label: `${num(exactLimit, 2)}`, tone: 'accent' }],
            caption: 'Den matematiske grensen er et desimaltall.',
          },
        },
        {
          kind: 'interpret',
          prompt: `Hvor mange hele ${context.unit} har du råd til?`,
          options: distinctOptions(
            right(
              'riktig',
              `${whole} ${context.unit}`,
              `Riktig. ${whole} ${context.unit} koster ${costForWhole} kroner, og det har du råd til.`
            ),
            [
              wrong(
                'rundet-opp',
                `${whole + 1} ${context.unit}`,
                `Avrunding oppover sprekker budsjettet: ${costForOneMore} kroner er mer enn ${budget}.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'desimaltall',
                `${num(exactLimit, 2)} ${context.unit}`,
                `Du betaler per hele ${context.unit}, så svaret må være et helt tall.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$x = ${whole}$ hele ${context.unit}, som koster ${costForWhole} kroner`,
          rationale:
            'Modellen gir en desimalgrense. Situasjonen bestemmer at svaret må rundes ned til et helt tall.',
          hint: `Regn ut hva ${whole} og ${whole + 1} ${context.unit} koster, og sammenlign med ${budget}.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: `${whole}: ${costForWhole} kr`, value: costForWhole, tone: 'correct' },
              { label: `budsjett ${budget} kr`, value: budget, tone: 'primary' },
              { label: `${whole + 1}: ${costForOneMore} kr`, value: costForOneMore, tone: 'error' },
            ],
            caption: 'Den grønne ligger under budsjettet. Den røde sprekker det.',
          },
        },
      ],
      answerLatex: String.raw`$x \le ${num(exactLimit, 2)}$, altså ${whole} hele ${context.unit}`,
      takeaway: 'Regn ut grensen matematisk, og tolk den etterpå i situasjonen. Rund ned når enheten er hel.',
    };
  },
};

const algorithmTemplate: ExerciseTemplate = {
  id: 'T-MOD-03',
  topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
  goalId: 'MOD-03',
  skillLabel: 'Algoritmisk tenkning',
  title: 'Algoritmisk tenkning',
  description: 'Følge en løkke steg for steg og se hva den regner ut.',
  variantCount: 120,
  generate: (seed) => {
    const start = pickFrom(seed, 1, [0, 5, 10, 20, 50, 100] as const);
    const step = pickFrom(seed, 2, [3, 4, 6, 7, 8, 12] as const);
    const iterations = intBetween(seed, 3, 3, 6);

    const result = start + step * iterations;
    const oneTooMany = start + step * (iterations + 1);
    const multiplied = start * iterations;

    const trace = Array.from({ length: Math.min(iterations, 5) + 1 }, (_, index) => ({
      label: `etter ${index}`,
      value: start + step * index,
      tone: (index === iterations ? 'correct' : 'primary') as 'correct' | 'primary',
    }));

    return {
      id: `T-MOD-03-s${seed}`,
      topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
      goalId: 'MOD-03',
      skillLabel: 'Algoritmisk tenkning',
      title: 'Følg algoritmen',
      situation: `En algoritme starter med $v = ${start}$ og gjentar operasjonen $v \\leftarrow v + ${step}$ i ${iterations} runder.`,
      problemLatex: String.raw`$v \leftarrow v + ${step}, \quad ${iterations} \text{ runder}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilket uttrykk beskriver verdien etter $n$ runder?',
          options: distinctOptions(
            right('riktig', String.raw`$v = ${start} + ${step}n$`, `Riktig. Hver runde legger til ${step}.`),
            [
              wrong(
                'ganget',
                String.raw`$v = ${start}\cdot n$`,
                `Startverdien ganges ikke. Det er ${step} som legges til per runde.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'en-gang',
                String.raw`$v = ${start} + ${step}$`,
                'Dette er verdien etter bare én runde. Antall runder må være med.'
              ),
            ]
          ),
          resultLatex: String.raw`$v = ${start} + ${step}n$`,
          rationale: 'En løkke som legger til samme tall hver runde gir en lineær sammenheng.',
          hint: 'Skriv ned verdien etter 1, 2 og 3 runder, og se mønsteret.',
          visual: {
            kind: 'bars',
            bars: trace,
            caption: `Verdien øker med ${step} for hver runde.`,
          },
        },
        {
          kind: 'transform',
          prompt: `Hva er $v$ etter ${iterations} runder?`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$v = ${start} + ${step}\cdot ${iterations} = ${result}$`,
              `Riktig. ${step} · ${iterations} = ${step * iterations}, pluss startverdien ${start}.`
            ),
            [
              wrong(
                'en-for-mye',
                String.raw`$v = ${oneTooMany}$`,
                `Her er det kjørt ${iterations + 1} runder. Løkken kjører ${iterations} ganger.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              // Utelates når start·runder tilfeldigvis gir riktig verdi.
              ...(multiplied === result
                ? []
                : [
                    wrong(
                      'ganget-start',
                      String.raw`$v = ${multiplied}$`,
                      'Startverdien skal ikke ganges med antall runder.',
                      MisconceptionType.UNIT_INTERPRETATION_ERROR
                    ),
                  ]),
            ]
          ),
          resultLatex: String.raw`$v = ${result}$`,
          rationale: `Etter ${iterations} runder er ${step} lagt til ${iterations} ganger.`,
          hint: 'Gang steget med antall runder, og legg til startverdien.',
          visual: {
            kind: 'bars',
            bars: trace,
            caption: `Den grønne stolpen er verdien etter ${iterations} runder: ${result}.`,
          },
        },
        {
          kind: 'interpret',
          prompt: `Hvor mange ganger kjøres linjen $v \\leftarrow v + ${step}$?`,
          options: distinctOptions(
            right('riktig', `${iterations} ganger`, `Riktig. Løkken kjører ${iterations} runder, én operasjon per runde.`),
            [
              wrong(
                'pluss-en',
                `${iterations + 1} ganger`,
                'Startverdien er ikke en runde. Den er utgangspunktet før løkken begynner.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'en-gang',
                'Én gang',
                'Linjen står inni løkken, så den kjøres én gang per runde.'
              ),
            ]
          ),
          resultLatex: String.raw`$${iterations}$ operasjoner gir $v = ${result}$`,
          rationale:
            'Å telle riktig antall gjennomkjøringer er kjernen i algoritmisk tenkning. Én for mye eller for lite er den vanligste feilen.',
          hint: 'Tell rundene, ikke verdiene.',
          visual: {
            kind: 'bars',
            bars: trace,
            caption: `Det er ${trace.length} verdier, men bare ${iterations} operasjoner.`,
          },
        },
      ],
      answerLatex: String.raw`$v = ${result}$ etter ${iterations} runder`,
      takeaway: 'Følg løkken én runde om gangen, og hold styr på hvor mange ganger kroppen faktisk kjører.',
    };
  },
};

const modelChoiceTemplate: ExerciseTemplate = {
  id: 'T-MOD-04',
  topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
  goalId: 'MOD-04',
  skillLabel: 'Modellvalg',
  title: 'Modellvalg og modellkritikk',
  description: 'Velge mellom lineær og eksponentiell modell, og vurdere gyldigheten.',
  variantCount: 96,
  generate: (seed) => {
    const isExponential = pickFrom(seed, 1, [true, false] as const);
    const start = pickFrom(seed, 2, [200, 500, 1000, 2000] as const);
    const percent = pickFrom(seed, 3, [5, 10, 20, 25] as const);
    const amount = Math.round((start * percent) / 100);
    const periods = intBetween(seed, 4, 3, 6);

    const factor = 1 + percent / 100;
    const exponentialValue = start * factor ** periods;
    const linearValue = start + amount * periods;

    const description = isExponential
      ? `En verdi starter på ${start} og øker med ${percent} prosent hvert år.`
      : `En verdi starter på ${start} og øker med ${amount} kroner hvert år.`;

    return {
      id: `T-MOD-04-s${seed}`,
      topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
      goalId: 'MOD-04',
      skillLabel: 'Modellvalg',
      title: 'Hvilken modell passer?',
      situation: description,
      problemLatex: String.raw`$f(x) = ?$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilken type modell beskriver situasjonen?',
          options: distinctOptions(
            right(
              'riktig',
              isExponential
                ? String.raw`Eksponentiell: $f(x) = ${start}\cdot ${num(factor)}^x$`
                : String.raw`Lineær: $f(x) = ${start} + ${amount}x$`,
              isExponential
                ? 'Riktig. En fast prosent betyr at verdien ganges med samme faktor hvert år.'
                : 'Riktig. Et fast beløp betyr at det legges til like mye hvert år.'
            ),
            [
              wrong(
                'motsatt',
                isExponential
                  ? String.raw`Lineær: $f(x) = ${start} + ${amount}x$`
                  : String.raw`Eksponentiell: $f(x) = ${start}\cdot ${num(factor)}^x$`,
                isExponential
                  ? `${percent} prosent av ${start} er ${amount} bare det første året. Året etter regnes prosenten av en større verdi.`
                  : `Et fast beløp gir lik økning hvert år. Prosentvis vekst ville gitt en større og større økning.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'konstant',
                String.raw`Konstant: $f(x) = ${start}$`,
                'Denne modellen beskriver noe som ikke endrer seg i det hele tatt.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: isExponential
            ? String.raw`$f(x) = ${start}\cdot ${num(factor)}^x$`
            : String.raw`$f(x) = ${start} + ${amount}x$`,
          rationale: isExponential
            ? 'Fast prosent betyr multiplikasjon med samme vekstfaktor hver periode.'
            : 'Fast beløp betyr addisjon av samme tall hver periode.',
          hint: 'Er økningen like stor hvert år, eller vokser selve økningen?',
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [start, amount], tone: isExponential ? 'muted' : 'correct', label: 'lineær' },
              {
                kind: 'exponential',
                coefficients: [start, factor],
                tone: isExponential ? 'correct' : 'muted',
                label: 'eksponentiell',
              },
            ],
            xRange: [0, periods + 2],
            caption: 'De to modellene starter likt, men skiller seg mer og mer.',
          },
        },
        {
          kind: 'transform',
          prompt: `Hva er verdien etter ${periods} år?`,
          options: distinctOptions(
            right(
              'riktig',
              isExponential
                ? String.raw`$f(${periods}) = ${start}\cdot ${num(factor)}^{${periods}} \approx ${num(exponentialValue, 0)}$`
                : String.raw`$f(${periods}) = ${start} + ${amount}\cdot ${periods} = ${linearValue}$`,
              'Riktig. Modellen brukes ved å sette inn antall år.'
            ),
            [
              wrong(
                'annen-modell',
                isExponential
                  ? String.raw`$f(${periods}) = ${start} + ${amount}\cdot ${periods} = ${linearValue}$`
                  : String.raw`$f(${periods}) \approx ${num(exponentialValue, 0)}$`,
                isExponential
                  ? 'Dette er den lineære modellen. Prosentvis vekst gir et høyere tall.'
                  : 'Dette er den eksponentielle modellen, og den passer ikke når økningen er et fast beløp.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'ganget-perioder',
                String.raw`$f(${periods}) = ${start}\cdot ${periods} = ${start * periods}$`,
                'Startverdien skal ikke ganges med antall år.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: isExponential
            ? String.raw`$f(${periods}) \approx ${num(exponentialValue, 0)}$`
            : String.raw`$f(${periods}) = ${linearValue}$`,
          rationale: isExponential
            ? `Vekstfaktoren ${num(factor)} opphøyes i antall år.`
            : `Det faste beløpet ${amount} ganges med antall år.`,
          hint: isExponential ? `Regn ut ${num(factor)} opphøyd i ${periods}.` : `Gang ${amount} med ${periods}.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: 'start', value: start, tone: 'muted' },
              { label: `lineær etter ${periods}`, value: linearValue, tone: isExponential ? 'error' : 'correct' },
              {
                label: `eksponentiell etter ${periods}`,
                value: Math.round(exponentialValue),
                tone: isExponential ? 'correct' : 'error',
              },
            ],
            caption: 'Valget av modell endrer svaret betydelig etter noen år.',
          },
        },
        {
          kind: 'interpret',
          prompt: 'Når slutter modellen å være gyldig?',
          options: distinctOptions(
            right(
              'riktig',
              isExponential
                ? 'Når veksten ikke lenger er en fast prosent'
                : 'Når økningen ikke lenger er et fast beløp',
              'Riktig. En modell gjelder bare så lenge antakelsen den bygger på holder.'
            ),
            [
              wrong(
                'alltid',
                'Modellen gjelder alltid, fordi regnestykket er riktig',
                'Riktig regning er ikke det samme som en gyldig modell. Antakelsene må også stemme.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'negative',
                'Bare for negative verdier av $x$',
                'Negativ tid er uansett utenfor definisjonsmengden her. Spørsmålet er når antakelsen bryter sammen.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`Modellen gjelder så lenge ${isExponential ? 'prosenten' : 'beløpet'} er fast`,
          rationale:
            'Modellkritikk hører til svaret. En modell uten gyldighetsområde er et tall uten mening.',
          hint: 'Hvilken antakelse gjorde vi da vi valgte modelltype?',
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [start, amount], tone: 'accent', label: 'lineær' },
              { kind: 'exponential', coefficients: [start, factor], tone: 'primary', label: 'eksponentiell' },
            ],
            xRange: [0, periods + 6],
            caption: 'Langt ute blir forskjellen dramatisk. Da betyr modellvalget alt.',
          },
        },
      ],
      answerLatex: isExponential
        ? String.raw`$f(x) = ${start}\cdot ${num(factor)}^x$, og $f(${periods}) \approx ${num(exponentialValue, 0)}$`
        : String.raw`$f(x) = ${start} + ${amount}x$, og $f(${periods}) = ${linearValue}$`,
      takeaway: 'Fast beløp gir lineær modell. Fast prosent gir eksponentiell. Si alltid når modellen slutter å gjelde.',
    };
  },
};

export const MODELLING_TEMPLATES: readonly ExerciseTemplate[] = [
  buildModelTemplate,
  budgetTemplate,
  algorithmTemplate,
  modelChoiceTemplate,
];
