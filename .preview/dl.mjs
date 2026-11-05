const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
await page.goto("https://opencode.ai/brand");
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(1000);
await page.evaluate(() => {
  window.__blobs = [];
  window.__hrefs = [];
  const origCreate = URL.createObjectURL;
  URL.createObjectURL = function (blob) { window.__blobs.push(blob); return origCreate.call(URL, blob); };
  const origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { window.__hrefs.push(this.href); return origClick.call(this); };
});
const buttons = page.locator ? null : null;
const count = await page.evaluate(() => {
  const btns = [...document.querySelectorAll("button")].filter((b) => b.textContent.trim() === "SVG");
  window.__svgButtons = btns;
  return btns.length;
});
for (let i = 0; i < count; i += 1) {
  await page.evaluate((idx) => { window.__svgButtons[idx].click(); }, i);
  await page.waitForTimeout(350);
}
const result = await page.evaluate(async () => {
  const texts = [];
  for (const blob of window.__blobs) texts.push(await blob.text());
  return { blobs: texts.map((t) => t.length + " :: " + t.slice(0, 120)), hrefs: window.__hrefs };
});
console.log(JSON.stringify({ count, ...result }, null, 1).slice(0, 4000));
