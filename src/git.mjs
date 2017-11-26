import childProcess from 'child_process';
import exec from './exec';

const RepoName = 'discord-api-docs';

let updating;

export default function update() {
  if (updating)
    return updating;
  updating = exec(`git clone https://github.com/discordapp/${RepoName}.git`)
    .catch(() => exec(`cd ${RepoName} && git pull`))
    .then(() => true, () => false);
  updating.then(() => {
    updating = null;
  });
  return updating;
}

export function hash() {
  return childProcess.execSync(`cd ${RepoName} && git rev-parse HEAD`).toString().trim();
}
