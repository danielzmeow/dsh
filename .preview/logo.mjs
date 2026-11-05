const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
await page.goto("https://opencode.ai");
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(1500);
console.log(JSON.stringify(await page.evaluate(() => {
  const out = { title: document.title, svgs: [], imgs: [], links: [] };
  document.querySelectorAll("svg").forEach((s, i) => {
    if (i < 6) out.svgs.push(s.outerHTML.slice(0, 700));
  });
  document.querySelectorAll("img").forEach((img) => { if (img.src) out.imgs.push(img.src); });
  document.querySelectorAll('link[rel*="icon"]').forEach((l) => out.links.push(l.href));
  return out;
}, null), null, 1));
