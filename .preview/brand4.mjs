const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
const info = await page.evaluate(() => {
  return [...document.querySelectorAll("img")].map((img) => ({
    alt: img.alt,
    w: img.naturalWidth,
    h: img.naturalHeight,
    src: img.src.slice(0, 120),
    len: img.src.length
  }));
});
console.log(JSON.stringify(info, null, 1));
