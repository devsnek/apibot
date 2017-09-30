import glob from 'glob';
import util from 'util';

export default util.promisify(glob);
