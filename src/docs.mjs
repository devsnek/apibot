import registry from './registry';
import transform from './transform';
import render from './render';

export default function docs(query) {
  return render(transform(registry(query)));
}
