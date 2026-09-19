# ENE-CRG Premium

Website for the ENE Control Research Group. Plain HTML, CSS and JavaScript: no build step, no frameworks, no third-party requests. It runs on GitHub Pages as it is.

## Publish on GitHub Pages

1. Create a repository on GitHub and upload everything in this folder, keeping the folder structure.
2. Open the repository's **Settings, then Pages**. Under "Build and deployment" choose **Deploy from a branch**, select your main branch and the **/ (root)** folder, and save.
3. After a minute the site is live at `https://<your-user>.github.io/<repository>/`.
4. Replace `assets/video/hero-video.mp4` with your own video (see "Hero video" below).

## Preview on your computer

The pages load their content from the `data/` folder, and browsers block that when you open the files directly. Run a small web server inside this folder:

```
python3 -m http.server
```

then open http://localhost:8000.

## What is real and what is still sample content

**Loaded from your files and the KMUTT websites**

- **Publications:** 64 records from your Scopus export of 15 Sep 2026 (`data/publications.json`).
- **Ph.D. candidates:** the five in your Word file, in `students.html`, with photos in `assets/people`.
- **Alumni:** the seven Ph.D. graduates and 33 M.S. graduates from your Word files (`data/graduates.json`).
- **Principal investigator and contact details:** Assoc. Prof. Dr. Wudhichai Assawinchaichote, his email address, the department and university names, the address and the phone number, taken on 19 Sep 2026 from the ENE and KMUTT websites (`team.html`, `contact.html`, and the footer of every page). To change any of them, search the folder for `wudhichai.asa@kmutt.ac.th` and for `126 Pracha-Uthit Road`. The Google Scholar link on the Team page is the address you supplied.

**Still sample content, to replace**

| What | Where |
|---|---|
| Researchers and collaborators | `team.html` |
| "How to join" text | `students.html` (the two admissions links are the university's; the rest is generic) |
| Hero video | `assets/video/hero-video.mp4` |
| Research theme descriptions | `data/research-areas.json` (written from your paper titles; edit freely) |

An amber **Sample content** notice shows on every page until you open `js/main.js` and set `sampleContent: false` near the top. To find what is left, search the whole folder for: `R. Researcher`, `M. Engineer`, `T. Fellow`, `University A`, `Research Institute B`, `Industry Partner C`, `University D`.

## Updating the publications from Scopus

1. In Scopus, select your documents and choose **Export, CSV**. Include at least the citation information (authors, title, year, source title, volume, issue, pages, cited by) and the bibliographical information (DOI, document type, publication stage). Abstract and author keywords are optional and are used when present.
2. Put the file in this folder and run (Python 3, nothing else to install):

```
python3 tools/scopus_to_json.py scopus_export.csv
```

3. Upload the changed `data/publications.json`.

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
- The title links to `url`, or to the DOI if there is no `url`. A DOI button, a PDF button (`pdf` can be a link or a file such as `assets/papers/my-paper.pdf`) and an Abstract button appear when those fields are filled.
- The "Cited" badge appears when `citations` is 1 or more, and links to the Scopus record when `scopus` is set. `status` is for things like "In press". `article` is the article number, shown when there is no page range.
- `featured: true` puts a paper in "Selected publications" on the home page. If none is flagged, the three most recent are shown.

**`data/graduates.json`**: one object per degree. `name` is shown as written (with Mr., Ms. or Dr. if you like), `degree` can be any label (Ph.D., M.S., ...). Optional fields:

- `year`: entries without a year are listed first, under "Recent". Add a year to move one into its year.
- `photo`: a path such as `assets/people/first-last.jpg`. Entries with a photo appear as cards; the others as compact lines.
- `note` (for example "Co-advised"), `thesis`, `position`, `organization`, `url`.
- `sector` (`academia`, `industry`, `government` or `study`): once people have a sector, a "where graduates go next" bar appears.

The numbers on the home page and on the Students page count degrees, so someone with both an M.S. and a Ph.D. from the group counts once for each.

**Photos:** use square JPEGs, at least 256 × 256 pixels, in `assets/people`. The current Ph.D. candidates are written directly in `students.html`; copy one of the existing cards to add another. Photos of people are published with the site, so make sure everyone shown agrees. To remove one, delete the `photo` line (or the `<img>` in `students.html`).

**`data/research-areas.json`**: `id`, `title`, `summary`, `keywords`, `hue` (a colour angle from 0 to 360 used for dots, tags and diagram accents) and `diagram`. The diagram can be `intelligent`, `cps` or `networked`, or a path to your own image such as `assets/images/my-diagram.svg`.

After editing, keep the JSON valid (matching quotes, no trailing commas). If a page shows "Couldn't load...", the JSON has a typo or you are opening the files without a server.

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
index.html            Home: hero, research themes, numbers, selected publications
publications.html     Publications dashboard
team.html             Group leader, researchers, collaborators
students.html         Ph.D. candidates, alumni, how to join
contact.html          Contact details and message form
css/                  style.css (all styling), animations.css, responsive.css
js/                   main.js (theme, navigation, home, alumni, contact)
                      publications.js (dashboard), counters.js, particles.js (hero network)
data/                 publications.json, graduates.json, research-areas.json
tools/                scopus_to_json.py (refreshes publications.json from a Scopus export)
assets/               video/, images/, people/, logos/, icons/, fonts/
```

`.nojekyll` (a hidden file) tells GitHub Pages to publish the folder as it is.

## Notes

- **Citation counts** come from Scopus and are as of the date shown under the page title on the publications page.
- **Accessibility:** keyboard operable, skip link, visible focus, light and dark themes, and all motion is switched off for visitors who prefer reduced motion. An automated axe-core audit reported no violations on the shipped content in both themes. Run it again after you edit.
- **Contact form:** it opens the visitor's own email app with the message filled in. Nothing is sent from the page, so no server or account is needed.
- **Privacy and speed:** no analytics, no tracking, no requests to other sites. Fonts are served from this folder.

## Licenses

- Code, logo, generated video and sample text: MIT, see `LICENSE`.
- The names, photos and publication records in `data/`, `assets/people` and `students.html` are the group's own content and are not covered by the MIT license.
- Fonts Bricolage Grotesque and Source Serif 4: SIL Open Font License 1.1, see `assets/fonts/OFL-*.txt`.
