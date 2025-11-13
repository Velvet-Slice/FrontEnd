import {
  exibirAlerta,
  limparMensagens,
  verificarCredenciais,
} from "./utilsLogin.js";
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o envio padrão

    if (!loginForm.checkValidity()) {
      exibirAlerta(
        loginForm,
        "error",
        "Preencha o e-mail e a senha corretamente."
      );
      return;
    }

    limparMensagens(loginForm);

    // 3. COLETA DE DADOS
    const inputs = loginForm.querySelectorAll("input");
    const [emailInput, senhaInput] = inputs;

    const credenciais = {
      email: emailInput.value.trim(),
      senha: senhaInput.value,
    };

    const API_URL_VERIFICAR = "http://localhost:8080/auth/login";
    verificarCredenciais(API_URL_VERIFICAR, credenciais, loginForm);
  });
});
