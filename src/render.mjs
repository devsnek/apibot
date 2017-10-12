import puppeteer from 'puppeteer';
import _minify from 'html-minifier';
const minify = _minify.minify;

const debug = !!process.env.DEBUG;

const width = 850;

export default async function render(html) {
  const browser = await puppeteer.launch({ width, headless: !debug });
  const page = await browser.newPage();
  await Promise.all([
    page.setContent(build(html)),
    page.waitForNavigation({ waitUntil: 'networkidle' }),
  ]);
  const height = await page.$eval('#container', (container) => {
    container.firstChild.style.margin = '0px';
    return window.getComputedStyle(container).height;
  });
  await page.setViewport({
    width,
    height: parseInt(height) + 25,
  });
  const buf = await page.screenshot();
  if (!debug) await browser.close();
  return buf;
}

const template = minify(`<html><head>
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
  background: #2A2D32;
}
td {
  color: hsla(0,0%,100%,.5) !important;
}
</style>
</head><body>
<div class=developers><div class=documentation>
<div id=container>{{{HTML}}}</div>
</div></div>
</body></html>`);

function build(html) {
  return template.replace('{{{HTML}}}', html);
}
