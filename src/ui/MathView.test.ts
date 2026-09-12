import { parseLatex } from './MathView.js';

const input = 'Finn $x$ i likningen: $$x^2 - 4 = 0$$ der $x > 0$. Pris: \\$10.';
const tokens = parseLatex(input);

console.log('Parsed tokens:', JSON.stringify(tokens, null, 2));

const hasInlineX = tokens.some((t) => t.type === 'inline' && t.content === 'x');
const hasBlockFormula = tokens.some((t) => t.type === 'block' && t.content === 'x^2 - 4 = 0');

if (hasInlineX && hasBlockFormula) {
  console.log('✅ MathView parser fungerer som forventet!');
} else {
  console.error('❌ Uventet parser-resultat');
  throw new Error('Test feilet');
}
