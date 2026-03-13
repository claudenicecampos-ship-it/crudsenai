// Importa a função para fazer requisições à API
import { apiRequest, setToken } from "./api.js";
// Importa funções utilitárias (DOM, alertas, validação)
import { $, showAlert, hideAlert, validateEmail } from "./utils.js";

/**
 * Inicializa a página de login
 * Configura listeners de evento para formulário de login e botão "Esqueci senha"
 */
export function initLoginPage() {
  // Captura os elementos HTML do formulário
  const form = $("#loginForm");
  const emailEl = $("#email");
  const passEl = $("#password");
  const alertEl = $("#alert");
  const forgotBtn = $("#forgotBtn");

  // Esconde qualquer mensagem de alerta que possa estar visível
  hideAlert(alertEl);

  // Configura o handler para quando o formulário é submetido
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de reload da página
    hideAlert(alertEl); // Limpa alertas anteriores

    // Captura e normaliza os valores do formulário
    const email = emailEl.value.trim().toLowerCase();
    const password = passEl.value;

    // Valida se o email tem formato correto
    if (!validateEmail(email)) {
      return showAlert(alertEl, "warn", "Informe um e-mail válido.");
    }

    try {
      // IMPORTANTE: Quando o backend estiver pronto, descomente a linha abaixo:
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });

      //Salva token e (opcional) o usuário
      setToken(data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      // Reseta o contador de tentativas após login bem-sucedido
      // state = { count: 0, lockedUntil: 0 };
      // setTryState(email, state);

      // Mostra mensagem de sucesso e redireciona para a página de usuários
      showAlert(alertEl, "ok", "Login realizado! Redirecionando…");
      setTimeout(() => (window.location.href = "./users.html"), 700);
    } catch (err) {
      // Se atingiu o máximo de tentativas, bloqueia a conta por 5 minutos
      if (err.status === 401) {
        return showAlert(alertEl, "err", "E-mail ou senha incorretos.");
      }

      if (err.status === 423) {
        returnshowAlert(
          alertE1,
          "err",
          "Usuário bloqueado temporariamente. Aguarde alguns minnutos e tente novamente.",
        );
      }

      // Falback (erros não previstos)

      showAlert(alertEl, "err", err.message || "Falha ao autenticar.");
    }
  });

  // Configura handler para o botão "Esqueci a senha"
  forgotBtn.addEventListener("click", async () => {
    hideAlert(alertEl);
    const email = emailEl.value.trim().toLowerCase();

    // Valida o email antes de enviar
    if (!validateEmail(email)) {
      return showAlert(
        alertEl,
        "warn",
        "Para redefinir, informe um e-mail válido no campo e-mail.",
      );
    }

    try {
      const data = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
        auth: false,
      });
      // Em ambiente didático, exibimos o token no alerta para teste.
       const tokenInfo = data.token ? ` Token: ${data.token}` : "";
       showAlert(alertEl, "ok", `${data.message}${tokenInfo}`);
    } catch (err) {
      console.log(
        "DEBUG ERRO FORGOT PASSWORD:",
        err.message,
        err.status,
        err.data,
      );
      showAlert(
        alertEl,
        "err",
        err.message || "Falha ao solicitar redefinição de senha.",
      );
    }
  });
}
