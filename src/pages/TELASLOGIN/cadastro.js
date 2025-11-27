import { validarCPF } from "./utilsCadastro.js";

// --- FUNÇÃO DE MENSAGEM VISUAL (Igual ao outro projeto) ---
function mostrarMensagem(texto, isErro = false) {
  const msgDiv = document.getElementById("statusMsg");
  if (!msgDiv) {
    console.warn("Atenção: Div 'statusMsg' não encontrada no HTML!");
    return;
  }

  msgDiv.innerText = texto;
  msgDiv.classList.remove("hidden", "status-success", "status-error");

  if (isErro) {
    msgDiv.classList.add("status-error");
  } else {
    msgDiv.classList.add("status-success");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.querySelector(".cadastro-form");

  cadastroForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 1. Limpa mensagem anterior
    const msgDiv = document.getElementById("statusMsg");
    if(msgDiv) msgDiv.classList.add("hidden");

    // 2. COLETA DE DADOS
    const inputs = cadastroForm.querySelectorAll("input");
    // Assumindo a ordem dos inputs no HTML:
    const [nomeInput, emailInput, cpfInput, senhaInput, confirmacaoSenhaInput] = inputs;

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const cpf = cpfInput.value.trim();
    const senha = senhaInput.value;
    const confirmacaoSenha = confirmacaoSenhaInput.value;

    // 3. VALIDAÇÕES (Regras de Negócio no Front)

    if (!cadastroForm.checkValidity()) {
      mostrarMensagem("Por favor, preencha todos os campos obrigatórios.", true);
      return;
    }

    // a) CPF
    if (!validarCPF(cpf)) {
      mostrarMensagem("CPF inválido. Verifique os dígitos.", true);
      cpfInput.focus(); // Dá foco no campo errado
      return;
    }

    // b) Senha Curta
    if (senha.length < 8) {
      mostrarMensagem("A senha deve ter no mínimo 8 caracteres.", true);
      senhaInput.focus();
      return;
    }

    // c) Senhas Diferentes
    if (senha !== confirmacaoSenha) {
      mostrarMensagem("As senhas não correspondem.", true);
      confirmacaoSenhaInput.focus();
      return;
    }

    // 4. PAYLOAD (Objeto para enviar)
    const dadosCadastro = {
      nome: nome,
      email: email,
      cpf: cpf,
      senha: senha,
      confirmarSenha: confirmacaoSenha,
    };

    // 5. CONSUMO DA API (Fetch manual para pegar o erro do Spring)
    const API_URL = "http://localhost:8080/auth/cadastrar";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosCadastro),
      });

      if (response.ok) {
       // Sucesso!
           const successText = await response.text();

           // Mostra mensagem de sucesso (se tiveres o elemento no HTML)
           const successMessageElement = document.getElementById('statusMsg'); // ou 'success-message'
           if (successMessageElement) {
               successMessageElement.textContent = successText;
               successMessageElement.classList.remove('hidden');
               successMessageElement.style.color = "green"; // Garante que é verde
           } else {
               alert(successText); // Fallback se não tiveres o elemento
           }

           // Redireciona após 2 segundos
           setTimeout(() => {
               // Tenta redirecionar para Login.html
               console.log("Redirecionando para Login..."); // Log para debug
               window.location.href = "Login.html";
           }, 2000);

      } else {
        // --- ERRO DO BACKEND (VERMELHO) ---
        const text = await response.text();
        let msgFinal = "";

        try {
          // Tenta ler JSON ({ "message": "Erro..." })
          const json = JSON.parse(text);
          msgFinal = json.message || json.error || JSON.stringify(json);
        } catch (e) {
          // Se não for JSON, lê Texto Puro
          msgFinal = text;
        }

        if (!msgFinal) msgFinal = "Erro ao realizar cadastro.";

        mostrarMensagem("⚠️ " + msgFinal, true);
      }

    } catch (error) {
      console.error("Erro de conexão:", error);
      mostrarMensagem("❌ Erro ao conectar com o servidor.", true);
    }
  });
});