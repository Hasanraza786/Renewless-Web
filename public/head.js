// Loaded in <head> on every page (the CSP blocks inline scripts).
// Firebase also serves the site on *.web.app; send those visitors to the real domain.
if (/\.(web\.app|firebaseapp\.com)$/.test(location.hostname)) location.replace('https://renewlessapp.com' + location.pathname + location.search + location.hash)
// Lets styles.css hide reveal animations' start state only when JS runs.
document.documentElement.classList.add('js')
