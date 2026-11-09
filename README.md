# Renewless web

Static website: plain HTML and CSS, no build step. Everything served lives in `public/`.

| Path | File |
|---|---|
| `/` | `public/index.html` (landing) |
| `/privacy/` | `public/privacy/index.html` |
| `/terms/` | `public/terms/index.html` |
| `/delete-account/` | `public/delete-account/index.html` (Google Play deletion page) |
| `/support/` | `public/support/index.html` |

Shared styles: `public/styles.css` (tokens from `docs/design-system.md`). Header and footer are repeated in each page; change all five together.

Run locally:

```sh
python3 -m http.server 8080 -d public
```

Then open http://localhost:8080. Deploy by uploading `public/` to any static host.

Before publishing (once the app is live in both stores):

- Replace `APP_STORE_ID` in `public/index.html` with the numeric Apple ID (App Store Connect > App Information). Google Play already links to `com.renewless`.
- Swap the two hand-made store badges in `public/index.html` (hero and final CTA) for the official artwork. Apple and Google both require it: App Store badge from https://tools.applemarketingtools.com, Google Play badge from https://play.google.com/intl/en_us/badges/.
- Make `og:image` absolute (`https://<domain>/og.png`) and add `sitemap.xml`.
- Add the QR code (desktop only) pointing to `https://<domain>/get/`, a page that sends iPhone to the App Store and Android to Google Play.

`docs` links to `../Renewless/docs`, the shared product docs.
