const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
const mark = '<svg viewBox="0 0 24 30" width="11" height="14" aria-hidden="true"><path fill="#1b1b1b" fill-rule="evenodd" clip-rule="evenodd" d="M0 0h24v30H0zM6 6h12v18H6z"></path><rect x="6" y="12" width="12" height="12" fill="#1b1b1b" opacity="0.45"></rect></svg>';
const big = '<svg viewBox="0 0 24 30" width="110" height="140" aria-hidden="true"><path fill="#1b1b1b" fill-rule="evenodd" clip-rule="evenodd" d="M0 0h24v30H0zM6 6h12v18H6z"></path><rect x="6" y="12" width="12" height="12" fill="#1b1b1b" opacity="0.45"></rect></svg>';
const html = `<body style="margin:0;padding:14px;background:#fff;display:flex;gap:26px;align-items:center;font:13px system-ui;color:#333">
<div style="display:flex;align-items:center;gap:6px;font-size:14px;font-weight:500">${mark}<span>OpenCode Go</span></div>
<div style="display:flex;align-items:center;gap:10px">${big}</div>
<div style="display:flex;align-items:center;gap:10px"><img src="https://opencode.ai/_build/assets/preview-opencode-logo-light-B5i-Y4z2.png" style="height:140px"></div>
</body>`;
await page.evaluate((markup) => { document.body.innerHTML = markup; }, html);
await page.waitForTimeout(1600);
await page.screenshot({ path: "/Users/daniel/Developer/DSH/.preview/mark2.png" });
console.log("ok");
