# KMUTT Control Research Group — Complete Research Archive

A GitHub-ready research-group website designed for the Control Research Group in the Electronic and Telecommunication Engineering (ENE), Faculty of Engineering, King Mongkut's University of Technology Thonburi (KMUTT).

## Included
- Public research-group website
- Admin dashboard
- Supabase authentication
- Supabase PostgreSQL database schema
- Researcher profiles
- Current postgraduate students
- Graduated PhD/Master's alumni
- Publications database
- DOI, Google Scholar and publisher links
- Publication year/type/topic filtering and search
- Thesis archive
- Research projects
- News
- Photo gallery
- Research statistics
- Responsive academic design
- Row Level Security policies
- CSV-friendly database structure
- GitHub-ready project layout

## Stack
- Vite + vanilla JavaScript
- Supabase Auth + PostgreSQL + Storage
- HTML/CSS/JS
- No paid CMS is required

## Quick start

1. Create a Supabase project.
2. Open `supabase/schema.sql` in the Supabase SQL Editor and run it.
3. Create an admin account in Supabase Authentication.
4. Add that account's UUID to `admin_users` using the SQL shown in the schema.
5. Create a Storage bucket called `research-media` and apply the storage policies in `schema.sql`.
6. Copy `.env.example` to `.env` and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Install dependencies:
   ```bash
   npm install
   ```
8. Start:
   ```bash
   npm run dev
   ```
9. Build:
   ```bash
   npm run build
   ```

## GitHub Pages note

Because the public site uses Supabase, it can be hosted on GitHub Pages, Netlify, Vercel or another static host. For GitHub Pages, use the GitHub Actions workflow included in `.github/workflows/deploy.yml`.

## Data safety

Do not put service-role keys in the browser or repository. Only the Supabase anonymous/public key belongs in `.env` for this frontend architecture. Administrative writes are protected by Supabase authentication + RLS.

## Official institutional context

The website is framed around KMUTT's Electronic and Telecommunication Engineering department. The official ENE website identifies Control System and Modeling, Fuzzy Control Systems, and Control Theory and Applications among relevant expertise. Verify all group-specific names, publications, student records and projects before publishing.

## Recommended production additions

- ORCID integration
- Crossref/OpenAlex publication import
- Google Scholar links per researcher
- DOI metadata lookup
- Automatic annual publication reports
- Thesis PDF access control
- Institutional SSO if KMUTT provides a suitable identity integration
- Research-project funding metadata
- Thai/English language switch
