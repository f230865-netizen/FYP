# FYP Project Guide — AI-Powered Multimodal Data Cleaning Web Application

> This document contains everything the team needs to understand, build, and divide the project.
> Read this fully before writing any code.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What Makes This Different From Competitors](#2-what-makes-this-different-from-competitors)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Team Division of Work](#5-team-division-of-work)
6. [Database Schema](#6-database-schema)
7. [Tabular Data Pipeline](#7-tabular-data-pipeline)
8. [Image Data Pipeline](#8-image-data-pipeline)
9. [Data Quality Index (DQI)](#9-data-quality-index-dqi)
10. [AI Suggestion Engine](#10-ai-suggestion-engine)
11. [User Authentication](#11-user-authentication)
12. [User Onboarding and Preferences](#12-user-onboarding-and-preferences)
13. [PDF Report Generation](#13-pdf-report-generation)
14. [API Routes Reference](#14-api-routes-reference)
15. [Project Folder Structure](#15-project-folder-structure)
16. [Development Workflow](#16-development-workflow)
17. [Recommended Build Order](#17-recommended-build-order)

---

## 1. Project Overview

**Name:** DataClean AI — Multimodal Intelligent Data Cleaning Web Application

**What it does:**
A web application where users upload any dataset (CSV, Excel, or image folder), and the system:
1. Detects the data modality (tabular or image) automatically
2. Profiles every column or image for quality issues
3. Ranks columns/images by a Data Quality Index (DQI) score — dirtiest first
4. Suggests AI-generated cleaning techniques per column/image with explanations
5. Lets the user confirm, override, or adjust each suggestion
6. Cleans the data and shows before/after comparison
7. Generates a downloadable PDF report with graphs, audit log, and DQI scores

**Key principle:** The user is always in control. The AI suggests, the user decides.

**Data privacy:** Uploaded datasets are processed in memory and deleted immediately after the session. Nothing is permanently stored on the server.

---

## 2. What Makes This Different From Competitors

| Feature | Rose.ai | Trifacta | OpenRefine | Julius AI | **Our Project** |
|---|---|---|---|---|---|
| User login + accounts | ✓ | ✓ | ✗ | ✓ | ✓ |
| Skill level detection | ✗ | ✗ | ✗ | ✗ | ✓ |
| Persistent AI preferences | ✗ | ✗ | ✗ | ✗ | ✓ |
| Column-level AI dialogue | ✗ | ✗ | ✗ | ✗ | ✓ |
| Multimodal (tabular + image) | ✗ | ✗ | ✗ | ✗ | ✓ |
| Data Quality Index scoring | ✗ | ✗ | ✗ | ✗ | ✓ |
| Before/after DQI comparison | ✗ | ✗ | ✗ | ✗ | ✓ |
| PDF report with audit log | ✗ | ✗ | ✗ | ✗ | ✓ |
| Image label verification (CLIP) | ✗ | ✗ | ✗ | ✗ | ✓ |
| Free / open source | ✗ | ✗ | ✓ | ✗ | ✓ |

**Our two strongest differentiators:**
- Column-level interactive AI dialogue with persistent user preferences
- Unified multimodal pipeline (tabular + image) with a single quality scoring system

---

## 3. System Architecture

```
[ React Frontend - Port 5173 ]
        |
        | HTTP (Axios)
        |
[ FastAPI Backend - Port 8000 ]
        |
   _____|______________________
  |           |                |
  |           |                |
[ PostgreSQL ] [ AI Layer ]  [ File Processing ]
  Database    |                |
              |-- Anthropic    |-- Tabular Pipeline
              |   API (Claude) |   (pandas, sklearn)
              |                |
              |-- CLIP Model   |-- Image Pipeline
                  (local,          (CleanVision,
                   HuggingFace)     OpenCV, Pillow)
```

**How a cleaning session works:**
1. User uploads file → Frontend sends it to `/api/upload`
2. Backend detects modality (tabular or image)
3. Backend profiles the data and computes DQI scores
4. Backend calls Anthropic API with column profiles → gets suggestions
5. Suggestions sent back to Frontend as JSON
6. User reviews each suggestion in the UI, confirms or overrides
7. Backend runs the actual cleaning based on confirmed decisions
8. Backend generates PDF report
9. Frontend offers download link
10. Server deletes uploaded file

---

## 4. Technology Stack

### Backend (Python)
| Library | Purpose |
|---|---|
| FastAPI | Web framework, API routes |
| Uvicorn | Server that runs FastAPI |
| SQLAlchemy | Database ORM |
| Alembic | Database migrations |
| psycopg2-binary | PostgreSQL driver |
| pandas | All tabular data operations |
| numpy | Numerical computations |
| scikit-learn | KNN imputer, outlier detection |
| chardet | File encoding detection |
| python-magic | File type / MIME detection |
| rapidfuzz | Fuzzy duplicate detection |
| Pillow | Image loading and verification |
| opencv-python | Blur detection, brightness analysis |
| imagehash | Perceptual hash duplicate detection |
| cleanvision | Image quality audit (blur, corruption, duplicates) |
| transformers + torch | CLIP model for image label verification |
| anthropic | Claude API for AI suggestions |
| fastapi-users | Authentication (register, login, JWT) |
| pyjwt + bcrypt | Token generation and password hashing |
| reportlab | PDF generation |
| matplotlib | Charts inside PDF |
| python-dotenv | Load .env environment variables |
| aiofiles | Async file handling |

### Frontend (React)
| Library | Purpose |
|---|---|
| React + Vite | Main UI framework |
| Tailwind CSS | Styling |
| React Router DOM | Page navigation |
| Axios | HTTP calls to backend |
| React Dropzone | File and folder upload UI |
| Recharts | Charts and graphs in UI |
| TanStack Table | Paginated data preview table |

### Database
- **PostgreSQL** — main database
- Tables: users, user_profiles, user_preferences, audit_logs (see Section 6)

### AI Models
- **Anthropic Claude API** — tabular cleaning suggestions (cloud API)
- **CLIP by OpenAI** — image label verification (runs locally via HuggingFace transformers)
- **CleanVision by Cleanlab** — image quality audit (runs locally)

---

## 5. Team Division of Work

### Saad — Backend Core + AI Pipeline
**Files to own:**
- `backend/main.py`
- `backend/database.py`
- `backend/models.py`
- `backend/routers/upload.py`
- `backend/routers/tabular.py`
- `backend/routers/reports.py`
- `backend/services/profiler.py`
- `backend/services/dqi.py`
- `backend/services/cleaner.py`
- `backend/services/ai_suggestions.py`
- `backend/services/pdf_generator.py`

**Responsibilities:**
- File upload and modality detection
- Column profiling (data type, null %, semantic type, top values)
- DQI scoring formula and ranking
- All 8 stages of tabular cleaning pipeline
- Anthropic API integration for AI suggestions
- Audit log system
- PDF report generation with ReportLab

---

### Sister (Teammate 2) — Frontend + User Experience
**Files to own:**
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/pages/Onboarding.jsx`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Preferences.jsx`
- `frontend/src/pages/CleaningSession.jsx`
- `frontend/src/pages/Report.jsx`
- `frontend/src/components/UploadZone.jsx`
- `frontend/src/components/ColumnCard.jsx`
- `frontend/src/components/DQIChart.jsx`
- `frontend/src/components/SuggestionCard.jsx`
- `frontend/src/components/BeforeAfterTable.jsx`

**Responsibilities:**
- Login and signup pages with form validation
- Onboarding quiz UI (5 questions, skill level detection)
- File upload page with drag-and-drop
- Column ranking display (DQI bar chart, red/amber/green badges)
- AI suggestion dialogue per column (confirm / override buttons)
- User preferences settings panel
- Before/after comparison view
- PDF download button

---

### Teammate 3 — Image Pipeline + Authentication Backend
**Files to own:**
- `backend/routers/auth.py`
- `backend/routers/users.py`
- `backend/routers/image.py`
- `backend/services/image_cleaner.py`
- `backend/services/clip_verifier.py`
- `backend/services/auth_service.py`

**Responsibilities:**
- User registration and login API routes
- JWT token generation and validation
- Password hashing with bcrypt
- Image modality detection
- CleanVision integration for image quality audit
- Blur detection (Laplacian variance method)
- Perceptual hash duplicate detection
- Corruption detection
- Missing image detection (CSV label vs actual files)
- CLIP model integration for label verification
- Image DQI scoring

---

### How teammates connect their work
The only connection point between backend and frontend is the API. As long as the API routes return the agreed JSON structure, frontend and backend can be developed independently. Use `http://localhost:8000/docs` to see and test all backend routes.

---

## 6. Database Schema

```sql
-- Users table
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT now(),
    is_new_user BOOLEAN DEFAULT true
);

-- User profile (set during onboarding quiz)
CREATE TABLE user_profiles (
    user_id         UUID REFERENCES users(id),
    persona         TEXT,     -- student | analyst | scientist | business
    skill_level     TEXT,     -- beginner | intermediate | expert
    default_modality TEXT,    -- tabular | image | mixed
    ai_mode         TEXT,     -- explain_all | suggest | auto
    use_case        TEXT      -- ml | reporting | sharing
);

-- Persistent cleaning preferences
CREATE TABLE user_preferences (
    user_id             UUID REFERENCES users(id),
    numeric_impute      TEXT DEFAULT 'median',
    categorical_impute  TEXT DEFAULT 'mode',
    outlier_method      TEXT DEFAULT 'iqr',
    outlier_action      TEXT DEFAULT 'flag',
    auto_fix_types      BOOLEAN DEFAULT true,
    duplicate_action    TEXT DEFAULT 'ask',
    pdf_language        TEXT DEFAULT 'simple',
    blur_threshold      FLOAT DEFAULT 100.0,
    updated_at          TIMESTAMP DEFAULT now()
);

-- Audit log (every cleaning action is logged here)
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    session_id      UUID,
    timestamp       TIMESTAMP DEFAULT now(),
    column_name     TEXT,
    issue_detected  TEXT,
    technique_used  TEXT,
    ai_suggested    BOOLEAN,
    user_override   BOOLEAN,
    rows_affected   INTEGER,
    dqi_before      FLOAT,
    dqi_after       FLOAT
);
```

---

## 7. Tabular Data Pipeline

Run these 8 stages in order. Never skip or reorder them.

### Stage 1 — Ingest and Structural Validation
- Detect file encoding using chardet
- Detect delimiter automatically
- Drop entirely empty rows and columns
- Normalise column headers (lowercase, underscores)

### Stage 2 — Column Profiling
For every column compute:
- Data type (dtype)
- Null count and null percentage
- Unique count and unique percentage
- Top 5 most frequent values
- Semantic type (email, date, phone, numeric, categorical, free_text)
- DQI score (see Section 9)

### Stage 3 — Duplicate Row Detection
- Exact duplicates: `df.duplicated()`
- Fuzzy duplicates: RapidFuzz for string-heavy datasets
- Always ask user before removing

### Stage 4 — Data Type Fixing
- Detect numbers stored as strings → convert
- Detect dates stored as objects → convert
- Must happen before imputation

### Stage 5 — Missing Value Imputation
AI suggests technique based on profile. User confirms or overrides.

| Column type | Null % | Default technique | Alternatives |
|---|---|---|---|
| Numeric | <5% | Median | Mean, KNN, Drop rows |
| Numeric | 5–30% | KNN (k=5) | Median, MICE, Drop column |
| Numeric | >30% | Suggest drop | KNN, constant, flag only |
| Categorical | <10% | Mode | "Unknown" category, Drop |
| Categorical | >10% | "Missing" category | Mode, Drop column |
| Date | any | Forward fill | Backward fill, Drop |
| Free text | any | "N/A" placeholder | Drop rows, flag only |

### Stage 6 — Outlier Detection and Handling
- IQR method: lower = Q1 - 1.5×IQR, upper = Q3 + 1.5×IQR
- Offer user three choices: Cap (winsorize), Remove row, Flag only
- Never silently remove outliers

### Stage 7 — Inconsistency and Standardisation
- Normalise capitalisation and whitespace
- Standardise date formats
- Resolve synonym categories ("NY" vs "New York")

### Stage 8 — Post-Cleaning Validation
- Re-run profiler on cleaned data
- Compute DQI after for every column
- Show delta (DQI after − DQI before)

---

## 8. Image Data Pipeline

### What an image dataset looks like
A folder of image files plus either:
- Subfolders named by class (e.g. `dogs/`, `cats/`)
- A CSV file with columns: `filename`, `label`

### Five quality checks (in order)

| Check | Method | Library | Action |
|---|---|---|---|
| Corruption | `Image.verify()` throws exception | Pillow | Flag, exclude |
| Blur | Laplacian variance < threshold | OpenCV | Score + flag |
| Exposure | Mean pixel < 30 or > 225 | OpenCV / numpy | Flag |
| Near-duplicates | Perceptual hash, hamming distance ≤ 10 | ImageHash | Group, keep one |
| Wrong dimensions | Compare (w,h) vs dataset mode | Pillow | Flag inconsistent |

### Missing image detection
Compare filenames listed in the CSV label file against actual files in the folder. Any filename in the CSV that has no corresponding image file is flagged as missing.

### Label verification (CLIP)
- Load CLIP model locally via HuggingFace transformers (download once)
- For each image, pass image + text label to CLIP
- CLIP returns confidence score (0–1)
- If confidence < 0.5, flag as potentially mislabelled
- Show flagged images to user for manual review
- **Limitation:** Works well for general categories (animals, vehicles, objects). Less accurate for highly specialised scientific datasets (medical imaging, satellite data).

### CleanVision (recommended first step)
```python
from cleanvision import Imagelab
imagelab = Imagelab(data_path="path/to/image/folder/")
imagelab.find_issues()
report = imagelab.get_stats()  # DataFrame with per-image quality scores
```

---

## 9. Data Quality Index (DQI)

The DQI is our original academic contribution. It is a weighted score per column (tabular) or per dataset (image) on a 0–100 scale.

### Formula
```
DQI = 0.35 × Completeness
    + 0.25 × Validity
    + 0.20 × Consistency
    + 0.15 × Uniqueness
    + 0.05 × Uniformity
```

### Dimensions

| Dimension | Formula | Weight |
|---|---|---|
| Completeness | (non-null count / total rows) × 100 | 35% |
| Validity | (values passing type+format check / total) × 100 | 25% |
| Consistency | 100 − (mixed-format ratio × 100) | 20% |
| Uniqueness | 100 − (duplicate ratio × 100) | 15% |
| Uniformity | 100 − (whitespace/case-mismatch ratio × 100) | 5% |

### Traffic light system
- DQI < 50 → Red (critical, clean immediately)
- DQI 50–75 → Amber (moderate issues)
- DQI > 75 → Green (acceptable quality)

### Before/After delta
```
ΔDQI = DQI_after − DQI_before
```
This is the key evaluation metric. Include in the PDF report per column.
Example: "Column 'age': DQI improved from 44.2 → 91.7 (+47.5 points) after KNN imputation and outlier capping."

### Academic grounding
The five dimensions are based on the ISO 8000 data quality standard (completeness, validity, consistency, uniqueness, and conformity). Cite this standard if your supervisor asks for the theoretical basis.

---

## 10. AI Suggestion Engine

### Core principle
The AI never sees raw data. It only sees the statistical profile of each column. This protects user privacy and keeps API costs minimal.

### How it works
1. Column profiler computes: dtype, null %, unique %, semantic type, top values, DQI score
2. This profile is formatted as text and sent to the Anthropic API
3. Claude returns a JSON with: recommended technique, reason, alternatives, confidence, warnings
4. Frontend displays this as an interactive suggestion card
5. User clicks Confirm or selects an alternative
6. Backend runs the actual pandas cleaning code

### System prompt template
```
You are a data cleaning expert. Given a column profile from a dataset,
suggest the best cleaning technique. Always return valid JSON only.
Output format:
{
  "recommended": "technique_name",
  "reason": "one sentence explanation",
  "alternatives": [
    {"name": "alt_technique", "when_to_use": "explanation"}
  ],
  "confidence": 0.0-1.0,
  "warnings": ["any edge case warnings"]
}
```

### How user preferences affect the AI
User preferences are injected into the system prompt at the start of every session:
```
User's saved preferences:
- Numeric missing values: KNN imputation
- Outlier action: Cap (winsorize)
- Report style: Simple language

Only deviate from these preferences if there is a strong data-specific reason.
```

### Skill level affects AI tone
- Beginner: full plain-English explanations, no jargon
- Intermediate: brief explanation with technique name
- Expert: technique name only, no hand-holding

### Rule-based fallback
Always implement deterministic fallback logic (if-else based on dtype + null %) so the app works even if the API is unavailable.

---

## 11. User Authentication

**Library:** fastapi-users with SQLAlchemy backend  
**Method:** JWT tokens (stateless)  
**Password storage:** bcrypt hashing (never store plain text)

### Flow
1. User registers → password hashed → stored in users table
2. User logs in → credentials verified → JWT token returned
3. Frontend stores token in memory (not localStorage)
4. Every protected API request includes token in Authorization header
5. Backend validates token on every request

### Key routes
- `POST /auth/register` — create new account
- `POST /auth/login` — returns JWT token
- `GET /auth/me` — returns current user info (requires token)

---

## 12. User Onboarding and Preferences

### Onboarding quiz (shown once on first login only)

| Question | Options | Sets field |
|---|---|---|
| What describes you? | Student / Analyst / Data Scientist / Business | persona |
| Comfort with data cleaning? | Beginner / Basics / pandas user / Professional | skill_level |
| Usual data type? | Spreadsheets / Images / Survey data / Mixed | default_modality |
| How should AI suggestions work? | Explain all / Show and I decide / Auto | ai_mode |
| What do you do with clean data? | ML model / Charts / Share / Not sure | use_case |

Trigger: `is_new_user = true` in users table. Set to `false` after quiz completion.

### User Preferences panel (editable any time)
Settings stored in `user_preferences` table:
- Default numeric imputation method
- Default categorical imputation method
- Outlier detection method and action
- Auto-fix column types on/off
- Duplicate row handling
- PDF report language (simple / technical)
- Default graph types
- Image blur threshold

---

## 13. PDF Report Generation

**Library:** ReportLab  
**Generated at:** end of every cleaning session  
**Contents:**

1. **Cover page** — dataset name, date, user name, overall DQI before/after
2. **Dataset summary** — row count, column count, modality, file size
3. **DQI ranking chart** — bar chart of all columns sorted by DQI score
4. **Per-column report** — for each column: issue detected, technique used, DQI before/after, rows affected
5. **Audit log** — full table of every cleaning action with timestamps
6. **EDA graphs** — histograms, value distributions, missing value heatmap
7. **AI-generated summary** — plain English paragraph summarising what was done (generated by Claude)

---

## 14. API Routes Reference

| Method | Route | Description | Owner |
|---|---|---|---|
| POST | `/auth/register` | Register new user | Teammate 3 |
| POST | `/auth/login` | Login, returns JWT | Teammate 3 |
| GET | `/auth/me` | Get current user | Teammate 3 |
| POST | `/api/upload` | Upload dataset file | Saad |
| GET | `/api/profile/{session_id}` | Get column profiles + DQI | Saad |
| POST | `/api/suggest/{session_id}` | Get AI suggestions for all columns | Saad |
| POST | `/api/clean/{session_id}` | Apply confirmed cleaning decisions | Saad |
| GET | `/api/report/{session_id}` | Download PDF report | Saad |
| GET | `/api/users/profile` | Get user profile | Teammate 3 |
| POST | `/api/users/onboarding` | Save onboarding quiz answers | Teammate 3 |
| GET | `/api/users/preferences` | Get user preferences | Teammate 3 |
| PUT | `/api/users/preferences` | Update user preferences | Teammate 3 |
| POST | `/api/image/upload` | Upload image dataset folder | Teammate 3 |
| GET | `/api/image/audit/{session_id}` | Get image quality audit results | Teammate 3 |
| POST | `/api/image/verify/{session_id}` | Run CLIP label verification | Teammate 3 |

---

## 15. Project Folder Structure

```
FYP/
│
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # Database connection
│   ├── models.py                # SQLAlchemy table models
│   ├── create_tables.py         # Run once to create tables
│   ├── .env                     # Environment variables (never commit this)
│   ├── venv/                    # Python virtual environment (never commit)
│   │
│   ├── routers/                 # API route handlers
│   │   ├── auth.py              # Registration and login
│   │   ├── users.py             # Profile and preferences
│   │   ├── upload.py            # File upload and modality detection
│   │   ├── tabular.py           # Tabular cleaning routes
│   │   ├── image.py             # Image cleaning routes
│   │   └── reports.py           # PDF report generation
│   │
│   └── services/                # Business logic
│       ├── profiler.py          # Column profiling
│       ├── dqi.py               # DQI scoring
│       ├── cleaner.py           # Tabular cleaning pipeline
│       ├── ai_suggestions.py    # Anthropic API integration
│       ├── image_cleaner.py     # Image cleaning pipeline
│       ├── clip_verifier.py     # CLIP label verification
│       ├── pdf_generator.py     # ReportLab PDF builder
│       └── auth_service.py      # JWT and password logic
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       │
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Onboarding.jsx
│       │   ├── Dashboard.jsx
│       │   ├── CleaningSession.jsx
│       │   ├── Preferences.jsx
│       │   └── Report.jsx
│       │
│       └── components/
│           ├── UploadZone.jsx
│           ├── ColumnCard.jsx
│           ├── DQIChart.jsx
│           ├── SuggestionCard.jsx
│           └── BeforeAfterTable.jsx
│
└── docs/
    └── PROJECT_GUIDE.md         # This file
```

---

## 16. Development Workflow

### Daily routine for each team member
1. Before starting work: `git pull origin main`
2. Work on your assigned files only
3. Test your changes locally
4. Commit with a clear message: `git commit -m "Add column profiler service"`
5. Push: `git push origin main`
6. Tell teammates what you pushed via WhatsApp/Discord

### Communication rules
- Never push broken code to main
- If your code is unfinished, say so in your commit message
- Test every API route in `http://localhost:8000/docs` before pushing
- Frontend: test every page in `http://localhost:5173` before pushing

### Environment files
- Never commit `.env` files — they contain passwords and API keys
- Each team member creates their own `.env` file locally
- Share API keys privately via WhatsApp, not GitHub

---

## 17. Recommended Build Order

Follow this order. Each step builds on the previous one.

| Week | Task | Owner |
|---|---|---|
| 1–2 | Auth system (register, login, JWT) | Teammate 3 |
| 1–2 | Login + Register pages (frontend) | Sister |
| 1–2 | File upload route + modality detection | Saad |
| 3–4 | Column profiler service | Saad |
| 3–4 | DQI scoring per column | Saad |
| 3–4 | DQI ranking chart (frontend) | Sister |
| 5–6 | Tabular cleaning pipeline (all 8 stages) | Saad |
| 5–6 | Onboarding quiz UI | Sister |
| 5–6 | User preferences backend routes | Teammate 3 |
| 7–8 | Anthropic API integration | Saad |
| 7–8 | AI suggestion card UI | Sister |
| 7–8 | Image cleaning pipeline | Teammate 3 |
| 9–10 | CLIP label verification | Teammate 3 |
| 9–10 | Image results UI | Sister |
| 11–12 | PDF report generator | Saad |
| 11–12 | Before/after comparison UI | Sister |
| 13–14 | User preferences panel UI | Sister |
| 13–14 | Full end-to-end testing | All three |
| 15–16 | Bug fixes, polish, demo preparation | All three |

---

*This document was generated as part of the FYP project planning session. Update it as the project evolves.*
