(() => {
  const views = [...document.querySelectorAll("[data-section-view]")];
  const tabs = [...document.querySelectorAll("[data-section-tab]")];
  const sectionForHash = {
    "#library": "libraryView",
    "#about": "aboutView",
  };

  function showSection() {
    const activeId = sectionForHash[window.location.hash] || "homeView";
    for (const view of views) {
      const active = view.id === activeId;
      view.hidden = !active;
      view.classList.toggle("is-active", active);
    }
    for (const tab of tabs) {
      const active = tab.dataset.sectionTab === activeId;
      tab.classList.toggle("active", active);
      if (active) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    }
  }

  document.querySelectorAll("[data-toggle-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const content = document.getElementById(button.dataset.toggleTarget);
      if (!content) return;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.textContent = expanded ? "Show more" : "Show less";
      content.classList.toggle("is-expanded", !expanded);
    });
  });

  window.addEventListener("hashchange", showSection);
  showSection();
  document.body.classList.remove("app-loading");
  document.body.classList.add("app-ready");
  document.querySelector("#appLoader")?.remove();
})();
