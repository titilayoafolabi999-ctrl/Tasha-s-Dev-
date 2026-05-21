# 🎯 Scoutool Suite

**Professional Email Scraper + Bulk Gmail Sender**

Extract emails from domains and generate bulk Gmail compose links instantly. Perfect for outreach, lead generation, and email marketing campaigns.

---

## ✨ Features

### 🔍 **Domain Scraper**
- Extract emails from multiple domains simultaneously
- Scrape contact, about, terms, and privacy pages
- Automatic email validation and deduplication
- CSV import/export for bulk operations
- Real-time progress tracking
- Fallback proxy support (no backend needed)

### ✉️ **Email Sender**
- Generate Gmail compose links with prefilled templates
- Support for dynamic variables (name, domain, store, etc.)
- Import data from CSV, manual entry, or scraper results
- Preview emails before bulk generation
- Export results as CSV
- One-click email opening in Gmail

### ⚡ **Pipeline Mode**
- Scrape → Extract → Send in one workflow
- Streamlined 3-step process
- Live email preview
- Batch processing with concurrency limits

### 🌓 **User Experience**
- Dark/Light mode toggle
- Responsive design (desktop, tablet, mobile)
- Real-time filtering and search
- Progress indicators and statistics
- Toast notifications
- Modal previews

### 🛡️ **Technical Features**
- Backend CORS proxy (no browser restrictions)
- Fallback to public proxies if backend down
- Concurrent domain scraping
- Request timeout handling
- Error recovery and retry logic
- Progressive enhancement

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ 
- npm or yarn

### Local Development

1. **Clone & Install**
```bash
git clone https://github.com/titilayoafolabi999-ctrl/Tasha-s-Dev-.git
cd Tasha-s-Dev-
npm install
```

2. **Start Backend Server**
```bash
npm start
# Server runs on http://localhost:3001
```

3. **Open Frontend**
```bash
# Option A: Direct file
open index.html

# Option B: Local HTTP server
npx http-server -p 3000
# Visit http://localhost:3000
```

---

## 📋 Usage

### Scraper Tab
1. Enter domains (one per line) or upload CSV/TXT
2. Choose options (contact pages, proxy, unique emails, etc.)
3. Click "Start Scraping"
4. View results in real-time
5. Export CSV or send to Sender

### Sender Tab
1. Upload CSV with email data or enter manually
2. Select email column
3. Compose template with variables ({name}, {domain}, {store})
4. Generate Gmail links
5. Export or open in Gmail

### Pipeline Tab
1. Enter domains
2. Automatically extracts emails
3. Compose email template
4. Generate send links instantly

---

## 🌐 Deployment

### Deploy Frontend (Vercel)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com
# 3. Import repository
# 4. Add environment variables:
REACT_APP_API_URL=http://YOUR_SERVER_IP:3001/api
REACT_APP_ENV=production
REACT_APP_USE_SERVER=true

# 5. Deploy
```

### Deploy Backend (Heroku)

```bash
# 1. Create app
heroku create your-app-name

# 2. Set environment
heroku config:set NODE_ENV=production

# 3. Deploy
git push heroku main

# 4. Get URL
heroku apps:info

# 5. Update Vercel env with Heroku URL
```

**See [SETUP.md](SETUP.md) for detailed deployment guide**

---

## 📁 Project Structure

```
├── index.html                 # Main HTML
├── css/                       # Stylesheets
│   ├── base.css              # Core styles
│   ├── components.css         # Component styles
│   ├── theme.css             # Dark mode
│   └── responsive.css         # Mobile
├── js/
│   ├── app.js                # App init
│   ├── state.js              # State management
│   ├── router.js             # Tab routing
│   ├── components/           # UI components
│   │   ├── theme.js          # Theme toggle
│   │   ├── ui.js             # UI utilities
│   │   ├── dropzone.js       # File upload
│   │   └── ...
│   └── modules/              # Feature modules
│       ├── scraper.js        # Domain scraper
│       ├── sender.js         # Email sender
│       ├── server.js         # Backend client
│       ├── proxy.js          # CORS proxy
│       └── ...
├── server/
│   └── index.js              # Express backend
├── package.json              # Dependencies
├── .env                       # Config template
├── SETUP.md                   # Setup guide
└── README.md                  # This file
```

---

## 🔧 API Endpoints (Backend)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health check |
| POST | `/api/proxy` | CORS proxy for any URL |
| POST | `/api/scrape` | Scrape single domain |
| POST | `/api/scrape-batch` | Scrape multiple domains |
| POST | `/api/extract-emails` | Extract emails from HTML |

---

## 🛠️ Configuration

### Environment Variables

**Frontend (.env / Vercel)**
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
REACT_APP_USE_SERVER=true
```

**Backend (.env)**
```
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

## 📊 Tech Stack

**Frontend:**
- Vanilla JavaScript (no frameworks)
- CSS3 with CSS Grid/Flexbox
- Progressive enhancement

**Backend:**
- Node.js + Express
- Axios for HTTP requests
- Cheerio for HTML parsing
- Cors for cross-origin requests

**Deployment:**
- Vercel (Frontend)
- Heroku/Render (Backend)
- GitHub (Version control)

---

## 🎯 Future Enhancements

### Planned Features
- [ ] **Authentication** - User accounts & login
- [ ] **Database** - Store scraping history & results
- [ ] **Analytics** - Campaign tracking & statistics
- [ ] **Webhooks** - Integration with external services
- [ ] **API Keys** - Programmatic access
- [ ] **Scheduling** - Auto-scrape on schedule
- [ ] **Proxy Rotation** - Advanced proxy management
- [ ] **Email Validation** - Real-time validation API
- [ ] **AI Summaries** - Auto-generate email templates
- [ ] **Bulk Actions** - Batch operations & exports
- [ ] **Dark Web Search** - Enhanced email finding
- [ ] **Social Scraping** - LinkedIn, Twitter integration
- [ ] **CRM Integration** - HubSpot, Salesforce sync
- [ ] **Monitoring** - Delivery tracking & open rates
- [ ] **Mobile App** - iOS/Android version

### Possible Add-ons

**Premium Features:**
- Unlimited scraping (rate limits removed)
- Advanced filters & search operators
- Priority support
- Custom integrations
- White-label version

**Enterprise Features:**
- SSO/SAML authentication
- Dedicated server
- SLA guarantees
- Advanced security
- Custom development

---

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
```
Solution: Ensure backend is running and REACT_APP_API_URL is correct
Check: curl http://localhost:3001/api/health
```

**Scraping Returns Nothing**
```
Solution: Check if domain is accessible
Try: Visit domain in browser first
Check: Browser console for errors (F12)
```

**Gmail Links Don't Open**
```
Solution: Ensure Gmail is open in same browser
Check: Browser popup blocker settings
Try: Use incognito/private window
```

**Backend Connection Failed**
```
Solution: Start backend server
Run: npm start
Check: Server logs for errors
```

See [SETUP.md](SETUP.md) for more troubleshooting.

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**titilayoafolabi999**
- GitHub: [@titilayoafolabi999-ctrl](https://github.com/titilayoafolabi999-ctrl)

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 💬 Support

Need help?
- Check [SETUP.md](SETUP.md) for deployment guide
- Review browser console (F12 → Console) for errors
- Check server logs for backend issues
- Open an issue on GitHub

---

## 📈 Status

- ✅ Fully Functional
- ✅ Production Ready
- ✅ Actively Maintained
- ⚠️ Use at your own risk
- 📋 Terms: Respect robots.txt and website ToS

---

**Happy Scraping! 🚀**
