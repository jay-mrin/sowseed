# Christ Garden Library

A static ebook library with free PDF previews and hosted Dodo Payments checkout links. The public page does not require an account or a database.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Current order flow

- The Home form filters ebooks by the selected seed count. At 4 seeds it offers books marked 1, 2, 3, or 4 seeds.
- **Continue to Dodo Payment** opens the Seed product's hosted checkout with the selected seed count as `quantity`. The visitor's email and chosen book are passed through the payment link.
- The four bundle buttons in the Library open their hosted Dodo checkout pages.
- The first ebook in each series has a free PDF preview and download.

The static site does not provide admin accounts, public order history, a blessing wall, or automatic ebook delivery. Fulfill paid orders from Dodo Payments. The final price must be checked on Dodo's checkout page; the website's displayed Seed value assumes $11 per Seed.

## Files

- `index.html`: page content and book catalog
- `src/app.js`: section navigation and About expansion
- `src/home-dodo-checkout.js`: seed quantity, eligible ebook selection, and hosted Seed payment link
- `src/book-preview.js`, `src/home-books-carousel.js`, `src/shop-gallery.js`: library browsing
- `src/styles.css`, `src/legal.css`: page styling

Run `npm run check` to validate the static site.
