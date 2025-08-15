document.addEventListener("DOMContentLoaded", () => {
  console.debug("[Daliant] hero_fit_mode.js loaded");
  const isHome =
    location.pathname === "/" ||
    location.pathname.endsWith("/index.html") ||
    location.pathname === "/Daliant_Lighting/";
  if (!isHome) return;

  const candidates = [
    "[data-hero]", ".home-hero", ".hero", "section.hero",
    ".hero-banner", ".banner-hero", "header.hero", ".masthead"
  ];

  let hero = null;
  for (const sel of candidates) { hero = document.querySelector(sel); if (hero) break; }
  if (!hero) {
    const h1 = document.querySelector("h1");
    hero = h1 ? h1.closest("section, header, div") : null;
  }
  if (!hero) return;

  hero.classList.add("hero-fit-contain");

  const cs = getComputedStyle(hero);
  if (cs.backgroundImage && cs.backgroundImage !== "none") {
    hero.style.backgroundSize = "contain";
    hero.style.backgroundPosition = "50% 50%";
    hero.style.backgroundRepeat = "no-repeat";
    if (!cs.backgroundColor || cs.backgroundColor === "rgba(0, 0, 0, 0)") {
      hero.style.backgroundColor = "var(--hero-bg-color, #0b0b0b)";
    }
  }

  const img = hero.querySelector("img");
  if (img) {
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    img.style.objectPosition = "50% 50%";
    if (img.parentElement && getComputedStyle(img.parentElement).height === "0px") {
      img.parentElement.style.height = "100%";
    }
  }
});
