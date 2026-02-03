const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const btn = document.getElementById("helloBtn");
const msg = document.getElementById("helloMsg");

(function () {
  const nav = document.querySelector(".navpill");
  if (!nav) return;

  const links = [...nav.querySelectorAll("a")];

  function normalize(url) {
    return new URL(url, window.location.href);
  }

  function clearActive() {
    links.forEach(a => a.removeAttribute("aria-current"));
  }

  function setActiveByCurrentURL() {
    const here = new URL(window.location.href);

    if (here.hash) {
      const match = links.find(a => {
        const u = normalize(a.getAttribute("href") || "");
        return u.pathname === here.pathname && u.hash === here.hash;
      });
      if (match) {
        clearActive();
        match.setAttribute("aria-current", "page");
        return;
      }
    }

    const matchPage = links.find(a => {
      const u = normalize(a.getAttribute("href") || "");
      return u.pathname === here.pathname && !u.hash;
    });

    if (matchPage) {
      clearActive();
      matchPage.setAttribute("aria-current", "page");
    }
  }
  links.forEach(a => {
    a.addEventListener("click", () => {
      clearActive();
      a.setAttribute("aria-current", "page");
    });
  });

  setActiveByCurrentURL();
})();
