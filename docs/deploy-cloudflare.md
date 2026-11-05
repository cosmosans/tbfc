# Deploy TBFC on Cloudflare Pages

The React app is a static Vite build. It is live at [turfburnersfc.soccer](https://turfburnersfc.soccer/) and [tbfc.pages.dev](https://tbfc.pages.dev/) through Cloudflare Pages project `tbfc`, connected to `cosmosans/tbfc` on `main`.

## Before the first deployment

1. Commit and push the app to the `main` branch of `cosmosans/tbfc`.
2. In Cloudflare, open **Workers & Pages → Create application → Pages → Import an existing Git repository** and select `cosmosans/tbfc`.
3. Set **Production branch** to `main`, **Build command** to `npm run build`, and **Build output directory** to `dist`. The checked-in `.node-version` selects Node 22.
4. Deploy and check the generated `*.pages.dev` URL. Open a direct route such as `/teams` and reload it; Cloudflare Pages serves the SPA entry point for unmatched paths as long as no top-level `404.html` is included.
5. In the Pages project, open **Custom domains → Set up a domain** and add `turfburnersfc.soccer`. Since the domain is registered with Cloudflare, make sure its DNS zone is in the same account. Cloudflare provisions the DNS record and certificate through this flow. Add `www.turfburnersfc.soccer` separately if desired, then configure the preferred redirect.

## Data behavior at launch

This deployment hosts the interface and checked-in starter data. Editing controls and browser-local writes are available only on localhost. The public site is read only; it still loads any older data stored in that browser. There is no shared database yet. Before switching local browsers, use **Backup → Download backup JSON** on the source browser and **Restore backup** on the destination browser. The checked-in Supabase migrations are a backend plan; the UI does not yet read or write Supabase.

The existing roster names, match archive, and bundled images are public on the deployed site.

Cloudflare currently displays a warning that this project is disconnected from the Git account, alongside a GitHub incident notice. The first deployment succeeded, but confirm that a later push to `main` triggers a new deployment once the incident clears. If the warning persists, check the `cosmosans/tbfc` GitHub app installation from the Pages project's Settings tab.
