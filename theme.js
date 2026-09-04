(function () {
  const themeKey = "la-brioche-theme";
  const isDark = localStorage.getItem(themeKey) === "dark";
  document.body.classList.toggle("dark-mode", isDark);

  const toggle = document.createElement("button");
  toggle.className = `theme-toggle${isDark ? " dark" : ""}`;
  toggle.type = "button";
  toggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode",
  );
  toggle.innerHTML =
    '<span class="sun-icon" aria-hidden="true">&#9733;</span><span class="moon-icon" aria-hidden="true">&#9790;</span>';

  const nav = document.querySelector(".navbar");
  const actions = nav && nav.querySelector(".nav-actions");
  if (actions) {
    actions.append(toggle);
  } else if (nav) {
    nav.append(toggle);
  }

  toggle.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark-mode");
    toggle.classList.toggle("dark", dark);
    toggle.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode",
    );
    localStorage.setItem(themeKey, dark ? "dark" : "light");
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== themeKey) return;
    const dark = event.newValue === "dark";
    document.body.classList.toggle("dark-mode", dark);
    toggle.classList.toggle("dark", dark);
    toggle.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode",
    );
  });
})();
