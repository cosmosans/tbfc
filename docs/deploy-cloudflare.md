# Deploy TBFC on Cloudflare Pages

The React app is a static Vite build. Cloudflare Pages can host it at `turfburners.soccer` with the existing GitHub repository.

## Before the first deployment

1. Commit and push the app to the `main` branch of `cosmosans/tbfc`.
2. In Cloudflare, open **Workers & Pages → Create application → Pages → Import an existing Git repository** and select `cosmosans/tbfc`.
3. Set **Production branch** to `main`, **Build command** to `npm run build`, and **Build output directory** to `dist`. The checked-in `.node-version` selects Node 22.
4. Deploy and check the generated `*.pages.dev` URL. Open a direct route such as `/teams` and reload it; Cloudflare Pages serves the SPA entry point for unmatched paths as long as no top-level `404.html` is included.
5. In the Pages project, open **Custom domains → Set up a domain** and add `turfburners.soccer`. Since the domain is registered with Cloudflare, make sure its DNS zone is in the same account. Cloudflare provisions the DNS record and certificate through this flow. Add `www.turfburners.soccer` separately if desired, then configure the preferred redirect.

## Data behavior at launch

This deployment hosts the interface and checked-in starter data. Edits, uploaded photos, lineups, events, and notes currently save to **each browser's local storage**, so they do not sync between devices or browsers. Before switching browsers, use **Backup → Download backup JSON** on the source browser and **Restore backup** on the destination browser. Keep a backup before clearing site data. The checked-in Supabase migrations are a backend plan; the UI does not yet read or write Supabase.

The existing roster names, match archive, and bundled images are part of the deployed static site. Confirm those are suitable for public access before assigning the domain. Cloudflare Pages access controls can protect a preview while the shared backend and sign-in are built.
