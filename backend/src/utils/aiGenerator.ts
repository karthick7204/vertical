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
  moduleTitle?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const generateAIAssessment = async (context: CourseContext): Promise<Question[]> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[AI] No Gemini API Key found. Falling back to simulation.");
    return fallbackGeneration(context);
  }

  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

      const modulesDescription = context.modules.map(m => {
        const subModulesText = (m.subModules || []).map((sm: any) => `    - Sub-Module: ${sm.title}\n      Details: ${sm.content || 'N/A'}`).join("\n");
        return `- Module: ${m.title}\n  Description: ${m.content || 'N/A'}\n  Skills: ${(m.skillsCovered || []).join(", ")}${subModulesText ? '\n  Sub-Modules:\n' + subModulesText : ''}`;
      }).join("\n\n");

      const prompt = `
You are an expert curriculum designer and technical assessment creator.

Generate a high-quality assessment for the course:
"${context.title}"

Course Description:
${context.description}

MODULES:
${modulesDescription}

REQUIREMENTS:

1. Generate EXACTLY 3 UNIQUE multiple-choice questions for EACH module.
2. Do NOT skip any module.
3. Each question must contain EXACTLY 4 options.
4. Include practical and conceptual questions.
5. Mix difficulty levels:
   - easy
   - medium
   - hard
6. Questions should evaluate:
   - understanding
   - application
   - problem-solving
7. Each question MUST belong to the correct module.
8. Include relevant skill tags based on module skills.

Return ONLY raw valid JSON array.

JSON structure:

[
  {
    "question": "string",
    "options": [
      "string",
      "string",
      "string",
      "string"
    ],
    "correctAnswer": 0,
    "explanation": "string",
    "skillTags": ["string"],
    "moduleTitle": "string",
    "difficulty": "easy | medium | hard"
  }
]

IMPORTANT:
- Do not include markdown
- Do not wrap in \`\`\`
- Do not include additional text
- Output must be directly parseable JSON
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

interface PerformanceMetrics {
  scorePercentage: number;
  totalCorrect: number;
  totalIncorrect: number;
  strongTopics: string[];
  weakTopics: string[];
  moduleAccuracy: Record<string, number>;
}

export const generatePersonalizedPath = async (
  courseTitle: string,
  modules: any[],
  performance: PerformanceMetrics
): Promise<{ path: string[]; suggestions: string }> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[AI] No Gemini API Key found for path generation. Falling back to rule-based programmatic generation.");
    return localFallbackPathGeneration(modules, performance);
  }

  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

      // Format detailed description of modules including skills covered
      const modulesDescription = modules.map((m, idx) => {
        const skillsText = (m.skillsCovered || []).join(", ");
        const subModulesText = (m.subModules || []).map((sm: any) => `  - Sub-Module: ${sm.title}`).join("\n");
        return `Module #${idx + 1}: ${m.title}\nDescription: ${m.content || 'N/A'}\nSkills Covered: ${skillsText || 'N/A'}${subModulesText ? '\nSub-Modules:\n' + subModulesText : ''}`;
      }).join("\n\n");

      const prompt = `
        You are an elite AI learning strategist. Your task is to analyze the learner's existing knowledge based on their detailed assessment performance, cross-reference it with the available course modules for "${courseTitle}", and generate an optimized, personalized structured learning path.

        AVAILABLE COURSE MODULES:
        ${modulesDescription}

        LEARNER DETAILED ASSESSMENT PERFORMANCE:
        - Overall Score: ${performance.scorePercentage}% (${performance.totalCorrect} Correct, ${performance.totalIncorrect} Incorrect)
        - Accuracy per Module/Topic:
          ${Object.entries(performance.moduleAccuracy).map(([topic, acc]) => `  * ${topic}: ${acc}%`).join("\n")}
        - Mastered Topics (Strong): ${performance.strongTopics.join(", ") || "None"}
        - Areas for Improvement (Weak): ${performance.weakTopics.join(", ") || "None"}

        CRITICAL CONSTRAINTS & LOGIC:
        1. Do NOT generate or create any new modules.
        2. Analyze the learner's module accuracy and performance.
        3. Exclude modules that the learner has mastered (i.e. those listed under Mastered Topics or where the learner answered questions with high accuracy, typically >= 70%).
        4. Include modules where the learner performed poorly (accuracy < 70% or listed under Areas for Improvement).
        5. The returned path must contain ONLY a subset of the existing module titles. Do NOT include any modules that do not match the titles of the available course modules.
        6. Return the recommended module names in a clear, ordered, and structured sequence representing the optimized learning journey.
        7. Provide 2-3 specific "Focus Suggestions" for their learning journey based on their profile.
        8. Return the result ONLY as a valid JSON object matching this structure:
        {
          "path": ["Exact Module Title A", "Exact Module Title B"],
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

  console.error("[AI] All path models failed. Using rule-based fallback.");
  return localFallbackPathGeneration(modules, performance);
};

const localFallbackPathGeneration = (
  modules: any[],
  performance: PerformanceMetrics
): { path: string[]; suggestions: string } => {
  const path: string[] = [];
  modules.forEach(m => {
    const title = m.title;
    const accuracy = performance.moduleAccuracy[title];
    
    // If accuracy is >= 70% (performs well), exclude it (mastered).
    // If accuracy < 70% or the module was not tested, include it.
    if (accuracy !== undefined) {
      if (accuracy < 70) {
        path.push(title);
      }
    } else {
      path.push(title);
    }
  });

  return {
    path,
    suggestions: `Focus on modules where your score was below 70%: ${performance.weakTopics.join(', ') || 'none'}.`
  };
};

const fallbackGeneration = (context: CourseContext): Question[] => {
  const questions: Question[] = [];

  context.modules.forEach((mod) => {
    const moduleName = mod.title || 'Core Fundamentals';
    const skills = mod.skillsCovered && mod.skillsCovered.length > 0 ? mod.skillsCovered : ["General"];

    for (let i = 0; i < 3; i++) {
      const subMod = mod.subModules && mod.subModules.length > 0 ? mod.subModules[i % mod.subModules.length] : null;
      const questionContext = subMod ? `${moduleName} (${subMod.title})` : moduleName;

      let questionText = "";
      let options: string[] = [];
      let explanation = "";
      let correctAnswer = 0;

      if (i === 0) {
        questionText = `[Module: ${questionContext}] Which of the following best describes the primary purpose of ${questionContext}? (Simulated Q${i+1})`;
        options = [
          `To facilitate efficient data flow and baseline operations within ${moduleName}`,
          `To completely bypass standard validation protocols and security controls`,
          `To deprecate legacy implementations without performing integration tests`,
          `To run background tasks on a single thread without concurrency management`
        ];
        correctAnswer = 0;
        explanation = `Understanding the primary purpose of ${moduleName} is fundamental to working with its concepts.`;
      } else if (i === 1) {
        questionText = `[Module: ${questionContext}] When implementing ${questionContext}, which standard best practice should be followed to optimize efficiency? (Simulated Q${i+1})`;
        options = [
          `Hardcode configuration variables to prevent runtime dynamic resolution overhead`,
          `Utilize cache delegation and modular design principles specific to ${moduleName}`,
          `Disable all logging, telemetry, and error reporting systems to save cycles`,
          `Avoid using structured modules or reusable helper functions to reduce call stack depth`
        ];
        correctAnswer = 1;
        explanation = `Modular design and cache delegation are standard best practices for optimizing ${moduleName}.`;
      } else {
        questionText = `[Module: ${questionContext}] Which architectural pattern is most suitable for scaling ${questionContext} under heavy concurrent write loads? (Simulated Q${i+1})`;
        options = [
          `Monolithic single-node execution with blocking network I/O`,
          `Client-side synchronous pooling without rate limiting or backpressure`,
          `Temporary in-memory storage without disk persistence layers`,
          `Distributed event sourcing with optimistic locking tailored for ${moduleName}`
        ];
        correctAnswer = 3;
        explanation = `For high concurrency and write-heavy workloads in ${moduleName}, distributed event sourcing with optimistic locking provides robust scaling.`;
      }

      questions.push({
        question: questionText,
        options: options,
        correctAnswer: correctAnswer,
        explanation: explanation,
        skillTags: skills,
        moduleTitle: moduleName,
        difficulty: i === 0 ? 'easy' : i === 1 ? 'medium' : 'hard'
      });
    }
  });

  return questions;
};
