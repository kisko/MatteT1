import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  PlayCircle,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { Lk20Topic1T, Lk20TopicNames } from '../../domain/model/task/value-objects/Lk20Category.js';
import { getCurriculumTopic, VideoResource } from '../../domain/curriculum/CompetenceMatrix.js';
import { MathView } from '../MathView.js';
import { VideoModal } from '../components/VideoModal.js';

interface LectureSection {
  title: string;
  explanation: string;
  formula: string;
  breakdown: string[];
  code?: string;
}

const memoryTips: Record<string, string> = {
  'Potens betyr gjentatt multiplikasjon': 'Samme grunntall ganger? Legg sammen eksponentene.',
  'Røtter og negative eksponenter': 'Rot og potens er motsatte veier. Negativ eksponent betyr omvendt brøk.',
  'Standardform gjør store tall lesbare': 'Flytt kommaet til etter første siffer. Antall hopp blir eksponenten.',
  'Kvadratsetningene pakker ut produkter': 'Første², pluss/minus dobbeltprodukt, siste².',
  'Faktorisering viser strukturen': 'Felles faktor først. Gang tilbake for å sjekke.',
  'Rasjonale uttrykk har skjulte begrensninger': 'Forkort faktorer, men aldri glem hva som gjorde nevneren null.',
  'Polynomdivisjon kobler uttrykk og funksjoner': 'Del, gang, trekk fra. Gjenta til graden er lav nok.',
  'Ligningen er en balanse': 'Gjør det samme på begge sider, ett ryddig steg om gangen.',
  'Brøk- og parentesligninger': 'Fjern nevneren fra alle ledd før du forenkler.',
  'Andregradsligninger og abc-formelen': 'Finn a, b og c først. Sett dem inn med fortegn.',
  'Ulikheter snur ved negativ multiplikasjon': 'Deler du på minus, snur tegnet.',
  'Fortegnsskjema samler mange intervaller': 'Nullpunkter deler tallinjen. Test ett tall i hvert intervall.',
  'Likningssystem finner et felles punkt': 'To regler, ett punkt. Sett uttrykkene lik hverandre.',
  'Input blir til output': 'Sett inn x, regn ut y. Punktet blir (x, f(x)).',
  'Lineære funksjoner har fast vekst': 'a går bortover til opp/ned. b starter på y-aksen.',
  'Andregradsfunksjonen bøyer seg': 'a bestemmer åpningen, b flytter symmetrilinjen, c starter på y-aksen.',
  'Nullpunktet er der grafen treffer aksen': 'Nullpunkt betyr y=0. Sett funksjonen lik null.',
  'Eksponentialfunksjoner beskriver prosentvis vekst': 'Prosent hver periode betyr gange med vekstfaktor.',
  'Modell, definisjonsmengde og tolkning': 'Regn, skriv enhet, vurder om svaret gir mening.',
  'Gjennomsnittlig vekstfart': 'Endring i høyde delt på endring bortover.',
  'Den deriverte i et punkt': 'Derivert er stigning akkurat nå.',
  'Potensregelen og ledd for ledd': 'Potensen ned som faktor, eksponenten ned med én.',
  'Tangentlinjen bruker punkt og stigning': 'Punkt pluss stigning gir tangent.',
  'Voksende, avtakende og ekstremalpunkt': 'Pluss betyr opp, minus betyr ned. Null kan være topp eller bunn.',
  'Derivasjon i praktiske modeller': 'Les enheten: den forteller hva endringen betyr.',
  'Vinkelmål og rettvinklet trekant': 'SOH-CAH-TOA: Sin=Opp/Hyp, Cos=Hos/Hyp, Tan=Opp/Hos.',
  'Pytagoras og rettvinklede problemer': 'Katet² + katet² = hypotenus².',
  'Sinussetningen gjelder alle trekanter': 'Side og motstående vinkel er et par.',
  'Cosinussetningen finner manglende sider og vinkler': 'To sider og vinkelen mellom? Tenk cosinus.',
  'Arealsetningen finner trekantareal': 'Halvparten av side ganger side ganger sinus av vinkelen mellom.',
  'Fra situasjon til matematisk modell': 'Situasjon, variabel, modell, resultat, vurdering.',
  'Problemløsingsstrategier': 'Forstå, planlegg, gjennomfør, kontroller.',
  'Algoritmisk tenkning og programmering': 'Input inn, trinn utføres, output ut.',
  'Bevis og argumentasjon': 'Et eksempel viser én gang. Et bevis viser hvorfor alltid.',
  'Digitale verktøy og kritisk vurdering': 'Verktøyet regner. Du forklarer og vurderer.',
  'Grunnsannsynlighet': 'Gunstige delt på mulige.',
  'Mengder: og, eller og ikke': 'Snitt er overlapp. Union er alt i minst én mengde.',
  'Kombinatorikk teller valg uten å liste alt': 'Spør først: betyr rekkefølgen noe?',
  'Valgtre og produktregelen': 'Gang langs en vei, legg sammen veier.',
  'Betinget sannsynlighet': 'Når B er kjent, blir B det nye utfallsrommet.',
  'Uavhengighet og binomiske forsøk': 'Samme sjanse, to utfall, uavhengige forsøk.',
};

const getMemoryTip = (sectionTitle: string) => memoryTips[sectionTitle] ?? 'Si regelen med egne ord, og forklar når den kan brukes.';

interface LectureContent {
  eyebrow: string;
  summary: string;
  sections: LectureSection[];
  learningGoals: string[];
  checkpoint: {
    question: string;
    answer: string;
    explanation: string;
  };
  focus: string[];
  nextStep: string;
}

interface LectureViewProps {
  topic: Lk20Topic1T;
  onBack: () => void;
  onStartPractice: () => void;
}

interface PracticalLesson {
  title: string;
  situation: string;
  model: string;
  task: string;
  answer: string;
  solutionSteps: string[];
  interpretation: string;
  reflection: string;
  additionalExamples: PracticalLessonExample[];
}

interface PracticalLessonExample {
  title: string;
  situation: string;
  model: string;
  task: string;
  answer: string;
  solutionSteps: string[];
  interpretation: string;
  reflection: string;
}

const practicalLessons: Record<Lk20Topic1T, PracticalLesson> = {
  [Lk20Topic1T.TALL_OG_ALGEBRA]: {
    title: 'Hva koster en taxitur?',
    situation: 'Et taxiselskap tar et fast startgebyr på 80 kroner og 12 kroner per kilometer.',
    model: String.raw`$K(x)=80+12x$`,
    task: 'Hvor mye koster en tur på 7 km?',
    answer: String.raw`$K(7)=80+12\cdot7=164$ kroner.`,
    solutionSteps: [String.raw`$K(x)=80+12x$`, String.raw`$K(7)=80+12\cdot7$`, String.raw`$K(7)=80+84=164$ kroner.`],
    interpretation: '80 kroner er konstantleddet, mens 12 kroner per kilometer er koeffisienten foran x.',
    reflection: 'Hva skjer med prisen hvis startgebyret øker, men kilometerprisen er uendret?',
    additionalExamples: [
      { title: 'Arealet av en ramme', situation: 'Et bilde er x meter bredt. En ramme på 0,2 meter legges rundt hele bildet.', model: String.raw`$A=(x+0.4)(x+0.4)$`, task: 'Utvikle uttrykket for arealet av bildet med ramme.', answer: String.raw`$A=x^2+0.8x+0.16$.`, solutionSteps: [String.raw`$A=(x+0.4)^2$`, String.raw`$A=x^2+2\cdot x\cdot0.4+0.4^2$`, String.raw`$A=x^2+0.8x+0.16$`], interpretation: 'Produktet viser hvordan lengde og bredde må multipliseres. Utviklingen gjør leddene synlige.', reflection: 'Hva skjer med arealet hvis rammen blir dobbelt så bred?' },
      { title: 'Lån og rente', situation: 'Et lån vokser med en fast prosent hvert år. Startbeløpet er 10 000 kroner og renten er 5 prosent.', model: String.raw`$L(n)=10000\cdot1.05^n$`, task: 'Hvilken type uttrykk beskriver utviklingen?', answer: 'Dette er en eksponentialmodell fordi beløpet ganges med samme vekstfaktor hver periode.', solutionSteps: [String.raw`$10000$ kroner er startverdien.`, String.raw`$5\%=0.05\Rightarrow$ vekstfaktor $=1+0.05=1.05$.`, String.raw`$L(n)=10000\cdot1.05^n$`], interpretation: 'Algebraen viser at prosentvis vekst ikke er det samme som å legge til et fast beløp.', reflection: 'Når ville en lineær modell vært mer passende?' },
    ],
  },
  [Lk20Topic1T.LIGNINGER_OG_ULIKHETER]: {
    title: 'Når lønner det seg å bytte abonnement?',
    situation: 'Abonnement A koster 80 kroner fast og 12 kroner per bruk. Abonnement B koster 140 kroner fast og 8 kroner per bruk.',
    model: String.raw`$80+12x=140+8x$`,
    task: 'Ved hvor mange bruk koster abonnementene det samme?',
    answer: String.raw`$4x=60\Rightarrow x=15$. De koster det samme etter 15 bruk.`,
    solutionSteps: [String.raw`$80+12x=140+8x$`, String.raw`$12x-8x=140-80$`, String.raw`$4x=60$`, String.raw`$x=15$`],
    interpretation: 'Under 15 bruk er A billigst. Over 15 bruk blir B billigst fordi den har lavere pris per bruk.',
    reflection: 'Hvilket abonnement ville du valgt hvis du bruker tjenesten 10 ganger i måneden?',
    additionalExamples: [
      { title: 'Budsjett som ulikhet', situation: 'Du har 500 kroner og vil kjøpe kinobilletter til 120 kroner pluss snacks til 45 kroner per person.', model: String.raw`$120+45x\le500$`, task: 'Hvor mange personer kan du kjøpe til?', answer: String.raw`$45x\le380\Rightarrow x\le8.44$. Du kan kjøpe til 8 personer.`, solutionSteps: [String.raw`$120+45x\le500$`, String.raw`$45x\le500-120=380$`, String.raw`$x\le\frac{380}{45}\approx8.44$`, 'Antall personer må være heltallig, derfor blir svaret 8 personer.'], interpretation: 'En ulikhet gir et område av mulige svar. Her må vi også ta hensyn til at antall personer er heltallig.', reflection: 'Hva ville endret svaret mest: billettprisen eller snackprisen?' },
      { title: 'Ballens høyde', situation: 'Høyden til en ball etter t sekunder er omtrent $h(t)=-5t^2+20t+1$.', model: String.raw`$h(t)=-5t^2+20t+1$`, task: 'Når treffer ballen bakken?', answer: String.raw`$h(t)=0$ gir omtrent $t=4.05$ sekunder.`, solutionSteps: [String.raw`$-5t^2+20t+1=0$`, String.raw`$t=\frac{-20\pm\sqrt{20^2-4\cdot(-5)\cdot1}}{2\cdot(-5)}$`, String.raw`$t\approx4.05$ eller $t\approx-0.05$`, 'Negativ tid gir ikke mening i situasjonen, så ballen treffer bakken etter omtrent 4,05 sekunder.'], interpretation: 'Andregradsligningen kan ha to løsninger matematisk, men bare den positive tiden gir mening i situasjonen.', reflection: 'Hvorfor må den negative løsningen forkastes?' },
    ],
  },
  [Lk20Topic1T.FUNKSJONER]: {
    title: 'Les temperaturen gjennom dagen',
    situation: 'En enkel modell beskriver temperaturen fra klokken 08 til 14 som en funksjon av antall timer etter klokken 08.',
    model: String.raw`$T(t)=2t+8$`,
    task: 'Hva sier modellen om temperaturen etter 4 timer?',
    answer: String.raw`$T(4)=2\cdot4+8=16^\circ\text{C}$.`,
    solutionSteps: [String.raw`$T(t)=2t+8$`, String.raw`$T(4)=2\cdot4+8$`, String.raw`$T(4)=8+8=16^\circ\text{C}$`],
    interpretation: 'Grafen stiger med 2 grader per time, og 8 grader er startverdien klokken 08.',
    reflection: 'Hvor lenge kan denne lineære modellen være realistisk før temperaturen slutter å øke?',
    additionalExamples: [
      { title: 'En parabel i en fontene', situation: 'Vannstrålen følger modellen $h(x)=-0.5x^2+3x+1$, der x er avstand i meter.', model: String.raw`$h(x)=-0.5x^2+3x+1$`, task: 'Hvordan påvirker koeffisientene høyden og formen på grafen?', answer: 'Den negative a-verdien gjør at grafen vender nedover. Toppunktet viser maksimal høyde.', solutionSteps: [String.raw`$a=-0.5<0$`, String.raw`$x_{topp}=-\frac{b}{2a}=-\frac{3}{2\cdot(-0.5)}=3$`, String.raw`$h(3)=-0.5\cdot3^2+3\cdot3+1=5.5$ meter`], interpretation: 'Andregradsfunksjonen beskriver en helt annen grafisk form enn en rett linje.', reflection: 'Hvor på grafen finner du når vannet treffer bakken?' },
      { title: 'Bakterievekst', situation: 'En bakteriekultur starter med 200 bakterier og vokser med 30 prosent per time.', model: String.raw`$B(t)=200\cdot1.3^t$`, task: 'Hvor mange bakterier er det etter 4 timer?', answer: String.raw`$B(4)=200\cdot1.3^4\approx571$.`, solutionSteps: [String.raw`$B(t)=200\cdot1.3^t$`, String.raw`$B(4)=200\cdot1.3^4$`, String.raw`$B(4)\approx571$ bakterier`], interpretation: 'Eksponentialfunksjonen vokser raskere fordi økningen regnes av en stadig større mengde.', reflection: 'Hvorfor kan modellen ikke brukes ubegrenset lenge?' },
      { title: 'Pris og nullpunkt', situation: 'En bedrift har inntekt $I(x)=200x$ og kostnad $K(x)=5000+80x$.', model: String.raw`$O(x)=I(x)-K(x)=120x-5000$`, task: 'Hvor mange salg trengs før overskuddet blir positivt?', answer: String.raw`$120x-5000>0\Rightarrow x>41.67$. Det kreves 42 salg.`, solutionSteps: [String.raw`$O(x)=200x-(5000+80x)=120x-5000$`, String.raw`$120x-5000>0$`, String.raw`$120x>5000$`, String.raw`$x>41.67$, altså minst 42 salg`], interpretation: 'Nullpunktet viser når inntekt og kostnad er like store.', reflection: 'Hva bør bedriften vurdere dersom modellen bare gjelder for de første 100 salgene?' },
    ],
  },
  [Lk20Topic1T.DERIVASJON_OG_VEKSTFART]: {
    title: 'Hvor fort sykler du akkurat nå?',
    situation: 'Posisjonen til en syklist kan modelleres med $s(t)=t^2+2t$, der s måles i meter og t i sekunder.',
    model: String.raw`$s\prime(t)=2t+2$`,
    task: 'Hvor stor er farten etter 3 sekunder?',
    answer: String.raw`$s\prime(3)=2\cdot3+2=8$ m/s.`,
    solutionSteps: [String.raw`$s(t)=t^2+2t$`, String.raw`$s\prime(t)=2t+2$`, String.raw`$s\prime(3)=2\cdot3+2=8$ m/s`],
    interpretation: 'Den deriverte gir momentan fart, ikke bare gjennomsnittlig fart for hele turen.',
    reflection: 'Hvorfor øker farten i denne modellen?',
    additionalExamples: [
      { title: 'Maksimal fortjeneste', situation: 'Fortjenesten til en bedrift er $P(x)=-x^2+40x-100$, der x er antall produkter.', model: String.raw`$P\prime(x)=-2x+40$`, task: 'Hvor mange produkter gir maksimal fortjeneste?', answer: String.raw`$P\prime(x)=0\Rightarrow x=20$.`, solutionSteps: [String.raw`$P(x)=-x^2+40x-100$`, String.raw`$P\prime(x)=-2x+40$`, String.raw`$P\prime(x)=0\Rightarrow-2x+40=0$`, String.raw`$x=20$ produkter`], interpretation: 'Når den deriverte går fra positiv til negativ, går fortjenesten fra å øke til å avta.', reflection: 'Hvorfor må vi også sjekke om 20 produkter er realistisk?' },
      { title: 'Bremselengde', situation: 'En bil beveger seg med posisjon $s(t)=20t-2t^2$.', model: String.raw`$s\prime(t)=20-4t$`, task: 'Når står bilen stille?', answer: String.raw`$s\prime(t)=0\Rightarrow t=5$ sekunder.`, solutionSteps: [String.raw`$s(t)=20t-2t^2$`, String.raw`$s\prime(t)=20-4t$`, String.raw`$20-4t=0$`, String.raw`$t=5$ sekunder`], interpretation: 'Den deriverte er null når posisjonen ikke lenger endrer seg.', reflection: 'Hva forteller fortegnet til den deriverte etter 5 sekunder?' },
    ],
  },
  [Lk20Topic1T.TRIGONOMETRI]: {
    title: 'Finn høyden på et tre',
    situation: 'Du står 12 meter fra et tre og måler vinkelen opp til toppen til 35 grader. Øyehøyden kan sees bort fra.',
    model: String.raw`$\tan(35^\circ)=\frac{h}{12}$`,
    task: 'Hvor høyt er treet omtrent?',
    answer: String.raw`$h=12\cdot\tan(35^\circ)\approx8.4$ meter.`,
    solutionSteps: [String.raw`$\tan(35^\circ)=\frac{h}{12}$`, String.raw`$h=12\cdot\tan(35^\circ)$`, String.raw`$h\approx8.4$ meter`],
    interpretation: 'Vinkelen og den kjente avstanden gjør at tangens kobler bakken til høyden.',
    reflection: 'Hva kan gjøre målingen mindre nøyaktig i virkeligheten?',
    additionalExamples: [
      { title: 'Takvinkel', situation: 'Et tak har 6 meters horisontal avstand og 3 meters høydeforskjell.', model: String.raw`$\tan(v)=\frac{3}{6}$`, task: 'Hvilken vinkel har taket?', answer: String.raw`$v=\tan^{-1}(0.5)\approx26.6^\circ$.`, solutionSteps: [String.raw`$\tan(v)=\frac{3}{6}=0.5$`, String.raw`$v=\tan^{-1}(0.5)$`, String.raw`$v\approx26.6^\circ$`], interpretation: 'Invers tangens brukes når vi kjenner sideforholdet og skal finne vinkelen.', reflection: 'Hvordan påvirker en større høydeforskjell vinkelen?' },
      { title: 'Avstand mellom to punkter', situation: 'To punkter på hver sin side av en innsjø observeres fra et tredje punkt. Du kjenner to sider og vinkelen mellom dem.', model: String.raw`$c^2=a^2+b^2-2ab\cos C$`, task: 'Hvilken metode kan finne den ukjente avstanden?', answer: 'Cosinussetningen kan brukes fordi to sider og den inkluderte vinkelen er kjent.', solutionSteps: [String.raw`$c^2=a^2+b^2-2ab\cos C$`, 'Sett inn de to kjente sidene og den inkluderte vinkelen.', String.raw`$c=\sqrt{a^2+b^2-2ab\cos C}$`], interpretation: 'Cosinussetningen generaliserer Pytagoras til trekanter som ikke er rettvinklede.', reflection: 'Når ville sinussetningen vært et bedre valg?' },
    ],
  },
  [Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING]: {
    title: 'Sparing med rente',
    situation: 'Du setter 5000 kroner på en konto med 4 prosent årlig rente og lar pengene stå i 5 år.',
    model: String.raw`$S(n)=5000\cdot1.04^n$`,
    task: 'Hvor mye står på kontoen etter 5 år?',
    answer: String.raw`$S(5)=5000\cdot1.04^5\approx6083$ kroner.`,
    solutionSteps: [String.raw`$S(n)=5000\cdot1.04^n$`, String.raw`$S(5)=5000\cdot1.04^5$`, String.raw`$S(5)\approx6083$ kroner`],
    interpretation: 'Modellen antar samme rente hvert år og at renten blir stående på kontoen.',
    reflection: 'Hvilke forhold i virkeligheten kan gjøre resultatet annerledes?',
    additionalExamples: [
      { title: 'Strømforbruk', situation: 'Et hus bruker 18 kWh per døgn. Forbruket øker med 2 kWh for hver ekstra kald dag.', model: String.raw`$E(d)=18d+2d^2$`, task: 'Hvorfor kan en modell med både lineært og kvadratisk ledd være nyttig?', answer: 'Det lineære leddet beskriver grunnforbruket, mens det kvadratiske leddet kan beskrive at kuldeeffekten øker raskere.', solutionSteps: [String.raw`$E(d)=18d+2d^2$`, 'Det lineære leddet $18d$ beskriver grunnforbruket.', 'Det kvadratiske leddet $2d^2$ beskriver en økende kuldeeffekt.'], interpretation: 'En modell trenger ikke bare én type funksjon. Valget må passe til mekanismen i situasjonen.', reflection: 'Hvilke data ville du samlet for å kontrollere modellen?' },
      { title: 'Algoritme for gjentatt vekst', situation: 'Du vil beregne en verdi som øker med samme rente hvert år.', model: String.raw`$v\leftarrow v(1+r)$`, task: 'Hvilke trinn må en algoritme gjenta?', answer: 'Start med en verdi, gang med vekstfaktoren, øk telleren og gjenta til ønsket antall år.', solutionSteps: ['Start med startverdien $v$.', String.raw`Gang med vekstfaktoren: $v\leftarrow v(1+r)$.`, 'Gjenta operasjonen én gang per år.'], interpretation: 'En algoritme gjør modellen presis og kan testes på mange scenarier.', reflection: 'Hvordan kan du kontrollere at algoritmen gir samme svar som formelen?' },
    ],
  },
  [Lk20Topic1T.SANNSYNLIGHET]: {
    title: 'Trekk en premie fra en pose',
    situation: 'En pose inneholder 3 røde og 7 blå kuler. Du trekker én kule uten å se.',
    model: String.raw`$P(\text{rød})=\frac{3}{10}$`,
    task: 'Hva er sannsynligheten for å trekke en rød kule?',
    answer: String.raw`$P(\text{rød})=\frac{3}{10}=0.30=30\%$.`,
    solutionSteps: [String.raw`$3+7=10$ mulige kuler`, String.raw`$P(\text{rød})=\frac{\text{gunstige}}{\text{mulige}}=\frac{3}{10}$`, String.raw`$\frac{3}{10}=0.30=30\%$`],
    interpretation: 'Tre av de ti mulige kulene gir ønsket utfall.',
    reflection: 'Hvordan endres sannsynligheten hvis du legger til to røde kuler?',
    additionalExamples: [
      { title: 'Værmelding og betingelse', situation: 'Det regner 60 prosent av dagene med mørke skyer. Mørke skyer finnes på 40 prosent av alle dager.', model: String.raw`$P(\text{regn og skyer})=0.6\cdot0.4$`, task: 'Hva er sannsynligheten for både mørke skyer og regn?', answer: String.raw`$P=0.24=24\%$.`, solutionSteps: [String.raw`$P(\text{regn}\mid\text{skyer})=0.6$`, String.raw`$P(\text{skyer})=0.4$`, String.raw`$P(\text{regn og skyer})=0.6\cdot0.4=0.24=24\%$`], interpretation: 'Betinget sannsynlighet brukes fordi regnsannsynligheten gjelder når skyene allerede er kjent.', reflection: 'Hva måtte vært annerledes for hendelsene å være uavhengige?' },
      { title: 'To riktige svar', situation: 'En flervalgsprøve har 5 spørsmål med 4 svaralternativer. Du gjetter på alle.', model: String.raw`$P(X=2)={5\choose2}(0.25)^2(0.75)^3$`, task: 'Hvilken modell passer for nøyaktig to riktige svar?', answer: 'Binomisk sannsynlighet passer fordi hvert forsøk har to utfall, samme sannsynlighet og er uavhengig.', solutionSteps: [String.raw`$n=5,\quad k=2,\quad p=0.25$`, String.raw`$P(X=2)={5\choose2}(0.25)^2(0.75)^3$`, 'Kombinasjonsleddet velger hvilke to spørsmål som blir riktige.'], interpretation: 'Kombinatorikk teller hvilke to spørsmål som blir riktige, mens potensene beskriver sannsynlighetene.', reflection: 'Hva endres hvis noen svaralternativer er mer sannsynlige enn andre?' },
    ],
  },
};

const PracticalLessonView: React.FC<{ lesson: PracticalLesson }> = ({ lesson }) => {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);
  const examples = [lesson, ...lesson.additionalExamples];
  const activeExample = examples[activeExampleIndex];

  const selectExample = (exampleIndex: number) => {
    setActiveExampleIndex(exampleIndex);
    setIsAnswerRevealed(false);
  };

  return (
    <section className="rounded-2xl border border-orange-400/30 bg-orange-950/20 p-6 sm:p-8">
      <div className="flex items-start gap-3 mb-6">
        <div className="rounded-xl bg-orange-400/15 p-2.5 text-orange-300"><Lightbulb className="w-5 h-5" /></div>
        <div>
          <p className="text-xs uppercase tracking-widest text-orange-300 font-bold mb-1">Matematikk i praksis</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Flere måter å bruke kunnskapen på</h2>
          <p className="text-sm text-slate-300 mt-2">Arbeid med ulike situasjoner, og se hvordan valg av matematisk metode endrer seg.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6" aria-label="Praktiske eksempler">
        {examples.map((example, exampleIndex) => <button key={example.title} onClick={() => selectExample(exampleIndex)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${activeExampleIndex === exampleIndex ? 'bg-orange-600 text-white' : 'bg-slate-900/70 text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{exampleIndex + 1}. {example.title}</button>)}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">{activeExample.title}</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-slate-950/60 border border-orange-300/15 p-4"><p className="text-xs uppercase tracking-widest text-orange-300 font-bold mb-2">Situasjon</p><div className="text-sm text-slate-200 leading-relaxed"><MathView latex={activeExample.situation} /></div></div>
        <div className="rounded-xl bg-slate-950/60 border border-orange-300/15 p-4"><p className="text-xs uppercase tracking-widest text-orange-300 font-bold mb-2">Din oppgave</p><div className="text-sm text-slate-200 leading-relaxed"><MathView latex={activeExample.task} /></div></div>
        <div className="md:col-span-2 rounded-xl bg-slate-950/60 border border-orange-300/15 p-4 overflow-hidden"><p className="text-xs uppercase tracking-widest text-orange-300 font-bold mb-2">Modell</p><div className="practical-model-math text-base sm:text-lg"><MathView latex={activeExample.model} displayMode /></div></div>
      </div>
      {isAnswerRevealed ? (
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-400/25 p-4"><p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-3">Løsning steg for steg</p><ol className="space-y-3">{activeExample.solutionSteps.map((step, stepIndex) => <li key={step} className="flex gap-3 items-start"><span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-emerald-400/15 text-emerald-300 text-xs font-bold">{stepIndex + 1}</span><div className="min-w-0"><MathView latex={step} /></div></li>)}</ol><div className="border-t border-emerald-400/20 mt-4 pt-4"><p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-2">Svar</p><MathView latex={activeExample.answer} /></div><p className="text-slate-300 mt-3 leading-relaxed">{activeExample.interpretation}</p></div>
          <div className="rounded-xl bg-slate-950/50 border border-orange-300/15 p-4"><p className="text-xs uppercase tracking-widest text-orange-300 font-bold mb-2">Tenk videre</p><MathView latex={activeExample.reflection} /></div>
        </div>
      ) : (
        <button onClick={() => setIsAnswerRevealed(true)} className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2.5 text-white font-bold text-sm transition-colors">Vis løsning og tolkning</button>
      )}
    </section>
  );
};

const TriangleRatiosVisual: React.FC = () => (
  <div className="rounded-xl border border-sky-300/20 bg-slate-950/70 p-4 mb-5">
    <svg viewBox="0 0 520 230" className="w-full h-auto" role="img" aria-label="Rettvinklet trekant med hypotenus, hosliggende og motstående side markert">
      <polygon points="100,180 390,180 100,55" fill="#22d3ee" fillOpacity="0.08" stroke="#67e8f9" strokeWidth="3" />
      <path d="M100 160 L120 160 L120 180" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <path d="M130 180 A30 30 0 0 0 119 156" fill="none" stroke="#a78bfa" strokeWidth="3" />
      <text x="126" y="171" fill="#ddd6fe" fontSize="15" fontWeight="600">v</text>
      <text x="245" y="207" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="600">hosliggende side</text>
      <text x="267" y="105" textAnchor="middle" fill="#fb7185" fontSize="14" fontWeight="600" transform="rotate(-23 267 105)">hypotenus</text>
      <text x="414" y="76" fill="#94a3b8" fontSize="12">90°</text>
    </svg>
    <div className="grid sm:grid-cols-3 gap-2 text-center text-xs mt-2">
      <span className="text-emerald-300">Motstående: siden mot v</span>
      <span className="text-amber-300">Hosliggende: siden ved v</span>
      <span className="text-rose-300">Hypotenus: siden mot 90°</span>
    </div>
  </div>
);

const TriangleLawVisual: React.FC<{ law: 'sine' | 'cosine' | 'area' }> = ({ law }) => (
  <div className="rounded-xl border border-sky-300/20 bg-slate-950/70 p-4 mb-5">
    <svg viewBox="0 0 520 235" className="w-full h-auto" role="img" aria-label={law === 'sine' ? 'Trekant som viser side-vinkel-par i sinussetningen' : law === 'cosine' ? 'Trekant som viser to sider og inkludert vinkel i cosinussetningen' : 'Trekant som viser to sider og inkludert vinkel i arealsetningen'}>
      <polygon points="110,185 410,185 185,45" fill={law === 'area' ? '#fbbf24' : '#22d3ee'} fillOpacity="0.12" stroke="#67e8f9" strokeWidth="3" />
      <path d="M110 185 A34 34 0 0 0 137 169" fill="none" stroke="#a78bfa" strokeWidth="3" />
      <path d="M410 185 A28 28 0 0 0 391 166" fill="none" stroke="#a78bfa" strokeWidth="3" />
      <text x="128" y="173" fill="#ddd6fe" fontSize="14" fontWeight="600">A</text>
      <text x="389" y="174" fill="#ddd6fe" fontSize="14" fontWeight="600">B</text>
      <text x="180" y="48" fill="#ddd6fe" fontSize="14" fontWeight="600">C</text>
      <text x="260" y="210" textAnchor="middle" fill={law === 'cosine' ? '#fbbf24' : '#cbd5e1'} fontSize="15" fontWeight="600">c</text>
      <text x="145" y="112" textAnchor="middle" fill={law === 'sine' ? '#34d399' : law === 'area' ? '#fbbf24' : '#cbd5e1'} fontSize="15" fontWeight="600" transform="rotate(-32 145 112)">b</text>
      <text x="305" y="112" textAnchor="middle" fill={law === 'sine' ? '#34d399' : law === 'area' ? '#fbbf24' : '#cbd5e1'} fontSize="15" fontWeight="600" transform="rotate(32 305 112)">a</text>
      {law === 'sine' ? <text x="260" y="30" textAnchor="middle" fill="#34d399" fontSize="12">side og motstående vinkel hører sammen</text> : law === 'cosine' ? <text x="260" y="30" textAnchor="middle" fill="#fbbf24" fontSize="12">a, b og vinkelen C er kjent</text> : <text x="260" y="30" textAnchor="middle" fill="#fbbf24" fontSize="12">arealet er halvparten av grunnlinje · høyde</text>}
    </svg>
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-center text-xs text-slate-400">
      {law === 'sine' ? <><span className="text-emerald-300">a ligger mot A</span><span className="text-emerald-300">b ligger mot B</span><span>hold parene sammen</span></> : law === 'cosine' ? <><span className="text-amber-300">a og b er sidene</span><span className="text-amber-300">C er vinkelen mellom dem</span></> : <><span className="text-amber-300">a og b er sidene</span><span className="text-amber-300">C ligger mellom a og b</span></>}
    </div>
  </div>
);

interface InteractiveModuleProps {
  topic: Lk20Topic1T;
}

interface InteractiveGraphProps {
  mode: 'function' | 'derivative';
  primary: number;
  secondary: number;
  tertiary: number;
  input: number;
  functionType: FunctionType;
  fineGrid: boolean;
}

type FunctionType = 'linear' | 'quadratic' | 'power' | 'exponential';

const InteractiveGraph: React.FC<InteractiveGraphProps> = ({ mode, primary, secondary, tertiary, input, functionType, fineGrid }) => {
  const graphWidth = 420;
  const graphHeight = 250;
  const padding = 42;
  const xMin = -5;
  const xMax = 5;
  const valueAt = (value: number) => {
    if (mode === 'derivative') return secondary * value ** 2;
    if (functionType === 'quadratic') return primary * value ** 2 + secondary * value + tertiary;
    if (functionType === 'power') return secondary * Math.abs(value) ** Math.max(1, primary);
    if (functionType === 'exponential') return secondary * (1 + primary / 100) ** value;
    return primary * value + secondary;
  };
  const yLimit = Math.max(10, Math.ceil(Math.max(...Array.from({ length: 41 }, (_, index) => Math.abs(valueAt(xMin + index * 0.25)))) / 5) * 5);
  const yMin = -yLimit;
  const yMax = yLimit;
  const toGraphX = (value: number) => padding + ((value - xMin) / (xMax - xMin)) * (graphWidth - padding * 2);
  const toGraphY = (value: number) => graphHeight - padding - ((value - yMin) / (yMax - yMin)) * (graphHeight - padding * 2);
  const gridXValues = fineGrid ? [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5] : [-5, -2.5, 0, 2.5, 5];
  const gridYValues = Array.from({ length: fineGrid ? 11 : 5 }, (_, index) => -yLimit + (2 * yLimit * index) / (fineGrid ? 10 : 4));
  const axisYValues = [-yLimit, -yLimit / 2, 0, yLimit / 2, yLimit];
  const graphPoints = Array.from({ length: 41 }, (_, index) => {
    const xValue = xMin + index * 0.25;
    return `${toGraphX(xValue)},${toGraphY(valueAt(xValue))}`;
  }).join(' ');
  const selectedValue = valueAt(input);
  const tangentSlope = mode === 'derivative' ? 2 * secondary * input : primary;
  const tangentStart = selectedValue - tangentSlope * (input + 2);
  const tangentEnd = selectedValue + tangentSlope * (2 - input);

  return (
    <div className="rounded-xl border border-sky-300/25 bg-slate-950/80 p-3 mb-5">
      <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto" role="img" aria-label={mode === 'function' ? 'Interaktiv graf for valgt funksjonstype' : 'Interaktiv parabel med tangent'}>
        {gridXValues.map((tick) => <line key={`vertical-grid-${tick}`} x1={toGraphX(tick)} y1={padding} x2={toGraphX(tick)} y2={graphHeight - padding} stroke="#334155" strokeWidth="0.7" strokeOpacity="0.55" />)}
        {gridYValues.map((tick) => <line key={`horizontal-grid-${tick}`} x1={padding} y1={toGraphY(tick)} x2={graphWidth - padding} y2={toGraphY(tick)} stroke="#334155" strokeWidth="0.7" strokeOpacity="0.55" />)}
        <line x1={toGraphX(0)} y1={padding} x2={toGraphX(0)} y2={graphHeight - padding} stroke="#475569" strokeWidth="1" />
        <line x1={padding} y1={toGraphY(0)} x2={graphWidth - padding} y2={toGraphY(0)} stroke="#475569" strokeWidth="1" />
        {[-5, -2.5, 0, 2.5, 5].map((tick) => <g key={`x-${tick}`}><line x1={toGraphX(tick)} y1={toGraphY(0) - 4} x2={toGraphX(tick)} y2={toGraphY(0) + 4} stroke="#64748b" /><text x={toGraphX(tick)} y={toGraphY(0) + 17} textAnchor="middle" fill="#94a3b8" fontSize="9">{tick}</text></g>)}
        {axisYValues.map((tick) => <g key={`y-${tick}`}><line x1={toGraphX(0) - 4} y1={toGraphY(tick)} x2={toGraphX(0) + 4} y2={toGraphY(tick)} stroke="#64748b" /><text x={toGraphX(0) - 8} y={toGraphY(tick) + 3} textAnchor="end" fill="#94a3b8" fontSize="9">{tick}</text></g>)}
        <polyline points={graphPoints} fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {mode === 'derivative' && (
          <line x1={toGraphX(-2)} y1={toGraphY(tangentStart)} x2={toGraphX(2)} y2={toGraphY(tangentEnd)} stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" />
        )}
        <circle cx={toGraphX(input)} cy={toGraphY(selectedValue)} r="6" fill="#a78bfa" stroke="#f5f3ff" strokeWidth="2" />
        <text x={graphWidth - padding - 2} y={toGraphY(0) - 9} textAnchor="end" fill="#94a3b8" fontSize="11">x</text>
        <text x={toGraphX(0) + 8} y={padding + 10} fill="#94a3b8" fontSize="11">y</text>
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-300" /> graf</span>
        {mode === 'derivative' && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t-2 border-dashed border-amber-300" /> tangent</span>}
        <span className="text-violet-200">punkt ({input}, {selectedValue.toFixed(1)})</span>
      </div>
    </div>
  );
};

interface InteractiveVisualProps {
  topic: Lk20Topic1T;
  primary: number;
  secondary: number;
  tertiary: number;
  fourth: number;
  functionType: FunctionType;
  fineGrid: boolean;
}

const InteractiveVisual: React.FC<InteractiveVisualProps> = ({ topic, primary, secondary, tertiary, fourth, functionType, fineGrid }) => {
  const width = 360;
  const height = 180;

  if (topic === Lk20Topic1T.FUNKSJONER || topic === Lk20Topic1T.DERIVASJON_OG_VEKSTFART) {
    return <InteractiveGraph mode={topic === Lk20Topic1T.FUNKSJONER ? 'function' : 'derivative'} primary={primary} secondary={secondary} tertiary={tertiary} input={topic === Lk20Topic1T.FUNKSJONER ? (functionType === 'quadratic' ? fourth : tertiary) : primary} functionType={functionType} fineGrid={fineGrid} />;
  }

  if (topic === Lk20Topic1T.LIGNINGER_OG_ULIKHETER) {
    const solution = (tertiary - secondary) / primary;
    const toNumberLineX = (value: number) => 24 + ((value + 10) / 20) * (width - 48);
    return (
      <div className="rounded-xl border border-sky-300/25 bg-slate-950/80 p-3 mb-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Tallinje som viser løsningen på ligningen">
          <line x1="24" y1="90" x2={width - 24} y2="90" stroke="#94a3b8" strokeWidth="2" />
          {[-10, -5, 0, 5, 10].map((tick) => <g key={tick}><line x1={toNumberLineX(tick)} y1="82" x2={toNumberLineX(tick)} y2="98" stroke="#94a3b8" /><text x={toNumberLineX(tick)} y="118" textAnchor="middle" fill="#94a3b8" fontSize="11">{tick}</text></g>)}
          <circle cx={toNumberLineX(solution)} cy="90" r="8" fill="#a78bfa" stroke="#f5f3ff" strokeWidth="2" />
          <text x={toNumberLineX(solution)} y="55" textAnchor="middle" fill="#ddd6fe" fontSize="12">x = {solution.toFixed(2)}</text>
        </svg>
        <p className="text-center text-xs text-slate-400">Løsningen er punktet der balansen blir sann.</p>
      </div>
    );
  }

  if (topic === Lk20Topic1T.TRIGONOMETRI) {
    const angleRadians = (primary * Math.PI) / 180;
    const triangleBase = 120 * Math.cos(angleRadians);
    const triangleHeight = 120 * Math.sin(angleRadians);
    const triangleLeft = 55;
    const triangleBottom = 145;
    return (
      <div className="rounded-xl border border-sky-300/25 bg-slate-950/80 p-3 mb-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Interaktiv rettvinklet trekant som viser sinus">
          <polygon points={`${triangleLeft},${triangleBottom} ${triangleLeft + triangleBase},${triangleBottom} ${triangleLeft},${triangleBottom - triangleHeight}`} fill="#22d3ee" fillOpacity="0.12" stroke="#67e8f9" strokeWidth="3" />
          <text x={triangleLeft + triangleBase / 2} y={triangleBottom + 18} textAnchor="middle" fill="#cbd5e1" fontSize="11">hosliggende</text>
          <text x={triangleLeft + 8} y={triangleBottom - triangleHeight / 2} textAnchor="start" fill="#cbd5e1" fontSize="10">motstående</text>
            <text x={triangleLeft + 12} y={triangleBottom - 10} textAnchor="start" fill="#ddd6fe" fontSize="12">{primary}°</text>
        </svg>
        <div className="flex flex-col items-center gap-1 text-center text-xs text-slate-400"><span>sin(v) = motstående / hypotenus</span><span>Vinkelen endrer sideforholdet</span></div>
      </div>
    );
  }

  if (topic === Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING) {
    const growthValues = Array.from({ length: 11 }, (_, period) => primary * (1 + secondary / 100) ** period);
    const maximum = Math.max(...growthValues, 1);
    const toGrowthX = (period: number) => 30 + (period / 10) * (width - 55);
    const toGrowthY = (value: number) => height - 28 - (value / maximum) * (height - 58);
    const growthPoints = growthValues.map((value, period) => `${toGrowthX(period)},${toGrowthY(value)}`).join(' ');
    const growthGridPeriods = fineGrid ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [0, 2, 4, 6, 8, 10];
    const growthGridFractions = fineGrid ? [0.2, 0.4, 0.6, 0.8, 1] : [0.25, 0.5, 0.75, 1];
    return (
      <div className="rounded-xl border border-sky-300/25 bg-slate-950/80 p-3 mb-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Vekstkurve for en eksponentialmodell">
          {growthGridPeriods.map((period) => <line key={`growth-grid-x-${period}`} x1={toGrowthX(period)} y1="12" x2={toGrowthX(period)} y2={height - 28} stroke="#334155" strokeWidth="0.7" strokeOpacity="0.55" />)}
          {growthGridFractions.map((fraction) => <line key={`growth-grid-y-${fraction}`} x1="30" y1={toGrowthY(maximum * fraction)} x2={width - 20} y2={toGrowthY(maximum * fraction)} stroke="#334155" strokeWidth="0.7" strokeOpacity="0.55" />)}
          <line x1="30" y1="12" x2="30" y2={height - 28} stroke="#475569" />
          <line x1="30" y1={height - 28} x2={width - 20} y2={height - 28} stroke="#475569" />
          {[0, 5, 10].map((period) => <g key={`period-${period}`}><line x1={toGrowthX(period)} y1={height - 32} x2={toGrowthX(period)} y2={height - 24} stroke="#64748b" /><text x={toGrowthX(period)} y={height - 10} textAnchor="middle" fill="#94a3b8" fontSize="9">{period}</text></g>)}
          <text x="36" y="18" fill="#94a3b8" fontSize="9">{maximum.toFixed(0)}</text>
          <text x="36" y={height - 32} fill="#94a3b8" fontSize="9">0</text>
          <polyline points={growthPoints} fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={toGrowthX(tertiary)} cy={toGrowthY(growthValues[tertiary])} r="6" fill="#a78bfa" stroke="#f5f3ff" strokeWidth="2" />
          <text x={width - 22} y={height - 10} fill="#94a3b8" fontSize="11">tid</text>
          <text x="36" y="30" fill="#94a3b8" fontSize="11">verdi</text>
        </svg>
        <p className="text-center text-xs text-slate-400">Kurven viser hvordan en liten prosentvis endring bygger seg opp over tid.</p>
      </div>
    );
  }

  if (topic === Lk20Topic1T.SANNSYNLIGHET) {
    const possibleOutcomes = Math.max(secondary, 1);
    const favorableOutcomes = Math.min(primary, possibleOutcomes);
    return (
      <div className="rounded-xl border border-sky-300/25 bg-slate-950/80 p-3 mb-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Stolpediagram for gunstige og mulige utfall">
          <line x1="45" y1="20" x2="45" y2={height - 30} stroke="#475569" />
          <line x1="45" y1={height - 30} x2={width - 20} y2={height - 30} stroke="#475569" />
          {[0, 5, 10].map((tick) => <g key={`probability-y-${tick}`}><line x1="41" y1={height - 30 - tick * 10} x2="49" y2={height - 30 - tick * 10} stroke="#64748b" /><text x="36" y={height - 27 - tick * 10} textAnchor="end" fill="#94a3b8" fontSize="9">{tick}</text></g>)}
          <rect x="90" y={height - 30 - favorableOutcomes * 10} width="75" height={favorableOutcomes * 10} rx="5" fill="#a78bfa" />
          <rect x="210" y={height - 30 - possibleOutcomes * 10} width="75" height={possibleOutcomes * 10} rx="5" fill="#67e8f9" fillOpacity="0.7" />
          <text x="127" y={height - 36 - favorableOutcomes * 10} textAnchor="middle" fill="#ddd6fe" fontSize="11">{favorableOutcomes}</text>
          <text x="247" y={height - 36 - possibleOutcomes * 10} textAnchor="middle" fill="#cffafe" fontSize="11">{possibleOutcomes}</text>
          <text x="127" y={height - 10} textAnchor="middle" fill="#cbd5e1" fontSize="11">gunstige</text>
          <text x="247" y={height - 10} textAnchor="middle" fill="#cbd5e1" fontSize="11">mulige</text>
        </svg>
        <p className="text-center text-xs text-slate-400">Sannsynlighet sammenligner gunstige utfall med hele utfallsrommet.</p>
      </div>
    );
  }

  const algebraValues = Array.from({ length: 41 }, (_, pointIndex) => {
    const xValue = -5 + pointIndex * 0.25;
    return (xValue + primary) * (xValue + secondary);
  });
  const algebraYLimit = Math.max(10, Math.ceil(Math.max(...algebraValues.map(Math.abs)) / 5) * 5);
  const algebraGridX = fineGrid ? [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5] : [-5, -2.5, 0, 2.5, 5];
  const algebraGridY = Array.from({ length: fineGrid ? 11 : 5 }, (_, index) => -algebraYLimit + (2 * algebraYLimit * index) / (fineGrid ? 10 : 4));
  const algebraAxisYValues = [-algebraYLimit, -algebraYLimit / 2, 0, algebraYLimit / 2, algebraYLimit];
  const algebraPoints = Array.from({ length: 41 }, (_, pointIndex) => {
    const xValue = -5 + pointIndex * 0.25;
    const yValue = (xValue + primary) * (xValue + secondary);
    const graphX = 28 + ((xValue + 5) / 10) * (width - 56);
    const graphY = height - 24 - ((yValue + algebraYLimit) / (2 * algebraYLimit)) * (height - 48);
    return `${graphX},${graphY}`;
  }).join(' ');
  return (
    <div className="rounded-xl border border-sky-300/25 bg-slate-950/80 p-3 mb-5">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Graf for det faktoriserte andregradsuttrykket">
        {algebraGridX.map((tick) => <line key={`algebra-grid-x-${tick}`} x1={28 + ((tick + 5) / 10) * (width - 56)} y1="12" x2={28 + ((tick + 5) / 10) * (width - 56)} y2={height - 24} stroke="#334155" strokeWidth="0.7" strokeOpacity="0.55" />)}
        {algebraGridY.map((tick) => <line key={`algebra-grid-y-${tick}`} x1="28" y1={height - 24 - ((tick + algebraYLimit) / (2 * algebraYLimit)) * (height - 48)} x2={width - 20} y2={height - 24 - ((tick + algebraYLimit) / (2 * algebraYLimit)) * (height - 48)} stroke="#334155" strokeWidth="0.7" strokeOpacity="0.55" />)}
        <line x1="28" y1="12" x2="28" y2={height - 24} stroke="#475569" />
        <line x1="28" y1={height / 2} x2={width - 20} y2={height / 2} stroke="#475569" />
        {[-5, -2.5, 0, 2.5, 5].map((tick) => <g key={`algebra-x-${tick}`}><line x1={28 + ((tick + 5) / 10) * (width - 56)} y1={height / 2 - 4} x2={28 + ((tick + 5) / 10) * (width - 56)} y2={height / 2 + 4} stroke="#64748b" /><text x={28 + ((tick + 5) / 10) * (width - 56)} y={height / 2 + 17} textAnchor="middle" fill="#94a3b8" fontSize="9">{tick}</text></g>)}
        {algebraAxisYValues.map((tick) => <text key={`algebra-y-${tick}`} x="21" y={height - 24 - ((tick + algebraYLimit) / (2 * algebraYLimit)) * (height - 48) + 3} textAnchor="end" fill="#94a3b8" fontSize="9">{tick}</text>)}
        <polyline points={algebraPoints} fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <text x={width - 24} y={height / 2 - 7} fill="#94a3b8" fontSize="11">x</text>
        <text x="35" y="18" fill="#94a3b8" fontSize="11">y</text>
      </svg>
      <p className="text-center text-xs text-slate-400">Nullpunktene flytter seg når faktorene endres.</p>
    </div>
  );
};

const InteractiveModule: React.FC<InteractiveModuleProps> = ({ topic }) => {
  const [primary, setPrimary] = useState(2);
  const [secondary, setSecondary] = useState(3);
  const [tertiary, setTertiary] = useState(5);
  const [fourth, setFourth] = useState(3);
  const [functionType, setFunctionType] = useState<FunctionType>('linear');
  const [fineGrid, setFineGrid] = useState(false);

  interface InteractiveConfiguration {
    title: string;
    description: string;
    labels: [string, string, string, string];
    ranges: [[number, number], [number, number], [number, number], [number, number]];
    formula: string;
    insight: string;
  }

  const configurations: Record<Lk20Topic1T, InteractiveConfiguration> = {
    [Lk20Topic1T.TALL_OG_ALGEBRA]: {
      title: 'Se hvordan faktorer bygger et uttrykk',
      description: 'Dra i faktorene. Målet er å oppdage hvor x-leddet og konstantleddet kommer fra.',
      labels: ['Første faktor', 'Andre faktor', 'Ikke brukt', 'Ikke brukt'],
      ranges: [[-5, 5], [-5, 5], [0, 0], [0, 0]],
      formula: `(x ${primary < 0 ? '-' : '+'} ${Math.abs(primary)})(x ${secondary < 0 ? '-' : '+'} ${Math.abs(secondary)}) = x^2 ${primary + secondary < 0 ? '-' : '+'} ${Math.abs(primary + secondary)}x ${primary * secondary < 0 ? '-' : '+'} ${Math.abs(primary * secondary)}`,
      insight: 'x-leddet er summen av faktorene. Konstantleddet er produktet av dem.',
    },
    [Lk20Topic1T.LIGNINGER_OG_ULIKHETER]: {
      title: 'Flytt ledd uten å miste balansen',
      description: 'Endre tallene og se hvordan løsningen endrer seg når samme operasjon gjøres på begge sider.',
      labels: ['Koeffisient a', 'Konstant b', 'Høyre side c', 'Ikke brukt'],
      ranges: [[1, 6], [-8, 8], [-8, 20], [0, 0]],
      formula: `${primary}x ${secondary < 0 ? '-' : '+'} ${Math.abs(secondary)} = ${tertiary} \\quad\\Rightarrow\\quad x = ${((tertiary - secondary) / primary).toFixed(2)}`,
      insight: 'Trekk først fra konstantleddet på begge sider. Del deretter på koeffisienten.',
    },
    [Lk20Topic1T.FUNKSJONER]: {
      title: 'Formen på grafen følger parameterne',
      description: 'Endre stigningstall og startverdi. Se hvordan samme regel gir en ny funksjon.',
      labels: ['Stigningstall a', 'Startverdi b', 'Input x', 'Ikke brukt'],
      ranges: [[-5, 5], [-8, 8], [-4, 4], [0, 0]],
      formula: `f(x) = ${primary}x ${secondary < 0 ? '-' : '+'} ${Math.abs(secondary)}, \\quad f(${tertiary}) = ${primary * tertiary + secondary}`,
      insight: 'a bestemmer hvor raskt grafen stiger eller synker. b er skjæringen med y-aksen.',
    },
    [Lk20Topic1T.DERIVASJON_OG_VEKSTFART]: {
      title: 'Kjenn igjen stigningen akkurat nå',
      description: 'For f(x)=x² kan du flytte punktet og se hvordan tangentens stigning endrer seg.',
      labels: ['Punkt x', 'Skalerer grafen', 'Ikke brukt', 'Ikke brukt'],
      ranges: [[-5, 5], [1, 3], [0, 0], [0, 0]],
      formula: `f(x) = ${secondary}x^2, \\quad f\\prime(${primary}) = ${2 * secondary * primary}`,
      insight: 'Den deriverte er tangentens stigningstall. Den forteller hvor raskt grafen endrer seg i punktet.',
    },
    [Lk20Topic1T.TRIGONOMETRI]: {
      title: 'Se sinusforholdet i en trekant',
      description: 'Velg vinkel og hypotenus. Den motstående siden følger direkte av sinus.',
      labels: ['Vinkel i grader', 'Hypotenus', 'Ikke brukt', 'Ikke brukt'],
      ranges: [[10, 80], [2, 20], [0, 0], [0, 0]],
      formula: `\\sin(${primary}^\\circ) = \\frac{x}{${secondary}} \\quad\\Rightarrow\\quad x = ${(secondary * Math.sin((primary * Math.PI) / 180)).toFixed(2)}`,
      insight: 'Sinus kobler vinkelen til forholdet mellom motstående side og hypotenusen.',
    },
    [Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING]: {
      title: 'Bygg en vekstmodell',
      description: 'Velg startverdi, vekst og antall perioder. Modellen viser hva antakelsene dine betyr.',
      labels: ['Startverdi', 'Vekst i prosent', 'Perioder', 'Ikke brukt'],
      ranges: [[1, 100], [0, 20], [1, 10], [0, 0]],
      formula: `verdi = ${primary} \\cdot ${(1 + secondary / 100).toFixed(2)}^{${tertiary}} = ${(primary * (1 + secondary / 100) ** tertiary).toFixed(2)}`,
      insight: 'Et modellresultat må alltid tolkes med enhet, antakelser og et realistisk gyldighetsområde.',
    },
    [Lk20Topic1T.SANNSYNLIGHET]: {
      title: 'Tell gunstige utfall',
      description: 'Endre antall gunstige og mulige utfall. Sannsynligheten blir synlig som en brøk og prosent.',
      labels: ['Gunstige utfall', 'Mulige utfall', 'Ikke brukt', 'Ikke brukt'],
      ranges: [[1, 10], [2, 10], [0, 0], [0, 0]],
      formula: `P(A) = \\frac{${Math.min(primary, secondary)}}{${secondary}} = ${((Math.min(primary, secondary) / secondary) * 100).toFixed(0)}\\%`,
      insight: 'Definer først hva som teller som gunstig og hva som er hele utfallsrommet.',
    },
  };

  const functionConfigurations: Record<FunctionType, Partial<InteractiveConfiguration>> = {
    linear: {
      title: 'Se hvordan en rett linje bygges',
      description: 'Endre stigningstall, startverdi og input. Se hvordan samme regel gir en ny rett linje.',
      labels: ['Stigningstall a', 'Startverdi b', 'Input x', 'Ikke brukt'],
      ranges: [[-5, 5], [-8, 8], [-4, 4], [0, 0]],
      formula: `f(x) = ${primary}x ${secondary < 0 ? '-' : '+'} ${Math.abs(secondary)}, \\quad f(${tertiary}) = ${primary * tertiary + secondary}`,
      insight: 'a bestemmer hvor raskt grafen stiger eller synker. b er skjæringen med y-aksen.',
    },
    quadratic: {
      title: 'Se hvordan alle ledd former en parabel',
      description: 'Juster a, b, c og input x. Nå ser du hvordan hvert ledd i ax²+bx+c påvirker grafen.',
      labels: ['Koeffisient a', 'Koeffisient b', 'Konstantledd c', 'Input x'],
      ranges: [[-3, 3], [-8, 8], [-8, 8], [-4, 4]],
      formula: `f(x) = ${primary}x^2 ${secondary < 0 ? '-' : '+'} ${Math.abs(secondary)}x ${tertiary < 0 ? '-' : '+'} ${Math.abs(tertiary)}, \\quad f(${fourth}) = ${primary * fourth ** 2 + secondary * fourth + tertiary}`,
      insight: 'a bestemmer retningen og bredden, b påvirker symmetrilinjen, og c er skjæringen med y-aksen.',
    },
    power: {
      title: 'Utforsk hvordan eksponenten former grafen',
      description: 'Endre eksponent, faktor og input. Sammenlign hvordan ulike potenser vokser.',
      labels: ['Eksponent n', 'Faktor a', 'Input x', 'Ikke brukt'],
      ranges: [[1, 5], [-5, 5], [0, 4], [0, 0]],
      formula: `f(x) = ${secondary}x^{${primary}}, \\quad f(${tertiary}) = ${secondary * tertiary ** primary}`,
      insight: 'Potensfunksjoner endrer form når eksponenten endres. Her utforsker du x ≥ 0.',
    },
    exponential: {
      title: 'Se forskjellen på lineær og prosentvis vekst',
      description: 'Endre vekstprosent, startverdi og tid. Den samme prosentvise endringen gjentas for hver periode.',
      labels: ['Vekst i prosent', 'Startverdi a', 'Tid x', 'Ikke brukt'],
      ranges: [[-5, 20], [1, 8], [0, 5], [0, 0]],
      formula: `f(x) = ${secondary} \\cdot ${(1 + primary / 100).toFixed(2)}^x, \\quad f(${tertiary}) = ${(secondary * (1 + primary / 100) ** tertiary).toFixed(2)}`,
      insight: 'Den samme prosentvise endringen gjentas for hver x-enhet. Det gir en kurve, ikke en rett linje.',
    },
  };
  const configuration = topic === Lk20Topic1T.FUNKSJONER
    ? { ...configurations[topic], ...functionConfigurations[functionType] }
    : configurations[topic];
  const values = [primary, secondary, tertiary, fourth];
  const setters = [setPrimary, setSecondary, setTertiary, setFourth];
  const getSliderTicks = (range: [number, number]) => {
    const [minimum, maximum] = range;
    return Array.from({ length: 5 }, (_, index) => Math.round(minimum + ((maximum - minimum) * index) / 4))
      .filter((tick, index, ticks) => ticks.indexOf(tick) === index);
  };

  return (
    <section className="rounded-2xl border border-violet-400/30 bg-violet-950/20 p-6 sm:p-8 mb-8 shadow-lg shadow-violet-950/20">
      <div className="flex items-start gap-3 mb-6">
        <div className="rounded-xl bg-violet-400/15 p-2.5 text-violet-300"><SlidersHorizontal className="w-5 h-5" /></div>
        <div>
          <p className="text-xs uppercase tracking-widest text-violet-300 font-bold mb-1">Utforsk selv</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white">{configuration.title}</h2>
          <p className="text-sm text-slate-300 mt-2">{configuration.description}</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6 items-center">
        <div className="space-y-5">
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input type="checkbox" checked={fineGrid} onChange={(event) => setFineGrid(event.target.checked)} className="h-4 w-4 accent-violet-400" />
            Finmasket rutenett
          </label>
          {topic === Lk20Topic1T.FUNKSJONER && (
            <label className="block text-sm text-slate-200">
              Funksjonstype
              <select value={functionType} onChange={(event) => {
                const nextFunctionType = event.target.value as FunctionType;
                setFunctionType(nextFunctionType);
                if (nextFunctionType === 'power') setTertiary(Math.min(tertiary, 4));
                if (nextFunctionType === 'exponential') setTertiary(Math.min(tertiary, 5));
              }} className="block w-full rounded-lg border border-violet-300/30 bg-slate-900 px-3 py-2 mt-2 text-slate-100">
                <option value="linear">Lineær</option>
                <option value="quadratic">Andregrad</option>
                <option value="power">Potens</option>
                <option value="exponential">Eksponential</option>
              </select>
            </label>
          )}
          {configuration.labels.map((label, index) => (
            <label key={`${label}-${index}`} className={`block text-sm ${configuration.ranges[index][0] === configuration.ranges[index][1] ? 'hidden' : 'text-slate-200'}`}>
              {label}: <span className="font-bold text-violet-200">{values[index]}</span>
              <input aria-label={label} list={`ticks-${index}`} type="range" min={configuration.ranges[index][0]} max={configuration.ranges[index][1]} step="1" value={values[index]} onChange={(event) => setters[index](Number(event.target.value))} className="w-full accent-violet-400 mt-2" />
              <datalist id={`ticks-${index}`}>
                {getSliderTicks(configuration.ranges[index]).map((tick) => <option key={tick} value={tick} />)}
              </datalist>
              <span className="flex justify-between text-[10px] text-slate-500 mt-1" aria-hidden="true">
                {getSliderTicks(configuration.ranges[index]).map((tick) => <span key={tick}>{tick}</span>)}
              </span>
            </label>
          ))}
        </div>
        <div className="rounded-xl border border-violet-300/30 bg-slate-950/70 p-5 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Hva skjer?</p>
          <InteractiveVisual topic={topic} primary={primary} secondary={secondary} tertiary={tertiary} fourth={fourth} functionType={functionType} fineGrid={fineGrid} />
          <div className="text-lg sm:text-2xl font-bold text-violet-100 break-words"><MathView latex={configuration.formula} displayMode={true} /></div>
          <p className="text-xs text-slate-400 mt-4">{configuration.insight}</p>
        </div>
      </div>
    </section>
  );
};

const lectures: Record<Lk20Topic1T, LectureContent> = {
  [Lk20Topic1T.TALL_OG_ALGEBRA]: {
    eyebrow: 'Byggesteinene i matematikk',
    summary: 'Algebra handler om å beskrive mønstre med symboler. Målet er å kunne lese, omforme og kontrollere uttrykk uten å miste meningen.',
    learningGoals: ['bruke potenser, røtter og standardform', 'utvikle og faktorisere algebraiske uttrykk', 'forenkle rasjonale uttrykk med riktige begrensninger', 'forklare og kontrollere algebraiske omskrivinger'],
    checkpoint: { question: 'Hva blir $x^2-16$ faktorisert?', answer: '$(x-4)(x+4)$', explanation: 'Dette er en differanse mellom to kvadrater: $a^2-b^2=(a-b)(a+b)$.', },
    sections: [
      { title: 'Potens betyr gjentatt multiplikasjon', explanation: 'Eksponenten forteller hvor mange ganger grunntallet ganges med seg selv.', formula: String.raw`$a^n = \underbrace{a \cdot a \cdot \ldots \cdot a}_{n\text{ faktorer}}$`, breakdown: ['a er grunntallet.', 'n er eksponenten.', String.raw`Ved multiplikasjon med samme grunntall legges eksponentene sammen: $a^m \cdot a^n = a^{m+n}$.`] },
      { title: 'Røtter og negative eksponenter', explanation: 'En rot er den omvendte operasjonen til en potens. Negative eksponenter betyr at du tar den omvendte verdien.', formula: String.raw`$\sqrt[n]{a}=a^{1/n}, \qquad a^{-n}=\frac{1}{a^n}$`, breakdown: ['Kvadratroten av $25$ er tallet som gir $25$ når det kvadreres.', 'Skriv om til positiv eksponent før du regner videre.', 'Nevneren kan aldri være null.'] },
      { title: 'Standardform gjør store tall lesbare', explanation: 'I standardform skriver du et tall som et tall mellom 1 og 10 ganget med en tierpotens.', formula: String.raw`$450\,000 = 4.5\cdot10^5, \qquad 0.0045=4.5\cdot10^{-3}$`, breakdown: ['Flytt kommaet til etter første siffer som ikke er null.', 'Antall hopp bestemmer eksponenten.', 'Positiv eksponent betyr stort tall; negativ eksponent betyr lite tall.'] },
      { title: 'Kvadratsetningene pakker ut produkter', explanation: 'Kvadratsetningene lar deg gå begge veier: utvikle et produkt eller faktorisere et uttrykk.', formula: String.raw`$(a+b)^2=a^2+2ab+b^2, \qquad (a-b)^2=a^2-2ab+b^2$`, breakdown: ['Midtleddet kommer fra de to kryssproduktene.', 'Konjugatsetningen er $a^2-b^2=(a-b)(a+b)$.', 'Skriv mellomregningen når fortegn kan bli uklare.'] },
      { title: 'Faktorisering viser strukturen', explanation: 'Å faktorisere er å skrive et uttrykk som et produkt. Da blir nullpunkter og forenkling synlige.', formula: '$x^2 - 9 = (x - 3)(x + 3)$', breakdown: ['Se etter felles faktor først.', 'Bruk konjugatsetningen når du ser $a^2-b^2$.', 'Gang tilbake for å kontrollere svaret.'] },
      { title: 'Rasjonale uttrykk har skjulte begrensninger', explanation: 'Du kan forkorte faktorer i en brøk, men du må beholde verdiene som var ulovlige i originaluttrykket.', formula: String.raw`$\frac{x^2-4}{x-2}=\frac{(x-2)(x+2)}{x-2}=x+2, \qquad x\ne2$`, breakdown: ['Faktoriser teller og nevner før du forkorter.', 'Nevneren i originalen bestemmer definisjonsmengden.', 'Kontroller at du ikke har fjernet en viktig begrensning.'] },
      { title: 'Polynomdivisjon kobler uttrykk og funksjoner', explanation: 'Polynomdivisjon brukes til å omskrive rasjonale funksjoner, finne asymptoter og kontrollere om et polynom har en faktor.', formula: String.raw`$\frac{x^2+3x+2}{x+1}=x+2$`, breakdown: ['Del høyeste grad først.', 'Multipliser tilbake og trekk fra.', 'Resten viser hva som eventuelt står igjen i brøken.'] },
    ],
    focus: ['Regnerekkefølge, fortegn og definisjonsmengde', 'Forskjellen mellom å utvikle og faktorisere', 'Å kontrollere ved å sette inn en enkel verdi', 'Å kunne forklare hvorfor en omskriving er lovlig'],
    nextStep: 'Når du kan forklare hvorfor et uttrykk er likt etter omforming, er du klar for oppgaver.',
  },
  [Lk20Topic1T.LIGNINGER_OG_ULIKHETER]: {
    eyebrow: 'Finn den ukjente',
    summary: 'En ligning er en balanse. Du løser den ved å gjøre det samme på begge sider helt til den ukjente står alene.',
    learningGoals: ['løse lineære ligninger og likningssystemer', 'bruke abc-formelen og tolke diskriminanten', 'løse ulikheter med fortegnsskjema', 'kontrollere løsninger og definisjonsmengde'],
    checkpoint: { question: 'Hvilken regel må du huske når du deler en ulikhet på et negativt tall?', answer: 'Ulikhetstegnet må snus.', explanation: 'Tallinjen speilvendes når du deler på et negativt tall, derfor endres retningen.', },
    sections: [
      { title: 'Ligningen er en balanse', explanation: 'Likhetstegnet betyr at venstre og høyre side har samme verdi. Hver operasjon må derfor gjøres på begge sider.', formula: String.raw`$2x + 3 = 11 \quad\Rightarrow\quad 2x = 8 \quad\Rightarrow\quad x = 4$`, breakdown: ['Fjern $+3$ med $-3$.', 'Fjern faktoren $2$ med divisjon på $2$.', 'Sett $x=4$ tilbake og sjekk at begge sider blir $11$.'] },
      { title: 'Brøk- og parentesligninger', explanation: 'Fjern først fellesnevnere og parenteser på en kontrollert måte. Da blir ligningen til en vanlig lineær ligning.', formula: String.raw`$\frac{x+1}{3}-2=4 \quad\Rightarrow\quad x+1=18 \quad\Rightarrow\quad x=17$`, breakdown: ['Multipliser alle ledd med nevneren, ikke bare ett ledd.', 'Bruk distribusjonsregelen på parenteser.', 'Sjekk løsningen i den opprinnelige ligningen.'] },
      { title: 'Andregradsligninger og abc-formelen', explanation: 'En andregradsligning kan ha to, én eller ingen reelle løsninger. Diskriminanten forteller hvilken situasjon du er i.', formula: String.raw`$ax^2+bx+c=0 \quad\Rightarrow\quad x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$`, breakdown: ['$a$, $b$ og $c$ må leses med riktig fortegn.', 'Hvis $b^2-4ac>0$ får du to reelle løsninger.', 'Sett begge løsningene tilbake, eller faktoriser som kontroll.'] },
      { title: 'Ulikheter snur ved negativ multiplikasjon', explanation: 'Når tallinjen speilvendes ved å gange eller dele på et negativt tall, snur retningen på ulikhetstegnet.', formula: String.raw`$-2x > 6 \quad\Rightarrow\quad x < -3$`, breakdown: ['Del på $-2$.', 'Snu $>$ til $<$.', 'Tenk på løsningen som et område på tallinjen, ikke bare ett tall.'] },
      { title: 'Fortegnsskjema samler mange intervaller', explanation: 'For produkt og brøkuttrykk må du undersøke fortegnet i hvert intervall mellom nullpunkter og ulovlige verdier.', formula: String.raw`$(x-2)(x+1)>0 \quad\Rightarrow\quad x<-1\;\text{eller}\;x>2$`, breakdown: ['Finn hvor hver faktor er null.', 'Marker kritiske punkter på tallinjen.', 'Test ett tall i hvert intervall og ta bare med riktige intervaller.'] },
      { title: 'Likningssystem finner et felles punkt', explanation: 'To likninger med to ukjente beskriver ofte to linjer. Løsningen er punktet som tilfredsstiller begge samtidig.', formula: String.raw`$\begin{cases}y=2x+1\\y=-x+7\end{cases}\quad\Rightarrow\quad 2x+1=-x+7$`, breakdown: ['Sett uttrykkene for samme variabel lik hverandre.', 'Finn x og sett verdien tilbake for å finne y.', 'Sjekk punktet i begge likningene.'] },
    ],
    focus: ['Gjør én ryddig operasjon om gangen', 'Velg metode etter ligningstype', 'Snu ulikhetstegnet ved negativ deling', 'Sjekk alltid løsning og definisjonsmengde'],
    nextStep: 'Forstå balansen først. Hurtige regler uten balansebildet skaper lett fortegnsfeil senere.',
  },
  [Lk20Topic1T.FUNKSJONER]: {
    eyebrow: 'Regel mellom input og output',
    summary: 'En funksjon tar inn en verdi og gir ut én bestemt verdi. Du trener på å se sammenhengen mellom formel, graf og situasjon.',
    learningGoals: ['tolke input, output, nullpunkt og skjæring', 'beskrive lineære, polynom-, potens- og eksponentialfunksjoner', 'finne og tolke topp- og bunnpunkter', 'velge realistisk definisjonsmengde i en modell'],
    checkpoint: { question: 'Hva forteller stigningstallet i $f(x)=3x+5$?', answer: 'Grafen øker med 3 når x øker med 1.', explanation: 'Tallet foran x er endringen i y per x-enhet. 5 er startverdien på y-aksen.', },
    sections: [
      { title: 'Input blir til output', explanation: 'I $f(x)$ er $x$ inputverdien. Funksjonsregelen forteller nøyaktig hvordan output beregnes.', formula: String.raw`$f(x)=2x+1 \quad\Rightarrow\quad f(3)=2\cdot3+1=7$`, breakdown: ['$x=3$ er verdien du putter inn.', '$f(3)=7$ er verdien du får ut.', 'Grafen viser alle slike par $(x,f(x))$.'] },
      { title: 'Lineære funksjoner har fast vekst', explanation: 'I en lineær funksjon er $a$ stigningstallet og $b$ startverdien. Den samme endringen skjer for hvert steg bortover.', formula: String.raw`$f(x)=ax+b, \qquad a=\frac{\Delta y}{\Delta x}$`, breakdown: ['Positiv $a$ gir en stigende graf.', 'Skjæringen med y-aksen er $(0,b)$.', 'Finn $a$ fra to punkter med endring i høyde delt på endring bortover.'] },
      { title: 'Andregradsfunksjonen bøyer seg', explanation: 'Andregradsfunksjoner har en parabel. Topp- eller bunnpunktet forteller hvor funksjonen skifter fra å øke til å avta, eller motsatt.', formula: String.raw`$f(x)=ax^2+bx+c, \qquad x_{topp/bunn}=-\frac{b}{2a}$`, breakdown: ['$a>0$ gir et bunnpunkt; $a<0$ gir et toppunkt.', 'Nullpunktene finnes ved å løse $f(x)=0$.', 'Symmetrilinjen går gjennom topp- eller bunnpunktet.'] },
      { title: 'Nullpunktet er der grafen treffer aksen', explanation: 'Et nullpunkt er en x-verdi som gir output lik null. Derfor finner du det ved å løse $f(x)=0$.', formula: String.raw`$f(x)=x-4 \quad\Rightarrow\quad f(x)=0 \quad\Rightarrow\quad x=4$`, breakdown: ['Sett funksjonsverdien lik null.', 'Løs ligningen.', 'Les punktet som $(4,0)$ i koordinatsystemet.'] },
      { title: 'Eksponentialfunksjoner beskriver prosentvis vekst', explanation: 'Når noe vokser med samme prosent hver periode, bruker du en eksponentialfunksjon. Vekstfaktoren er viktigere enn selve prosenttallet.', formula: String.raw`$f(x)=a\cdot b^x, \qquad b=1+r$`, breakdown: ['$a$ er startverdien.', '$r$ er vekstraten som desimaltall.', 'Ved nedgang er $b=1-r$.'] },
      { title: 'Modell, definisjonsmengde og tolkning', explanation: 'En funksjon er først nyttig når du vet hva x og y betyr, og hvilke verdier som gir mening i situasjonen.', formula: String.raw`$\text{verdi}=\text{startverdi}\cdot\text{vekstfaktor}^{\text{antall perioder}}$`, breakdown: ['Skriv enheter i svaret.', 'Begrens x til realistiske verdier.', 'Skill mellom matematisk svar og hva modellen faktisk kan brukes til.'] },
    ],
    focus: ['Skillet mellom x-verdi og funksjonsverdi', 'Stigningstall, konstantledd og vekstfaktor', 'Sammenhengen mellom formel, tabell og graf', 'Hva grafen betyr i den virkelige situasjonen'],
    nextStep: 'En god funksjonsforståelse gjør at du kan bytte representasjon uten å miste oversikten.',
  },
  [Lk20Topic1T.DERIVASJON_OG_VEKSTFART]: {
    eyebrow: 'Mål endring akkurat nå',
    summary: 'Derivasjon måler hvor raskt en funksjon endrer seg. Tenk på det som stigningstallet til grafen i ett bestemt punkt.',
    learningGoals: ['skille mellom gjennomsnittlig og momentan vekstfart', 'bruke potensregelen ledd for ledd', 'lage tangent og finne kritiske punkter', 'tolke den deriverte med riktige enheter'],
    checkpoint: { question: String.raw`Hva betyr det at $f\prime(3)=0$?`, answer: String.raw`Grafen har horisontal tangent når $x=3$.`, explanation: 'Den deriverte er tangentens stigningstall. Stigningstall 0 betyr at tangenten er vannrett.', },
    sections: [
      { title: 'Gjennomsnittlig vekstfart', explanation: 'Mellom to punkter måler vi hvor mye y endrer seg per x-enhet. Det er stigningstallet til sekanten.', formula: String.raw`$\frac{f(b)-f(a)}{b-a}$`, breakdown: ['$f(b)-f(a)$ er endringen i høyde.', '$b-a$ er endringen bortover.', 'Resultatet sier hvor mye grafen vokser i gjennomsnitt.'] },
      { title: 'Den deriverte i et punkt', explanation: 'Når de to punktene nærmer seg hverandre, blir sekanten til tangenten. Den deriverte er den øyeblikkelige vekstfarten.', formula: String.raw`$f\prime(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}$`, breakdown: ['$h$ er en liten endring i x.', 'Grenseverdien gjør endringen infinitesimalt liten.', String.raw`For $f(x)=x^2$ blir $f\prime(x)=2x$.`] },
      { title: 'Potensregelen og ledd for ledd', explanation: 'Deriver hvert ledd separat. Potensen flyttes ned som faktor, og eksponenten reduseres med én.', formula: String.raw`$\frac{d}{dx}(x^n)=n\cdot x^{n-1}, \qquad (x^3-4x+7)'=3x^2-4$`, breakdown: ['Konstanten $7$ blir $0$.', 'Derivert av $-4x$ er $-4$.', 'Behold fortegn og koeffisienter gjennom hele regningen.'] },
      { title: 'Tangentlinjen bruker punkt og stigning', explanation: 'Den deriverte gir stigningstallet i punktet. Deretter bruker du en rett linje gjennom punktet for å lage tangenten.', formula: String.raw`$y-f(a)=f\prime(a)(x-a)$`, breakdown: ['Finn $f(a)$ for punktets y-verdi.', 'Finn $f\prime(a)$ for tangentens stigning.', 'Sett begge inn før du forenkler linjen.'] },
      { title: 'Voksende, avtakende og ekstremalpunkt', explanation: 'Fortegnet til den deriverte forteller om grafen går opp eller ned. Ved et topp- eller bunnpunkt skifter fortegnet ofte.', formula: String.raw`$f\prime(x)>0\Rightarrow f\text{ vokser}, \qquad f\prime(x)<0\Rightarrow f\text{ avtar}$`, breakdown: ['Finn kritiske punkt ved å løse $f\prime(x)=0$.', 'Lag fortegnsskjema for $f\prime$.', 'Bruk fortegnsskiftet til å skille topp fra bunn.'] },
      { title: 'Derivasjon i praktiske modeller', explanation: 'I en modell kan den deriverte bety fart, marginal kostnad eller hvor raskt en mengde endrer seg.', formula: String.raw`$s(t)\text{ posisjon}, \qquad s\prime(t)\text{ fart}, \qquad s\prime\prime(t)\text{ akselerasjon}$`, breakdown: ['Tolk enheten til den deriverte.', 'Sjekk om x-verdien er innenfor modellens område.', 'Et regnet ekstremalpunkt må alltid forklares med ord.'] },
    ],
    focus: ['Forskjellen mellom sekant og tangent', 'Potensregelen og derivasjon ledd for ledd', 'Fortegnet: positiv betyr voksende, negativ betyr avtakende', 'Derivert som stigningstall og endringsrate med enhet'],
    nextStep: 'Når du kan forklare hva stigningstallet betyr i situasjonen, bruker du derivasjon med forståelse.',
  },
  [Lk20Topic1T.TRIGONOMETRI]: {
    eyebrow: 'Mål ukjente sider og vinkler',
    summary: 'Trigonometri kobler vinkler og sidelengder. Du lærer først forholdene i rettvinklede trekanter, og deretter metoder for alle trekanter.',
    learningGoals: ['velge sinus, cosinus eller tangens i rettvinklede trekanter', 'bruke Pytagoras og invers trigonometri', 'bruke sinus- og cosinussetningen', 'beregne areal og vurdere mulige trekantløsninger'],
    checkpoint: { question: String.raw`Når passer arealsetningen $A=\frac12ab\sin C$?`, answer: 'Når du kjenner to sider og vinkelen mellom dem.', explanation: String.raw`Vinkelen må være inkludert mellom sidene $a$ og $b$; ellers må du velge en annen metode.`, },
    sections: [
      { title: 'Vinkelmål og rettvinklet trekant', explanation: 'I en rettvinklet trekant er hypotenusen alltid siden mot den rette vinkelen. De to andre sidene vurderes ut fra vinkelen du arbeider med.', formula: String.raw`$\sin v=\frac{\text{motstående}}{\text{hypotenus}},\quad \cos v=\frac{\text{hosliggende}}{\text{hypotenus}},\quad \tan v=\frac{\text{motstående}}{\text{hosliggende}}$`, breakdown: ['Marker vinkelen før du velger forhold.', 'Sjekk at kalkulatoren står i grader når oppgaven bruker grader.', 'Bruk invers funksjon for å finne vinkelen.'] },
      { title: 'Pytagoras og rettvinklede problemer', explanation: 'Pytagoras finner en ukjent side når trekanten er rettvinklet. Trigonometri bruker i tillegg en kjent vinkel.', formula: String.raw`$a^2+b^2=c^2,\qquad c=\sqrt{a^2+b^2}$`, breakdown: ['Hypotenusen er alltid $c$ i standardnotasjonen.', 'Bruk Pytagoras når ingen vinkel trengs.', 'Rund av til slutt og vurder om svaret er rimelig.'] },
      { title: 'Sinussetningen gjelder alle trekanter', explanation: 'Når du kjenner en side og den motstående vinkelen, kan sinussetningen koble dette paret til et annet side-vinkel-par.', formula: String.raw`$\frac{a}{\sin A}=\frac{b}{\sin B}=\frac{c}{\sin C}$`, breakdown: ['Side $a$ ligger mot vinkel $A$.', 'Hold alltid side og motstående vinkel sammen.', 'Vær oppmerksom på at enkelte oppgaver kan ha to mulige trekanter.'] },
      { title: 'Cosinussetningen finner manglende sider og vinkler', explanation: 'Cosinussetningen er en utvidelse av Pytagoras for vilkårlige trekanter.', formula: String.raw`$c^2=a^2+b^2-2ab\cos C$`, breakdown: ['Bruk den når du kjenner to sider og den inkluderte vinkelen.', 'For å finne vinkelen må du isolere cosinus.', 'Når $C=90^\circ$, blir formelen Pytagoras.'] },
      { title: 'Arealsetningen finner trekantareal', explanation: 'Når du kjenner to sider og vinkelen mellom dem, kan du finne arealet direkte.', formula: String.raw`$A=\frac12 ab\sin C$`, breakdown: ['Vinkelen $C$ må ligge mellom sidene $a$ og $b$.', 'Arealet får kvadrerte lengdeenheter.', 'Sammenlign med grunnlinje ganger høyde som kontroll.'] },
    ],
    focus: ['Velg riktig forhold ut fra figuren', 'Koble alltid side til motstående vinkel', 'Kalkulator i riktig vinkelmodus og rimelig avrunding', 'Kunne begrunne hvorfor metoden gjelder'],
    nextStep: 'Tegn figuren og merk alle kjente størrelser før du trykker på kalkulatoren. Det er ofte selve problemløsingen.',
  },
  [Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING]: {
    eyebrow: 'Bruk matematikk på ukjente problemer',
    summary: '1T handler også om å bygge modeller, velge strategi, bruke digitale verktøy og argumentere for at resultatet gir mening.',
    learningGoals: ['formulere en situasjon med variable og antakelser', 'velge og begrunne problemløsingsstrategi', 'lage og teste en algoritme eller modell', 'argumentere, bevise og vurdere modellens begrensninger'],
    checkpoint: { question: 'Hva må du gjøre etter at du har fått et matematisk modellresultat?', answer: 'Tolke resultatet og vurdere om modellen er gyldig i situasjonen.', explanation: 'Et tall er ikke automatisk et godt svar. Enheter, antakelser, avrunding og gyldighetsområde må vurderes.', },
    sections: [
      { title: 'Fra situasjon til matematisk modell', explanation: 'En modell oversetter virkeligheten til variable, antakelser og formler. En god modell er enkel nok til å bruke, men presis nok til å svare på spørsmålet.', formula: String.raw`$\text{situasjon}\;\to\;\text{variable}\;\to\;\text{modell}\;\to\;\text{resultat}\;\to\;\text{vurdering}$`, breakdown: ['Definer hva variablene betyr og hvilke enheter de har.', 'Skriv ned antakelser før du regner.', 'Avslutt med å tolke og begrense resultatet.'] },
      { title: 'Problemløsingsstrategier', explanation: 'Når oppgaven er ny, bryter du den ned. Prøv å tegne, lage tabell, finne mønster, arbeide baklengs eller teste et enklere tilfelle.', formula: String.raw`$\text{forstå}\;\to\;\text{planlegg}\;\to\;\text{gjennomfør}\;\to\;\text{kontroller}$`, breakdown: ['Skriv hva du vet og hva du skal finne.', 'Velg strategi og forklar hvorfor den passer.', 'Kontroller både regning, enhet og svar i kontekst.'] },
      { title: 'Algoritmisk tenkning og programmering', explanation: 'Programmering i matematikk handler om å lage en presis, gjentakbar metode. Variabler, løkker, vilkår og funksjoner gjør mønstre testbare.', formula: String.raw`$\text{input}\;\to\;\text{algoritme}\;\to\;\text{output}$`, code: `def vekstverdi(start, rente, år):\n    verdi = start\n    for _ in range(år):\n        verdi = verdi * (1 + rente)\n    return verdi`, breakdown: ['Bryt problemet i små trinn.', 'Test med en verdi du kan kontrollere for hånd.', 'Bruk grafer eller tabeller til å undersøke resultatet, ikke bare produsere det.'] },
      { title: 'Bevis og argumentasjon', explanation: 'Et eksempel kan vise at noe fungerer én gang, men et bevis forklarer hvorfor det alltid fungerer innenfor vilkårene.', formula: String.raw`$(a+b)^2=a^2+2ab+b^2\quad\text{fordi}\quad(a+b)(a+b)=a^2+ab+ab+b^2$`, breakdown: ['Start med en kjent definisjon eller regel.', 'Vis hvert logiske steg uten hopp.', 'Skill mellom eksempel, formodning og bevis.'] },
      { title: 'Digitale verktøy og kritisk vurdering', explanation: 'CAS, grafverktøy og programmer kan utforske og kontrollere, men de erstatter ikke forklaringen av hva resultatet betyr.', formula: String.raw`$\text{modellresultat}\ne\text{virkelighet uten vurdering}$`, breakdown: ['Bruk verktøyet til å finne mønster eller kontrollere algebra.', 'Presenter fremgangsmåten slik at andre kan følge den.', 'Vurder avrunding, feilkilder, gyldighetsområde og modellens begrensninger.'] },
    ],
    focus: ['Forklare strategien, ikke bare svaret', 'Definere variable og antakelser', 'Teste og kontrollere med digitale verktøy', 'Skille mellom eksempel, argument og bevis', 'Tolke om svaret faktisk gir mening'],
    nextStep: 'På eksamen teller det også hvordan du tenker og kommuniserer. Skriv derfor alltid hva du gjør, hvorfor du gjør det, og hva svaret betyr.',
  },
  [Lk20Topic1T.SANNSYNLIGHET]: {
    eyebrow: 'Tell mulige utfall systematisk',
    summary: 'Sannsynlighet beskriver hvor ofte en hendelse forventes å skje. Du må først definere utfallsrommet og hendelsen presist.',
    learningGoals: ['definere utfallsrom og hendelser presist', 'bruke mengder, valgtrær og kombinatorikk', 'skille mellom og, eller og ikke', 'bruke betinget sannsynlighet og uavhengighet'],
    checkpoint: { question: String.raw`Hva er forskjellen på $A\cap B$ og $A\cup B$?`, answer: String.raw`$A\cap B$ betyr A og B samtidig, mens $A\cup B$ betyr A eller B eller begge.`, explanation: 'Tegn gjerne et Venn-diagram: snittet er overlappen, unionen er alt som ligger i minst én mengde.', },
    sections: [
      { title: 'Grunnsannsynlighet', explanation: 'Når alle utfall er like sannsynlige, teller du gunstige utfall og deler på alle mulige utfall.', formula: String.raw`$P(A)=\frac{\text{gunstige utfall}}{\text{mulige utfall}}$`, breakdown: ['Hendelsen $A$ må være tydelig definert.', 'Sannsynligheten ligger alltid mellom $0$ og $1$.', String.raw`Komplementet er $P(ikke\ A)=1-P(A)$.`] },
      { title: 'Mengder: og, eller og ikke', explanation: 'Mengdediagram gjør det synlig hvilke utfall som overlapper. Presise ord hindrer at du teller samme utfall to ganger.', formula: String.raw`$P(A\cup B)=P(A)+P(B)-P(A\cap B)$`, breakdown: [String.raw`$A\cap B$ betyr A og B samtidig.`, String.raw`$A\cup B$ betyr A eller B eller begge.`, 'Trekk fra overlappen én gang når du legger sammen to mengder.'] },
      { title: 'Kombinatorikk teller valg uten å liste alt', explanation: 'Når flere valg skjer etter hverandre, kan du bruke multiplikasjonsprinsippet. Når rekkefølge ikke betyr noe, bruker du kombinasjoner.', formula: String.raw`$n\cdot m\text{ valg i to trinn}, \qquad {n\choose k}=\frac{n!}{k!(n-k)!}$`, breakdown: ['Gang antall valg i hvert trinn.', 'Bruk $n!$ som produktet $n\cdot(n-1)\cdot\ldots\cdot1$.', 'Spør alltid om rekkefølge betyr noe før du velger metode.'] },
      { title: 'Valgtre og produktregelen', explanation: 'Et valgtre viser alle veier gjennom et forsøk. Langs én vei multipliserer du; mellom alternative veier summerer du.', formula: String.raw`$P(A\text{ og }B)=P(A)\cdot P(B\mid A)$`, breakdown: ['Skriv sannsynligheten på hver gren.', 'Multipliser langs en gren.', 'Summer grenene som gir ønsket hendelse.'] },
      { title: 'Betinget sannsynlighet', explanation: 'Når du vet at noe allerede har skjedd, blir utfallsrommet mindre. Da spør du: hvor sannsynlig er A når B er kjent?', formula: String.raw`$P(A\mid B)=\frac{P(A\cap B)}{P(B)}$`, breakdown: [String.raw`$A\cap B$ betyr at både A og B skjer.`, '$P(B)$ er den nye informasjonen du deler på.', 'Bruk tre, tabell eller mengdediagram for å holde oversikten.'] },
      { title: 'Uavhengighet og binomiske forsøk', explanation: 'To hendelser er uavhengige når informasjon om den ene ikke endrer sannsynligheten for den andre. Binomiske forsøk gjentar samme ja/nei-forsøk.', formula: String.raw`$P(A\cap B)=P(A)P(B), \qquad P(X=k)={n\choose k}p^k(1-p)^{n-k}$`, breakdown: ['Samme sannsynlighet $p$ må gjelde i hvert forsøk.', 'Forsøkene må være uavhengige.', 'Kontroller at $k$ er mellom $0$ og $n$.'] },
    ],
    focus: ['Hva som faktisk teller som ett utfall', 'Forskjellen på og, eller og ikke', 'Når du skal gange, summere eller bruke kombinasjoner', 'Å bruke informasjonen i en betingelse riktig'],
    nextStep: 'Presis telling kommer før formelen. Tegn et valgtre når rekkefølgen eller flere steg gjør problemet uklart.',
  },
};

export const LectureView: React.FC<LectureViewProps> = ({ topic, onBack, onStartPractice }) => {
  const lecture = lectures[topic];
  const topicCurriculum = getCurriculumTopic(topic);
  const topicVideos = topicCurriculum.goals.flatMap((g) =>
    (g.videoResources ?? []).map((v) => ({ ...v, goalId: g.id, goalTitle: g.title }))
  );
  const [activeVideo, setActiveVideo] = useState<{ video: VideoResource; goalTitle: string; goalId: string } | null>(null);
  const [isCheckpointRevealed, setIsCheckpointRevealed] = useState(false);
  const [revealedMemoryTips, setRevealedMemoryTips] = useState<Record<string, boolean>>({});
  const [activeLesson, setActiveLesson] = useState(1);
  const conceptLessonCount = Math.ceil(lecture.sections.length / 2);
  const lessonCount = conceptLessonCount + 1;
  const lessonStartIndex = (activeLesson - 1) * 2;
  const isPracticalLesson = activeLesson === lessonCount;
  const lessonNames = [
    ...Array.from({ length: conceptLessonCount }, (_, index) => lecture.sections[index * 2].title),
    'Praktisk anvendelse',
  ];
  const lessonTitle = lessonNames[activeLesson - 1];

  const goToLesson = (lessonNumber: number) => {
    setActiveLesson(lessonNumber);
    setIsCheckpointRevealed(false);
    setRevealedMemoryTips({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-16 w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <button onClick={onBack} className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs sm:text-sm">
          <ArrowLeft className="w-4 h-4" /> Til alle moduler
        </button>
        <span className="text-[11px] sm:text-xs uppercase tracking-widest text-indigo-300 font-bold truncate">Leksjon {activeLesson} av {lessonCount} · {lessonTitle}</span>
      </div>

      <header className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-5 sm:p-10 mb-6 sm:mb-8 shadow-2xl">
        <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full border-[32px] border-indigo-500/10 rotate-12 pointer-events-none" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-300 text-xs sm:text-sm font-semibold mb-3 sm:mb-4"><Sparkles className="w-4 h-4" /> {lecture.eyebrow}</div>
          <h1 className="text-2xl sm:text-5xl font-black tracking-tight text-white mb-3 sm:mb-4">{Lk20TopicNames[topic]}</h1>
          <p className="text-sm sm:text-lg text-slate-300 leading-relaxed">{lecture.summary}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-sky-400/30 bg-sky-950/20 p-4 sm:p-6 mb-6 sm:mb-8">
        <p className="text-[11px] sm:text-xs uppercase tracking-widest text-sky-300 font-bold mb-3">Etter denne leksjonen skal du kunne</p>
        <div className="grid sm:grid-cols-2 gap-3">{lecture.learningGoals.map((goal) => <div key={goal} className="flex gap-3 text-xs sm:text-sm text-sky-100/90"><CheckCircle2 className="w-4 h-4 flex-none text-sky-300 mt-0.5" />{goal}</div>)}</div>
      </section>

      <section className="rounded-2xl border border-indigo-400/30 bg-indigo-950/20 p-4 sm:p-6 mb-6 sm:mb-8">
        <p className="text-[11px] sm:text-xs uppercase tracking-widest text-indigo-300 font-bold mb-2">Slik går du videre</p>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Denne modulen består av {lessonCount} korte leksjoner. Bruk leksjonsstegene under til å bygge forståelse, og avslutt med en praktisk anvendelse før du tester deg med oppgaver.</p>
      </section>

      <nav aria-label="Leksjoner i modulen" className="rounded-2xl border border-slate-700 bg-slate-900/70 p-2 sm:p-3 mb-6 sm:mb-8 overflow-x-auto">
        <div className="flex flex-nowrap sm:flex-wrap gap-2 min-w-max sm:min-w-0">
          {Array.from({ length: lessonCount }, (_, index) => {
            const lessonNumber = index + 1;
            return <button key={lessonNumber} onClick={() => goToLesson(lessonNumber)} aria-current={activeLesson === lessonNumber ? 'step' : undefined} className={`rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors shrink-0 ${activeLesson === lessonNumber ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Leksjon {lessonNumber}: {lessonNames[index]}</button>;
          })}
        </div>
      </nav>

      {activeLesson === 1 && <InteractiveModule topic={topic} />}

      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        <main className="space-y-6">
          {!isPracticalLesson && <details open className="group rounded-2xl border border-indigo-400/30 bg-indigo-950/10">
            <summary className="cursor-pointer list-none p-5 sm:p-6 text-lg sm:text-xl font-bold text-white marker:hidden">
              <span className="mr-3 text-indigo-300 group-open:rotate-90 inline-block transition-transform">›</span>
              Teori og begreper
              <span className="ml-3 text-xs font-normal text-slate-400">Forklaring, formel og huskeregel</span>
            </summary>
            <div className="space-y-6 border-t border-indigo-400/20 p-4 sm:p-6">
              {lecture.sections.slice(lessonStartIndex, lessonStartIndex + 2).map((section, index) => (
                <section key={section.title} className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-6 sm:p-8">
                  <div className="flex gap-4 mb-5"><span className="flex-none w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 flex items-center justify-center font-bold">{lessonStartIndex + index + 1}</span><div><h2 className="text-xl sm:text-2xl font-bold text-white">{section.title}</h2><div className="text-slate-300 leading-relaxed mt-2"><MathView latex={section.explanation} /></div></div></div>
                  {topic === Lk20Topic1T.TRIGONOMETRI && section.title === 'Vinkelmål og rettvinklet trekant' && <TriangleRatiosVisual />}
                  {topic === Lk20Topic1T.TRIGONOMETRI && section.title === 'Sinussetningen gjelder alle trekanter' && <TriangleLawVisual law="sine" />}
                  {topic === Lk20Topic1T.TRIGONOMETRI && section.title === 'Cosinussetningen finner manglende sider og vinkler' && <TriangleLawVisual law="cosine" />}
                  {topic === Lk20Topic1T.TRIGONOMETRI && section.title === 'Arealsetningen finner trekantareal' && <TriangleLawVisual law="area" />}
                  <div className="rounded-xl bg-slate-950 border border-indigo-400/20 px-4 py-3 mb-5 overflow-x-auto"><MathView latex={section.formula} displayMode /></div>
                  {section.code && <pre className="rounded-xl bg-slate-950 border border-sky-400/20 px-4 py-4 mb-5 overflow-x-auto text-sm leading-relaxed text-sky-200"><code>{section.code}</code></pre>}
                  <ul className="space-y-3 text-sm text-slate-300">{section.breakdown.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="w-4 h-4 flex-none text-emerald-400 mt-0.5" /><MathView latex={item} /></li>)}</ul>
                  <div className="mt-6 rounded-xl border border-amber-400/25 bg-amber-950/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-widest text-amber-300 font-bold">Hent frem fra hukommelsen</p>
                      <button onClick={() => setRevealedMemoryTips((current) => ({ ...current, [section.title]: !current[section.title] }))} className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-400/20">{revealedMemoryTips[section.title] ? 'Skjul huskeregel' : 'Vis huskeregel'}</button>
                    </div>
                    {revealedMemoryTips[section.title] ? <p className="text-sm text-amber-100 mt-3 leading-relaxed">{getMemoryTip(section.title)}</p> : <p className="text-sm text-slate-400 mt-3">Prøv å si regelen med egne ord før du viser huskeregelen.</p>}
                  </div>
                </section>
              ))}
            </div>
          </details>}
          {!isPracticalLesson && activeLesson === conceptLessonCount && <section className="rounded-2xl border border-emerald-400/30 bg-emerald-950/20 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-3">Prøv selv før du går videre</p>
            <h2 className="text-xl font-bold text-white mb-4"><MathView latex={lecture.checkpoint.question} /></h2>
            {isCheckpointRevealed ? (
              <div className="space-y-2 text-sm text-emerald-100/90"><div className="rounded-xl bg-emerald-950/50 border border-emerald-400/30 p-4"><MathView latex={lecture.checkpoint.answer} /></div><p><MathView latex={lecture.checkpoint.explanation} /></p></div>
            ) : <button onClick={() => setIsCheckpointRevealed(true)} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-white font-bold text-sm transition-colors">Vis fasit og forklaring</button>}
          </section>}
          {isPracticalLesson && <PracticalLessonView lesson={practicalLessons[topic]} />}
          <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-5">
            <button onClick={() => goToLesson(Math.max(1, activeLesson - 1))} disabled={activeLesson === 1} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="mr-2 inline-block h-4 w-4" />Forrige leksjon</button>
            <span className="text-xs text-slate-500">{activeLesson} av {lessonCount}</span>
            <button onClick={() => goToLesson(Math.min(lessonCount, activeLesson + 1))} disabled={activeLesson === lessonCount} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40">Neste leksjon<ArrowRight className="ml-2 inline-block h-4 w-4" /></button>
          </div>
        </main>

        <aside className="lg:sticky lg:top-6 space-y-5">
          {topicVideos.length > 0 && (
            <section className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5">
              <div className="flex gap-2 items-center text-rose-300 font-bold mb-3">
                <PlayCircle className="w-5 h-5 text-rose-400" />
                <span>Videoforklaringer ({topicVideos.length})</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Anbefalte videoer for temaet fra Lektor Thue, UDL og Lektor Dahl:
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {topicVideos.map((vid, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveVideo({ video: vid, goalTitle: vid.goalTitle, goalId: vid.goalId })}
                    className="w-full text-left p-2.5 rounded-xl border border-rose-900/50 bg-slate-900/80 hover:bg-rose-950/40 hover:border-rose-700/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{vid.goalId}</span>
                      <span className="text-[10px] font-medium text-rose-300 bg-rose-950/60 border border-rose-900/60 px-1.5 py-0.5 rounded shrink-0">{vid.channel}</span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-200 group-hover:text-white flex items-center justify-between gap-1">
                      <span className="line-clamp-1">{vid.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-rose-300 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-amber-400/30 bg-amber-950/20 p-5"><div className="flex gap-2 items-center text-amber-300 font-bold mb-3"><Lightbulb className="w-5 h-5" /> Dette må sitte</div><ul className="space-y-3 text-sm text-amber-100/80">{lecture.focus.map((item) => <li key={item} className="flex gap-2"><span className="text-amber-300">•</span>{item}</li>)}</ul></section>
          <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5"><p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Ta med videre</p><p className="text-sm text-slate-300 leading-relaxed">{lecture.nextStep}</p></section>
          <button onClick={onStartPractice} className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-white font-bold transition-colors shadow-lg shadow-indigo-950/50"><PlayCircle className="w-5 h-5" /> Test forståelsen</button>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500"><ArrowRight className="w-3 h-3" /> Oppgaver med veiledende hint</div>
        </aside>
      </div>

      <VideoModal
        isOpen={activeVideo !== null}
        onClose={() => setActiveVideo(null)}
        video={activeVideo?.video ?? null}
        goalTitle={activeVideo?.goalTitle}
        goalId={activeVideo?.goalId}
      />
    </div>
  );
};