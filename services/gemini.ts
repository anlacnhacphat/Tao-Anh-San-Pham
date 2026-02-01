
import { GoogleGenAI } from "@google/genai";
import { ImageQuality } from "../types";

export const generateProductImage = async (
  productBase64: string,
  bgType: 'upload' | 'text',
  bgInput: string | null,
  quality: ImageQuality
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key không khả dụng.");

  const ai = new GoogleGenAI({ apiKey });
  
  // Choose model based on quality requirements
  // Ultra quality requires Gemini 3 Pro Image
  const modelName = quality === 'Ultra' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const imageSize = quality === 'Ultra' ? "4K" : "1K";
  
  const prompt = `
    TASK: Product Background Replacement for E-commerce.
    INSTRUCTION: 
    1. KEEP THE PRODUCT IN THE PROVIDED IMAGE 100% IDENTICAL. Do not distort, change colors, logos, or shape.
    2. REPLACE THE BACKGROUND COMPLETELY with: ${bgType === 'text' ? bgInput : 'the style and environment suggested by the uploaded background image'}.
    3. Ensure professional commercial lighting: natural shadows under the product, correct highlights reflecting the new environment.
    4. Style: High-end, clean, sharp, professional advertising photography.
    5. Final output must be only the product perfectly integrated into the new scene.
  `;

  const parts: any[] = [
    {
      inlineData: {
        data: productBase64.split(',')[1],
        mimeType: 'image/png',
      },
    },
    { text: prompt }
  ];

  // If background is an image, add it to parts
  if (bgType === 'upload' && bgInput) {
    parts.push({
      inlineData: {
        data: bgInput.split(',')[1],
        mimeType: 'image/png',
      },
    });
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        ...(modelName === 'gemini-3-pro-image-preview' ? { imageSize } : {})
      }
    },
  });

  let imageUrl = '';
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("Không thể trích xuất hình ảnh từ phản hồi của AI.");
  
  return imageUrl;
};

export const checkApiKeySelection = async (): Promise<boolean> => {
  // @ts-ignore
  if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
    // @ts-ignore
    return await window.aistudio.hasSelectedApiKey();
  }
  return true; // Fallback for environments without this specific API
};

export const openApiKeySelection = async (): Promise<void> => {
  // @ts-ignore
  if (typeof window.aistudio?.openSelectKey === 'function') {
    // @ts-ignore
    await window.aistudio.openSelectKey();
  }
};
