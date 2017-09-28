export default function log(topic, ...args) {
  // eslint-disable-next-line no-console
  console.log(process.uptime().toFixed(3), `[${topic}]`, ...args);
}
