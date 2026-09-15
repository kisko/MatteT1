import React, { useMemo } from 'react';
import katex from 'katex';

export type MathToken =
  | { type: 'text'; content: string }
  | { type: 'inline'; content: string }
  | { type: 'block'; content: string };

/**
 * Sjekker om en streng uten eksplisitte $-skillemerker ser ut som et ren matematisk LaTeX-uttrykk.
 */
export function looksLikeLatexMath(input: string): boolean {
  if (!input) return false;
  const str = input.trim();
  if (!str) return false;

  // Fritekst med et matematisk uttrykk må ha eksplisitte $-skillemerker.
  // Ellers vil KaTeX svelge mellomrommene i hele setningen.
  if (/\s/.test(str)) return false;

  // Inneholder typiske LaTeX-kommandoer
  if (/\\(frac|sqrt|cdot|approx|le|ge|pm|infty|sin|cos|tan|lg|ln|binom|Delta|prime|Rightarrow|rightarrow|to|in|cap|cup|quad|text)/.test(str)) {
    return true;
  }

  // Inneholder potens/hevet skrift eller senket skrift
  if (/[a-zA-Z0-9]\^[a-zA-Z0-9{}]|[a-zA-Z0-9]_[a-zA-Z0-9{}]/.test(str)) {
    return true;
  }

  return false;
}

/**
 * Parserer en streng med fritekst og LaTeX-matematikk ($...$ og $$...$$ samt \(...\) og \[...\]).
 * Bevarer eskaperte dollartegn (\$ -> $).
 */
export function parseLatex(input: string): MathToken[] {
  if (!input) return [];

  const tokens: MathToken[] = [];
  // Regex for $$...$$, \[...\], $...$, og \(...\)
  const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|(?<!\\)\$(?:\\\$|[^\$])+?(?<!\\)\$|\\\([\s\S]+?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      const textContent = input.slice(lastIndex, match.index);
      if (textContent) {
        tokens.push({ type: 'text', content: textContent });
      }
    }

    const rawMatch = match[0];
    let content = rawMatch;
    let type: 'block' | 'inline' = 'inline';

    if (rawMatch.startsWith('$$') && rawMatch.endsWith('$$')) {
      content = rawMatch.slice(2, -2).trim();
      type = 'block';
    } else if (rawMatch.startsWith('\\[') && rawMatch.endsWith('\\]')) {
      content = rawMatch.slice(2, -2).trim();
      type = 'block';
    } else if (rawMatch.startsWith('\\(') && rawMatch.endsWith('\\)')) {
      content = rawMatch.slice(2, -2).trim();
      type = 'inline';
    } else if (rawMatch.startsWith('$') && rawMatch.endsWith('$')) {
      content = rawMatch.slice(1, -1).trim();
      type = 'inline';
    }

    // Rens for eventuelle gjenstående ytre $ i content (f.eks hvis input var "$$ $18=a\cdot3^2$ $$")
    content = content.replace(/^\$+|\$+$/g, '').trim();

    if (content) {
      tokens.push({ type, content });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    const textContent = input.slice(lastIndex);
    if (textContent) {
      tokens.push({ type: 'text', content: textContent });
    }
  }

  // Hvis det ikke var noen eksplisitte skillemerker ($, $$), men hele strengen ser ut som et LaTeX-uttrykk:
  if (tokens.length === 1 && tokens[0].type === 'text') {
    const singleText = tokens[0].content;
    if (looksLikeLatexMath(singleText)) {
      return [{ type: 'inline', content: singleText.trim() }];
    }
  }

  return tokens;
}

export interface MathViewProps {
  /** LaTeX-streng som skal rendres. Kan inneholde fritekst og $...$ / $$...$$ */
  latex: string;
  /** Om komponenten skal rendres som block (div) eller inline (span). Standard er inline/auto. */
  displayMode?: boolean;
  /** Ekstra CSS-klassenavn for rot-elementet. */
  className?: string;
  /** Custom feilhåndtering for KaTeX rendering. Standard er throwOnError: false. */
  throwOnError?: boolean;
  /** Vis feilmelding som tekst ved renderfeil istedenfor rød KaTeX-feil. */
  errorColor?: string;
}

/**
 * Reusable React-komponent for sikker rendring av LaTeX med KaTeX.
 */
export const MathView: React.FC<MathViewProps> = ({
  latex,
  displayMode,
  className = '',
  throwOnError = false,
  errorColor = '#cc0000',
}) => {
  const tokens = useMemo(() => {
    if (!latex) return [];

    const parsedTokens = parseLatex(latex);

    // Blokkmodus kan bare tvinges når hele verdien er én formel. En blandet
    // streng som "$h = 6$ meter" må beholde tekst- og matematikkdelene sine.
    if (displayMode) {
      if (parsedTokens.length === 1 && parsedTokens[0].type === 'inline') {
        return [{ type: 'block' as const, content: parsedTokens[0].content }];
      }
    }

    return parsedTokens;
  }, [latex, displayMode]);

  const renderToken = (token: MathToken, index: number) => {
    if (token.type === 'text') {
      // Erstatt eskaperte dollartegn \$ med vanlige $ i ren tekst
      const unescapedText = token.content.replace(/\\(\$)/g, '$1');
      return <span key={index}>{unescapedText}</span>;
    }

    const isBlock = displayMode ?? token.type === 'block';

    try {
      const html = katex.renderToString(token.content, {
        displayMode: isBlock,
        throwOnError,
        errorColor,
        output: 'htmlAndMathml',
      });

      if (isBlock) {
        return (
          <div
            key={index}
            className="math-view-block"
            style={{ margin: '0.5em 0', textAlign: 'center' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      return (
        <span
          key={index}
          className="math-view-inline"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch (err) {
      return (
        <span
          key={index}
          className="math-view-error"
          style={{ color: errorColor, fontFamily: 'monospace' }}
          title={err instanceof Error ? err.message : String(err)}
        >
          {token.content}
        </span>
      );
    }
  };

  const RootTag = displayMode ? 'div' : 'span';

  return (
    <RootTag className={`math-view ${className}`.trim()}>
      {tokens.map((token, index) => renderToken(token, index))}
    </RootTag>
  );
};

export default MathView;
