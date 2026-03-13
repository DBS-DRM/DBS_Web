# DreamBigStudio Website

Official website for **DreamBigStudio** — Architecture & Interior Design, based in Timișoara, Romania.

## Project Structure

```
dreambigstudio/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styles
├── js/
│   └── main.js         # Scroll animations, form handling
├── assets/
│   └── logo.png        # Company logo
└── README.md
```

## Getting Started

This is a static website — no build tools required.

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dreambigstudio.git
   ```
2. Open `index.html` in your browser, or serve with any static server:
   ```bash
   npx serve .
   ```

## Customisation

### Adding project photos
Replace the SVG placeholders in `index.html` with real `<img>` tags:
```html
<div class="proj-thumb proj-thumb--1">
  <img src="assets/projects/house1.jpg" alt="House 1 — Arad" />
</div>
```
Add your images to the `assets/` folder.

### Contact form
The form currently shows a success message on submit. To wire it up to a real email service, uncomment and configure the Formspree snippet in `js/main.js`:
```js
fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, message })
});
```
Sign up free at [formspree.io](https://formspree.io).

## Deployment

### GitHub Pages (free)
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Your site will be live at `https://YOUR_USERNAME.github.io/dreambigstudio`

### Custom domain
Add a `CNAME` file to the repo root with your domain:
```
dreambigstudio.ro
```
Then configure your DNS provider accordingly.

---

© 2026 DreamBigStudio. All rights reserved.
