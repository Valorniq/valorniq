import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function summarizeBusinessState(leads: any[], inventory: any[], sales: any[]) {
  const prompt = `Analyze the current state of the business based on this data:
Leads: ${JSON.stringify(leads)}
Inventory: ${JSON.stringify(inventory)}
Sales: ${JSON.stringify(sales)}

Provide a concise high-level summary, identifying:
1. Top priority leads to follow up.
2. Inventory items needing restocking.
3. Sales performance trend.
4. One growth opportunity suggestion.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert business consultant. Keep your response professional, data-driven, and actionable. Format in markdown.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error", error);
    return "Unable to generate business insights at this time.";
  }
}

export async function chatWithNexus(message: string, context: { leads: any[], products: any[], sales: any[] }) {
  const prompt = `User Message: ${message}

Current Business Context:
Leads: ${JSON.stringify(context.leads.map(l => ({ name: l.name, status: l.status, value: l.estimatedValue })))}
Inventory: ${JSON.stringify(context.products.map(p => ({ name: p.name, stock: p.stock, price: p.price })))}
Sales: ${JSON.stringify(context.sales.map(s => ({ total: s.totalValue, status: s.status })))}

As ARIS, the enterprise OS brain, respond to the user's message. 
Be concise, professional, and use the data provided to give specific answers. 
If they ask for summaries, calculations, or advice, use the context. 
Format your response in Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are ARIS, a sophisticated business operating system assistant. You have full access to CRM, ERP, and Sales data. You provide strategic, data-driven counsel.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error", error);
    return "The neural link is currently unstable. Please try again or check your system configuration.";
  }
}
