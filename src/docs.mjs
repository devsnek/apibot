import registry from './registry';
import { output } from './DocsParser';
import render from './render';

export default function docs(query) {
  const item = registry(query);
  if (!item) return null;
  return render(output(item));
}
