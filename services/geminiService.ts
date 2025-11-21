
import { GoogleGenAI, Type, Schema, Modality, LiveServerMessage } from "@google/genai";
import { UserProfile, WeeklyPlan, SearchResult, TaskBreakdown, Flashcard } from "../types";

// Models
const MODEL_PLANNER = "gemini-3-pro-preview";
const MODEL_FAST = "gemini-2.5-flash";
const MODEL_LIVE = "gemini-2.5-flash-native-audio-preview-09-2025";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateWeeklyPlan = async (profile: UserProfile): Promise<WeeklyPlan> => {
  const ai = getAIClient();
  
  const prompt = `
    Act as an expert academic counselor. Create a detailed weekly study plan for ${profile.name}.
    
    Constraints:
    - Subjects: ${JSON.stringify(profile.subjects)}
    - Study hours per day: ${profile.hoursPerDay}
    - Start time: ${profile.startHour}:00
    - Include weekends: ${profile.weekendStudy}
    - Current Date: ${new Date().toDateString()}
    
    Logic to apply (Thinking Process):
    1. Analyze the difficulty of each subject.
    2. Distribute "Hard" subjects when the student is likely freshest (start of session).
    3. Interleave topics (mix subjects) to improve retention, don't just do one subject for 4 hours.
    4. Insert short breaks (10-15 mins) after every 60-90 minutes of work.
    5. Ensure "Practice" sessions follow "Learn" sessions.
  `;

  // Schema definition for structured JSON output
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      weekOf: { type: Type.STRING, description: "Start date of the week (e.g., Oct 24)" },
      days: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING, description: "Day name (Monday, etc.)" },
            focusOfTheDay: { type: Type.STRING, description: "Main academic goal for the day" },
            slots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: "e.g., 09:00 - 10:00" },
                  subjectId: { type: Type.STRING },
                  subjectName: { type: Type.STRING },
                  topic: { type: Type.STRING, description: "Specific chapter or concept" },
                  activityType: { type: Type.STRING, enum: ['Learn', 'Review', 'Practice', 'Break'] },
                  notes: { type: Type.STRING, description: "Brief tip or instruction" }
                },
                required: ['time', 'subjectName', 'topic', 'activityType']
              }
            }
          },
          required: ['day', 'slots', 'focusOfTheDay']
        }
      }
    },
    required: ['weekOf', 'days']
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_PLANNER,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 32768 }, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No plan generated");
    return JSON.parse(text) as WeeklyPlan;
  } catch (error) {
    console.error("Plan generation failed:", error);
    throw error;
  }
};

export const createInteractivePlannerChat = (profile: any, historyContext: string) => {
  const ai = getAIClient();
  return ai.chats.create({
    model: MODEL_PLANNER,
    config: {
      systemInstruction: `
        You are Planner PRO, an advanced interactive study planning assistant.
        
        # USER PROFILE
        ${JSON.stringify(profile)}
        
        # PREVIOUS PLANS & CONTEXT
        The user has previously created the following plans. USE THIS CONTEXT. Do not ask for information already present here. 
        If a previous plan exists, acknowledge it (e.g., "I see we finished the March plan...").
        
        ${historyContext}
        
        # GOAL
        Collaboratively build a NEW study schedule or roadmap with the user.
        
        # INTERACTION RULES
        1. **Memory**: Always check the 'USER PROFILE' and 'PREVIOUS PLANS' first. If the profile says they study Math, don't ask "What subjects do you have?". Instead ask "Are we focusing on Math again this week?".
        2. **Continuity**: If the previous plan ended on a specific topic or date, continue from there.
        3. **Process**:
           - Ask what the specific goal is for this new period (e.g. "Exam prep", "Routine study", "Project week").
           - Propose a draft schedule.
           - Iterate based on feedback.
        4. **Format**: Use Markdown Tables for schedules.
        5. **Finalization**: When the user is happy, remind them to click the "Finalize Plan" button to save it.
        
        Start by greeting the user by name (if known in profile) and mentioning the context of the last plan if available.
      `
    }
  });
};

export const createInterviewChat = (userName: string) => {
    const ai = getAIClient();
    return ai.chats.create({
      model: MODEL_PLANNER,
      config: {
        systemInstruction: `You are a helpful academic interviewer helping ${userName} reflect on their study habits. Ask thoughtful questions and provide encouraging feedback.`
      }
    });
};

export const generateTaskBreakdown = async (task: string): Promise<TaskBreakdown> => {
  const ai = getAIClient();
  const prompt = `
    The user wants to study: "${task}".
    Break this down into 3 to 5 concrete, actionable micro-tasks that can be completed in a 25-minute "Pomodoro" session.
    
    Rules:
    - Steps must be chronological.
    - Each step should be 2-10 minutes long.
    - Steps must be specific (e.g. "Read page 5-10", "Solve 2 practice problems", "Summarize notes").
    - Total time should sum to roughly 25 minutes.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING },
      subtasks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING, description: "Actionable instruction" },
            estimatedMin: { type: Type.INTEGER, description: "Minutes to complete" },
            completed: { type: Type.BOOLEAN }
          },
          required: ['id', 'text', 'estimatedMin']
        }
      }
    },
    required: ['topic', 'subtasks']
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return JSON.parse(response.text!) as TaskBreakdown;
  } catch (e) {
    console.error(e);
    return {
      topic: task,
      subtasks: [
        { id: '1', text: 'Review core concepts', estimatedMin: 10, completed: false },
        { id: '2', text: 'Practice active recall', estimatedMin: 10, completed: false },
        { id: '3', text: 'Quick summary', estimatedMin: 5, completed: false }
      ]
    };
  }
};

export const findStudyResources = async (query: string): Promise<{ text: string; links: SearchResult[] }> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Find resources for: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No resources found.";
    const links: SearchResult[] = [];
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((c: any) => {
        if (c.web) {
          links.push({ title: c.web.title, url: c.web.uri });
        }
      });
    }
    
    return { text, links };
  } catch (e) {
    console.error("Search failed:", e);
    return { text: "Search unavailable.", links: [] };
  }
}

export const analyzeStudyNotes = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", 
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }
    });
    return response.text || "No analysis generated.";
  } catch (e) {
    console.error("Error analyzing notes:", e);
    return "Failed to analyze notes.";
  }
}

export const generateFlashcards = async (topic: string): Promise<Flashcard[]> => {
  const ai = getAIClient();
  // Using MODEL_FAST (gemini-2.5-flash) with Google Search for up-to-date info.
  // Note: JSON responseSchema cannot be used with Google Search tools. 
  // We will parse the text output manually.
  
  const prompt = `
    Generate 8 to 12 high-quality flashcards for the topic: "${topic}".
    
    CRITICAL INSTRUCTIONS:
    1. Use Google Search to ensure all facts, figures, and dates are 100% accurate and up-to-date.
    2. Return the output strictly as a RAW JSON Array. 
    3. Do not include markdown formatting (like \`\`\`json).
    4. Format: [{"front": "Question/Concept", "back": "Answer/Definition"}]
    5. Make the 'back' concise but comprehensive.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    let text = response.text || "[]";
    // Clean up markdown if the model adds it despite instructions
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as Flashcard[];
  } catch (e) {
    console.error("Flashcard generation failed:", e);
    return [
      { front: "Error", back: "Could not generate flashcards. Please try a different topic." }
    ];
  }
}

// --- LIVE API HELPERS ---

export function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
  
export function uint8ArrayToBase64(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export class LiveClient {
    private session: any = null;

    constructor() {}

    async connect(callbacks: { 
        onOpen: () => void, 
        onMessage: (msg: LiveServerMessage) => void, 
        onClose: (e: any) => void, 
        onError: (e: any) => void 
    }) {
        const ai = getAIClient();
        this.session = await ai.live.connect({
            model: MODEL_LIVE,
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
                },
                systemInstruction: "You are a helpful oral tutor. Engage in a voice conversation with the student.",
            },
            callbacks: {
                onopen: callbacks.onOpen,
                onmessage: callbacks.onMessage,
                onclose: callbacks.onClose,
                onerror: callbacks.onError
            }
        });
    }

    sendAudio(base64Pcm: string) {
        if (this.session) {
             this.session.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Pcm
                }
             });
        }
    }

    disconnect() {
        if (this.session) {
            // session.close() might not be strictly typed in the beta SDK yet or as per guidelines usage
            // but assuming standard WebSocket-like behavior wrapper in SDK
            try {
                this.session.close();
            } catch (e) {
                console.error("Error closing session", e);
            }
        }
    }
}
