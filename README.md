# Renewless web

Static website: plain HTML and CSS, no build step. Everything served lives in `public/`.

| Path | File |
|---|---|
| `/` | `public/index.html` (landing) |
| `/privacy/` | `public/privacy/index.html` |
| `/terms/` | `public/terms/index.html` |
| `/delete-account/` | `public/delete-account/index.html` (Google Play deletion page) |
| `/support/` | `public/support/index.html` |
| `/security/` | `public/security/index.html` |
| `/get/` | `public/get/index.html` (QR target: sends iPhone to the App Store, Android to Google Play) |

Shared styles: `public/styles.css` (tokens from `docs/design-system.md`). Header and footer are repeated in each page; change them all together.

Run locally:

```sh
python3 -m http.server 8080 -d public
```

Then open http://localhost:8080. Live domain: https://renewlessapp.com. Deploy by uploading `public/` to any static host.

Before publishing (once the app is live in both stores):

- The store badges in `public/index.html` (hero and final CTA) say "Coming soon" and are not links, and the QR is commented out. At launch, follow the comment at the top of `public/index.html`, and replace `APP_STORE_ID` in `public/get/index.html` and `public/get/get.js` with the numeric Apple ID (App Store Connect > App Information).
- Swap the two hand-made store badges in `public/index.html` (hero and final CTA) for the official artwork. Apple and Google both require it: App Store badge from https://tools.applemarketingtools.com, Google Play badge from https://play.google.com/intl/en_us/badges/.
- After adding a page, add it to `public/sitemap.xml`. If the domain changes, regenerate `public/qr.svg` (`npx qrcode@1.5.4 -t svg -e M -q 0 -d '#151719' -l '#ffffff' -o public/qr.svg https://<domain>/get/`) and update the canonical, og and sitemap URLs.

`docs` links to `../Renewless/docs`, the shared product docs.
