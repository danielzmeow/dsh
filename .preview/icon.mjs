const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
await page.goto("https://opencode.ai");
await page.waitForLoadState("domcontentloaded");
await page.evaluate(() => {
  document.body.innerHTML = '<body style="margin:0;background:#fff"><img src="https://opencode.ai/favicon-96x96-v3.png" width="96" height="96" style="display:block;margin:8px"><img src="https://opencode.ai/apple-touch-icon-v3.png" width="96" height="96" style="display:block;margin:8px"></body>';
});
await page.waitForTimeout(1200);
await page.screenshot({ path: "/Users/daniel/Developer/DSH/.preview/opencode-icon.png" });
console.log("ok");
