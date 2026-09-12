export class Hint {
  private constructor(
    public readonly level: number,
    public readonly title: string,
    public readonly latexContent: string
  ) {}

  public static create(
    level: number,
    title: string,
    latexContent: string
  ): Hint {
    return new Hint(Math.max(1, level), title.trim(), latexContent.trim());
  }
}
