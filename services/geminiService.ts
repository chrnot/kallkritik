
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNewsItems = async (): Promise<NewsItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Skapa 6 källkritiska utmaningar för svenska ungdomar (13-19 år). 
      Innehållet ska röra sociala medier, AI-trender, hälsa, gaming eller aktuella samhällsfrågor.
      Blanda friskt mellan följande typer:
      - Sensationella influencer-nyheter (ofta falska).
      - AI-genererade debattartiklar eller inlägg.
      - Sanna men nästan otroliga vetenskapliga upptäckter.
      - Myter om teknik eller hälsa som sprids på TikTok/Snapchat.
      För varje objekt, inkludera 'clues' som kan upptäckas vid senare granskning (t.ex. konstig URL, avsaknad av källor, för bra för att vara sant).`,
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

    const parsed = JSON.parse(response.text || "[]");
    return parsed.length >= 6 ? parsed : [...parsed, ...fallbackData.slice(0, 6 - parsed.length)];
  } catch (error) {
    console.error("Gemini Error:", error);
    return fallbackData;
  }
};

const fallbackData: NewsItem[] = [
  {
    headline: "Nytt AI-filter på TikTok kan gissa ditt framtida yrke med 99% precision",
    body: "Enligt en läckt rapport från tech-jätten bakom appen använder filtret biometrisk data för att analysera personlighetstyper...",
    source: "TechNews-Daily.se",
    isTrue: false,
    explanation: "Detta spelar på vår kognitiva bias för 'barnum-effekten' – att vi vill tro på personliga förutsägelser som egentligen är generella.",
    clues: ["Inga länkar till källan", "Sensationellt språk", "Precisionen är orimligt hög"]
  },
  {
    headline: "Forskare har hittat en planet gjord av diamanter",
    body: "Den kallas '55 Cancri e' och är dubbelt så stor som jorden. Den består till stor del av kol i form av diamant och grafit.",
    source: "Vetenskapsnytt",
    isTrue: true,
    explanation: "Detta är sant! Ibland är verkligheten mer otrolig än dikten, vilket gör källkritik ännu viktigare för att skilja fakta från fiktion.",
    clues: ["Publicerad i ansedda tidskrifter", "Namngiven planet (55 Cancri e)", "Beskriver kemiska processer logiskt"]
  },
  {
    headline: "Influencer erkänner: 'Mitt lyxiga liv var bara ett green-screen-experiment'",
    body: "Den populära profilen visade upp hur enkelt det är att lura följare att tro att man befinner sig i Dubai när man egentligen är i sitt sovrum.",
    source: "SocialMedia-Watch",
    isTrue: true,
    explanation: "Sociala medier är ofta en konstruerad verklighet. Detta påminner oss om att det vi ser inte alltid är det som händer.",
    clues: ["Visar bevis med bakom-kulisserna-bilder", "Citat från personen själv", "Rapporterat i flera källor"]
  },
  {
    headline: "Drick citronvatten varje morgon för att bli immun mot virus",
    body: "En ny viral trend hävdar att syran i citronen skapar en miljö i kroppen där inga virus kan överleva.",
    source: "HealthHacks.net",
    isTrue: false,
    explanation: "Detta är en klassisk hälsomyt. Kroppens pH-värde regleras strikt och kan inte ändras genom kost för att bli 'immun'.",
    clues: ["Låter som en komplext problem", "Ingen medicinsk expertis bakom kontot", "Använder ordet 'immun' vårdslöst"]
  },
  {
    headline: "Hjärnan krymper om man spelar mer än 4 timmar gaming om dagen",
    body: "En kontroversiell studie hävdar att den kognitiva belastningen gör att hjärnvävnaden drar ihop sig hos tonåringar.",
    source: "ParentingTips.com",
    isTrue: false,
    explanation: "Detta är skrämselpropaganda som ofta saknar vetenskaplig grund. Studier visar snarare att gaming kan öka vissa kognitiva förmågor.",
    clues: ["Väcker stark oro/ilska", "Ospecificerad 'kontroversiell studie'", "Källan är en intresseorganisation för föräldrar, inte ett universitet"]
  },
  {
    headline: "Sverige testar att sänka rösträttsåldern till 16 år i utvalda kommuner",
    body: "För att öka ungas engagemang genomförs nu ett pilotprojekt inför nästa lokalval.",
    source: "DemokratiPortalen",
    isTrue: true,
    explanation: "Detta är en pågående politisk diskussion och har testats i flera andra länder (t.ex. Norge och Österrike).",
    clues: ["Neutralt språk", "Beskriver en politisk process", "Relaterar till lagförslag och pilotprojekt"]
  }
];
