# 🌌 Celestial Ranger
### A little less stress. A little more wonder.

A theme park day should feel like an adventure. But between finding your way, keeping children entertained, deciding where to eat, and looking for a place to cool down, it can become a lot to manage.

**I created this prototype to make guests’ lives easier and make those everyday moments part of the magic.**

Celestial Ranger brings exploration, learning, and practical guidance into one playful park companion. Children get a mission. Parents get support. Friends get a way to explore together.

🚀 **[Begin your adventure](https://rangerapp.vercel.app)**

## ✨ The challenge behind the idea

This project grew from the **Inspiring Future Innovators Program**, where our team, **Galaxy Gliders**, was challenged to design a themed enhancement for Universal Epic Universe using the fictitious IP **Ockley & Fernan**.

The challenge asked us to identify a guest audience, describe an experience that improves their park day, and explain how it could be technically implemented.

Our concept asks:

**What if helping guests navigate their day could also make them feel like the heroes of a story?**

*Our storyline and prototype refer to Ockley as Oakley.*

## 🔎 One missing ranger. Five worlds. Your story.

A portal malfunction has left Oakley lost in the galaxy.

Luckily, she left clues in the plants she hoped to study. With Fernan by their side, guests become Celestial Rangers and follow her trail through five themed worlds.

Every plant holds a discovery. Every stamp marks a small victory. Every clue brings the rangers closer to finding their missing friend.

The proposed adventure begins with a **physical Ranger booklet** collected at the entrance. An in person activation introduces the mission and connects guests to the app.

Guests visit five discovery booths in any order, exploring at their own pace. Each booth combines plant learning, a story clue, a stamp, shade, and refreshments.

The journey finishes at the **Carousel in Celestial Park**, where a personalized recap and Ranger Certificate turn the adventure into a keepsake.

## 💛 Designed around how people feel

I wanted this experience to respond to the real needs behind a park visit.

**“Where do we go next?”**  
A clear map and a flexible plan help guests feel more confident.

**“My child is getting restless.”**  
A playful mission gives families something to explore together.

**“We need a break.”**  
Shaded discovery stops make room for rest and refreshments.

**“I don’t want to waste our day.”**  
Useful planning information helps guests choose their next step.

**“I want them to remember this.”**  
A personalized recap celebrates their discoveries and achievements.

The intended journey moves from **uncertainty to confidence, restlessness to curiosity, and small discoveries to shared memories**.

## 🧑‍🚀 A companion for different explorers

### For children: “I can help!”

Fernan brings playful clues, games, and encouragement. Large buttons and short activities help children become active participants whose discoveries matter.

### For parents: “We’ve got this.”

Oakley offers a calmer perspective, with practical information, plant facts, and a way to follow the adventure together.

### For college students: “Let’s make the most of today.”

A streamlined mode focuses on routes, shade, refreshments, and planning, with room for a little fun.

## 🌿 Even a break can be an adventure

The proposed booths turn practical pauses into part of the story.

A rest becomes a chance to solve a clue. A walk becomes a scavenger hunt. A plant becomes something worth noticing.

Guests can slow down without feeling that they have stepped out of the experience.

## 📱 Explore the prototype

🗺️ **Find your way** with a stylized map and route tracker.

🎟️ **Collect five digital stamps** as you explore the worlds.

🌱 **Discover plants** through facts and interactive challenges.

📓 **Keep field notes** filled with your own observations.

♻️ **Track Eco Ranger points** as you learn about sustainability.

🌙 **Switch between day and night** for a different atmosphere.

🥤 **Try simulated refreshment selections** along your route.

🧸 **Explore shoulder buddy interactions** inspired by Oakley and Fernan.

🏅 **Celebrate your adventure** with a personalized Ranger Certificate.

👤 **Create an account or continue as a guest.**

## 🛠️ From an idea to a working experience

I translated the concept into an AI assisted mobile web prototype, then worked on backend integration and deployment to support accounts and saved progress.

The application connects a browser interface to **Supabase authentication and database storage**, with **Vercel hosting and a serverless chat endpoint**.

### 🎨 Frontend

The interface uses **HTML, CSS, and JavaScript**.

HTML organizes the screens, including onboarding, the map, stamp passport, challenges, and account page.

CSS creates the celestial theme, responsive layouts, and large tap targets.

JavaScript handles interactions such as collecting stamps, answering questions, switching modes, and updating progress.

The web app manifest and service worker support an installable experience so guests can add the app to their home screen.

### 🔐 Accounts and authentication

**Supabase Auth** handles account creation, email and password login, sessions, and password reset requests.

The account interface connects through the Supabase JavaScript client. The **Supabase Project URL** identifies the project, while a **publishable key** allows the frontend to communicate with it.

The publishable key is intended for browser use. Database permissions and authentication determine which records a user can access.

Email confirmation is currently disabled for prototype testing. Password reset emails remain subject to the configured email service’s limits.

### 🗄️ Database storage

**Supabase PostgreSQL** stores account information and adventure data.

The schema includes tables for:

👤 Profiles and ranger names  
🧭 Ranger progress and revision history  
🎟️ Collected stamps  
🧩 Completed challenges  
📓 Field notes  
♻️ Eco points  
🥤 Simulated food selections  
⚙️ User preferences  
🤖 AI request usage counters  

Guest progress stays in the browser. Signed in users can save progress to their account, and the interface includes an option to import a guest adventure.

### 🛡️ Access controls and saving

The supplied schema uses **Row Level Security** to restrict users to their own records.

The app saves through a database function named **`save_ranger`**. This function validates submitted data and updates related tables within one transaction, so the changes succeed together.

A revision number helps detect conflicting updates when another device has changed the same account’s progress.

### 🤖 Companion chat

The **`api/chat.js`** endpoint runs as a Vercel serverless function.

It checks the request’s origin, verifies the user’s Supabase session, validates the conversation, and checks a usage quota before contacting the **OpenAI API**.

Saved ranger progress can provide context for the companion’s response. The OpenAI API key stays in server environment variables and is not included in browser code.

Chat requires its own valid configuration and testing, separate from account login.

### 🚀 Build and deployment

**GitHub** stores the source code. Commits to the connected branch trigger deployments on **Vercel**.

During a build:

1. **`npm ci`** installs the project’s dependencies.
2. **`scripts/build.mjs`** copies the website assets into the output directory.
3. **esbuild** bundles **`src/account.js`** and its dependencies.
4. The build generates **`config.js`** using the Supabase URL and publishable key.
5. Vercel hosts the generated website and deploys the chat endpoint.

## 💻 Run locally

Requires **Node.js 22 or later**.

Install dependencies:

```bash
npm ci
```

Copy `.env.example` to `.env.local` and fill in your configuration.

```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
APP_ORIGIN=http://localhost:3000
OPENAI_API_KEY=YOUR_SERVER_SIDE_KEY
OPENAI_MODEL=gpt-4.1-mini
```

Start the local environment:

```bash
npm run dev
```

Follow the URL shown in the terminal. Set `APP_ORIGIN` to match that local origin if the port differs.

For account features, apply **`supabase/schema.sql`** to a compatible Supabase project. If tables already exist, inspect them before applying the schema again.

Keep actual environment files and secret keys out of GitHub.

## 🧪 Test the adventure

1. Create an account or continue as a guest.
2. Complete onboarding and take the Ranger Oath.
3. Explore the map and collect a stamp.
4. Complete a challenge and write a field note.
5. Check Eco Ranger progress and switch display modes.
6. If signed in, reload and verify that saved progress returns.
7. Test account progress on another device.
8. Try guest progress import and the Ranger Certificate.
9. Test companion chat when its server configuration is available.

Run the automated checks with:

```bash
npm test
```

## 🌍 What would need real park integration?

The prototype demonstrates the proposed guest journey. It does not provide live park operations.

A real implementation would require:

🗺️ Approved maps and validated plant information  
📍 Location services with guest permission  
🎢 Live attraction and wait time information  
🌦️ Weather data and operational alerts  
🥤 Authorized ordering and payment integrations  
🧑‍🤝‍🧑 Staff coordination for booths and physical booklets  
♿ Accessibility testing across devices and guest needs  

The goal is to make the experience easy to use while giving each ranger a personal adventure they can return to.

## 🚀 Try it and tell us how it feels

**[Visit Celestial Ranger](https://rangerapp.vercel.app)**

Take the oath, explore a world, collect a stamp, and imagine using it during a busy park day.

Does it help you find your next step? Does it make a break feel worthwhile? Does it give you something to enjoy together?

That is the experience we want to keep improving.

## 🌠 About this project

Created for a student design challenge in the **Inspiring Future Innovators Program**.

This is an unofficial prototype, not an official Universal product. Park information, routes, activities, and ordering are simulated. Some prototype content may differ from the original presentation.

**Because making someone’s day easier can be its own kind of magic. ✨**
Deploy latest backend files.
