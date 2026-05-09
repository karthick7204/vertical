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

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert curriculum designer. Generate a high-fidelity assessment for a course titled "${context.title}".
      Course Description: ${context.description}
      Modules: ${context.modules.map(m => m.title).join(", ")}

      REQUIREMENTS:
      1. Generate exactly 15 multiple-choice questions.
      2. Each question must have 4 options.
      3. Focus on technical accuracy and practical application.
      4. Ensure questions cover all provided modules.
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
    
    // Clean potential markdown formatting from JSON
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const questions: Question[] = JSON.parse(cleanJson);

    return questions;
  } catch (error) {
    console.error("[AI] Gemini Generation Error:", error);
    return fallbackGeneration(context);
  }
};

const fallbackGeneration = (context: CourseContext): Question[] => {
  const questions: Question[] = [];
  const totalQuestions = 15;

  for (let i = 0; i < totalQuestions; i++) {
    const moduleIndex = i % (context.modules.length || 1);
    const currentModule = context.modules[moduleIndex];
    const moduleName = currentModule?.title || 'Core Fundamentals';

    questions.push({
      question: `Regarding "${moduleName}" in "${context.title}": Which approach is most effective for long-term scalability? (Simulated)`,
      options: [
        `Standard ${moduleName} pattern`,
        `Optimized ${moduleName} architecture`,
        `Distributed ${moduleName} nodes`,
        `Edge-cached ${moduleName}`
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `The standard pattern for ${moduleName} ensures baseline compatibility and scalability.`,
      skillTags: ["Simulated", context.title.split(" ")[0] || "General"]
    });
  }
  return questions;
};
