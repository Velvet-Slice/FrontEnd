export function exibirAlerta(form, tipo, mensagem) {
  const container = form.closest(".container");
  let alertElement = container.querySelector(".auth-alert");

  if (!alertElement) {
    alertElement = document.createElement("p");
    alertElement.classList.add("auth-alert");
    container.insertBefore(alertElement, form);
  }

  alertElement.textContent = mensagem;
  alertElement.className = `auth-alert ${tipo}`;
}


export function limparMensagens(form) {
  const alertElement = form.closest(".container").querySelector(".auth-alert");
  if (alertElement) alertElement.remove();
}

export async function verificarCredenciais(url, credenciais, form) {
  try {
    exibirAlerta(form, "info", "Verificando credenciais...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credenciais),
    });

    // 5. TRATAMENTO DA RESPOSTA
    if (response.ok) {
      // 200 OK: Credenciais encontradas e válidas.
      exibirAlerta(form, "success", "Login bem-sucedido! Redirecionando...");

      // Redirecionamento para a Landing Page (LP.html)
      // Note: O caminho é '../TELASLANDINGPAGE/LP.html' conforme seu HTML
      setTimeout(
        () => (window.location.href = "../TELASLANDINGPAGE/LP.html"),
        1500
      );
    } else if (
      response.status === 401 ||
      response.status === 400 ||
      response.status === 404
    ) {
      let erroMensagem =
        "E-mail ou senha incorretos ou inexistentes. Tente novamente.";

      try {
        const erroJson = await response.json();
        // Assumindo que o Spring Boot pode retornar uma mensagem de erro JSON
        erroMensagem = erroJson.mensagem || erroJson.error || erroMensagem;
      } catch (e) {
        // Se falhar (Backend enviou texto simples), lemos o texto.
        const erroTexto = await response.text();
        // Se o texto não for vazio, usamos ele, senão o fallback.
        if (erroTexto.trim() !== "") {
          erroMensagem = erroTexto;
        }
      }

      exibirAlerta(form, "error", erroMensagem);
    } else {
      // Outros erros do servidor (ex: 500 Internal Server Error)
      exibirAlerta(
        form,
        "error",
        `Erro no servidor (${response.status}): Tente novamente mais tarde.`
      );
    }
  } catch (error) {
    // Erros de rede (Network Failure)
    exibirAlerta(form, "error", "Falha na comunicação: Servidor inacessível.");
    console.error("Erro de conexão:", error);
  }
}
