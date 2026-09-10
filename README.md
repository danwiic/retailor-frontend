# Retailor

Retailor is a focused resume-tailoring workspace. It takes one resume and one
job description, lets the user review the parsed content, and produces an
editable tailored resume with a temporary DOCX download.

The product is intentionally document-oriented rather than a dashboard or chat
application. AI output is treated as a draft that the user must review.

## Product Flow

1. Upload a PDF or DOCX resume.
2. Review and edit the extracted resume.
3. Paste the exact job description.
4. Analyze and edit the parsed job requirements.
5. Review the resume and job context before tailoring.
6. Run tailoring with the reviewed values.
7. Compare the original and tailored resume.
8. Edit the tailored draft and review its estimated length.
9. Download the temporary DOCX export.

User edits are preserved while moving between steps during the current browser
session. The resume review step is required and is not skipped.

## Requirements

- Node.js 20 or newer
- npm
- A running Retailor backend API

The backend is expected to run at `http://localhost:8000` by default and expose:

- `POST /parse`
- `POST /analyze-jd`
- `POST /tailor`
- `GET /health`

The frontend API contract is documented in
[`docs/frontend-api-contract.md`](docs/frontend-api-contract.md).

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file if the backend is not running at the default
origin:

```env
RETAILOR_API_BASE=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The browser communicates with same-origin Next.js route handlers under
`/api/*`. Those handlers proxy requests to the backend and keep the backend
origin out of browser-side request code.

## Configuration

### `RETAILOR_API_BASE`

The server-side backend origin used by the Next.js proxy routes.

Default:

```env
RETAILOR_API_BASE=http://localhost:8000
```

For the deployed Vercel project, set this server-side environment variable in
Vercel under **Project Settings → Environment Variables**:

```env
RETAILOR_API_BASE=https://api.retailor.danpirante.dev
```

Apply it to the environments where the frontend is deployed, then redeploy so
the Next.js route handlers pick up the value. Do not use `NEXT_PUBLIC_API_URL`
for this integration. The browser calls the same-origin `/api/*` routes, and
those server-side handlers call the AWS API origin.

This is intentionally not a `NEXT_PUBLIC_*` variable because the backend
origin is used by server-side route handlers.

### Device ID

The browser creates one device ID and stores it in local storage under
`retailor.deviceId`. It is sent as the `x-device-id` header on all LLM-backed
requests:

- Resume parsing
- Job-description analysis
- Resume tailoring

The identifier is used for abuse prevention and is not authentication or an
account identity.

## API Proxy Routes

The frontend exposes these same-origin routes:

| Frontend route         | Backend route      | Purpose                              |
| ---------------------- | ------------------ | ------------------------------------ |
| `POST /api/parse`      | `POST /parse`      | Parse a PDF or DOCX resume           |
| `POST /api/analyze-jd` | `POST /analyze-jd` | Extract job details and requirements |
| `POST /api/tailor`     | `POST /tailor`     | Tailor the reviewed resume and JD    |

The proxy routes forward the backend response status and return a normalized
error shape when the upstream service is unavailable.

## Project Structure

```text
app/
  api/
    analyze-jd/       Job-description analysis proxy
    parse/            Resume parsing proxy
    tailor/           Tailoring proxy
  how-it-works/       Product flow explainer
  privacy/            Privacy policy
  terms/              Terms of use
  globals.css         Design tokens and global styles
  layout.tsx          Root layout and metadata
  page.tsx            Main workflow route

components/
  navbar.tsx          Shared sticky navigation
  workflow.tsx        Main workflow state and UI
  wordmark.tsx        Retailor wordmark

lib/
  api.ts              Typed API request helpers and device ID
  types.ts            Resume and job-description models
  sample.ts            Clearly labeled synthetic sample data
```

## Design Direction

Retailor uses an annotated-document visual language:

- Near-white workspace background
- White editing surfaces
- Dark charcoal typography
- Strong blue actions and focus states
- Restrained coral warnings
- Muted green completion states
- Thin borders and subtle shadows
- Narrow desktop workflow rail
- Compact mobile progress indicator
- Side-by-side desktop result comparison
- Tailored-first result view on mobile

The interface avoids generic dashboard layouts, purple gradients, decorative AI
effects, fake analytics, and chat-first interactions.

## Privacy and Data Handling

Retailor handles resumes that may contain names, contact details, employment
history, education, and other personal information. Before sharing the tool,
review the full [Privacy Policy](/privacy) and [Terms of Use](/terms).

Important data-flow details:

- Uploaded resumes are sent to the configured backend for parsing.
- Resume and job-description content may be sent by the backend to the
  configured external LLM integration, including the Azure AI Foundry /
  GPT-5 mini provider path.
- Generated DOCX exports are stored temporarily, such as in S3-compatible object
  storage, and are accessed through short-lived download URLs.
- The browser stores only the minimum workflow state needed to preserve the
  current session and a device ID for abuse prevention.
- Resume and job-description content is not sent to analytics services by the
  frontend and is not written to frontend logs.

Do not upload content unless you are comfortable with this processing flow.

## Error Handling

The UI handles the documented backend status codes as follows:

- `400`: Shows the backend's human-readable validation message near the related
  action or field.
- `413`: Explains file or request-size limits.
- `429`: Explains that the daily quota has been reached.
- `502` and `503`: Shows a temporary service message and keeps the current
  workflow state intact so the user can retry.

The frontend does not display stack traces or raw provider errors.

## Available Pages

- `/` - Main five-step application workflow
- `/how-it-works` - Product flow explanation
- `/privacy` - Privacy and data-processing disclosure
- `/terms` - Terms of use

The sticky navigation is shared across these pages and includes links to the
workflow, the how-it-works page, the portfolio site, Privacy, and Terms.

## Verification

Run the TypeScript check:

```bash
npx tsc --noEmit
```

Run the production build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Run the Impeccable visual detector against changed UI files when making visual
changes:

```bash
.opencode/skills/impeccable/scripts/impeccable detect --json app/page.tsx app/globals.css components/workflow.tsx
```

## Related Documentation

- [`docs/frontend-context.md`](docs/frontend-context.md) - Product behavior,
  interaction rules, visual direction, privacy principles, and responsive
  requirements
- [`docs/frontend-api-contract.md`](docs/frontend-api-contract.md) - Immutable
  frontend/backend integration contract
- [`docs/frontend-agent-prompt.md`](docs/frontend-agent-prompt.md) - Frontend
  implementation brief
- [`PRODUCT.md`](PRODUCT.md) - Product positioning and constraints
- [`DESIGN.md`](DESIGN.md) - Design-system and code-organization guidance
