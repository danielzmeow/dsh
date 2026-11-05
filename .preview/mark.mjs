const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
await page.goto("https://opencode.ai");
await page.waitForLoadState("domcontentloaded");
const html = [
  '<body style="margin:0;padding:12px;background:#fff;display:flex;gap:16px;align-items:flex-start">',
  '<img src="https://opencode.ai/favicon-96x96-v3.png" width="96" height="96">',
  '<svg width="96" height="120" viewBox="0 0 24 30">',
  '<path d="M18 30H6V18H18V30Z" fill="#CFCECD"/>',
  '<path d="M18 12H6V30H18V12ZM24 36H0V6H24V36Z" fill="#656363"/>',
  '</svg></body>'
].join("");
await page.evaluate((markup) => { document.body.innerHTML = markup; }, html);
await page.waitForTimeout(900);
await page.screenshot({ path: "/Users/daniel/Developer/DSH/.preview/mark.png" });
console.log("ok");
