const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
const html = [
  '<body style="margin:0;padding:8px;background:#fff;display:grid;grid-template-columns:1fr 1fr;gap:8px">',
  '<img src="https://opencode.ai/_build/assets/preview-opencode-logo-light-B5i-Y4z2.png" style="width:100%">',
  '<img src="https://opencode.ai/_build/assets/preview-opencode-wordmark-simple-light-JrIbT-1j.png" style="width:100%">',
  '</body>'
].join("");
await page.evaluate((markup) => { document.body.innerHTML = markup; }, html);
await page.waitForTimeout(1500);
await page.screenshot({ path: "/Users/daniel/Developer/DSH/.preview/brand-preview.png" });
console.log("ok");
