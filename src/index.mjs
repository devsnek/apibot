import git from './git';
import log from './log';
import docs from './docs';
import Discord from 'discord.js';

import { token } from '../config';

git.then(() => log('DOCS', 'repo updated'));

const client = new Discord.Client();

client.on('message', async(message) => {
  if (message.bot || !message.content.startsWith(client.user)) return;
  const img = await docs(message.content.replace(client.user, '').trim());
  message.channel.send({ files: [img] });
});

client.login(token);
