import fs from 'fs';
import path from 'path';
import glob from './glob';
import distance from 'jaro-winkler';
import { parser } from './DocsParser';

const blacklist = ['Change_Log.md'];

const registry = [];

glob('./discord-api-docs/docs/**/*.md')
  .then((files) => {
    files = files.filter((f) => {
      f = path.basename(f);
      for (const item of blacklist) if (item === f) return false;
      return true;
    });
    for (const file of files) {
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
    if (p < 0.85 || (selection && p < selection.p)) continue;
    selection = { i, p };
  }
  if (!selection) return null;
  const body = [registry[selection.i]];
  for (let i = +selection.i + 1; i < registry.length; i++) {
    const item = registry[i];
    if (item.type === 'httpheader') break;
    if (item.type === 'heading' && item.level - 1 <= body[0].level) break;
    body.push(item);
  }
  return body;
}
