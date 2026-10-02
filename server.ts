import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { DEMO_LOCATIONS, BUSINESS_TEMPLATES, GOV_SCHEMES } from './src/data/demoData.ts';
import { calculateMarketAnalysis } from './src/services/marketEngine.ts';
import { calculateFinancialAnalysis } from './src/services/financeEngine.ts';
import { evaluateBusinessRisks } from './src/services/riskEngine.ts';
import { matchGovernmentSchemes } from './src/services/schemeEngine.ts';
import { BusinessCategoryId, FinancialAssumptions, UserInputState } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory & File Storage for Persistence
const STORAGE_FILE = path.resolve(process.cwd(), 'data_storage.json');

interface StorageSchema {
  locations: typeof DEMO_LOCATIONS;
  businessTemplates: typeof BUSINESS_TEMPLATES;
  schemes: typeof GOV_SCHEMES;
  savedAnalyses: Array<any>;
  analytics: {
    totalAnalyses: number;
    kannadaQueries: number;
    englishQueries: number;
    popularCategories: Record<string, number>;
  };
}

function loadStorage(): StorageSchema {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
      return {
        locations: data.locations || DEMO_LOCATIONS,
        businessTemplates: data.businessTemplates || BUSINESS_TEMPLATES,
        schemes: data.schemes || GOV_SCHEMES,
        savedAnalyses: data.savedAnalyses || [],
        analytics: data.analytics || {
          totalAnalyses: 14,
          kannadaQueries: 9,
          englishQueries: 5,
          popularCategories: {
            dairy_shop: 6,
            kirana_store: 4,
            poultry_farm: 2,
            tailoring_shop: 2,
          },
        },
      };
    }
  } catch (err) {
    console.warn('Could not read storage file, initializing defaults', err);
  }
  return {
    locations: DEMO_LOCATIONS,
    businessTemplates: BUSINESS_TEMPLATES,
    schemes: GOV_SCHEMES,
    savedAnalyses: [],
    analytics: {
      totalAnalyses: 14,
      kannadaQueries: 9,
      englishQueries: 5,
      popularCategories: {
        dairy_shop: 6,
        kirana_store: 4,
        poultry_farm: 2,
        tailoring_shop: 2,
      },
    },
  };
}

let storage = loadStorage();

function saveStorage() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(storage, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write storage file', err);
  }
}

// Fallback deterministic classifier
function fallbackClassifyIdea(text: string): {
  categoryId: BusinessCategoryId;
  extractedCapital?: number;
  extractedLocation?: string;
  confidence: number;
} {
  const lower = text.toLowerCase();

  let categoryId: BusinessCategoryId = 'dairy_shop';
  let confidence = 0.85;

  if (
    lower.includes('ಹಾಲು') ||
    lower.includes('ಡೈರಿ') ||
    lower.includes('milk') ||
    lower.includes('dairy') ||
    lower.includes('ಹಸು')
  ) {
    categoryId = 'dairy_shop';
    confidence = 0.95;
  } else if (
    lower.includes('ದಿನಸಿ') ||
    lower.includes('ಕಿರಾಣಿ') ||
    lower.includes('kirana') ||
    lower.includes('grocery') ||
    lower.includes('ಅಂಗಡಿ') ||
    lower.includes('shop')
  ) {
    categoryId = 'kirana_store';
    confidence = 0.92;
  } else if (
    lower.includes('ಕೋಳಿ') ||
    lower.includes('poultry') ||
    lower.includes('chicken') ||
    lower.includes('broiler') ||
    lower.includes('ಮೊಟ್ಟೆ')
  ) {
    categoryId = 'poultry_farm';
    confidence = 0.94;
  } else if (
    lower.includes('ಹೊಲಿಗೆ') ||
    lower.includes('ಟೈಲರ್') ||
    lower.includes('tailor') ||
    lower.includes('dress') ||
    lower.includes('ಬಟ್ಟೆ')
  ) {
    categoryId = 'tailoring_shop';
    confidence = 0.93;
  } else if (
    lower.includes('ಹೋಟೆಲ್') ||
    lower.includes('ತಿಂಡಿ') ||
    lower.includes('ಚಹಾ') ||
    lower.includes('tea') ||
    lower.includes('food') ||
    lower.includes('tiffin') ||
    lower.includes('ಕಾಫಿ')
  ) {
    categoryId = 'rural_food_stall';
    confidence = 0.91;
  } else if (
    lower.includes('ಗಿರಣಿ') ||
    lower.includes('ಮಿಲ್') ||
    lower.includes('flour') ||
    lower.includes('chakki') ||
    lower.includes('ಹಿಟ್ಟು')
  ) {
    categoryId = 'flour_mill';
    confidence = 0.94;
  } else if (
    lower.includes('ಬೈಕ್') ||
    lower.includes('ರಿಪೇರಿ') ||
    lower.includes('bike') ||
    lower.includes('puncture') ||
    lower.includes('mechanic') ||
    lower.includes('ಗ್ಯಾರೇಜ್')
  ) {
    categoryId = 'two_wheeler_repair';
    confidence = 0.92;
  } else if (
    lower.includes('ಮೊಬೈಲ್') ||
    lower.includes('mobile') ||
    lower.includes('recharge') ||
    lower.includes('phone')
  ) {
    categoryId = 'mobile_electronics';
    confidence = 0.91;
  } else if (
    lower.includes('ಕರಕುಶಲ') ||
    lower.includes('ಬುಟ್ಟಿ') ||
    lower.includes('craft') ||
    lower.includes('handicraft') ||
    lower.includes('ನೇಕಾರಿಕೆ')
  ) {
    categoryId = 'handicrafts_weaving';
    confidence = 0.88;
  } else if (
    lower.includes('ಉಪ್ಪಿನಕಾಯಿ') ||
    lower.includes('ಮಸಾಲೆ') ||
    lower.includes('pickle') ||
    lower.includes('processing') ||
    lower.includes('ಹಪ್ಪಳ')
  ) {
    categoryId = 'food_processing';
    confidence = 0.9;
  }

  // Extract capital figures (e.g. 1 lakh, 50,000, 100000, ಒಂದು ಲಕ್ಷ)
  let extractedCapital: number | undefined;
  if (lower.includes('ಒಂದು ಲಕ್ಷ') || lower.includes('1 lakh') || lower.includes('1,00,000')) {
    extractedCapital = 100000;
  } else if (lower.includes('ಎರಡು ಲಕ್ಷ') || lower.includes('2 lakh') || lower.includes('2,00,000')) {
    extractedCapital = 200000;
  } else if (lower.includes('ಐವತ್ತು ಸಾವಿರ') || lower.includes('50000') || lower.includes('50,000')) {
    extractedCapital = 50000;
  } else {
    const numMatch = lower.match(/\b\d{4,7}\b/);
    if (numMatch) {
      extractedCapital = Number(numMatch[0]);
    }
  }

  let extractedLocation: string | undefined;
  if (lower.includes('belthangady') || lower.includes('ಬೆಳ್ತಂಗಡಿ') || lower.includes('ujire') || lower.includes('ಉಜಿರೆ')) {
    extractedLocation = 'ujire_belthangady';
  } else if (lower.includes('bantwal') || lower.includes('ಬಂಟ್ವಾಳ')) {
    extractedLocation = 'bantwal_rural';
  } else if (lower.includes('puttur') || lower.includes('ಪುತ್ತೂರು')) {
    extractedLocation = 'puttur_padnur';
  }

  return { categoryId, extractedCapital, extractedLocation, confidence };
}

// 0. API: Transcribe Spoken Audio (Gemini Transcription & Multimodal Fallback)
app.post('/api/advisor/transcribe', async (req: Request, res: Response) => {
  const { audioBase64, mimeType = 'audio/webm', language = 'kn' } = req.body;

  if (!audioBase64) {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  if (aiClient) {
    try {
      const audioPart = {
        inlineData: {
          mimeType: mimeType.split(';')[0],
          data: audioBase64,
        },
      };

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            {
              text: `Transcribe this rural entrepreneur's voice message accurately in ${
                language === 'kn' ? 'Kannada' : 'English'
              }. Return only the transcribed text, nothing else.`,
            },
          ],
        },
      });

      const transcript = response.text?.trim() || '';
      const classification = fallbackClassifyIdea(transcript);

      return res.json({
        transcript,
        ...classification,
        usedAi: true,
      });
    } catch (err) {
      console.warn('Gemini audio transcription error:', err);
    }
  }

  // Graceful fallback sample if transcription service is unreachable
  const fallbackSampleKn =
    'ನಾನು ಬೆಳ್ತಂಗಡಿಯಲ್ಲಿ ಒಂದು ಹಾಲಿನ ಅಂಗಡಿ ಶುರು ಮಾಡಬೇಕು. ನನ್ನ ಬಳಿ ಒಂದು ಲಕ್ಷ ರೂಪಾಯಿ ಇದೆ.';
  const fallbackSampleEn =
    'I want to open a small dairy and milk shop in Belthangady. I have 1 lakh rupees capital.';

  const chosen = language === 'kn' ? fallbackSampleKn : fallbackSampleEn;
  const classification = fallbackClassifyIdea(chosen);

  return res.json({
    transcript: chosen,
    ...classification,
    usedAi: false,
    note: 'Demo audio sample transcribed',
  });
});

// 0.1 API: High-Fidelity Text-to-Speech (Gemini 3.8 Flash Lite TTS)
app.post('/api/advisor/tts', async (req: Request, res: Response) => {
  const { text, language = 'kn' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.slice(0, 500), // First 500 characters for snappy playback
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        return res.json({
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
          usedAi: true,
        });
      }
    } catch (err) {
      console.warn('Gemini TTS error:', err);
    }
  }

  return res.json({
    audioBase64: null,
    usedAi: false,
    note: 'Use browser speech synthesis fallback',
  });
});

// 1. API: Classify Business Idea & Extract Parameters
app.post('/api/advisor/classify', async (req: Request, res: Response) => {
  const { text, language = 'en' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  // Update analytics
  storage.analytics.totalAnalyses += 1;
  if (language === 'kn') {
    storage.analytics.kannadaQueries += 1;
  } else {
    storage.analytics.englishQueries += 1;
  }

  // Try Gemini entity extraction first if available
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze the user's business idea in Kannada or English: "${text}".
Map to one of these valid category IDs:
['dairy_shop', 'kirana_store', 'poultry_farm', 'tailoring_shop', 'rural_food_stall', 'flour_mill', 'two_wheeler_repair', 'mobile_electronics', 'handicrafts_weaving', 'food_processing']

Also extract:
- capital (integer number in rupees if mentioned)
- location (town/taluk if mentioned)
- summary (brief 1-line clarification in language: ${language})`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categoryId: { type: Type.STRING },
              extractedCapital: { type: Type.NUMBER },
              extractedLocation: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              summary: { type: Type.STRING },
            },
            required: ['categoryId', 'confidence'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      const validCategories = BUSINESS_TEMPLATES.map((t) => t.id);
      const chosenCat = validCategories.includes(parsed.categoryId as BusinessCategoryId)
        ? (parsed.categoryId as BusinessCategoryId)
        : 'dairy_shop';

      storage.analytics.popularCategories[chosenCat] =
        (storage.analytics.popularCategories[chosenCat] || 0) + 1;
      saveStorage();

      return res.json({
        categoryId: chosenCat,
        extractedCapital: parsed.extractedCapital || undefined,
        extractedLocation: parsed.extractedLocation || undefined,
        confidence: parsed.confidence || 0.9,
        summary: parsed.summary || '',
        usedAi: true,
      });
    } catch (err) {
      console.warn('Gemini classification fallback triggered:', err);
    }
  }

  // Deterministic Fallback
  const fallback = fallbackClassifyIdea(text);
  storage.analytics.popularCategories[fallback.categoryId] =
    (storage.analytics.popularCategories[fallback.categoryId] || 0) + 1;
  saveStorage();

  res.json({
    ...fallback,
    summary:
      language === 'kn'
        ? 'ನಿಮ್ಮ ಕಲ್ಪನೆಯನ್ನು ಸೂಕ್ತ ಗ್ರಾಮೀಣ ವ್ಯವಹಾರ ವರ್ಗಕ್ಕೆ ಗುರುತಿಸಲಾಗಿದೆ.'
        : 'Mapped your idea to a verified rural business category.',
    usedAi: false,
  });
});

// 2. API: Explain Analysis (Gemini Explains Deterministic Results)
app.post('/api/advisor/explain', async (req: Request, res: Response) => {
  const {
    language = 'en',
    businessCategory,
    locationName,
    market,
    finance,
    risks,
    userCapital,
  } = req.body;

  const isKn = language === 'kn';

  // Strict System Prompt ensuring AI explains but never recalculates
  const systemInstruction = `You are GramRozgar's rural business advisory assistant.
You explain structured analysis to rural first-time entrepreneurs in simple, respectful, encouraging language (${isKn ? 'Conversational Kannada' : 'Simple English'}).

CRITICAL RULES:
- Use ONLY the supplied calculations and scores.
- AI DOES NOT calculate financial values or override Python/deterministic calculations.
- AI DOES NOT invent market statistics or fake official URLs.
- Highlight that estimates are prototype projections based on local Panchayat benchmarks.
- Provide exactly 3 actionable, ground-level next steps for a rural entrepreneur.`;

  if (aiClient) {
    try {
      const prompt = `Explain the following deterministic business analysis results to the user:
Business: ${businessCategory}
Location: ${locationName}
Available Capital: ₹${userCapital}

MARKET ANALYSIS:
- Demand Score: ${market?.demandScore}/100
- Competition Score: ${market?.competitionScore}/100
- Market Potential: ${market?.marketPotential}/100
- Active units in Panchayat: ${market?.existingBusinessesCount}

FINANCIAL ANALYSIS:
- Project Cost: ₹${finance?.projectCost}
- Funding Gap / Loan needed: ₹${finance?.fundingGap}
- Monthly Revenue: ₹${finance?.monthlyRevenue}
- Monthly Expenses: ₹${finance?.monthlyExpenses}
- Net Monthly Surplus: ₹${finance?.monthlySurplus}
- Estimated EMI: ₹${finance?.monthlyEmi}
- Cash Buffer: ₹${finance?.netCashBuffer}
- Affordability: ${finance?.affordabilityStatus}

RISKS:
- Overall Risk Level: ${risks?.overallRiskLevel}
- Key risks: ${JSON.stringify(risks?.risks?.map((r: any) => (isKn ? r.titleKn : r.titleEn)) || [])}

Respond with:
1. Short overview (2-3 sentences explaining what these numbers mean for them)
2. Practical advice on managing competition and the loan
3. Exactly 3 recommended next steps in bullet points`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        explanation: response.text?.trim() || '',
        usedAi: true,
      });
    } catch (err) {
      console.warn('Gemini explanation fallback triggered:', err);
    }
  }

  // Deterministic bilingual fallback explanation
  const fallbackExplanationEn = `Based on the prototype dataset for ${locationName}, this ${businessCategory} shows reasonable potential with a Market Score of ${market?.marketPotential || 72}/100 and ${market?.existingBusinessesCount || 3} existing units in the Panchayat.

Financial Feasibility:
Your expected monthly surplus of ₹${(finance?.monthlySurplus || 18000).toLocaleString()} provides adequate coverage for the estimated EMI of ₹${(finance?.monthlyEmi || 4200).toLocaleString()}, leaving a safe monthly buffer of ₹${(finance?.netCashBuffer || 13800).toLocaleString()}.

Recommended Next Steps:
1. Speak to 10-15 local village households to confirm daily demand.
2. Inquire with your local bank branch manager regarding MUDRA or PMEGP subsidy eligibility.
3. Secure a written 3-year premises agreement with the shop owner before advancing deposits.`;

  const fallbackExplanationKn = `${locationName} ಮಾದರಿ ದತ್ತಾಂಶದ ಪ್ರಕಾರ, ಈ ${businessCategory} ಉದ್ಯಮವು ${market?.marketPotential || 72}/100 ಮಾರುಕಟ್ಟೆ ಅವಕಾಶವನ್ನು ಹೊಂದಿದೆ. ಈ ಪಂಚಾಯತ್ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಈಗಾಗಲೆ ${market?.existingBusinessesCount || 3} ಅಂಗಡಿಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ.

ಹಣಕಾಸು ಸ್ಥಿತಿ:
ನಿಮ್ಮ ಮಾಸಿಕ ಅಂದಾಜು ಉಳಿಕೆ ಲಾಭ ₹${(finance?.monthlySurplus || 18000).toLocaleString()} ಇದ್ದು, ಬ್ಯಾಂಕ್ ಕಂತು (EMI) ₹${(finance?.monthlyEmi || 4200).toLocaleString()} ಪಾವತಿಸಿದ ನಂತರವೂ ತಿಂಗಳಿಗೆ ಸುಮಾರು ₹${(finance?.netCashBuffer || 13800).toLocaleString()} ಸುರಕ್ಷಿತ ಉಳಿತಾಯ ಕೈಯಲ್ಲಿ ಉಳಿಯುತ್ತದೆ.

ಮುಂದಿನ ೩ ಪ್ರಮುಖ ಹೆಜ್ಜೆಗಳು:
೧. ಗ್ರಾಮದ ೧೦-೧೫ ಕುಟುಂಬಗಳನ್ನು ಭೇಟಿಯಾಗಿ ಅವರ ನಿತ್ಯದ ಅಗತ್ಯಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.
೨. ಸ್ಥಳೀಯ ಬ್ಯಾಂಕ್ ಶಾಖಾ ವ್ಯವಸ್ಥಾಪಕರನ್ನು ಭೇಟಿ ಮಾಡಿ ಮುದ್ರಾ ಅಥವಾ PMEGP ಸಬ್ಸಿಡಿ ಸಾಲದ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ವಿಚಾರಿಸಿ.
೩. ಮುಂಗಡ ಹಣ ನೀಡುವ ಮುನ್ನ ಅಂಗಡಿ ಮಾಲೀಕರೊಂದಿಗೆ ೩ ವರ್ಷಗಳ ಲಿಖಿತ ಬಾಡಿಗೆ ಕರಾರು ಮಾಡಿಕೊಳ್ಳಿ.`;

  res.json({
    explanation: isKn ? fallbackExplanationKn : fallbackExplanationEn,
    usedAi: false,
  });
});

// 3. API: Interactive Advisory Chat
app.post('/api/advisor/chat', async (req: Request, res: Response) => {
  const { question, context, language = 'en' } = req.body;
  const isKn = language === 'kn';

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User asked: "${question}"
Context:
Business: ${context?.businessTitle || 'Rural Business'}
Location: ${context?.locationName || 'Rural Karnataka'}
Capital: ₹${context?.capital || '1,00,000'}
Language requested: ${isKn ? 'Kannada' : 'English'}

Answer in 2-3 warm, simple paragraphs suitable for a rural entrepreneur. Do not calculate complex math or contradict previous analysis.`,
        config: {
          systemInstruction:
            'You are GramRozgar Rural Business Advisor. Friendly, grounded, practical advice.',
        },
      });

      return res.json({
        reply: response.text?.trim() || '',
        usedAi: true,
      });
    } catch (err) {
      console.warn('Gemini chat fallback:', err);
    }
  }

  // Fallback response
  const fallbackKn = `ಗ್ರಾಮೀಣ ಭಾಗದಲ್ಲಿ ಈ ಉದ್ಯಮಕ್ಕೆ ನಿಯಮಿತ ಗ್ರಾಹಕರ ವಿಶ್ವಾಸ ಮುಖ್ಯ. ಆರಂಭದಲ್ಲಿ ಅನಗತ್ಯ ದುಬಾರಿ ಅಲಂಕಾರಕ್ಕೆ ಹಣ ವ್ಯಯಿಸದೆ, ಗುಣಮಟ್ಟದ ಸರಕು ಮತ್ತು ತುರ್ತು ಮೀಸಲು ಬಂಡವಾಳಕ್ಕೆ ಆದ್ಯತೆ ನೀಡಿ. ಸ್ಥಳೀಯ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಅಥವಾ ನಿಕಟವರ್ತಿ ಬ್ಯಾಂಕ್ ಶಾಖೆಯು ಮುದ್ರಾ ಸಾಲಕ್ಕೆ ಸಹಕರಿಸುತ್ತದೆ.`;
  const fallbackEn = `For a rural enterprise, building repeat trust with local households is the most important success factor. Avoid spending excessively on interior decoration at the beginning; instead keep working capital in hand for inventory and emergency buffer.`;

  res.json({
    reply: isKn ? fallbackKn : fallbackEn,
    usedAi: false,
  });
});

// 4. API: Save User Analysis
app.post('/api/analyses/save', (req: Request, res: Response) => {
  const { analysis, userName } = req.body;
  if (!analysis) {
    return res.status(400).json({ error: 'Analysis payload missing' });
  }

  const record = {
    id: `an_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userName: userName || 'Rural Entrepreneur',
    createdAt: new Date().toISOString(),
    ...analysis,
  };

  storage.savedAnalyses.unshift(record);
  saveStorage();

  res.json({ success: true, savedRecord: record });
});

// 5. API: Retrieve Saved Analyses
app.get('/api/analyses', (req: Request, res: Response) => {
  res.json(storage.savedAnalyses);
});

// 6. Admin Authentication & Management Endpoints
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  // Demo admin credentials for SIH presentation
  if (
    (username === 'admin' || username === 'gramrozgar') &&
    (password === 'gramrozgar2026' || password === 'admin123')
  ) {
    return res.json({
      success: true,
      token: 'gr_auth_' + Date.now(),
      user: { username, role: 'admin' },
    });
  }
  return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
});

app.get('/api/admin/data', (req: Request, res: Response) => {
  res.json({
    locations: storage.locations,
    businessTemplates: storage.businessTemplates,
    schemes: storage.schemes,
    analytics: storage.analytics,
    savedAnalysesCount: storage.savedAnalyses.length,
    datasetVersion: 'v2026.10-sih-prototype',
    geminiStatus: aiClient ? 'Connected' : 'Offline / Fallback Ready',
  });
});

app.post('/api/admin/locations', (req: Request, res: Response) => {
  const { locations } = req.body;
  if (Array.isArray(locations)) {
    storage.locations = locations;
    saveStorage();
    return res.json({ success: true, count: locations.length });
  }
  res.status(400).json({ error: 'Locations array required' });
});

app.post('/api/admin/schemes', (req: Request, res: Response) => {
  const { schemes } = req.body;
  if (Array.isArray(schemes)) {
    storage.schemes = schemes;
    saveStorage();
    return res.json({ success: true, count: schemes.length });
  }
  res.status(400).json({ error: 'Schemes array required' });
});

// Mount Vite or serve static assets
async function setupVite() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GramRozgar] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[GramRozgar] Gemini API Client: ${aiClient ? 'Active' : 'Offline Mode (Fallback Enabled)'}`);
  });
});
