import { Lk20Topic1T } from '../../model/task/value-objects/Lk20Category.js';
import { ExplorationLabDefinition, ExplorationValues } from '../../model/exploration/ExplorationTypes.js';
import { num, signedNumber, signedTerm } from '../guided/templates/seed.js';

/**
 * Innholdsbanken for Utforskerlab.
 *
 * Mesterlab går én vei: her er metoden, gjør den. Utforskerlab går motsatt vei:
 * dra i årsaken, se virkningen. Oppdragene er det som gjør leken målrettet –
 * «fjern nullpunktene» er noe modellen selv kan bekrefte, så eleven trenger
 * ingen fasit for å vite at hen har fått det til.
 */

/** Flyttallssammenligning. Glidebryterne bruker halve steg, så eksakt likhet er upålitelig. */
const isNear = (value: number, target: number, tolerance = 1e-9): boolean =>
  Math.abs(value - target) < tolerance;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const factorisationLab: ExplorationLabDefinition = {
  id: 'E-ALG-01',
  topic: Lk20Topic1T.TALL_OG_ALGEBRA,
  goalId: 'ALG-02',
  skillLabel: 'Faktorisering',
  title: 'Faktorene og grafen',
  bigQuestion: 'Hva skjer med uttrykket og grafen når du endrer faktorene?',
  description:
    'Dra i de to tallene i parentesene, og se hvordan nullpunktene, x-leddet og konstantleddet følger etter.',
  parameters: [
    { id: 'p', label: 'Første faktor', meaning: 'Tallet i den første parentesen.', min: -6, max: 6, step: 1, initial: 2 },
    { id: 'q', label: 'Andre faktor', meaning: 'Tallet i den andre parentesen.', min: -6, max: 6, step: 1, initial: -3 },
  ],
  modelLatex: ({ p, q }) =>
    String.raw`$f(x) = (x ${signedNumber(p)})(x ${signedNumber(q)}) = x^2 ${signedTerm(p + q, 'x')} ${signedNumber(p * q)}$`,
  buildVisual: ({ p, q }) => ({
    kind: 'graph',
    curves: [{ kind: 'polynomial', coefficients: [p * q, p + q, 1], tone: 'primary', label: 'f' }],
    markers: [
      { x: -p, y: 0, label: `x = ${num(-p)}`, tone: 'correct' },
      { x: -q, y: 0, label: `x = ${num(-q)}`, tone: 'accent' },
    ],
    xRange: [Math.min(-p, -q) - 3, Math.max(-p, -q) + 3],
    caption: 'Nullpunktene ligger der hver av faktorene blir null.',
  }),
  derive: ({ p, q }) => [
    { id: 'expanded', label: 'Utvidet form', value: String.raw`$x^2 ${signedTerm(p + q, 'x')} ${signedNumber(p * q)}$`, tone: 'primary' },
    { id: 'sum', label: 'x-leddet er summen', value: `$${num(p)} + ${num(q)} = ${num(p + q)}$`, tone: 'accent' },
    { id: 'product', label: 'Konstantleddet er produktet', value: `$${num(p)} \\cdot ${num(q)} = ${num(p * q)}$`, tone: 'accent' },
    { id: 'roots', label: 'Nullpunkter', value: `$x = ${num(-p)}$ og $x = ${num(-q)}$`, tone: 'correct' },
  ],
  claims: [
    {
      id: 'sum-true',
      text: 'x-leddet er summen av de to tallene i parentesene.',
      isTrue: true,
      explanation: 'Riktig. Kryssproduktene gir $px + qx = (p+q)x$.',
    },
    {
      id: 'constant-sum',
      text: 'Konstantleddet er også summen av de to tallene.',
      isTrue: false,
      explanation: 'Nei, konstantleddet er produktet $p \\cdot q$. Prøv $p = 2$ og $q = 3$: summen er 5, men konstantleddet er 6.',
    },
    {
      id: 'roots-are-pq',
      text: 'Nullpunktene er nøyaktig de to tallene i parentesene.',
      isTrue: false,
      explanation: 'Nei, de har motsatt fortegn. $(x + 2)$ er null når $x = -2$.',
    },
    {
      id: 'double-root',
      text: 'Hvis de to tallene er like, får grafen bare ett nullpunkt.',
      isTrue: true,
      explanation: 'Riktig. Da faller nullpunktene sammen, og grafen berører $x$-aksen i ett punkt.',
    },
  ],
  missions: [
    {
      id: 'no-x-term',
      prompt: 'Lag et uttrykk uten x-ledd.',
      hint: 'x-leddet er summen av de to tallene. Når blir en sum null?',
      successMessage: 'Der ja: to motsatte tall gir konjugatsetningen $x^2 - k^2$.',
      isAccomplished: ({ p, q }) => isNear(p + q, 0),
    },
    {
      id: 'negative-constant',
      prompt: 'Lag et uttrykk der konstantleddet er negativt.',
      hint: 'Konstantleddet er produktet. Når blir et produkt negativt?',
      successMessage: 'Riktig: ett positivt og ett negativt tall gir negativt produkt.',
      isAccomplished: ({ p, q }) => p * q < 0,
    },
    {
      id: 'double-root',
      prompt: 'Lag en graf med dobbelt nullpunkt.',
      hint: 'Hva må være sant om de to faktorene for at nullpunktene skal falle sammen?',
      successMessage: 'Nå berører grafen $x$-aksen i bare ett punkt.',
      isAccomplished: ({ p, q }) => isNear(p, q),
    },
    {
      id: 'specific-roots',
      prompt: 'Lag nullpunkter i $x = 2$ og $x = -3$.',
      hint: 'Faktoren $(x + p)$ er null når $x = -p$. Hvilke $p$ trengs?',
      successMessage: 'Presist. Nullpunktene styres direkte av faktorene.',
      isAccomplished: ({ p, q }) =>
        (isNear(p, -2) && isNear(q, 3)) || (isNear(p, 3) && isNear(q, -2)),
    },
  ],
  insight:
    'Faktorisert form viser nullpunktene, og utvidet form viser summen og produktet. Samme funksjon, to ulike historier.',
};

const balanceLab: ExplorationLabDefinition = {
  id: 'E-LIG-01',
  topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
  goalId: 'LIG-01',
  skillLabel: 'Lineære ligninger',
  title: 'Balansen i en ligning',
  bigQuestion: 'Hvordan påvirker hvert tall i ligningen løsningen?',
  description:
    'Endre koeffisienten, konstantleddet og høyresiden. Se hvordan løsningen flytter seg, og når den slutter å være et helt tall.',
  parameters: [
    { id: 'a', label: 'Koeffisient a', meaning: 'Tallet foran x.', min: 1, max: 8, step: 1, initial: 3 },
    { id: 'b', label: 'Konstantledd b', meaning: 'Tallet på venstre side.', min: -10, max: 10, step: 1, initial: 4 },
    { id: 'c', label: 'Høyre side c', meaning: 'Det venstre side skal være lik.', min: -10, max: 20, step: 1, initial: 19 },
  ],
  modelLatex: ({ a, b, c }) => String.raw`$${num(a)}x ${signedNumber(b)} = ${num(c)}$`,
  buildVisual: ({ a, b, c }) => ({
    kind: 'balance',
    left: { terms: [`${num(a)}x`, signedNumber(b)] },
    right: { terms: [num(c)] },
    caption: 'Vekten står i balanse. Alt du gjør på én side må du gjøre på den andre.',
  }),
  derive: ({ a, b, c }) => {
    const solution = (c - b) / a;
    return [
      { id: 'solution', label: 'Løsning', value: `$x = \\frac{${num(c)} - (${num(b)})}{${num(a)}} = ${num(solution, 3)}$`, tone: 'correct' },
      { id: 'moved', label: 'Etter flytting', value: `$${num(a)}x = ${num(c - b)}$`, tone: 'primary' },
      { id: 'check', label: 'Kontroll', value: `$${num(a)} \\cdot ${num(solution, 3)} ${signedNumber(b)} = ${num(a * solution + b, 3)}$`, tone: 'accent' },
      {
        id: 'integer',
        label: 'Heltall?',
        value: Number.isInteger(solution) ? 'ja' : 'nei, løsningen er en brøk',
        tone: Number.isInteger(solution) ? 'correct' : 'error',
      },
    ];
  },
  claims: [
    {
      id: 'increase-c',
      text: 'Hvis du øker høyresiden c, blir løsningen større.',
      isTrue: true,
      explanation: 'Riktig, så lenge a er positiv. Mer på høyre side krever en større x for å holde balansen.',
    },
    {
      id: 'increase-b',
      text: 'Hvis du øker konstantleddet b, blir løsningen større.',
      isTrue: false,
      explanation: 'Nei, motsatt. Et større b betyr at mindre er igjen til x-leddet, så løsningen blir mindre.',
    },
    {
      id: 'always-integer',
      text: 'Løsningen av en lineær ligning er alltid et helt tall.',
      isTrue: false,
      explanation: 'Nei. Når $c - b$ ikke er delelig med a, blir løsningen en brøk. Prøv $a = 3$, $b = 0$, $c = 1$.',
    },
    {
      id: 'double-both',
      text: 'Hvis du ganger begge sider med 2, endres løsningen.',
      isTrue: false,
      explanation: 'Nei. Samme operasjon på begge sider bevarer balansen, og dermed løsningen.',
    },
  ],
  missions: [
    {
      id: 'solution-five',
      prompt: 'Gjør løsningen nøyaktig $x = 5$.',
      hint: 'Løsningen er $(c - b)/a$. Hva må $c - b$ være når a er valgt?',
      successMessage: 'Presist. Du styrte løsningen ved å styre differansen $c - b$.',
      isAccomplished: ({ a, b, c }) => isNear((c - b) / a, 5),
    },
    {
      id: 'solution-negative',
      prompt: 'Gjør løsningen negativ.',
      hint: 'Når blir $c - b$ negativ?',
      successMessage: 'Riktig. Høyresiden er nå mindre enn konstantleddet.',
      isAccomplished: ({ a, b, c }) => (c - b) / a < 0,
    },
    {
      id: 'solution-zero',
      prompt: 'Gjør løsningen $x = 0$.',
      hint: 'Hva må være sant om b og c for at x-leddet skal forsvinne helt?',
      successMessage: 'Riktig. Når $b = c$, er ligningen alt i balanse uten x.',
      isAccomplished: ({ b, c }) => isNear(b, c),
    },
    {
      id: 'solution-fraction',
      prompt: 'Gjør løsningen til en brøk som ikke er et helt tall.',
      hint: 'Velg en a som ikke går opp i $c - b$.',
      successMessage: 'Slik er de fleste ligninger i virkeligheten. Svaret må skrives som brøk eller desimaltall.',
      isAccomplished: ({ a, b, c }) => !Number.isInteger((c - b) / a),
    },
  ],
  insight:
    'Løsningen er $(c-b)/a$. Konstantleddet flyttes først, og deretter deles det på koeffisienten.',
};

const parabolaLab: ExplorationLabDefinition = {
  id: 'E-FUN-01',
  topic: Lk20Topic1T.FUNKSJONER,
  goalId: 'FUN-02',
  skillLabel: 'Parametre',
  title: 'Andregradsfunksjonen',
  bigQuestion: 'Hva gjør hver av koeffisientene $a$, $b$ og $c$ med grafen?',
  description:
    'Endre én koeffisient om gangen. Følg toppunktet, nullpunktene og diskriminanten mens du drar.',
  parameters: [
    { id: 'a', label: 'Koeffisient a', meaning: 'Åpningen: retning og bredde.', min: -3, max: 3, step: 0.5, initial: -1 },
    { id: 'b', label: 'Koeffisient b', meaning: 'Flytter symmetriaksen sidelengs.', min: -6, max: 6, step: 0.5, initial: 2 },
    { id: 'c', label: 'Konstantledd c', meaning: 'Skjæringen med y-aksen.', min: -8, max: 8, step: 0.5, initial: 3 },
  ],
  animatedParameterId: 'c',
  modelLatex: ({ a, b, c }) =>
    isNear(a, 0)
      ? String.raw`$f(x) = ${num(b)}x ${signedNumber(c)}$ (lineær, siden $a = 0$)`
      : String.raw`$f(x) = ${num(a)}x^2 ${signedTerm(b, 'x')} ${signedNumber(c)}$`,
  buildVisual: ({ a, b, c }) => {
    const vertexX = isNear(a, 0) ? null : -b / (2 * a);
    const discriminant = b * b - 4 * a * c;
    const roots =
      isNear(a, 0) || discriminant < 0
        ? []
        : [(-b - Math.sqrt(discriminant)) / (2 * a), (-b + Math.sqrt(discriminant)) / (2 * a)];

    return {
      kind: 'graph',
      curves: [{ kind: 'polynomial', coefficients: [c, b, a], tone: 'primary', label: 'f' }],
      markers: [
        ...(vertexX !== null
          ? [
              {
                x: vertexX,
                y: a * vertexX * vertexX + b * vertexX + c,
                label: a > 0 ? 'bunnpunkt' : 'toppunkt',
                tone: 'accent' as const,
              },
            ]
          : []),
        ...roots.map((root) => ({ x: root, y: 0, label: `x = ${num(root, 1)}`, tone: 'correct' as const })),
      ],
      xRange: [-6, 6],
      caption:
        roots.length === 0
          ? 'Ingen nullpunkter: grafen krysser ikke x-aksen.'
          : 'Toppunktet og nullpunktene flytter seg når du drar i koeffisientene.',
    };
  },
  derive: ({ a, b, c }) => {
    const discriminant = b * b - 4 * a * c;
    const vertexX = isNear(a, 0) ? null : -b / (2 * a);
    const vertexY = vertexX === null ? null : a * vertexX * vertexX + b * vertexX + c;
    const rootCount = isNear(a, 0) ? (isNear(b, 0) ? 0 : 1) : discriminant < 0 ? 0 : isNear(discriminant, 0) ? 1 : 2;

    return [
      {
        id: 'discriminant',
        label: 'Diskriminant',
        value: `$D = ${num(discriminant, 2)}$`,
        tone: discriminant < 0 ? 'error' : 'correct',
      },
      {
        id: 'roots',
        label: 'Antall nullpunkter',
        value: `${rootCount}`,
        tone: rootCount === 0 ? 'error' : 'correct',
      },
      {
        id: 'vertex',
        label: a > 0 ? 'Bunnpunkt' : 'Toppunkt',
        value:
          vertexX === null
            ? 'ikke relevant når $a = 0$'
            : `$(${num(vertexX, 2)},\\ ${num(vertexY ?? 0, 2)})$`,
        tone: 'accent',
      },
      { id: 'y-intercept', label: 'Skjæring med y-aksen', value: `$(0,\\ ${num(c)})$`, tone: 'primary' },
      {
        id: 'opening',
        label: 'Åpning',
        value: isNear(a, 0) ? 'ingen, grafen er en rett linje' : a > 0 ? 'oppover' : 'nedover',
        tone: 'muted',
      },
    ];
  },
  claims: [
    {
      id: 'c-is-y',
      text: 'c er alltid y-verdien der grafen krysser y-aksen.',
      isTrue: true,
      explanation: 'Riktig. $f(0) = c$, uansett hva a og b er.',
    },
    {
      id: 'c-decides-vertex',
      text: 'c bestemmer hvor toppunktet ligger.',
      isTrue: false,
      explanation:
        'Nei. x-koordinaten til toppunktet er $-b/(2a)$, og c er ikke med. c løfter bare hele grafen opp eller ned.',
    },
    {
      id: 'negative-d',
      text: 'Når diskriminanten er negativ, har grafen ingen nullpunkter.',
      isTrue: true,
      explanation: 'Riktig. En negativ diskriminant betyr at abc-formelen krever roten av et negativt tall.',
    },
    {
      id: 'smaller-a-lower-vertex',
      text: 'Når a blir mindre, blir toppunktet alltid lavere.',
      isTrue: false,
      explanation:
        'Nei. Toppunktet avhenger av a, b og c sammen. Dra i a med $b = 0$ og se at toppunktet står stille.',
    },
  ],
  missions: [
    {
      id: 'no-roots',
      prompt: 'Fjern nullpunktene helt.',
      hint: 'Se på diskriminanten. Hva må være sant om $b^2 - 4ac$?',
      successMessage: 'Riktig. Negativ diskriminant betyr at grafen aldri møter x-aksen.',
      isAccomplished: ({ a, b, c }) => !isNear(a, 0) && b * b - 4 * a * c < 0,
    },
    {
      id: 'one-root',
      prompt: 'Lag nøyaktig ett nullpunkt.',
      hint: 'Ett nullpunkt betyr at diskriminanten er nøyaktig null.',
      successMessage: 'Presist. Nå berører grafen x-aksen i toppunktet.',
      isAccomplished: ({ a, b, c }) => !isNear(a, 0) && isNear(b * b - 4 * a * c, 0, 1e-6),
    },
    {
      id: 'axis-at-minus-two',
      prompt: 'Flytt symmetriaksen til $x = -2$.',
      hint: 'Symmetriaksen er $-b/(2a)$. Velg a først, og finn b etterpå.',
      successMessage: 'Riktig. Symmetriaksen styres av a og b i samspill, aldri av c.',
      isAccomplished: ({ a, b }) => !isNear(a, 0) && isNear(-b / (2 * a), -2, 1e-6),
    },
    {
      id: 'make-linear',
      prompt: 'Gjør funksjonen lineær.',
      hint: 'Hvilken koeffisient gjør uttrykket til en andregradsfunksjon i det hele tatt?',
      successMessage: 'Nettopp. Uten $x^2$-leddet er det ikke lenger en andregradsfunksjon.',
      isAccomplished: ({ a }) => isNear(a, 0),
    },
  ],
  insight:
    'a bestemmer åpningen, b flytter symmetriaksen, og c løfter grafen. Diskriminanten teller nullpunktene før du regner dem ut.',
};

const tangentLab: ExplorationLabDefinition = {
  id: 'E-DER-01',
  topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
  goalId: 'DER-03',
  skillLabel: 'Tangent',
  title: 'Tangenten og den deriverte',
  bigQuestion: 'Hvordan henger tangentens stigning sammen med den deriverte?',
  description:
    'Flytt berøringspunktet langs grafen, og endre hvor bratt parabelen er. Følg stigningstallet mens du drar.',
  parameters: [
    { id: 'a', label: 'Koeffisient a', meaning: 'Hvor bratt parabelen $f(x) = ax^2$ er.', min: -2, max: 2, step: 0.5, initial: 1 },
    { id: 'x0', label: 'Berøringspunkt x', meaning: 'Hvor på grafen tangenten ligger.', min: -4, max: 4, step: 0.5, initial: 1.5 },
  ],
  animatedParameterId: 'x0',
  modelLatex: ({ a, x0 }) =>
    String.raw`$f(x) = ${num(a)}x^2, \quad f\prime(x) = ${num(2 * a)}x, \quad f\prime(${num(x0)}) = ${num(2 * a * x0)}$`,
  buildVisual: ({ a, x0 }) => ({
    kind: 'graph',
    curves: [
      { kind: 'polynomial', coefficients: [0, 0, a], tone: 'primary', label: 'f', tangentAtX: x0 },
    ],
    markers: [
      { x: x0, y: a * x0 * x0, label: `stigning ${num(2 * a * x0)}`, tone: 'correct' },
    ],
    xRange: [-5, 5],
    caption: 'Den stiplede linjen er tangenten. Stigningstallet er den deriverte i punktet.',
  }),
  derive: ({ a, x0 }) => {
    const value = a * x0 * x0;
    const slope = 2 * a * x0;
    return [
      { id: 'value', label: `$f(${num(x0)})$`, value: `$${num(value, 2)}$`, tone: 'primary' },
      { id: 'derivative', label: 'Den deriverte', value: `$f\\prime(x) = ${num(2 * a)}x$`, tone: 'accent' },
      { id: 'slope', label: `$f\\prime(${num(x0)})$`, value: `$${num(slope, 2)}$`, tone: 'correct' },
      {
        id: 'tangent',
        label: 'Tangentlikning',
        value: `$y = ${num(slope, 2)}x ${signedNumber(value - slope * x0)}$`,
        tone: 'accent',
      },
      {
        id: 'direction',
        label: 'Tangenten',
        value: isNear(slope, 0) ? 'er vannrett' : slope > 0 ? 'stiger' : 'synker',
        tone: 'muted',
      },
    ];
  },
  claims: [
    {
      id: 'derivative-is-slope',
      text: 'Den deriverte i et punkt er stigningstallet til tangenten der.',
      isTrue: true,
      explanation: 'Riktig. Det er hele definisjonen av den deriverte i et punkt.',
    },
    {
      id: 'same-value',
      text: 'Tangenten og grafen har samme verdi i berøringspunktet.',
      isTrue: true,
      explanation: 'Riktig. Tangenten berører grafen der, så de har både samme verdi og samme stigning.',
    },
    {
      id: 'derivative-equals-value',
      text: 'Den deriverte er det samme som funksjonsverdien.',
      isTrue: false,
      explanation:
        'Nei. Funksjonsverdien er en høyde, den deriverte er en stigning. Dra i punktet og se at de sjelden er like.',
    },
    {
      id: 'flat-at-zero',
      text: 'Tangenten er vannrett når berøringspunktet er $x = 0$.',
      isTrue: true,
      explanation: 'Riktig for $f(x) = ax^2$. Der snur parabelen, og stigningen er null.',
    },
  ],
  missions: [
    {
      id: 'flat-tangent',
      prompt: 'Gjør tangenten vannrett.',
      hint: 'Stigningstallet er $2ax$. Når blir et produkt null?',
      successMessage: 'Riktig. En vannrett tangent betyr at den deriverte er null, altså et ekstremalpunkt.',
      isAccomplished: ({ a, x0 }) => isNear(2 * a * x0, 0, 1e-6),
    },
    {
      id: 'slope-four',
      prompt: 'Gjør stigningstallet nøyaktig 4.',
      hint: 'Sett $2ax = 4$, og velg a og x som passer.',
      successMessage: 'Presist truffet. Flere kombinasjoner av a og x gir samme stigning.',
      isAccomplished: ({ a, x0 }) => isNear(2 * a * x0, 4, 1e-6),
    },
    {
      id: 'falling-tangent',
      prompt: 'Lag en tangent som synker, på en graf som åpner oppover.',
      hint: 'Åpningen bestemmes av fortegnet til a. Stigningen bestemmes også av hvilken side av toppunktet du står på.',
      successMessage: 'Godt sett. En graf som åpner oppover synker til venstre for bunnpunktet.',
      isAccomplished: ({ a, x0 }) => a > 0 && 2 * a * x0 < 0,
    },
    {
      id: 'steep-tangent',
      prompt: 'Gjør tangenten brattere enn 8.',
      hint: 'Både a og avstanden fra null gjør tangenten brattere.',
      successMessage: 'Riktig. Langt fra toppunktet vokser funksjonen svært raskt.',
      isAccomplished: ({ a, x0 }) => Math.abs(2 * a * x0) > 8,
    },
  ],
  insight:
    'Den deriverte er en funksjon for stigning. Samme stigningstall kan oppstå på flere steder og med flere koeffisienter.',
};

const triangleLab: ExplorationLabDefinition = {
  id: 'E-TRI-01',
  topic: Lk20Topic1T.TRIGONOMETRI,
  goalId: 'TRI-01',
  skillLabel: 'Sinus, cosinus og tangens',
  title: 'Forholdene i trekanten',
  bigQuestion: 'Hva skjer med sidene når vinkelen endres?',
  description:
    'Endre vinkelen og hypotenusen. Følg hvordan katetene, sinus, cosinus og tangens endrer seg.',
  parameters: [
    { id: 'angle', label: 'Vinkel v', meaning: 'Vinkelen mellom hypotenusen og den hosliggende siden.', min: 10, max: 80, step: 5, initial: 35 },
    { id: 'hypotenuse', label: 'Hypotenus', meaning: 'Den lengste siden, mot den rette vinkelen.', min: 2, max: 20, step: 1, initial: 12 },
  ],
  animatedParameterId: 'angle',
  modelLatex: ({ angle, hypotenuse }) =>
    String.raw`$\sin(${num(angle)}^\circ) = \frac{\text{motstående}}{${num(hypotenuse)}}$`,
  buildVisual: ({ angle, hypotenuse }) => ({
    kind: 'triangle',
    angleDegrees: angle,
    adjacentLabel: `${num(hypotenuse * Math.cos(toRadians(angle)), 1)}`,
    oppositeLabel: `${num(hypotenuse * Math.sin(toRadians(angle)), 1)}`,
    hypotenuseLabel: `${num(hypotenuse)}`,
    highlight: 'sin',
    caption: 'Katetene endrer seg med vinkelen, men hypotenusen er alltid den lengste siden.',
  }),
  derive: ({ angle, hypotenuse }) => {
    const opposite = hypotenuse * Math.sin(toRadians(angle));
    const adjacent = hypotenuse * Math.cos(toRadians(angle));
    return [
      { id: 'opposite', label: 'Motstående side', value: `$${num(opposite, 2)}$`, tone: 'correct' },
      { id: 'adjacent', label: 'Hosliggende side', value: `$${num(adjacent, 2)}$`, tone: 'accent' },
      { id: 'sin', label: `$\\sin(${num(angle)}^\\circ)$`, value: `$${num(Math.sin(toRadians(angle)), 3)}$`, tone: 'primary' },
      { id: 'cos', label: `$\\cos(${num(angle)}^\\circ)$`, value: `$${num(Math.cos(toRadians(angle)), 3)}$`, tone: 'primary' },
      { id: 'tan', label: `$\\tan(${num(angle)}^\\circ)$`, value: `$${num(Math.tan(toRadians(angle)), 3)}$`, tone: 'muted' },
      {
        id: 'pythagoras',
        label: 'Pytagoras-kontroll',
        value: `$${num(opposite ** 2 + adjacent ** 2, 1)} = ${num(hypotenuse ** 2, 1)}$`,
        tone: 'correct',
      },
    ];
  },
  claims: [
    {
      id: 'hypotenuse-longest',
      text: 'Hypotenusen er alltid den lengste siden.',
      isTrue: true,
      explanation: 'Riktig. Både sinus og cosinus er mindre enn 1 for en spiss vinkel, så katetene blir kortere.',
    },
    {
      id: 'angle-up-opposite-up',
      text: 'Når vinkelen øker, blir den motstående siden lengre.',
      isTrue: true,
      explanation: 'Riktig. Sinus vokser fra 0 mot 1 når vinkelen går fra 0° mot 90°.',
    },
    {
      id: 'angle-up-adjacent-up',
      text: 'Når vinkelen øker, blir også den hosliggende siden lengre.',
      isTrue: false,
      explanation: 'Nei, den blir kortere. Cosinus avtar mot 0 når vinkelen nærmer seg 90°.',
    },
    {
      id: 'sin-over-one',
      text: 'Sinus til en vinkel kan bli større enn 1.',
      isTrue: false,
      explanation: 'Nei. Sinus er en katet delt på hypotenusen, og katetene er alltid kortest.',
    },
  ],
  missions: [
    {
      id: 'equal-legs',
      prompt: 'Gjør de to katetene like lange.',
      hint: 'Katetene er like når sinus og cosinus er like store.',
      successMessage: 'Riktig: ved 45° er $\\sin v = \\cos v$, og trekanten er likebeint.',
      isAccomplished: ({ angle }) => isNear(angle, 45),
    },
    {
      id: 'opposite-longer',
      prompt: 'Gjør den motstående siden lengre enn den hosliggende.',
      hint: 'Sammenlign sinus og cosinus. Ved hvilken vinkel bytter de plass?',
      successMessage: 'Riktig. Over 45° er den motstående siden den lengste kateten.',
      isAccomplished: ({ angle }) =>
        Math.sin(toRadians(angle)) > Math.cos(toRadians(angle)),
    },
    {
      id: 'tall-enough',
      prompt: 'Gjør den motstående siden minst 15.',
      hint: 'Du kan både øke vinkelen og forlenge hypotenusen.',
      successMessage: 'Riktig. Høyden avhenger av begge: hypotenusens lengde og vinkelen.',
      isAccomplished: ({ angle, hypotenuse }) => hypotenuse * Math.sin(toRadians(angle)) >= 15,
    },
    {
      id: 'short-adjacent',
      prompt: 'Gjør den hosliggende siden mindre enn en femtedel av hypotenusen.',
      hint: 'Det betyr at cosinus må bli mindre enn 0,2.',
      successMessage: 'Riktig. Nær 90° blir den hosliggende siden nesten borte.',
      isAccomplished: ({ angle }) => Math.cos(toRadians(angle)) < 0.2,
    },
  ],
  insight:
    'Sinus, cosinus og tangens er forhold, ikke lengder. De avhenger bare av vinkelen, aldri av hvor stor trekanten er.',
};

const priceModelLab: ExplorationLabDefinition = {
  id: 'E-MOD-01',
  topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
  goalId: 'MOD-02',
  skillLabel: 'Lineær modell',
  title: 'To prismodeller',
  bigQuestion: 'Når lønner det seg å bytte fra ett tilbud til et annet?',
  description:
    'Sett startpris og enhetspris for to tilbud. Finn ut når de koster det samme, og når de aldri møtes.',
  parameters: [
    { id: 'startA', label: 'A: startpris', meaning: 'Det du betaler uansett hos A.', min: 0, max: 200, step: 10, initial: 50 },
    { id: 'perA', label: 'A: pris per enhet', meaning: 'Det A koster per enhet.', min: 0, max: 40, step: 5, initial: 15 },
    { id: 'startB', label: 'B: startpris', meaning: 'Det du betaler uansett hos B.', min: 0, max: 200, step: 10, initial: 80 },
    { id: 'perB', label: 'B: pris per enhet', meaning: 'Det B koster per enhet.', min: 0, max: 40, step: 5, initial: 5 },
  ],
  modelLatex: ({ startA, perA, startB, perB }) =>
    String.raw`$A(x) = ${num(startA)} + ${num(perA)}x, \quad B(x) = ${num(startB)} + ${num(perB)}x$`,
  buildVisual: ({ startA, perA, startB, perB }) => {
    const crossing = isNear(perA, perB) ? null : (startB - startA) / (perA - perB);
    return {
      kind: 'graph',
      curves: [
        { kind: 'polynomial', coefficients: [startA, perA], tone: 'primary', label: 'A' },
        { kind: 'polynomial', coefficients: [startB, perB], tone: 'accent', label: 'B' },
      ],
      markers:
        crossing !== null && crossing >= 0 && crossing <= 20
          ? [
              {
                x: crossing,
                y: startA + perA * crossing,
                label: `likt ved ${num(crossing, 1)}`,
                tone: 'correct' as const,
              },
            ]
          : [],
      xRange: [0, 20],
      caption:
        crossing === null
          ? 'Like enhetspriser gir parallelle linjer, og de møtes aldri.'
          : 'Skjæringspunktet er der de to tilbudene koster det samme.',
    };
  },
  derive: ({ startA, perA, startB, perB }) => {
    const crossing = isNear(perA, perB) ? null : (startB - startA) / (perA - perB);
    const atTen = { a: startA + perA * 10, b: startB + perB * 10 };
    return [
      {
        id: 'crossing',
        label: 'Koster det samme ved',
        value: crossing === null ? 'aldri, linjene er parallelle' : `$x = ${num(crossing, 2)}$`,
        tone: crossing === null ? 'error' : 'correct',
      },
      { id: 'at-ten-a', label: 'A ved 10 enheter', value: `$${num(atTen.a)}$`, tone: 'primary' },
      { id: 'at-ten-b', label: 'B ved 10 enheter', value: `$${num(atTen.b)}$`, tone: 'accent' },
      {
        id: 'cheapest',
        label: 'Billigst ved 10 enheter',
        value: isNear(atTen.a, atTen.b) ? 'like' : atTen.a < atTen.b ? 'A' : 'B',
        tone: 'muted',
      },
    ];
  },
  claims: [
    {
      id: 'lowest-start-wins',
      text: 'Tilbudet med lavest startpris er alltid billigst.',
      isTrue: false,
      explanation:
        'Nei. Bruker du mye, kan en høy startpris med lav enhetspris bli billigere. Se hvor linjene krysser.',
    },
    {
      id: 'parallel-never-cross',
      text: 'Hvis enhetsprisene er like, krysser modellene aldri hverandre.',
      isTrue: true,
      explanation: 'Riktig. Like stigningstall gir parallelle linjer, og forskjellen forblir konstant.',
    },
    {
      id: 'crossing-meaning',
      text: 'Skjæringspunktet forteller når de to tilbudene koster det samme.',
      isTrue: true,
      explanation: 'Riktig. Det er nettopp den $x$-verdien der uttrykkene er like store.',
    },
    {
      id: 'highest-start-loses',
      text: 'Tilbudet med høyest startpris er alltid dyrest.',
      isTrue: false,
      explanation: 'Nei. Det avhenger av hvor mye du bruker, og av enhetsprisene.',
    },
  ],
  missions: [
    {
      id: 'never-cross',
      prompt: 'Lag to modeller som aldri krysser hverandre.',
      hint: 'Hva må være likt for at linjene skal bli parallelle?',
      successMessage: 'Riktig. Med samme enhetspris er forskjellen den samme uansett hvor mye du bruker.',
      isAccomplished: ({ perA, perB }) => isNear(perA, perB),
    },
    {
      id: 'cross-at-ten',
      prompt: 'Gjør slik at de koster det samme ved nøyaktig 10 enheter.',
      hint: 'Skjæringen er $(startB - startA)/(perA - perB)$.',
      successMessage: 'Presist. Nå er 10 enheter vippepunktet mellom de to tilbudene.',
      isAccomplished: ({ startA, perA, startB, perB }) =>
        !isNear(perA, perB) && isNear((startB - startA) / (perA - perB), 10, 1e-6),
    },
    {
      id: 'a-always-cheapest',
      prompt: 'Gjør slik at A er billigst uansett hvor mye du bruker.',
      hint: 'Da må A være billigere både i startpris og i enhetspris.',
      successMessage: 'Riktig. Er begge leddene lavere, er A alltid billigst, og linjene krysser aldri.',
      isAccomplished: ({ startA, perA, startB, perB }) =>
        startA <= startB && perA <= perB && (startA < startB || perA < perB),
    },
    {
      id: 'switch-between',
      prompt: 'Gjør slik at B er billigst ved 5 enheter, men A er billigst ved 20.',
      hint: 'Da må linjene krysse et sted mellom 5 og 20.',
      successMessage: 'Godt jobbet. Dette er nettopp situasjonen der svaret «det kommer an på» er riktig.',
      isAccomplished: ({ startA, perA, startB, perB }) =>
        startB + perB * 5 < startA + perA * 5 && startA + perA * 20 < startB + perB * 20,
    },
  ],
  insight:
    'To lineære modeller møtes i høyst ett punkt. Skjæringen er grensen, og situasjonen avgjør hvilken side du er på.',
};

const probabilityLab: ExplorationLabDefinition = {
  id: 'E-SAN-01',
  topic: Lk20Topic1T.SANNSYNLIGHET,
  goalId: 'SAN-01',
  skillLabel: 'Grunnsannsynlighet',
  title: 'Gunstige og mulige',
  bigQuestion: 'Hva skjer med sannsynligheten når du endrer antall utfall?',
  description:
    'Endre antall gunstige og mulige utfall. Se sannsynligheten som brøk, desimaltall og prosent.',
  parameters: [
    { id: 'favourable', label: 'Gunstige utfall', meaning: 'Utfallene du ønsker deg.', min: 0, max: 20, step: 1, initial: 6 },
    { id: 'total', label: 'Mulige utfall', meaning: 'Alle utfall som kan skje.', min: 1, max: 20, step: 1, initial: 20 },
  ],
  animatedParameterId: 'favourable',
  modelLatex: ({ favourable, total }) =>
    String.raw`$P = \frac{${num(Math.min(favourable, total))}}{${num(total)}}$`,
  buildVisual: ({ favourable, total }) => ({
    kind: 'bars',
    bars: [
      { label: 'gunstige', value: Math.min(favourable, total), tone: 'correct' },
      { label: 'mulige', value: total, tone: 'primary' },
    ],
    caption: 'Sannsynlighet sammenligner den ene søylen med hele utfallsrommet.',
  }),
  derive: ({ favourable, total }) => {
    const effective = Math.min(favourable, total);
    const probability = effective / total;
    return [
      { id: 'fraction', label: 'Som brøk', value: `$\\frac{${num(effective)}}{${num(total)}}$`, tone: 'primary' },
      { id: 'decimal', label: 'Som desimaltall', value: `$${num(probability, 3)}$`, tone: 'correct' },
      { id: 'percent', label: 'I prosent', value: `$${num(probability * 100, 1)}\\%$`, tone: 'correct' },
      { id: 'complement', label: 'Komplement', value: `$${num(1 - probability, 3)}$`, tone: 'accent' },
      {
        id: 'kind',
        label: 'Hendelsen er',
        value:
          probability === 0 ? 'umulig' : probability >= 1 ? 'sikker' : probability < 0.5 ? 'mindre sannsynlig enn ikke' : 'mer sannsynlig enn ikke',
        tone: 'muted',
      },
    ];
  },
  claims: [
    {
      id: 'max-one',
      text: 'Sannsynligheten kan aldri bli større enn 1.',
      isTrue: true,
      explanation: 'Riktig. Du kan ikke ha flere gunstige utfall enn det finnes mulige.',
    },
    {
      id: 'doubling-changes',
      text: 'Hvis du dobler både gunstige og mulige utfall, endres sannsynligheten.',
      isTrue: false,
      explanation: 'Nei. $\\frac{3}{10}$ og $\\frac{6}{20}$ er samme tall. Brøken forkortes til det samme.',
    },
    {
      id: 'complement-rule',
      text: 'Komplementet er 1 minus sannsynligheten.',
      isTrue: true,
      explanation: 'Riktig. Til sammen dekker hendelsen og komplementet hele utfallsrommet.',
    },
    {
      id: 'more-possible-higher',
      text: 'Flere mulige utfall gir alltid høyere sannsynlighet.',
      isTrue: false,
      explanation:
        'Nei, motsatt. Flere mulige utfall gjør nevneren større, og da synker sannsynligheten.',
    },
  ],
  missions: [
    {
      id: 'exactly-half',
      prompt: 'Gjør sannsynligheten nøyaktig 50 %.',
      hint: 'Hvor mange av utfallene må være gunstige?',
      successMessage: 'Riktig. Halvparten av utfallene er gunstige.',
      isAccomplished: ({ favourable, total }) => isNear(Math.min(favourable, total) / total, 0.5),
    },
    {
      id: 'impossible',
      prompt: 'Gjør hendelsen umulig.',
      hint: 'Hvor mange gunstige utfall må det være for at noe aldri kan skje?',
      successMessage: 'Riktig. Uten gunstige utfall er sannsynligheten 0.',
      isAccomplished: ({ favourable }) => favourable === 0,
    },
    {
      id: 'certain',
      prompt: 'Gjør hendelsen sikker.',
      hint: 'Hva må være sant når alle mulige utfall er gunstige?',
      successMessage: 'Riktig. Når alle utfall er gunstige, er sannsynligheten 1.',
      isAccomplished: ({ favourable, total }) => favourable >= total,
    },
    {
      id: 'under-ten-percent',
      prompt: 'Gjør sannsynligheten mindre enn 10 %.',
      hint: 'Få nevneren stor og telleren liten.',
      successMessage: 'Riktig. Få gunstige utfall blant mange mulige gir liten sannsynlighet.',
      isAccomplished: ({ favourable, total }) => Math.min(favourable, total) / total < 0.1,
    },
  ],
  insight:
    'Sannsynlighet er en andel. Den endres bare når forholdet mellom gunstige og mulige utfall endres.',
};

const growthLab: ExplorationLabDefinition = {
  id: 'E-FUN-02',
  topic: Lk20Topic1T.FUNKSJONER,
  goalId: 'FUN-03',
  skillLabel: 'Eksponentialfunksjoner',
  title: 'Lineær eller eksponentiell',
  bigQuestion: 'Når tar prosentvis vekst over for et fast beløp?',
  description:
    'Sammenlign et fast beløp per år med en fast prosent per år. Se hvor lang tid det tar før kurven passerer linjen.',
  parameters: [
    { id: 'start', label: 'Startverdi', meaning: 'Verdien begge modellene starter på.', min: 100, max: 2000, step: 100, initial: 500 },
    { id: 'percent', label: 'Prosent per år', meaning: 'Den eksponentielle veksten.', min: 0, max: 30, step: 1, initial: 10 },
    { id: 'amount', label: 'Beløp per år', meaning: 'Den lineære veksten.', min: 0, max: 300, step: 10, initial: 50 },
  ],
  modelLatex: ({ start, percent, amount }) =>
    String.raw`$E(x) = ${num(start)}\cdot ${num(1 + percent / 100)}^x, \quad L(x) = ${num(start)} + ${num(amount)}x$`,
  buildVisual: ({ start, percent, amount }) => ({
    kind: 'graph',
    curves: [
      { kind: 'exponential', coefficients: [start, 1 + percent / 100], tone: 'primary', label: 'prosent' },
      { kind: 'polynomial', coefficients: [start, amount], tone: 'accent', label: 'fast beløp' },
    ],
    xRange: [0, 10],
    caption: 'De starter på samme verdi. Formen på veksten er det som skiller dem.',
  }),
  derive: ({ start, percent, amount }) => {
    const factor = 1 + percent / 100;
    const exponentialAt = (year: number) => start * factor ** year;
    const linearAt = (year: number) => start + amount * year;
    return [
      { id: 'exp-5', label: 'Prosentvis etter 5 år', value: `$${num(exponentialAt(5), 0)}$`, tone: 'primary' },
      { id: 'lin-5', label: 'Fast beløp etter 5 år', value: `$${num(linearAt(5), 0)}$`, tone: 'accent' },
      { id: 'exp-10', label: 'Prosentvis etter 10 år', value: `$${num(exponentialAt(10), 0)}$`, tone: 'primary' },
      { id: 'lin-10', label: 'Fast beløp etter 10 år', value: `$${num(linearAt(10), 0)}$`, tone: 'accent' },
      {
        id: 'winner',
        label: 'Høyest etter 10 år',
        value: isNear(exponentialAt(10), linearAt(10)) ? 'like' : exponentialAt(10) > linearAt(10) ? 'prosentvis' : 'fast beløp',
        tone: 'correct',
      },
      {
        id: 'first-year-growth',
        label: 'Økning første år',
        value: `prosentvis $${num((factor - 1) * start, 0)}$ mot fast $${num(amount, 0)}$`,
        tone: 'muted',
      },
    ];
  },
  claims: [
    {
      id: 'exp-always-wins',
      text: 'Prosentvis vekst gir alltid høyere verdi enn et fast beløp.',
      isTrue: false,
      explanation:
        'Nei, ikke i starten. Med lav prosent og stort fast beløp ligger den lineære over i mange år. Prøv 1 prosent mot 300 kroner.',
    },
    {
      id: 'zero-percent-flat',
      text: 'Med 0 prosent vekst blir den eksponentielle en vannrett linje.',
      isTrue: true,
      explanation: 'Riktig. Vekstfaktoren blir 1, og å gange med 1 endrer ingenting.',
    },
    {
      id: 'growing-increase',
      text: 'Prosentvis vekst legger til et større og større beløp for hvert år.',
      isTrue: true,
      explanation: 'Riktig. Prosenten regnes av en stadig større verdi, så tillegget vokser.',
    },
    {
      id: 'linear-constant-slope',
      text: 'Den lineære modellen har samme stigning hele veien.',
      isTrue: true,
      explanation: 'Riktig. Et fast beløp per år gir et konstant stigningstall.',
    },
  ],
  missions: [
    {
      id: 'flat-exponential',
      prompt: 'Gjør den prosentvise veksten helt flat.',
      hint: 'Hvilken prosent gir vekstfaktor 1?',
      successMessage: 'Riktig. Uten prosent er det ingen vekst i det hele tatt.',
      isAccomplished: ({ percent }) => percent === 0,
    },
    {
      id: 'linear-wins-at-ten',
      prompt: 'Gjør slik at det faste beløpet er høyest etter 10 år.',
      hint: 'Senk prosenten og øk beløpet.',
      successMessage: 'Riktig. På kort sikt kan et fast beløp slå prosentvis vekst.',
      isAccomplished: ({ start, percent, amount }) =>
        start + amount * 10 > start * (1 + percent / 100) ** 10,
    },
    {
      id: 'exp-double-linear',
      prompt: 'Gjør den prosentvise veksten mer enn dobbelt så stor som den lineære etter 10 år.',
      hint: 'Høy prosent og lavt fast beløp.',
      successMessage: 'Slik ser rentens kraft ut. Over tid vinner prosentvis vekst alltid.',
      isAccomplished: ({ start, percent, amount }) =>
        start * (1 + percent / 100) ** 10 > 2 * (start + amount * 10),
    },
    {
      id: 'same-first-year',
      prompt: 'Gjør økningen like stor det første året i begge modellene.',
      hint: 'Prosentvis økning første år er prosenten av startverdien.',
      successMessage: 'Riktig. De starter likt, men den prosentvise øker tillegget år for år.',
      isAccomplished: ({ start, percent, amount }) =>
        percent > 0 && amount > 0 && isNear((percent / 100) * start, amount, 1e-6),
    },
  ],
  insight:
    'Fast beløp gir en rett linje, fast prosent gir en kurve. Kurven starter saktere, men ender alltid over linjen.',
};

export const EXPLORATION_LAB_DEFINITIONS: readonly ExplorationLabDefinition[] = [
  factorisationLab,
  balanceLab,
  parabolaLab,
  growthLab,
  tangentLab,
  triangleLab,
  priceModelLab,
  probabilityLab,
];

/** Eksporteres for testene, som må kunne sjekke at oppdrag er mulige å løse. */
export type { ExplorationValues };
