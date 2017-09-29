import childProcess from 'child_process';
import exec from './exec';

const RepoName = 'discord-api-docs';

export default exec(`git clone https://github.com/discordapp/${RepoName}.git`)
  .catch(() => exec(`cd ${RepoName} && git pull`))
  .then(() => true, () => false);

export function hash() {
  return childProcess.execSync(`cd ${RepoName} && git rev-parse HEAD`).toString().trim();
}
