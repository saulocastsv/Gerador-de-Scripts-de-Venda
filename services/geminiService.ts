import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScriptContent } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema strictly
const scriptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    initial_message: {
      type: Type.STRING,
      description: "The first outreach message. Engaging and relevant.",
    },
    follow_up_1: {
      type: Type.STRING,
      description: "First follow-up message sent 2-3 days later.",
    },
    follow_up_2: {
      type: Type.STRING,
      description: "Second follow-up providing value or social proof.",
    },
    follow_up_final: {
      type: Type.STRING,
      description: "Break-up email or final attempt.",
    },
    recommended_cta: {
      type: Type.STRING,
      description: "The specific Call to Action used across the scripts.",
    },
    strategy_note: {
      type: Type.STRING,
      description: "A brief explanation of the psychological strategy used.",
    }
  },
  required: ["initial_message", "follow_up_1", "follow_up_2", "follow_up_final", "recommended_cta"],
};

export const generateScript = async (niche: string, objective: string): Promise<ScriptContent> => {
  try {
    const prompt = `
      Act as a world-class sales copywriter and strategist.
      Create a high-converting 4-step outreach sequence (Email/LinkedIn/WhatsApp compatible) for the following scenario:
      
      Niche: ${niche}
      Objective: ${objective}
      
      The tone should be professional yet conversational, concise, and persuasive. 
      Focus on value proposition and pain points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for better reasoning on sales strategy
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scriptSchema,
        thinkingConfig: {
          thinkingBudget: 32768, // Max thinking budget for deep strategic analysis
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ScriptContent;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};