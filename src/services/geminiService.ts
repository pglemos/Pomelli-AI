import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Safely parses JSON from a model response, handling potential markdown code blocks.
 */
function safeJsonParse(text: string | undefined, fallback: any = {}): any {
  if (!text) return fallback;
  try {
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse JSON from response:", text, e);
    return fallback;
  }
}

// 1. Business DNA Extraction
export async function extractBusinessDNA(
  url: string,
  text: string,
  docs: {name: string, content: string}[],
  images: string[]
) {
  const parts: any[] = [];
  
  if (url) {
    parts.push({ text: `Analyze this website: ${url}` });
  }
  
  if (text) {
    parts.push({ text: `Brand text/context: ${text}` });
  }
  
  for (const doc of docs) {
    parts.push({ text: `Document ${doc.name}:\n${doc.content}` });
  }
  
  for (const img of images) {
    const [mimePart, dataPart] = img.split(",");
    if (dataPart) {
      parts.push({
        inlineData: {
          data: dataPart,
          mimeType: mimePart.split(";")[0].split(":")[1],
        }
      });
    }
  }
  
  parts.push({
    text: `Extract the Business DNA from the provided inputs (URL, text, documents, images). Identify the niche, tone of voice, brand colors (hex codes), and brand fonts. If some information is missing, infer it based on the available context or provide best-guess defaults.`
  });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      tools: url ? [{ googleSearch: {} }] : undefined,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          niche: { type: Type.STRING, description: "The business niche or industry" },
          tone: { type: Type.STRING, description: "The tone of voice (e.g., Professional, Playful, Elegant)" },
          colors: { type: Type.STRING, description: "Comma-separated hex codes of brand colors" },
          fonts: { type: Type.STRING, description: "Comma-separated font names" },
          style: { type: Type.STRING, description: "Description of the visual style" }
        },
        required: ["niche", "tone", "colors", "fonts", "style"]
      }
    }
  });

  return safeJsonParse(response.text, {});
}

// 2. Strategic Campaign Ideation
export async function brainstormCampaigns(dna: any) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this Business DNA:
    Niche: ${dna.niche}
    Tone: ${dna.tone}
    Visual Style: ${dna.style}
    
    Act as a strategic marketing partner. Suggest 3 creative campaign ideas or angles tailored to this brand.
    Return as JSON array of objects with 'title' and 'description'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    }
  });
  return safeJsonParse(response.text, []);
}

// 3. Multichannel Copy Generation
export async function generateMultichannelCopy(dna: any, campaign: string) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this Business DNA:
    Niche: ${dna.niche}
    Tone: ${dna.tone}
    
    And this campaign idea: "${campaign}"
    
    Generate copywriting for the following channels:
    1. Instagram Post (engaging, with hashtags)
    2. Facebook Ad (persuasive, clear CTA)
    3. LinkedIn Post (professional, insightful)
    4. Email Banner/Subject (catchy, short)
    
    Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instagram: { type: Type.STRING },
          facebook: { type: Type.STRING },
          linkedin: { type: Type.STRING },
          email: { type: Type.STRING }
        },
        required: ["instagram", "facebook", "linkedin", "email"]
      }
    }
  });
  return safeJsonParse(response.text, {});
}

// 4. Natural Language Editing
export async function editImage(base64Image: string, prompt: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(",")[1],
            mimeType: base64Image.split(";")[0].split(":")[1],
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Falha ao editar a imagem.");
}

export async function editCopy(text: string, prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Original text:\n"${text}"\n\nEdit instruction: "${prompt}"\n\nReturn ONLY the edited text.`,
  });
  return response.text || "";
}

// 5. Product Photoshoot
export async function generateProductPhotoshoot(productImageBase64: string, scenario: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: productImageBase64.split(",")[1],
            mimeType: productImageBase64.split(";")[0].split(":")[1],
          },
        },
        {
          text: `Place this product in the following photorealistic scenario: ${scenario}. Ensure lighting, shadows, and perspective are highly realistic and professional.`,
        },
      ],
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Falha ao gerar photoshoot.");
}

export async function generateImageVariation(base64Image: string, aspectRatio: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(",")[1],
            mimeType: base64Image.split(";")[0].split(":")[1],
          },
        },
        {
          text: "Create a slight variation of this image with minor style or composition changes, keeping the same core subject.",
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
      }
    }
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Falha ao gerar variação da imagem.");
}

export async function analyzeReferences(
  images: string[], 
  context: string, 
  niche: string, 
  tone: string, 
  brandText: string, 
  brandLogoBase64: string | null,
  brandColors: string,
  brandFonts: string,
  postType: string,
  brandStyle: string
): Promise<string> {
  const parts = images.map((img) => ({
    inlineData: {
      data: img.split(",")[1],
      mimeType: img.split(";")[0].split(":")[1],
    },
  }));
  
  if (brandLogoBase64) {
    parts.push({
      inlineData: {
        data: brandLogoBase64.split(",")[1],
        mimeType: brandLogoBase64.split(";")[0].split(":")[1],
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        ...parts,
        {
          text: `Analise profundamente o "Design System" e a identidade visual das imagens de referência fornecidas.
          Identifique a paleta de cores exata, o estilo de iluminação, a composição, os elementos gráficos, a textura e a vibe geral.
          
          Contexto: "${context}"
          Tipo de Post: "${postType}"
          Nicho: "${niche}"
          Tom de voz: "${tone}"
          ${brandColors ? `Cores da Marca (Obrigatório usar): ${brandColors}` : ''}
          ${brandFonts ? `Fontes da Marca: ${brandFonts}` : ''}
          ${brandStyle ? `Estilo Visual da Marca: ${brandStyle}` : ''}
          ${brandText ? `Diretrizes da Marca: "${brandText}"` : ''}
          ${brandLogoBase64 ? 'A última imagem anexada é o LOGO DA MARCA. O prompt deve incluir instruções explícitas para posicionar este logo de forma realista e orgânica dentro da cena (ex: impresso em um objeto físico, bordado em tecido, gravado em uma superfície, ou integrado ao cenário), respeitando a iluminação, sombras e a perspectiva do ambiente. Evite que pareça uma marca d\'água chapada ou artificial.' : ''}
          
          Com base nessa análise rigorosa, escreva um prompt de geração de imagem altamente detalhado.
          O prompt DEVE instruir o gerador de imagens a replicar EXATAMENTE o mesmo estilo visual e design system das referências, aplicando as cores da marca de forma harmoniosa.
          Se o "Tipo de Post" exigir texto na imagem, especifique que o texto deve usar as fontes da marca.
          O prompt deve ser em inglês.
          Retorne APENAS o prompt em inglês, sem explicações adicionais.`,
        },
      ],
    },
  });

  return response.text || "";
}

export async function generateImage(prompt: string, referenceImages: string[], brandLogoBase64: string | null = null, aspectRatio: string = "1:1"): Promise<string> {
  const parts = referenceImages.map((img) => ({
    inlineData: {
      data: img.split(",")[1],
      mimeType: img.split(";")[0].split(":")[1],
    },
  }));

  if (brandLogoBase64) {
    parts.push({
      inlineData: {
        data: brandLogoBase64.split(",")[1],
        mimeType: brandLogoBase64.split(";")[0].split(":")[1],
      }
    });
  }

  const logoInstruction = brandLogoBase64 
    ? "The LAST image provided is the brand logo. You MUST integrate this logo naturally and realistically into the generated image. Place it as if it physically exists in the scene (e.g., printed on a product, embroidered on clothing, engraved on a surface, or seamlessly integrated into the environment's lighting and perspective). Do not just overlay it flatly like a digital watermark." 
    : "";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        ...parts,
        {
          text: `Generate a completely new image that strictly follows the exact visual style, design system, color palette, and aesthetic of the provided reference images. Do not just edit the images, but use them as a strict style guide. \n\n${logoInstruction}\n\nPrompt: ${prompt}`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Falha ao gerar a imagem.");
}

export async function generateCaption(
  context: string, 
  imageDescription: string, 
  niche: string, 
  tone: string, 
  brandText: string,
  postType: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Crie uma legenda criativa, engajadora e pronta para o Instagram para uma postagem.
    Tipo de Post: "${postType}"
    Contexto da postagem: "${context}"
    Descrição da imagem gerada: "${imageDescription}"
    Nicho do Instagram: "${niche}"
    Tom de voz desejado: "${tone}"
    ${brandText ? `Diretrizes da Marca: "${brandText}"` : ''}
    
    A legenda deve ser inspirada na imagem, otimizada para o Instagram, incluir uma chamada para ação (CTA) clara e algumas hashtags relevantes e populares no final. Considere fortemente o tom de voz, o nicho, o tipo de post e as diretrizes da marca (se fornecidas). Formate com quebras de linha adequadas para leitura no Instagram.`,
  });

  return response.text || "";
}

export async function generateCaptionVariations(
  context: string, 
  imageDescription: string, 
  niche: string, 
  tone: string, 
  brandText: string,
  postType: string
): Promise<any[]> {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Crie 3 variações de legenda para o Instagram para a mesma postagem, oferecendo diferentes abordagens, tons e CTAs.
    Tipo de Post: "${postType}"
    Contexto da postagem: "${context}"
    Descrição da imagem gerada: "${imageDescription}"
    Nicho do Instagram: "${niche}"
    Tom de voz base: "${tone}"
    ${brandText ? `Diretrizes da Marca: "${brandText}"` : ''}
    
    Gere as seguintes variações:
    1. Direta e Focada em Conversão (CTA forte, texto mais curto)
    2. Storytelling / Educativa (Mais longa, focada em valor, tom amigável)
    3. Engajamento / Pergunta (Focada em gerar comentários, tom descontraído)
    
    Retorne o resultado em formato JSON com a seguinte estrutura:
    [
      { "type": "Conversão", "text": "texto da legenda com hashtags" },
      { "type": "Storytelling", "text": "texto da legenda com hashtags" },
      { "type": "Engajamento", "text": "texto da legenda com hashtags" }
    ]`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ["type", "text"]
        }
      }
    }
  });

  return safeJsonParse(response.text, []);
}

export async function suggestContentIdeas(images: string[], niche: string): Promise<string> {
  const parts = images.map((img) => ({
    inlineData: {
      data: img.split(",")[1],
      mimeType: img.split(";")[0].split(":")[1],
    },
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        ...parts,
        {
          text: `Analise as imagens de referência fornecidas. Com base no design system, paleta de cores, tipografia, cenário e estilo geral dessas imagens, e considerando o nicho "${niche}", sugira uma ideia detalhada para um novo post.
          A sugestão deve descrever o que criar, incluindo:
          - Ideia central do post
          - Cenário e elementos visuais
          - Paleta de cores
          - Tipografia e estilo de fonte
          - Sugestão de texto na imagem (se aplicável)
          
          Escreva de forma direta e inspiradora, pronto para ser usado como contexto para a geração da imagem. Não use formatação markdown complexa, apenas texto claro.`,
        },
      ],
    },
  });

  return response.text || "";
}

export async function analyzeTrends(niche: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Pesquise e identifique temas populares, estilos visuais em alta e tendências atuais no Instagram para o nicho: "${niche}".
    Apresente um relatório de tendências conciso e 3 sugestões de conteúdo acionáveis para inspirar a criação de novas imagens.
    Formate a resposta em Markdown, com tópicos claros.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text || "";
}

export async function suggestBestPostTimes(niche: string): Promise<string[]> {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Quais são os 3 melhores horários (dias da semana e horas) para postar no Instagram para o nicho de "${niche}" para obter o máximo de engajamento?
    Retorne APENAS uma lista JSON de strings no formato "Dia da Semana, HH:MM". Exemplo: ["Segunda-feira, 18:00", "Quarta-feira, 12:00", "Sexta-feira, 09:00"]. Não inclua formatação markdown na resposta, apenas o array JSON.`,
  });

  return safeJsonParse(response.text, ["Segunda-feira, 18:00", "Quarta-feira, 12:00", "Sexta-feira, 09:00"]);
}
