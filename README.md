# 🌌 Celestial Ranger
### Small discoveries. Big adventures.

Become a ranger, explore five themed worlds, and turn curiosity into a constellation of discoveries. Collect stamps, tackle plant challenges, write field notes, and earn eco points along the way. 🌱✨

🚀 https://rangerapp.vercel.app

## 🧭 Choose your adventure

- 🗺️ **Explore the map** — plan your route through five themed locations.
- 🎟️ **Collect stamps** — build a record of your discoveries.
- 🌿 **Take on challenges** — learn about plants as you explore.
- 📓 **Keep field notes** — capture observations and memorable moments.
- ♻️ **Earn eco points** — track your Eco Ranger progress.
- 🏅 **Celebrate your journey** — unlock your ranger certificate.
- 👤 **Make it yours** — create an account or explore as a guest.

## 🔐 Your ranger account

Open **More → Account** to create an account or log in.

The app connects to Supabase for authentication and cloud progress storage. Guest adventures stay in your browser, with an option to import them into an account.

**Prototype note:** Email confirmation is currently disabled for testing. Password-reset email availability depends on the email service’s limits.

## 🛠️ Behind the adventure

| Technology | Role |
|---|---|
| HTML, CSS & JavaScript | Interactive experience and mobile interface |
| Supabase Auth | Accounts and login |
| Supabase PostgreSQL | Profiles, progress, stamps, notes, and preferences |
| Row Level Security | Access controls for account data |
| Vercel | Website hosting and serverless API |
| OpenAI API | Optional AI companion chat when configured |
| Web App Manifest & Service Worker | Installable PWA support |

## 💻 Run locally

Requires Node.js 22 or later.

```bash
npm ci
```

Copy `.env.example` to `.env.local` and fill in your configuration, then run:

```bash
npm run dev
```

Follow the local URL shown in your terminal. Supabase credentials are needed for account features; AI chat also requires server-side configuration.

Keep real environment files and secret keys out of GitHub.

## 🧪 Take it for a test adventure

1. Create an account or continue as a guest.
2. Complete onboarding and explore the map.
3. Collect a stamp and try a challenge.
4. Write a field note and earn eco points.
5. If signed in, reload and check that your progress returns.
6. Try the certificate and account screens.
7. Test companion chat if its backend is configured.

Run the automated checks with:

```bash
npm test
```

## ✨ About this prototype

Celestial Ranger is an installable web app with an iPhone-inspired interface—a playground for exploration, learning, and human-centered design.

Park routes, activities, and food orders are **simulated and unofficial**. This prototype does not provide live park information or place real orders.

---

🌱 Stay curious. Explore thoughtfully. Leave with a story.
Deploy latest backend files.
