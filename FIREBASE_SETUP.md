# FIREBASE_SETUP.md

## Setting up Firebase for CareCore

1. **Create a Firebase project**
   - Go to the [Firebase console](https://console.firebase.google.com/).
   - Click **Add project** and follow the wizard. Give it a name like `carecore-auth`.

2. **Enable Authentication**
   - In the Firebase console, navigate to **Authentication → Sign‑in method**.
   - Enable **Email/Password** (and optionally Google, Apple, etc.).

3. **Create a Firestore database**
   - Go to **Firestore Database → Create database**.
   - Choose **Start in production mode** (rules will be managed by the app).
   - The default database ID is `(default)`; keep it.

4. **Add a web app to the project**
   - Click the gear icon → **Project settings → General**.
   - Under **Your apps**, click the **</>** (Web) icon to register a new web app.
   - Give it a nickname (e.g., `carecore-web`).
   - **Register app** – you will see a config object like:
   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
   - **Do not** copy this directly into source code – keep it secret!

5. **Create `.env.local`**
   - In the frontend folder, copy the provided example:
   ```bash
   cp .env.local.example .env.local
   ```
   - Fill the placeholders with the values from the Firebase config **without** quotes:
   ```dotenv
   VITE_FIREBASE_API_KEY=YOUR_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_APP_ID
   ```

6. **Install Firebase SDK** (already done, but run if needed):
   ```bash
   cd frontend
   npm i firebase
   ```

7. **Run the dev server**
   ```bash
   npm run dev
   ```
   The app should now load. The landing page works without Firebase; the Auth page will show an error until `.env.local` is present.

---

### Why the lazy init?
We guard the Firebase initialization so that the landing page (which has no auth) can render with a dark background without requiring a `.env.local`. Only when the user navigates to `/auth` does the app attempt to initialize Firebase, and a clear error message is shown if the env file is missing.

---

**Next steps**:
- Fill `.env.local`.
- Reload the page or restart the dev server.
- Test sign‑up and sign‑in for each role.
