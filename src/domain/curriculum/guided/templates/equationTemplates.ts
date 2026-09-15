import { Lk20Topic1T } from '../../../model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../../../model/task/Misconception.js';
import { ExerciseTemplate } from '../../../model/guided/ExerciseTemplate.js';
import {
  distinctOptions,
  intBetween,
  nonZeroIntBetween,
  pickAvoiding,
  pickFrom,
  right,
  signedNumber,
  signedTerm,
  wrong,
} from './seed.js';

const linearEquationTemplate: ExerciseTemplate = {
  id: 'T-LIG-01',
  topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
  goalId: 'LIG-01',
  skillLabel: 'Lineære ligninger',
  title: 'Lineære ligninger',
  description: 'Løse en ligning på formen $ax + b = c$.',
  variantCount: 200,
  generate: (seed) => {
    const coefficient = intBetween(seed, 1, 2, 9);
    const solution = intBetween(seed, 2, 1, 12);
    const constant = nonZeroIntBetween(seed, 3, -9, 9);
    const rightSide = coefficient * solution + constant;
    const movedRight = rightSide - constant;
    const wrongMovedRight = rightSide + constant;

    return {
      id: `T-LIG-01-s${seed}`,
      topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
      goalId: 'LIG-01',
      skillLabel: 'Lineære ligninger',
      title: 'Finn den ukjente',
      situation: 'Ligningen er en vekt i balanse. Du skal få $x$ til å stå alene uten å velte den.',
      problemLatex: String.raw`$${coefficient}x ${signedNumber(constant)} = ${rightSide}$`,
      steps: [
        {
          kind: 'transform',
          prompt: 'Første steg: få konstantleddet bort fra venstre side. Hvilket steg er lovlig?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$${coefficient}x = ${movedRight}$`,
              `Riktig. Du ${constant > 0 ? 'trakk fra' : 'la til'} ${Math.abs(constant)} på begge sider.`
            ),
            [
              wrong(
                'feil-fortegn',
                String.raw`$${coefficient}x = ${wrongMovedRight}$`,
                `Leddet skiftet ikke fortegn. Står det ${signedNumber(constant)} på venstre side, må du gjøre det motsatte på begge sider.`,
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'glemte-koeffisient',
                String.raw`$x = ${movedRight}$`,
                `Koeffisienten ${coefficient} står fortsatt foran $x$. Den må bort i et eget steg.`
              ),
            ]
          ),
          resultLatex: String.raw`$${coefficient}x = ${movedRight}$`,
          rationale: 'Samme operasjon på begge sider bevarer balansen. Det er hele regelen.',
          hint: `Hva må du gjøre på begge sider for at ${signedNumber(constant)} skal forsvinne?`,
          visual: {
            kind: 'balance',
            left: { terms: [`${coefficient}x`, `${signedNumber(constant)}`] },
            right: { terms: [`${rightSide}`] },
            caption: 'Vekten står i balanse. Alt du gjør på venstre skål må du gjøre på høyre.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Nå skal $x$ stå alene. Hva gjør du?',
          options: distinctOptions(
            right('riktig', String.raw`$x = \frac{${movedRight}}{${coefficient}} = ${solution}$`, `Riktig. Motsatt operasjon av å gange er å dele.`),
            [
              wrong(
                'ganget',
                String.raw`$x = ${movedRight} \cdot ${coefficient} = ${movedRight * coefficient}$`,
                'Du ganget der du skulle dele. Sett svaret inn i ligningen, og du ser at det blir for stort.'
              ),
              wrong(
                'opp-ned',
                String.raw`$x = \frac{${coefficient}}{${movedRight}}$`,
                'Brøken står opp ned. Du skal dele på tallet som står foran $x$.'
              ),
            ]
          ),
          resultLatex: String.raw`$x = ${solution}$`,
          rationale: `Begge sider deles på ${coefficient}, og vekten er fortsatt i balanse.`,
          hint: `${coefficient} like deler utgjør ${movedRight}. Hvor stor er én del?`,
          visual: {
            kind: 'numberline',
            min: Math.min(0, solution - 4),
            max: solution + 4,
            points: [{ value: solution, label: `x = ${solution}`, tone: 'correct' }],
            caption: 'Løsningen av en lineær ligning er ett bestemt punkt.',
          },
        },
        {
          kind: 'checkResult',
          prompt: `Kontroller svaret. Hva får du når du setter $x = ${solution}$ inn i den opprinnelige ligningen?`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$${coefficient}\cdot ${solution} ${signedNumber(constant)} = ${rightSide}$`,
              'Riktig. Begge sider er like, så løsningen stemmer.'
            ),
            [
              wrong(
                'glemte-konstant',
                String.raw`$${coefficient}\cdot ${solution} = ${rightSide}$`,
                `Konstantleddet ${signedNumber(constant)} må være med i kontrollen også.`
              ),
              wrong(
                'hopper-over',
                'Kontroll er ikke nødvendig når regningen er gjort riktig',
                'Kontrollen tar ti sekunder og fanger nesten alle fortegnsfeil.'
              ),
            ]
          ),
          resultLatex: String.raw`$${rightSide} = ${rightSide}$`,
          rationale: 'Innsetting er den eneste kontrollen som virkelig avgjør om løsningen er riktig.',
          hint: `Regn ut $${coefficient}\\cdot ${solution}$ først, og legg til konstantleddet etterpå.`,
          visual: {
            kind: 'balance',
            left: { terms: [`${coefficient}·${solution}`, `${signedNumber(constant)}`] },
            right: { terms: [`${rightSide}`] },
            caption: 'Med løsningen satt inn står vekten fortsatt i balanse.',
          },
        },
      ],
      answerLatex: String.raw`$x = ${solution}$`,
      takeaway: 'Rydd bort konstantleddet først, del på koeffisienten etterpå, og kontroller med innsetting.',
    };
  },
};

const quadraticEquationTemplate: ExerciseTemplate = {
  id: 'T-LIG-02',
  topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
  goalId: 'LIG-02',
  skillLabel: 'Andregradslikninger',
  title: 'Andregradslikninger',
  description: 'Bruke abc-formelen og tolke diskriminanten.',
  variantCount: 120,
  generate: (seed) => {
    // Røttene velges uten 0, og slik at summen ikke blir 0. Det holder både
    // $b$ og $c$ unna null, som ellers ville gjort distraktørene identiske
    // med fasit (D = b^2 når c = 0).
    const rootPool = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6] as const;
    const firstRoot = pickFrom(seed, 1, rootPool);
    const secondRoot = pickAvoiding(seed, 2, rootPool, [firstRoot, -firstRoot]);

    // x^2 + bx + c = 0 med røttene over.
    const b = -(firstRoot + secondRoot);
    const c = firstRoot * secondRoot;
    const discriminant = b * b - 4 * c;
    const wrongDiscriminant = b * b + 4 * c;
    const rootDistance = Math.abs(firstRoot - secondRoot);
    const lowRoot = Math.min(firstRoot, secondRoot);
    const highRoot = Math.max(firstRoot, secondRoot);

    return {
      id: `T-LIG-02-s${seed}`,
      topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
      goalId: 'LIG-02',
      skillLabel: 'Andregradslikninger',
      title: 'Løs med abc-formelen',
      situation: 'Du skal løse en andregradslikning og tolke hva diskriminanten forteller.',
      problemLatex: String.raw`$x^2 ${signedTerm(b, 'x')} ${signedNumber(c)} = 0$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hva er $a$, $b$ og $c$ i denne likningen?',
          options: distinctOptions(
            right('riktig', String.raw`$a = 1, \quad b = ${b}, \quad c = ${c}$`, 'Riktig. Fortegnene leses med, ikke bort.'),
            [
              wrong(
                'snudde-fortegn',
                String.raw`$a = 1, \quad b = ${-b}, \quad c = ${-c}$`,
                'Fortegnene ble snudd. Koeffisientene leses av med det fortegnet de har i likningen.',
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'byttet-om',
                String.raw`$a = ${b}, \quad b = ${c}, \quad c = 1$`,
                'Rekkefølgen er $ax^2 + bx + c$: $a$ hører til $x^2$, $b$ til $x$, og $c$ står alene.'
              ),
            ]
          ),
          resultLatex: String.raw`$a = 1, \quad b = ${b}, \quad c = ${c}$`,
          rationale: 'abc-formelen virker bare hvis koeffisientene leses med riktig fortegn.',
          hint: 'Skriv likningen som $1\\cdot x^2 + bx + c = 0$ og les av.',
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [c, b, 1], tone: 'primary', label: 'venstre side' }],
            xRange: [lowRoot - 2, highRoot + 2],
            caption: 'Løsningene er der grafen krysser $x$-aksen.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Regn ut diskriminanten $D = b^2 - 4ac$.',
          options: distinctOptions(
            right('riktig', String.raw`$D = ${discriminant}$`, `Riktig. $(${b})^2 - 4\\cdot 1\\cdot (${c}) = ${discriminant}$.`),
            [
              wrong(
                'feil-fortegn',
                String.raw`$D = ${wrongDiscriminant}$`,
                `Her ble $4ac$ lagt til i stedet for trukket fra. Formelen er $b^2 - 4ac$.`,
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'glemte-4ac',
                String.raw`$D = ${b * b}$`,
                'Bare $b^2$ er regnet ut. Leddet $4ac$ mangler.'
              ),
            ]
          ),
          resultLatex: String.raw`$D = (${b})^2 - 4\cdot 1\cdot (${c}) = ${discriminant}$`,
          rationale: `$D > 0$ betyr to reelle løsninger, $D = 0$ én, og $D < 0$ ingen. Her er $D = ${discriminant}$.`,
          hint: 'Kvadrer $b$ først. Husk at kvadratet av et negativt tall er positivt.',
          visual: {
            kind: 'bars',
            bars: [
              { label: 'b²', value: b * b, tone: 'primary' },
              { label: '4ac', value: Math.abs(4 * c), tone: 'accent' },
              { label: 'D', value: Math.abs(discriminant), tone: 'correct' },
            ],
            caption: `Diskriminanten avgjør hvor mange løsninger likningen har.`,
          },
        },
        {
          kind: 'transform',
          prompt: `Sett inn i abc-formelen. Hva blir løsningene?`,
          options: distinctOptions(
            right('riktig', String.raw`$x = ${lowRoot}$ eller $x = ${highRoot}$`, `Riktig. $\\sqrt{${discriminant}} = ${rootDistance}$ gir de to løsningene.`),
            [
              wrong(
                'bare-en',
                String.raw`$x = ${highRoot}$`,
                'Kvadratroten gir både pluss og minus, så likningen har to løsninger.',
                MisconceptionType.FORGOT_NEGATIVE_ROOT
              ),
              wrong(
                'snudd-fortegn',
                String.raw`$x = ${-lowRoot}$ eller $x = ${-highRoot}$`,
                `Formelen starter med $-b$, og her er $b = ${b}$. Sjekk fortegnet før du deler.`,
                MisconceptionType.SIGN_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$x = \frac{${-b} \pm ${rootDistance}}{2} \Rightarrow x = ${lowRoot} \ \text{eller} \ x = ${highRoot}$`,
          rationale: 'Pluss-minus i formelen er nettopp det som gir de to løsningene.',
          hint: `$\\sqrt{${discriminant}} = ${rootDistance}$. Regn ut med pluss først, og med minus etterpå.`,
          visual: {
            kind: 'numberline',
            min: lowRoot - 3,
            max: highRoot + 3,
            points: [
              { value: lowRoot, label: `x = ${lowRoot}`, tone: 'correct' },
              { value: highRoot, label: `x = ${highRoot}`, tone: 'correct' },
            ],
            caption: 'To løsninger, ett for hvert fortegn i pluss-minus.',
          },
        },
        {
          kind: 'interpret',
          prompt: `Hva forteller $D = ${discriminant}$ om grafen?`,
          options: distinctOptions(
            right(
              'riktig',
              'Grafen krysser $x$-aksen i to punkter',
              `Riktig. $D = ${discriminant} > 0$ betyr to reelle nullpunkter.`
            ),
            [
              wrong(
                'toppunkt',
                'Grafen har toppunkt i $x = D$',
                'Diskriminanten sier noe om *antall* løsninger, ikke hvor toppunktet ligger.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'ingen',
                'Grafen krysser aldri $x$-aksen',
                `Det ville krevd $D < 0$, men her er $D = ${discriminant}$.`
              ),
            ]
          ),
          resultLatex: String.raw`$D = ${discriminant} > 0 \Rightarrow$ to nullpunkter`,
          rationale:
            'Diskriminanten er en snarvei: du ser hvor mange løsninger som finnes før du regner dem ut.',
          hint: 'Er D positiv, null eller negativ?',
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [c, b, 1], tone: 'primary', label: 'grafen' }],
            markers: [
              { x: lowRoot, y: 0, label: `${lowRoot}`, tone: 'correct' },
              { x: highRoot, y: 0, label: `${highRoot}`, tone: 'correct' },
            ],
            xRange: [lowRoot - 2, highRoot + 2],
            caption: 'To skjæringspunkter med $x$-aksen, akkurat som diskriminanten lovet.',
          },
        },
      ],
      answerLatex: String.raw`$x = ${lowRoot}$ eller $x = ${highRoot}$`,
      takeaway: 'Les av $a$, $b$ og $c$ med fortegn, regn ut $D$, og husk at pluss-minus gir to løsninger.',
    };
  },
};

const inequalityTemplate: ExerciseTemplate = {
  id: 'T-LIG-03',
  topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
  goalId: 'LIG-03',
  skillLabel: 'Fortegnsskjema',
  title: 'Ulikheter',
  description: 'Løse en ulikhet der du må dele på et negativt tall.',
  variantCount: 128,
  generate: (seed) => {
    const coefficient = intBetween(seed, 1, 2, 9);
    const boundary = nonZeroIntBetween(seed, 2, -8, 8);
    const rightSide = -coefficient * boundary;
    const testValue = boundary - 1;
    const testResult = -coefficient * testValue;

    return {
      id: `T-LIG-03-s${seed}`,
      topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
      goalId: 'LIG-03',
      skillLabel: 'Fortegnsskjema',
      title: 'Løs ulikheten',
      situation: 'Du skal løse en ulikhet der koeffisienten foran $x$ er negativ.',
      problemLatex: String.raw`$-${coefficient}x > ${rightSide}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: `Du skal dele begge sider på $-${coefficient}$. Hva må du huske?`,
          options: distinctOptions(
            right('snu', 'Ulikhetstegnet må snu', 'Riktig. Deler du på et negativt tall, speilvendes tallinjen, og tegnet snur.'),
            [
              wrong(
                'ingenting',
                'Ingenting endres, tegnet står som det står',
                'Prøv med et tall: $-2 > -4$, men delt på $-2$ blir $1 > 2$, som er galt. Tegnet må snu.',
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'begge-fortegn',
                'Fortegnet på begge sider skal snu, men tegnet står',
                'Det er ulikhetstegnet som snur. Fortegnene følger av divisjonen.',
                MisconceptionType.SIGN_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$-${coefficient}x > ${rightSide} \quad \Rightarrow \quad x < \frac{${rightSide}}{-${coefficient}}$`,
          rationale:
            'Å gange eller dele med et negativt tall bytter om på rekkefølgen av tallene, og da må retningen på tegnet bytte også.',
          hint: 'Test regelen på en ulikhet du kan svaret på, for eksempel $-2 > -4$.',
          visual: {
            kind: 'numberline',
            min: Math.min(boundary, 0) - 4,
            max: Math.max(boundary, 0) + 4,
            points: [{ value: boundary, label: `${boundary}`, tone: 'accent', open: true }],
            caption: 'Grensen er det samme punktet uansett. Det er hvilken side som gjelder som avhenger av tegnet.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Del på koeffisienten og skriv løsningen.',
          options: distinctOptions(
            right('riktig', String.raw`$x < ${boundary}$`, `Riktig. $${rightSide} : (-${coefficient}) = ${boundary}$, og tegnet snudde.`),
            [
              wrong(
                'glemte-snu',
                String.raw`$x > ${boundary}$`,
                'Tallet er riktig, men tegnet snudde ikke. Det er den vanligste feilen i ulikheter.',
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'feil-fortegn',
                String.raw`$x < ${-boundary}$`,
                `Fortegnet på tallet ble feil: $${rightSide} : (-${coefficient}) = ${boundary}$.`,
                MisconceptionType.SIGN_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$x < ${boundary}$`,
          rationale: 'Divisjonen gir tallet, og regelen om negativ divisor gir retningen.',
          hint: `Regn ut $${rightSide} : (-${coefficient})$, og snu så tegnet.`,
          visual: {
            kind: 'numberline',
            min: boundary - 6,
            max: boundary + 6,
            points: [{ value: boundary, label: `${boundary}`, tone: 'accent', open: true }],
            intervals: [{ from: boundary - 6, to: boundary, label: `x < ${boundary}`, tone: 'correct' }],
            caption: 'Løsningen er et helt område på tallinjen, ikke ett tall.',
          },
        },
        {
          kind: 'checkResult',
          prompt: `Test løsningen med $x = ${testValue}$. Stemmer den?`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$-${coefficient}\cdot ${testValue} = ${testResult}$, og $${testResult} > ${rightSide}$`,
              `Riktig. Et tall fra løsningsområdet gjør ulikheten sann, så svaret stemmer.`
            ),
            [
              wrong(
                'feil-regning',
                String.raw`$-${coefficient}\cdot ${testValue} = ${-testResult}$`,
                `Sjekk fortegnsregelen: $-${coefficient}\\cdot ${testValue} = ${testResult}$.`,
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'unodvendig',
                'Ulikheter kan ikke kontrolleres ved innsetting',
                'De kan det, og det er den raskeste måten å avdekke et tegn som ikke snudde.'
              ),
            ]
          ),
          resultLatex: String.raw`$${testResult} > ${rightSide}$, altså er $x < ${boundary}$ riktig`,
          rationale:
            'Velg ett tall fra løsningsområdet og sett det inn. Blir ulikheten sann, har du valgt riktig side.',
          hint: `Regn ut venstre side for $x = ${testValue}$, og sammenlign med ${rightSide}.`,
          visual: {
            kind: 'numberline',
            min: boundary - 6,
            max: boundary + 6,
            points: [
              { value: boundary, label: `${boundary}`, tone: 'accent', open: true },
              { value: testValue, label: `test: ${testValue}`, tone: 'correct' },
            ],
            intervals: [{ from: boundary - 6, to: boundary, label: 'sann her', tone: 'correct' }],
            caption: 'Testtallet ligger inne i området, og ulikheten blir sann.',
          },
        },
      ],
      answerLatex: String.raw`$x < ${boundary}$`,
      takeaway: 'Deler du en ulikhet på et negativt tall, snur tegnet. Test alltid med ett tall etterpå.',
    };
  },
};

export const EQUATION_TEMPLATES: readonly ExerciseTemplate[] = [
  linearEquationTemplate,
  quadraticEquationTemplate,
  inequalityTemplate,
];
