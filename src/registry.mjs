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
  const body = [];
  for (const item of registry) {
    if (body.length && item.type === 'heading' && item.depth <= body[0].depth) break;
    if (body.length) body.push(item);
    const p = distance(item.text.toLowerCase(), query.toLowerCase());
    if (!item.text || p < 0.87) continue;
    body.push(item);
  }
  return body;
}
