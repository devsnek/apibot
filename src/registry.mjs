import util from 'util';
import fs from 'fs';
import marked from 'marked';
import _glob from 'glob';
import distance from 'jaro-winkler';

const glob = util.promisify(_glob);

const registry = [];

glob('./discord-api-docs/docs/**/*.md')
  .then((files) => {
    for (const file of files) {
      const content = fs.readFileSync(file).toString();
      const tree = marked.lexer(content);
      registry.push(...tree);
    }
    return registry;
  });

export default function search(query) {
  let selection;
  for (let i in registry) {
    const item = registry[i];
    if (!item.text || item.type !== 'heading') continue;
    const p = distance(item.text.split('%')[0].toLowerCase(), query.toLowerCase());
    if (p < 0.85) continue;
    if (selection && p < selection.p) continue;
    selection = { i, p };
  }
  if (!selection) return null;
  const body = [registry[selection.i]];
  for (let i = +selection.i + 1; i < registry.length; i++) {
    const item = registry[i];
    if (item.type === 'heading' && item.depth <= body[0].depth) break;
    body.push(item);
  }
  return body;
}
