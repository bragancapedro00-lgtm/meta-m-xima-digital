import { NextResponse } from 'next/server';
import { DEFAULT_GEMINI_MODEL } from '@/lib/ai/gemini';

export async function GET() {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  
  return NextResponse.json({
    configured: isConfigured,
    model: DEFAULT_GEMINI_MODEL,
    sdk: '@google/genai',
    api: 'Interactions API',
    message: isConfigured
      ? 'Google Gemini API está configurada e pronta para operações server-side.'
      : 'GEMINI_API_KEY não encontrada nas variáveis de ambiente do servidor.',
  });
}
