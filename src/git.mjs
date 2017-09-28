import exec from './exec';

export default exec('git clone https://github.com/discordapp/discord-api-docs.git')
  .catch(() => exec('cd discord-api-docs && git pull'))
  .then(() => true, () => false);
