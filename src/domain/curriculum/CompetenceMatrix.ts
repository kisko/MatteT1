import { Lk20Topic1T } from '../model/task/value-objects/Lk20Category.js';

export interface CompetenceGoalDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly taskLabels: readonly string[];
  readonly targetTasks: number;
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
  targetTasks = 2
): CompetenceGoalDefinition => ({ id, title, description, taskLabels, targetTasks });

export const COMPETENCE_MATRIX: readonly CurriculumTopicDefinition[] = [
  {
    topic: Lk20Topic1T.TALL_OG_ALGEBRA,
    title: 'Algebra & tallforståelse',
    description: 'Regneregler, uttrykk, potenser, røtter og algebraisk struktur.',
    core: true,
    goals: [
      goal('ALG-01', 'Potenser, røtter og standardform', 'Bruke potensregler, røtter og standardform i beregninger.', ['Potensfunksjoner', 'Røtter og potenser', 'Standardform']),
      goal('ALG-02', 'Kvadratsetninger og faktorisering', 'Utvikle, faktorisere og kontrollere algebraiske uttrykk.', ['Faktorisering']),
      goal('ALG-03', 'Rasjonale uttrykk og funksjoner', 'Forenkle rasjonale uttrykk og ta hensyn til definisjonsmengden.', ['Rasjonale uttrykk', 'Rasjonale funksjoner']),
      goal('ALG-04', 'Polynomdivisjon', 'Bruke polynomdivisjon til å analysere uttrykk og funksjoner.', ['Polynomdivisjon']),
    ],
  },
  {
    topic: Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
    title: 'Ligninger & ulikheter',
    description: 'Løse, tolke og begrunne ligninger, systemer og ulikheter.',
    core: true,
    goals: [
      goal('LIG-01', 'Lineære ligninger og systemer', 'Løse lineære ligninger og ligningssystemer algebraisk og grafisk.', ['Lineære ligninger', 'Likningssystemer']),
      goal('LIG-02', 'Andregradsligninger', 'Bruke faktorisering, abc-formelen og diskriminanten.', ['Andregradslikninger', 'Diskriminant']),
      goal('LIG-03', 'Ulikheter og fortegnsskjema', 'Løse ulikheter og presentere løsning som intervall eller mengde.', ['Fortegnsskjema', 'Rasjonale ulikheter']),
    ],
  },
  {
    topic: Lk20Topic1T.FUNKSJONER,
    title: 'Funksjoner',
    description: 'Representere, tolke og sammenligne funksjoner i flere representasjoner.',
    core: true,
    goals: [
      goal('FUN-01', 'Funksjonsbegrepet og tabeller', 'Koble sammen situasjon, tabell, formel og graf.', ['Tabeller og vekst']),
      goal('FUN-02', 'Lineære og andregradsfunksjoner', 'Analysere stigning, nullpunkt, toppunkt og parameterne i modellen.', ['Nullpunkter', 'Andregradsfunksjoner', 'Parametre']),
      goal('FUN-03', 'Eksponentialfunksjoner og vekst', 'Modellere prosentvis vekst og tolke vekstfaktor.', ['Eksponentialfunksjoner']),
      goal('FUN-04', 'Skjæringspunkter og modellgrense', 'Finne skjæringspunkter og vurdere når en funksjonsmodell gjelder.', ['Skjæringspunkter']),
    ],
  },
  {
    topic: Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
    title: 'Derivasjon & vekstfart',
    description: 'Forstå endring, stigning, ekstremalpunkter og optimering.',
    core: true,
    goals: [
      goal('DER-01', 'Gjennomsnittlig og momentan vekstfart', 'Skille mellom gjennomsnittlig endring og endring i et punkt.', ['Gjennomsnittlig vekstfart', 'Momentan vekstfart']),
      goal('DER-02', 'Derivasjonsregler', 'Derivere polynomer og sammensatte uttrykk ledd for ledd.', ['Derivasjonsregler']),
      goal('DER-03', 'Tangent og tolkning', 'Bruke den deriverte til å finne tangent og tolke enheter.', ['Tangent']),
      goal('DER-04', 'Ekstremalpunkter og optimering', 'Finne og begrunne topp- og bunnpunkter i en modell.', ['Ekstremalpunkt', 'Optimering']),
    ],
  },
  {
    topic: Lk20Topic1T.TRIGONOMETRI,
    title: 'Trigonometri',
    description: 'Bruke trekantgeometri, trigonometriske forhold og setninger.',
    core: true,
    goals: [
      goal('TRI-01', 'Rettvinklede trekanter', 'Bruke Pytagoras og sinus, cosinus og tangens.', ['Pytagoras', 'Sinus, cosinus og tangens']),
      goal('TRI-02', 'Sinussetningen', 'Koble side og motstående vinkel i vilkårlige trekanter.', ['Sinussetningen']),
      goal('TRI-03', 'Cosinussetningen', 'Finne ukjente sider eller vinkler i vilkårlige trekanter.', ['Cosinussetningen']),
      goal('TRI-04', 'Arealsetningen', 'Beregne areal med to sider og inkludert vinkel.', ['Arealsetningen']),
    ],
  },
  {
    topic: Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING,
    title: 'Modellering & problemløsing',
    description: 'Velge modeller, bruke digitale strategier og vurdere resultater kritisk.',
    core: true,
    goals: [
      goal('MOD-01', 'Matematisk modellering', 'Gå fra situasjon til variabler, modell, løsning og vurdering.', ['Modellering']),
      goal('MOD-02', 'Lineære modeller', 'Tolke koeffisienter, enheter og gyldighetsområde i lineære modeller.', ['Lineær modell']),
      goal('MOD-03', 'Algoritmisk tenkning og programmering', 'Beskrive og bruke algoritmer til å utforske matematiske problemer.', ['Algoritmisk tenkning', 'Programmering og algoritmer']),
      goal('MOD-04', 'Modellvalg og modellkritikk', 'Sammenligne modeller og vurdere presisjon, antakelser og begrensninger.', ['Modellvalg', 'Modellkritikk']),
    ],
  },
  {
    topic: Lk20Topic1T.SANNSYNLIGHET,
    title: 'Sannsynlighet',
    description: 'Ekstra repetisjon i sannsynlighet, kombinatorikk og binomiske forsøk.',
    core: false,
    goals: [
      goal('SAN-01', 'Grunnsannsynlighet og komplement', 'Bruke utfallsrom, komplement og enkle sannsynlighetsmodeller.', ['Grunnsannsynlighet', 'Komplement']),
      goal('SAN-02', 'Kombinatorikk', 'Telle ordnede og uordnede valg med passende metode.', ['Kombinatorikk']),
      goal('SAN-03', 'Betinget sannsynlighet og uavhengighet', 'Tolke betingelser og avgjøre når hendelser er uavhengige.', ['Betinget sannsynlighet', 'Uavhengighet']),
      goal('SAN-04', 'Binomiske forsøk', 'Modellere gjentatte forsøk med to utfall.', ['Binomiske forsøk']),
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