# National Defense Society — Website

Static website for the National Defense Society (NDS). No build step, no dependencies.

## Pages

| Route | File |
|---|---|
| `/` | `index.html` |
| `/chapters` | `chapters.html` (interactive chapter map) |
| `/donate` | `donate.html` |
| `/team` | `team.html` |
| `/welcome` | `welcome.html` |
| `/contact` | `contact.html` |
| `/join` | `join.html` (dashboard placeholder) |
| `/terms` | `terms.html` |
| `/privacy` | `privacy.html` |

## Structure

```
index.html, about.html, …   Pages
support.js                  Page runtime (renders each page)
nds-motion.js               Site-wide animations
nds-map.js                  Chapter map (Chapters page)
nds-mobile.js               Mobile layout for screens 900px and narrower
assets/                     Logo and photos
vercel.json                 Clean URLs (/about instead of /about.html)
archive/                    Retired pages (not deployed; see .vercelignore)
```

## Run locally

Serve the folder with any static server (opening files directly with `file://` will not load scripts):

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Framework preset: **Other**. Leave build command and output directory empty.
4. Deploy.

## External services

Loaded at runtime from public CDNs:

- Google Fonts (Oswald, Barlow)
- d3 and topojson (chapter map)
- us-atlas state geometry (chapter map)

## To do

- Replace placeholder chapter site URLs on the Chapters page.
- Replace `[ name surname ]` placeholders on Team and Contact.
- Connect forms (Contact, Donate) to a backend or form service.

## License

Code is released under the MIT License. See `LICENSE`. NDS branding and photographs are excluded.

## Archive

`archive/` holds retired pages: `dispatch.html` (newsletter) and `about.html`. They stay in the repo but are excluded from deploys by `.vercelignore`, and `/dispatch` and `/about` redirect home. To bring one back, move it to the root, remove its redirect from `vercel.json`, and re-add its nav link.
