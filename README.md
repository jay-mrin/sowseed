# Christ Garden Library

A static ebook library with free PDF previews, hosted bundle checkout links, and an email request form for individual ebooks. The public page does not require an account or a database.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Current order flow

- The Home form filters ebooks by the selected seed count. At 4 seeds it offers books marked 1, 2, 3, or 4 seeds.
- **Email Book Request** opens the visitor's email app with the chosen book and seed count. It does not collect payment or send an email automatically.
- The four bundle buttons in the Library open their hosted Dodo checkout pages.
- The first ebook in each series has a free PDF preview and download.

The static site does not provide admin accounts, public order history, a blessing wall, or integrated seed checkout. To change the email recipient, edit `src/home-dodo-checkout.js`.

## Files

- `index.html`: page content and book catalog
- `src/app.js`: section navigation and About expansion
- `src/home-dodo-checkout.js`: seed quantity, eligible ebook selection, and email request
- `src/book-preview.js`, `src/home-books-carousel.js`, `src/shop-gallery.js`: library browsing
- `src/styles.css`, `src/legal.css`: page styling

Run `npm run check` to validate the static site.
