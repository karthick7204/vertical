import { GoogleGenerativeAI } from "@google/generative-ai";

interface CourseContext {
  title: string;
  description: string;
  modules: any[];
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  skillTags: string[];
}

export const generateAIAssessment = async (context: CourseContext): Promise<Question[]> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[AI] No Gemini API Key found. Falling back to simulation.");
    return fallbackGeneration(context);
  }

  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

      const modulesDescription = context.modules.map(m => {
        const subModulesText = (m.subModules || []).map((sm: any) => `    - Sub-Module: ${sm.title}\n      Details: ${sm.content || 'N/A'}`).join("\n");
        return `- Module: ${m.title}\n  Description: ${m.content || 'N/A'}\n  Skills: ${(m.skillsCovered || []).join(", ")}${subModulesText ? '\n  Sub-Modules:\n' + subModulesText : ''}`;
      }).join("\n\n");

      const prompt = `
        You are an expert curriculum designer. Generate a high-fidelity assessment for a course titled "${context.title}".
        Course Description: ${context.description}
        
        MODULES AND SKILLS:
        ${modulesDescription}

        REQUIREMENTS:
        1. For EACH module listed above, generate EXACTLY 3 multiple-choice questions (Total: ${context.modules.length * 3} questions).
        2. Each question must have 4 options.
        3. For each question, include "skillTags" that match the skills covered in its respective module.
        4. Focus on technical accuracy and practical application.
        5. Return the result ONLY as a valid JSON array of objects with this structure:
           {
             "question": "string",
             "options": ["string", "string", "string", "string"],
             "correctAnswer": number (0-3 index),
             "explanation": "string (explain why the answer is correct)",
             "skillTags": ["string"]
           }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error: any) {
      console.warn(`[AI] Attempt with ${modelName} failed: ${error.message}. Trying next...`);
      continue;
    }
  }

  console.error("[AI] All models failed. Falling back to simulation.");
  return fallbackGeneration(context);
};

export const generatePersonalizedPath = async (
  courseTitle: string,
  modules: any[],
  performance: { strengths: string[]; weaknesses: string[] }
): Promise<{ path: string[]; suggestions: string }> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[AI] No Gemini API Key found for path generation. Returning all modules.");
    return { path: modules.map(m => m.title), suggestions: "Focus on completing all modules to build a solid foundation." };
  }

  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

      const prompt = `
        You are an AI learning strategist. Based on the learner's performance in the course "${courseTitle}", generate a personalized learning path and success suggestions.
        
        TOTAL MODULES:
        ${modules.map(m => `- ${m.title}`).join("\n")}

        LEARNER PERFORMANCE:
        - Strengths: ${performance.strengths.join(", ") || "None identified yet"}
        - Weaknesses: ${performance.weaknesses.join(", ") || "None identified yet"}

        REQUIREMENTS:
        1. SKIP modules where the user has shown high proficiency (strengths).
        2. PRIORITIZE modules that address the user's weaknesses.
        3. Provide 2-3 specific "Focus Suggestions" on what concepts or habits the user should prioritize to succeed.
        4. Return the result ONLY as a JSON object:
        {
          "path": ["Module Title 1", "Module Title 2"],
          "suggestions": "Your personalized focus advice here..."
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const resultData = JSON.parse(cleanJson);

      return {
        path: resultData.path || modules.map(m => m.title),
        suggestions: resultData.suggestions || "Focus on consistent practice in your weak areas."
      };
    } catch (error: any) {
      console.warn(`[AI] Path attempt with ${modelName} failed: ${error.message}. Trying next...`);
      continue;
    }
  }

  console.error("[AI] All path models failed. Using defaults.");
  return { path: modules.map(m => m.title), suggestions: "Maintain your learning momentum." };
};

const fallbackGeneration = (context: CourseContext): Question[] => {
  const questions: Question[] = [];

  context.modules.forEach((mod) => {
    const moduleName = mod.title || 'Core Fundamentals';
    const skills = mod.skillsCovered && mod.skillsCovered.length > 0 ? mod.skillsCovered : ["General"];

    for (let i = 0; i < 3; i++) {
      const subMod = mod.subModules && mod.subModules.length > 0 ? mod.subModules[i % mod.subModules.length] : null;
      const questionContext = subMod ? `${moduleName} (${subMod.title})` : moduleName;

      questions.push({
        question: `[Module: ${questionContext}] Which approach is most effective for long-term scalability in this context? (Simulated Q${i+1})`,
        options: [
          `Standard ${moduleName} pattern`,
          `Optimized ${moduleName} architecture`,
          `Distributed ${moduleName} nodes`,
          `Edge-cached ${moduleName}`
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `The standard pattern for ${moduleName} ensures baseline compatibility and scalability.`,
        skillTags: skills
      });
    }
  });

  return questions;
};
