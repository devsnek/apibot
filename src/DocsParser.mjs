import SimpleMarkdown from 'simple-markdown';
import highlight from 'highlight.js';

export const ClassMap = {
  h1: 'h1-adqWBM',
  h2: 'h2-1QHG2q',
  h3: 'h3-yx9K3b',
  h6: 'h6-2zToWC',
  span: 'paragraph-2rm1XZ',
  a: 'link-Sh2NcF',
  pre: 'pre-17I0qV',
  code: 'code-EK4P48',
};

const htmlTagOld = SimpleMarkdown.htmlTag;
SimpleMarkdown.htmlTag = (tagName, content, attributes = {}, isClosed) => {
  if (tagName in ClassMap)
    attributes.class = `${attributes.class || ''} ${ClassMap[tagName]}`.trim();
  return htmlTagOld(tagName, content, attributes, isClosed);
};

export const rules = Object.assign({}, SimpleMarkdown.defaultRules, {
  httpheader: {
    order: SimpleMarkdown.defaultRules.heading.order - 0.5,
    match(source) {
      return /^([#]+) (.+) % (.+) (.+)/.exec(source);
    },
    parse(capture) {
      return {
        size: capture[1].length,
        title: capture[2].trim(),
        method: (capture[3] || '').trim(),
        content: (capture[4] || '').trim(),
      };
    },
    html(node) {
      const parts = [];
      for (const part of node.content.split(/({.*?})/g)) {
        if (part.match(/{.*}/)) {
          const pieces = part.split(/{(.+)#(.+)\/(.+)}/);
          parts.push(`<span><a class=http-req-variable>{${pieces[1]}}</a></span>`);
        } else {
          parts.push(`<span>${part}</span>`);
        }
      }
      return `<div class=http-req>
<h2 class="${ClassMap.h2} http-req-title">${node.title}</h2>
<span class=http-req-verb>${node.method}</span>
<span class=http-req-url>${parts.join('')}</span>
</div>`;
    },
  },

  blockQuote: Object.assign(SimpleMarkdown.defaultRules.blockQuote, {
    parse(capture) {
      const content = capture[0].replace(/^ *> ?/gm, '').split('\n');
      return {
        alertType: content.shift(),
        content: content.join('\n'),
      };
    },
    html(node) {
      return `<div class="alert-box ${node.alertType}">
<blockquote>
<span class=${ClassMap.span}>${node.content}</span>
</blockquote>
</div>`;
    },
  }),

  paragraph: Object.assign(SimpleMarkdown.defaultRules.paragraph, {
    html(node, output, state) {
      return SimpleMarkdown.htmlTag('span', output(node.content, state));
    },
  }),
});

rules.text.match = (source) =>
  /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff-]|\n\n| {2,}\n|\w+:\S|$)/.exec(source);

rules.codeBlock.html = (node) => {
  if (node.lang && highlight.getLanguage(node.lang))
    var code = highlight.highlight(node.lang, node.content);

  return SimpleMarkdown.htmlTag('pre',
    SimpleMarkdown.htmlTag('code',
      code ? code.value : node.content,
      { class: `hljs scroller ${code ? code.language : ''}`.trim() },
    )
  );
};

export const parser = SimpleMarkdown.parserFor(rules);
export const output = SimpleMarkdown.htmlFor(SimpleMarkdown.ruleOutput(rules, 'html'));
