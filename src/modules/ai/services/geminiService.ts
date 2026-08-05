export interface CategoryInfo {
  id: string;
  name: string;
}

export interface CategorizationResult {
  description: string;
  categoryId: string;
}

/**
 * Serviço de Integração com a API do Gemini.
 * OBSERVAÇÃO DE SEGURANÇA: A chave da API do Gemini NUNCA deve ser exposta no frontend
 * (import.meta.env.VITE_GEMINI_API_KEY). Para seguir as boas práticas de segurança,
 * a requisição é feita para a nossa Serverless Function no backend (/api/categorize),
 * onde a variável de ambiente (GEMINI_API_KEY) é mantida em segredo.
 */
export async function categorizeTransactions(
  descriptions: string[],
  categories: CategoryInfo[]
): Promise<Record<string, string>> {
  if (descriptions.length === 0) return {};

  try {
    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ descriptions, categories }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || 'Falha ao conectar com o serviço de IA');
    }

    const data = await response.json();
    
    // Converte o array de categorizations retornado pelo backend
    // no formato Record<description, categoryId> desejado
    const mapping: Record<string, string> = {};
    if (data && Array.isArray(data.categorizations)) {
      data.categorizations.forEach((item: CategorizationResult) => {
        if (item.description && item.categoryId) {
          mapping[item.description] = item.categoryId;
        }
      });
    }

    return mapping;
  } catch (error) {
    console.error('[Gemini Service] Erro ao categorizar:', error);
    throw error;
  }
}
