import React, { useMemo } from 'react';
import katex from 'katex';

export type MathToken =
  | { type: 'text'; content: string }
  | { type: 'inline'; content: string }
  | { type: 'block'; content: string };

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
      tokens.push({
        type: 'text',
        content: input.slice(lastIndex, match.index),
      });
    }

    const rawMatch = match[0];
    if (rawMatch.startsWith('$$') && rawMatch.endsWith('$$')) {
      tokens.push({
        type: 'block',
        content: rawMatch.slice(2, -2).trim(),
      });
    } else if (rawMatch.startsWith('\\[') && rawMatch.endsWith('\\]')) {
      tokens.push({
        type: 'block',
        content: rawMatch.slice(2, -2).trim(),
      });
    } else if (rawMatch.startsWith('\\(') && rawMatch.endsWith('\\)')) {
      tokens.push({
        type: 'inline',
        content: rawMatch.slice(2, -2).trim(),
      });
    } else if (rawMatch.startsWith('$') && rawMatch.endsWith('$')) {
      tokens.push({
        type: 'inline',
        content: rawMatch.slice(1, -1).trim(),
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    tokens.push({
      type: 'text',
      content: input.slice(lastIndex),
    });
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
  const tokens = useMemo(() => parseLatex(latex), [latex]);

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
