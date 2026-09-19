# ENE-CRG Premium

Website for the ENE Control Research Group, in English and Thai. Plain HTML, CSS and JavaScript: no build step, no frameworks, no third-party requests. It runs on GitHub Pages as it is.

## Publish on GitHub Pages

1. Create a repository on GitHub and upload everything in this folder, keeping the folder structure (including the `th` folder).
2. Open the repository's **Settings, then Pages**. Under "Build and deployment" choose **Deploy from a branch**, select your main branch and the **/ (root)** folder, and save.
3. After a minute the site is live at `https://<your-user>.github.io/<repository>/`, and the Thai version at `.../th/`.
4. Replace `assets/video/hero-video.mp4` with your own video (see "Hero video" below).
5. Once you know the address, run the search-engine tool (see "English and Thai, and search engines").

## Preview on your computer

The pages load their content from the `data/` folder, and browsers block that when you open the files directly. Run a small web server inside this folder:

```
python3 -m http.server
```

then open http://localhost:8000 (English) or http://localhost:8000/th/ (Thai).

## English and Thai

The site exists as two complete versions. English pages are in the main folder, Thai pages in the `th` folder, with the same file names:

| English | Thai |
|---|---|
| `index.html` | `th/index.html` |
| `publications.html` | `th/publications.html` |
| `team.html` | `th/team.html` |
| `students.html` | `th/students.html` |
| `contact.html` | `th/contact.html` |
| `paper.html` | `th/paper.html` (one paper; opened from the lists) |

A switch in the header (**ไทย** on English pages, **EN** on Thai pages) opens the same page in the other language and keeps any filters and section in the address. The Thai pages are ordinary static HTML, so search engines and visitors without JavaScript get Thai text too.

- **Editing text.** Change it in both versions of the page: the English wording in `index.html`, the Thai wording in `th/index.html`. Text that the scripts create (filter buttons, counts, chart labels, error messages) is in `STRINGS` at the top of `js/main.js`, in English and in Thai.
- **The Thai wording is a translation.** Please have a Thai reader check it, especially the technical terms in `data/research-areas.json`. The department, faculty and university names, the address and the phone number come from the department's own Thai pages.
- **Data files.** Text in `data/research-areas.json` is written as `{ "en": "...", "th": "..." }`. In `data/graduates.json` the fields `name`, `note`, `thesis`, `position` and `organization` may be a plain string (shown in both languages) or the same `{ "en": ..., "th": ... }` form. That is how to add a Thai spelling of a student's name, for example `"name": { "en": "Mr. First Last", "th": "นาย ..." }`. Names are shown as they are written in your Word files until you do.
- **Publications** (titles, authors, journals) are shown in English on both versions, which is the usual form of a citation. Everything around them is translated.
- **Fonts.** Thai text uses Noto Sans Thai and Noto Serif Thai (SIL Open Font License) from `assets/fonts`. Their files download only when a page shows Thai letters. Thai text gets a little more line height and size than English, set at the end of `css/style.css`.
- **Adding a page.** Copy an English page to a new name, copy the Thai page to `th/` with the same name, and add the file name to the switch in both headers.

### English and Thai, and search engines

Search engines should be told that each page exists in both languages, so that Thai searchers get the Thai page and everyone else the English one. That needs the full web address, which you only know after publishing. Then run (Python 3, nothing else to install):

```
python3 tools/add_seo.py https://your-user.github.io/your-repository/
```

It adds a canonical link and the English/Thai alternates (`hreflang`) to the `<head>` of all ten pages and writes `sitemap.xml`. If the site is at the root of its own domain it also writes `robots.txt`. Run it again with another address to change it. Then submit `sitemap.xml` in Google Search Console (and Bing Webmaster Tools).

## Paper pages

Clicking a paper's title in the publications list (or in "Selected publications" on the home page) opens that paper's own page, `paper.html?id=...`, before the visitor goes to the publisher. The page shows the title, authors, journal or conference, themes, year, type, citation count, the abstract and keywords (when the data has them), a **Read at the publisher** button (the DOI), a Scopus link, a PDF link (when set), a Copy BibTeX button and three related papers from the same theme. The DOI button in the list still goes straight to the publisher for anyone in a hurry. "← Publications" returns to the list with its filters.

- **Abstracts and keywords** come from `data/publications.json` (`abstract`, `keywords`). A Scopus export only has them if you tick **Abstract & keywords** when you export (Scopus, Export, CSV, under "Choose the information to be exported"). Re-export with that box ticked and run `python3 tools/scopus_to_json.py <file>.csv` again: the abstracts are added and everything you edited by hand is kept. You can also paste an abstract into one paper by hand. Without an abstract the page says it is available on the publisher's page.
- An abstract or keyword list may be plain text or `{ "en": "...", "th": "..." }` if you want a Thai translation on the Thai pages.
- The page reads `?id=` from the address, and `id` is the paper's `id` in `publications.json`. If a paper is removed from the file, its old links show a "Paper not found" message with a link to the list.

## Logo and photo

- **Logo:** `assets/logos/kmutt-ene.png`, the KMUTT and ENE logo (a transparent PNG). It sits on a white plate, because its grey parts disappear on the dark header. It shows in the header from 1100 px wide, above the title on the home page on narrower screens, and in the footer. It links to the department website. To change it, replace the file (same name, ideally the same proportions; the size is set in the `width` and `height` of the `<img>` in the pages).
- **PI portrait:** `assets/people/wudhichai-assawinchaichote.jpg` on the Team page, cropped to the 4:5 frame.

## What is real and what is still sample content

**Loaded from your files and the KMUTT websites**

- **Publications:** 64 records from your Scopus export of 15 Sep 2026 (`data/publications.json`).
- **Logo and PI portrait:** from the files you supplied.
- **Ph.D. candidates:** the five in your Word file, in `students.html` and `th/students.html`, with photos in `assets/people`.
- **Alumni:** the seven Ph.D. graduates and 33 M.S. graduates from your Word files (`data/graduates.json`).
- **Principal investigator and contact details:** Assoc. Prof. Dr. Wudhichai Assawinchaichote, his email address, the department and university names, the address and the phone number, taken on 19 Sep 2026 from the ENE and KMUTT websites (`team.html`, `contact.html`, and the footer of every page, in both languages). To change any of them, search the folder for `wudhichai.asa@kmutt.ac.th`, `126 Pracha-Uthit Road` and `126 ถนนประชาอุทิศ`. The Google Scholar link on the Team page is the address you supplied.
- **Thai version:** every page, the messages made by the scripts, and the research theme descriptions.

**Still sample content, to replace**

| What | Where |
|---|---|
| Researchers and collaborators | `team.html` and `th/team.html` |
| "How to join" text | `students.html` and `th/students.html` (the two admissions links are the university's; the rest is generic) |
| Hero video | `assets/video/hero-video.mp4` |
| Research theme descriptions | `data/research-areas.json` (English written from your paper titles, Thai translated; edit both) |

An amber **Sample content** notice shows on every page until you open `js/main.js` and set `sampleContent: false` near the top. To find what is left, search the whole folder for: `R. Researcher`, `M. Engineer`, `T. Fellow`, `University A`, `Research Institute B`, `Industry Partner C`, `University D` (the Thai page has `มหาวิทยาลัย A`, `สถาบันวิจัย B`, `พันธมิตรภาคอุตสาหกรรม C` and `มหาวิทยาลัย D`).

## Updating the publications from Scopus

1. In Scopus, select your documents and choose **Export, CSV**. Include at least the citation information (authors, title, year, source title, volume, issue, pages, cited by) and the bibliographical information (DOI, document type, publication stage). Abstract and author keywords are optional, but tick **Abstract & keywords** if you want abstracts on the paper pages.
2. Put the file in this folder and run (Python 3, nothing else to install):

```
python3 tools/scopus_to_json.py scopus_export.csv
```

3. Upload the changed `data/publications.json`. Both languages use it.

Papers that are already listed keep what you edited by hand (`areas`, `featured`, `pdf`, `url`, `abstract`, `keywords`); their numbers are refreshed from the export, and new papers are added. Each paper is filed under research themes by keyword rules at the top of the script, matched against the title. Edit the rules, then run again with `--reclassify` to refile everything. Papers that match no rule appear under "All themes" only.

## Editing the data files

**`data/publications.json`**: one object per publication. Only `id`, `year`, `type`, `title`, `authors` and `venue` are needed; leave out or empty whatever you don't have.

```json
{
  "id": "s2-85128267082",
  "year": 2022,
  "type": "journal",
  "areas": ["intelligent-control"],
  "title": "Paper title",
  "authors": ["W. Assawinchaichote", "C. Angeli"],
  "venue": "IEEE Access",
  "volume": "10",
  "issue": "",
  "pages": "40818–40828",
  "article": "",
  "status": "",
  "citations": 24,
  "doi": "10.1109/ACCESS.2022.3167026",
  "url": "",
  "scopus": "https://www.scopus.com/pages/publications/85128267082",
  "pdf": "",
  "abstract": "",
  "keywords": [],
  "featured": true
}
```

- `type` is `journal`, `conference`, `preprint` or `book-chapter` (other words work too and get their own filter button). `areas` lists ids from `research-areas.json`.
- A DOI button, a PDF button (`pdf` can be a link or a file such as `assets/papers/my-paper.pdf`) and an Abstract button appear when those fields are filled.
- The title opens the paper page (see "Paper pages"). The "Cited" badge appears when `citations` is 1 or more, and links to the Scopus record when `scopus` is set. `status` is for things like "In press". `article` is the article number, shown when there is no page range.
- `featured: true` puts a paper in "Selected publications" on the home page. If none is flagged, the three most recent are shown.

**`data/graduates.json`**: one object per degree. `name` is shown as written (with Mr., Ms. or Dr. if you like), `degree` can be any label (Ph.D., M.S., ...; the Thai pages show the common ones in Thai). Optional fields:

- `year`: entries without a year are listed first, under "Recent". Add a year to move one into its year.
- `photo`: a path such as `assets/people/first-last.jpg`. Entries with a photo appear as cards; the others as compact lines.
- `note` (for example "Co-advised"), `thesis`, `position`, `organization`, `url`. Text fields may be `{ "en": ..., "th": ... }`.
- `sector` (`academia`, `industry`, `government` or `study`): once people have a sector, a "where graduates go next" bar appears.

The numbers on the home page and on the Students page count degrees, so someone with both an M.S. and a Ph.D. from the group counts once for each.

**Photos:** use square JPEGs, at least 256 × 256 pixels, in `assets/people`. The current Ph.D. candidates are written directly in `students.html` and `th/students.html`; copy one of the existing cards to add another. Photos of people are published with the site, so make sure everyone shown agrees. To remove one, delete the `photo` line (or the `<img>` in the two students pages).

**`data/research-areas.json`**: `id`, `title`, `summary`, `keywords` (each as `{ "en": ..., "th": ... }`), `hue` (a colour angle from 0 to 360 used for dots, tags and diagram accents) and `diagram`. The diagram can be `intelligent`, `cps` or `networked`, or a path to your own image such as `assets/images/my-diagram.svg`.

After editing, keep the JSON valid (matching quotes, no trailing commas). If a page shows "Couldn't load..." (Thai: "ไม่สามารถโหลด..."), the JSON has a typo or you are opening the files without a server.

## Hero video

The included `hero-video.mp4` is a generated placeholder: a simulated control loop tracking a reference signal. Replace it with your own footage (dark footage works best, because the text sits on top). Keep it under about 3 MB, no audio. With ffmpeg:

```
ffmpeg -i input.mp4 -vf "scale=1280:-2" -an -c:v libx264 -crf 28 -preset slow -movflags +faststart assets/video/hero-video.mp4
ffmpeg -ss 2 -i input.mp4 -frames:v 1 -vf "scale=1280:-2" -q:v 3 assets/images/hero-poster.jpg
```

The poster is shown while the video loads, and to visitors who ask their device for reduced motion or have data saver on.

## Look and feel

Colours, spacing and type live in section 2 ("Tokens") of `css/style.css`, for both the dark and the light theme. The amber accent (`--setpoint`) is used only for things that are selected or are a reference; the cyan (`--trace`) is the system response. Fonts are in `assets/fonts` and declared in section 1.

## Files

```
index.html ... contact.html   The five pages in English, plus paper.html (one paper)
th/                   The same pages in Thai
css/                  style.css (all styling), animations.css, responsive.css
js/                   main.js (theme, navigation, home, alumni, contact, the STRINGS for both languages)
                      publications.js (dashboard), counters.js, particles.js (hero network)
data/                 publications.json, graduates.json, research-areas.json
tools/                scopus_to_json.py (refreshes publications.json from a Scopus export)
                      add_seo.py (search-engine language tags and sitemap)
assets/               video/, images/, people/, logos/ (incl. kmutt-ene.png), icons/, fonts/
```

`.nojekyll` (a hidden file) tells GitHub Pages to publish the folder as it is.

## Notes

- **Citation counts** come from Scopus and are as of the date shown under the page title on the publications page.
- **Accessibility:** keyboard operable, skip link, visible focus, light and dark themes, every page declares its language (and English passages on Thai pages are marked), and all motion is switched off for visitors who prefer reduced motion. An automated axe-core audit reported no violations on any of the ten pages in both themes. Run it again after you edit.
- **Contact form:** it opens the visitor's own email app with the message filled in (Thai subject line on the Thai page). Nothing is sent from the page, so no server or account is needed.
- **Privacy and speed:** no analytics, no tracking, no requests to other sites. Fonts are served from this folder.

## Licenses

- Code, logo, generated video and sample text: MIT, see `LICENSE`.
- The names, photos and publication records in `data/`, `assets/people`, `students.html` and `th/students.html` are the group's own content and are not covered by the MIT license.
- Fonts Bricolage Grotesque, Source Serif 4, Noto Sans Thai and Noto Serif Thai: SIL Open Font License 1.1, see `assets/fonts/OFL-*.txt`.
