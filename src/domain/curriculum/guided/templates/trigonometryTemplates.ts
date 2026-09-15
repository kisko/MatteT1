import { Lk20Topic1T } from '../../../model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../../../model/task/Misconception.js';
import { ExerciseTemplate } from '../../../model/guided/ExerciseTemplate.js';
import { distinctOptions, intBetween, num, pickAvoiding, pickFrom, right, wrong } from './seed.js';

const degreesToRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const pythagorasTemplate: ExerciseTemplate = {
  id: 'T-TRI-01',
  topic: Lk20Topic1T.TRIGONOMETRI,
  goalId: 'TRI-01',
  skillLabel: 'Pytagoras',
  title: 'Pytagoras',
  description: 'Finne hypotenusen i en rettvinklet trekant.',
  variantCount: 20,
  generate: (seed) => {
    // Pytagoreiske tripler gir hele tall, så eleven kan konsentrere seg om
    // metoden i stedet for desimaler.
    const triples = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [9, 12, 15],
      [8, 15, 17],
      [7, 24, 25],
      [12, 16, 20],
      [20, 21, 29],
      [10, 24, 26],
      [15, 20, 25],
    ] as const;
    const triple = pickFrom(seed, 1, triples);
    const swap = pickFrom(seed, 2, [true, false] as const);
    const adjacent = swap ? triple[1] : triple[0];
    const opposite = swap ? triple[0] : triple[1];
    const hypotenuse = triple[2];
    const angle = Math.round((Math.atan(opposite / adjacent) * 180) / Math.PI);

    return {
      id: `T-TRI-01-s${seed}`,
      topic: Lk20Topic1T.TRIGONOMETRI,
      goalId: 'TRI-01',
      skillLabel: 'Pytagoras',
      title: 'Finn hypotenusen',
      situation: `En rettvinklet trekant har kateter på ${adjacent} og ${opposite}. Du skal finne hypotenusen.`,
      problemLatex: String.raw`$a = ${adjacent}, \quad b = ${opposite}, \quad c = ?$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilken sammenheng gjelder i en rettvinklet trekant?',
          options: distinctOptions(
            right('riktig', String.raw`$a^2 + b^2 = c^2$`, 'Riktig. Summen av kvadratene til katetene er kvadratet av hypotenusen.'),
            [
              wrong(
                'uten-kvadrat',
                String.raw`$a + b = c$`,
                `Da ville hypotenusen vært ${adjacent + opposite}, som er lengre enn veien rundt. Sidene skal kvadreres.`
              ),
              wrong(
                'differanse',
                String.raw`$a^2 - b^2 = c^2$`,
                'Subtraksjon brukes når du kjenner hypotenusen og skal finne en katet.',
                MisconceptionType.SIGN_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$${adjacent}^2 + ${opposite}^2 = c^2$`,
          rationale: 'Pytagoras gjelder bare i rettvinklede trekanter, og hypotenusen er alltid siden mot den rette vinkelen.',
          hint: 'Hvilken side ligger rett overfor den rette vinkelen?',
          visual: {
            kind: 'triangle',
            angleDegrees: angle,
            adjacentLabel: `${adjacent}`,
            oppositeLabel: `${opposite}`,
            hypotenuseLabel: 'c = ?',
            highlight: 'pythagoras',
            caption: 'Begge kateter er kjent. Hypotenusen er den vi mangler.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Regn ut hypotenusen.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$c = \sqrt{${adjacent ** 2} + ${opposite ** 2}} = \sqrt{${hypotenuse ** 2}} = ${hypotenuse}$`,
              `Riktig. ${adjacent}² + ${opposite}² = ${hypotenuse ** 2}, og kvadratroten er ${hypotenuse}.`
            ),
            [
              wrong(
                'la-sammen',
                String.raw`$c = ${adjacent} + ${opposite} = ${adjacent + opposite}$`,
                'Sidene kan ikke legges sammen direkte. Kvadratene legges sammen, og så tas kvadratroten.'
              ),
              wrong(
                'glemte-rot',
                String.raw`$c = ${hypotenuse ** 2}$`,
                `Dette er $c^2$. Du må ta kvadratroten for å finne $c$.`,
                MisconceptionType.FORGOT_NEGATIVE_ROOT
              ),
            ]
          ),
          resultLatex: String.raw`$c = ${hypotenuse}$`,
          rationale: `$${adjacent}^2 = ${adjacent ** 2}$ og $${opposite}^2 = ${opposite ** 2}$. Summen er ${hypotenuse ** 2}.`,
          hint: 'Kvadrer hver katet, legg sammen, og ta kvadratroten til slutt.',
          visual: {
            kind: 'bars',
            bars: [
              { label: `${adjacent}²`, value: adjacent ** 2, tone: 'primary' },
              { label: `${opposite}²`, value: opposite ** 2, tone: 'accent' },
              { label: `c² = ${hypotenuse ** 2}`, value: hypotenuse ** 2, tone: 'correct' },
            ],
            caption: 'De to små kvadratene har til sammen samme areal som det store.',
          },
        },
        {
          kind: 'checkResult',
          prompt: 'Rimelighetssjekk: kan svaret stemme?',
          options: distinctOptions(
            right(
              'riktig',
              `Ja, ${hypotenuse} er lengre enn begge kateter, men kortere enn ${adjacent} + ${opposite}`,
              'Riktig. Hypotenusen er alltid lengst, men aldri lengre enn summen av katetene.'
            ),
            [
              wrong(
                'kortere',
                `Nei, hypotenusen burde vært kortere enn ${Math.min(adjacent, opposite)}`,
                'Hypotenusen er alltid den lengste siden i en rettvinklet trekant.'
              ),
              wrong(
                'lik-sum',
                `Nei, hypotenusen burde vært ${adjacent + opposite}`,
                'Det ville betydd at trekanten var flat. Den korteste veien er alltid den rette linjen.'
              ),
            ]
          ),
          resultLatex: String.raw`$${Math.max(adjacent, opposite)} < ${hypotenuse} < ${adjacent + opposite}$`,
          rationale:
            'Hypotenusen ligger alltid mellom den lengste kateten og summen av katetene. Det er en gratis kontroll.',
          hint: 'Sammenlign svaret med katetene og med summen av dem.',
          visual: {
            kind: 'triangle',
            angleDegrees: angle,
            adjacentLabel: `${adjacent}`,
            oppositeLabel: `${opposite}`,
            hypotenuseLabel: `c = ${hypotenuse}`,
            highlight: 'pythagoras',
            caption: `Hypotenusen ${hypotenuse} er den lengste siden.`,
          },
        },
      ],
      answerLatex: String.raw`$c = ${hypotenuse}$`,
      takeaway: 'Kvadrer katetene, legg sammen, ta kvadratroten. Og sjekk at hypotenusen ble lengst.',
    };
  },
};

const sineLawTemplate: ExerciseTemplate = {
  id: 'T-TRI-02',
  topic: Lk20Topic1T.TRIGONOMETRI,
  goalId: 'TRI-02',
  skillLabel: 'Sinussetningen',
  title: 'Sinussetningen',
  description: 'Finne en side når to vinkler og én side er kjent.',
  variantCount: 78,
  generate: (seed) => {
    const anglePool = [30, 40, 45, 50, 60, 70] as const;
    const angleA = pickFrom(seed, 1, anglePool);
    const angleB = pickAvoiding(seed, 2, anglePool, [angleA]);
    const sideA = intBetween(seed, 3, 6, 18);

    const sideB = (sideA * Math.sin(degreesToRadians(angleB))) / Math.sin(degreesToRadians(angleA));
    const inverted = (sideA * Math.sin(degreesToRadians(angleA))) / Math.sin(degreesToRadians(angleB));
    const withoutDivision = sideA * Math.sin(degreesToRadians(angleB));
    const angleC = 180 - angleA - angleB;

    return {
      id: `T-TRI-02-s${seed}`,
      topic: Lk20Topic1T.TRIGONOMETRI,
      goalId: 'TRI-02',
      skillLabel: 'Sinussetningen',
      title: 'Finn siden med sinussetningen',
      situation: `I en trekant er $A = ${angleA}^\\circ$, $B = ${angleB}^\\circ$ og siden $a = ${sideA}$. Trekanten er ikke rettvinklet.`,
      problemLatex: String.raw`$A = ${angleA}^\circ, \quad B = ${angleB}^\circ, \quad a = ${sideA}, \quad b = ?$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilken setning passer når du kjenner to vinkler og siden som ligger mot én av dem?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$\frac{a}{\sin A} = \frac{b}{\sin B}$`,
              'Riktig. Sinussetningen parer hver side med sin motstående vinkel.'
            ),
            [
              wrong(
                'cosinus',
                String.raw`$c^2 = a^2 + b^2 - 2ab\cos C$`,
                'Cosinussetningen krever to kjente sider og vinkelen mellom dem. Her kjenner du bare én side.',
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
              wrong(
                'pytagoras',
                String.raw`$a^2 + b^2 = c^2$`,
                'Pytagoras gjelder bare i rettvinklede trekanter, og denne trekanten er ikke rettvinklet.',
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
            ]
          ),
          resultLatex: String.raw`$\frac{${sideA}}{\sin ${angleA}^\circ} = \frac{b}{\sin ${angleB}^\circ}$`,
          rationale: 'Side og motstående vinkel hører sammen som et par. Sinussetningen sier at alle parene har samme forhold.',
          hint: 'Hvilken vinkel ligger rett overfor siden du kjenner?',
          visual: {
            kind: 'generalTriangle',
            angleLabels: [`A = ${angleA}°`, `B = ${angleB}°`, `C = ${angleC}°`],
            sideLabels: [`a = ${sideA}`, 'b = ?', 'c'],
            highlight: 'sinePair',
            caption: 'Siden $a$ ligger mot vinkel $A$, og siden $b$ ligger mot vinkel $B$.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Løs ut $b$ og regn ut.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$b = \frac{${sideA}\cdot \sin ${angleB}^\circ}{\sin ${angleA}^\circ} \approx ${num(sideB, 1)}$`,
              `Riktig. Gang med $\\sin ${angleB}^\\circ$ og del på $\\sin ${angleA}^\\circ$.`
            ),
            [
              wrong(
                'omvendt',
                String.raw`$b = \frac{${sideA}\cdot \sin ${angleA}^\circ}{\sin ${angleB}^\circ} \approx ${num(inverted, 1)}$`,
                'Sinusene har byttet plass. Siden du leter etter, skal pares med sin egen vinkel i telleren.',
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
              wrong(
                'glemte-divisjon',
                String.raw`$b = ${sideA}\cdot \sin ${angleB}^\circ \approx ${num(withoutDivision, 1)}$`,
                `Divisjonen med $\\sin ${angleA}^\\circ$ mangler.`,
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
            ]
          ),
          resultLatex: String.raw`$b \approx ${num(sideB, 1)}$`,
          rationale: 'Sinussetningen er en likning mellom to brøker. Kryssmultiplikasjon gir den ukjente siden.',
          hint: `Gang begge sider med $\\sin ${angleB}^\\circ$ først.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: `a = ${sideA}`, value: sideA, tone: 'primary' },
              { label: `b ≈ ${num(sideB, 1)}`, value: Math.abs(sideB), tone: 'correct' },
            ],
            caption: `Sidene sammenlignet: vinkel $B = ${angleB}^\\circ$ er ${
              angleB > angleA ? 'større' : 'mindre'
            } enn $A = ${angleA}^\\circ$, og siden $b$ er tilsvarende ${angleB > angleA ? 'lengre' : 'kortere'}.`,
          },
        },
        {
          kind: 'interpret',
          prompt: `Stemmer svaret med at $B = ${angleB}^\\circ$ er ${angleB > angleA ? 'større' : 'mindre'} enn $A = ${angleA}^\\circ$?`,
          options: distinctOptions(
            right(
              'riktig',
              angleB > angleA
                ? `Ja, $b$ må være lengre enn $a$, og ${num(sideB, 1)} > ${sideA}`
                : `Ja, $b$ må være kortere enn $a$, og ${num(sideB, 1)} < ${sideA}`,
              'Riktig. I en trekant ligger den lengste siden alltid mot den største vinkelen.'
            ),
            [
              wrong(
                'motsatt',
                angleB > angleA
                  ? `Nei, $b$ burde vært kortere enn $a$`
                  : `Nei, $b$ burde vært lengre enn $a$`,
                'Den største vinkelen har alltid den lengste siden rett overfor seg.',
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
              wrong(
                'ingen-sammenheng',
                'Det er ingen sammenheng mellom vinkler og sidelengder',
                'Sammenhengen er nettopp hele poenget med sinussetningen.',
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
            ]
          ),
          resultLatex: String.raw`$b \approx ${num(sideB, 1)}$`,
          rationale:
            'Rimelighetssjekken i sinussetningen er alltid den samme: størst vinkel, lengst motstående side.',
          hint: 'Sammenlign de to vinklene, og deretter de to sidene.',
          visual: {
            kind: 'generalTriangle',
            angleLabels: [`A = ${angleA}°`, `B = ${angleB}°`, `C = ${angleC}°`],
            sideLabels: [`a = ${sideA}`, `b ≈ ${num(sideB, 1)}`, 'c'],
            highlight: 'sinePair',
            caption: 'Parene side–vinkel har alltid samme forhold i samme trekant.',
          },
        },
      ],
      answerLatex: String.raw`$b \approx ${num(sideB, 1)}$`,
      takeaway: 'Sinussetningen parer side med motstående vinkel. Størst vinkel gir lengst side.',
    };
  },
};

const cosineLawTemplate: ExerciseTemplate = {
  id: 'T-TRI-03',
  topic: Lk20Topic1T.TRIGONOMETRI,
  goalId: 'TRI-03',
  skillLabel: 'Cosinussetningen',
  title: 'Cosinussetningen',
  description: 'Finne tredje side når to sider og vinkelen mellom dem er kjent.',
  variantCount: 100,
  generate: (seed) => {
    // 90° utelates med vilje: der ville Pytagoras vært et riktig alternativ.
    const anglePool = [45, 60, 120, 135] as const;
    const includedAngle = pickFrom(seed, 1, anglePool);
    const sideA = intBetween(seed, 2, 4, 12);
    const sideB = intBetween(seed, 3, 4, 12);

    const cosine = Math.cos(degreesToRadians(includedAngle));
    const squared = sideA ** 2 + sideB ** 2 - 2 * sideA * sideB * cosine;
    const side = Math.sqrt(squared);
    const withoutCosineTerm = Math.sqrt(sideA ** 2 + sideB ** 2);
    const wrongSign = Math.sqrt(sideA ** 2 + sideB ** 2 + 2 * sideA * sideB * cosine);

    return {
      id: `T-TRI-03-s${seed}`,
      topic: Lk20Topic1T.TRIGONOMETRI,
      goalId: 'TRI-03',
      skillLabel: 'Cosinussetningen',
      title: 'Finn siden med cosinussetningen',
      situation: `To sider i en trekant er ${sideA} og ${sideB}, og vinkelen mellom dem er ${includedAngle}°.`,
      problemLatex: String.raw`$a = ${sideA}, \quad b = ${sideB}, \quad C = ${includedAngle}^\circ, \quad c = ?$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilken setning passer når du kjenner to sider og vinkelen mellom dem?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$c^2 = a^2 + b^2 - 2ab\cos C$`,
              'Riktig. Cosinussetningen er laget nettopp for to sider og den inkluderte vinkelen.'
            ),
            [
              wrong(
                'sinus',
                String.raw`$\frac{a}{\sin A} = \frac{c}{\sin C}$`,
                'Sinussetningen krever at du kjenner en vinkel og siden rett overfor den. Her er vinkelen mellom sidene.',
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
              wrong(
                'pytagoras',
                String.raw`$c^2 = a^2 + b^2$`,
                `Pytagoras gjelder bare når vinkelen er 90°, og her er den ${includedAngle}°.`,
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
            ]
          ),
          resultLatex: String.raw`$c^2 = ${sideA}^2 + ${sideB}^2 - 2\cdot ${sideA}\cdot ${sideB}\cdot \cos ${includedAngle}^\circ$`,
          rationale:
            'Cosinussetningen er Pytagoras med et korreksjonsledd. Er vinkelen 90°, blir cosinus null, og leddet forsvinner.',
          hint: 'Ligger den kjente vinkelen mellom de to kjente sidene, eller overfor en av dem?',
          visual: {
            kind: 'generalTriangle',
            angleLabels: ['A', 'B', `C = ${includedAngle}°`],
            sideLabels: [`a = ${sideA}`, `b = ${sideB}`, 'c = ?'],
            highlight: 'includedAngle',
            caption: `Vinkelen ${includedAngle}° ligger mellom sidene ${sideA} og ${sideB}.`,
          },
        },
        {
          kind: 'transform',
          prompt: 'Sett inn og regn ut $c$.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$c = \sqrt{${num(squared, 1)}} \approx ${num(side, 1)}$`,
              `Riktig. $\\cos ${includedAngle}^\\circ \\approx ${num(cosine, 2)}$, og korreksjonsleddet ${cosine < 0 ? 'øker' : 'reduserer'} $c$.`
            ),
            [
              wrong(
                'droppet-cos',
                String.raw`$c = \sqrt{${sideA ** 2} + ${sideB ** 2}} \approx ${num(withoutCosineTerm, 1)}$`,
                'Korreksjonsleddet er utelatt. Det gjelder bare når vinkelen er 90°.',
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
              wrong(
                'feil-fortegn',
                String.raw`$c = \sqrt{${sideA ** 2} + ${sideB ** 2} + 2\cdot ${sideA}\cdot ${sideB}\cdot \cos ${includedAngle}^\circ} \approx ${num(wrongSign, 1)}$`,
                'Formelen har minus foran korreksjonsleddet.',
                MisconceptionType.SIGN_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$c \approx ${num(side, 1)}$`,
          rationale: `Med $C = ${includedAngle}^\\circ$ er cosinus ${cosine < 0 ? 'negativ, så leddet legger til' : 'positiv, så leddet trekker fra'}.`,
          hint: `Regn ut $2\\cdot ${sideA}\\cdot ${sideB}\\cdot \\cos ${includedAngle}^\\circ$ for seg først.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: `a² = ${sideA ** 2}`, value: sideA ** 2, tone: 'primary' },
              { label: `b² = ${sideB ** 2}`, value: sideB ** 2, tone: 'accent' },
              { label: `c² ≈ ${num(squared, 0)}`, value: Math.abs(squared), tone: 'correct' },
            ],
            caption:
              cosine < 0
                ? 'Vinkelen er over 90°, så $c^2$ blir større enn $a^2 + b^2$.'
                : 'Vinkelen er under 90°, så $c^2$ blir mindre enn $a^2 + b^2$.',
          },
        },
        {
          kind: 'checkResult',
          prompt: 'Rimelighetssjekk: kan denne trekanten finnes?',
          options: distinctOptions(
            right(
              'riktig',
              `Ja, ${num(side, 1)} er mindre enn ${sideA} + ${sideB} = ${sideA + sideB}`,
              'Riktig. En side må alltid være kortere enn summen av de to andre.'
            ),
            [
              wrong(
                'storre-enn-sum',
                `Nei, $c$ må være større enn ${sideA + sideB}`,
                'Da ville trekanten ikke kunne lukkes. Trekantulikheten setter summen som øvre grense.'
              ),
              wrong(
                'ingen-grense',
                'Det finnes ingen grense for hvor lang $c$ kan være',
                'Trekantulikheten er en reell grense: $c < a + b$ alltid.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$c \approx ${num(side, 1)} < ${sideA + sideB}$`,
          rationale: 'Trekantulikheten gir deg en rask kontroll på alle svar om sidelengder.',
          hint: `Sammenlign svaret med ${sideA} + ${sideB}.`,
          visual: {
            kind: 'generalTriangle',
            angleLabels: ['A', 'B', `C = ${includedAngle}°`],
            sideLabels: [`a = ${sideA}`, `b = ${sideB}`, `c ≈ ${num(side, 1)}`],
            highlight: 'includedAngle',
            caption: 'Alle tre sidene er nå kjent, og trekanten lukker seg.',
          },
        },
      ],
      answerLatex: String.raw`$c \approx ${num(side, 1)}$`,
      takeaway: 'Cosinussetningen er Pytagoras med et korreksjonsledd for vinkelen mellom sidene.',
    };
  },
};

const areaTemplate: ExerciseTemplate = {
  id: 'T-TRI-04',
  topic: Lk20Topic1T.TRIGONOMETRI,
  goalId: 'TRI-04',
  skillLabel: 'Arealsetningen',
  title: 'Arealsetningen',
  description: 'Finne arealet av en trekant med to sider og vinkelen mellom dem.',
  variantCount: 120,
  generate: (seed) => {
    const anglePool = [30, 45, 60, 120, 135, 150] as const;
    const includedAngle = pickFrom(seed, 1, anglePool);
    const sideA = intBetween(seed, 2, 4, 14);
    const sideB = intBetween(seed, 3, 4, 14);

    const sine = Math.sin(degreesToRadians(includedAngle));
    const area = 0.5 * sideA * sideB * sine;
    const withoutSine = 0.5 * sideA * sideB;
    const withoutHalf = sideA * sideB * sine;

    return {
      id: `T-TRI-04-s${seed}`,
      topic: Lk20Topic1T.TRIGONOMETRI,
      goalId: 'TRI-04',
      skillLabel: 'Arealsetningen',
      title: 'Finn arealet',
      situation: `To sider i en trekant er ${sideA} og ${sideB}, og vinkelen mellom dem er ${includedAngle}°.`,
      problemLatex: String.raw`$a = ${sideA}, \quad b = ${sideB}, \quad C = ${includedAngle}^\circ$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilken formel gir arealet her?',
          options: distinctOptions(
            right('riktig', String.raw`$A = \frac{1}{2}ab\sin C$`, 'Riktig. Arealsetningen bruker to sider og vinkelen mellom dem.'),
            [
              wrong(
                'uten-sinus',
                String.raw`$A = \frac{1}{2}ab$`,
                `Dette gjelder bare når vinkelen er 90°, for da er $\\sin C = 1$. Her er den ${includedAngle}°.`,
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
              wrong(
                'uten-halv',
                String.raw`$A = ab\sin C$`,
                'Dette er arealet av et parallellogram. En trekant er halvparten.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$A = \frac{1}{2}\cdot ${sideA}\cdot ${sideB}\cdot \sin ${includedAngle}^\circ$`,
          rationale:
            'Arealsetningen er grunnlinje ganger høyde delt på to, der $b\\sin C$ er høyden.',
          hint: 'Trekanten er halvparten av et parallellogram med samme sider.',
          visual: {
            kind: 'generalTriangle',
            angleLabels: ['A', 'B', `C = ${includedAngle}°`],
            sideLabels: [`a = ${sideA}`, `b = ${sideB}`, 'c'],
            highlight: 'area',
            caption: 'Den stiplede linjen er høyden, og den finner du med sinus.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Regn ut arealet.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$A \approx ${num(area, 1)}$`,
              `Riktig. $\\sin ${includedAngle}^\\circ \\approx ${num(sine, 2)}$, og halve produktet blir ${num(area, 1)}.`
            ),
            [
              wrong(
                'droppet-sinus',
                String.raw`$A = ${num(withoutSine, 1)}$`,
                `Sinusfaktoren mangler. Den er ${num(sine, 2)} her, ikke 1.`,
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
              wrong(
                'droppet-halv',
                String.raw`$A \approx ${num(withoutHalf, 1)}$`,
                'Halvparten mangler. Dette er arealet av parallellogrammet.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$A \approx ${num(area, 1)}$`,
          rationale: `Regn ut $\\frac{1}{2}\\cdot ${sideA}\\cdot ${sideB} = ${num(withoutSine, 1)}$, og gang med $\\sin ${includedAngle}^\\circ$.`,
          hint: 'Gang de to sidene, halver, og gang med sinus til slutt.',
          visual: {
            kind: 'bars',
            bars: [
              { label: 'uten sinus', value: withoutSine, tone: 'error' },
              { label: 'riktig areal', value: area, tone: 'correct' },
              { label: 'parallellogram', value: withoutHalf, tone: 'muted' },
            ],
            caption: 'Sinusfaktoren og halveringen må begge være med.',
          },
        },
        {
          kind: 'interpret',
          prompt: 'Hvilken vinkel må du bruke i arealsetningen?',
          options: distinctOptions(
            right(
              'riktig',
              'Vinkelen som ligger mellom de to sidene',
              'Riktig. Bare den inkluderte vinkelen gir riktig høyde.'
            ),
            [
              wrong(
                'storste',
                'Den største vinkelen i trekanten',
                'Størrelsen er uvesentlig. Det er plasseringen mellom sidene som avgjør.',
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
              wrong(
                'hvilken-som-helst',
                'Hvilken som helst av de tre vinklene',
                'Da ville høyden blitt målt fra feil sted, og arealet blitt galt.',
                MisconceptionType.TRIG_RATIO_MIXUP
              ),
            ]
          ),
          resultLatex: String.raw`$A = \frac{1}{2}ab\sin C$ der $C$ ligger mellom $a$ og $b$`,
          rationale:
            'Høyden i trekanten er $b\\sin C$, og det stemmer bare når $C$ er vinkelen mellom de to sidene.',
          hint: 'Se på figuren: hvor står den stiplede høyden?',
          visual: {
            kind: 'generalTriangle',
            angleLabels: ['A', 'B', `C = ${includedAngle}°`],
            sideLabels: [`a = ${sideA}`, `b = ${sideB}`, 'c'],
            highlight: 'area',
            caption: `Arealet er omtrent ${num(area, 1)}.`,
          },
        },
      ],
      answerLatex: String.raw`$A \approx ${num(area, 1)}$`,
      takeaway: 'Arealsetningen krever vinkelen *mellom* de to sidene, og husk halvparten.',
    };
  },
};

export const TRIGONOMETRY_TEMPLATES: readonly ExerciseTemplate[] = [
  pythagorasTemplate,
  sineLawTemplate,
  cosineLawTemplate,
  areaTemplate,
];
