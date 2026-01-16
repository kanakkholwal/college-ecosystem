// import { NextResponse } from "next/server";
// import { z } from "zod";
// import { pipeline, env } from "@xenova/transformers";

// // Configure transformers.js
// env.allowRemoteModels = true;
// env.backends.onnx.wasm.numThreads = 1; // safe for serverless

// const InputSchema = z.object({
//   text: z.string().min(1).max(8000),
// });

// // Lazy init pipelines
// let translatorPromise: Promise<any> | null = null;
// let classifierPromise: Promise<any> | null = null;

// // Basic Hinglish regex fallback (catches what translators miss)
// const ABUSE_REGEX = /\b(bc|mc|bsdk|chutiya|madarchod|behenchod|randi|gandu|bhosdike)\b/i;

// // Decide final label
// type Label = "NORMAL" | "HATE" | "NSFW" | "HARASSMENT" | "SELF_HARM" | "SPAM";

// function decideLabel(scores: Record<string, number>): Label {
//   if ((scores["self_harm"] || 0) > 0.55) return "SELF_HARM";
//   if ((scores["sexual_explicit"] || 0) > 0.65) return "NSFW";
//   if ((scores["identity_attack"] || 0) > 0.55 || (scores["threat"] || 0) > 0.50) return "HATE";
//   if ((scores["toxicity"] || 0) > 0.55 || (scores["insult"] || 0) > 0.60) return "HARASSMENT";
//   if ((scores["spam"] || 0) > 0.60) return "SPAM";
//   return "NORMAL";
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { text } = InputSchema.parse(body);

//     // Init translator + classifier
//     if (!translatorPromise) {
//       translatorPromise = pipeline("translation", "Xenova/m2m100_418M");
//     }
//     if (!classifierPromise) {
//       classifierPromise = pipeline("text-classification", "Xenova/toxic-bert");
//     }
//     const [translator, classifier] = await Promise.all([translatorPromise, classifierPromise]);

//     // Step 1: Quick regex fallback
//     if (ABUSE_REGEX.test(text.toLowerCase())) {
//       return NextResponse.json({
//         input: text,
//         translated: null,
//         label: "HARASSMENT",
//         reason: "regex_match",
//         scores: {},
//       });
//     }

//     // Step 2: Translate Hinglish → English
//     let translated = text;
//     try {
//       const out = await translator(text, { src_lang: "hi", tgt_lang: "en" });
//       translated = out[0].translation_text || text;
//     } catch (e) {
//       // fallback if translation fails
//       translated = text;
//     }

//     // Step 3: Run classification
//     const results = await classifier(translated, { topk: 0 }); // all scores
//     const scores: Record<string, number> = {};
//     for (const r of results) {
//       scores[r.label.toLowerCase().replace(/\s+/g, "_")] = r.score;
//     }

//     const label = decideLabel(scores);

//     return NextResponse.json({
//       input: text,
//       translated,
//       label,
//       scores,
//     });
//   } catch (e: any) {
//     return NextResponse.json({ error: e?.message || "Bad Request" }, { status: 400 });
//   }
// }
