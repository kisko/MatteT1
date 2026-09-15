import { Lk20Topic1T } from '../../model/task/value-objects/Lk20Category.js';
import { MisconceptionType } from '../../model/task/Misconception.js';
import {
  GuidedWalkthroughDefinition,
  StepOptionDefinition,
} from '../../model/guided/GuidedWalkthrough.js';

/**
 * Innholdsbanken for «Se det → Gjør det».
 *
 * Tre regler gjelder for alt innhold her:
 *  1. Ingen fritekst. Hvert steg er et valg mellom ferdige alternativer.
 *  2. Hvert galt alternativ er en *reell* elevfeil med sin egen forklaring,
 *     og knyttes til en MisconceptionType når feilen er en kjent klassiker.
 *  3. Hvert steg har en visualisering, slik at algebraen og bildet beveger
 *     seg samtidig.
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

const algebraWalkthrough: GuidedWalkthroughDefinition = {
  id: 'GW-ALG-01',
  topic: Lk20Topic1T.TALL_OG_ALGEBRA,
  goalId: 'ALG-02',
  skillLabel: 'Faktorisering',
  title: 'Rammen rundt bildet',
  situation: 'Et kvadratisk bilde har sider på $x$ cm. Du legger en ramme på 3 cm rundt hele bildet.',
  problemLatex: String.raw`$A = (x+6)^2$`,
  steps: [
    {
      kind: 'chooseRule',
      prompt: 'Hvilken regel gjelder for $(x+6)^2$?',
      options: [
        right(
          'kvadratsetning',
          String.raw`$(a+b)^2 = a^2 + 2ab + b^2$`,
          'Riktig. Første kvadrat, dobbelt produkt, siste kvadrat.'
        ),
        wrong(
          'kun-kvadrater',
          String.raw`$(a+b)^2 = a^2 + b^2$`,
          'Dette er den vanligste algebrafeilen i 1T. Se på arealmodellen: to hele rektangler forsvinner.',
          MisconceptionType.BRACKET_EXPANSION_ERROR
        ),
        wrong(
          'konjugat',
          String.raw`$(a+b)^2 = (a+b)(a-b)$`,
          'Det er konjugatsetningen, og den hører til uttrykk av typen $a^2-b^2$.'
        ),
      ],
      resultLatex: String.raw`$(x+6)^2 = x^2 + 2\cdot x\cdot 6 + 6^2$`,
      rationale:
        'Å kvadrere en parentes betyr å gange parentesen med seg selv. Da oppstår to kryssprodukter, og de er like store.',
      hint: 'Tegn et kvadrat med sider $x+6$ og del det i fire ruter. Hvor mange ruter får du?',
      visual: {
        kind: 'areaModel',
        rowLabels: ['x', '6'],
        columnLabels: ['x', '6'],
        parts: [
          { rowLabel: 'x', columnLabel: 'x', productLatex: 'x^2', tone: 'primary' },
          { rowLabel: 'x', columnLabel: '6', productLatex: '6x', tone: 'accent' },
          { rowLabel: '6', columnLabel: 'x', productLatex: '6x', tone: 'accent' },
          { rowLabel: '6', columnLabel: '6', productLatex: '36', tone: 'muted' },
        ],
        caption: 'De to gule rektanglene er det doble produktet. Glemmer du dem, mangler du $12x$.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Regn ut leddene. Hva blir $(x+6)^2$ utviklet?',
      options: [
        right('utviklet', String.raw`$x^2 + 12x + 36$`, 'Riktig. $2\\cdot x\\cdot 6 = 12x$ og $6^2 = 36$.'),
        wrong(
          'mangler-midtledd',
          String.raw`$x^2 + 36$`,
          'Midtleddet mangler helt. Arealmodellen har fire ruter, ikke to.',
          MisconceptionType.BRACKET_EXPANSION_ERROR
        ),
        wrong(
          'halvt-midtledd',
          String.raw`$x^2 + 6x + 36$`,
          'Du tok bare ett av de to like rektanglene. Det er to av dem, derfor $12x$.',
          MisconceptionType.BRACKET_EXPANSION_ERROR
        ),
        wrong(
          'feil-konstant',
          String.raw`$x^2 + 12x + 12$`,
          'Siste ledd er $6^2 = 36$, ikke $6\\cdot 2$.'
        ),
      ],
      resultLatex: String.raw`$A = x^2 + 12x + 36$`,
      rationale:
        String.raw`De to kryssproduktene $x\cdot 6$ og $6\cdot x$ er like store, og til sammen blir de $12x$.`,
      hint: 'Legg sammen arealene av de fire rutene i modellen.',
      visual: {
        kind: 'areaModel',
        rowLabels: ['x', '6'],
        columnLabels: ['x', '6'],
        parts: [
          { rowLabel: 'x', columnLabel: 'x', productLatex: 'x^2', tone: 'correct' },
          { rowLabel: 'x', columnLabel: '6', productLatex: '6x', tone: 'correct' },
          { rowLabel: '6', columnLabel: 'x', productLatex: '6x', tone: 'correct' },
          { rowLabel: '6', columnLabel: '6', productLatex: '36', tone: 'correct' },
        ],
        caption: 'Alle fire rutene er med: $x^2 + 6x + 6x + 36 = x^2 + 12x + 36$.',
      },
    },
    {
      kind: 'checkResult',
      prompt: 'Kontroller med $x = 2$. Hvilken kontroll viser at utviklingen er riktig?',
      options: [
        right(
          'innsetting',
          String.raw`$(2+6)^2 = 64$ og $2^2 + 12\cdot 2 + 36 = 64$`,
          'Riktig. Like verdier for en tilfeldig $x$ er et sterkt tegn på at omskrivingen er lovlig.'
        ),
        wrong(
          'uten-midtledd',
          String.raw`$(2+6)^2 = 64$ og $2^2 + 36 = 40$`,
          'Her stemmer ikke sidene, og det er nettopp beviset for at $a^2+b^2$ er galt.',
          MisconceptionType.BRACKET_EXPANSION_ERROR
        ),
        wrong(
          'kvadrer-hvert-ledd',
          String.raw`$(2+6)^2 = 2^2 + 6^2 = 40$`,
          'Du kan ikke kvadrere ledd for ledd. $(2+6)^2 = 8^2 = 64$.',
          MisconceptionType.BRACKET_EXPANSION_ERROR
        ),
      ],
      resultLatex: String.raw`$64 = 64$`,
      rationale:
        'En omskriving skal gjelde for alle $x$. Setter du inn ett tall og får ulike verdier, har du funnet en feil.',
      hint: 'Regn ut venstre og høyre side hver for seg med $x=2$, og sammenlign.',
      visual: {
        kind: 'bars',
        bars: [
          { label: '(2+6)²', value: 64, tone: 'primary' },
          { label: 'x²+12x+36', value: 64, tone: 'correct' },
          { label: 'x²+36 (feil)', value: 40, tone: 'error' },
        ],
        caption: 'To like høye stolper betyr lovlig omskriving. Den røde avslører den manglende $12x$.',
      },
    },
    {
      kind: 'interpret',
      prompt: 'Hva er $12x$ i bildet med rammen?',
      options: [
        right(
          'sidene',
          'De to rektanglene med sider $6$ og $x$ langs bildet',
          'Riktig. Hvert rektangel har areal $6x$, og det er to av dem.'
        ),
        wrong('hjornet', 'Hjørnet på $6\\cdot 6$', 'Hjørnene utgjør $36$, og de er uavhengige av $x$.'),
        wrong('bildet', 'Selve bildet', 'Bildet er $x^2$. Det er leddet som vokser raskest når $x$ øker.'),
      ],
      resultLatex: String.raw`$A = \underbrace{x^2}_{\text{bildet}} + \underbrace{12x}_{\text{langs sidene}} + \underbrace{36}_{\text{hjørnene}}$`,
      rationale:
        'Hvert ledd i det utviklede uttrykket svarer til en konkret del av figuren. Da blir algebraen noe du kan peke på.',
      hint: 'Hvilke ruter i arealmodellen har både en $x$-side og en $6$-side?',
      visual: {
        kind: 'areaModel',
        rowLabels: ['x', '6'],
        columnLabels: ['x', '6'],
        parts: [
          { rowLabel: 'x', columnLabel: 'x', productLatex: 'x^2', tone: 'muted' },
          { rowLabel: 'x', columnLabel: '6', productLatex: '6x', tone: 'correct' },
          { rowLabel: '6', columnLabel: 'x', productLatex: '6x', tone: 'correct' },
          { rowLabel: '6', columnLabel: '6', productLatex: '36', tone: 'muted' },
        ],
        caption: 'De to markerte rutene er $12x$: rammen langs sidene av bildet.',
      },
    },
  ],
  answerLatex: String.raw`$A = x^2 + 12x + 36$`,
  takeaway:
    'Det doble produktet $2ab$ er alltid to like rektangler i arealmodellen. Ser du dem, glemmer du dem ikke.',
};

const equationWalkthrough: GuidedWalkthroughDefinition = {
  id: 'GW-LIG-01',
  topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
  goalId: 'LIG-01',
  skillLabel: 'Lineære ligninger',
  title: 'Hvilken taxi er billigst?',
  situation:
    'Taxi A tar 50 kroner i startgebyr og 15 kroner per kilometer. Taxi B tar 80 kroner i startgebyr og 9 kroner per kilometer.',
  problemLatex: String.raw`$50 + 15x = 80 + 9x$`,
  steps: [
    {
      kind: 'transform',
      prompt: 'Du skal samle $x$-leddene på én side og tallene på den andre. Hvilket steg er lovlig?',
      options: [
        right(
          'riktig-flytting',
          String.raw`$15x - 9x = 80 - 50$`,
          'Riktig. Du trakk fra $9x$ og $50$ på begge sider samtidig.'
        ),
        wrong(
          'ingen-fortegnsskifte',
          String.raw`$15x + 9x = 80 + 50$`,
          'Et ledd som flyttes over likhetstegnet skifter fortegn. Her ble ingen av dem endret.',
          MisconceptionType.SIGN_ERROR
        ),
        wrong(
          'halvveis',
          String.raw`$15x - 9x = 80 + 50$`,
          'Halvveis riktig: $9x$ ble flyttet riktig, men $50$ skiftet ikke fortegn.',
          MisconceptionType.SIGN_ERROR
        ),
      ],
      resultLatex: String.raw`$15x - 9x = 80 - 50$`,
      rationale:
        'En ligning er en vekt i balanse. Trekker du fra det samme på begge sider, står vekten fortsatt likt.',
      hint: 'Hva må du trekke fra på begge sider for at $9x$ skal forsvinne fra høyre side?',
      visual: {
        kind: 'balance',
        left: { terms: ['50', '15x'] },
        right: { terms: ['80', '9x'] },
        caption: 'Vekten står i balanse. Alt du gjør på venstre skål må du gjøre på høyre.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Trekk sammen begge sider.',
      options: [
        right('sammentrukket', String.raw`$6x = 30$`, 'Riktig. $15x-9x = 6x$ og $80-50 = 30$.'),
        wrong(
          'lagt-sammen',
          String.raw`$24x = 130$`,
          'Her ble leddene lagt sammen i stedet for trukket fra.',
          MisconceptionType.SIGN_ERROR
        ),
        wrong('feil-hoyre', String.raw`$6x = 130$`, 'Venstre side er riktig, men $80 - 50 = 30$.'),
      ],
      resultLatex: String.raw`$6x = 30$`,
      rationale: 'Nå er ligningen på formen «tall ganger $x$ er lik et tall». Bare ett steg gjenstår.',
      hint: '$15 - 9 = 6$. Hva blir $80 - 50$?',
      visual: {
        kind: 'balance',
        left: { terms: ['6x'] },
        right: { terms: ['30'] },
        caption: 'Vekten er ryddet: seks like $x$ veier like mye som 30.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Hvordan får du $x$ til å stå alene?',
      options: [
        right('divider', String.raw`$x = \frac{30}{6} = 5$`, 'Riktig. Motsatt operasjon av å gange er å dele.'),
        wrong('ganger', String.raw`$x = 30\cdot 6 = 180$`, 'Du ganget der du skulle dele. Sjekk med innsetting: $6\\cdot180$ er ikke 30.'),
        wrong('opp-ned', String.raw`$x = \frac{6}{30} = 0.2$`, 'Brøken står opp ned. Du skal dele på tallet som står foran $x$.'),
      ],
      resultLatex: String.raw`$x = 5$`,
      rationale: 'Deler du begge sider på 6, står $x$ alene, og vekten er fortsatt i balanse.',
      hint: 'Seks like deler utgjør 30. Hvor stor er én del?',
      visual: {
        kind: 'numberline',
        min: 0,
        max: 10,
        points: [{ value: 5, label: 'x = 5', tone: 'correct' }],
        caption: 'Løsningen er ett punkt: det ene antallet kilometer der prisene møtes.',
      },
    },
    {
      kind: 'checkResult',
      prompt: 'Sett $x=5$ inn i den opprinnelige ligningen. Hva viser kontrollen?',
      options: [
        right(
          'begge-125',
          String.raw`$50+15\cdot 5 = 125$ og $80+9\cdot 5 = 125$`,
          'Riktig. Begge sider gir 125 kroner, så løsningen stemmer.'
        ),
        wrong('regnefeil', String.raw`$50+15\cdot 5 = 125$ og $80+9\cdot 5 = 485$`, 'Regn en gang til: $9\\cdot 5 = 45$, og $80+45 = 125$.'),
        wrong(
          'hopper-over',
          'Kontroll er ikke nødvendig når ligningen er løst riktig',
          'Kontrollen tar ti sekunder og fanger nesten alle fortegnsfeil. Den er verdt det.'
        ),
      ],
      resultLatex: String.raw`$125 = 125$`,
      rationale:
        'Innsetting er den eneste kontrollen som virkelig avgjør. Får du samme verdi på begge sider, er løsningen riktig.',
      hint: 'Regn ut prisen for 5 km for hver taxi, hver for seg.',
      visual: {
        kind: 'bars',
        bars: [
          { label: 'Taxi A, 5 km', value: 125, tone: 'primary' },
          { label: 'Taxi B, 5 km', value: 125, tone: 'correct' },
        ],
        caption: 'Like høye stolper: ved 5 km koster turene det samme.',
      },
    },
    {
      kind: 'interpret',
      prompt: 'Du skal kjøre 8 km. Hvilken taxi velger du?',
      options: [
        right(
          'taxi-b',
          'Taxi B, fordi B er billigst når turen er lengre enn 5 km',
          'Riktig. $A(8) = 170$ kroner og $B(8) = 152$ kroner.'
        ),
        wrong(
          'lavest-startgebyr',
          'Taxi A, fordi A har lavest startgebyr',
          'Startgebyret er lavest, men kilometerprisen er høyest. Over 5 km taper A.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
        wrong(
          'alltid-likt',
          'Det er likt, fordi ligningen hadde én løsning',
          'Prisene er bare like ved 5 km. På alle andre avstander er én av dem billigst.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
      ],
      resultLatex: String.raw`$A(8) = 170\text{ kr}, \quad B(8) = 152\text{ kr}$`,
      rationale:
        'Løsningen av ligningen er grensen mellom to områder. Situasjonen avgjør hvilket av områdene du er i.',
      hint: 'Se på grafen: hvilken linje ligger lavest til høyre for skjæringspunktet?',
      visual: {
        kind: 'graph',
        curves: [
          { kind: 'polynomial', coefficients: [50, 15], tone: 'primary', label: 'Taxi A' },
          { kind: 'polynomial', coefficients: [80, 9], tone: 'accent', label: 'Taxi B' },
        ],
        markers: [{ x: 5, y: 125, label: 'Like pris', tone: 'correct' }],
        xRange: [0, 10],
        caption: 'Skjæringspunktet er løsningen. Til venstre er A billigst, til høyre er B billigst.',
      },
    },
  ],
  answerLatex: String.raw`$x = 5$ km, og over 5 km er Taxi B billigst`,
  takeaway:
    'Løsningen av en ligning er grensen mellom to situasjoner. Regn den ut, og bestem etterpå hvilken side du er på.',
};

const functionWalkthrough: GuidedWalkthroughDefinition = {
  id: 'GW-FUN-01',
  topic: Lk20Topic1T.FUNKSJONER,
  goalId: 'FUN-02',
  skillLabel: 'Nullpunkter',
  title: 'Når treffer ballen bakken?',
  situation:
    'Du sparker en ball rett opp fra bakken. Høyden i meter etter $t$ sekunder er $h(t) = -5t^2 + 20t$.',
  problemLatex: String.raw`$h(t) = -5t^2 + 20t$`,
  steps: [
    {
      kind: 'chooseRule',
      prompt: 'Hva betyr det matematisk at ballen er på bakken?',
      options: [
        right('null-hoyde', String.raw`$h(t) = 0$`, 'Riktig. Bakken er høyde null, så funksjonsverdien skal være 0.'),
        wrong('t-null', String.raw`$t = 0$`, 'Det er bare øyeblikket du sparker. Vi leter etter alle tidspunktene høyden er null.'),
        wrong('toppunkt', 'Høyden er på sitt største', 'Det er toppunktet. Nullpunktet er der grafen krysser $t$-aksen.'),
      ],
      resultLatex: String.raw`$-5t^2 + 20t = 0$`,
      rationale:
        'Nullpunkter er $x$-verdiene der grafen krysser førsteaksen, altså der funksjonsverdien er null.',
      hint: 'Bakken har høyde 0. Hvilken side av likningen skal da være 0?',
      visual: {
        kind: 'graph',
        curves: [{ kind: 'polynomial', coefficients: [0, 20, -5], tone: 'primary', label: 'h(t)' }],
        markers: [
          { x: 0, y: 0, label: 'avspark', tone: 'accent' },
          { x: 4, y: 0, label: 'bakken', tone: 'correct' },
        ],
        xRange: [-1, 5],
        caption: 'Grafen møter $t$-aksen to steder. Begge er nullpunkter.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Hvordan løser du $-5t^2 + 20t = 0$ enklest?',
      options: [
        right(
          'faktoriser',
          String.raw`$-5t(t-4) = 0$`,
          'Riktig. Felles faktor først; det er raskere og tryggere enn abc-formelen her.'
        ),
        wrong(
          'del-pa-t',
          String.raw`Del begge sider på $t$: $-5t + 20 = 0$`,
          'Da mister du løsningen $t=0$. Du kan ikke dele på noe som kan være null.'
        ),
        wrong(
          'abc-feil-c',
          String.raw`Bruk abc-formelen med $a=-5,\ b=20,\ c=20$`,
          'Konstantleddet $c$ er 0 her, ikke 20. Uttrykket har ikke noe ledd uten $t$.'
        ),
      ],
      resultLatex: String.raw`$-5t(t-4) = 0$`,
      rationale:
        'Når alle ledd har en felles faktor, er faktorisering raskeste vei. Da kan du lese nullpunktene rett av faktorene.',
      hint: 'Hva har begge leddene $-5t^2$ og $20t$ til felles?',
      visual: {
        kind: 'areaModel',
        rowLabels: ['-5t'],
        columnLabels: ['t', '-4'],
        parts: [
          { rowLabel: '-5t', columnLabel: 't', productLatex: '-5t^2', tone: 'primary' },
          { rowLabel: '-5t', columnLabel: '-4', productLatex: '20t', tone: 'accent' },
        ],
        caption: 'Arealmodellen leser faktoriseringen baklengs: gang tilbake, og du får uttrykket du startet med.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Et produkt er null når minst én faktor er null. Hvilke $t$ gir null?',
      options: [
        right('to-losninger', String.raw`$t = 0$ eller $t = 4$`, 'Riktig. Begge faktorene gir hver sin løsning.'),
        wrong(
          'glemte-null',
          String.raw`Bare $t = 4$`,
          'Du glemte faktoren $-5t$. Den er null når $t=0$, og det er øyeblikket ballen blir sparket.'
        ),
        wrong(
          'fortegnsfeil',
          String.raw`$t = 0$ og $t = -4$`,
          'Faktoren $(t-4)$ er null når $t = 4$, ikke når $t = -4$.',
          MisconceptionType.SIGN_ERROR
        ),
      ],
      resultLatex: String.raw`$t = 0 \quad \text{eller} \quad t = 4$`,
      rationale:
        String.raw`Produktregelen for null: er $a\cdot b = 0$, så må $a = 0$ eller $b = 0$. Hver faktor gir ett nullpunkt.`,
      hint: 'Sett hver faktor for seg lik null, og løs de to små likningene.',
      visual: {
        kind: 'numberline',
        min: -1,
        max: 5,
        points: [
          { value: 0, label: 't = 0', tone: 'accent' },
          { value: 4, label: 't = 4', tone: 'correct' },
        ],
        caption: 'To nullpunkter: ett ved avspark, ett ved landing.',
      },
    },
    {
      kind: 'interpret',
      prompt: 'Hvilket svar passer på spørsmålet i oppgaven?',
      options: [
        right(
          'fire-sekunder',
          'Ballen treffer bakken etter 4 sekunder',
          'Riktig. $t=0$ er avsparket, så det er $t=4$ som svarer på spørsmålet.'
        ),
        wrong(
          'begge-landinger',
          'Ballen treffer bakken etter 0 og 4 sekunder',
          'Matematisk er begge nullpunkter, men $t=0$ er starten, ikke en landing.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
        wrong(
          'feil-enhet',
          'Ballen treffer bakken etter 4 meter',
          'Enheten er sekunder. $t$ er tid, og $h$ er høyde.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
      ],
      resultLatex: String.raw`$t = 4 \text{ sekunder}$`,
      rationale:
        'En andregradslikning kan ha to matematiske løsninger der bare én gir mening i situasjonen. Vurder alltid begge.',
      hint: 'Hva skjedde ved $t = 0$ i fortellingen?',
      visual: {
        kind: 'graph',
        curves: [{ kind: 'polynomial', coefficients: [0, 20, -5], tone: 'primary', label: 'h(t)' }],
        markers: [
          { x: 0, y: 0, label: 'avspark', tone: 'muted' },
          { x: 2, y: 20, label: 'toppunkt', tone: 'accent' },
          { x: 4, y: 0, label: 'svaret', tone: 'correct' },
        ],
        xRange: [-1, 5],
        caption: 'Hele reisen: opp fra bakken, snu i toppunktet, ned igjen etter 4 sekunder.',
      },
    },
  ],
  answerLatex: String.raw`Nullpunktene er $t = 0$ og $t = 4$; ballen lander etter 4 sekunder`,
  takeaway:
    'Faktoriser før du griper etter abc-formelen, og vurder alltid om alle løsningene gir mening i situasjonen.',
};

const derivativeWalkthrough: GuidedWalkthroughDefinition = {
  id: 'GW-DER-01',
  topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
  goalId: 'DER-02',
  skillLabel: 'Derivasjonsregler',
  title: 'Hvor bratt er grafen akkurat her?',
  situation: 'En funksjon er gitt ved $f(x) = 2x^3 - 5x$. Du skal finne stigningen i punktet der $x = 2$.',
  problemLatex: String.raw`$f(x) = 2x^3 - 5x$`,
  steps: [
    {
      kind: 'chooseRule',
      prompt: 'Hvilken regel deriverer $x^n$?',
      options: [
        right('potensregel', String.raw`$(x^n)\prime = n\cdot x^{n-1}$`, 'Riktig. Eksponenten ned som faktor, og ny eksponent én lavere.'),
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
      ],
      resultLatex: String.raw`$(x^n)\prime = n x^{n-1}$`,
      rationale:
        'Potensregelen gjør to ting samtidig: eksponenten kommer ned som faktor, og den nye eksponenten er én lavere.',
      hint: 'Eksponenten gjør to jobber: den blir faktor foran, og den blir én mindre.',
      visual: {
        kind: 'graph',
        curves: [{ kind: 'polynomial', coefficients: [0, -5, 0, 2], tone: 'primary', label: 'f' }],
        xRange: [-2.5, 2.5],
        caption: 'Vi leter etter stigningstallet til tangenten, ikke funksjonsverdien.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Deriver ledd for ledd. Hva er $f\\prime(x)$?',
      options: [
        right('riktig-derivert', String.raw`$f\prime(x) = 6x^2 - 5$`, 'Riktig. $3\\cdot 2 = 6$, eksponenten blir 2, og $-5x$ deriveres til $-5$.'),
        wrong(
          'deriverte-ikke-siste',
          String.raw`$f\prime(x) = 6x^2 - 5x$`,
          'Leddet $-5x$ har eksponent 1, så den deriverte er $-5$.',
          MisconceptionType.DERIVATIVE_POWER_RULE
        ),
        wrong(
          'glemte-koeffisient',
          String.raw`$f\prime(x) = 2x^2 - 5$`,
          'Faktoren 2 skal ganges med eksponenten 3, så det blir $6x^2$.',
          MisconceptionType.DERIVATIVE_POWER_RULE
        ),
        wrong(
          'beholdt-eksponent',
          String.raw`$f\prime(x) = 6x^3 - 5$`,
          'Faktoren er riktig, men eksponenten skal reduseres med 1.',
          MisconceptionType.DERIVATIVE_POWER_RULE
        ),
      ],
      resultLatex: String.raw`$f\prime(x) = 6x^2 - 5$`,
      rationale: 'Et polynom deriveres ledd for ledd. Hvert ledd behandles helt uavhengig av de andre.',
      hint: 'Deriver $2x^3$ først, og deretter $-5x$ for seg.',
      visual: {
        kind: 'graph',
        curves: [
          { kind: 'polynomial', coefficients: [0, -5, 0, 2], tone: 'primary', label: 'f' },
          { kind: 'polynomial', coefficients: [-5, 0, 6], tone: 'accent', label: "f'" },
        ],
        xRange: [-2.5, 2.5],
        caption: 'Den deriverte er en ny funksjon. Den gir stigningen til $f$ for hver $x$.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Sett inn $x = 2$ i den deriverte.',
      options: [
        right('nitten', String.raw`$f\prime(2) = 6\cdot 2^2 - 5 = 19$`, 'Riktig. $2^2 = 4$, $6\\cdot 4 = 24$, og $24 - 5 = 19$.'),
        wrong('feil-potens', String.raw`$f\prime(2) = 6\cdot 2^3 - 5 = 43$`, 'Eksponenten i den deriverte er 2, ikke 3.'),
        wrong('kvadrerte-alt', String.raw`$f\prime(2) = (6\cdot 2)^2 - 5 = 139$`, 'Bare $x$ kvadreres, ikke $6x$. Potensen gjelder $x$ alene.'),
      ],
      resultLatex: String.raw`$f\prime(2) = 19$`,
      rationale:
        'Først deriverer du, så setter du inn. Rekkefølgen er avgjørende: setter du inn først, står det bare et tall å derivere.',
      hint: 'Regn potensen først, deretter multiplikasjonen, og til slutt subtraksjonen.',
      visual: {
        kind: 'graph',
        curves: [{ kind: 'polynomial', coefficients: [0, -5, 0, 2], tone: 'primary', label: 'f', tangentAtX: 2 }],
        markers: [{ x: 2, y: 6, label: '(2, 6)', tone: 'correct' }],
        xRange: [-2.5, 3],
        caption: 'Tangenten i punktet $(2, 6)$ har stigningstall 19. Den stiger bratt.',
      },
    },
    {
      kind: 'interpret',
      prompt: 'Hva betyr $f\\prime(2) = 19$?',
      options: [
        right(
          'stigning',
          'I punktet $x = 2$ stiger grafen med 19 enheter per enhet $x$',
          'Riktig. Den deriverte er stigningstallet til tangenten i punktet.'
        ),
        wrong(
          'funksjonsverdi',
          'Funksjonsverdien i $x = 2$ er 19',
          'Nei, $f(2) = 6$. Det er tangentens stigning som er 19.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
        wrong('toppunkt', 'Grafen har toppunkt i $x = 2$', 'Toppunkt krever $f\\prime(x) = 0$, og 19 er ikke null.'),
      ],
      resultLatex: String.raw`$f\prime(2) = 19$ er stigningstallet i punktet $(2,\ 6)$`,
      rationale:
        'Funksjonen svarer «hvor høyt», og den deriverte svarer «hvor bratt». To ulike spørsmål om samme punkt.',
      hint: 'Sammenlign $f(2)$ og $f\\prime(2)$. Hvilken av dem er en høyde, og hvilken er en stigning?',
      visual: {
        kind: 'graph',
        curves: [{ kind: 'polynomial', coefficients: [0, -5, 0, 2], tone: 'primary', label: 'f', tangentAtX: 2 }],
        markers: [
          { x: 2, y: 6, label: 'f(2) = 6', tone: 'accent' },
        ],
        xRange: [-2.5, 3],
        caption: 'Høyden er 6, stigningen er 19. Punktet ligger lavt, men grafen klatrer raskt.',
      },
    },
  ],
  answerLatex: String.raw`$f\prime(x) = 6x^2 - 5$ og $f\prime(2) = 19$`,
  takeaway: 'Den deriverte er en funksjon for stigning. Deriver først, sett inn etterpå – aldri motsatt.',
};

const trigonometryWalkthrough: GuidedWalkthroughDefinition = {
  id: 'GW-TRI-01',
  topic: Lk20Topic1T.TRIGONOMETRI,
  goalId: 'TRI-01',
  skillLabel: 'Sinus, cosinus og tangens',
  title: 'Hvor høyt rekker stigen?',
  situation: 'En stige på 6 meter står mot en vegg. Vinkelen mellom stigen og bakken er 65 grader.',
  problemLatex: String.raw`$\sin(65^\circ) = \frac{h}{6}$`,
  steps: [
    {
      kind: 'chooseRule',
      prompt:
        'Du kjenner hypotenusen (stigen) og skal finne den motstående siden (høyden). Hvilket forhold bruker du?',
      options: [
        right('sinus', String.raw`$\sin v = \frac{\text{motstående}}{\text{hypotenus}}$`, 'Riktig. Sinus kobler hypotenusen til den motstående siden.'),
        wrong(
          'cosinus',
          String.raw`$\cos v = \frac{\text{hosliggende}}{\text{hypotenus}}$`,
          'Cosinus gir avstanden langs bakken, ikke høyden opp veggen.',
          MisconceptionType.TRIG_RATIO_MIXUP
        ),
        wrong(
          'tangens',
          String.raw`$\tan v = \frac{\text{motstående}}{\text{hosliggende}}$`,
          'Tangens krever at du kjenner den hosliggende siden, og den er ukjent her.',
          MisconceptionType.TRIG_RATIO_MIXUP
        ),
      ],
      resultLatex: String.raw`$\sin(65^\circ) = \frac{h}{6}$`,
      rationale:
        'Velg forholdet ut fra hvilke to sider som er involvert: den du kjenner, og den du leter etter.',
      hint: 'Stigen er hypotenusen. Høyden står rett overfor vinkelen på 65 grader.',
      visual: {
        kind: 'triangle',
        angleDegrees: 65,
        adjacentLabel: 'avstand til veggen',
        oppositeLabel: 'h (høyden)',
        hypotenuseLabel: '6 m (stigen)',
        highlight: 'sin',
        caption: 'Hypotenusen er alltid siden som ligger mot den rette vinkelen.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Løs ut $h$.',
      options: [
        right('gang-med-6', String.raw`$h = 6\cdot\sin(65^\circ)$`, 'Riktig. Gang begge sider med 6, og $h$ står alene.'),
        wrong('delte-feil', String.raw`$h = \frac{6}{\sin(65^\circ)}$`, 'Du delte der du skulle gange. $h$ stod i telleren, så gang begge sider med 6.'),
        wrong('delte-vinkelen', String.raw`$h = \sin\left(\frac{65^\circ}{6}\right)$`, 'Vinkelen skal ikke deles. Sinus er en funksjon av hele vinkelen.'),
      ],
      resultLatex: String.raw`$h = 6\sin(65^\circ)$`,
      rationale: 'Den ukjente står i telleren av en brøk. Ganger du med nevneren, står den alene.',
      hint: 'Hva står i nevneren på høyre side, og hva blir motsatt operasjon?',
      visual: {
        kind: 'triangle',
        angleDegrees: 65,
        adjacentLabel: 'avstand til veggen',
        oppositeLabel: 'h = 6·sin(65°)',
        hypotenuseLabel: '6 m (stigen)',
        highlight: 'sin',
        caption: 'Høyden er hypotenusen ganget med sinus til vinkelen.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Regn ut. Du kan bruke at $\\sin(65^\\circ) \\approx 0.906$.',
      options: [
        right('5-4', String.raw`$h \approx 5.4$ meter`, 'Riktig. $6\\cdot 0.906 \\approx 5.44$, altså omtrent 5.4 meter.'),
        wrong('delte', String.raw`$h \approx 6.6$ meter`, 'Dette er $6/0.906$. Sjekk om du ganget eller delte.'),
        wrong('urimelig', String.raw`$h \approx 0.15$ meter`, 'En stige på 6 meter kan ikke rekke 15 cm opp. Rimelighetssjekk fanger slike svar.'),
      ],
      resultLatex: String.raw`$h = 6\cdot 0.906 \approx 5.4\text{ m}$`,
      rationale: 'Sinusverdien er alltid mellom 0 og 1 for en spiss vinkel, så produktet blir mindre enn hypotenusen.',
      hint: 'Sinus til en spiss vinkel er mindre enn 1. Blir svaret større eller mindre enn 6?',
      visual: {
        kind: 'triangle',
        angleDegrees: 65,
        adjacentLabel: '≈ 2.5 m',
        oppositeLabel: 'h ≈ 5.4 m',
        hypotenuseLabel: '6 m',
        highlight: 'sin',
        caption: 'Stigen rekker omtrent 5.4 meter opp veggen.',
      },
    },
    {
      kind: 'checkResult',
      prompt: 'Rimelighetssjekk: kan svaret stemme?',
      options: [
        right('mindre-enn-6', 'Ja, høyden må være litt mindre enn stigens 6 meter', 'Riktig. Katetene er alltid kortere enn hypotenusen.'),
        wrong(
          'mer-enn-6',
          'Ja, høyden kan bli mer enn 6 meter når vinkelen er stor nok',
          'Nei. Hypotenusen er alltid den lengste siden i en rettvinklet trekant.',
          MisconceptionType.TRIG_RATIO_MIXUP
        ),
        wrong('noyaktig-6', 'Nei, høyden må være nøyaktig 6 meter siden stigen er 6 meter', 'Det ville krevd at stigen stod helt loddrett, altså 90 grader.'),
      ],
      resultLatex: String.raw`$5.4 < 6$, altså er svaret rimelig`,
      rationale:
        'I en rettvinklet trekant er hypotenusen alltid lengst. Det gir deg en gratis kontroll på hvert trigonometrisvar.',
      hint: 'Hvilken side er lengst i en rettvinklet trekant?',
      visual: {
        kind: 'triangle',
        angleDegrees: 65,
        adjacentLabel: '≈ 2.5 m',
        oppositeLabel: '≈ 5.4 m',
        hypotenuseLabel: '6 m (lengst)',
        highlight: 'pythagoras',
        caption: 'Begge kateter er kortere enn hypotenusen. Den raskeste rimelighetssjekken i trigonometri.',
      },
    },
  ],
  answerLatex: String.raw`$h = 6\sin(65^\circ) \approx 5.4$ meter`,
  takeaway: 'Bestem hvilke sider som er med *før* du velger sinus, cosinus eller tangens. Da velger formelen seg selv.',
};

const modellingWalkthrough: GuidedWalkthroughDefinition = {
  id: 'GW-MOD-01',
  topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
  goalId: 'MOD-02',
  skillLabel: 'Lineær modell',
  title: 'Hvor lenge kan du leie elsparkesykkelen?',
  situation:
    'En elsparkesykkel koster 60 kroner i startpris og 25 kroner per time. Du har 200 kroner, og leien betales per hele time.',
  problemLatex: String.raw`$60 + 25t \le 200$`,
  steps: [
    {
      kind: 'chooseRule',
      prompt: 'Hvordan skrives situasjonen matematisk?',
      options: [
        right('ulikhet', String.raw`$60 + 25t \le 200$`, 'Riktig. Startprisen betales én gang, timeprisen per time, og totalen kan ikke overstige 200.'),
        wrong('likhet', String.raw`$60 + 25t = 200$`, 'Nesten. Du har *maksimalt* 200 kroner, så dette er en ulikhet, ikke en likhet.'),
        wrong('byttet-om', String.raw`$60t + 25 \le 200$`, 'Startprisen betales én gang; det er timeprisen som ganges med tiden.'),
      ],
      resultLatex: String.raw`$60 + 25t \le 200$`,
      rationale:
        'En lineær modell har et konstantledd (det du betaler uansett) og et ledd som vokser med variabelen.',
      hint: 'Hva betaler du én gang, og hva betaler du for hver time?',
      visual: {
        kind: 'graph',
        curves: [
          { kind: 'polynomial', coefficients: [60, 25], tone: 'primary', label: 'Pris' },
          { kind: 'polynomial', coefficients: [200], tone: 'accent', label: 'Budsjett' },
        ],
        markers: [{ x: 5.6, y: 200, label: 'grensen', tone: 'correct' }],
        xRange: [0, 8],
        caption: 'Den skrå linjen er prisen, den vannrette er budsjettet. Skjæringen er grensen.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Løs ulikheten for $t$.',
      options: [
        right('riktig-grense', String.raw`$25t \le 140 \Rightarrow t \le 5.6$`, 'Riktig. Trekk fra 60 på begge sider, og del deretter på 25.'),
        wrong(
          'la-til',
          String.raw`$25t \le 260 \Rightarrow t \le 10.4$`,
          'Startprisen skal trekkes fra, ikke legges til.',
          MisconceptionType.SIGN_ERROR
        ),
        wrong('opp-ned', String.raw`$t \le \frac{25}{140}$`, 'Brøken står opp ned. Du skal dele 140 på 25.'),
      ],
      resultLatex: String.raw`$t \le 5.6$`,
      rationale:
        'Vi delte på 25, som er et positivt tall, så ulikhetstegnet står uendret. Bare negative tall snur tegnet.',
      hint: 'Trekk fra startprisen først. Hvor mange kroner er det igjen til timene?',
      visual: {
        kind: 'numberline',
        min: 0,
        max: 8,
        intervals: [{ from: 0, to: 5.6, label: 't ≤ 5.6', tone: 'correct' }],
        points: [{ value: 5.6, label: '5.6 timer', tone: 'accent' }],
        caption: 'Løsningen er et helt område, ikke ett tall.',
      },
    },
    {
      kind: 'interpret',
      prompt: 'Hva er svaret i situasjonen?',
      options: [
        right('fem-timer', 'Du kan leie i 5 hele timer', 'Riktig. $60 + 25\\cdot 5 = 185$ kroner, og det har du.'),
        wrong(
          'rundet-opp',
          'Du kan leie i 6 timer',
          'Avrunding oppover sprekker budsjettet: $60 + 25\\cdot 6 = 210$ kroner.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
        wrong(
          'desimaltimer',
          'Du kan leie i 5.6 timer',
          'Matematisk riktig grense, men leien betales per hele time. Svaret må tolkes i situasjonen.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
      ],
      resultLatex: String.raw`$t = 5$ hele timer, som koster $185$ kroner`,
      rationale:
        'Grensen er matematisk, men svaret er praktisk. Når enheten bare finnes i hele tall, må du runde i den retningen situasjonen tillater.',
      hint: 'Regn ut hva 5 timer og 6 timer koster, og sammenlign med de 200 kronene.',
      visual: {
        kind: 'bars',
        bars: [
          { label: '5 timer: 185 kr', value: 185, tone: 'correct' },
          { label: 'Budsjett: 200 kr', value: 200, tone: 'primary' },
          { label: '6 timer: 210 kr', value: 210, tone: 'error' },
        ],
        caption: 'Fem timer ligger under budsjettet. Seks timer sprekker det.',
      },
    },
    {
      kind: 'checkResult',
      prompt: 'Modellkritikk: når slutter modellen å gjelde?',
      options: [
        right(
          'antakelser',
          'Hvis utleier tar minuttpris i stedet for timepris, må modellen endres',
          'Riktig. En modell gjelder bare så lenge antakelsene den bygger på holder.'
        ),
        wrong(
          'alle-t',
          'Modellen gjelder for alle $t$, også negative',
          'Negativ tid finnes ikke her. Definisjonsmengden er $t \\ge 0$.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
        wrong(
          'alltid-gyldig',
          'Modellen gjelder alltid, fordi regnestykket er matematisk riktig',
          'Riktig regning er ikke det samme som en gyldig modell. Antakelsene må også stemme.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
      ],
      resultLatex: String.raw`$t \in [0,\ 5.6]$, og leien betales per hele time`,
      rationale:
        'Modellering er ikke ferdig når tallet er funnet. Du må også si hvilket område modellen gjelder i, og hva som ville endret den.',
      hint: 'Hvilke antakelser gjorde vi om prisen da vi satte opp modellen?',
      visual: {
        kind: 'graph',
        curves: [
          { kind: 'polynomial', coefficients: [60, 25], tone: 'primary', label: 'Pris' },
          { kind: 'polynomial', coefficients: [200], tone: 'accent', label: 'Budsjett' },
        ],
        markers: [
          { x: 5, y: 185, label: '5 timer', tone: 'correct' },
          { x: 6, y: 210, label: '6 timer', tone: 'error' },
        ],
        xRange: [0, 8],
        caption: 'Modellen gjelder bare for $t \\ge 0$ og så lenge prisen er 25 kroner per hele time.',
      },
    },
  ],
  answerLatex: String.raw`Du kan leie i 5 hele timer; den matematiske grensen er $t \le 5.6$`,
  takeaway:
    'Siste steg i modellering er alltid tolkning: riktig enhet, rimelig tall, og avrunding i den retningen situasjonen krever.',
};

const probabilityWalkthrough: GuidedWalkthroughDefinition = {
  id: 'GW-SAN-01',
  topic: Lk20Topic1T.SANNSYNLIGHET,
  goalId: 'SAN-01',
  skillLabel: 'Grunnsannsynlighet',
  title: 'Hvor stor er sjansen for å vinne?',
  situation: 'I en bøtte ligger 20 lodd. 6 av dem er vinnerlodd. Du trekker ett lodd.',
  problemLatex: String.raw`$P(\text{vinner}) = \frac{6}{20}$`,
  steps: [
    {
      kind: 'chooseRule',
      prompt: 'Hvilken brøk gir sannsynligheten for å vinne?',
      options: [
        right('gunstige-mulige', String.raw`$P = \frac{\text{gunstige}}{\text{mulige}} = \frac{6}{20}$`, 'Riktig. Gunstige utfall delt på alle mulige utfall.'),
        wrong('opp-ned', String.raw`$P = \frac{\text{mulige}}{\text{gunstige}} = \frac{20}{6}$`, 'Da blir svaret større enn 1, og en sannsynlighet kan aldri overstige 1.'),
        wrong('feil-nevner', String.raw`$P = \frac{6}{14}$`, 'Nevneren skal være alle loddene (20), ikke bare taperloddene (14).'),
      ],
      resultLatex: String.raw`$P(\text{vinner}) = \frac{6}{20}$`,
      rationale:
        'Når alle utfall er like sannsynlige, er sannsynligheten antall gunstige utfall delt på antall mulige utfall.',
      hint: 'Hvor mange lodd kan du trekke i alt?',
      visual: {
        kind: 'bars',
        bars: [
          { label: 'Vinnerlodd', value: 6, tone: 'correct' },
          { label: 'Alle lodd', value: 20, tone: 'primary' },
        ],
        caption: 'Sannsynlighet sammenligner de gunstige utfallene med hele utfallsrommet.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Skriv brøken som desimaltall og prosent.',
      options: [
        right('30-prosent', String.raw`$\frac{6}{20} = 0.3 = 30\%$`, 'Riktig. $6 : 20 = 0.3$, og $0.3 = 30\\%$.'),
        wrong('60-prosent', String.raw`$\frac{6}{20} = 0.6 = 60\%$`, 'Sjekk divisjonen: $6 : 20 = 0.3$, ikke 0.6.'),
        wrong('over-en', String.raw`$\frac{6}{20} = 3.33 = 333\%$`, 'Brøken står opp ned. Sannsynligheten må ligge mellom 0 og 1.'),
      ],
      resultLatex: String.raw`$P(\text{vinner}) = 0.3 = 30\%$`,
      rationale: 'Desimaltall og prosent er samme tall i to drakter. Prosent er hundredeler.',
      hint: 'Del 6 på 20. Er svaret større eller mindre enn en halv?',
      visual: {
        kind: 'bars',
        bars: [
          { label: 'Vinner (30 %)', value: 30, tone: 'correct' },
          { label: 'Hele utfallsrommet (100 %)', value: 100, tone: 'primary' },
        ],
        caption: 'Tre av ti lodd er vinnerlodd.',
      },
    },
    {
      kind: 'transform',
      prompt: 'Hva er sannsynligheten for å *ikke* vinne?',
      options: [
        right('komplement', String.raw`$1 - 0.3 = 0.7 = 70\%$`, 'Riktig. Komplementregelen: alle utfall til sammen har sannsynlighet 1.'),
        wrong(
          'samme',
          String.raw`$0.3$, siden det er samme trekning`,
          'De to utfallene må til sammen bli 1, så de kan ikke være like her.',
          MisconceptionType.PROBABILITY_COMBINATION_ERROR
        ),
        wrong('over-en', String.raw`$\frac{14}{6} \approx 2.33$`, 'Over 1 er umulig. Nevneren må fortsatt være 20, ikke 6.'),
      ],
      resultLatex: String.raw`$P(\text{ikke vinner}) = 0.7 = 70\%$`,
      rationale:
        String.raw`Komplementregelen sier $P(\text{ikke }A) = 1 - P(A)$, fordi noe av utfallene alltid skjer.`,
      hint: 'Hvor mye må legges til 0.3 for å komme til 1?',
      visual: {
        kind: 'bars',
        bars: [
          { label: 'Vinner (30 %)', value: 30, tone: 'correct' },
          { label: 'Ikke vinner (70 %)', value: 70, tone: 'accent' },
        ],
        caption: 'De to søylene dekker hele utfallsrommet: $30\\% + 70\\% = 100\\%$.',
      },
    },
    {
      kind: 'interpret',
      prompt: 'Du trekker et lodd 10 ganger og legger loddet tilbake hver gang. Hva kan du forvente?',
      options: [
        right('omtrent-tre', 'Omtrent 3 vinnerlodd, men ingen garanti', 'Riktig. $10\\cdot 0.3 = 3$ er forventningen over mange forsøk.'),
        wrong(
          'noyaktig-tre',
          'Nøyaktig 3 vinnerlodd',
          'Sannsynlighet gir en forventning over tid, ikke en garanti for hver serie.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
        wrong(
          'minst-en',
          'Minst 1 vinnerlodd garantert',
          'Det er fullt mulig å tape 10 ganger på rad. Sannsynligheten for det er omtrent 3 %.',
          MisconceptionType.UNIT_INTERPRETATION_ERROR
        ),
      ],
      resultLatex: String.raw`$10\cdot 0.3 = 3$ forventede vinnerlodd`,
      rationale:
        'Forventningsverdi er et gjennomsnitt over mange forsøk. Den sier ingenting sikkert om ett enkelt forsøk.',
      hint: 'Gang antall trekninger med sannsynligheten for å vinne.',
      visual: {
        kind: 'bars',
        bars: [
          { label: 'Forventet vinnere av 10', value: 3, tone: 'correct' },
          { label: 'Forventet tapere av 10', value: 7, tone: 'muted' },
        ],
        caption: 'Forventningsverdien er et snitt, ikke et løfte om hva som skjer neste gang.',
      },
    },
  ],
  answerLatex: String.raw`$P(\text{vinner}) = 0.3 = 30\%$ og $P(\text{ikke vinner}) = 0.7 = 70\%$`,
  takeaway:
    'Tell gunstige og mulige utfall først. Bruk komplementregelen når ordene «ikke» eller «minst» står i oppgaven.',
};

export const GUIDED_WALKTHROUGH_DEFINITIONS: readonly GuidedWalkthroughDefinition[] = [
  algebraWalkthrough,
  equationWalkthrough,
  functionWalkthrough,
  derivativeWalkthrough,
  trigonometryWalkthrough,
  modellingWalkthrough,
  probabilityWalkthrough,
];
