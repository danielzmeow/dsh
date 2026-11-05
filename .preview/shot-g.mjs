const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride", { width: 760, height: 340, deviceScaleFactor: 2, mobile: false });
await page.goto("file:///Users/daniel/Developer/DSH/.preview/mark.html");
await page.waitForTimeout(300);
await page.screenshot({ path: "/Users/daniel/Developer/DSH/.preview/mark.png" });
await page.cdp("Emulation.clearDeviceMetricsOverride", {});
