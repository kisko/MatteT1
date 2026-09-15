import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MathView, looksLikeLatexMath, parseLatex } from '../../src/ui/MathView.js';

describe('MathView parseLatex', () => {
  it('beholder fritekst med et umarkert matematisk uttrykk som tekst', () => {
    const input = 'Taxi B er billigst når turen er lengre enn 5 km';

    expect(looksLikeLatexMath(input)).toBe(false);
    expect(parseLatex(input)).toEqual([{ type: 'text', content: input }]);
  });

  it('beholder tekst etter en formel når displayMode er satt', () => {
    const markup = renderToStaticMarkup(
      createElement(MathView, {
        latex: String.raw`$h = 6\sin(65^\circ) \approx 5.4$ meter`,
        displayMode: true,
      })
    );

    expect(markup).toContain('meter');
    expect(markup).toContain('katex');
    expect(markup).not.toContain('math-view-error');
  });
});