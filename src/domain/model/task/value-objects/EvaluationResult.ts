export class EvaluationResult {
  public constructor(
    public readonly isCorrect: boolean,
    public readonly score: number, // 0.0 til 1.0
    public readonly feedbackLatex: string,
    public readonly evaluatedAt: Date = new Date()
  ) {}

  public static correct(feedbackLatex: string = 'Korrekt svar!'): EvaluationResult {
    return new EvaluationResult(true, 1.0, feedbackLatex);
  }

  public static incorrect(feedbackLatex: string): EvaluationResult {
    return new EvaluationResult(false, 0.0, feedbackLatex);
  }

  public static partial(score: number, feedbackLatex: string): EvaluationResult {
    const clampedScore = Math.max(0, Math.min(1, score));
    return new EvaluationResult(clampedScore === 1, clampedScore, feedbackLatex);
  }
}

