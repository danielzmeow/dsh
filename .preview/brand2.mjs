const task = await taskSpace("dsh-quota-design-research");
const page = task.page("p1");
const info = await page.evaluate(() => {
  const links = [];
  document.querySelectorAll("a[href]").forEach((a) => links.push(a.getAttribute("href") + " | " + (a.textContent || "").trim().slice(0, 40)));
  return { text: document.body.innerText.slice(0, 2500), links: links.slice(-40) };
});
console.log(JSON.stringify(info, null, 1));
