import SimpleMarkdown from 'simple-markdown';

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
      console.log(node);
    },
  },

  blockQuote: Object.assign(SimpleMarkdown.defaultRules.blockQuote, {
    parse(capture, p, state) {
      const content = capture[0].replace(/^ *> ?/gm, '').split('\n');
      return {
        alertType: content.shift(),
        content: p(content.join('\n'), state),
      };
    },
    html() {},
  }),
});

rules.text.match = (source) =>
  /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff-]|\n\n| {2,}\n|\w+:\S|$)/.exec(source);

export const parser = SimpleMarkdown.parserFor(rules);

export const output = SimpleMarkdown.htmlFor(SimpleMarkdown.ruleOutput(rules, 'html'));
