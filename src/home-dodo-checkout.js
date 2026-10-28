(() => {
  const form = document.querySelector("#dodoCheckoutForm");
  if (!form) return;

  const countOutput = document.querySelector("#dodoSeedCount");
  const totalOutput = document.querySelector("#dodoTotalAmount");
  const totalSeedsOutput = document.querySelector("#dodoTotalSeeds");
  const bookChoice = document.querySelector("#dodoBookChoice");
  const emailInput = document.querySelector("#dodoCustomerEmail");
  const nameInput = document.querySelector("#dodoCustomerName");
  const seedPaymentLink = "https://checkout.dodopayments.com/buy/pdt_0Nq0zMUDbiKtD9EKOLkMD?quantity=1";
  const books = [...document.querySelectorAll("#libraryView .shop-book")].map((book) => ({
    title: book.querySelector("h4")?.textContent.trim() || "",
    minimumSeeds: Number.parseInt(book.querySelector(".shop-seed-cost")?.textContent.match(/\d+/)?.[0] || "", 10),
  })).filter((book) => book.title && Number.isSafeInteger(book.minimumSeeds));
  let seedCount = 1;

  function makeOption(label, value) {
    const option = document.createElement("option");
    option.textContent = label;
    option.value = value;
    return option;
  }

  function update() {
    countOutput.value = String(seedCount);
    totalOutput.textContent = new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD",
    }).format(seedCount * 11);
    totalSeedsOutput.textContent = `(${seedCount} ${seedCount === 1 ? "Seed" : "Seeds"})`;

    const previous = bookChoice.value;
    bookChoice.replaceChildren(makeOption("Choose an ebook for your seeds", ""));
    for (const book of books.filter((item) => item.minimumSeeds <= seedCount)) {
      bookChoice.add(makeOption(`${book.title} (${book.minimumSeeds}+ ${book.minimumSeeds === 1 ? "Seed" : "Seeds"})`, book.title));
    }
    if ([...bookChoice.options].some((option) => option.value === previous)) bookChoice.value = previous;
  }

  document.querySelector("#dodoDecreaseSeeds")?.addEventListener("click", () => {
    seedCount = Math.max(1, seedCount - 1);
    update();
  });
  document.querySelector("#dodoIncreaseSeeds")?.addEventListener("click", () => {
    seedCount = Math.min(999, seedCount + 1);
    update();
  });

  window.addEventListener("library:choose-book", (event) => {
    seedCount = Math.max(seedCount, event.detail.minimumSeeds);
    update();
    bookChoice.value = event.detail.title;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!emailInput.reportValidity() || !bookChoice.reportValidity()) return;
    const checkoutUrl = new URL(seedPaymentLink);
    checkoutUrl.searchParams.set("quantity", String(seedCount));
    checkoutUrl.searchParams.set("email", emailInput.value.trim());
    checkoutUrl.searchParams.set("metadata_bookTitle", bookChoice.value);
    checkoutUrl.searchParams.set("metadata_seedCount", String(seedCount));
    if (nameInput.value.trim()) checkoutUrl.searchParams.set("fullName", nameInput.value.trim());
    window.location.assign(checkoutUrl.toString());
  });

  update();
})();
