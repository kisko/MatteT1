import { Lk20Topic1T } from '../../../model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../../../model/task/Misconception.js';
import { ExerciseTemplate } from '../../../model/guided/ExerciseTemplate.js';
import {
  distinctOptions,
  intBetween,
  nonZeroIntBetween,
  num,
  pickAvoiding,
  pickFrom,
  right,
  signedNumber,
  signedTerm,
  wrong,
} from './seed.js';

const tableAndGrowthTemplate: ExerciseTemplate = {
  id: 'T-FUN-01',
  topic: Lk20Topic1T.FUNKSJONER,
  goalId: 'FUN-01',
  skillLabel: 'Tabeller og vekst',
  title: 'Funksjonsverdier og vekst',
  description: 'Regne ut funksjonsverdier og lese av veksten.',
  variantCount: 160,
  generate: (seed) => {
    const slope = nonZeroIntBetween(seed, 1, -6, 8);
    const start = intBetween(seed, 2, -8, 12);
    const input = intBetween(seed, 3, 2, 7);
    const value = slope * input + start;
    const nextValue = slope * (input + 1) + start;
    const swapped = slope * (input + start);

    return {
      id: `T-FUN-01-s${seed}`,
      topic: Lk20Topic1T.FUNKSJONER,
      goalId: 'FUN-01',
      skillLabel: 'Tabeller og vekst',
      title: 'Les funksjonen',
      situation: 'En lineær funksjon er gitt. Du skal regne ut en verdi og lese av hva tallene betyr.',
      problemLatex: String.raw`$f(x) = ${slope === 1 ? '' : slope === -1 ? '-' : slope}x ${signedNumber(start)}$`,
      steps: [
        {
          kind: 'transform',
          prompt: `Regn ut $f(${input})$.`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$f(${input}) = ${slope}\cdot ${input} ${signedNumber(start)} = ${value}$`,
              `Riktig. Sett inn ${input} for $x$, gang med ${slope}, og legg til konstantleddet.`
            ),
            [
              wrong(
                'ganget-alt',
                String.raw`$f(${input}) = ${slope}\cdot (${input} ${signedNumber(start)}) = ${swapped}$`,
                'Konstantleddet skal ikke ganges med stigningstallet. Bare $x$ ganges.'
              ),
              wrong(
                'byttet-om',
                String.raw`$f(${input}) = ${input}\cdot ${start} ${signedNumber(slope)} = ${input * start + slope}$`,
                'Stigningstallet og konstantleddet byttet roller. Det er $x$ som ganges med stigningstallet.'
              ),
            ]
          ),
          resultLatex: String.raw`$f(${input}) = ${value}$`,
          rationale: 'Å regne ut en funksjonsverdi er å sette inn tallet for $x$ og følge regnerekkefølgen.',
          hint: `Gang ${slope} med ${input} først.`,
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [start, slope], tone: 'primary', label: 'f' }],
            markers: [{ x: input, y: value, label: `(${input}, ${value})`, tone: 'correct' }],
            xRange: [Math.min(0, input - 4), input + 4],
            caption: `Punktet $(${input},\\ ${value})$ ligger på grafen.`,
          },
        },
        {
          kind: 'transform',
          prompt: `Hva blir $f(${input + 1})$, og hvor mye endret verdien seg?`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$f(${input + 1}) = ${nextValue}$, en endring på $${signedNumber(slope).replace('+ ', '')}$`,
              `Riktig. Ett skritt i $x$ endrer $f(x)$ med stigningstallet ${slope}.`
            ),
            [
              wrong(
                'endring-lik-konstant',
                String.raw`$f(${input + 1}) = ${value + start}$, en endring på $${start}$`,
                'Konstantleddet legges til én gang, ikke én gang per skritt. Endringen er stigningstallet.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'ingen-endring',
                String.raw`$f(${input + 1}) = ${value}$, ingen endring`,
                'En lineær funksjon med stigningstall ulik null endrer seg for hvert skritt.'
              ),
            ]
          ),
          resultLatex: String.raw`$f(${input + 1}) - f(${input}) = ${nextValue} - ${value} = ${slope}$`,
          rationale: `Stigningstallet er endringen i $f(x)$ per enhet $x$. Derfor er differansen alltid ${slope}.`,
          hint: 'Regn ut den nye verdien, og trekk fra den forrige.',
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [start, slope], tone: 'primary', label: 'f' }],
            markers: [
              { x: input, y: value, label: `${value}`, tone: 'accent' },
              { x: input + 1, y: nextValue, label: `${nextValue}`, tone: 'correct' },
            ],
            xRange: [Math.min(0, input - 4), input + 4],
            caption: `Ett skritt bortover gir ${slope} i høyde. Det er hele betydningen av stigningstallet.`,
          },
        },
        {
          kind: 'interpret',
          prompt: `Hva betyr tallet ${start} i funksjonen?`,
          options: distinctOptions(
            right('riktig', String.raw`Verdien når $x = 0$, altså skjæringen med $y$-aksen`, `Riktig. $f(0) = ${start}$.`),
            [
              wrong(
                'stigning',
                'Hvor mye funksjonen øker per enhet',
                `Det er stigningstallet ${slope}. Konstantleddet er startverdien.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'nullpunkt',
                String.raw`Nullpunktet til funksjonen`,
                `Nullpunktet er der $f(x) = 0$, altså $x = ${num(-start / slope)}$ her.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$f(0) = ${start}$`,
          rationale: 'I $f(x) = ax + b$ er $a$ endringen per enhet og $b$ verdien ved $x = 0$.',
          hint: 'Sett $x = 0$ inn i funksjonen.',
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [start, slope], tone: 'primary', label: 'f' }],
            markers: [{ x: 0, y: start, label: `(0, ${start})`, tone: 'correct' }],
            xRange: [-4, 6],
            caption: 'Konstantleddet er der grafen krysser $y$-aksen.',
          },
        },
      ],
      answerLatex: String.raw`$f(${input}) = ${value}$, og veksten er ${slope} per enhet`,
      takeaway: 'Stigningstallet er endring per enhet. Konstantleddet er verdien ved $x = 0$.',
    };
  },
};

const zeroPointTemplate: ExerciseTemplate = {
  id: 'T-FUN-02',
  topic: Lk20Topic1T.FUNKSJONER,
  goalId: 'FUN-02',
  skillLabel: 'Nullpunkter',
  title: 'Nullpunkter og symmetri',
  description: 'Finne nullpunkter ved faktorisering og lese av symmetrilinjen.',
  variantCount: 100,
  generate: (seed) => {
    const rootPool = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6] as const;
    const firstRoot = pickFrom(seed, 1, rootPool);
    const secondRoot = pickAvoiding(seed, 2, rootPool, [firstRoot]);
    const lowRoot = Math.min(firstRoot, secondRoot);
    const highRoot = Math.max(firstRoot, secondRoot);
    const linearCoefficient = -(firstRoot + secondRoot);
    const constant = firstRoot * secondRoot;
    const axis = (firstRoot + secondRoot) / 2;
    const vertexY = axis * axis + linearCoefficient * axis + constant;

    return {
      id: `T-FUN-02-s${seed}`,
      topic: Lk20Topic1T.FUNKSJONER,
      goalId: 'FUN-02',
      skillLabel: 'Nullpunkter',
      title: 'Finn nullpunktene',
      situation: 'Du skal finne hvor grafen krysser $x$-aksen, og hvor symmetrilinjen ligger.',
      problemLatex: String.raw`$f(x) = x^2 ${signedTerm(linearCoefficient, 'x')} ${signedNumber(constant)}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hva betyr det at grafen har et nullpunkt?',
          options: distinctOptions(
            right('null', String.raw`$f(x) = 0$`, 'Riktig. Nullpunktet er der funksjonsverdien er null.'),
            [
              wrong('x-null', String.raw`$x = 0$`, 'Det er skjæringen med $y$-aksen, ikke nullpunktet.'),
              wrong(
                'toppunkt',
                'Funksjonen har sitt minste verdi',
                'Det er bunnpunktet. Nullpunktet handler om å krysse $x$-aksen.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$x^2 ${signedTerm(linearCoefficient, 'x')} ${signedNumber(constant)} = 0$`,
          rationale: 'Grafen krysser $x$-aksen der høyden er null, altså der $f(x) = 0$.',
          hint: 'Hvilken av koordinatene er null i et nullpunkt?',
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [constant, linearCoefficient, 1], tone: 'primary', label: 'f' },
            ],
            xRange: [lowRoot - 2, highRoot + 2],
            caption: 'Vi leter etter punktene der grafen møter $x$-aksen.',
          },
        },
        {
          kind: 'transform',
          prompt: `Faktoriser og finn nullpunktene. Hvilke to tall har sum $${-linearCoefficient}$ og produkt $${constant}$?`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$(x ${signedNumber(-firstRoot)})(x ${signedNumber(-secondRoot)}) = 0 \Rightarrow x = ${lowRoot}$ eller $x = ${highRoot}$`,
              `Riktig. Faktorene er null når $x = ${lowRoot}$ og $x = ${highRoot}$.`
            ),
            [
              wrong(
                'fortegn-snudd',
                String.raw`$x = ${-lowRoot}$ eller $x = ${-highRoot}$`,
                `Faktoren $(x ${signedNumber(-firstRoot)})$ er null når $x = ${firstRoot}$, ikke $x = ${-firstRoot}$.`,
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'bare-en',
                String.raw`$x = ${highRoot}$`,
                'En andregradsfunksjon med to nullpunkter har begge som løsning.',
                MisconceptionType.FORGOT_NEGATIVE_ROOT
              ),
            ]
          ),
          resultLatex: String.raw`$x = ${lowRoot} \quad \text{eller} \quad x = ${highRoot}$`,
          rationale: 'Et produkt er null når minst én faktor er null. Hver faktor gir ett nullpunkt.',
          hint: `Let etter to tall som ganger til ${constant}.`,
          visual: {
            kind: 'numberline',
            min: lowRoot - 3,
            max: highRoot + 3,
            points: [
              { value: lowRoot, label: `${lowRoot}`, tone: 'correct' },
              { value: highRoot, label: `${highRoot}`, tone: 'correct' },
            ],
            caption: 'To nullpunkter på tallinjen.',
          },
        },
        {
          kind: 'interpret',
          prompt: 'Hvor ligger symmetrilinjen til grafen?',
          options: distinctOptions(
            right(
              'midt-mellom',
              String.raw`$x = ${num(axis)}$, midt mellom nullpunktene`,
              `Riktig. Parabelen er symmetrisk, så symmetrilinjen ligger midt mellom ${lowRoot} og ${highRoot}.`
            ),
            [
              wrong(
                'i-nullpunkt',
                String.raw`$x = ${lowRoot}$`,
                'Det er det ene nullpunktet. Symmetrilinjen ligger mellom dem.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'konstantledd',
                String.raw`$x = ${constant}$`,
                'Konstantleddet er skjæringen med $y$-aksen, ikke symmetrilinjen.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$x = ${num(axis)}$, og bunnpunktet er $(${num(axis)},\ ${num(vertexY)})$`,
          rationale:
            'Symmetrilinjen er gjennomsnittet av nullpunktene, og den treffer alltid bunnpunktet eller toppunktet.',
          hint: `Regn ut gjennomsnittet av ${lowRoot} og ${highRoot}.`,
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [constant, linearCoefficient, 1], tone: 'primary', label: 'f' },
            ],
            markers: [
              { x: lowRoot, y: 0, label: `${lowRoot}`, tone: 'accent' },
              { x: highRoot, y: 0, label: `${highRoot}`, tone: 'accent' },
              { x: axis, y: vertexY, label: 'bunnpunkt', tone: 'correct' },
            ],
            xRange: [lowRoot - 2, highRoot + 2],
            caption: 'Bunnpunktet ligger rett under midtpunktet mellom nullpunktene.',
          },
        },
      ],
      answerLatex: String.raw`Nullpunkter: $x = ${lowRoot}$ og $x = ${highRoot}$. Symmetrilinje: $x = ${num(axis)}$`,
      takeaway: 'Faktoriser for å finne nullpunktene, og husk at symmetrilinjen ligger midt mellom dem.',
    };
  },
};

const exponentialTemplate: ExerciseTemplate = {
  id: 'T-FUN-03',
  topic: Lk20Topic1T.FUNKSJONER,
  goalId: 'FUN-03',
  skillLabel: 'Eksponentialfunksjoner',
  title: 'Eksponentiell vekst',
  description: 'Finne vekstfaktor og regne ut verdien etter flere perioder.',
  variantCount: 120,
  generate: (seed) => {
    const percent = pickFrom(seed, 1, [5, 8, 10, 12, 15, 20, 25, 30] as const);
    const start = pickFrom(seed, 2, [200, 400, 500, 1000, 2000, 5000] as const);
    const periods = intBetween(seed, 3, 2, 5);
    const factor = 1 + percent / 100;
    const value = start * factor ** periods;
    const linearValue = start + (start * percent / 100) * periods;

    return {
      id: `T-FUN-03-s${seed}`,
      topic: Lk20Topic1T.FUNKSJONER,
      goalId: 'FUN-03',
      skillLabel: 'Eksponentialfunksjoner',
      title: 'Prosentvis vekst',
      situation: `En verdi starter på ${start} og vokser med ${percent} prosent per periode.`,
      problemLatex: String.raw`$f(x) = ${start}\cdot a^x$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: `Hva er vekstfaktoren når noe vokser ${percent} prosent per periode?`,
          options: distinctOptions(
            right('riktig', String.raw`$a = 1 + ${num(percent / 100)} = ${num(factor)}$`, `Riktig. Hele beløpet beholdes (1) og ${percent} prosent legges til.`),
            [
              wrong(
                'bare-prosent',
                String.raw`$a = ${num(percent / 100)}$`,
                `Da ville verdien krympet til ${percent} prosent hver periode. Ettallet må være med.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'prosenttall',
                String.raw`$a = ${percent}$`,
                `Da ganges verdien med ${percent} hver periode, altså mange tusen prosent vekst.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$f(x) = ${start}\cdot ${num(factor)}^x$`,
          rationale: `Vekstfaktoren er $1 + p$ der $p$ er den desimale prosenten. ${percent} prosent gir ${num(factor)}.`,
          hint: 'Etter én periode har du alt du hadde, pluss litt mer. Hva blir da faktoren?',
          visual: {
            kind: 'growth',
            startValue: start,
            growthFactor: factor,
            periods: Math.max(periods, 5),
            highlightPeriod: 1,
            caption: `Hver periode ganges verdien med ${num(factor)}.`,
          },
        },
        {
          kind: 'transform',
          prompt: `Hva er verdien etter ${periods} perioder?`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$f(${periods}) = ${start}\cdot ${num(factor)}^{${periods}} \approx ${num(value, 0)}$`,
              `Riktig. Vekstfaktoren opphøyes i antall perioder.`
            ),
            [
              wrong(
                'lineaert',
                String.raw`$f(${periods}) = ${start} + ${num((start * percent) / 100, 0)}\cdot ${periods} = ${num(linearValue, 0)}$`,
                'Dette er lineær vekst med et fast beløp. Prosentvis vekst regnes av en stadig større verdi.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'ganget-perioder',
                String.raw`$f(${periods}) = ${start}\cdot ${num(factor)}\cdot ${periods} = ${num(start * factor * periods, 0)}$`,
                'Vekstfaktoren skal opphøyes i antall perioder, ikke ganges med det.',
                MisconceptionType.EXPONENT_RULE_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$f(${periods}) \approx ${num(value, 0)}$`,
          rationale: `Å gange med ${num(factor)} ${periods} ganger er det samme som å opphøye i ${periods}.`,
          hint: `Regn ut ${num(factor)} opphøyd i ${periods} først.`,
          visual: {
            kind: 'growth',
            startValue: start,
            growthFactor: factor,
            periods: Math.max(periods, 5),
            highlightPeriod: periods,
            caption: `Etter ${periods} perioder er verdien omtrent ${num(value, 0)}.`,
          },
        },
        {
          kind: 'interpret',
          prompt: 'Hvorfor er kurven ikke en rett linje?',
          options: distinctOptions(
            right(
              'riktig',
              'Fordi prosenten regnes av en stadig større verdi',
              `Riktig. ${percent} prosent av ${start} er mindre enn ${percent} prosent av ${num(value, 0)}.`
            ),
            [
              wrong(
                'samme-belop',
                'Fordi verdien øker med samme beløp hver periode',
                'Da ville den vært en rett linje. Det er nettopp det prosentvis vekst ikke er.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'tilfeldig',
                'Fordi vekstfaktoren endrer seg fra periode til periode',
                `Vekstfaktoren er konstant ${num(factor)}. Det er grunnlaget den regnes av som vokser.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$${percent}\%$ av $${start}$ er mindre enn $${percent}\%$ av $${num(value, 0)}$`,
          rationale:
            'Eksponentiell vekst legger til en større og større mengde, fordi prosenten alltid regnes av dagens verdi.',
          hint: `Regn ut ${percent} prosent av ${start}, og ${percent} prosent av sluttverdien.`,
          visual: {
            kind: 'growth',
            startValue: start,
            growthFactor: factor,
            periods: Math.max(periods, 6),
            caption: 'Avstanden mellom punktene vokser. Det er signaturen til eksponentiell vekst.',
          },
        },
      ],
      answerLatex: String.raw`$f(x) = ${start}\cdot ${num(factor)}^x$ og $f(${periods}) \approx ${num(value, 0)}$`,
      takeaway: 'Vekstfaktoren er $1 + p$, og den opphøyes i antall perioder.',
    };
  },
};

const intersectionTemplate: ExerciseTemplate = {
  id: 'T-FUN-04',
  topic: Lk20Topic1T.FUNKSJONER,
  goalId: 'FUN-04',
  skillLabel: 'Skjæringspunkter',
  title: 'Skjæringspunkter',
  description: 'Finne punktet der to grafer møtes.',
  variantCount: 150,
  generate: (seed) => {
    const firstSlope = intBetween(seed, 1, 2, 9);
    const secondSlope = intBetween(seed, 2, -6, 1);
    const meetingX = intBetween(seed, 3, 1, 8);
    const firstStart = intBetween(seed, 4, -6, 10);
    const meetingY = firstSlope * meetingX + firstStart;
    const secondStart = meetingY - secondSlope * meetingX;
    const slopeDifference = firstSlope - secondSlope;
    const startDifference = secondStart - firstStart;

    return {
      id: `T-FUN-04-s${seed}`,
      topic: Lk20Topic1T.FUNKSJONER,
      goalId: 'FUN-04',
      skillLabel: 'Skjæringspunkter',
      title: 'Der grafene møtes',
      situation: 'To lineære funksjoner beskriver hver sin utvikling. Du skal finne hvor de er like store.',
      problemLatex: String.raw`$f(x) = ${firstSlope}x ${signedNumber(firstStart)}, \quad g(x) = ${secondSlope}x ${signedNumber(secondStart)}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hva betyr det at grafene skjærer hverandre?',
          options: distinctOptions(
            right('lik', String.raw`$f(x) = g(x)$`, 'Riktig. I skjæringspunktet har de samme verdi for samme $x$.'),
            [
              wrong('begge-null', String.raw`$f(x) = 0$ og $g(x) = 0$`, 'Det er nullpunktene til hver funksjon, ikke skjæringen mellom dem.'),
              wrong(
                'x-lik',
                String.raw`$x = 0$`,
                'Der finner du skjæringene med $y$-aksen. Grafene møtes et annet sted.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$${firstSlope}x ${signedNumber(firstStart)} = ${secondSlope}x ${signedNumber(secondStart)}$`,
          rationale: 'Skjæringspunktet er den ene $x$-verdien der de to uttrykkene gir samme svar.',
          hint: 'Hva er felles for de to grafene i punktet der de krysser?',
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [firstStart, firstSlope], tone: 'primary', label: 'f' },
              { kind: 'polynomial', coefficients: [secondStart, secondSlope], tone: 'accent', label: 'g' },
            ],
            xRange: [Math.min(0, meetingX - 4), meetingX + 4],
            caption: 'Grafene krysser hverandre i nøyaktig ett punkt.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Løs likningen for $x$.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$${slopeDifference}x = ${startDifference} \Rightarrow x = ${meetingX}$`,
              `Riktig. Samle $x$-leddene på én side og tallene på den andre.`
            ),
            [
              wrong(
                'feil-fortegn',
                String.raw`$${firstSlope + Math.abs(secondSlope)}x = ${-startDifference} \Rightarrow x = ${num(-startDifference / (firstSlope + Math.abs(secondSlope)))}$`,
                'Leddene skiftet ikke fortegn da de ble flyttet over likhetstegnet.',
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'glemte-koeffisient',
                String.raw`$x = ${startDifference}$`,
                `Koeffisienten ${slopeDifference} foran $x$ må divideres bort.`
              ),
            ]
          ),
          resultLatex: String.raw`$x = ${meetingX}$`,
          rationale: 'Dette er en vanlig lineær likning så snart uttrykkene er satt lik hverandre.',
          hint: `Trekk fra ${secondSlope}x på begge sider, og flytt konstantleddet.`,
          visual: {
            kind: 'numberline',
            min: Math.min(0, meetingX - 4),
            max: meetingX + 4,
            points: [{ value: meetingX, label: `x = ${meetingX}`, tone: 'correct' }],
            caption: 'Bare denne ene $x$-verdien gjør uttrykkene like.',
          },
        },
        {
          kind: 'checkResult',
          prompt: `Finn $y$-verdien og kontroller. Hva er skjæringspunktet?`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$(${meetingX},\ ${meetingY})$, fordi $f(${meetingX}) = g(${meetingX}) = ${meetingY}$`,
              'Riktig. Begge funksjonene gir samme verdi, så punktet ligger på begge grafene.'
            ),
            [
              wrong(
                'bare-x',
                String.raw`$(${meetingX},\ 0)$`,
                `Punktet ligger på begge grafene, og $f(${meetingX}) = ${meetingY}$, ikke 0.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'byttet-koordinater',
                String.raw`$(${meetingY},\ ${meetingX})$`,
                'Koordinatene står i motsatt rekkefølge. Punktet skrives $(x, y)$.'
              ),
            ]
          ),
          resultLatex: String.raw`$(${meetingX},\ ${meetingY})$`,
          rationale:
            'Et skjæringspunkt har to koordinater. Løsningen av likningen gir $x$, og innsetting gir $y$.',
          hint: `Sett $x = ${meetingX}$ inn i begge funksjonene, og sjekk at du får samme svar.`,
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [firstStart, firstSlope], tone: 'primary', label: 'f' },
              { kind: 'polynomial', coefficients: [secondStart, secondSlope], tone: 'accent', label: 'g' },
            ],
            markers: [{ x: meetingX, y: meetingY, label: `(${meetingX}, ${meetingY})`, tone: 'correct' }],
            xRange: [Math.min(0, meetingX - 4), meetingX + 4],
            caption: 'Skjæringspunktet ligger på begge grafene samtidig.',
          },
        },
      ],
      answerLatex: String.raw`Skjæringspunktet er $(${meetingX},\ ${meetingY})$`,
      takeaway: 'Sett uttrykkene lik hverandre, løs for $x$, og sett inn for å finne $y$.',
    };
  },
};

export const FUNCTION_TEMPLATES: readonly ExerciseTemplate[] = [
  tableAndGrowthTemplate,
  zeroPointTemplate,
  exponentialTemplate,
  intersectionTemplate,
];
