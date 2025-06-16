# Lightweight Cross-Platform API Client (PostZero)

## Project Requirements

See the original project requirements in the first user message for full details.

---

## Tech Stack
- SvelteKit (UI)
- Electron (Desktop shell)
- TailwindCSS (Styling)
- axios or fetch (HTTP client)
- curlconverter (curl parser)
- swagger-client or @apidevtools/swagger-parser (Swagger/OpenAPI parser)
- lowdb or raw JSON (collections storage)
- Vite (bundler)
- electron-builder & vite-plugin-electron (packaging)

---

## Directory Structure

```
root/
├── src/
│   ├── main/                  # Electron main process
│   ├── renderer/              # Frontend code (Svelte)
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.svelte
│   └── shared/                # curl + swagger parser logic
├── public/
├── package.json
├── vite.config.js
├── electron-builder.yml
├── requirements.md
```
