export interface Category {
  id: string;
  name: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Transporte': ['uber', '99', 'taxi', 'onibus', 'metrô', 'metro', 'trem', 'combustível', 'gasolina', 'etanol', 'estacionamento', 'pedágio', 'ipva', 'seguro auto'],
  'Alimentação': ['ifood', 'rappi', 'zé delivery', 'supermercado', 'mercado', 'padaria', 'restaurante', 'lanchonete', 'burger', 'pizza', 'mcdonalds', 'burger king', 'carrefour', 'pão de açúcar', 'assai', 'atacadão'],
  'Lazer': ['cinema', 'teatro', 'show', 'ingresso', 'netflix', 'spotify', 'amazon prime', 'disney+', 'hbo', 'youtube', 'jogos', 'steam', 'playstation', 'xbox', 'bar'],
  'Saúde': ['farmácia', 'drogaria', 'remédio', 'médico', 'consulta', 'exame', 'hospital', 'dentista', 'unimed', 'bradesco saúde', 'sulamerica', 'terapia'],
  'Educação': ['escola', 'faculdade', 'curso', 'livro', 'papelaria', 'alura', 'udemy', 'mensalidade', 'creche'],
  'Moradia': ['aluguel', 'condomínio', 'luz', 'água', 'gás', 'energia', 'internet', 'claro', 'vivo', 'tim', 'oi', 'iptu', 'manutenção', 'reforma'],
  'Pessoal': ['roupa', 'sapato', 'cabeleireiro', 'barbearia', 'salão', 'cosmético', 'perfume', 'academia', 'smartfit'],
  'Animais': ['pet', 'ração', 'veterinário', 'banho', 'tosa', 'cobasi', 'petz'],
  'Taxas': ['juros', 'iof', 'tarifa', 'anuidade', 'multa', 'imposto'],
  'Salário': ['salário', 'adiantamento', 'vale', 'pagamento', 'remuneração'],
  'Investimentos': ['rendimento', 'dividendo', 'cdb', 'tesouro', 'ações', 'fii', 'cripto'],
};

function normalizeString(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function suggestCategory(description: string, categories: Category[]): string | undefined {
  if (!description) return undefined;

  const normalizedDesc = normalizeString(description);

  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedDesc.includes(normalizeString(keyword))) {
        // Tenta encontrar uma correspondência exata ou aproximada na lista de categorias do usuário
        const matchedCategory = categories.find(c => normalizeString(c.name) === normalizeString(categoryName));
        if (matchedCategory) {
          return matchedCategory.id;
        }
      }
    }
  }

  return undefined;
}
