import registry from './registry';
import transform from './transform';
import render from './render';

export default function docs(query) {
  const item = registry(query);
  if (!item) return null;
  return render(transform(item));
}
