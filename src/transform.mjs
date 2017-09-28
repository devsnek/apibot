import marked from 'marked';
import http from 'http';

const MethodReg = new RegExp(`% (${http.METHODS.join('|')})`);

export default function transform(elements) {
  elements.links = {};
  for (const i in elements) {
    const element = elements[i];
    if (!element.text || !MethodReg.test(element.text)) continue;
    const [name, rest] = element.text.split(' % ');
    element.text = name;
    elements.splice(+i + 1, 0, { type: 'heading', depth: 3, text: rest });
  }
  return marked.parser(elements);
}
