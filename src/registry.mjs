import fs from 'fs';
import path from 'path';
import glob from './glob';
import distance from 'jaro-winkler';
import { parser } from './DocsParser';
import log from './log';
import git, { hash } from './git';

const blacklist = ['Change_Log.md'];

let registry;
const SearchTypes = ['heading', 'httpheader'];

update();

export async function update() {
  await git();
  log('DOCS', 'repo updated', hash());
  return build().then(() => true, () => false);
}

export function build() {
  registry = [];
  return glob('./discord-api-docs/docs/**/*.md')
    .then((files) => {
      files = files.filter((f) => {
        f = path.basename(f);
        for (const item of blacklist) {
          if (item === f)
            return false;
        }
        return true;
      });
      for (const file of files) {
        log('REGISTRY', 'loaded file', file);
        const content = fs.readFileSync(file).toString();
        const tree = parser(content);
        for (const item of tree) {
          if (item.content && typeof item.content !== 'string')
            item.builtContent = item.content.map((c) => c.content).join('');
          registry.push(item);
        }
      }
      return registry;
    });
}


export default function search(query) {
  query = query.toLowerCase();
  let selection;
  for (let i in registry) {
    const item = registry[i];
    const content = item.title || item.builtContent || item.content;
    if (!SearchTypes.includes(item.type) || !content)
      continue;
    const subject = content.split('%')[0].toLowerCase();
    let subcheck = 0;
    for (const word of query.split(' ')) {
      if (subject.includes(word))
        subcheck++;
    }
    const p = distance(query, subject) + (subcheck * 0.10);
    if (p < 0.85 || (selection && p < selection.p))
      continue;
    selection = { i, p };
  }
  if (!selection)
    return null;
  const body = [registry[selection.i]];
  for (let i = +selection.i + 1; i < registry.length; i++) {
    const item = registry[i];
    if (item.type === 'httpheader')
      break;
    if (item.type === 'heading' && item.level - 1 <= body[0].level)
      break;
    body.push(item);
  }
  return body;
}
