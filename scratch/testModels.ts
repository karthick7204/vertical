import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../backend/.env") });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // The listModels method isn't directly on genAI in some versions, 
    // it's usually part of the admin/management API which isn't in this SDK.
    // However, we can try to hit a known model and see the error or try common ones.
    
    console.log("Testing common model names...");
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        await model.generateContent("test");
        console.log(`✅ Success: ${modelName}`);
      } catch (err: any) {
        console.log(`❌ Failed: ${modelName} - ${err.message}`);
      }
    }
  } catch (error) {
    console.error("Error testing models:", error);
  }
}

listModels();
