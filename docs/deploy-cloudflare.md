# Deploy TBFC on Cloudflare Pages

The React app is a static Vite build. It is live at [turfburnersfc.soccer](https://turfburnersfc.soccer/) and [tbfc.pages.dev](https://tbfc.pages.dev/) through Cloudflare Pages project `tbfc`, connected to `cosmosans/tbfc` on `main`.

## Before the first deployment

1. Commit and push the app to the `main` branch of `cosmosans/tbfc`.
2. In Cloudflare, open **Workers & Pages → Create application → Pages → Import an existing Git repository** and select `cosmosans/tbfc`.
3. Set **Production branch** to `main`, **Build command** to `npm run build`, and **Build output directory** to `dist`. The checked-in `.node-version` selects Node 22.
4. Deploy and check the generated `*.pages.dev` URL. Open a direct route such as `/teams` and reload it; Cloudflare Pages serves the SPA entry point for unmatched paths as long as no top-level `404.html` is included.
5. In the Pages project, open **Custom domains → Set up a domain** and add `turfburnersfc.soccer`. Since the domain is registered with Cloudflare, make sure its DNS zone is in the same account. Cloudflare provisions the DNS record and certificate through this flow. Add `www.turfburnersfc.soccer` separately if desired, then configure the preferred redirect.

## Shared data

The `tbfc-club` D1 database is bound to Pages as `CLUB_DB`. Apply `migrations/0001_club_records.sql` in the D1 Console before deployment. Set `CLUB_ADMIN_KEY` as an encrypted Pages production secret. Copy `.env.example` to the ignored `.env.local` and use the same key there. The public site reads D1 but has no edit controls. The localhost Vite server proxies `/api` to the site and attaches the key for writes; it listens only on `127.0.0.1`.

The first successful `GET /api/club` returns `data: null` until a localhost browser publishes its existing data. Back up that browser first, review its records, then click **Publish this browser’s data**. Other devices subsequently read the same records. If the API is unavailable, the UI shows bundled data with an error and does not silently claim it is synced.

The existing roster names, match archive, and bundled images are public on the deployed site.

The GitHub app installation has access to `cosmosans/tbfc`; pushes to `main` trigger production builds.

## Private Scrapbook

Match chats are now private. Public `GET /api/club` responses omit every match's
`chat` field, even when a scrapbook session is present. The local editor's
server-held admin key still permits complete reads and publishing.

Before deploying this version:

1. Apply `migrations/0003_scrapbook_login.sql` to the existing `tbfc-club` D1
   database (the `CLUB_DB` binding). This adds only a login-attempt table.
2. In the Pages project's **Settings → Variables and Secrets**, add an encrypted
   secret named `SCRAPBOOK_PASSWORD` for Production. Use a long, unique password.
   Set Preview separately if private viewing is wanted there. Never use a
   `VITE_` variable or commit the password.
3. Deploy the updated Pages Functions and frontend together. Until this
   deployment is live, the old public endpoint may still expose published chats.
4. In a logged-out browser, confirm `/api/club` contains no match chats and
   `/api/scrapbook?match=...` returns 401. Open a match's Report tab, select
   **Unlock Scrapbook**, and verify password entry, remembered access, and
   **Lock Scrapbook**. Confirm that logged-in viewers have no editing controls.

Cloudflare secret setup:
https://developers.cloudflare.com/pages/functions/bindings/#secrets

The session lasts 30 days in a Secure, HttpOnly, SameSite=Strict cookie. Private
responses are not cacheable and chats are held only in component memory, never
written into the public club snapshot or browser storage by the viewer.
Changing the secret and redeploying invalidates existing sessions on subsequent
requests. Content already viewed or copied cannot be recalled. Logout clears
the current browser cookie and clears chats in other open tabs; it does not
revoke a separately copied session token.

Sign-in is limited to ten attempts per IP per 15-minute window using D1. Missing
configuration or a missing rate-limit table fails closed. Existing public
reports, photos, player photos, and stats remain public: this gate protects
the match-chat field, not private material copied into a report or gallery.
Current chats contain text and player references, not separately uploaded
private media. Future private attachments must use authenticated delivery too.

Run `node scripts/test-scrapbook.cjs` for the authentication/privacy regression
checks. Production access must be verified after deployment; local tests alone
do not establish that a live site is protected.
