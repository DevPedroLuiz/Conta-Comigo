import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[Categorize] GEMINI_API_KEY not configured.');
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const { descriptions, categories } = req.body;

    if (!Array.isArray(descriptions) || !Array.isArray(categories)) {
      return res.status(400).json({ error: 'Invalid payload. Expected descriptions and categories arrays.' });
    }

    if (descriptions.length === 0) {
      return res.status(200).json({ categorizations: [] });
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      } 
    });

    const prompt = `
Você é um assistente financeiro especialista em categorizar transações.
Abaixo está uma lista de descrições de transações e uma lista de categorias disponíveis (com seus IDs e Nomes).
Sua tarefa é analisar cada descrição de transação e associá-la ao ID da categoria que melhor se encaixa.

Categorias Disponíveis:
${categories.map((c: {id: string, name: string}) => `- [ID: ${c.id}] ${c.name}`).join('\n')}

Transações para categorizar:
${descriptions.map((d: string) => `- ${d}`).join('\n')}
`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        categorizations: {
          type: Type.ARRAY,
          description: 'Lista de transações categorizadas',
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: 'A descrição original exata da transação, conforme enviada' },
              categoryId: { type: Type.STRING, description: 'O ID da categoria mais adequada' }
            },
            required: ['description', 'categoryId']
          }
        }
      },
      required: ['categorizations']
    };

    const MAX_RETRIES = 3;
    const INITIAL_DELAY_MS = 1000;

    let resultJson = null;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.2, // Low temperature for more deterministic categorization
          }
        });

        if (!response.text) {
            throw new Error("No response from Gemini");
        }

        resultJson = JSON.parse(response.text);
        break; // Sucesso, sai do loop
      } catch (error: any) {
        lastError = error;
        console.warn(`[Categorize] Error on attempt ${attempt}:`, error.message || error);
        
        if (attempt < MAX_RETRIES) {
          const delay = INITIAL_DELAY_MS * attempt; // Linear/Exponential delay
          console.log(`[Categorize] Waiting ${delay}ms before retrying...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (!resultJson) {
      throw lastError || new Error("Failed to categorize after maximum retries");
    }

    return res.status(200).json(resultJson);
  } catch (error) {
    console.error('[Categorize] Error categorizing transactions:', error);
    return res.status(500).json({ error: 'Internal server error during categorization' });
  }
}
