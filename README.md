# LANK AI — Real-Time Multilingual Voice Interpreter

LANK AI is a full-stack web and native Android voice interpretation platform built with Next.js 15, Prisma, Neon PostgreSQL, Groq Whisper Turbo, and Capacitor. It bridges real-time speech-to-text transcription and multilingual translation—including support for regional African languages.

## Live Links
- **Web App:** [https://lank-ai.vercel.app](https://lank-ai.vercel.app)
- **Android APK (v1.0.0):** [Download `lank-ai-release.apk`](https://github.com/martindiarua/lank_AI/releases/download/v1.0.0/lank-ai-release.apk)

---

## Key Features
- **Live Voice Interpretation:** Real-time audio capture, Whisper Turbo transcription (`whisper-large-v3-turbo`), and multi-engine translation fallback.
- **Persistent Workspace:** Translation history, saved phrases, user settings, and profile management backed by Neon PostgreSQL.
- **Native Android App:** Wrapped with Capacitor and compiled/signed automatically via GitHub Actions CI/CD.
- **Production Hardening:** Offline network detection banner, route-level loading skeletons, custom 404/error boundaries, and HTTP security headers.

---

## Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React, TypeScript |
| **Styling** | Tailwind CSS, Lucide Icons |
| **Database & ORM** | Neon PostgreSQL, Prisma ORM |
| **AI / Audio** | Groq Whisper Large v3 Turbo |
| **Mobile Wrapper** | Capacitor (Android) |
| **Deployment & CI/CD** | Vercel (Web), GitHub Actions (Signed APK) |

---

## Local Development Setup

### 1. Clone the repository
```bash
git clone [https://github.com/martindiarua/lank_AI.git](https://github.com/martindiarua/lank_AI.git)
cd lank_AI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 4. Generate Prisma client & run the dev server
```bash
npx prisma generate
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Android APK Build Pipeline
The Android build is automated in `.github/workflows/build-apk.yml`. Every push to main:

- Installs dependencies and syncs Capacitor (`npx cap sync android`).

- Compiles the release build with Gradle (`./gradlew assembleRelease`).

- Aligns and signs the binary using `zipalign` and `apksigner`.

- Uploads `lank-ai-release.apk` as a downloadable artifact.

## License
- MIT

---