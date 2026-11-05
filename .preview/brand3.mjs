const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
const info = await page.evaluate(() => {
  const html = document.documentElement.outerHTML;
  const hits = new Set();
  const re = /[^"'\s()]+\.(svg|zip)/gi;
  let m;
  while ((m = re.exec(html)) !== null) hits.add(m[0]);
  const btns = [...document.querySelectorAll("button, a")].filter((el) => /svg|png/i.test(el.textContent || "")).slice(0, 8)
    .map((el) => ({ tag: el.tagName, text: el.textContent.trim(), attrs: [...el.attributes].map(a => a.name + "=" + a.value).join(" ") }));
  return { hits: [...hits].slice(0, 30), btns };
});
console.log(JSON.stringify(info, null, 1));
