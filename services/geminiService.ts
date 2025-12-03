
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GradeLevel, SkillDomain, Challenge, CollaborativeProject, ATLSkill, DifficultyLevel } from '../types';

const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GOOGLE_CLIENT_KEY });


// --- FIS Design Standards Data (OCR Content) ---
// UPDATED: STRICTLY FILTERED TO CRITERION C (Technical Skills) ONLY
const FIS_STANDARDS: Record<GradeLevel, string> = {
  [GradeLevel.G6]: `
    MYP 1 Criterion C: Creating the Solution (Technical Skills)
    C.1 Outline a plan with resources (CS.1.1a-d).
    C.2 Demonstrate technical skills: Use tools and techniques to assemble a simple design; follow guidance; use tools safely (CS.1.2a-d).
    C.3 Follow the plan to create the solution (CS.1.3a-d).
    C.4 List changes made to the chosen design (CS.1.4a-c).
  `,
  [GradeLevel.G7]: `
    MYP 2 Criterion C: Creating the Solution (Technical Skills)
    C.1 Outline a plan considering time/resources (CS.2.1a-d).
    C.2 Demonstrate excellent technical skills: Apply intermediate techniques; use tools safely and effectively; develop accuracy and precision (CS.2.2a-d).
    C.3 Follow the plan to create the solution (CS.2.3a-d).
    C.4 List changes made to the design and plan (CS.2.4a-c).
  `,
  [GradeLevel.G8]: `
    MYP 3 Criterion C: Creating the Solution (Technical Skills)
    C.1 Construct a logical plan (CS.3.1a-d).
    C.2 Demonstrate excellent skills: Advanced technical proficiency; use digital fabrication tools (3D printing, laser cutting); justify tool selection (CS.3.2a-d).
    C.3 Follow the plan precisely (CS.3.3a-d).
    C.4 Explain changes made (CS.3.4a-c).
  `,
  [GradeLevel.G9]: `
    MYP 4 Criterion C: Creating the Solution (Technical Skills)
    C.1 Construct a logical plan (CS.4.1a-d).
    C.2 Demonstrate excellent technical skills: Professional-level craftsmanship; integrate emerging technologies (CNC, sensors); solve technical issues independently (CS.4.2a-d).
    C.3 Follow the plan (CS.4.3a-d).
    C.4 Fully justify changes made (CS.4.4a-c).
  `,
  [GradeLevel.G10]: `
    MYP 5 Criterion C: Creating the Solution (Technical Skills)
    C.1 Construct a logical plan (CS.4.1a-d).
    C.2 Demonstrate excellent technical skills: Professional-level craftsmanship; integrate emerging technologies (CNC, sensors); solve technical issues independently (CS.4.2a-d).
    C.3 Follow the plan (CS.4.3a-d).
    C.4 Fully justify changes made (CS.4.4a-c).
  `
};

// --- Grade Level Learning Progression Context (FIS Vision: Include, Empower, Impact) ---
const GRADE_LEARNING_PATH: Record<GradeLevel, string> = {
  [GradeLevel.G6]: `
    FIS Stage: INCLUDE (Foundation) - MYP 1
    - Vision: Students are welcomed into the design world, building confidence and core skills.
    - Focus: Developing essential core skills (Brainstorming, Sketching, Simple Woodwork).
    - Goal: Students should feel included and capable. Challenges should be accessible, safe, and foundational.
  `,
  [GradeLevel.G7]: `
    FIS Stage: INCLUDE (Foundation) - MYP 2
    - Vision: Strengthening the foundation to ensure every student has the tools to succeed.
    - Focus: Refining problem-solving, structured processes, and intro to digital tools (Canva, Basic Coding).
    - Goal: Solidify research and planning habits before moving to complex application.
  `,
  [GradeLevel.G8]: `
    FIS Stage: EMPOWER (Exploration) - MYP 3
    - Vision: Empowering students to apply their skills to real-world contexts and take risks.
    - Focus: Hands-on application (Laser Cutting, Functional 3D Printing, Electronics).
    - Goal: Shift from teacher-led to student-led exploration. Challenges should be require autonomy and decision making.
  `,
  [GradeLevel.G9]: `
    FIS Stage: IMPACT (Innovation) - MYP 4
    - Vision: Students use design to make a meaningful difference.
    - Focus: Deep expertise, precision, efficiency, and sustainable materials.
    - Goal: Advanced digital/physical design. Projects must solve actual problems for real people or the environment.
  `,
  [GradeLevel.G10]: `
    FIS Stage: IMPACT (Innovation) - MYP 5
    - Vision: Mastery and Leadership.
    - Focus: Capstone Passion Project, Entrepreneurship, Social Innovation.
    - Goal: Create professional-quality solutions that demonstrate specific impact (Social, Cultural, or Environmental).
  `
};

const FIS_PERSONA_BASE = `
You are the engine behind the Fukuoka International School (FIS) Design Pathway Hub.
Your purpose is to support learning in a way that is safe, personalized, accurate, and aligned with FIS expectations.
Tone & Style: Supportive, Student-friendly, Aligned with MYP Design language, Clear and step-by-step.
FIS Design Pathway: Include, Empower, Impact.
Maintain safety: No hallucinations, no guessing student info, no outputting private data.
`;

const challengeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy title for the design challenge." },
    description: { type: Type.STRING, description: "A short summary of the task." },
    scenario: { type: Type.STRING, description: "The design situation or problem statement." },
    tools: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of physical or digital tools required."
    },
    tutorialLinks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Suggested search terms for tutorials (since we can't generate real URLs)."
    },
    rubric: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterion: { type: Type.STRING, description: "Must use FIS Standard codes (e.g., A.1, B.2)" },
          points: { type: Type.INTEGER },
          description: { type: Type.STRING }
        },
        required: ["criterion", "points", "description"]
      }
    }
  },
  required: ["title", "description", "scenario", "tools", "rubric"]
};

const teamProjectSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    scenario: { type: Type.STRING },
    objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
    deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
    teamRubric: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterion: { type: Type.STRING },
          points: { type: Type.INTEGER },
          description: { type: Type.STRING }
        },
        required: ["criterion", "points", "description"]
      }
    },
    tutorialLinks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Relevant tutorial search terms for the specific skills and theme of the project."
    }
  },
  required: ["title", "scenario", "objectives", "deliverables", "teamRubric"]
};

// Validation Schema for Tone Check
const feedbackValidationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isConstructive: { type: Type.BOOLEAN, description: "True if the feedback is helpful and polite." },
    suggestion: { type: Type.STRING, description: "If not constructive, provide a specific suggestion to improve the tone. If it is constructive, leave empty." }
  },
  required: ["isConstructive"]
};

// New Schema for Submission Analysis with ATL
const submissionAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    feedback: { type: Type.STRING, description: "Constructive feedback (max 100 words) referencing Criterion C." },
    atlSkills: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING, enum: Object.values(ATLSkill) },
      description: "List of ATL skills demonstrated in the submission." 
    }
  },
  required: ["feedback", "atlSkills"]
};

export interface AIAnalysisResult {
    feedback: string;
    atlSkills: ATLSkill[];
}

export const generateChallengeDetails = async (
  domain: SkillDomain,
  grade: GradeLevel,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): Promise<Partial<Challenge>> => {
  try {
    const standardsText = FIS_STANDARDS[grade] || "Focus on IB MYP Design Cycle basics.";
    const progressionText = GRADE_LEARNING_PATH[grade] || "Focus on age-appropriate design skills.";
    
    // Difficulty logic adjustments
    let difficultyContext = "";
    if (difficulty === DifficultyLevel.EASY) {
        difficultyContext = "Make this challenge INTRODUCTORY. Focus on basic familiarity, safety, and simple execution. Reduce complexity.";
    } else if (difficulty === DifficultyLevel.HARD) {
        difficultyContext = "Make this challenge ADVANCED. Require precision, complex problem solving, or integration of multiple tools. Push the student.";
    } else {
        difficultyContext = "Make this challenge STANDARD for the grade level. Balanced achievability and effort.";
    }

    const prompt = `
      Create a practical IB MYP Design challenge for Grade Level ${grade} focusing on the skill domain: ${domain}.
      DIFFICULTY LEVEL: ${difficulty}
      ${difficultyContext}
      
      FIS DESIGN PATHWAY CONTEXT:
      ${progressionText}
      
      CRITICAL - ASSESSMENT STANDARDS (FIS):
      You must align the Rubric **EXCLUSIVELY** with Criterion C (Creating the Solution) of the FIS Standards:
      ${standardsText}
      
      INSTRUCTIONS:
      1. **RUBRIC**: ONLY generate criteria for Criterion C (e.g., C.1 Plan, C.2 Technical Skills, C.4 Changes). DO NOT include Criterion A (Inquiry), B (Ideas), or D (Evaluation). We are assessing TECHNICAL SKILLS only.
      2. The 'scenario' should be engaging and reflect the vision (Include, Empower, or Impact) for this stage.
      3. The 'rubric' MUST use the specific Criterion codes (e.g., 'C.2', 'C.4') and language from the standards provided above.
      4. The 'tutorialLinks' field must provide 2-3 specific, relevant search terms for YouTube tutorials. **Important: Include at least one safety-focused search term (e.g., 'Soldering iron safety', 'Scroll saw safety guide') appropriate for the tools used.**
      5. Ensure the difficulty matches the MYP Level description provided in the context.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: challengeSchema,
        systemInstruction: `${FIS_PERSONA_BASE} You are creating content for students. Be inspiring.`
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Partial<Challenge>;

  } catch (error) {
    console.error("Error generating challenge:", error);
    return {
      title: `${domain} Challenge for ${grade}`,
      description: "Could not generate AI content at this time. Please try again.",
      scenario: "System offline.",
      tools: [],
      rubric: [],
      tutorialLinks: []
    };
  }
};

export const generatePracticeChallenge = async (
  domain: SkillDomain,
  grade: GradeLevel
): Promise<Partial<Challenge>> => {
  try {
    const prompt = `
      Create a SHORT, 20-minute PRACTICE DRILL for a student in Grade ${grade} to improve their skills in ${domain}.
      
      GOAL: This is a low-stakes "Skill Drill" to hone technique. Not a full design cycle project.
      
      INSTRUCTIONS:
      1. Title should be fun (e.g., "Speed Sketching Drill", "Precision Sawing Test").
      2. Scenario: Keep it simple. "You need to practice X to get better at Y."
      3. Description: Step-by-step drill instructions.
      4. Rubric: Simple checklist (Pass/Fail style) for self-assessment.
      5. Tools: Minimal tools required.
      
      Output in JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: challengeSchema,
        systemInstruction: `${FIS_PERSONA_BASE} You are a coach running a quick practice session.`
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Partial<Challenge>;

  } catch (error) {
    console.error("Error generating practice drill:", error);
    return {
      title: `Quick Drill: ${domain}`,
      description: "Practice your basics. 1. Setup tools. 2. Perform basic operation. 3. Clean up.",
      scenario: "Practice makes perfect.",
      tools: [],
      rubric: [],
      tutorialLinks: []
    };
  }
};

export const generateTeamChallenge = async (theme: string): Promise<Partial<CollaborativeProject>> => {
  try {
    // We use MYP 3/4 standards as a baseline for collaborative projects to ensure rigor.
    const standardsRef = FIS_STANDARDS[GradeLevel.G9]; 
    
    const prompt = `
      Create a collaborative IB MYP Design project for a team of 3-4 students.
      Theme: ${theme}.
      
      Use the following MYP 4 (Advanced) Standards as a quality benchmark for the rubric:
      ${standardsRef}
      
      FIS Vision: "Empower & Impact".
      The project should:
      1. Require multiple skills (e.g. sketching + 3d printing + coding).
      2. Emphasize collaboration using roles: Project Manager, Lead Researcher, Prototyper, Documentation Lead.
      3. Have clear deliverables for each phase of the design cycle.
      4. Provide 2-3 specific search terms for tutorials that cover the technical skills required for this project.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: teamProjectSchema,
        systemInstruction: `${FIS_PERSONA_BASE} You are creating a collaborative curriculum. Focus on teamwork and impact.`
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Partial<CollaborativeProject>;
  } catch (error) {
    console.error("Error generating team project:", error);
    return {
      title: "Team Innovation Challenge",
      scenario: "Work together to solve a community problem.",
      objectives: ["Identify problem", "Design solution", "Build prototype"],
      deliverables: ["Process Journal", "Prototype"],
      teamRubric: [],
      tutorialLinks: []
    };
  }
};

export const analyzeSubmission = async (
  challengeTitle: string,
  submissionText: string,
  rubricSummary: string
): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
        Challenge: ${challengeTitle}
        Student Submission Description: "${submissionText}"
        Rubric Criteria (FIS Standards - Criterion C Technical Skills): ${rubricSummary}
        
        Task 1: Provide constructive feedback (max 100 words) to the student regarding their TECHNICAL SKILLS (Criterion C).
        Reference specific FIS standards codes (e.g., C.2, C.4) where applicable.
        Start with a positive reinforcement on their technique, then suggest one improvement on safety or accuracy.

        Task 2: Identify which IB ATL (Approaches to Learning) Skills were demonstrated in this submission description.
        Options: 'Communication', 'Social', 'Self-Management', 'Research', 'Thinking'.
        Select 1-3 skills that are clearly evident.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: "application/json",
          responseSchema: submissionAnalysisSchema,
          systemInstruction: `${FIS_PERSONA_BASE} Provide supportive, level-appropriate feedback.`
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Error generating feedback:", error);
    return {
        feedback: "Could not generate AI feedback at this time.",
        atlSkills: []
    };
  }
};

export const assessTeamPerformance = async (
  projectTitle: string,
  teamLogs: { author: string; message: string; timestamp: string }[]
): Promise<string> => {
  try {
    const logsText = teamLogs.map(l => `[${l.timestamp}] ${l.author}: ${l.message}`).join('\n');
    const prompt = `
      You are an IB Design Teacher assessing a collaborative group project: "${projectTitle}".
      
      Review the following team activity logs:
      ${logsText}
      
      Provide a brief assessment (max 150 words) covering:
      1. Collaboration quality (Are they working together?)
      2. Individual contributions (Is anyone dominating or absent?)
      3. Project momentum (Are they making progress?)
      
      Tone: Professional and constructive. Mention if they are following the design cycle (Inquiry -> Ideation -> Creation).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `${FIS_PERSONA_BASE} Provide teacher-facing assessment.`
      }
    });
    return response.text || "Assessment unavailable.";
  } catch (error) {
    console.error("Error generating assessment:", error);
    return "Could not generate team assessment.";
  }
};

export const validateFeedbackTone = async (feedback: string): Promise<{isConstructive: boolean, suggestion?: string}> => {
  try {
     const prompt = `
       Analyze the following peer review feedback written by a student for another student:
       "${feedback}"
       
       Is this feedback constructive, kind, and specific?
       If it is rude, too vague (e.g., "it's bad"), or unhelpful, return false and suggest a better way to phrase it.
     `;
     
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: feedbackValidationSchema,
          systemInstruction: `${FIS_PERSONA_BASE} Coach students to give kind and helpful feedback.`
        }
     });
     
     const text = response.text;
     if (!text) return { isConstructive: true };
     return JSON.parse(text);

  } catch (error) {
    console.error("Tone check failed", error);
    return { isConstructive: true }; // Fail open if AI is down
  }
}
