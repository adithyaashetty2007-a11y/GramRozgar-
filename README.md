# GramRozgar (ಗ್ರಾಮರೋಜ್‌ಗಾರ್)
### Smart Business Guidance for Rural India

> **Core Trust Principle:**
> *"Data provides the evidence. Code performs the critical calculations. AI explains the results."*

---

## 1. Overview
**GramRozgar** is an AI-powered rural business advisory platform designed specifically for first-time rural entrepreneurs in India (with primary deep support for Karnataka Panchayats). It removes intimidation and technical barriers, guiding rural users from a simple spoken or typed business idea to a comprehensive feasibility analysis, financial breakdown, government subsidy matching, and bank-ready project report.

The primary user may have limited digital literacy. GramRozgar provides:
- Large, simple touch targets and conversational Kannada & English interfaces.
- One-click voice recognition (Web Speech API + Gemini ASR fallback).
- Transparent, deterministic mathematics: **Gemini explains the numbers, but code calculates the numbers.** AI never hallucinates financial figures or market statistics.
- Pre-curated verified Gram Panchayat demo datasets for SIH hackathon evaluation.

---

## 2. Key Features

- **Voice & Dual-Language Input**:
  - Conversational Kannada (e.g. *"ನಾನು ಬೆಳ್ತಂಗಡಿಯಲ್ಲಿ ಒಂದು ಹಾಲಿನ ಅಂಗಡಿ ಶುರು ಮಾಡಬೇಕು. ನನ್ನ ಬಳಿ ಒಂದು ಲಕ್ಷ ರೂಪಾಯಿ ಇದೆ."*) and English.
  - One-tap speech recognition with fallback to manual typing and pre-configured business templates.
- **Local Market Suitability Engine**:
  - Deterministic scoring for Demand, Competition, and Market Potential based on Panchayat household density and existing registered micro-enterprises.
  - Transparent rationale and confidence ratings.
- **Deterministic Financial Engine**:
  - Automatically calculates Project Cost, Capital, Funding Gap, Monthly Operating Revenue, Expenses, Net Monthly Surplus, Bank EMI, and Safety Buffer.
  - Live interactive sliders and steppers: any adjustment to revenue, expenses, loan tenure, or interest rates recalculates immediately in code.
- **What-If Stress Scenario Simulator**:
  - Side-by-side comparison of Base Case vs. Stress Case (-20% revenue drop and +10% cost inflation) to test solvency before committing capital.
- **Curated Government Scheme Matching**:
  - Real, verified central and state schemes including **PMEGP** (up to 35% rural subsidy), **Pradhan Mantri MUDRA Yojana** (Shishu/Kishore collateral-free loans), **PMFME**, **DAY-NRLM SHG linkage**, and **Karnataka Rajiv Gandhi Chaitanya Yojane**.
  - Direct links to official portals, eligibility checklists, and required document guidance.
- **Objective Risk Engine & Positive Indicators**:
  - Rule-based risk classification (Low, Medium, High) with practical rural mitigations and ground validation checklists.
- **Bank-Ready Report & Print / PDF**:
  - Printable official GramRozgar Business Feasibility Report formatted for bank managers and Gram Panchayat officers.
- **Multi-Business Account History**:
  - Save business ideas with entrepreneur name/mobile number; easily reopen and compare previous analyses without data loss.
- **Administration Console (`/admin`)**:
  - Secure admin portal to inspect panchayat catchment data, tweak business templates, edit schemes, and monitor live analytics (Kannada vs. English queries, popular business categories).

---

## 3. Architecture & Trust Boundary

```text
               USER (Voice or Text in Kannada / English)
                                  ↓
                        [ Express Server API ]
                                  ↓
    ┌─────────────────────────────┴─────────────────────────────┐
    ↓                                                           ↓
[ Entity Classification ]                             [ Curated Panchayat & ]
(Gemini / Deterministic NLP)                          [ Scheme Datasets     ]
    │                                                           │
    └─────────────────────────────┬─────────────────────────────┘
                                  ↓
                  [ Deterministic Engines (TypeScript) ]
                  ├── Market Engine (Catchment Math)
                  ├── Finance Engine (Amortization & Buffer)
                  ├── Risk Engine (Invariant Rules)
                  └── Scheme Engine (Category Filtering)
                                  ↓
                        Structured JSON Results
                                  ↓
                   [ Conversational AI Explainer ]
                     (@google/genai Gemini 3.8)
           *Strict safety instruction: Never modify math*
                                  ↓
          Interactive Frontend UI (React + Tailwind CSS)
            - 🔊 Audio Speech Output (Web Speech Synthesis)
            - Live What-If Sliders
            - Printable Official Report
```

---

## 4. SIH 2–4 Minute Presentation Demo Flow

1. **Homepage (0:00 - 0:45)**:
   - Select **ಕನ್ನಡ (Kannada)** or **English** in the top navigation.
   - Click the large green microphone button and speak or click the Kannada demo chip:
     *"ನಾನು ಬೆಳ್ತಂಗಡಿಯಲ್ಲಿ ಒಂದು ಹಾಲಿನ ಅಂಗಡಿ ಶುರು ಮಾಡಬೇಕು. ನನ್ನ ಬಳಿ ಒಂದು ಲಕ್ಷ ರೂಪಾಯಿ ಇದೆ."*
   - Select **Ujire Gram Panchayat, Belthangady** from the Demo Location selector.
   - Enter **₹1,00,000** as Available Capital. Click **"ವ್ಯಾಪಾರ ವಿಶ್ಲೇಷಿಸಿ" (Analyze My Business)**.

2. **Local Market Section (0:45 - 1:15)**:
   - Show the deterministic scores: Demand (78/100), Competition (62/100), Market Potential (72/100).
   - Point out the Panchayat household count (1,480 households) and 3 existing units.
   - Click 🔊 **"ಕೇಳಿ" (Listen)** to demonstrate conversational audio explanation.
   - Click **"ಹಣಕಾಸು ವಿವರಗಳನ್ನು ನೋಡಿ" (See Financial Feasibility)**.

3. **Financial Feasibility & What-If Simulator (1:15 - 2:00)**:
   - Highlight the calculated breakdown: Project Cost ₹1,50,000, Funding Gap ₹50,000, Monthly Revenue ₹65,000, Surplus ₹19,000, EMI ₹1,602, Net Buffer ₹17,398.
   - Click the **[ + ]** and **[ − ]** buttons on Revenue or Expenses to demonstrate instant, zero-latency code recalculation.
   - Review the **What-If Stress Case** showing what happens if revenue drops by 20%.
   - Click **"ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ" (Explore Government Schemes)**.

4. **Government Schemes & Risks (2:00 - 2:45)**:
   - View matched schemes: **PMEGP (35% rural subsidy)** and **MUDRA Shishu/Kishore**.
   - Show required documents checklist and official government link.
   - Advance to **Risks & Strengths** and **Next Steps Checklist**.

5. **Final Bank Report (2:45 - 3:30)**:
   - Show the complete, polished **GramRozgar Business Feasibility Report**.
   - Click **"ಪ್ರಿಂಟ್ / PDF ಡೌನ್‌ಲೋಡ್" (Print / Save as PDF)** to show the bank-ready formatting.
   - Open the **Admin Portal** or **AI Business Advisor Drawer** to demonstrate follow-up conversational questions in Kannada.

---

## 5. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Web Speech API (ASR & TTS).
- **Backend**: Node.js, Express, tsx.
- **AI Layer**: `@google/genai` TypeScript SDK (model `gemini-3.8-flash`) running exclusively server-side.
- **Data & Storage**: Curated JSON datastore with filesystem persistence; ready for PostgreSQL / Supabase connection via standard database configurations.
- **Design Philosophy**: Zero-pill discipline, WCAG AA legibility, 60-30-10 palette with calm agricultural stone and emerald accents, resilient fallback containers.

---

## 6. Getting Started Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
git clone https://github.com/your-username/gramrozgar.git
cd gramrozgar
npm install
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```
*(Note: If `GEMINI_API_KEY` is omitted, GramRozgar automatically runs in offline/fallback mode with rich deterministic natural-language explanations, ensuring zero presentation interruptions.)*

### Running Dev Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Running Tests
To verify all deterministic mathematical formulas and invariants:
```bash
npm test
```

---

## 7. Admin Console Credentials

Access the Admin Portal via the top-right shield icon or `/admin`:
- **Username**: `admin`
- **Password**: `gramrozgar2026`

Provides access to live query analytics, Gram Panchayat demographic models, scheme eligibility rules, and business financial baseline templates.

---

## 8. License
Apache-2.0
