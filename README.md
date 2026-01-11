# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Hospital Triage System

A local-first patient triage system that prioritizes privacy and PIPEDA/PHIPA compliance.

### Setup Instructions

#### Prerequisites

Install the following on your machine:

1. **Node.js** (v18+): `brew install node`
2. **Python** (3.9+): `brew install python@3.9`
3. **Ollama** (for local translation): `brew install ollama`

#### Installation

1. **Install Node dependencies**:
   ```bash
   cd repo
   npm install
   ```

2. **Set up Python environment for speech API**:
   ```bash
   cd apps/speech
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Download Ollama model** (one-time):
   ```bash
   ollama pull gemma2:2b
   ```

### Running the App

You need **4 terminals**:

#### Terminal 1: Next.js Frontend
```bash
cd repo
npm run dev
```
Runs on http://localhost:3000

#### Terminal 2: Ollama Service
```bash
ollama serve
```
Runs on http://localhost:11434

#### Terminal 3: Python Transcription API
```bash
cd repo/apps/speech
source venv/bin/activate
python api.py
```
Runs on http://localhost:5001

#### Terminal 4: File Storage API
```bash
cd repo/apps/file-storage
node index.js
```
Runs on http://localhost:3001

### Patient Records Storage

Patient records are saved to **local filesystem** in:
```
repo/patient_records/[patient_name]_[timestamp]/
  ├── transcript.txt    (name, symptoms, metadata)
  ├── photo.jpg         (patient photo)
  └── metadata.json     (structured data)
```

**Example folder structure**:
```
patient_records/
  ├── john_doe_2026-01-10T12-30-45-123Z/
  │   ├── transcript.txt
  │   ├── photo.jpg
  │   └── metadata.json
  └── jane_smith_2026-01-10T12-35-12-456Z/
      ├── transcript.txt
      ├── photo.jpg
      └── metadata.json
```

### Privacy & Compliance

- **All data is local**: No cloud APIs, no external servers
- **Whisper**: Local speech-to-text (runs on your machine)
- **Ollama**: Local translation (runs on your machine)
- **Filesystem storage**: Patient records saved to local disk
- **No database**: Simple file-based storage for transparency
- **Camera access**: Only in-browser via WebRTC (no uploads)

### Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (Next.js)                     │
│  - Patient name (type or voice)         │
│  - Type or voice symptom input          │
│  - Camera feed (WebRTC)                 │
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Python API      │  │  File Storage API│
│  - Whisper       │  │  - Save to disk  │
│  - Ollama        │  │  - Patient files │
└──────────────────┘  └──────────────────┘
```

### What NOT to Commit

The `.gitignore` excludes:
- `venv/` (Python virtual environment)
- `*.gguf`, `*.pt` (AI model files)
- `.env` files
- `node_modules/`
- `patient_records/` (patient data)

**Each team member must**:
1. Run `brew install ollama`
2. Run `ollama pull gemma2:2b`
3. Create their own Python `venv`
4. Install Python dependencies locally

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

