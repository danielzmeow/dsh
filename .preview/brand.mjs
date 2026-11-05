const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
await page.goto("https://opencode.ai/brand");
await page.waitForLoadState("domcontentloaded");
await page.waitForTimeout(1200);
const info = await page.evaluate(() => {
  const out = { title: document.title, svgs: [], links: [], imgs: [], text: document.body.innerText.slice(0, 1200) };
  document.querySelectorAll("svg").forEach((s) => out.svgs.push({ vb: s.getAttribute("viewBox"), html: s.outerHTML.slice(0, 1500) }));
  document.querySelectorAll("a[href]").forEach((a) => { if (/\.(svg|zip|png|pdf)$/i.test(a.getAttribute("href"))) out.links.push(a.href); });
  document.querySelectorAll("img").forEach((i) => { if (i.src) out.imgs.push(i.src); });
  return out;
});
console.log(JSON.stringify(info, null, 1).slice(0, 7000));
