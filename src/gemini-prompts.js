/**
 * gemini-prompts.js
 * Structured prompt templates for Gemini 2.5 Flash Vision API
 * Used by Apat-Mitra for injury classification and triage routing
 *
 * API endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
 * Called via Cloudflare Worker proxy — API key never exposed to frontend
 */

// ─── Response Schema ──────────────────────────────────────────────────────────
// All Gemini calls must return JSON matching this exact structure.
// If the model cannot determine a field, it must return null — never hallucinate.

export const RESPONSE_SCHEMA = {
  injury_type: "string",       // e.g. "bleeding", "burn", "fracture", "cpr"
  injury_label: "string",      // human-readable e.g. "Deep Laceration with Active Bleeding"
  confidence_score: "number",  // 0.0 to 1.0
  severity: "string",          // "mild" | "moderate" | "severe"
  protocol_id: "string",       // maps to /public/protocols/{protocol_id}.json
  immediate_warning: "string | null", // critical instruction if any, else null
  requires_cpr: "boolean",     // true only if patient is unresponsive + not breathing
}

// ─── Supported Injury Categories ─────────────────────────────────────────────
// These map directly to protocol JSON files in /public/protocols/

export const INJURY_CATEGORIES = [
  { id: "bleeding",  label: "Bleeding / Laceration",       protocol: "bleeding.json"  },
  { id: "burns",     label: "Thermal or Chemical Burn",    protocol: "burns.json"     },
  { id: "cpr",       label: "Cardiac Arrest / Drowning",   protocol: "cpr.json"       },
  { id: "fracture",  label: "Fracture / Bone Injury",      protocol: "fracture.json"  },
]

// ─── Confidence Gate ──────────────────────────────────────────────────────────
// If Gemini returns confidence below this threshold, app silently falls back
// to manual protocol selection. Never shown as an error to the user.

export const CONFIDENCE_THRESHOLD = 0.75   // 75%
export const API_TIMEOUT_MS       = 4000   // 4 seconds — if exceeded, use fallback

// ─── Primary Triage Prompt ───────────────────────────────────────────────────
// Sent with the base64 image from Camera.jsx
// Instructs Gemini to classify the injury and return structured JSON only

export function buildTriagePrompt() {
  return `You are an emergency medical triage assistant embedded in a first-aid app used by ASHA workers in disaster-prone rural India.

Analyze the injury visible in this image and respond ONLY with a valid JSON object. No explanation. No markdown. No preamble. Just the JSON.

Classify the injury into exactly one of these categories:
- "bleeding"  → any open wound, laceration, or active bleeding
- "burns"     → thermal, chemical, or electrical burns
- "fracture"  → suspected broken bone, deformity, or crush injury
- "cpr"       → patient appears unresponsive or not breathing

Return this exact JSON structure:
{
  "injury_type": "<one of: bleeding | burns | fracture | cpr>",
  "injury_label": "<short human-readable description, max 5 words>",
  "confidence_score": <float between 0.0 and 1.0>,
  "severity": "<mild | moderate | severe>",
  "protocol_id": "<one of: bleeding | burns | fracture | cpr>",
  "immediate_warning": "<one critical instruction if life-threatening, else null>",
  "requires_cpr": <true | false>
}

Rules:
- If you cannot clearly identify an injury, set confidence_score below 0.75
- Never guess — a low confidence score is always safer than a wrong classification
- immediate_warning should only be set for severe cases (e.g. "Do not move patient — possible spinal injury")
- requires_cpr must only be true if the patient appears unresponsive AND not breathing`
}

// ─── API Request Builder ──────────────────────────────────────────────────────
// Builds the full request body for the Gemini Vision API
// base64Image: string — the captured image from Camera.jsx (without data:image prefix)
// mimeType: string — e.g. "image/jpeg"

export function buildGeminiRequest(base64Image, mimeType = "image/jpeg") {
  return {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
          {
            text: buildTriagePrompt(),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,        // low temperature = more deterministic, safer for medical
      maxOutputTokens: 300,    // response is small JSON only
      responseMimeType: "application/json",
    },
  }
}

// ─── Response Parser ──────────────────────────────────────────────────────────
// Parses and validates Gemini's response
// Returns { valid: true, data } or { valid: false, reason }

export function parseTriageResponse(rawText) {
  try {
    const data = JSON.parse(rawText)

    // Validate required fields exist
    const required = ["injury_type", "confidence_score", "protocol_id", "severity"]
    for (const field of required) {
      if (data[field] === undefined || data[field] === null) {
        return { valid: false, reason: `Missing required field: ${field}` }
      }
    }

    // Validate injury_type is one of the known categories
    const validTypes = INJURY_CATEGORIES.map(c => c.id)
    if (!validTypes.includes(data.injury_type)) {
      return { valid: false, reason: `Unknown injury_type: ${data.injury_type}` }
    }

    // Validate confidence is a number between 0 and 1
    if (typeof data.confidence_score !== "number" ||
        data.confidence_score < 0 ||
        data.confidence_score > 1) {
      return { valid: false, reason: "Invalid confidence_score" }
    }

    return { valid: true, data }

  } catch (err) {
    return { valid: false, reason: `JSON parse error: ${err.message}` }
  }
}

// ─── Confidence Gate Logic ────────────────────────────────────────────────────
// Returns "ai" if confidence is sufficient, "fallback" otherwise
// Used in Camera.jsx to decide which path to take

export function evaluateConfidence(confidence_score) {
  if (typeof confidence_score !== "number") return "fallback"
  return confidence_score >= CONFIDENCE_THRESHOLD ? "ai" : "fallback"
}