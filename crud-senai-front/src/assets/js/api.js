// Define a URL base do servidor backend (Node.js)
// Quando o servidor estiver rodando, as requisições irão para http://localhost:3000
const API_BASE_URL = "http://localhost:3000";

/**
 * Recupera o token  armazenado no navegador

 */
function getToken() {
  return localStorage.getItem("token");
}

// Salva ou remove o token do localStorage
export function setToken(token){
  if(!token){
    localStorage.removeItem("token");
  }
  localStorage.setItem("token", token);
}
/**
 * Função genérica para fazer chamadas HTTP à API
 * 
 * @param {string} path - Caminho da API (ex: "/api/users")
 * @param {object} options - Opções da requisição
 
 */
export async function apiRequest(path, { method = "GET", body, auth = true } = {}){
  // Cria objeto com headers padrão
  const headers = { "Content-Type": "application/json" };

  // inclui token automaticamente quando auth = true
  if (auth) {
    const token = getToken();
    if (token) {headers.Authorization = `Bearer ${token}`;
  }
}

  // Faz a requisição HTTP para o servidor backend
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined  // Converte objeto para string JSON
  });

  // Tenta converter a resposta para JSON, ou retorna vazio se falhar
  const data = await response.json().catch(() => ({}));

  // Se a resposta teve erro (status não está entre 200-299)
  if (!response.ok) {
    // Usa a mensagem do servidor, ou cria uma mensagem padrão com o código HTTP
    const err = new Error (data.message || `Erro HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw  error;
  }

  // Retorna os dados da resposta se tudo correu bem
  return data;
}
