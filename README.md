# Zendesk Sidebar App (ZAF v2 + React + Vite)

A production-ready mini app that reads Zendesk ticket details, fetches a customer profile and recent posts from JSONPlaceholder, and generates a smart reply draft in the ticket sidebar.

## Features
- ZAF v2 integration (reads `ticket.requester.email`, `ticket.subject`, `ticket.description`)
- Public API calls to JSONPlaceholder (users by email, last 3 posts)
- Reply draft generation with tone selector (Friendly / Concise)
- Loading skeletons, error states, not-found state
- Copy to clipboard, Refresh, Regenerate buttons
- Clean UI with pure CSS

## Project Structure
```
zendesk-sidebar-app/
├── app/
│   ├── manifest.json
│   └── assets/          # Created by build (index.html, index.js, index.css)
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
├── index.html           # Dev entry; built into app/assets/index.html
├── package.json
├── vite.config.js
└── README.md
```

## Local Development
This app includes a dev fallback that mocks the ZAF client by using one of the provided test emails. You can run and test without a Zendesk instance.

```bash
npm i   # or pnpm i / yarn
npm run dev # http://localhost:5173
```

- The app will load with a random test email from the prompt.
- Use the tone selector, Regenerate, Copy, and Refresh buttons.

## Production Build
Creates `app/assets/` with deterministic filenames required by the manifest.

```bash
npm run build
```

Outputs:
- `app/assets/index.html`
- `app/assets/index.js`
- `app/assets/index.css`

## Zendesk App Setup (Optional)
1. Zip the `app/` folder contents.
2. Upload/install as a private app in Zendesk Support.
3. The manifest points to `assets/index.html` as required for ticket sidebar.

## Environment & CSP
- ZAF SDK is loaded from `https://static.zdassets.com/...` in `index.html`.
- JSONPlaceholder endpoints are allowed by the CSP meta tag.

## Testing Notes
- Test emails: Sincere@april.biz, Shanna@melissa.tv, Nathan@yesenia.net, Julianne.OConner@kory.org, Lucio_Hettinger@annie.ca, Karley_Dach@jasper.info, Telly.Hoeger@billy.biz, Sherwood@rosamond.me, Chaim_McDermott@dana.io, Rey.Padberg@karina.biz
- Verify loading skeletons, not-found behavior, and copy to clipboard.

## Limitations
- In dev without Zendesk, a random test email is used. In Zendesk, the app reads the real ticket fields.

## License
MIT
