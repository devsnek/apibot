import marked from 'marked';
import http from 'http';
import highlightjs from 'highlight.js';

const MethodReg = new RegExp(`% (${http.METHODS.join('|')})`);
const LinkReg = /\{(.+?)#.+?\}/;

const renderer = new marked.Renderer();
renderer.code = (code, language) => {
  const validLang = !!(language && highlightjs.getLanguage(language));
  const highlighted = validLang ? highlightjs.highlight(language, code).value : code;
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
};

marked.setOptions({ renderer });

export default function transform(elements) {
  elements.links = {};
  for (const i in elements) {
    const element = elements[i];
    if (!element.text) continue;
    if (LinkReg.test(element.text)) {
      const r = LinkReg.exec(element.text);
      element.text = element.text.replace(LinkReg, `{${r[1]}}`);
    }
    if (MethodReg.test(element.text)) {
      const [name, rest] = element.text.split(' % ');
      element.text = name;
      elements.splice(+i + 1, 0, { type: 'heading', depth: 3, text: rest });
    }
  }
  return marked.parser(elements);
}
