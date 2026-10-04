# Release testing checklist

Use staging, two verified accounts A/B, two devices/browser profiles, and a HTTPS deployment. Tick only after observing the stated behavior.

- [ ] Signup rejects absent name/invalid email/password <12 chars. Confirmation email arrives. Confirmation redirect returns to this app. New profile uses signup name.
- [ ] Login rejects invalid password; valid login loads cloud before editing. Refresh/browser restart preserves session. Expired tokens refresh or require login.
- [ ] Logout waits for pending save, clears account conversation, restores guest data. Signing into B never reveals A’s profile, notes, stamps or food.
- [ ] Forgot password gives a generic success message, delivers email, returns to recovery form. New password works; old password fails. Expired/used recovery links fail safely.
- [ ] Original guest onboarding, oath, mode selection, interests and resume flow work. All map gestures, booth interactions, trivia, stamp animations, journal, food selections, Eco points, plushies and certificate work.
- [ ] Existing localStorage data survives upgrade. Import guest adventure copies every field including notes and booth edits; confirmation cancel leaves cloud unchanged. Guest mode works without Supabase configuration.
- [ ] Earn a stamp/complete challenge/edit note/select food/change interests and plan; Account reports totals and “All progress saved”. Inspect all eight tables for consistent rows under A.
- [ ] Device 2 login restores name, oath, visits, stamps, correct/incorrect trivia results, food, eco points, interests, plans, notes and carousel state.
- [ ] Simultaneous device edits reject stale revision. Retry never overwrites a newer revision. Copy unsaved notes before reloading. Network failure shows failure and blocks editing; retry succeeds when restored. Logout refuses to drop failed writes.
- [ ] New adventure clears cloud progress/notes for the signed-in account and leaves guests/other accounts unchanged.
- [ ] Talk → enable AI → Send yields concise themed reply, personalized from SAVED progress. Guest/AI-disabled mode retains story prompts. No public key can invoke AI without valid login.
- [ ] API returns 405 for GET, 403 for foreign/no origin, 401 for missing/invalid/expired token, 400 for injected system role/oversized messages/invalid character. Provider timeout shows recoverable UI.
- [ ] Send >10 AI requests in a minute, then >100/day: 429, including across fresh Vercel instances. Confirm authenticated users cannot read/reset ai_usage. Confirm OpenAI key never appears in static output/network client config.
- [ ] Speak requests permission only after tap; transcript fills editable text. Denial/unavailable recognition permits typing. Send uses transcript. Read replies speaks selected companion; Stop stops listening/playback. Test iPhone Safari and installed PWA on physical devices.
- [ ] Using A’s JWT and the public key, SELECT each table with B’s user_id returns no rows; direct INSERT/UPDATE/DELETE denied. save_ranger accepts no supplied user ID and modifies only A. Unauthenticated RPC rejected. Invalid oversized notes/stamps roll back entire transaction.
- [ ] HTML/script payload in note/name/chat/booth edits never executes. Session/auth/API responses are not cached by service worker. Secrets absent from repository/build assets.
- [ ] Check 390×844 and smaller iPhone layouts, keyboard focus, VoiceOver labels, errors/status announcements, zoom, safe-area controls and every original screen/animation.
- [ ] Production SMTP, exact redirects, canonical APP_ORIGIN, Vercel route/config and monitoring verified. Rollback deployment available.
