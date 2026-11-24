# slipixTrollPix

Static SlipixTrollPix build-card gallery. The local League of Legends calculator is used to create build cards.

Open `index.html` to view the public build gallery. It loads champion and item images from Riot's public Data Dragon CDN, so an internet connection is required.

GitHub Pages displays only the builds listed in `js/static-builds.js`. The local creator (`html/statcheck.html`) generates a line to paste into that array. Creator files are ignored by Git and are not deployed; after adding a build, publish the updated `static-builds.js`.

The site has no password gate because a password implemented in static HTML/JavaScript would not protect the page or its data.

Rune pages follow the League of Legends layout: a primary path with its keystone and three minor runes, a secondary path with two runes from different rows, and three stat shards.