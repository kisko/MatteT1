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
  signedTerm,
  wrong,
} from './seed.js';

const powerRuleTemplate: ExerciseTemplate = {
  id: 'T-ALG-01',
  topic: Lk20Topic1T.TALL_OG_ALGEBRA,
  goalId: 'ALG-01',
  skillLabel: 'Potensfunksjoner',
  title: 'Potensregler',
  description: 'Gange potenser med samme grunntall.',
  variantCount: 60,
  generate: (seed) => {
    const variable = pickFrom(seed, 1, ['x', 'a'] as const);
    const first = intBetween(seed, 2, 2, 7);
    const second = intBetween(seed, 3, 3, 7);
    const sum = first + second;
    const product = first * second;

    return {
      id: `T-ALG-01-s${seed}`,
      topic: Lk20Topic1T.TALL_OG_ALGEBRA,
      goalId: 'ALG-01',
      skillLabel: 'Potensfunksjoner',
      title: 'Gange potenser med samme grunntall',
      situation: `Du skal forenkle et produkt av to potenser med samme grunntall $${variable}$.`,
      problemLatex: String.raw`$${variable}^{${first}} \cdot ${variable}^{${second}}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilken potensregel gjelder her?',
          options: distinctOptions(
            right('legg-sammen', String.raw`$a^m \cdot a^n = a^{m+n}$`, 'Riktig. Samme grunntall som ganges: legg sammen eksponentene.'),
            [
              wrong(
                'gang-eksponenter',
                String.raw`$a^m \cdot a^n = a^{m\cdot n}$`,
                'Eksponentene skal ikke ganges. Det er antall faktorer som legges sammen.',
                MisconceptionType.EXPONENT_RULE_ERROR
              ),
              wrong(
                'trekk-fra',
                String.raw`$a^m \cdot a^n = a^{m-n}$`,
                'Subtraksjon av eksponenter hører til divisjon.',
                MisconceptionType.EXPONENT_RULE_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$${variable}^{${first}} \cdot ${variable}^{${second}} = ${variable}^{${first}+${second}}$`,
          rationale: String.raw`$${variable}^{${first}}$ er ${first} faktorer og $${variable}^{${second}}$ er ${second} faktorer. Til sammen står det ${sum} faktorer.`,
          hint: 'Skriv ut noen få faktorer for hånd og tell dem.',
          visual: {
            kind: 'bars',
            bars: [
              { label: `${variable}^${first}`, value: first, tone: 'primary' },
              { label: `${variable}^${second}`, value: second, tone: 'accent' },
              { label: 'til sammen', value: sum, tone: 'correct' },
            ],
            caption: `Faktorene legges i samme haug: ${first} + ${second} = ${sum}.`,
          },
        },
        {
          kind: 'transform',
          prompt: 'Hva blir uttrykket forenklet?',
          options: distinctOptions(
            right('riktig', String.raw`$${variable}^{${sum}}$`, `Riktig. ${first} + ${second} = ${sum}.`),
            [
              wrong(
                'ganget',
                String.raw`$${variable}^{${product}}$`,
                `Her ble eksponentene ganget: ${first} · ${second} = ${product}. De skal legges sammen.`,
                MisconceptionType.EXPONENT_RULE_ERROR
              ),
              wrong(
                'doblet-grunntall',
                String.raw`$2${variable}^{${sum}}$`,
                'Eksponenten er riktig, men grunntallene skal ikke legges sammen foran potensen.',
                MisconceptionType.EXPONENT_RULE_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$${variable}^{${sum}}$`,
          rationale: `Eksponentene adderes, og grunntallet står uendret.`,
          hint: `Legg sammen ${first} og ${second}.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: `riktig: ${variable}^${sum}`, value: sum, tone: 'correct' },
              { label: `feil: ${variable}^${product}`, value: product, tone: 'error' },
            ],
            caption: 'Eksponenten er antall faktorer. Ganging blåser den opp helt feil.',
          },
        },
        {
          kind: 'interpret',
          prompt: `Hvor mange faktorer $${variable}$ står det i uttrykket til sammen?`,
          options: distinctOptions(
            right('sum', `${sum}`, `Riktig. ${first} faktorer pluss ${second} faktorer blir ${sum}.`),
            [
              wrong(
                'produkt',
                `${product}`,
                'Det er eksponentene ganget sammen. Faktorene skal telles, altså adderes.',
                MisconceptionType.EXPONENT_RULE_ERROR
              ),
              wrong('to', '2', 'Det er antall potenser i produktet, ikke antall faktorer.'),
            ]
          ),
          resultLatex: String.raw`$${sum}$ faktorer, altså $${variable}^{${sum}}$`,
          rationale: 'Eksponenten forteller alltid hvor mange faktorer grunntallet har.',
          hint: `Tell faktorene i hver potens, og legg dem sammen.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: `${variable}^${first}`, value: first, tone: 'primary' },
              { label: `${variable}^${second}`, value: second, tone: 'accent' },
              { label: `${variable}^${sum}`, value: sum, tone: 'correct' },
            ],
            caption: 'Samme haug, sett fra tre sider.',
          },
        },
      ],
      answerLatex: String.raw`$${variable}^{${first}} \cdot ${variable}^{${second}} = ${variable}^{${sum}}$`,
      takeaway: 'Ganger du potenser med samme grunntall, legger du sammen eksponentene.',
    };
  },
};

const squareTemplate: ExerciseTemplate = {
  id: 'T-ALG-02',
  topic: Lk20Topic1T.TALL_OG_ALGEBRA,
  goalId: 'ALG-02',
  skillLabel: 'Faktorisering',
  title: 'Kvadratsetningene',
  description: 'Utvikle et kvadrat av en parentes.',
  variantCount: 44,
  generate: (seed) => {
    const variable = pickFrom(seed, 1, ['x', 'y'] as const);
    const size = intBetween(seed, 2, 2, 12);
    const sign = pickFrom(seed, 3, [1, -1] as const);
    const signedSize = size * sign;
    const middle = 2 * signedSize;
    const constant = size * size;

    // Kontrollverdi: begge sider regnes ut for variable = 1.
    const checkCorrect = (1 + signedSize) ** 2;
    const checkWithoutMiddle = 1 + constant;

    const inner = `${variable} ${sign > 0 ? '+' : '-'} ${size}`;
    const expanded = String.raw`${variable}^2 ${signedTerm(middle, variable)} + ${constant}`;

    return {
      id: `T-ALG-02-s${seed}`,
      topic: Lk20Topic1T.TALL_OG_ALGEBRA,
      goalId: 'ALG-02',
      skillLabel: 'Faktorisering',
      title: 'Utvikle et kvadrat',
      situation: `Et kvadrat har sider på $${inner}$. Du skal finne arealet som et utviklet uttrykk.`,
      problemLatex: String.raw`$(${inner})^2$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: `Hvilken regel gjelder for $(${inner})^2$?`,
          options: distinctOptions(
            right(
              'kvadratsetning',
              sign > 0
                ? String.raw`$(a+b)^2 = a^2 + 2ab + b^2$`
                : String.raw`$(a-b)^2 = a^2 - 2ab + b^2$`,
              'Riktig. Første kvadrat, dobbelt produkt, siste kvadrat.'
            ),
            [
              wrong(
                'kun-kvadrater',
                String.raw`$(a${sign > 0 ? '+' : '-'}b)^2 = a^2 ${sign > 0 ? '+' : '-'} b^2$`,
                'Det doble produktet mangler. Arealmodellen har fire ruter, ikke to.',
                MisconceptionType.BRACKET_EXPANSION_ERROR
              ),
              wrong('konjugat', String.raw`$(a+b)^2 = (a+b)(a-b)$`, 'Det er konjugatsetningen, og den hører til $a^2-b^2$.'),
            ]
          ),
          resultLatex: String.raw`$(${inner})^2 = ${variable}^2 ${sign > 0 ? '+' : '-'} 2\cdot ${variable}\cdot ${size} + ${size}^2$`,
          rationale: `Å kvadrere en parentes er å gange den med seg selv. Da oppstår to like kryssprodukter.`,
          hint: `Tegn et kvadrat med sider $${inner}$ og del det i fire ruter.`,
          visual: {
            kind: 'areaModel',
            rowLabels: [variable, `${sign > 0 ? '' : '-'}${size}`],
            columnLabels: [variable, `${sign > 0 ? '' : '-'}${size}`],
            parts: [
              { rowLabel: variable, columnLabel: variable, productLatex: `${variable}^2`, tone: 'primary' },
              {
                rowLabel: variable,
                columnLabel: `${sign > 0 ? '' : '-'}${size}`,
                productLatex: `${signedSize < 0 ? '-' : ''}${size}${variable}`,
                tone: 'accent',
              },
              {
                rowLabel: `${sign > 0 ? '' : '-'}${size}`,
                columnLabel: variable,
                productLatex: `${signedSize < 0 ? '-' : ''}${size}${variable}`,
                tone: 'accent',
              },
              {
                rowLabel: `${sign > 0 ? '' : '-'}${size}`,
                columnLabel: `${sign > 0 ? '' : '-'}${size}`,
                productLatex: `${constant}`,
                tone: 'muted',
              },
            ],
            caption: `De to markerte rutene er det doble produktet: $${signedTerm(middle, variable)}$.`,
          },
        },
        {
          kind: 'transform',
          prompt: 'Regn ut leddene. Hva blir uttrykket utviklet?',
          options: distinctOptions(
            right('riktig', `$${expanded}$`, `Riktig. $2\\cdot ${size} = ${Math.abs(middle)}$ og $${size}^2 = ${constant}$.`),
            [
              wrong(
                'mangler-midtledd',
                String.raw`$${variable}^2 + ${constant}$`,
                'Midtleddet mangler helt. Uten det stemmer ikke uttrykket for noen verdi av variabelen.',
                MisconceptionType.BRACKET_EXPANSION_ERROR
              ),
              wrong(
                'halvt-midtledd',
                String.raw`$${variable}^2 ${signedTerm(signedSize, variable)} + ${constant}$`,
                'Du tok bare ett av de to like kryssproduktene. Det er to av dem.',
                MisconceptionType.BRACKET_EXPANSION_ERROR
              ),
              wrong(
                'feil-konstant',
                String.raw`$${variable}^2 ${signedTerm(middle, variable)} + ${2 * size}$`,
                `Siste ledd er $${size}^2 = ${constant}$, ikke $${size}\\cdot 2$.`
              ),
            ]
          ),
          resultLatex: `$${expanded}$`,
          rationale: 'De to kryssproduktene er like store, og til sammen blir de det doble produktet.',
          hint: 'Legg sammen arealene av de fire rutene i modellen.',
          visual: {
            kind: 'areaModel',
            rowLabels: [variable, `${sign > 0 ? '' : '-'}${size}`],
            columnLabels: [variable, `${sign > 0 ? '' : '-'}${size}`],
            parts: [
              { rowLabel: variable, columnLabel: variable, productLatex: `${variable}^2`, tone: 'correct' },
              {
                rowLabel: variable,
                columnLabel: `${sign > 0 ? '' : '-'}${size}`,
                productLatex: `${signedSize < 0 ? '-' : ''}${size}${variable}`,
                tone: 'correct',
              },
              {
                rowLabel: `${sign > 0 ? '' : '-'}${size}`,
                columnLabel: variable,
                productLatex: `${signedSize < 0 ? '-' : ''}${size}${variable}`,
                tone: 'correct',
              },
              {
                rowLabel: `${sign > 0 ? '' : '-'}${size}`,
                columnLabel: `${sign > 0 ? '' : '-'}${size}`,
                productLatex: `${constant}`,
                tone: 'correct',
              },
            ],
            caption: `Alle fire rutene er med: $${expanded}$.`,
          },
        },
        {
          kind: 'checkResult',
          prompt: `Kontroller med $${variable} = 1$. Hvilken kontroll viser at utviklingen er riktig?`,
          options: distinctOptions(
            right(
              'innsetting',
              String.raw`$(1 ${sign > 0 ? '+' : '-'} ${size})^2 = ${checkCorrect}$ og $1 ${signedNumber(middle)} + ${constant} = ${checkCorrect}$`,
              'Riktig. Like verdier for en tilfeldig verdi er et sterkt tegn på at omskrivingen er lovlig.'
            ),
            [
              wrong(
                'uten-midtledd',
                String.raw`$(1 ${sign > 0 ? '+' : '-'} ${size})^2 = ${checkCorrect}$ og $1 + ${constant} = ${checkWithoutMiddle}$`,
                `Sidene blir ulike (${checkCorrect} mot ${checkWithoutMiddle}), og det er nettopp beviset for at midtleddet må være med.`,
                MisconceptionType.BRACKET_EXPANSION_ERROR
              ),
              wrong(
                'kvadrer-ledd',
                String.raw`$(1 ${sign > 0 ? '+' : '-'} ${size})^2 = 1 + ${constant} = ${checkWithoutMiddle}$`,
                'Du kan ikke kvadrere ledd for ledd. Regn ut parentesen først.',
                MisconceptionType.BRACKET_EXPANSION_ERROR
              ),
            ]
          ),
          resultLatex: `$${checkCorrect} = ${checkCorrect}$`,
          rationale: 'En omskriving skal gjelde for alle verdier. Får du ulike svar for ett tall, har du funnet en feil.',
          hint: `Regn ut venstre og høyre side hver for seg med $${variable} = 1$.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: 'parentesen', value: Math.abs(checkCorrect), tone: 'primary' },
              { label: 'utviklet', value: Math.abs(checkCorrect), tone: 'correct' },
              { label: 'uten midtledd', value: Math.abs(checkWithoutMiddle), tone: 'error' },
            ],
            caption: 'To like stolper betyr lovlig omskriving. Den røde avslører det manglende midtleddet.',
          },
        },
      ],
      answerLatex: `$(${inner})^2 = ${expanded}$`,
      takeaway: 'Det doble produktet er alltid to like rektangler i arealmodellen. Ser du dem, glemmer du dem ikke.',
    };
  },
};

const rationalTemplate: ExerciseTemplate = {
  id: 'T-ALG-03',
  topic: Lk20Topic1T.TALL_OG_ALGEBRA,
  goalId: 'ALG-03',
  skillLabel: 'Rasjonale uttrykk',
  title: 'Rasjonale uttrykk',
  description: 'Forkorte en brøk og holde styr på definisjonsmengden.',
  variantCount: 32,
  generate: (seed) => {
    const variable = pickFrom(seed, 1, ['x', 't'] as const);
    const root = intBetween(seed, 2, 2, 9);
    const square = root * root;

    return {
      id: `T-ALG-03-s${seed}`,
      topic: Lk20Topic1T.TALL_OG_ALGEBRA,
      goalId: 'ALG-03',
      skillLabel: 'Rasjonale uttrykk',
      title: 'Forkort brøken',
      situation: `Du skal forenkle en brøk der teller og nevner har en felles faktor.`,
      problemLatex: String.raw`$\frac{${variable}^2 - ${square}}{${variable} - ${root}}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hva er første lovlige steg?',
          options: distinctOptions(
            right(
              'faktoriser',
              String.raw`Faktoriser telleren: $${variable}^2 - ${square} = (${variable} - ${root})(${variable} + ${root})$`,
              'Riktig. Konjugatsetningen gir en felles faktor med nevneren.'
            ),
            [
              wrong(
                'forkort-ledd',
                String.raw`Forkort $${variable}^2$ mot $${variable}$ og $${square}$ mot $${root}$`,
                'Du kan bare forkorte hele faktorer, aldri ledd for ledd.',
                MisconceptionType.FRACTION_ADDITION
              ),
              wrong(
                'gang-opp',
                String.raw`Gang begge sider med $${variable} - ${root}$`,
                'Dette er et uttrykk, ikke en likning. Det finnes ingen «begge sider» å gange med.'
              ),
            ]
          ),
          resultLatex: String.raw`$\frac{(${variable} - ${root})(${variable} + ${root})}{${variable} - ${root}}$`,
          rationale: `Konjugatsetningen: $a^2 - b^2 = (a-b)(a+b)$. Her er $a = ${variable}$ og $b = ${root}$.`,
          hint: `Ser du at $${square}$ er $${root}^2$? Da er telleren en differanse mellom to kvadrater.`,
          visual: {
            kind: 'areaModel',
            rowLabels: [variable, `-${root}`],
            columnLabels: [variable, `${root}`],
            parts: [
              { rowLabel: variable, columnLabel: `${root}`, productLatex: `${root}${variable}`, tone: 'accent' },
              { rowLabel: variable, columnLabel: variable, productLatex: `${variable}^2`, tone: 'primary' },
              { rowLabel: `-${root}`, columnLabel: variable, productLatex: `-${root}${variable}`, tone: 'accent' },
              { rowLabel: `-${root}`, columnLabel: `${root}`, productLatex: `-${square}`, tone: 'muted' },
            ],
            caption: `De to midtleddene kansellerer hverandre, og da står $${variable}^2 - ${square}$ igjen.`,
          },
        },
        {
          kind: 'transform',
          prompt: 'Forkort brøken.',
          options: distinctOptions(
            right('riktig', String.raw`$${variable} + ${root}$`, `Riktig. Faktoren $${variable} - ${root}$ står i både teller og nevner og forkortes bort.`),
            [
              wrong(
                'feil-faktor',
                String.raw`$${variable} - ${root}$`,
                `Det er faktoren $${variable} - ${root}$ som forkortes bort. Da står den andre faktoren igjen.`,
                MisconceptionType.SIGN_ERROR
              ),
              wrong(
                'delvis',
                String.raw`$${variable}^2 - ${root}$`,
                'Her er bare deler av uttrykket forkortet. Forkorting gjelder hele faktorer.',
                MisconceptionType.FRACTION_ADDITION
              ),
            ]
          ),
          resultLatex: String.raw`$${variable} + ${root}$`,
          rationale: 'Når samme faktor står i teller og nevner, er brøken lik 1 for den faktoren, og den kan strykes.',
          hint: 'Hvilken faktor er felles for teller og nevner?',
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [root, 1], tone: 'correct', label: `${variable} + ${root}` }],
            markers: [{ x: root, y: 2 * root, label: 'ikke definert her', tone: 'error' }],
            xRange: [-root - 2, root + 4],
            caption: `Grafen er en rett linje, men punktet der $${variable} = ${root}$ er ikke med.`,
          },
        },
        {
          kind: 'interpret',
          prompt: 'Hvilken begrensning må følge med svaret?',
          options: distinctOptions(
            right('riktig', String.raw`$${variable} \ne ${root}$`, `Riktig. I den opprinnelige brøken ble nevneren null for $${variable} = ${root}$.`),
            [
              wrong(
                'ingen',
                'Ingen begrensning, siden nevneren er forkortet bort',
                'Begrensningen kommer fra det opprinnelige uttrykket, og den forsvinner ikke ved forkorting.',
                MisconceptionType.UNIT_INTERPRETATION_ERROR
              ),
              wrong(
                'negativ',
                String.raw`$${variable} \ne -${root}$`,
                `Nevneren er $${variable} - ${root}$, og den er null når $${variable} = ${root}$.`,
                MisconceptionType.SIGN_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$\frac{${variable}^2 - ${square}}{${variable} - ${root}} = ${variable} + ${root}, \quad ${variable} \ne ${root}$`,
          rationale:
            'Definisjonsmengden bestemmes av det opprinnelige uttrykket. Forkorting endrer skrivemåten, ikke hvilke verdier som var ulovlige.',
          hint: 'For hvilken verdi blir den opprinnelige nevneren null?',
          visual: {
            kind: 'numberline',
            min: -root - 2,
            max: root + 4,
            points: [{ value: root, label: `${variable} ≠ ${root}`, tone: 'error', open: true }],
            caption: 'Åpen sirkel: alle andre verdier er lovlige, men akkurat denne er ikke.',
          },
        },
      ],
      answerLatex: String.raw`$${variable} + ${root}, \quad ${variable} \ne ${root}$`,
      takeaway: 'Faktoriser før du forkorter, og ta alltid med begrensningen fra den opprinnelige nevneren.',
    };
  },
};

const polynomialDivisionTemplate: ExerciseTemplate = {
  id: 'T-ALG-04',
  topic: Lk20Topic1T.TALL_OG_ALGEBRA,
  goalId: 'ALG-04',
  skillLabel: 'Polynomdivisjon',
  title: 'Polynomdivisjon',
  description: 'Dele et andregradsuttrykk på en kjent faktor.',
  variantCount: 30,
  generate: (seed) => {
    const first = intBetween(seed, 1, 2, 7);
    const secondCandidate = intBetween(seed, 2, 2, 7);
    const second = secondCandidate === first ? (first % 7) + 2 : secondCandidate;
    const sum = first + second;
    const product = first * second;

    return {
      id: `T-ALG-04-s${seed}`,
      topic: Lk20Topic1T.TALL_OG_ALGEBRA,
      goalId: 'ALG-04',
      skillLabel: 'Polynomdivisjon',
      title: 'Del polynomet',
      situation: 'Du skal dele et andregradsuttrykk på en førstegradsfaktor.',
      problemLatex: String.raw`$\frac{x^2 + ${sum}x + ${product}}{x + ${first}}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hva er raskeste vei til svaret?',
          options: distinctOptions(
            right(
              'faktoriser',
              String.raw`Finn to tall med sum $${sum}$ og produkt $${product}$`,
              `Riktig. Tallene er ${first} og ${second}, så telleren er $(x + ${first})(x + ${second})$.`
            ),
            [
              wrong(
                'del-hvert-ledd',
                String.raw`Del hvert ledd i telleren på $x$`,
                'Nevneren er $x + ' + first + '$, ikke $x$. Du kan ikke dele på bare en del av nevneren.',
                MisconceptionType.FRACTION_ADDITION
              ),
              wrong(
                'forkort',
                String.raw`Forkort $x^2$ mot $x$`,
                'Forkorting gjelder hele faktorer, aldri enkeltledd.',
                MisconceptionType.FRACTION_ADDITION
              ),
            ]
          ),
          resultLatex: String.raw`$x^2 + ${sum}x + ${product} = (x + ${first})(x + ${second})$`,
          rationale: `To tall som har sum ${sum} og produkt ${product} er ${first} og ${second}. Da er telleren faktorisert.`,
          hint: `Hvilke to tall ganger til ${product} og legger til ${sum}?`,
          visual: {
            kind: 'areaModel',
            rowLabels: ['x', `${first}`],
            columnLabels: ['x', `${second}`],
            parts: [
              { rowLabel: 'x', columnLabel: 'x', productLatex: 'x^2', tone: 'primary' },
              { rowLabel: 'x', columnLabel: `${second}`, productLatex: `${second}x`, tone: 'accent' },
              { rowLabel: `${first}`, columnLabel: 'x', productLatex: `${first}x`, tone: 'accent' },
              { rowLabel: `${first}`, columnLabel: `${second}`, productLatex: `${product}`, tone: 'muted' },
            ],
            caption: `De to $x$-leddene blir ${first}x + ${second}x = ${sum}x.`,
          },
        },
        {
          kind: 'transform',
          prompt: 'Forkort brøken.',
          options: distinctOptions(
            right('riktig', String.raw`$x + ${second}$`, `Riktig. Faktoren $x + ${first}$ forkortes bort, og $x + ${second}$ står igjen.`),
            [
              wrong(
                'feil-faktor',
                String.raw`$x + ${first}$`,
                `Det er $x + ${first}$ som forkortes bort. Da er det den andre faktoren som står igjen.`
              ),
              wrong(
                'sum-og-produkt',
                String.raw`$x + ${sum}$`,
                `$${sum}$ er summen av de to tallene, ikke den gjenstående faktoren.`
              ),
              wrong(
                'fortegn',
                String.raw`$x - ${second}$`,
                'Begge tallene er positive her, så fortegnet i faktoren skal være pluss.',
                MisconceptionType.SIGN_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$x + ${second}$`,
          rationale: 'Samme faktor i teller og nevner forkortes bort, akkurat som i en tallbrøk.',
          hint: `Skriv brøken som $\\frac{(x + ${first})(x + ${second})}{x + ${first}}$ først.`,
          visual: {
            kind: 'graph',
            curves: [{ kind: 'polynomial', coefficients: [second, 1], tone: 'correct', label: `x + ${second}` }],
            xRange: [-second - 3, 5],
            caption: `Kvotienten er en rett linje med nullpunkt i $x = -${second}$.`,
          },
        },
        {
          kind: 'checkResult',
          prompt: 'Kontroller ved å gange tilbake. Hva skal du få?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$(x + ${first})(x + ${second}) = x^2 + ${sum}x + ${product}$`,
              'Riktig. Ganger du kvotienten med nevneren, skal du få telleren tilbake.'
            ),
            [
              wrong(
                'uten-midtledd',
                String.raw`$(x + ${first})(x + ${second}) = x^2 + ${product}$`,
                'Midtleddene mangler. Hvert ledd i den første parentesen skal ganges med hvert ledd i den andre.',
                MisconceptionType.BRACKET_EXPANSION_ERROR
              ),
              wrong(
                'feil-sum',
                String.raw`$(x + ${first})(x + ${second}) = x^2 + ${product}x + ${sum}$`,
                `Sum og produkt har byttet plass: $x$-leddet er ${sum}x, og konstantleddet er ${product}.`
              ),
            ]
          ),
          resultLatex: String.raw`$x^2 + ${sum}x + ${product}$`,
          rationale: 'Divisjon og multiplikasjon er motsatte operasjoner. Gang tilbake, og du har kontrollert svaret.',
          hint: 'Bruk arealmodellen baklengs.',
          visual: {
            kind: 'areaModel',
            rowLabels: ['x', `${first}`],
            columnLabels: ['x', `${second}`],
            parts: [
              { rowLabel: 'x', columnLabel: 'x', productLatex: 'x^2', tone: 'correct' },
              { rowLabel: 'x', columnLabel: `${second}`, productLatex: `${second}x`, tone: 'correct' },
              { rowLabel: `${first}`, columnLabel: 'x', productLatex: `${first}x`, tone: 'correct' },
              { rowLabel: `${first}`, columnLabel: `${second}`, productLatex: `${product}`, tone: 'correct' },
            ],
            caption: `Alle fire rutene til sammen: $x^2 + ${sum}x + ${product}$.`,
          },
        },
      ],
      answerLatex: String.raw`$\frac{x^2 + ${sum}x + ${product}}{x + ${first}} = x + ${second}, \quad x \ne -${first}$`,
      takeaway: 'Faktoriser telleren og forkort. Gang tilbake til slutt, så vet du at svaret stemmer.',
    };
  },
};

export const ALGEBRA_TEMPLATES: readonly ExerciseTemplate[] = [
  powerRuleTemplate,
  squareTemplate,
  rationalTemplate,
  polynomialDivisionTemplate,
];

/** Eksporteres for bruk i andre maler som trenger samme tallformatering. */
export const formatNumber = num;
