import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const dataUrlToPart = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
        throw new Error("Invalid data URL format");
    }
    const mimeTypeMatch = parts[0].match(/:(.*?);/);
    if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
        throw new Error("Could not extract MIME type from data URL");
    }
    return {
        inlineData: {
            data: parts[1],
            mimeType: mimeTypeMatch[1],
        }
    };
};

export const virtualTryOn = async (userImage: string, outfitImage: string): Promise<string> => {
  const userImagePart = dataUrlToPart(userImage);
  const outfitImagePart = dataUrlToPart(outfitImage);

  const prompt = `From the first image, identify the person. From the second image, identify the clothing item. Create a new, photorealistic image where the person from the first image is wearing the clothing item from the second image. The person's pose, face, and the background of the first image should be preserved as closely as possible. Ensure the final image is high-resolution and clear, enhancing the quality if the input images are of lower clarity. The final output must be only the generated image.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        userImagePart,
        outfitImagePart,
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const { data, mimeType } = part.inlineData;
      return `data:${mimeType};base64,${data}`;
    }
  }

  throw new Error("No image was generated in the response.");
};