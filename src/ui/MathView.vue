<template>
  <component :is="rootTag" :class="['math-view', className]">
    <template v-for="(token, index) in tokens" :key="index">
      <span v-if="token.type === 'text'">
        {{ unescapeText(token.content) }}
      </span>

      <div
        v-else-if="(displayMode ?? token.type === 'block')"
        class="math-view-block"
        style="margin: 0.5em 0; text-align: center;"
        v-html="renderKatex(token.content, true)"
      />

      <span
        v-else
        class="math-view-inline"
        v-html="renderKatex(token.content, false)"
      />
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import katex from 'katex';

export type MathToken =
  | { type: 'text'; content: string }
  | { type: 'inline'; content: string }
  | { type: 'block'; content: string };

const props = withDefaults(
  defineProps<{
    latex: string;
    displayMode?: boolean;
    className?: string;
    throwOnError?: boolean;
    errorColor?: string;
  }>(),
  {
    className: '',
    throwOnError: false,
    errorColor: '#cc0000',
  }
);

function parseLatex(input: string): MathToken[] {
  if (!input) return [];

  const tokens: MathToken[] = [];
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
      tokens.push({ type: 'block', content: rawMatch.slice(2, -2).trim() });
    } else if (rawMatch.startsWith('\\[') && rawMatch.endsWith('\\]')) {
      tokens.push({ type: 'block', content: rawMatch.slice(2, -2).trim() });
    } else if (rawMatch.startsWith('\\(') && rawMatch.endsWith('\\)')) {
      tokens.push({ type: 'inline', content: rawMatch.slice(2, -2).trim() });
    } else if (rawMatch.startsWith('$') && rawMatch.endsWith('$')) {
      tokens.push({ type: 'inline', content: rawMatch.slice(1, -1).trim() });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    tokens.push({ type: 'text', content: input.slice(lastIndex) });
  }

  return tokens;
}

const tokens = computed(() => parseLatex(props.latex));
const rootTag = computed(() => (props.displayMode ? 'div' : 'span'));

function unescapeText(content: string): string {
  return content.replace(/\\(\$)/g, '$1');
}

function renderKatex(content: string, isBlock: boolean): string {
  try {
    return katex.renderToString(content, {
      displayMode: isBlock,
      throwOnError: props.throwOnError,
      errorColor: props.errorColor,
      output: 'htmlAndMathml',
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return `<span class="math-view-error" style="color: ${props.errorColor}; font-family: monospace;" title="${errorMsg}">${content}</span>`;
  }
}
</script>
