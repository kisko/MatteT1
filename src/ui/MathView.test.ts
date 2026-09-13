import { describe, it, expect } from 'vitest';
import { parseLatex, looksLikeLatexMath } from './MathView.js';

describe('MathView parseLatex', () => {
  it('parserer standard fritekst med inline og block math', () => {
    const input = 'Finn $x$ i likningen: $$x^2 - 4 = 0$$ der $x > 0$. Pris: \\$10.';
    const tokens = parseLatex(input);

    const hasInlineX = tokens.some((t) => t.type === 'inline' && t.content === 'x');
    const hasBlockFormula = tokens.some((t) => t.type === 'block' && t.content === 'x^2 - 4 = 0');

    expect(hasInlineX).toBe(true);
    expect(hasBlockFormula).toBe(true);
  });

  it('haandterer dobbel- eller noestet innpakking av dollartegn elegant uden a gi syntax error', () => {
    const doubleWrapped = '$$ $18=a\\cdot3^2$ $$';
    const tokens = parseLatex(doubleWrapped);

    expect(tokens.length).toBe(1);
    expect(tokens[0].content).toBe('18=a\\cdot3^2');
  });

  it('auto-detekterer raa LaTeX uten $-skillemerke', () => {
    const rawLatex = '5\\sqrt{2}';
    expect(looksLikeLatexMath(rawLatex)).toBe(true);

    const tokens = parseLatex(rawLatex);
    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe('inline');
    expect(tokens[0].content).toBe('5\\sqrt{2}');
  });
});
