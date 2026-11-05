const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
await page.goto("https://opencode.ai");
await page.waitForLoadState("domcontentloaded");
const grid = await page.evaluate(async () => {
  const img = new Image();
  img.src = "https://opencode.ai/favicon-96x96-v3.png";
  await img.decode();
  const c = document.createElement("canvas");
  c.width = 96; c.height = 96;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, 96, 96);
  const d = ctx.getImageData(0, 0, 96, 96).data;
  let out = "";
  for (let y = 0; y < 96; y += 4) {
    for (let x = 0; x < 96; x += 4) {
      const i = (y * 96 + x) * 4;
      const lum = (d[i] + d[i+1] + d[i+2]) / 3;
      out += lum < 90 ? "#" : lum < 200 ? "+" : ".";
    }
    out += "\n";
  }
  return out;
});
console.log(grid);
