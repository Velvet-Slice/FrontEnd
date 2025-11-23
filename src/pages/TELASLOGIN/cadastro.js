import {
  exibirErro,
  exibirMensagem,
  limparErros,
  validarCPF,
  consumirApiCadastro,
} from "./utilsCadastro.js";

document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.querySelector(".cadastro-form");

  cadastroForm.addEventListener("submit", (event) => {
    // Previne o Full Page Reload, essencial para usar a comunicação assíncrona (Fetch API).
    event.preventDefault();

    if (!cadastroForm.checkValidity()) {
      exibirMensagem(
        "Por favor, preencha todos os campos obrigatórios.",
        "error"
      );
      return;
    }

    // COLETA DE DADOS
    const inputs = cadastroForm.querySelectorAll("input");
    const [nomeInput, emailInput, cpfInput, senhaInput, confirmacaoSenhaInput] =
      inputs;

    const nome = nomeInput.value.trim();
    const cpf = cpfInput.value.trim();
    const senha = senhaInput.value;
    const confirmacaoSenha = confirmacaoSenhaInput.value;

    limparErros(cadastroForm);

    // VALIDAÇÃO REGRAS DE NEGÓCIO

    // a) CPF (Regra - 11 dígitos)
    if (!validarCPF(cpf)) {
      exibirErro(cpfInput, "CPF inválido. Insira 11 dígitos numéricos.");
      return;
    }

    // b) Senha (Comprimento Mínimo)
    if (senha.length < 8) {
      exibirErro(senhaInput, "A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    // c) Confirmação Senha (Correspondência)
    if (senha !== confirmacaoSenha) {
      exibirErro(confirmacaoSenhaInput, "As senhas não correspondem.");
      return;
    }

    // PAYLOAD
    const dadosCadastro = {
      nome: nome,
      email: emailInput.value.trim(),
      cpf: cpf,
      senha: senha,
      confirmarSenha: confirmacaoSenha,
    };

    // 5. CONSUMO DA API
    const API_URL = "http://localhost:8080/auth/cadastrar";
    consumirApiCadastro(API_URL, dadosCadastro, cadastroForm);
  });
});
