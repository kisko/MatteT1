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

const averageRateTemplate: ExerciseTemplate = {
  id: 'T-DER-01',
  topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
  goalId: 'DER-01',
  skillLabel: 'Gjennomsnittlig vekstfart',
  title: 'Gjennomsnittlig vekstfart',
  description: 'Regne ut endring per enhet mellom to punkter.',
  variantCount: 72,
  generate: (seed) => {
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
    const from = pickFrom(seed, 1, pool);
    const to = pickAvoiding(seed, 2, pool, [from, from - 1, from + 1]);
    const low = Math.min(from, to);
    const high = Math.max(from, to);

    // f(x) = x^2 gjør regningen ren: vekstfarten blir alltid low + high.
    const valueLow = low * low;
    const valueHigh = high * high;
    const rate = low + high;
    const heightChange = valueHigh - valueLow;
    const widthChange = high - low;

    return {
      id: `T-DER-01-s${seed}`,
      topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
      goalId: 'DER-01',
      skillLabel: 'Gjennomsnittlig vekstfart',
      title: 'Endring mellom to punkter',
      situation: `En funksjon er gitt ved $f(x) = x^2$. Du skal finne den gjennomsnittlige vekstfarten fra $x = ${low}$ til $x = ${high}$.`,
      problemLatex: String.raw`$f(x) = x^2, \quad x \in [${low},\ ${high}]$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilken formel gir gjennomsnittlig vekstfart?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$\frac{f(b) - f(a)}{b - a}$`,
              'Riktig. Endring i høyde delt på endring bortover.'
            ),
            [
              wrong(
                'opp-ned',
                String.raw`$\frac{b - a}{f(b) - f(a)}$`,
                'Brøken står opp ned. Vekstfart er høyde per bredde, ikke bredde per høyde.'
              ),
              wrong(
                'bare-differanse',
                String.raw`$f(b) - f(a)$`,
                'Dette er bare endringen i høyde. Den må deles på endringen i $x$ for å bli en fart.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$\frac{f(${high}) - f(${low})}{${high} - ${low}}$`,
          rationale: 'Gjennomsnittlig vekstfart er stigningstallet til linjen mellom de to punktene.',
          hint: 'Tenk på stigningstallet til en rett linje: hvor mye opp, delt på hvor mye bortover.',
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [0, 0, 1], tone: 'primary', label: 'f(x) = x²' }],
            markers: [
              { x: low, y: valueLow, label: `(${low}, ${valueLow})`, tone: 'accent' },
              { x: high, y: valueHigh, label: `(${high}, ${valueHigh})`, tone: 'correct' },
            ],
            xRange: [Math.min(low - 1, -1), high + 1],
            caption: 'Vi ser på linjen mellom de to markerte punktene.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Sett inn tallene og regn ut.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$\frac{${valueHigh} - ${valueLow}}{${high} - ${low}} = \frac{${heightChange}}{${widthChange}} = ${rate}$`,
              `Riktig. Vekstfarten er ${rate}.`
            ),
            [
              wrong(
                'glemte-kvadrat',
                String.raw`$\frac{${high} - ${low}}{${high} - ${low}} = 1$`,
                'Her ble $x$-verdiene brukt i telleren. Telleren skal ha funksjonsverdiene $f(x) = x^2$.'
              ),
              wrong(
                'bare-teller',
                String.raw`$${heightChange}$`,
                `Du stoppet ved endringen i høyde. Den må deles på ${widthChange}.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$\frac{${heightChange}}{${widthChange}} = ${rate}$`,
          rationale: `Fra $x = ${low}$ til $x = ${high}$ stiger funksjonen ${heightChange} over en bredde på ${widthChange}.`,
          hint: `Regn ut $f(${high}) = ${valueHigh}$ og $f(${low}) = ${valueLow}$ først.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: 'endring i høyde', value: heightChange, tone: 'primary' },
              { label: 'endring i x', value: widthChange, tone: 'accent' },
              { label: 'vekstfart', value: rate, tone: 'correct' },
            ],
            caption: `Høyde delt på bredde: ${heightChange} : ${widthChange} = ${rate}.`,
          },
        },
        {
          kind: 'interpret',
          prompt: `Hva betyr det at vekstfarten er ${rate} i dette intervallet?`,
          options: distinctOptions(
            right(
              'riktig',
              `I gjennomsnitt øker $f(x)$ med ${rate} per enhet $x$ i intervallet`,
              'Riktig. Det er et gjennomsnitt, ikke farten i et enkelt punkt.'
            ),
            [
              wrong(
                'momentan',
                `Funksjonen stiger med ${rate} i hvert punkt i intervallet`,
                'Det ville krevd en rett linje. Her er stigningen ulik fra punkt til punkt, og dette er snittet.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'verdi',
                `Funksjonsverdien er ${rate} i intervallet`,
                `Nei, $f(${low}) = ${valueLow}$ og $f(${high}) = ${valueHigh}$. ${rate} er en endringsrate.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`Gjennomsnittlig vekstfart $= ${rate}$`,
          rationale:
            'Gjennomsnittlig vekstfart beskriver hele intervallet med ett tall. Momentan vekstfart beskriver ett punkt.',
          hint: 'Er dette tallet en høyde, eller en endring per enhet?',
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [0, 0, 1], tone: 'primary', label: 'f' },
              { kind: 'polynomial', coefficients: [valueLow - rate * low, rate], tone: 'correct', label: 'snittlinje' },
            ],
            markers: [
              { x: low, y: valueLow, label: `${low}`, tone: 'accent' },
              { x: high, y: valueHigh, label: `${high}`, tone: 'accent' },
            ],
            xRange: [Math.min(low - 1, -1), high + 1],
            caption: `Den grønne linjen har stigningstall ${rate} og treffer grafen i begge punktene.`,
          },
        },
      ],
      answerLatex: String.raw`Gjennomsnittlig vekstfart $= ${rate}$`,
      takeaway: 'Gjennomsnittlig vekstfart er endring i høyde delt på endring i $x$.',
    };
  },
};

const derivationRulesTemplate: ExerciseTemplate = {
  id: 'T-DER-02',
  topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
  goalId: 'DER-02',
  skillLabel: 'Derivasjonsregler',
  title: 'Derivasjonsregler',
  description: 'Derivere et polynom ledd for ledd.',
  variantCount: 180,
  generate: (seed) => {
    const cubeCoefficient = nonZeroIntBetween(seed, 1, -4, 5);
    const linearCoefficient = nonZeroIntBetween(seed, 2, -8, 8);
    // Konstantleddet må være ulik 0, ellers blir «beholdt konstantleddet»
    // matematisk likeverdig med fasit.
    const constant = nonZeroIntBetween(seed, 3, -6, 9);
    const at = intBetween(seed, 4, 1, 3);

    const derivedCube = 3 * cubeCoefficient;
    const derivedValue = derivedCube * at * at + linearCoefficient;
    const functionValue = cubeCoefficient * at ** 3 + linearCoefficient * at + constant;
    // For noen tallkombinasjoner er f(at) tilfeldigvis lik f'(at). Da ville
    // «du brukte funksjonsverdien» vært et galt alternativ med riktig tall.
    const functionValueIsDistinct = functionValue !== derivedValue;

    return {
      id: `T-DER-02-s${seed}`,
      topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
      goalId: 'DER-02',
      skillLabel: 'Derivasjonsregler',
      title: 'Deriver polynomet',
      situation: 'Du skal derivere et tredjegradspolynom og finne stigningen i et punkt.',
      problemLatex: String.raw`$f(x) = ${cubeCoefficient === 1 ? '' : cubeCoefficient === -1 ? '-' : cubeCoefficient}x^3 ${signedTerm(linearCoefficient, 'x')} ${signedNumber(constant)}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilken regel deriverer $x^n$?',
          options: distinctOptions(
            right('riktig', String.raw`$(x^n)\prime = n\cdot x^{n-1}$`, 'Riktig. Eksponenten ned som faktor, og ny eksponent én lavere.'),
            [
              wrong(
                'glemt-faktor',
                String.raw`$(x^n)\prime = x^{n-1}$`,
                'Eksponenten skal også bli faktor foran leddet.',
                MisconceptionType.DERIVATIVE_POWER_RULE
              ),
              wrong(
                'eksponent-opp',
                String.raw`$(x^n)\prime = n\cdot x^{n+1}$`,
                'Eksponenten skal ned med én, ikke opp.',
                MisconceptionType.DERIVATIVE_POWER_RULE
              ),
            ]
          ),
          resultLatex: String.raw`$(x^n)\prime = n x^{n-1}$`,
          rationale: 'Potensregelen gjør to ting samtidig: eksponenten blir faktor, og den blir én lavere.',
          hint: 'Eksponenten har to jobber i samme steg.',
          visual: {
            kind: 'graph',
            curves: [
              {
                kind: 'polynomial',
                coefficients: [constant, linearCoefficient, 0, cubeCoefficient],
                tone: 'primary',
                label: 'f',
              },
            ],
            xRange: [-3, 3],
            caption: 'Vi leter etter stigningen til grafen, ikke høyden.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Deriver ledd for ledd. Hva er $f\\prime(x)$?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$f\prime(x) = ${derivedCube}x^2 ${signedNumber(linearCoefficient)}$`,
              `Riktig. $3\\cdot ${cubeCoefficient} = ${derivedCube}$, og konstantleddet forsvinner.`
            ),
            [
              wrong(
                'beholdt-konstant',
                String.raw`$f\prime(x) = ${derivedCube}x^2 ${signedNumber(linearCoefficient)} ${signedNumber(constant)}$`,
                'Konstantleddet deriveres til 0. En konstant endrer seg ikke.',
                MisconceptionType.DERIVATIVE_POWER_RULE
              ),
              wrong(
                'glemte-faktor',
                String.raw`$f\prime(x) = ${cubeCoefficient}x^2 ${signedNumber(linearCoefficient)}$`,
                `Faktoren 3 fra eksponenten mangler: $3\\cdot ${cubeCoefficient} = ${derivedCube}$.`,
                MisconceptionType.DERIVATIVE_POWER_RULE
              ),
              wrong(
                'beholdt-eksponent',
                String.raw`$f\prime(x) = ${derivedCube}x^3 ${signedNumber(linearCoefficient)}$`,
                'Faktoren er riktig, men eksponenten skal reduseres med 1.',
                MisconceptionType.DERIVATIVE_POWER_RULE
              ),
            ]
          ),
          resultLatex: String.raw`$f\prime(x) = ${derivedCube}x^2 ${signedNumber(linearCoefficient)}$`,
          rationale:
            'Hvert ledd deriveres for seg. Leddet med $x$ blir en konstant, og konstantleddet blir null.',
          hint: `Deriver $${cubeCoefficient}x^3$ først, så $${linearCoefficient}x$, og til slutt konstantleddet.`,
          visual: {
            kind: 'graph',
            curves: [
              {
                kind: 'polynomial',
                coefficients: [constant, linearCoefficient, 0, cubeCoefficient],
                tone: 'primary',
                label: 'f',
              },
              { kind: 'polynomial', coefficients: [linearCoefficient, 0, derivedCube], tone: 'accent', label: "f'" },
            ],
            xRange: [-3, 3],
            caption: 'Den deriverte er en ny funksjon som gir stigningen for hver $x$.',
          },
        },
        {
          kind: 'transform',
          prompt: `Regn ut $f\\prime(${at})$.`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$f\prime(${at}) = ${derivedCube}\cdot ${at * at} ${signedNumber(linearCoefficient)} = ${derivedValue}$`,
              `Riktig. $${at}^2 = ${at * at}$, og resten er regning.`
            ),
            [
              ...(functionValueIsDistinct
                ? [
                    wrong(
                      'funksjonsverdi',
                      String.raw`$f\prime(${at}) = ${functionValue}$`,
                      `Dette er $f(${at})$, altså høyden. Vi spør om stigningen.`,
                      MisconceptionType.UNIT_INTERPRETATION_ERROR
                    ),
                  ]
                : []),
              wrong(
                'kvadrerte-alt',
                String.raw`$f\prime(${at}) = (${derivedCube}\cdot ${at})^2 ${signedNumber(linearCoefficient)} = ${(derivedCube * at) ** 2 + linearCoefficient}$`,
                'Bare $x$ kvadreres, ikke hele leddet.'
              ),
            ]
          ),
          resultLatex: String.raw`$f\prime(${at}) = ${derivedValue}$`,
          rationale: 'Først deriverer du, så setter du inn. Motsatt rekkefølge gir bare et tall å derivere.',
          hint: 'Regn potensen først, deretter multiplikasjonen.',
          visual: {
            kind: 'graph',
            curves: [
              {
                kind: 'polynomial',
                coefficients: [constant, linearCoefficient, 0, cubeCoefficient],
                tone: 'primary',
                label: 'f',
                tangentAtX: at,
              },
            ],
            markers: [{ x: at, y: functionValue, label: `(${at}, ${functionValue})`, tone: 'correct' }],
            xRange: [-3, 3.5],
            caption: `Tangenten i punktet har stigningstall ${derivedValue}.`,
          },
        },
        {
          kind: 'interpret',
          prompt: `Hva betyr $f\\prime(${at}) = ${derivedValue}$?`,
          options: distinctOptions(
            right(
              'riktig',
              `Grafen ${derivedValue > 0 ? 'stiger' : 'synker'} med ${Math.abs(derivedValue)} enheter per enhet $x$ i punktet`,
              `Riktig. Fortegnet forteller retningen, og tallverdien forteller hvor bratt.`
            ),
            [
              wrong(
                'hoyde',
                `Funksjonsverdien i $x = ${at}$ er ${derivedValue}`,
                `Nei, $f(${at}) = ${functionValue}$. Den deriverte er stigningen, ikke høyden.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'ekstremalpunkt',
                `Grafen har et ekstremalpunkt i $x = ${at}$`,
                `Ekstremalpunkt krever $f\\prime(x) = 0$, og ${derivedValue} er ikke null.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$f\prime(${at}) = ${derivedValue}$ er stigningstallet i punktet $(${at},\ ${functionValue})$`,
          rationale: 'Funksjonen svarer «hvor høyt». Den deriverte svarer «hvor bratt».',
          hint: `Sammenlign $f(${at})$ og $f\\prime(${at})$.`,
          visual: {
            kind: 'graph',
            curves: [
              {
                kind: 'polynomial',
                coefficients: [constant, linearCoefficient, 0, cubeCoefficient],
                tone: 'primary',
                label: 'f',
                tangentAtX: at,
              },
            ],
            markers: [{ x: at, y: functionValue, label: `f(${at}) = ${functionValue}`, tone: 'accent' }],
            xRange: [-3, 3.5],
            caption: 'Høyden og stigningen er to ulike spørsmål om samme punkt.',
          },
        },
      ],
      answerLatex: String.raw`$f\prime(x) = ${derivedCube}x^2 ${signedNumber(linearCoefficient)}$ og $f\prime(${at}) = ${derivedValue}$`,
      takeaway: 'Deriver ledd for ledd, og sett inn etterpå. Konstantleddet forsvinner alltid.',
    };
  },
};

const tangentTemplate: ExerciseTemplate = {
  id: 'T-DER-03',
  topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
  goalId: 'DER-03',
  skillLabel: 'Tangent',
  title: 'Tangentlinjen',
  description: 'Finne likningen til tangenten i et punkt.',
  variantCount: 60,
  generate: (seed) => {
    // $x = 2$ utelates: der er $f(2)$ og $f\prime(2)$ like store, og da
    // ville distraktøren «du brukte den deriverte» hatt riktig tall.
    const at = pickFrom(seed, 1, [-4, -3, -2, -1, 1, 3, 4] as const);
    const scale = intBetween(seed, 2, 1, 3);

    // f(x) = scale * x^2  =>  f'(x) = 2*scale*x
    const pointValue = scale * at * at;
    const slope = 2 * scale * at;
    const intercept = pointValue - slope * at;

    return {
      id: `T-DER-03-s${seed}`,
      topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
      goalId: 'DER-03',
      skillLabel: 'Tangent',
      title: 'Finn tangenten',
      situation: `Funksjonen er $f(x) = ${scale === 1 ? '' : scale}x^2$. Du skal finne likningen til tangenten i punktet der $x = ${at}$.`,
      problemLatex: String.raw`$f(x) = ${scale === 1 ? '' : scale}x^2, \quad x = ${at}$`,
      steps: [
        {
          kind: 'transform',
          prompt: `Finn punktet tangenten skal gå gjennom.`,
          options: distinctOptions(
            right('riktig', String.raw`$(${at},\ ${pointValue})$`, `Riktig. $f(${at}) = ${scale}\\cdot ${at}^2 = ${pointValue}$.`),
            [
              wrong(
                'fortegnsfeil',
                String.raw`$(${at},\ ${-pointValue})$`,
                'Et kvadrat er aldri negativt. Kvadrer først, og gang med koeffisienten etterpå.',
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'brukte-derivert',
                String.raw`$(${at},\ ${slope})$`,
                `${slope} er stigningen i punktet, ikke høyden. Høyden får du fra $f(${at})$.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$(${at},\ ${pointValue})$`,
          rationale: 'Tangenten berører grafen i et punkt, så punktet må ligge på grafen.',
          hint: `Sett $x = ${at}$ inn i $f$.`,
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [0, 0, scale], tone: 'primary', label: 'f' }],
            markers: [{ x: at, y: pointValue, label: `(${at}, ${pointValue})`, tone: 'correct' }],
            xRange: [-5, 5],
            caption: 'Tangenten skal berøre grafen i nøyaktig dette punktet.',
          },
        },
        {
          kind: 'transform',
          prompt: `Finn stigningstallet til tangenten.`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$f\prime(x) = ${2 * scale}x \Rightarrow f\prime(${at}) = ${slope}$`,
              `Riktig. Den deriverte i punktet er tangentens stigningstall.`
            ),
            [
              wrong(
                'glemte-faktor',
                String.raw`$f\prime(x) = ${scale}x \Rightarrow f\prime(${at}) = ${scale * at}$`,
                `Eksponenten 2 skal bli faktor: $f\\prime(x) = ${2 * scale}x$.`,
                MisconceptionType.DERIVATIVE_POWER_RULE
              ),
              wrong(
                'brukte-verdi',
                String.raw`$f(${at}) = ${pointValue}$`,
                'Dette er høyden i punktet. Stigningstallet kommer fra den deriverte.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$f\prime(${at}) = ${slope}$`,
          rationale: 'Den deriverte i et punkt *er* tangentens stigningstall. Det er hele definisjonen.',
          hint: `Deriver $f$ først, og sett inn $x = ${at}$ etterpå.`,
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [0, 0, scale], tone: 'primary', label: 'f', tangentAtX: at },
            ],
            markers: [{ x: at, y: pointValue, label: `stigning ${slope}`, tone: 'correct' }],
            xRange: [-5, 5],
            caption: `Den stiplede linjen er tangenten. Den har stigningstall ${slope}.`,
          },
        },
        {
          kind: 'interpret',
          prompt: 'Hva blir likningen til tangenten?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$y = ${slope}x ${signedNumber(intercept)}$`,
              `Riktig. Ett punkt og ett stigningstall gir én bestemt linje.`
            ),
            [
              wrong(
                'glemte-konstant',
                String.raw`$y = ${slope}x$`,
                `Denne linjen går gjennom origo, ikke gjennom $(${at},\\ ${pointValue})$. Konstantleddet mangler.`,
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'brukte-punktet-som-konstant',
                String.raw`$y = ${slope}x ${signedNumber(pointValue)}$`,
                `Konstantleddet er ikke funksjonsverdien. Det finner du ved å sette punktet inn i $y = ax + b$.`
              ),
            ]
          ),
          resultLatex: String.raw`$y = ${slope}x ${signedNumber(intercept)}$`,
          rationale: `Sett punktet inn i $y = ax + b$: $${pointValue} = ${slope}\\cdot ${at} + b$ gir $b = ${intercept}$.`,
          hint: `Bruk $y = ${slope}x + b$, og sett inn punktet for å finne $b$.`,
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [0, 0, scale], tone: 'primary', label: 'f' },
              { kind: 'polynomial', coefficients: [intercept, slope], tone: 'correct', label: 'tangent' },
            ],
            markers: [{ x: at, y: pointValue, label: 'berøringspunkt', tone: 'accent' }],
            xRange: [-5, 5],
            caption: 'Tangenten berører grafen i punktet og har samme stigning der.',
          },
        },
      ],
      answerLatex: String.raw`$y = ${slope}x ${signedNumber(intercept)}$`,
      takeaway: 'Tangenten trenger to ting: punktet på grafen og den deriverte i punktet.',
    };
  },
};

const extremeValueTemplate: ExerciseTemplate = {
  id: 'T-DER-04',
  topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
  goalId: 'DER-04',
  skillLabel: 'Ekstremalpunkt',
  title: 'Ekstremalpunkt',
  description: 'Finne topp- og bunnpunkt med den deriverte.',
  variantCount: 96,
  generate: (seed) => {
    const opensUp = pickFrom(seed, 1, [true, false] as const);
    const leading = opensUp ? 1 : -1;
    const vertexX = nonZeroIntBetween(seed, 2, -5, 5);
    const constant = intBetween(seed, 3, -8, 10);

    // f(x) = leading*x^2 + bx + c med toppunkt/bunnpunkt i vertexX.
    const linear = -2 * leading * vertexX;
    const vertexY = leading * vertexX * vertexX + linear * vertexX + constant;
    const derivedLeading = 2 * leading;

    return {
      id: `T-DER-04-s${seed}`,
      topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
      goalId: 'DER-04',
      skillLabel: 'Ekstremalpunkt',
      title: opensUp ? 'Finn bunnpunktet' : 'Finn toppunktet',
      situation: 'Du skal finne ekstremalpunktet til en andregradsfunksjon ved å bruke den deriverte.',
      problemLatex: String.raw`$f(x) = ${leading === -1 ? '-' : ''}x^2 ${signedTerm(linear, 'x')} ${signedNumber(constant)}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hva kjennetegner et ekstremalpunkt?',
          options: distinctOptions(
            right('riktig', String.raw`$f\prime(x) = 0$`, 'Riktig. I et topp- eller bunnpunkt er tangenten vannrett.'),
            [
              wrong(
                'funksjon-null',
                String.raw`$f(x) = 0$`,
                'Det er et nullpunkt. Der krysser grafen $x$-aksen, men den snur ikke nødvendigvis.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'derivert-udefinert',
                String.raw`$f\prime(x)$ finnes ikke`,
                'For et polynom finnes den deriverte overalt. Vi leter etter der den er null.'
              ),
            ]
          ),
          resultLatex: String.raw`$f\prime(x) = 0$`,
          rationale: 'Grafen snur der stigningen er null. Før og etter har den deriverte ulikt fortegn.',
          hint: 'Hvordan ser tangenten ut i et toppunkt?',
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [constant, linear, leading], tone: 'primary', label: 'f' },
            ],
            xRange: [vertexX - 4, vertexX + 4],
            caption: `Grafen snur i ${opensUp ? 'bunnpunktet' : 'toppunktet'}. Der er tangenten vannrett.`,
          },
        },
        {
          kind: 'transform',
          prompt: 'Deriver og løs $f\\prime(x) = 0$.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$${derivedLeading}x ${signedNumber(linear)} = 0 \Rightarrow x = ${vertexX}$`,
              `Riktig. Ekstremalpunktet ligger i $x = ${vertexX}$.`
            ),
            [
              wrong(
                'glemte-faktor',
                String.raw`$${leading}x ${signedNumber(linear)} = 0 \Rightarrow x = ${num(-linear / leading)}$`,
                `Faktoren 2 fra eksponenten mangler: den deriverte er $${derivedLeading}x ${signedNumber(linear)}$.`,
                MisconceptionType.DERIVATIVE_POWER_RULE
              ),
              wrong(
                'fortegnsfeil',
                String.raw`$x = ${-vertexX}$`,
                `Sjekk fortegnet når du flytter konstantleddet over likhetstegnet.`,
                MisconceptionType.SIGN_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$x = ${vertexX}$`,
          rationale: `Den deriverte er lineær, så likningen $f\\prime(x) = 0$ har én løsning.`,
          hint: `Den deriverte er $${derivedLeading}x ${signedNumber(linear)}$. Sett den lik null.`,
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [constant, linear, leading], tone: 'primary', label: 'f' },
              { kind: 'polynomial', coefficients: [linear, derivedLeading], tone: 'accent', label: "f'" },
            ],
            markers: [{ x: vertexX, y: 0, label: "f' = 0", tone: 'correct' }],
            xRange: [vertexX - 4, vertexX + 4],
            caption: `Den deriverte krysser $x$-aksen i $x = ${vertexX}$, nøyaktig der grafen snur.`,
          },
        },
        {
          kind: 'interpret',
          prompt: `Er $(${vertexX},\\ ${vertexY})$ et toppunkt eller et bunnpunkt?`,
          options: distinctOptions(
            right(
              'riktig',
              opensUp ? 'Bunnpunkt' : 'Toppunkt',
              opensUp
                ? 'Riktig. Koeffisienten foran $x^2$ er positiv, så grafen åpner oppover.'
                : 'Riktig. Koeffisienten foran $x^2$ er negativ, så grafen åpner nedover.'
            ),
            [
              wrong(
                'motsatt',
                opensUp ? 'Toppunkt' : 'Bunnpunkt',
                `Fortegnet til koeffisienten foran $x^2$ er ${leading === 1 ? 'positivt' : 'negativt'}, så grafen åpner ${opensUp ? 'oppover' : 'nedover'}.`,
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'ingen',
                'Verken topp- eller bunnpunkt',
                'En andregradsfunksjon har alltid nøyaktig ett ekstremalpunkt.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`${opensUp ? 'Bunnpunkt' : 'Toppunkt'} i $(${vertexX},\ ${vertexY})$`,
          rationale:
            'Fortegnet foran $x^2$ avgjør om parabelen åpner opp eller ned, og dermed om ekstremalpunktet er en bunn eller en topp.',
          hint: 'Ser grafen ut som en skål eller en kuppel?',
          visual: {
            kind: 'graph',
            curves: [
              { kind: 'polynomial', coefficients: [constant, linear, leading], tone: 'primary', label: 'f' },
            ],
            markers: [
              { x: vertexX, y: vertexY, label: opensUp ? 'bunnpunkt' : 'toppunkt', tone: 'correct' },
            ],
            xRange: [vertexX - 4, vertexX + 4],
            caption: `Grafen åpner ${opensUp ? 'oppover' : 'nedover'}, og punktet er derfor et ${opensUp ? 'bunnpunkt' : 'toppunkt'}.`,
          },
        },
      ],
      answerLatex: String.raw`${opensUp ? 'Bunnpunkt' : 'Toppunkt'} i $(${vertexX},\ ${vertexY})$`,
      takeaway: 'Sett den deriverte lik null for å finne ekstremalpunktet, og bruk fortegnet foran $x^2$ til å avgjøre hvilken type det er.',
    };
  },
};

export const DERIVATIVE_TEMPLATES: readonly ExerciseTemplate[] = [
  averageRateTemplate,
  derivationRulesTemplate,
  tangentTemplate,
  extremeValueTemplate,
];
