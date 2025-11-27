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

    if (response.ok) {

      const data = await response.json();
      

      localStorage.setItem("usuarioLogado", JSON.stringify(data));

      exibirAlerta(form, "success", "Login bem-sucedido! Redirecionando...");

      setTimeout(
        () => (window.location.href = "../TELASLANDINGPAGE/LP.html"),
        1500
      );
    } else {
    
      let erroMensagem = "E-mail ou senha incorretos.";
      try {
        const erroJson = await response.json();
        erroMensagem = erroJson.message || erroJson.error || erroMensagem;
      } catch (e) {
        const erroTexto = await response.text();
        if (erroTexto) erroMensagem = erroTexto;
      }
      exibirAlerta(form, "error", erroMensagem);
    }
  } catch (error) {
    exibirAlerta(form, "error", "Falha na comunicação: Servidor inacessível.");
    console.error("Erro de conexão:", error);
  }
}
