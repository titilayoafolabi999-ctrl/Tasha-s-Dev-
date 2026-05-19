# 🎯 Scoutool Suite

A unified bulk email scraper and Gmail sender toolkit. Pure HTML/CSS/JS — no build step, no dependencies, no backend required.

## Features

| Feature | Description |
|---|---|
| **Bulk Domain Scraping** | Scrape emails from hundreds of domains |
| **Shallow Crawl** | Checks /, /contact, /about, /terms automatically |
| **Smart Extraction** | Regex + DOM parsing + entity decoding + obfuscation detection |
| **Proxy Rotation** | Auto-rotates public CORS proxies |
| **Gmail Link Generator** | Create pre-filled Gmail compose links from CSV |
| **Template Variables** | Use `{name}`, `{store}`, any CSV column as variable |
| **Pipeline Mode** | Scrape → Extract → Send in one flow |
| **CSV Export/Import** | Full CSV support for all operations |

## Project Structure

scoutool-suite/ ├── index.html # Main app shell
                ├── css/ 
                |         ├── base.css # Variables, reset, utilities 
                │         ├── components.css # All UI components 
                │         ├── theme.css # Animations, transitions 
                │         └── responsive.css # Mobile breakpoints
                └── js/   ├── app.js # Entry point  
                           ├── router.js # Tab navigation  
                           ├── state.js # Central state store  ├
                           |── modules/ 
                           │            ├── validator.js # Domain/email validation  
                           |            ├── csv.js # CSV parse/stringify/download  
                           │            ├── proxy.js # CORS proxy rotation  
                           │            ├── extractor.js # Email extraction engine  
                           │            ├── scraper.js # Domain scraping logic  
                           │            └── sender.js # Gmail link generator  
                           └── components/  ├── ui.js # Core UI helpers  
                                             ├── progress.js # Progress bars  
                                             ├── table.js # Data tables  
                                             ├── dropzone.js # Drag & drop  
                                             └── charts.js # CSS bar charts
## Quick Start

1. Open `index.html` in any modern browser
2. **Scraper tab**: Paste domains or drop a CSV/TXT file
3. Click **Start Scraping**
4. **Sender tab**: Upload CSV with email data or click "From Scraper"
5. Write template with `{variables}`, click **Generate Links**
6. Click any **Open Gmail** button to send

## Pipeline Mode

The **Pipeline** tab lets you:
1. Enter domains → auto-scrape
2. Review extracted emails
3. Compose and generate Gmail links in one flow

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Start scraping (on Scraper tab) |
| `Escape` | Close modal |

## Browser Limitations

- **CORS**: Direct fetching blocked by browsers. Enable "Use proxy" or use the Node.js backend
- **Rate limits**: Public proxies have limits. For production, use your own proxy pool
- **JS-rendered sites**: Single-page apps may need Puppeteer backend

## Optional Node.js Backend

For production scraping without CORS limits:

```bash
cd server/
npm install
npm start
Update  js/modules/proxy.js  to point to your server.
```

License
MIT — use freely, modify, redistribute.
---

This completes the unified **Scoutool Suite** with all files properly structured. The scraper and sender are now fully integrated with:

- **Shared state** (`state.js`) for passing scraped emails to sender
- **Pipeline tab** for one-click scrape→send workflow  
- **"Send Emails →" button** on scraper results to jump to sender with data
- **"From Scraper" tab** in sender to load scraped contacts directly
