// Target of the landing-page QR code. Before publishing: replace APP_STORE_ID with the numeric Apple ID.
const ua = navigator.userAgent
const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
if (ios) location.replace('https://apps.apple.com/app/idAPP_STORE_ID')
else if (/Android/.test(ua)) location.replace('https://play.google.com/store/apps/details?id=com.renewless')
