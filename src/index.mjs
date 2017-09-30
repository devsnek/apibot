import git, { hash } from './git';
import log from './log';
import docs from './docs';
import Discord from 'discord.js';

import { token } from '../config';

git.then(() => log('DOCS', 'repo updated', hash()));

const client = new Discord.Client();

client.on('message', async(message) => {
  if (message.bot || !message.content.startsWith(client.user)) return;
  const content = message.content.replace(client.user, '').trim();
  if (!content) return;
  client.api.channels(message.channel.id).typing.post();
  const img = await docs(content);
  if (!img) return message.channel.send('**Could not find docs entry!**');
  message.channel.send({ files: [img] });
});

client.on('debug', (...x) => log('DEBUG', ...x));
client.on('ready', () => {
  log('CLIENT', 'ready', client.user.tag, client.user.id);
});

client.login(token);

process.on('unhandledRejection', (err) => {
  log('UNHANDLED REJECTION', err.stack);
});
