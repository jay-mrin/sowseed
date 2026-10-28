document.querySelectorAll(".shop-get-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.closest(".shop-book")?.dataset.bookNumber === "1") return;
    const status = button.closest(".shop-book").querySelector(".shop-get-status");
    if (!status.hidden) {
      status.hidden = true;
      return;
    }
    status.textContent = button.closest(".shop-book")?.dataset.bookNumber === "1"
      ? "This first ebook in the series is free. Open its cover to read the preview."
      : "Choose the required number of Seeds on Home, select this ebook, and continue to Dodo Payments.";
    status.hidden = false;
  });
});
