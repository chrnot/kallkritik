
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNewsItems = async (): Promise<NewsItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Skapa 3 källkritiska utmaningar för svenska ungdomar (13-19 år). 
      Innehållet ska röra sociala medier, AI-trender eller aktuella samhällsfrågor.
      En ska vara en fejkad influencer-nyhet, en en AI-genererad debattartikel och en en sann men otrolig vetenskapsnyhet.
      Inkludera 'clues' som kan upptäckas vid närmare granskning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              body: { type: Type.STRING },
              source: { type: Type.STRING },
              isTrue: { type: Type.BOOLEAN },
              explanation: { type: Type.STRING },
              clues: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              }
            },
            required: ["headline", "body", "source", "isTrue", "explanation", "clues"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      {
        headline: "Nytt AI-filter på TikTok kan gissa ditt framtida yrke med 99% precision",
        body: "Enligt en läckt rapport från tech-jätten bakom appen...",
        source: "TechNews-Daily.se",
        isTrue: false,
        explanation: "Detta spelar på vår kognitiva bias för 'barnum-effekten' – att vi vill tro på personliga förutsägelser.",
        clues: ["Inga länkar till källan", "Sensationellt språk", "Precisionen är orimligt hög"]
      }
    ];
  }
};
