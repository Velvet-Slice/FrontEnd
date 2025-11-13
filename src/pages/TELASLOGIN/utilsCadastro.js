export function validarCPF(cpf) {
  const cleanCpf = cpf.replace(/[^\d]/g, "");
  // Validação mínima: 11 dígitos numéricos e não todos iguais.
  if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }
  return true;
}

/**
 * Adiciona uma mensagem de erro abaixo de um campo de input.
 */
export function exibirErro(inputElement, mensagem) {
  // ... (Implementação idêntica à do código anterior) ...
  const erroElement = document.createElement("p");
  erroElement.classList.add("error-message");
  erroElement.textContent = mensagem;
  inputElement.parentNode.insertBefore(erroElement, inputElement.nextSibling);
  inputElement.classList.add("input-error");
}

/**
 * Remove todas as mensagens de erro do formulário.
 */
export function limparErros(form) {
  // ... (Implementação idêntica à do código anterior) ...
  form.querySelectorAll(".error-message").forEach((el) => el.remove());
  form
    .querySelectorAll("input")
    .forEach((el) => el.classList.remove("input-error"));
  const msgElement = form
    .closest(".container")
    .querySelector(".feedback-message");
  if (msgElement) msgElement.remove();
}

/**
 * Exibe mensagens de feedback.
 */
export function exibirMensagem(mensagem, tipo) {
  // ... (Implementação idêntica à do código anterior) ...
  const container = document.querySelector(".container");
  let msgElement = container.querySelector(".feedback-message");

  if (!msgElement) {
    msgElement = document.createElement("p");
    msgElement.classList.add("feedback-message");
    // Insere a mensagem antes do formulário
    container.insertBefore(
      msgElement,
      container.querySelector(".cadastro-form")
    );
  }

  msgElement.textContent = mensagem;
  msgElement.className = `feedback-message ${tipo}`;
}

/**
 * Realiza a requisição POST para a API Java.
 * @param {string} url - O endpoint da API.
 * @param {Object} dados - O payload (corpo da requisição).
 */
export async function consumirApiCadastro(url, dados, form) {
  try {
    exibirMensagem("Cadastrando cliente...", "info");

    // Requisição HTTP POST para o Backend Java
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    // TRATAMENTO DA RESPOSTA
    if (response.ok) {
      // 2xx Success (ex: 201 Created)
      const resultado = await response.text();
      exibirMensagem(
        `Cadastro realizado! ID: ${JSON.stringify(resultado.id) || "N/A"}`,
        "success"
      );
      // Redirecionamento: Uma vez cadastrado, o cliente deve ir para a tela de Login.
      setTimeout(() => (window.location.href = "Login.html"), 1500);
    } else {
      // Erros do lado do servidor (ex: 400 Bad Request - E-mail ou CPF já existem)
      const erro = await response.text();
      exibirMensagem(
        `Erro no servidor: ${erro.mensagem || "Ocorreu um erro no servidor."}`,
        "error"
      );
    }
  } catch (error) {
    // Erros de rede (Network Failure)
    exibirMensagem("Erro de conexão: Servidor inacessível.", "error");
    console.error("Erro de rede/API:", error);
  }
}
