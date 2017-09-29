import util from 'util';
import fs from 'fs';
import _glob from 'glob';
import distance from 'jaro-winkler';
import { parser } from './DocsParser';

const blacklist = ['Change_Log.md', 'Intro.md'];

const glob = util.promisify(_glob);

const registry = [];

glob('./discord-api-docs/docs/**/*.md')
  .then((files) => {
    for (const file of files) {
      for (const item of blacklist) if (file.includes(item)) continue;
      const content = fs.readFileSync(file).toString();
      const tree = parser(content);
      for (const item of tree) {
        if (item.content && typeof item.content !== 'string') {
          item.builtContent = item.content.map((c) => c.content).join('');
        }
        registry.push(item);
      }
    }
    return registry;
  });

const SearchTypes = ['heading', 'httpheader'];
export default function search(query) {
  query = query.toLowerCase();
  let selection;
  for (let i in registry) {
    const item = registry[i];
    const content = item.builtContent || item.content;
    if (!SearchTypes.includes(item.type) || !content) continue;
    const p = distance(query, item.title || content.split('%')[0].toLowerCase());
    if (p < 0.85) continue;
    if (selection && p < selection.p) continue;
    selection = { i, p };
  }
  if (!selection) return null;
  const body = [registry[selection.i]];
  for (let i = +selection.i + 1; i < registry.length; i++) {
    const item = registry[i];
    if (item.type === 'heading' && item.level <= body[0].level) break;
    if (item.type === 'httpheader') break;
    body.push(item);
  }
  return body;
}
