import { TaskRepositoryPort } from '../../application/ports/TaskRepositoryPort.js';
import { CreateTaskProps, Task } from '../../domain/model/task/Task.js';
import { Title } from '../../domain/model/task/value-objects/Title.js';
import { LatexDescription } from '../../domain/model/task/value-objects/LatexDescription.js';
import { Difficulty, DifficultyLevel } from '../../domain/model/task/value-objects/Difficulty.js';
import { Lk20Category, Lk20Topic1T } from '../../domain/model/task/value-objects/Lk20Category.js';
import { SolutionStep } from '../../domain/model/task/value-objects/SolutionStep.js';
import { TaskId } from '../../domain/model/task/value-objects/TaskId.js';
import { Result } from '../../domain/shared/Result.js';

function unwrap<T>(result: Result<T, any>): T {
  if (result.isSuccess) {
    return result.value;
  }
  throw new Error(`unwrap failed: ${JSON.stringify((result as any).error)}`);
}

export class InMemoryTaskRepository implements TaskRepositoryPort {
  private tasks: Task[] = [];

  constructor() {
    this.seedTasks();
  }

  public async getById(id: string): Promise<Task | null> {
    return this.tasks.find((t) => t.id.value === id) ?? null;
  }

  public async getByTopic(topic: Lk20Topic1T, difficulty?: DifficultyLevel): Promise<Task[]> {
    let filtered = this.tasks.filter((t) => t.category.mainTopic === topic);
    if (difficulty) {
      filtered = filtered.filter((t) => t.difficulty.level === difficulty);
    }
    return filtered;
  }

  public async getAll(): Promise<Task[]> {
    return [...this.tasks];
  }

  private seedTasks(): void {
    const addTask = (props: CreateTaskProps): void => {
      this.tasks.push(unwrap(Task.create(props)));
    };

    // 1. Algebra: Kvadratsetninger & Faktorisering
    this.tasks.push(
      unwrap(
        Task.create({
          id: unwrap(TaskId.create('task-alg-1')),
          title: unwrap(Title.create('Faktorisering av andregradsuttrykk')),
          description: unwrap(
            LatexDescription.create(
              'Faktoriser uttrykket $x^2 - 9$ ved hjelp av konjugatsetningen.'
            )
          ),
          difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
          category: unwrap(
            Lk20Category.create(Lk20Topic1T.TALL_OG_ALGEBRA, 'Faktorisering')
          ),
          solutionSteps: [
            unwrap(
              SolutionStep.create(
                1,
                'Gjenkjenn konjugatsetningen',
                'Bruk tredje kvadratsetning: $a^2 - b^2 = (a-b)(a+b)$.',
                'a^2 - b^2 = (a-b)(a+b)'
              )
            ),
            unwrap(
              SolutionStep.create(
                2,
                'Sett inn verdiene',
                'Her er $a = x$ og $b = 3$, siden $3^2 = 9$.',
                '(x - 3)(x + 3)'
              )
            ),
          ],
          correctAnswer: { type: 'expression', latex: '(x - 3)(x + 3)' },
        })
      )
    );

    this.tasks.push(
      unwrap(
        Task.create({
          id: unwrap(TaskId.create('task-alg-2')),
          title: unwrap(Title.create('Forenkling av rasjonale uttrykk')),
          description: unwrap(
            LatexDescription.create(
              'Forenkbrøken $\\frac{x^2 - 4}{x - 2}$ for $x \\neq 2$.'
            )
          ),
          difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
          category: unwrap(
            Lk20Category.create(Lk20Topic1T.TALL_OG_ALGEBRA, 'Rasjonale uttrykk')
          ),
          solutionSteps: [
            unwrap(
              SolutionStep.create(
                1,
                'Faktoriser teller',
                'Bruk konjugatsetningen i telleren: $x^2 - 4 = (x-2)(x+2)$.',
                '\\frac{(x-2)(x+2)}{x-2}'
              )
            ),
            unwrap(
              SolutionStep.create(
                2,
                'Forkort felles faktor',
                'Forkort den felles faktoren $(x-2)$ i teller og nevner.',
                'x + 2'
              )
            ),
          ],
          correctAnswer: { type: 'expression', latex: 'x + 2' },
        })
      )
    );

    // Extra algebra: polynomdivisjon
    addTask({
      id: unwrap(TaskId.create('task-alg-3')),
      title: unwrap(Title.create('Polynomdivisjon med lineær divisor')),
      description: unwrap(LatexDescription.create('Del $x^2+3x+2$ på $x+1$.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.TALL_OG_ALGEBRA, 'Polynomdivisjon')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Del og trekk fra', 'Første ledd gir $x$. Multipliser tilbake og trekk fra resten.', 'x^2+3x+2=(x+1)(x+2)'))],
      correctAnswer: { type: 'expression', latex: 'x + 2' },
    });

    // 2. Ligninger og Ulikheter
    this.tasks.push(
      unwrap(
        Task.create({
          id: unwrap(TaskId.create('task-lig-1')),
          title: unwrap(Title.create('Andregradslikning med abc-formelen')),
          description: unwrap(
            LatexDescription.create(
              'Løs likningen $x^2 - 5x + 6 = 0$. Oppgi den største løsningen for $x$.'
            )
          ),
          difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
          category: unwrap(
            Lk20Category.create(
              Lk20Topic1T.LIGNINGER_OG_ULIKHETER,
              'Andregradslikninger'
            )
          ),
          solutionSteps: [
            unwrap(
              SolutionStep.create(
                1,
                'Identifiser koeffisientene',
                'Sett opp koeffisientene $a = 1$, $b = -5$, $c = 6$.',
                'a=1, b=-5, c=6'
              )
            ),
            unwrap(
              SolutionStep.create(
                2,
                'Bruk abc-formelen',
                '$x = \\frac{5 \\pm \\sqrt{(-5)^2 - 4 \\cdot 1 \\cdot 6}}{2 \\cdot 1} = \\frac{5 \\pm 1}{2}$.',
                'x_1 = 3, \\, x_2 = 2'
              )
            ),
          ],
          correctAnswer: { type: 'numeric', value: 3 },
        })
      )
    );

    addTask({
      id: unwrap(TaskId.create('task-lig-2')),
      title: unwrap(Title.create('Likningssystem med to ukjente')),
      description: unwrap(LatexDescription.create('Løs systemet $y=2x+1$ og $y=-x+7$. Oppgi x-koordinaten.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.LIGNINGER_OG_ULIKHETER, 'Likningssystemer')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Sett uttrykkene lik hverandre', 'Begge uttrykkene er lik $y$, derfor får vi $2x+1=-x+7$.', '3x=6\\Rightarrow x=2'))],
      correctAnswer: { type: 'numeric', value: 2 },
    });
    addTask({
      id: unwrap(TaskId.create('task-lig-3')),
      title: unwrap(Title.create('Andregradsulikhet')),
      description: unwrap(LatexDescription.create('Finn løsningene til $(x-2)(x+1)>0$. Oppgi minste heltallsløsning.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.KREVENDE)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.LIGNINGER_OG_ULIKHETER, 'Fortegnsskjema')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Lag fortegnsskjema', 'Nullpunktene er $-1$ og $2$. Produktet er positivt utenfor nullpunktene, så minste heltall er $-2$.', 'x<-1\\text{ eller }x>2'))],
      correctAnswer: { type: 'numeric', value: -2 },
    });

    // 3. Funksjoner
    this.tasks.push(
      unwrap(
        Task.create({
          id: unwrap(TaskId.create('task-fun-1')),
          title: unwrap(Title.create('Nullpunkter for polynomfunksjon')),
          description: unwrap(
            LatexDescription.create(
              'Finn x-koordinaten til det største nullpunktet for funksjonen $f(x) = 2x - 8$.'
            )
          ),
          difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
          category: unwrap(
            Lk20Category.create(Lk20Topic1T.FUNKSJONER, 'Nullpunkter')
          ),
          solutionSteps: [
            unwrap(
              SolutionStep.create(
                1,
                'Sett f(x) = 0',
                'Løs likningen $2x - 8 = 0$.',
                '2x = 8'
              )
            ),
            unwrap(
              SolutionStep.create(
                2,
                'Dele på koeffisienten',
                'Dele på 2 på begge sider for å isolere $x$.',
                'x = 4'
              )
            ),
          ],
          correctAnswer: { type: 'numeric', value: 4 },
        })
      )
    );

    addTask({
      id: unwrap(TaskId.create('task-fun-2')),
      title: unwrap(Title.create('Andregradsfunksjonens bunnpunkt')),
      description: unwrap(LatexDescription.create('Finn x-koordinaten til bunnpunktet for $f(x)=x^2-6x+5$.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.FUNKSJONER, 'Andregradsfunksjoner')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Bruk symmetrilinjen', 'For $ax^2+bx+c$ er x-koordinaten $-b/(2a)$, derfor blir den $6/2=3$.', 'x=3'))],
      correctAnswer: { type: 'numeric', value: 3 },
    });
    addTask({
      id: unwrap(TaskId.create('task-fun-3')),
      title: unwrap(Title.create('Eksponentiell vekstfaktor')),
      description: unwrap(LatexDescription.create('En verdi øker med $4\\%$ per periode. Oppgi vekstfaktoren.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.FUNKSJONER, 'Eksponentialfunksjoner')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Gå fra prosent til faktor', 'Ved vekst er faktoren $1+r$, der $r=0.04$.', 'b=1.04'))],
      correctAnswer: { type: 'numeric', value: 1.04, tolerance: 0.001 },
    });

    // 4. Derivasjon & Vekstfart
    this.tasks.push(
      unwrap(
        Task.create({
          id: unwrap(TaskId.create('task-der-1')),
          title: unwrap(Title.create('Derivasjon av polynomfunksjon')),
          description: unwrap(
            LatexDescription.create(
              'Deriver funksjonen $f(x) = x^3 - 4x + 7$. Oppgi uttrykket for $f\'(x)$.'
            )
          ),
          difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
          category: unwrap(
            Lk20Category.create(
              Lk20Topic1T.DERIVASJON_OG_VEKSTFART,
              'Derivasjonsregler'
            )
          ),
          solutionSteps: [
            unwrap(
              SolutionStep.create(
                1,
                'Bruk potensregelen',
                'Derivert av $x^n$ er $n \\cdot x^{n-1}$.',
                '\\frac{d}{dx}(x^3) = 3x^2'
              )
            ),
            unwrap(
              SolutionStep.create(
                2,
                'Deriver linjært ledd og konstant',
                'Derivert av $-4x$ er $-4$, og konstant $7$ blir $0$.',
                'f\'(x) = 3x^2 - 4'
              )
            ),
          ],
          correctAnswer: { type: 'expression', latex: '3x^2 - 4' },
        })
      )
    );

    addTask({
      id: unwrap(TaskId.create('task-der-2')),
      title: unwrap(Title.create('Vekstfart i et punkt')),
      description: unwrap(LatexDescription.create('For $f(x)=x^2+2x$ er $f\\prime(x)=2x+2$. Finn den momentane vekstfarten når $x=3$.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.DERIVASJON_OG_VEKSTFART, 'Momentan vekstfart')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Sett inn x-verdien', 'Den momentane vekstfarten er $f\\prime(3)=2\\cdot3+2$.', 'f\\prime(3)=8'))],
      correctAnswer: { type: 'numeric', value: 8 },
    });
    addTask({
      id: unwrap(TaskId.create('task-der-3')),
      title: unwrap(Title.create('Kritisk punkt')),
      description: unwrap(LatexDescription.create('Finn x-verdien der $f(x)=x^2-4x+1$ har horisontal tangent.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.DERIVASJON_OG_VEKSTFART, 'Ekstremalpunkt')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Sett den deriverte lik null', 'Deriver: $f\\prime(x)=2x-4$. En horisontal tangent betyr $2x-4=0$.', 'x=2'))],
      correctAnswer: { type: 'numeric', value: 2 },
    });

    // 5. Trigonometri
    this.tasks.push(
      unwrap(
        Task.create({
          id: unwrap(TaskId.create('task-trig-1')),
          title: unwrap(Title.create('Finn side med sinus')),
          description: unwrap(
            LatexDescription.create(
              'En rettvinklet trekant har hypotenus $10$ og vinkel $35^\circ$. Finn den motstående siden, avrundet til to desimaler.'
            )
          ),
          difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
          category: unwrap(
            Lk20Category.create(Lk20Topic1T.TRIGONOMETRI, 'Sinus, cosinus og tangens')
          ),
          solutionSteps: [
            unwrap(
              SolutionStep.create(
                1,
                'Velg riktig forhold',
                'Vi kjenner motstående side og hypotenus, derfor bruker vi $\sin(v) = \\frac{\\text{motstående}}{\\text{hypotenus}}$.',
                '\\sin(35^\\circ)=\\frac{x}{10}'
              )
            ),
            unwrap(
              SolutionStep.create(
                2,
                'Isoler siden',
                'Multipliser begge sider med $10$ og regn ut med kalkulator i gradmodus.',
                'x=10\\sin(35^\\circ)\\approx5.74'
              )
            ),
          ],
          correctAnswer: { type: 'numeric', value: 5.74, tolerance: 0.02 },
        })
      )
    );

    addTask({
      id: unwrap(TaskId.create('task-trig-3')),
      title: unwrap(Title.create('Cosinussetningen')),
      description: unwrap(LatexDescription.create('I en trekant er $a=5$, $b=7$ og den inkluderte vinkelen $C=60^\\circ$. Finn siden $c$ avrundet til to desimaler.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.KREVENDE)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.TRIGONOMETRI, 'Cosinussetningen')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Bruk cosinussetningen', 'Sett inn i $c^2=a^2+b^2-2ab\\cos(C)$ og ta kvadratroten.', 'c=\\sqrt{25+49-70\\cos(60^\\circ)}\\approx6.24'))],
      correctAnswer: { type: 'numeric', value: 6.24, tolerance: 0.02 },
    });

    this.tasks.push(
      unwrap(
        Task.create({
          id: unwrap(TaskId.create('task-trig-2')),
          title: unwrap(Title.create('Arealsetningen i en vilkårlig trekant')),
          description: unwrap(
            LatexDescription.create(
              'Finn arealet av en trekant med sidene $a=8$ og $b=5$ og inkludert vinkel $C=42^\circ$. Oppgi svaret med én desimal.'
            )
          ),
          difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
          category: unwrap(
            Lk20Category.create(Lk20Topic1T.TRIGONOMETRI, 'Arealsetningen')
          ),
          solutionSteps: [
            unwrap(
              SolutionStep.create(
                1,
                'Identifiser inkludert vinkel',
                'Vinkelen ligger mellom de to kjente sidene, så arealsetningen passer.',
                'A=\\frac12ab\\sin(C)'
              )
            ),
            unwrap(
              SolutionStep.create(
                2,
                'Sett inn og regn ut',
                'Sett inn $a=8$, $b=5$ og $C=42^\\circ$.',
                'A=\\frac12\\cdot8\\cdot5\\sin(42^\\circ)\\approx13.4'
              )
            ),
          ],
          correctAnswer: { type: 'numeric', value: 13.4, tolerance: 0.1 },
        })
      )
    );

    addTask({
      id: unwrap(TaskId.create('task-model-2')),
      title: unwrap(Title.create('Vurder en lineær modell')),
      description: unwrap(LatexDescription.create('En taxi koster $80$ kroner i startpris og $15$ kroner per kilometer. Hva koster en tur på $12$ kilometer?')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING, 'Lineær modell')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Definer modellen', 'Startprisen er konstantleddet og kilometerprisen er stigningstallet.', 'K(x)=80+15x\\Rightarrow K(12)=260'))],
      correctAnswer: { type: 'numeric', value: 260 },
    });
    addTask({
      id: unwrap(TaskId.create('task-model-3')),
      title: unwrap(Title.create('Velg riktig strategi')),
      description: unwrap(LatexDescription.create('En algoritme dobler et tall fem ganger. Hvor stor er sluttverdien når startverdien er $3$?')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING, 'Algoritmisk tenkning')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Beskriv gjentakelsen', 'Fem doblinger betyr at startverdien multipliseres med $2^5$.', '3\\cdot2^5=96'))],
      correctAnswer: { type: 'numeric', value: 96 },
    });

    // Utvidet oppgavebank: flere representasjoner og mer eksamensnære variasjoner.
    addTask({
      id: unwrap(TaskId.create('task-alg-4')),
      title: unwrap(Title.create('Potensfunksjon fra to punkter')),
      description: unwrap(LatexDescription.create('En potensfunksjon har formen $f(x)=a\\cdot x^2$ og går gjennom punktet $(3,18)$. Finn $a$.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.TALL_OG_ALGEBRA, 'Potensfunksjoner')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Sett inn punktet', 'Punktet $(3,18)$ betyr at $f(3)=18$.', '$18=a\\cdot3^2$')), unwrap(SolutionStep.create(2, 'Isoler parameteren', 'Regn ut $3^2$ og del på 9.', '$a=2$'))],
      correctAnswer: { type: 'numeric', value: 2 },
    });
    addTask({
      id: unwrap(TaskId.create('task-alg-5')),
      title: unwrap(Title.create('Definisjonsmengde i rasjonal funksjon')),
      description: unwrap(LatexDescription.create('For funksjonen $f(x)=\\frac{2x+1}{x-4}$: hvilken x-verdi er ikke tillatt?')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.TALL_OG_ALGEBRA, 'Rasjonale funksjoner')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Finn nevneren', 'Nevneren kan ikke være lik null.', '$x-4=0$')), unwrap(SolutionStep.create(2, 'Løs begrensningen', 'Legg til 4 på begge sider.', '$x=4$'))],
      correctAnswer: { type: 'numeric', value: 4 },
    });
    addTask({
      id: unwrap(TaskId.create('task-lig-4')),
      title: unwrap(Title.create('Parameter i andregradsligning')),
      description: unwrap(LatexDescription.create('For hvilken verdi av $k$ har likningen $x^2-6x+k=0$ bare én reell løsning?')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.KREVENDE)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.LIGNINGER_OG_ULIKHETER, 'Diskriminant')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Bruk diskriminanten', 'Én løsning betyr at diskriminanten er null.', '$(-6)^2-4k=0$')), unwrap(SolutionStep.create(2, 'Finn k', 'Løs $36-4k=0$.', '$k=9$'))],
      correctAnswer: { type: 'numeric', value: 9 },
    });
    addTask({
      id: unwrap(TaskId.create('task-lig-5')),
      title: unwrap(Title.create('Ulikhet med brøk')),
      description: unwrap(LatexDescription.create('Finn den minste heltallsløsningen til $\\frac{x-1}{x+2}>0$.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.KREVENDE)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.LIGNINGER_OG_ULIKHETER, 'Rasjonale ulikheter')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Finn kritiske punkter', 'Telleren er null ved $x=1$, og nevneren er null ved $x=-2$.', '$x=-2,\\;x=1$')), unwrap(SolutionStep.create(2, 'Les fortegnene', 'Brøken er positiv når teller og nevner har samme fortegn.', '$x<-2\\text{ eller }x>1$'))],
      correctAnswer: { type: 'numeric', value: 2 },
    });
    addTask({
      id: unwrap(TaskId.create('task-fun-4')),
      title: unwrap(Title.create('Parameter fra nullpunkt')),
      description: unwrap(LatexDescription.create('Funksjonen $f(x)=2x+k$ har nullpunktet $x=5$. Finn $k$.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.FUNKSJONER, 'Parametre')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Bruk nullpunktet', 'I nullpunktet er funksjonsverdien lik null.', '$0=2\\cdot5+k$')), unwrap(SolutionStep.create(2, 'Løs for k', 'Trekk 10 fra begge sider.', '$k=-10$'))],
      correctAnswer: { type: 'numeric', value: -10 },
    });
    addTask({
      id: unwrap(TaskId.create('task-fun-5')),
      title: unwrap(Title.create('Skjæring mellom funksjoner')),
      description: unwrap(LatexDescription.create('Finn x-koordinaten der $f(x)=x^2$ og $g(x)=2x+3$ skjærer hverandre på høyre side av y-aksen.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.KREVENDE)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.FUNKSJONER, 'Skjæringspunkter')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Sett funksjonene lik hverandre', 'I skjæringspunktet har funksjonene samme verdi.', '$x^2=2x+3$')), unwrap(SolutionStep.create(2, 'Løs andregradsligningen', 'Faktoriser $(x-3)(x+1)=0$. Høyre side av y-aksen betyr $x>0$.', '$x=3$'))],
      correctAnswer: { type: 'numeric', value: 3 },
    });
    addTask({
      id: unwrap(TaskId.create('task-der-4')),
      title: unwrap(Title.create('Tangent til en funksjon')),
      description: unwrap(LatexDescription.create('Finn stigningstallet til tangenten til $f(x)=x^3-2x$ når $x=2$.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.DERIVASJON_OG_VEKSTFART, 'Tangent')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Deriver funksjonen', 'Bruk potensregelen ledd for ledd.', '$f\\prime(x)=3x^2-2$')), unwrap(SolutionStep.create(2, 'Sett inn x', 'Tangentens stigningstall er den deriverte i punktet.', '$f\\prime(2)=10$'))],
      correctAnswer: { type: 'numeric', value: 10 },
    });
    addTask({
      id: unwrap(TaskId.create('task-der-5')),
      title: unwrap(Title.create('Størst mulig areal')),
      description: unwrap(LatexDescription.create('Et rektangel har omkrets 20. Hvis den ene siden er $x$, er arealet $A(x)=x(10-x)$. Finn x når arealet er størst.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.KREVENDE)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.DERIVASJON_OG_VEKSTFART, 'Optimering')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Deriver arealet', 'Utvikle først $A(x)=10x-x^2$.', '$A\\prime(x)=10-2x$')), unwrap(SolutionStep.create(2, 'Finn kritisk punkt', 'Sett den deriverte lik null.', '$10-2x=0\\Rightarrow x=5$'))],
      correctAnswer: { type: 'numeric', value: 5 },
    });
    addTask({
      id: unwrap(TaskId.create('task-trig-4')),
      title: unwrap(Title.create('Sinussetningen')),
      description: unwrap(LatexDescription.create('I en trekant er $A=30^\\circ$, $B=45^\\circ$ og $a=6$. Finn siden $b$ avrundet til to desimaler.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.TRIGONOMETRI, 'Sinussetningen')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Sett opp sinussetningen', 'Koble side og motstående vinkel.', '$\\frac{b}{\\sin45^\\circ}=\\frac{6}{\\sin30^\\circ}$')), unwrap(SolutionStep.create(2, 'Regn ut b', 'Isoler b og bruk gradmodus.', '$b=6\\frac{\\sin45^\\circ}{\\sin30^\\circ}\\approx8.49$'))],
      correctAnswer: { type: 'numeric', value: 8.49, tolerance: 0.02 },
    });
    addTask({
      id: unwrap(TaskId.create('task-trig-5')),
      title: unwrap(Title.create('Ukjent vinkel med cosinussetningen')),
      description: unwrap(LatexDescription.create('En trekant har sider $a=5$, $b=6$ og $c=7$. Finn vinkelen $C$ mellom sidene $a$ og $b$, avrundet til én desimal.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.KREVENDE)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.TRIGONOMETRI, 'Cosinussetningen')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Isoler cosinus', 'Bruk $c^2=a^2+b^2-2ab\\cos C$.', '$\\cos C=\\frac{a^2+b^2-c^2}{2ab}=\\frac{12}{60}=0.2$')), unwrap(SolutionStep.create(2, 'Finn vinkelen', 'Bruk invers cosinus.', '$C=\\cos^{-1}(0.2)\\approx78.5^\\circ$'))],
      correctAnswer: { type: 'numeric', value: 78.5, tolerance: 0.2 },
    });
    addTask({
      id: unwrap(TaskId.create('task-model-4')),
      title: unwrap(Title.create('Lineær regresjonsmodell')),
      description: unwrap(LatexDescription.create('En lineær modell er $f(x)=3.5x+12$. Hva er modellens prediksjon når $x=8$?')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING, 'Lineær modell')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Sett inn x', 'Prediksjonen finnes ved å bruke modellen.', '$f(8)=3.5\\cdot8+12$')), unwrap(SolutionStep.create(2, 'Regn ut', 'Gang og legg sammen.', '$f(8)=40$'))],
      correctAnswer: { type: 'numeric', value: 40 },
    });
    addTask({
      id: unwrap(TaskId.create('task-model-5')),
      title: unwrap(Title.create('Kontroller en vekstalgoritme')),
      description: unwrap(LatexDescription.create('En algoritme starter med 200 og øker verdien med 10 % tre ganger. Hva blir sluttverdien?')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING, 'Programmering og algoritmer')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Finn vekstfaktoren', 'En økning på 10 % gir vekstfaktor 1.10.', '$200\\cdot1.10^3$')), unwrap(SolutionStep.create(2, 'Kontroller resultatet', 'Gjenta multiplikasjonen tre ganger.', '$266.2$'))],
      correctAnswer: { type: 'numeric', value: 266.2, tolerance: 0.1 },
    });

    // 6. Modellering, bevis og problemløsing
    this.tasks.push(
      unwrap(
        Task.create({
          id: unwrap(TaskId.create('task-model-1')),
          title: unwrap(Title.create('Modell for prosentvis vekst')),
          description: unwrap(
            LatexDescription.create(
              'En konto har $12\\,000$ kroner og vokser med $3\\%$ per år. Lag en modell og finn verdien etter $5$ år, avrundet til nærmeste krone.'
            )
          ),
          difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
          category: unwrap(
            Lk20Category.create(Lk20Topic1T.MODELLERING_OG_PROBLEMSLOYSING, 'Modellering')
          ),
          solutionSteps: [
            unwrap(
              SolutionStep.create(
                1,
                'Velg vekstmodell',
                'Fast prosentvis vekst betyr eksponentialmodell med startverdi $12000$ og vekstfaktor $1.03$.',
                'K(t)=12000\\cdot1.03^t'
              )
            ),
            unwrap(
              SolutionStep.create(
                2,
                'Tolk resultatet',
                'Sett $t=5$. Resultatet er omtrent $13\\,911$ kroner, forutsatt at renten er konstant.',
                'K(5)=12000\\cdot1.03^5\\approx13911'
              )
            ),
          ],
          correctAnswer: { type: 'numeric', value: 13911, tolerance: 1 },
        })
      )
    );

    addTask({
      id: unwrap(TaskId.create('task-san-2')),
      title: unwrap(Title.create('Komplementær sannsynlighet')),
      description: unwrap(LatexDescription.create('Sannsynligheten for regn er $0.35$. Finn sannsynligheten for at det ikke regner.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.SANNSYNLIGHET, 'Komplement')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Bruk komplementet', 'Ikke A har sannsynlighet $1-P(A)$, altså $1-0.35=0.65$.', 'P(ikke A)=0.65'))],
      correctAnswer: { type: 'numeric', value: 0.65, tolerance: 0.001 },
    });
    addTask({
      id: unwrap(TaskId.create('task-san-3')),
      title: unwrap(Title.create('Kombinasjoner')),
      description: unwrap(LatexDescription.create('På hvor mange måter kan du velge 2 elever fra en gruppe på 5 når rekkefølgen ikke betyr noe?')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.SANNSYNLIGHET, 'Kombinatorikk')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Bruk kombinasjonsformelen', 'Når rekkefølge ikke betyr noe bruker vi $\\binom{5}{2}=5!/(2!3!)$.', '10'))],
      correctAnswer: { type: 'numeric', value: 10 },
    });

    // 7. Sannsynlighet (ekstra repetisjon)
    this.tasks.push(
      unwrap(
        Task.create({
          id: unwrap(TaskId.create('task-san-1')),
          title: unwrap(Title.create('Betinget sannsynlighet')),
          description: unwrap(
            LatexDescription.create(
              'I en klasse spiller 60 % fotball og 30 % spiller både fotball og håndball. Hva er sannsynligheten for at en elev spiller håndball gitt at eleven spiller fotball? Oppgi svaret i desimaltall.'
            )
          ),
          difficulty: unwrap(Difficulty.create(DifficultyLevel.KREVENDE)),
          category: unwrap(
            Lk20Category.create(
              Lk20Topic1T.SANNSYNLIGHET,
              'Betinget sannsynlighet'
            )
          ),
          solutionSteps: [
            unwrap(
              SolutionStep.create(
                1,
                'Bruk formelen for betinget sannsynlighet',
                '$P(H | F) = \\frac{P(H \\cap F)}{P(F)}$.',
                'P(H | F) = \\frac{0.30}{0.60}'
              )
            ),
            unwrap(
              SolutionStep.create(
                2,
                'Regn ut brøken',
                '$\\frac{0.30}{0.60} = 0.5$.',
                '0.5'
              )
            ),
          ],
          correctAnswer: { type: 'numeric', value: 0.5, tolerance: 0.01 },
        })
      )
    );
    addTask({
      id: unwrap(TaskId.create('task-san-4')),
      title: unwrap(Title.create('Uavhengige hendelser')),
      description: unwrap(LatexDescription.create('Hendelsene $A$ og $B$ er uavhengige. $P(A)=0.4$ og $P(B)=0.25$. Finn $P(A\\cap B)$.')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.LETT)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.SANNSYNLIGHET, 'Uavhengighet')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Bruk regelen', 'For uavhengige hendelser multipliserer vi sannsynlighetene.', '$P(A\\cap B)=P(A)P(B)$')), unwrap(SolutionStep.create(2, 'Regn ut', 'Sett inn verdiene.', '$0.4\\cdot0.25=0.10$'))],
      correctAnswer: { type: 'numeric', value: 0.1, tolerance: 0.001 },
    });
    addTask({
      id: unwrap(TaskId.create('task-san-5')),
      title: unwrap(Title.create('Binomisk sannsynlighet')),
      description: unwrap(LatexDescription.create('Et forsøk har sannsynlighet $0.5$ for suksess og gjentas 4 ganger. Hvor mange utfall gir nøyaktig én suksess?')),
      difficulty: unwrap(Difficulty.create(DifficultyLevel.MIDDELS)),
      category: unwrap(Lk20Category.create(Lk20Topic1T.SANNSYNLIGHET, 'Binomiske forsøk')),
      solutionSteps: [unwrap(SolutionStep.create(1, 'Velg plasseringen', 'Den ene suksessen kan komme på ${4\\choose1}$ måter.', '${4\\choose1}=4')), unwrap(SolutionStep.create(2, 'Tell utfallene', 'For hver plassering er de tre andre forsøkene fiasko.', '$4$ utfall'))],
      correctAnswer: { type: 'numeric', value: 4 },
    });
  }
}
