import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = 'gemini-2.5-flash-image';

export const removeWatermark = async (
  base64Image: string, 
  mimeType: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("缺少 API Key，请检查环境变量配置。");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Remove header from base64 string if present (e.g., "data:image/png;base64,")
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Remove all watermarks, logos, and text overlays from this image. Fill in the background naturally where the watermarks were removed to make it look like the original clean image. Return ONLY the cleaned image.",
          },
        ],
      },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("Gemini 未返回内容。");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("模型处理了请求但未返回图片，请重试。");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "去水印失败。");
  }
};