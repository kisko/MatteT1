import { Lk20Topic1T } from '../../model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../../model/task/Misconception.js';
import { ErrorHuntDefinition } from '../../model/guided/ErrorHunt.js';
import { StepOptionDefinition } from '../../model/guided/GuidedWalkthrough.js';

/**
 * Innholdsbanken for «Finn feilen».
 *
 * Hver feiljakt viser en utregning som ser ryddig ut, men som inneholder én
 * klassisk elevfeil. Eleven peker på linjen og velger reparasjonen – to valg,
 * ingen fritekst. Feilen er alltid knyttet til en MisconceptionType, slik at
 * treffet havner i samme statistikk som quizen bruker.
 *
 * Linje 1 er alltid oppgaveteksten og kan aldri være feilen.
 */

const right = (id: string, latex: string, feedback: string): StepOptionDefinition => ({
  id,
  latex,
  isCorrect: true,
  feedback,
});

const wrong = (
  id: string,
  latex: string,
  feedback: string,
  misconceptionType?: MisconceptionType
): StepOptionDefinition => ({ id, latex, feedback, misconceptionType });

const exponentHunt: ErrorHuntDefinition = {
  id: 'EH-ALG-01',
  topic: Lk20Topic1T.TALL_OG_ALGEBRA,
  goalId: 'ALG-01',
  skillLabel: 'Røtter og potenser',
  title: 'Potensregelen som ble ganget',
  claim: String.raw`En annen elev har regnet ut $x^3 \cdot x^4 \cdot x$ og fått $x^{13}$.`,
  lines: [
    { latex: String.raw`$x^3 \cdot x^4 \cdot x$`, note: 'Dette er oppgaven, slik den står.' },
    {
      latex: String.raw`$= x^{3\cdot 4} \cdot x$`,
      note: 'Her er feilen: eksponentene ble ganget i stedet for lagt sammen.',
    },
    { latex: String.raw`$= x^{12} \cdot x$`, note: 'Utregningen er konsekvent, men bygger på feilen i linjen over.' },
    { latex: String.raw`$= x^{13}$`, note: 'Dette siste steget er faktisk riktig utført: $12 + 1 = 13$.' },
  ],
  flawedLineNumber: 2,
  misconceptionType: MisconceptionType.EXPONENT_RULE_ERROR,
  repairOptions: [
    right('legg-sammen', String.raw`$x^3 \cdot x^4 = x^{3+4} = x^7$`, 'Riktig. Samme grunntall som ganges: legg sammen eksponentene.'),
    wrong(
      'trekk-fra',
      String.raw`$x^3 \cdot x^4 = x^{4-3} = x$`,
      'Subtraksjon av eksponenter hører til divisjon: $x^4 : x^3 = x$.',
      MisconceptionType.EXPONENT_RULE_ERROR
    ),
    wrong(
      'faktor-foran',
      String.raw`$x^3 \cdot x^4 = 3x \cdot 4x = 12x^2$`,
      String.raw`En potens er gjentatt multiplikasjon, ikke en faktor foran $x$. $x^3$ betyr $x\cdot x\cdot x$.`,
      MisconceptionType.EXPONENT_RULE_ERROR
    ),
  ],
  explanation:
    'Eksponenten forteller hvor mange faktorer du har. $x^3\\cdot x^4\\cdot x$ er tre pluss fire pluss én faktor, altså $x^8$.',
  takeaway: 'Ganger du potenser med samme grunntall, legger du sammen eksponentene.',
  visual: {
    kind: 'bars',
    bars: [
      { label: '2³·2⁴·2', value: 256, tone: 'primary' },
      { label: '2⁸ (riktig)', value: 256, tone: 'correct' },
      { label: '2¹³ (elevens svar)', value: 8192, tone: 'error' },
    ],
    caption: 'Sett inn $x=2$: elevens svar er 32 ganger for stort. Innsetting avslører feilen umiddelbart.',
  },
};

const inequalityHunt: ErrorHuntDefinition = {
  id: 'EH-LIG-01',
  topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
  goalId: 'LIG-03',
  skillLabel: 'Fortegnsskjema',
  title: 'Ulikheten som ikke snudde',
  claim: String.raw`En annen elev har løst $-3x > 12$ og fått $x > -4$.`,
  lines: [
    { latex: String.raw`$-3x > 12$`, note: 'Oppgaven, slik den står.' },
    {
      latex: String.raw`$\frac{-3x}{-3} > \frac{12}{-3}$`,
      note: 'Å dele begge sider på $-3$ er lovlig, så langt er alt i orden.',
    },
    {
      latex: String.raw`$x > -4$`,
      note: 'Her er feilen: ulikhetstegnet skulle snudd da begge sider ble delt på et negativt tall.',
    },
    { latex: String.raw`$\text{Svar: alle } x > -4$`, note: 'Konklusjonen følger av feilen i linjen over.' },
  ],
  flawedLineNumber: 3,
  misconceptionType: MisconceptionType.SIGN_ERROR,
  repairOptions: [
    right('snu-tegnet', String.raw`$x < -4$`, 'Riktig. Deler du på et negativt tall, snur ulikhetstegnet.'),
    wrong(
      'mistet-fortegn',
      String.raw`$x > 4$`,
      'Fortegnet på 4 forsvant også. $12 : (-3) = -4$.',
      MisconceptionType.SIGN_ERROR
    ),
    wrong(
      'snudde-men-feil-tall',
      String.raw`$x < 4$`,
      'Tegnet snudde riktig, men $12 : (-3)$ er $-4$, ikke $4$.',
      MisconceptionType.SIGN_ERROR
    ),
  ],
  explanation:
    'Test med $x = -5$: $-3\\cdot(-5) = 15 > 12$, som stemmer. Test med $x = 0$: $-3\\cdot 0 = 0 > 12$, som ikke stemmer. Altså er det $x < -4$ som gjelder.',
  takeaway:
    'Multipliserer eller deler du en ulikhet på et negativt tall, må tegnet snu. Test alltid med ett tall etterpå.',
  visual: {
    kind: 'numberline',
    min: -10,
    max: 5,
    points: [{ value: -4, label: '-4', tone: 'accent', open: true }],
    intervals: [
      { from: -10, to: -4, label: 'riktig: x < -4', tone: 'correct' },
      { from: -4, to: 5, label: 'elevens svar', tone: 'error' },
    ],
    caption: 'Åpen sirkel betyr at $-4$ ikke er med. Bare venstre side gjør ulikheten sann.',
  },
};

const rootHunt: ErrorHuntDefinition = {
  id: 'EH-FUN-01',
  topic: Lk20Topic1T.FUNKSJONER,
  goalId: 'FUN-02',
  skillLabel: 'Andregradsfunksjoner',
  title: 'Løsningen som forsvant',
  claim: String.raw`En annen elev har løst $x^2 = 49$ og fått $x = 7$.`,
  lines: [
    { latex: String.raw`$x^2 = 49$`, note: 'Oppgaven, slik den står.' },
    { latex: String.raw`$\sqrt{x^2} = \sqrt{49}$`, note: 'Å ta kvadratroten på begge sider er lovlig.' },
    { latex: String.raw`$x = 7$`, note: 'Her er feilen: den negative løsningen mangler.' },
    { latex: String.raw`$\text{Svar: } x = 7$`, note: 'Svaret er halvferdig. Den ene av to løsninger er riktig.' },
  ],
  flawedLineNumber: 3,
  misconceptionType: MisconceptionType.FORGOT_NEGATIVE_ROOT,
  repairOptions: [
    right('pluss-minus', String.raw`$x = \pm 7$, altså $x = 7$ eller $x = -7$`, 'Riktig. Begge tallene gir 49 når de kvadreres.'),
    wrong(
      'null-med',
      String.raw`$x = 7$ eller $x = 0$`,
      'Null gir $0^2 = 0$, ikke 49.',
      MisconceptionType.FORGOT_NEGATIVE_ROOT
    ),
    wrong(
      'bare-negativ',
      String.raw`$x = -7$`,
      'Nå mangler den positive løsningen i stedet. Begge hører med.',
      MisconceptionType.FORGOT_NEGATIVE_ROOT
    ),
  ],
  explanation:
    'Grafen til $y = x^2$ og linjen $y = 49$ krysser hverandre i to punkter, ett på hver side av $y$-aksen. $(-7)^2 = 49$ akkurat som $7^2 = 49$.',
  takeaway: 'Tar du kvadratroten for å løse en likning, får du to løsninger: $x = \\pm\\sqrt{c}$.',
  visual: {
    kind: 'graph',
    curves: [
      { kind: 'polynomial', coefficients: [0, 0, 1], tone: 'primary', label: 'y = x²' },
      { kind: 'polynomial', coefficients: [49], tone: 'accent', label: 'y = 49' },
    ],
    markers: [
      { x: 7, y: 49, label: 'x = 7', tone: 'correct' },
      { x: -7, y: 49, label: 'x = -7 (glemt)', tone: 'error' },
    ],
    xRange: [-10, 10],
    caption: 'To skjæringspunkter betyr to løsninger. Eleven fant bare det høyre.',
  },
};

const derivativeHunt: ErrorHuntDefinition = {
  id: 'EH-DER-01',
  topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
  goalId: 'DER-02',
  skillLabel: 'Derivasjonsregler',
  title: 'Den deriverte som glemte faktoren',
  claim: String.raw`En annen elev har derivert $f(x) = x^3 + 4x$ og fått $f\prime(x) = x^2 + 4$.`,
  lines: [
    { latex: String.raw`$f(x) = x^3 + 4x$`, note: 'Oppgaven, slik den står.' },
    {
      latex: String.raw`$\text{Deriverer } x^3: \quad x^2$`,
      note: 'Her er feilen: eksponenten skal ned som faktor, så den deriverte er $3x^2$.',
    },
    {
      latex: String.raw`$\text{Deriverer } 4x: \quad 4$`,
      note: 'Dette er riktig. $4x$ har eksponent 1, og den deriverte blir 4.',
    },
    { latex: String.raw`$f\prime(x) = x^2 + 4$`, note: 'Summen er riktig satt sammen, men bygger på feilen i linje 2.' },
  ],
  flawedLineNumber: 2,
  misconceptionType: MisconceptionType.DERIVATIVE_POWER_RULE,
  repairOptions: [
    right('tre-x-kvadrat', String.raw`$(x^3)\prime = 3x^2$`, 'Riktig. Eksponenten 3 blir faktor, og den nye eksponenten er 2.'),
    wrong(
      'beholdt-eksponent',
      String.raw`$(x^3)\prime = 3x^3$`,
      'Faktoren er riktig, men eksponenten skal reduseres med 1.',
      MisconceptionType.DERIVATIVE_POWER_RULE
    ),
    wrong(
      'eksponent-opp',
      String.raw`$(x^3)\prime = 3x^4$`,
      'Eksponenten går ned med én ved derivasjon, ikke opp.',
      MisconceptionType.DERIVATIVE_POWER_RULE
    ),
  ],
  explanation:
    'Potensregelen er $(x^n)\\prime = n x^{n-1}$. Riktig svar er $f\\prime(x) = 3x^2 + 4$. I $x = 1$ stiger grafen med $3 + 4 = 7$, ikke $1 + 4 = 5$.',
  takeaway: 'Eksponenten gjør to ting samtidig: den blir faktor foran, og den blir én mindre.',
  visual: {
    kind: 'graph',
    curves: [
      { kind: 'polynomial', coefficients: [4, 0, 3], tone: 'correct', label: "riktig f'" },
      { kind: 'polynomial', coefficients: [4, 0, 1], tone: 'error', label: "elevens f'" },
    ],
    xRange: [-2, 2],
    caption: 'De to kurvene skiller seg mer og mer. Bare den grønne gir tangentens stigning.',
  },
};

const trigonometryHunt: ErrorHuntDefinition = {
  id: 'EH-TRI-01',
  topic: Lk20Topic1T.TRIGONOMETRI,
  goalId: 'TRI-01',
  skillLabel: 'Sinus, cosinus og tangens',
  title: 'Forholdet som ble byttet om',
  claim:
    'En annen elev skal finne hvor langt fra veggen foten av en 6 meter lang stige står når vinkelen mot bakken er 65 grader, og har brukt sinus.',
  lines: [
    {
      latex: String.raw`$\text{Stigen} = 6\text{ m}, \quad v = 65^\circ, \quad \text{søkt: avstand langs bakken}$`,
      note: 'Oppgaven. Avstanden langs bakken er den hosliggende siden.',
    },
    {
      latex: String.raw`$\sin(65^\circ) = \frac{a}{6}$`,
      note: 'Her er feilen: sinus kobler hypotenusen til den *motstående* siden, ikke den hosliggende.',
    },
    {
      latex: String.raw`$a = 6\sin(65^\circ) \approx 5.4$`,
      note: 'Regningen er riktig utført, men forholdet i linjen over var feil.',
    },
    {
      latex: String.raw`$\text{Svar: } 5.4\text{ m fra veggen}$`,
      note: 'Dette tallet er høyden stigen rekker, ikke avstanden fra veggen.',
    },
  ],
  flawedLineNumber: 2,
  misconceptionType: MisconceptionType.TRIG_RATIO_MIXUP,
  repairOptions: [
    right(
      'cosinus',
      String.raw`$\cos(65^\circ) = \frac{a}{6} \Rightarrow a \approx 2.5$`,
      'Riktig. Cosinus kobler hypotenusen til den hosliggende siden.'
    ),
    wrong(
      'tangens',
      String.raw`$\tan(65^\circ) = \frac{a}{6} \Rightarrow a \approx 12.9$`,
      'Tangens bruker aldri hypotenusen, og en katet kan ikke være lengre enn hypotenusen.',
      MisconceptionType.TRIG_RATIO_MIXUP
    ),
    wrong(
      'opp-ned',
      String.raw`$\cos(65^\circ) = \frac{6}{a} \Rightarrow a \approx 14.2$`,
      'Brøken står opp ned: hypotenusen skal stå i nevneren.',
      MisconceptionType.TRIG_RATIO_MIXUP
    ),
  ],
  explanation:
    'SOH-CAH-TOA: sinus tar motstående over hypotenus, cosinus tar hosliggende over hypotenus. Avstanden langs bakken er hosliggende, så svaret er $6\\cos(65^\\circ) \\approx 2.5$ meter.',
  takeaway:
    'Merk av hvilke to sider som er med i oppgaven *før* du velger forhold. Da velger formelen seg selv.',
  visual: {
    kind: 'triangle',
    angleDegrees: 65,
    adjacentLabel: 'a ≈ 2.5 m (søkt)',
    oppositeLabel: '5.4 m (høyden)',
    hypotenuseLabel: '6 m',
    highlight: 'cos',
    caption: 'Den hosliggende siden ligger *ved* vinkelen. Den motstående ligger rett overfor den.',
  },
};

const modellingHunt: ErrorHuntDefinition = {
  id: 'EH-MOD-01',
  topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
  goalId: 'MOD-04',
  skillLabel: 'Modellkritikk',
  title: 'Svaret som aldri ble tolket',
  claim:
    'En annen elev skal finne hvor mange billetter du kan kjøpe for 500 kroner når hver billett koster 120 kroner og bussen dit koster 45 kroner. Svaret ble 3.79 billetter.',
  lines: [
    {
      latex: String.raw`$45 + 120x \le 500$`,
      note: 'Modellen er riktig satt opp: bussen betales én gang, billettene per stykk.',
    },
    { latex: String.raw`$120x \le 455$`, note: 'Riktig. 45 er trukket fra på begge sider.' },
    { latex: String.raw`$x \le 3.79$`, note: 'Riktig regnet: $455 : 120 \approx 3.79$.' },
    {
      latex: String.raw`$\text{Svar: } 3.79 \text{ billetter}$`,
      note: 'Her er feilen: svaret er ikke tolket i situasjonen. Billetter finnes bare i hele tall.',
    },
  ],
  flawedLineNumber: 4,
  misconceptionType: MisconceptionType.UNIT_INTERPRETATION_ERROR,
  repairOptions: [
    right('tre-billetter', 'Du kan kjøpe 3 billetter', 'Riktig. $45 + 3\\cdot 120 = 405$ kroner, og det har du.'),
    wrong(
      'rundet-opp',
      'Du kan kjøpe 4 billetter',
      'Avrunding oppover sprekker budsjettet: $45 + 4\\cdot 120 = 525$ kroner.',
      MisconceptionType.UNIT_INTERPRETATION_ERROR
    ),
    wrong(
      'avrundet-desimal',
      'Du kan kjøpe 3.8 billetter',
      'Antall billetter må være et helt tall. Å runde av desimalene løser ikke tolkningsproblemet.',
      MisconceptionType.UNIT_INTERPRETATION_ERROR
    ),
  ],
  explanation:
    'Regnestykket var riktig hele veien. Feilen ligger i det siste steget: modellen gir et tall, og du må avgjøre hva tallet betyr. Antall billetter er heltall, og budsjettet er en øvre grense, så du må runde ned.',
  takeaway:
    'Siste steg i modellering er alltid tolkning: riktig enhet, rimelig tall, og avrunding i riktig retning.',
  visual: {
    kind: 'bars',
    bars: [
      { label: '3 billetter: 405 kr', value: 405, tone: 'correct' },
      { label: 'Budsjett: 500 kr', value: 500, tone: 'primary' },
      { label: '4 billetter: 525 kr', value: 525, tone: 'error' },
    ],
    caption: 'Tre billetter ligger under budsjettet. Fire sprekker det.',
  },
};

const probabilityHunt: ErrorHuntDefinition = {
  id: 'EH-SAN-01',
  topic: Lk20Topic1T.SANNSYNLIGHET,
  goalId: 'SAN-03',
  skillLabel: 'Betinget sannsynlighet',
  title: 'Sannsynlighetene som ble lagt sammen',
  claim: 'En annen elev skal finne sannsynligheten for å få mynt to ganger på rad, og svarte 100 prosent.',
  lines: [
    {
      latex: String.raw`$P(\text{mynt}) = 0.5 \text{ for hvert kast}$`,
      note: 'Riktig. En mynt har to like sannsynlige utfall.',
    },
    {
      latex: String.raw`$P(\text{mynt og mynt}) = 0.5 + 0.5$`,
      note: 'Her er feilen: hendelser som skjer *samtidig* skal ganges, ikke legges sammen.',
    },
    { latex: String.raw`$= 1.0 = 100\%$`, note: 'Regningen stemmer, men resultatet avslører feilen: 100 % betyr helt sikkert.' },
    {
      latex: String.raw`$\text{Svar: du får alltid mynt to ganger}$`,
      note: 'Konklusjonen er åpenbart urimelig, og det er den beste ledetråden av alle.',
    },
  ],
  flawedLineNumber: 2,
  misconceptionType: MisconceptionType.PROBABILITY_COMBINATION_ERROR,
  repairOptions: [
    right('gang', String.raw`$P = 0.5 \cdot 0.5 = 0.25 = 25\%$`, 'Riktig. To uavhengige hendelser som skjer sammen: gang sannsynlighetene.'),
    wrong(
      'trekk-fra',
      String.raw`$P = 0.5 - 0.5 = 0$`,
      'Subtraksjon hører til komplementregelen, $1 - P(A)$.',
      MisconceptionType.PROBABILITY_COMBINATION_ERROR
    ),
    wrong(
      'del-pa-to',
      String.raw`$P = \frac{0.5}{2} = 0.25$`,
      'Tallet blir riktig ved ren flaks. Prøv regelen på tre kast, og den bryter sammen: $0.5:3$ er ikke $0.125$.',
      MisconceptionType.PROBABILITY_COMBINATION_ERROR
    ),
  ],
  explanation:
    'Valgtreet har fire like sannsynlige veier: MM, MK, KM og KK. Bare én av dem gir mynt to ganger, altså $1/4 = 25\\%$. Å legge sammen sannsynligheter gjelder når hendelsene er *alternativer* som ikke kan skje samtidig.',
  takeaway:
    'Skjer hendelsene samtidig? Gang. Er de alternativer? Legg sammen. Og sjekk alltid at svaret ligger mellom 0 og 1.',
  visual: {
    kind: 'bars',
    bars: [
      { label: 'MM', value: 25, tone: 'correct' },
      { label: 'MK', value: 25, tone: 'muted' },
      { label: 'KM', value: 25, tone: 'muted' },
      { label: 'KK', value: 25, tone: 'muted' },
    ],
    caption: 'Fire like sannsynlige veier i valgtreet. Bare én av dem gir mynt to ganger.',
  },
};

export const ERROR_HUNT_DEFINITIONS: readonly ErrorHuntDefinition[] = [
  exponentHunt,
  inequalityHunt,
  rootHunt,
  derivativeHunt,
  trigonometryHunt,
  modellingHunt,
  probabilityHunt,
];
