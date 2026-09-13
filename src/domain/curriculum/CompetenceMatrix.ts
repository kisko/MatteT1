import { Lk20Topic1T } from '../model/task/value-objects/Lk20Category.js';

export interface VideoResource {
  readonly title: string;
  readonly url: string;
  readonly channel: string;
}

export interface CompetenceGoalDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly taskLabels: readonly string[];
  readonly targetTasks: number;
  readonly videoResources?: readonly VideoResource[];
}

export interface CurriculumTopicDefinition {
  readonly topic: Lk20Topic1T;
  readonly title: string;
  readonly description: string;
  readonly core: boolean;
  readonly goals: readonly CompetenceGoalDefinition[];
}

const goal = (
  id: string,
  title: string,
  description: string,
  taskLabels: string[],
  targetTasks = 2,
  videoResources?: VideoResource[]
): CompetenceGoalDefinition => ({
  id,
  title,
  description,
  taskLabels,
  targetTasks,
  ...(videoResources ? { videoResources } : {}),
});

export const COMPETENCE_MATRIX: readonly CurriculumTopicDefinition[] = [
  {
    topic: Lk20Topic1T.TALL_OG_ALGEBRA,
    title: 'Algebra & tallforståelse',
    description: 'Regneregler, uttrykk, potenser, røtter og algebraisk struktur.',
    core: true,
    goals: [
      goal(
        'ALG-01',
        'Potenser, røtter og standardform',
        'Bruke potensregler, røtter og standardform i beregninger.',
        ['Potensfunksjoner', 'Røtter og potenser', 'Standardform'],
        2,
        [
          { title: 'Potensregler og røtter', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+potensregler+1T' },
          { title: 'Standardform og potenser', channel: 'UDL.no', url: 'https://www.youtube.com/results?search_query=udl+potenser+standardform' },
        ]
      ),
      goal(
        'ALG-02',
        'Kvadratsetninger og faktorisering',
        'Utvikle, faktorisere og kontrollere algebraiske uttrykk.',
        ['Faktorisering'],
        2,
        [
          { title: 'Kvadratsetningene og konjugatsetningen', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+kvadratsetningene+1T' },
          { title: 'Faktorisering av andregradsuttrykk', channel: 'UDL.no', url: 'https://www.youtube.com/results?search_query=udl+faktorisering+1T' },
        ]
      ),
      goal(
        'ALG-03',
        'Rasjonale uttrykk og funksjoner',
        'Forenkle rasjonale uttrykk og ta hensyn til definisjonsmengden.',
        ['Rasjonale uttrykk', 'Rasjonale funksjoner'],
        2,
        [
          { title: 'Forenkling av brøkuttrykk og fellesnevner', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+rasjonale+uttrykk+1T' },
          { title: 'Rasjonale uttrykk og forkorting', channel: 'UDL.no', url: 'https://www.youtube.com/results?search_query=udl+rasjonale+uttrykk' },
        ]
      ),
      goal(
        'ALG-04',
        'Polynomdivisjon',
        'Bruke polynomdivisjon til å analysere uttrykk og funksjoner.',
        ['Polynomdivisjon'],
        2,
        [
          { title: 'Polynomdivisjon steg for steg', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+polynomdivisjon+1T' },
          { title: 'Polynomdivisjon og faktorisering', channel: 'UDL.no', url: 'https://www.youtube.com/results?search_query=udl+polynomdivisjon' },
        ]
      ),
    ],
  },
  {
    topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
    title: 'Ligninger & ulikheter',
    description: 'Løse, tolke og begrunne ligninger, systemer og ulikheter.',
    core: true,
    goals: [
      goal(
        'LIG-01',
        'Lineære ligninger og systemer',
        'Løse lineære ligninger og ligningssystemer algebraisk og grafisk.',
        ['Lineære ligninger', 'Likningssystemer'],
        2,
        [
          { title: 'Lineære ligningssett med to ukjente', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+ligningssett+1T' },
        ]
      ),
      goal(
        'LIG-02',
        'Andregradsligninger',
        'Bruke faktorisering, abc-formelen og diskriminanten.',
        ['Andregradslikninger', 'Diskriminant'],
        2,
        [
          { title: 'Andregradsligninger og abc-formelen', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+andregradsligninger+1T' },
          { title: 'Løse andregradsligninger', channel: 'UDL.no', url: 'https://www.youtube.com/results?search_query=udl+andregradsligninger+abc' },
        ]
      ),
      goal(
        'LIG-03',
        'Ulikheter og fortegnsskjema',
        'Løse ulikheter og presentere løsning som intervall eller mengde.',
        ['Fortegnsskjema', 'Rasjonale ulikheter'],
        2,
        [
          { title: 'Fortegnsskjema for ulikheter', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+fortegnsskjema+1T' },
          { title: 'Rasjonale ulikheter med fortegnslinje', channel: 'UDL.no', url: 'https://www.youtube.com/results?search_query=udl+ulikheter+fortegnsskjema' },
        ]
      ),
    ],
  },
  {
    topic: Lk20Topic1T.FUNKSJONER,
    title: 'Funksjoner',
    description: 'Representere, tolke og sammenligne funksjoner i flere representasjoner.',
    core: true,
    goals: [
      goal(
        'FUN-01',
        'Funksjonsbegrepet og tabeller',
        'Koble sammen situasjon, tabell, formel og graf.',
        ['Tabeller og vekst'],
        2,
        [
          { title: 'Funksjonsbegrepet og grafer', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+funksjoner+1T' },
        ]
      ),
      goal(
        'FUN-02',
        'Lineære og andregradsfunksjoner',
        'Analysere stigning, nullpunkt, toppunkt og parameterne i modellen.',
        ['Nullpunkter', 'Andregradsfunksjoner', 'Parametre'],
        2,
        [
          { title: 'Andregradsfunksjoner og parabelen', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+andregradsfunksjon+1T' },
        ]
      ),
      goal(
        'FUN-03',
        'Eksponentialfunksjoner og vekst',
        'Modellere prosentvis vekst og tolke vekstfaktor.',
        ['Eksponentialfunksjoner'],
        2,
        [
          { title: 'Eksponentialfunksjoner og vekstfaktor', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+eksponentialfunksjon+1T' },
        ]
      ),
      goal(
        'FUN-04',
        'Skjæringspunkter og modellgrense',
        'Finne skjæringspunkter og vurdere når en funksjonsmodell gjelder.',
        ['Skjæringspunkter'],
        2,
        [
          { title: 'Skjæringspunkt mellom to grafer', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+skjæringspunkt+grafer+1T' },
        ]
      ),
    ],
  },
  {
    topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
    title: 'Derivasjon & vekstfart',
    description: 'Forstå endring, stigning, ekstremalpunkter og optimering.',
    core: true,
    goals: [
      goal(
        'DER-01',
        'Gjennomsnittlig og momentan vekstfart',
        'Skille mellom gjennomsnittlig endring og endring i et punkt.',
        ['Gjennomsnittlig vekstfart', 'Momentan vekstfart'],
        2,
        [
          { title: 'Gjennomsnittlig og momentan vekstfart', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+vekstfart+derivasjon+1T' },
          { title: 'Introduksjon til derivasjon', channel: 'UDL.no', url: 'https://www.youtube.com/results?search_query=udl+derivasjon+vekstfart' },
        ]
      ),
      goal(
        'DER-02',
        'Derivasjonsregler',
        'Derivere polynomer og sammensatte uttrykk ledd for ledd.',
        ['Derivasjonsregler'],
        2,
        [
          { title: 'Derivasjonsregler for polynomer', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+derivasjonsregler+1T' },
        ]
      ),
      goal(
        'DER-03',
        'Tangent og tolkning',
        'Bruke den deriverte til å finne tangent og tolke enheter.',
        ['Tangent'],
        2,
        [
          { title: 'Tangentligning med derivasjon', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+tangent+1T' },
        ]
      ),
      goal(
        'DER-04',
        'Ekstremalpunkter og optimering',
        'Finne og begrunne topp- og bunnpunkter i en modell.',
        ['Ekstremalpunkt', 'Optimering'],
        2,
        [
          { title: 'Topp- og bunnpunkter med den deriverte', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+ekstremalpunkter+drøfting+1T' },
        ]
      ),
    ],
  },
  {
    topic: Lk20Topic1T.TRIGONOMETRI,
    title: 'Trigonometri',
    description: 'Bruke trekantgeometri, trigonometriske forhold og setninger.',
    core: true,
    goals: [
      goal(
        'TRI-01',
        'Rettvinklede trekanter',
        'Bruke Pytagoras og sinus, cosinus og tangens.',
        ['Pytagoras', 'Sinus, cosinus og tangens'],
        2,
        [
          { title: 'Trigonometri i rettvinklede trekanter', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+trigonometri+1T' },
        ]
      ),
      goal(
        'TRI-02',
        'Sinussetningen',
        'Koble side og motstående vinkel i vilkårlige trekanter.',
        ['Sinussetningen'],
        2,
        [
          { title: 'Sinussetningen forklart', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+sinussetningen+1T' },
        ]
      ),
      goal(
        'TRI-03',
        'Cosinussetningen',
        'Finne ukjente sider eller vinkler i vilkårlige trekanter.',
        ['Cosinussetningen'],
        2,
        [
          { title: 'Cosinussetningen i praksis', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+cosinussetningen+1T' },
        ]
      ),
      goal(
        'TRI-04',
        'Arealsetningen',
        'Beregne areal med to sider og inkludert vinkel.',
        ['Arealsetningen'],
        2,
        [
          { title: 'Arealsetningen for vilkårlige trekanter', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+arealsetningen+1T' },
        ]
      ),
    ],
  },
  {
    topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
    title: 'Modellering & problemløsing',
    description: 'Velge modeller, bruke digitale strategier og vurdere resultater kritisk.',
    core: true,
    goals: [
      goal(
        'MOD-01',
        'Matematisk modellering',
        'Gå fra situasjon til variabler, modell, løsning og vurdering.',
        ['Modellering'],
        2,
        [
          { title: 'Matematisk modellering i 1T', channel: 'Lektor Dahl', url: 'https://www.youtube.com/results?search_query=lektor+dahl+modellering+1T' },
        ]
      ),
      goal(
        'MOD-02',
        'Lineære modeller',
        'Tolke koeffisienter, enheter og gyldighetsområde i lineære modeller.',
        ['Lineær modell'],
        2,
        [
          { title: 'Lineær modellering og regresjon', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+regresjon+1T' },
        ]
      ),
      goal(
        'MOD-03',
        'Algoritmisk tenkning og programmering',
        'Beskrive og bruke algoritmer til å utforske matematiske problemer.',
        ['Algoritmisk tenkning', 'Programmering og algoritmer'],
        2,
        [
          { title: 'Python i 1T - halveringsmetoden og numerikk', channel: 'Lektor Dahl', url: 'https://www.youtube.com/results?search_query=lektor+dahl+python+1T' },
        ]
      ),
      goal(
        'MOD-04',
        'Modellvalg og modellkritikk',
        'Sammenligne modeller og vurdere presisjon, antakelser og begrensninger.',
        ['Modellvalg', 'Modellkritikk'],
        2,
        [
          { title: 'Modellkritikk og feilkilder', channel: 'Lektor Dahl', url: 'https://www.youtube.com/results?search_query=lektor+dahl+modellkritikk+1T' },
        ]
      ),
    ],
  },
  {
    topic: Lk20Topic1T.SANNSYNLIGHET,
    title: 'Sannsynlighet',
    description: 'Ekstra repetisjon i sannsynlighet, kombinatorikk og binomiske forsøk.',
    core: false,
    goals: [
      goal(
        'SAN-01',
        'Grunnsannsynlighet og komplement',
        'Bruke utfallsrom, komplement og enkle sannsynlighetsmodeller.',
        ['Grunnsannsynlighet', 'Komplement'],
        2,
        [
          { title: 'Sannsynlighetsregning i 1T', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+sannsynlighet+1T' },
        ]
      ),
      goal(
        'SAN-02',
        'Kombinatorikk',
        'Telle ordnede og uordnede valg med passende metode.',
        ['Kombinatorikk'],
        2,
        [
          { title: 'Kombinatorikk og tellemåter', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+kombinatorikk+1T' },
        ]
      ),
      goal(
        'SAN-03',
        'Betinget sannsynlighet og uavhengighet',
        'Tolke betingelser og avgjøre når hendelser er uavhengige.',
        ['Betinget sannsynlighet', 'Uavhengighet'],
        2,
        [
          { title: 'Betinget sannsynlighet og valgtrær', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+betinget+sannsynlighet+1T' },
        ]
      ),
      goal(
        'SAN-04',
        'Binomiske forsøk',
        'Modellere gjentatte forsøk med to utfall.',
        ['Binomiske forsøk'],
        2,
        [
          { title: 'Binomisk sannsynlighet', channel: 'Lektor Thue', url: 'https://www.youtube.com/results?search_query=lektor+thue+binomisk+sannsynlighet+1T' },
        ]
      ),
    ],
  },
];

export const getCurriculumTopic = (topic: Lk20Topic1T): CurriculumTopicDefinition => {
  const definition = COMPETENCE_MATRIX.find((item) => item.topic === topic);
  if (!definition) {
    throw new Error(`Mangler kompetansematrise for ${topic}`);
  }
  return definition;
};