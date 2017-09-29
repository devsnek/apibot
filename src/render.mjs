import puppeteer from 'puppeteer';

const debug = !!process.env.DEBUG;

export default async function render(html) {
  const browser = await puppeteer.launch({ headless: !debug });
  const page = await browser.newPage();
  await page.setContent(build(html), { waitUntil: 'networkidle' });
  const height = await page.$eval('#container', (e) => window.getComputedStyle(e).height);
  await page.setViewport({
    width: 650,
    height: parseInt(height) + 25,
  });
  const buf = await page.screenshot();
  if (!debug) await browser.close();
  return buf;
}

function build(html) {
  return `<html><head>
<script src=https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js></script>
<link rel=stylesheet href=https://discordapp.com/assets/c73dece4ea55b592566a83108a4e6ae4.css />
<link rel=stylesheet href=https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/solarized-dark.min.css />
<style>
.developers .documentation .http-req .http-req-title {
    margin: 0px 0 10px!important;
}
.documentation {
  margin: 10px;
  width: 100%;
}
.developers .documentation .http-req {
  margin: 0px !important;
}
.developers {
  top: 0px !important;
}
td { color: hsla(0,0%,100%,.5) !important; }
</style>
</head><body>
<div class=developers><div class=documentation>
<div id=container>${html}</div>
</div></div>
</body></html>`.replace(/\n/g, '');
}
