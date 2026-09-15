import { Lk20Topic1T } from '../../../model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../../../model/task/Misconception.js';
import { ExerciseTemplate } from '../../../model/guided/ExerciseTemplate.js';
import {
  binomial,
  distinctOptions,
  factorial,
  intBetween,
  num,
  ordered,
  pickFrom,
  reducedFraction,
  right,
  wrong,
} from './seed.js';

const basicProbabilityTemplate: ExerciseTemplate = {
  id: 'T-SAN-01',
  topic: Lk20Topic1T.SANNSYNLIGHET,
  goalId: 'SAN-01',
  skillLabel: 'Grunnsannsynlighet',
  title: 'Grunnsannsynlighet',
  description: 'Regne ut sannsynlighet og bruke komplementregelen.',
  variantCount: 120,
  generate: (seed) => {
    const total = pickFrom(seed, 1, [10, 12, 16, 20, 24, 25, 30, 40] as const);
    const favourable = intBetween(seed, 2, 2, total - 2);
    const probability = favourable / total;
    const complement = 1 - probability;
    const inverted = total / favourable;

    return {
      id: `T-SAN-01-s${seed}`,
      topic: Lk20Topic1T.SANNSYNLIGHET,
      goalId: 'SAN-01',
      skillLabel: 'Grunnsannsynlighet',
      title: 'Hva er sjansen?',
      situation: `I en bøtte ligger ${total} lodd. ${favourable} av dem er vinnerlodd. Du trekker ett lodd.`,
      problemLatex: String.raw`$P(\text{vinner}) = ?$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilken brøk gir sannsynligheten for å vinne?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$\frac{${favourable}}{${total}}$`,
              'Riktig. Gunstige utfall delt på alle mulige utfall.'
            ),
            [
              wrong(
                'opp-ned',
                String.raw`$\frac{${total}}{${favourable}}$`,
                `Det gir ${num(inverted)}, altså mer enn 1. En sannsynlighet kan aldri overstige 1.`
              ),
              wrong(
                'feil-nevner',
                String.raw`$\frac{${favourable}}{${total - favourable}}$`,
                `Nevneren skal være alle loddene (${total}), ikke bare taperloddene (${total - favourable}).`
              ),
            ]
          ),
          resultLatex: String.raw`$P(\text{vinner}) = \frac{${favourable}}{${total}}$`,
          rationale: 'Når alle utfall er like sannsynlige, er sannsynligheten gunstige delt på mulige.',
          hint: 'Hvor mange lodd kan du trekke i alt?',
          visual: {
            kind: 'bars',
            bars: [
              { label: 'vinnerlodd', value: favourable, tone: 'correct' },
              { label: 'alle lodd', value: total, tone: 'primary' },
            ],
            caption: 'Sannsynlighet sammenligner de gunstige utfallene med hele utfallsrommet.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Skriv sannsynligheten som desimaltall og prosent.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$${reducedFraction(favourable, total)} = ${num(probability)} = ${num(probability * 100, 1)}\%$`,
              `Riktig. ${favourable} delt på ${total} er ${num(probability)}.`
            ),
            [
              // Ved p = 0,5 er komplementet like stort som fasit, og
              // distraktøren ville hatt riktig verdi.
              ...(probability === complement
                ? []
                : [
                    wrong(
                      'komplement-forvekslet',
                      String.raw`$${num(complement)} = ${num(complement * 100, 1)}\%$`,
                      'Dette er sannsynligheten for å *ikke* vinne.',
                      MisconceptionType.PROBABILITY_COMBINATION_ERROR
                    ),
                  ]),
              wrong(
                'over-en',
                String.raw`$${num(inverted)}$`,
                'Brøken står opp ned. Sannsynligheten må ligge mellom 0 og 1.'
              ),
            ]
          ),
          resultLatex: String.raw`$P(\text{vinner}) = ${num(probability)} = ${num(probability * 100, 1)}\%$`,
          rationale: 'Desimaltall og prosent er samme tall i to drakter.',
          hint: `Del ${favourable} på ${total}.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: `vinner ${num(probability * 100, 0)} %`, value: probability * 100, tone: 'correct' },
              { label: 'hele utfallsrommet', value: 100, tone: 'primary' },
            ],
            caption: 'Sannsynligheten er en andel av hele utfallsrommet.',
          },
        },
        {
          kind: 'interpret',
          prompt: 'Hva er sannsynligheten for å *ikke* vinne?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$1 - ${num(probability)} = ${num(complement)}$`,
              'Riktig. Komplementregelen: alle utfall til sammen har sannsynlighet 1.'
            ),
            [
              wrong(
                'samme',
                String.raw`$${num(probability)}$, like stor som å vinne`,
                `De to må summere til 1, og ${num(probability)} + ${num(probability)} er ikke 1 her.`,
                MisconceptionType.PROBABILITY_COMBINATION_ERROR
              ),
              wrong(
                'feil-brok',
                String.raw`$\frac{${total - favourable}}{${favourable}}$`,
                `Nevneren må fortsatt være ${total}. Da får du ${num(complement)}.`
              ),
            ]
          ),
          resultLatex: String.raw`$P(\text{ikke vinner}) = ${num(complement)} = ${num(complement * 100, 1)}\%$`,
          rationale: 'Komplementregelen er $P(\\text{ikke } A) = 1 - P(A)$, fordi noe alltid skjer.',
          hint: `Hvor mye må legges til ${num(probability)} for å komme til 1?`,
          visual: {
            kind: 'bars',
            bars: [
              { label: `vinner ${num(probability * 100, 0)} %`, value: probability * 100, tone: 'correct' },
              { label: `ikke vinner ${num(complement * 100, 0)} %`, value: complement * 100, tone: 'accent' },
            ],
            caption: 'De to søylene dekker til sammen hele utfallsrommet.',
          },
        },
      ],
      answerLatex: String.raw`$P(\text{vinner}) = ${num(probability)}$ og $P(\text{ikke vinner}) = ${num(complement)}$`,
      takeaway: 'Tell gunstige og mulige utfall. Bruk komplementregelen når «ikke» eller «minst» står i oppgaven.',
    };
  },
};

const combinatoricsTemplate: ExerciseTemplate = {
  id: 'T-SAN-02',
  topic: Lk20Topic1T.SANNSYNLIGHET,
  goalId: 'SAN-02',
  skillLabel: 'Kombinatorikk',
  title: 'Kombinatorikk',
  description: 'Avgjøre om rekkefølgen betyr noe, og telle riktig.',
  variantCount: 40,
  generate: (seed) => {
    const people = intBetween(seed, 1, 5, 9);
    const choose = pickFrom(seed, 2, [2, 3] as const);
    const orderMatters = pickFrom(seed, 3, [true, false] as const);

    const unorderedCount = binomial(people, choose);
    const orderedCount = ordered(people, choose);
    const correctCount = orderMatters ? orderedCount : unorderedCount;
    const wrongCount = orderMatters ? unorderedCount : orderedCount;

    const situation = orderMatters
      ? `${people} elever løper om kapp. Du skal finne hvor mange ulike måter de ${choose} første plassene kan fordeles på.`
      : `${people} elever skal velge en komité på ${choose} personer. Alle i komiteen er likestilte.`;

    return {
      id: `T-SAN-02-s${seed}`,
      topic: Lk20Topic1T.SANNSYNLIGHET,
      goalId: 'SAN-02',
      skillLabel: 'Kombinatorikk',
      title: orderMatters ? 'Tell plasseringer' : 'Tell utvalg',
      situation,
      problemLatex: String.raw`$n = ${people}, \quad k = ${choose}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Betyr rekkefølgen noe i denne situasjonen?',
          options: distinctOptions(
            right(
              'riktig',
              orderMatters ? 'Ja, rekkefølgen betyr noe' : 'Nei, rekkefølgen betyr ingenting',
              orderMatters
                ? 'Riktig. Førsteplass og andreplass er to ulike utfall.'
                : 'Riktig. Komiteen er den samme uansett hvilken rekkefølge navnene skrives i.'
            ),
            [
              wrong(
                'motsatt',
                orderMatters ? 'Nei, rekkefølgen betyr ingenting' : 'Ja, rekkefølgen betyr noe',
                orderMatters
                  ? 'Her er plasseringene ulike roller, så to elever kan bytte plass og gi et nytt utfall.'
                  : 'Her har alle samme rolle, så samme personer i annen rekkefølge er samme komité.',
                MisconceptionType.COMBINATORICS_ORDER_ERROR
              ),
              wrong(
                'kommer-an',
                'Det kommer an på hvilke elever som velges',
                'Spørsmålet avgjøres av situasjonen, ikke av hvem som velges.',
                MisconceptionType.COMBINATORICS_ORDER_ERROR
              ),
            ]
          ),
          resultLatex: orderMatters
            ? String.raw`Antall ordnede utvalg: $\frac{${people}!}{(${people}-${choose})!}$`
            : String.raw`Antall uordnede utvalg: $\binom{${people}}{${choose}}$`,
          rationale: orderMatters
            ? 'Når roller er ulike, teller hver rekkefølge som sitt eget utfall.'
            : 'Når roller er like, må du dele bort alle rekkefølgene av de samme personene.',
          hint: 'Ville utfallet vært et annet om to av de valgte byttet plass?',
          visual: {
            kind: 'bars',
            bars: [
              { label: 'uten rekkefølge', value: unorderedCount, tone: orderMatters ? 'muted' : 'correct' },
              { label: 'med rekkefølge', value: orderedCount, tone: orderMatters ? 'correct' : 'muted' },
            ],
            caption: `Med rekkefølge er det ${factorial(choose)} ganger så mange muligheter.`,
          },
        },
        {
          kind: 'transform',
          prompt: 'Regn ut antallet.',
          options: distinctOptions(
            right(
              'riktig',
              orderMatters
                ? String.raw`$\frac{${people}!}{${people - choose}!} = ${orderedCount}$`
                : String.raw`$\binom{${people}}{${choose}} = ${unorderedCount}$`,
              `Riktig. Det finnes ${correctCount} muligheter.`
            ),
            [
              wrong(
                'annen-telling',
                String.raw`$${wrongCount}$`,
                orderMatters
                  ? `Her er rekkefølgen delt bort. Da mister du at plasseringene er ulike roller.`
                  : `Her er rekkefølgen tatt med. Da teller du samme komité ${factorial(choose)} ganger.`,
                MisconceptionType.COMBINATORICS_ORDER_ERROR
              ),
              // Utelates når n·k tilfeldigvis treffer riktig antall
              // (for eksempel er C(5,2) = 5·2 = 10).
              ...(people * choose === correctCount
                ? []
                : [
                    wrong(
                      'ganget-rett-fram',
                      String.raw`$${people}\cdot ${choose} = ${people * choose}$`,
                      'Antall valg avtar for hvert trinn, så dette blir for enkelt.',
                      MisconceptionType.COMBINATORICS_ORDER_ERROR
                    ),
                  ]),
            ]
          ),
          resultLatex: String.raw`$${correctCount}$ muligheter`,
          rationale: orderMatters
            ? `Det første valget har ${people} muligheter, det neste ${people - 1}, og så videre i ${choose} trinn.`
            : `Først teller du ${orderedCount} ordnede utvalg, og deler så på ${factorial(choose)} rekkefølger.`,
          hint: orderMatters
            ? `Gang ${people} med ${people - 1}${choose === 3 ? ` og ${people - 2}` : ''}.`
            : `Del det ordnede antallet ${orderedCount} på ${factorial(choose)}.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: 'uten rekkefølge', value: unorderedCount, tone: orderMatters ? 'muted' : 'correct' },
              { label: 'med rekkefølge', value: orderedCount, tone: orderMatters ? 'correct' : 'muted' },
            ],
            caption: `Forholdet mellom dem er alltid $${choose}! = ${factorial(choose)}$.`,
          },
        },
        {
          kind: 'interpret',
          prompt: `Hvorfor er de to tallene ${unorderedCount} og ${orderedCount} forskjellige?`,
          options: distinctOptions(
            right(
              'riktig',
              String.raw`Fordi hvert utvalg kan ordnes på $${choose}! = ${factorial(choose)}$ måter`,
              `Riktig. ${unorderedCount} · ${factorial(choose)} = ${orderedCount}.`
            ),
            [
              wrong(
                'tilfeldig',
                'Fordi den ene formelen er unøyaktig',
                'Begge er helt nøyaktige. De svarer på to ulike spørsmål.',
                MisconceptionType.COMBINATORICS_ORDER_ERROR
              ),
              wrong(
                'antall-personer',
                `Fordi den ene tar med alle ${people} elevene`,
                `Begge tar utgangspunkt i ${people} elever. Forskjellen er om rekkefølgen teller.`,
                MisconceptionType.COMBINATORICS_ORDER_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$${unorderedCount}\cdot ${choose}! = ${orderedCount}$`,
          rationale:
            'Ordnede og uordnede utvalg skiller seg alltid med en faktor $k!$, nemlig antall rekkefølger av de valgte.',
          hint: `Hvor mange måter kan ${choose} personer stilles i rekke?`,
          visual: {
            kind: 'bars',
            bars: [
              { label: `utvalg: ${unorderedCount}`, value: unorderedCount, tone: 'accent' },
              { label: `${choose}! = ${factorial(choose)}`, value: factorial(choose), tone: 'muted' },
              { label: `ordnet: ${orderedCount}`, value: orderedCount, tone: 'correct' },
            ],
            caption: `Utvalgene ganget med rekkefølgene gir de ordnede utfallene.`,
          },
        },
      ],
      answerLatex: String.raw`$${correctCount}$ muligheter`,
      takeaway: 'Spør alltid først om rekkefølgen betyr noe. Teller du utvalg, må rekkefølgene deles bort.',
    };
  },
};

const independenceTemplate: ExerciseTemplate = {
  id: 'T-SAN-03',
  topic: Lk20Topic1T.SANNSYNLIGHET,
  goalId: 'SAN-03',
  skillLabel: 'Betinget sannsynlighet',
  title: 'Uavhengige hendelser',
  description: 'Regne ut sannsynligheten for at to hendelser skjer samtidig.',
  variantCount: 36,
  generate: (seed) => {
    const pool = [0.2, 0.25, 0.4, 0.5, 0.6, 0.8] as const;
    const first = pickFrom(seed, 1, pool);
    const second = pickFrom(seed, 2, pool);

    const both = first * second;
    const added = first + second;
    const atLeastOne = 1 - (1 - first) * (1 - second);

    return {
      id: `T-SAN-03-s${seed}`,
      topic: Lk20Topic1T.SANNSYNLIGHET,
      goalId: 'SAN-03',
      skillLabel: 'Betinget sannsynlighet',
      title: 'Begge hendelsene',
      situation: `To uavhengige hendelser har sannsynlighet $P(A) = ${num(first)}$ og $P(B) = ${num(second)}$.`,
      problemLatex: String.raw`$P(A \cap B) = ?$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hva gjør du når to uavhengige hendelser skal skje samtidig?',
          options: distinctOptions(
            right('gang', String.raw`$P(A)\cdot P(B)$`, 'Riktig. Samtidig betyr multiplikasjon når hendelsene er uavhengige.'),
            [
              wrong(
                'legg-sammen',
                String.raw`$P(A) + P(B)$`,
                `Det gir ${num(added)}${added > 1 ? ', som er umulig siden sannsynlighet aldri overstiger 1' : ''}. Addisjon gjelder alternativer som ikke kan skje samtidig.`,
                MisconceptionType.PROBABILITY_COMBINATION_ERROR
              ),
              wrong(
                'trekk-fra',
                String.raw`$P(A) - P(B)$`,
                'Subtraksjon hører til komplementregelen, $1 - P(A)$.',
                MisconceptionType.PROBABILITY_COMBINATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$P(A \cap B) = ${num(first)}\cdot ${num(second)}$`,
          rationale:
            'Tenk på valgtreet: du følger én gren for $A$ og deretter én gren for $B$. Å følge en vei betyr å gange.',
          hint: 'Skal begge skje, eller er det nok at én av dem skjer?',
          visual: {
            kind: 'bars',
            bars: [
              { label: 'P(A)', value: first * 100, tone: 'primary' },
              { label: 'P(B)', value: second * 100, tone: 'accent' },
            ],
            caption: 'To uavhengige hendelser, hver med sin egen sannsynlighet i prosent.',
          },
        },
        {
          kind: 'transform',
          prompt: 'Regn ut sannsynligheten for at begge skjer.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$${num(first)}\cdot ${num(second)} = ${num(both)}$`,
              `Riktig. Det er ${num(both * 100, 1)} prosent sjanse for at begge skjer.`
            ),
            [
              wrong(
                'lagt-sammen',
                String.raw`$${num(first)} + ${num(second)} = ${num(added)}$`,
                `Addisjon gir ${num(added)}, og det er ${added > 1 ? 'umulig' : 'for høyt'} når begge må skje.`,
                MisconceptionType.PROBABILITY_COMBINATION_ERROR
              ),
              wrong(
                'minst-en',
                String.raw`$${num(atLeastOne)}$`,
                'Dette er sannsynligheten for at *minst én* av dem skjer, ikke at begge skjer.',
                MisconceptionType.PROBABILITY_COMBINATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$P(A \cap B) = ${num(both)}$`,
          rationale: 'Produktet av to tall mellom 0 og 1 er alltid mindre enn begge tallene.',
          hint: `Gang ${num(first)} med ${num(second)}.`,
          visual: {
            kind: 'bars',
            bars: [
              { label: 'P(A)', value: first * 100, tone: 'primary' },
              { label: 'P(B)', value: second * 100, tone: 'accent' },
              { label: 'begge', value: both * 100, tone: 'correct' },
            ],
            caption: 'Kravet om at begge skal skje gjør sannsynligheten mindre, ikke større.',
          },
        },
        {
          kind: 'interpret',
          prompt: 'Hva forteller svaret deg om kravet «begge må skje»?',
          options: distinctOptions(
            right(
              'riktig',
              'At det er mindre sannsynlig enn hver hendelse alene',
              `Riktig. ${num(both)} er mindre enn både ${num(first)} og ${num(second)}.`
            ),
            [
              wrong(
                'storre',
                'At det er mer sannsynlig enn hver hendelse alene',
                'Å kreve mer kan aldri gjøre noe mer sannsynlig. Flere krav gir lavere sannsynlighet.',
                MisconceptionType.PROBABILITY_COMBINATION_ERROR
              ),
              wrong(
                'samme',
                'At det er like sannsynlig som den minste av dem',
                `Det ville krevd at den andre hendelsen var helt sikker. Her er den ${num(Math.max(first, second))}.`,
                MisconceptionType.PROBABILITY_COMBINATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$${num(both)} < ${num(Math.min(first, second))}$`,
          rationale:
            'Hvert nytt krav du legger på, kan bare gjøre utfallet mindre sannsynlig. Det er en god rimelighetssjekk.',
          hint: 'Sammenlign svaret med de to opprinnelige sannsynlighetene.',
          visual: {
            kind: 'bars',
            bars: [
              { label: 'minst én', value: atLeastOne * 100, tone: 'muted' },
              { label: 'P(A)', value: first * 100, tone: 'primary' },
              { label: 'begge', value: both * 100, tone: 'correct' },
            ],
            caption: '«Minst én» er mer sannsynlig, «begge» er mindre sannsynlig.',
          },
        },
      ],
      answerLatex: String.raw`$P(A \cap B) = ${num(both)}$`,
      takeaway: 'Samtidig betyr gange. Flere krav gir alltid lavere sannsynlighet.',
    };
  },
};

const binomialTemplate: ExerciseTemplate = {
  id: 'T-SAN-04',
  topic: Lk20Topic1T.SANNSYNLIGHET,
  goalId: 'SAN-04',
  skillLabel: 'Binomiske forsøk',
  title: 'Binomiske forsøk',
  description: 'Regne ut sannsynligheten for et bestemt antall treff.',
  variantCount: 36,
  generate: (seed) => {
    const attempts = intBetween(seed, 1, 3, 5);
    const hits = intBetween(seed, 2, 1, attempts - 1);
    const probability = pickFrom(seed, 3, [0.2, 0.25, 0.5] as const);

    const combinations = binomial(attempts, hits);
    const exact = combinations * probability ** hits * (1 - probability) ** (attempts - hits);
    const withoutCombinations = probability ** hits * (1 - probability) ** (attempts - hits);

    const distribution = Array.from({ length: attempts + 1 }, (_, index) => ({
      label: `${index} treff`,
      value:
        Math.round(
          binomial(attempts, index) * probability ** index * (1 - probability) ** (attempts - index) * 1000
        ) / 10,
      tone: (index === hits ? 'correct' : 'muted') as 'correct' | 'muted',
    }));

    return {
      id: `T-SAN-04-s${seed}`,
      topic: Lk20Topic1T.SANNSYNLIGHET,
      goalId: 'SAN-04',
      skillLabel: 'Binomiske forsøk',
      title: 'Nøyaktig antall treff',
      situation: `Du gjør ${attempts} uavhengige forsøk. Hvert forsøk lykkes med sannsynlighet ${num(probability)}. Du skal finne sannsynligheten for nøyaktig ${hits} treff.`,
      problemLatex: String.raw`$n = ${attempts}, \quad k = ${hits}, \quad p = ${num(probability)}$`,
      steps: [
        {
          kind: 'chooseRule',
          prompt: 'Hvilken formel gjelder for nøyaktig $k$ treff i $n$ forsøk?',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$P(X = k) = \binom{n}{k}p^k(1-p)^{n-k}$`,
              'Riktig. Kombinasjonstallet teller hvilke forsøk som blir treff.'
            ),
            [
              wrong(
                'uten-kombinasjon',
                String.raw`$P(X = k) = p^k(1-p)^{n-k}$`,
                `Dette er sannsynligheten for én bestemt rekkefølge. Det finnes ${combinations} slike rekkefølger.`,
                MisconceptionType.COMBINATORICS_ORDER_ERROR
              ),
              wrong(
                'ganget-k',
                String.raw`$P(X = k) = k\cdot p$`,
                'Dette er forventet antall treff delt på forsøkene, ikke en sannsynlighet for et bestemt antall.',
                MisconceptionType.PROBABILITY_COMBINATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$P(X = ${hits}) = \binom{${attempts}}{${hits}}\cdot ${num(probability)}^{${hits}}\cdot ${num(1 - probability)}^{${attempts - hits}}$`,
          rationale:
            'Formelen har tre deler: hvor mange rekkefølger, sannsynligheten for treffene, og sannsynligheten for bommene.',
          hint: 'Hvor mange ulike måter kan treffene fordele seg på forsøkene?',
          visual: {
            kind: 'bars',
            bars: distribution,
            caption: `Fordelingen over alle mulige antall treff. Vi spør om ${hits}.`,
          },
        },
        {
          kind: 'transform',
          prompt: 'Sett inn tallene og regn ut.',
          options: distinctOptions(
            right(
              'riktig',
              String.raw`$${combinations}\cdot ${num(probability ** hits, 4)}\cdot ${num((1 - probability) ** (attempts - hits), 4)} \approx ${num(exact, 3)}$`,
              `Riktig. Sannsynligheten er omtrent ${num(exact * 100, 1)} prosent.`
            ),
            [
              wrong(
                'glemte-kombinasjon',
                String.raw`$${num(withoutCombinations, 4)}$`,
                `Kombinasjonstallet ${combinations} mangler. Uten det regner du bare med én rekkefølge.`,
                MisconceptionType.COMBINATORICS_ORDER_ERROR
              ),
              wrong(
                'bare-potens',
                String.raw`$${num(probability ** hits, 4)}$`,
                'Her mangler både kombinasjonstallet og sannsynligheten for bommene.',
                MisconceptionType.PROBABILITY_COMBINATION_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$P(X = ${hits}) \approx ${num(exact, 3)}$`,
          rationale: `Kombinasjonstallet er $\\binom{${attempts}}{${hits}} = ${combinations}$.`,
          hint: `Regn ut hver av de tre faktorene for seg først.`,
          visual: {
            kind: 'bars',
            bars: distribution,
            caption: `Den grønne stolpen er svaret: omtrent ${num(exact * 100, 1)} prosent.`,
          },
        },
        {
          kind: 'interpret',
          prompt: `Hva teller kombinasjonstallet $\\binom{${attempts}}{${hits}} = ${combinations}$?`,
          options: distinctOptions(
            right(
              'riktig',
              `Hvor mange ulike måter de ${hits} treffene kan fordele seg på de ${attempts} forsøkene`,
              'Riktig. Hver av disse måtene har samme sannsynlighet, derfor ganges det opp.'
            ),
            [
              wrong(
                'antall-forsok',
                'Antall forsøk som må gjøres',
                `Antall forsøk er ${attempts}. Kombinasjonstallet teller plasseringene av treffene.`,
                MisconceptionType.COMBINATORICS_ORDER_ERROR
              ),
              wrong(
                'sannsynlighet',
                'Sannsynligheten for ett treff',
                `Sannsynligheten for ett treff er ${num(probability)}. Kombinasjonstallet er et antall, ikke en sannsynlighet.`,
                MisconceptionType.COMBINATORICS_ORDER_ERROR
              ),
            ]
          ),
          resultLatex: String.raw`$\binom{${attempts}}{${hits}} = ${combinations}$ rekkefølger`,
          rationale:
            'Binomisk sannsynlighet er «sannsynligheten for én rekkefølge» ganget med «antall rekkefølger».',
          hint: `Tenk på hvilke av de ${attempts} forsøkene som blir treff.`,
          visual: {
            kind: 'bars',
            bars: distribution,
            caption: 'Alle søylene til sammen blir 100 prosent.',
          },
        },
      ],
      answerLatex: String.raw`$P(X = ${hits}) \approx ${num(exact, 3)}$`,
      takeaway: 'Binomisk formel har tre faktorer: antall rekkefølger, treffene og bommene.',
    };
  },
};

export const PROBABILITY_TEMPLATES: readonly ExerciseTemplate[] = [
  basicProbabilityTemplate,
  combinatoricsTemplate,
  independenceTemplate,
  binomialTemplate,
];
