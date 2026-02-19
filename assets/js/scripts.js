const toggleTheme = document.getElementById("toggleTheme");
const rootHtml = document.documentElement;
const accordionHeaders = document.querySelectorAll(".accordion__header");
const menuLinks = document.querySelectorAll(".menu__link");

// 🔹 Ao carregar a página, verifica se existe tema salvo
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  rootHtml.setAttribute("data-theme", savedTheme);

  if (toggleTheme) {
    if (savedTheme === "light") {
      toggleTheme.classList.add("bi-sun");
      toggleTheme.classList.remove("bi-moon-stars");
    } else {
      toggleTheme.classList.add("bi-moon-stars");
      toggleTheme.classList.remove("bi-sun");
    }
  }
}

function changeTheme() {
  const currentTheme = rootHtml.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  rootHtml.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  if (toggleTheme) {
    toggleTheme.classList.toggle("bi-sun");
    toggleTheme.classList.toggle("bi-moon-stars");
  }
}

if (toggleTheme) {
  toggleTheme.addEventListener("click", changeTheme);
  toggleTheme.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      changeTheme();
    }
  });
}

// Accordion
accordionHeaders.forEach((header, index) => {
  const accordionItem = header.parentElement;
  const body = accordionItem.querySelector(".accordion__body");
  if (body && !body.id) body.id = `accordion-panel-${index}`;
  header.setAttribute("aria-expanded", accordionItem.classList.contains("active"));
  if (body?.id) header.setAttribute("aria-controls", body.id);

  header.addEventListener("click", () => {
    accordionItem.classList.toggle("active");
    const isExpanded = accordionItem.classList.contains("active");
    header.setAttribute("aria-expanded", isExpanded);
  });
});

// Menu links
menuLinks.forEach(item => {
  item.addEventListener("click", () => {
    menuLinks.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});

// Back to top
const backToTopBtn = document.getElementById("backToTop");
if (backToTopBtn) {
  window.addEventListener("scroll", () => {
    backToTopBtn.classList.toggle("visible", window.scrollY > 400);
  });
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
