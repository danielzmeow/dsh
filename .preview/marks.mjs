const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
await page.goto("https://opencode.ai");
await page.waitForLoadState("domcontentloaded");
const html = `
<body style="margin:0;padding:12px;background:#fff;display:flex;gap:20px;align-items:center;font:12px system-ui;color:#333">
<div><img src="https://opencode.ai/favicon-96x96-v3.png" width="64" height="64" style="display:block"><div>official</div></div>
<div><svg width="51" height="64" viewBox="0 0 24 30"><path fill-rule="evenodd" d="M0 6h24v30H0zM6 12h12v18H6z" fill="#111"/><rect x="6" y="18" width="12" height="10" fill="#111"/></svg><div>A wordmark</div></div>
<div><svg width="64" height="64" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M0 0h24v24H0zM6 5h12v15H6z" fill="#111"/><rect x="9" y="8" width="6" height="9" fill="#111"/></svg><div>B favicon</div></div>
<div><svg width="64" height="64" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M0 0h24v24H0zM6 6h12v12H6z" fill="#111"/><rect x="9" y="9" width="6" height="6" fill="#111"/></svg><div>C square</div></div>
<div><svg width="64" height="80" viewBox="0 0 24 30"><path fill-rule="evenodd" d="M0 6h24v30H0zM6 12h12v18H6z" fill="#111"/><rect x="6" y="12" width="12" height="12" fill="#111"/></svg><div>D top</div></div>
</body>`;
await page.evaluate((markup) => { document.body.innerHTML = markup; }, html);
await page.waitForTimeout(700);
await page.screenshot({ path: "/Users/daniel/Developer/DSH/.preview/marks.png" });
console.log("ok");
