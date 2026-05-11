import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function enhancePrompt(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `Transform this simple image idea into a professional-grade, highly detailed image generation prompt. Focus on lighting, texture, composition, and style. Keep the enhanced prompt concise but descriptive. 
          
Simple idea: ${prompt}` }]
        }
      ],
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || prompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return prompt;
  }
}

export interface GenerationResult {
  imageUrl: string;
  revisedPrompt: string;
}

export async function generateImage(prompt: string, aspectRatio: string): Promise<GenerationResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl = "";
    let revisedPrompt = prompt;

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        revisedPrompt = part.text;
      }
    }

    if (!imageUrl) throw new Error("No image generated");

    return { imageUrl, revisedPrompt };
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
