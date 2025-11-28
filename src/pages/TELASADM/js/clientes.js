const API_URL = "http://localhost:8080/admin/clientes";

document.addEventListener("DOMContentLoaded", () => {
  carregarClientes();

  // Configura os botões
  document.getElementById("btnSalvar").addEventListener("click", (e) => {
    e.preventDefault();
    salvarCliente("POST");
  });

  document.getElementById("btnEditar").addEventListener("click", (e) => {
    e.preventDefault();
    salvarCliente("PUT");
  });

  document.getElementById("btnExcluir").addEventListener("click", (e) => {
    e.preventDefault();
    excluirCliente();
  });
});

async function carregarClientes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao buscar clientes");

    const users = await response.json();
    const tbody = document.getElementById("tabela-clientes");
    tbody.innerHTML = "";

    users.forEach((user) => {
      const tr = document.createElement("tr");

      // O Backend retorna uma lista de Users.
      // user.id, user.nome, user.cpf, user.email
      tr.innerHTML = `
                <td>#${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.cpf}</td>
                <td>${user.email}</td>
            `;

      // Ao clicar na linha, preenche o formulário
      tr.addEventListener("click", () => preencherFormulario(user));
      tr.style.cursor = "pointer";

      // Efeito visual
      tr.onmouseover = () => (tr.style.backgroundColor = "#f0e6d2");
      tr.onmouseout = () => (tr.style.backgroundColor = "");

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro:", error);
  }
}

function preencherFormulario(user) {
  document.getElementById("inputId").value = user.id;
  document.getElementById("inputNome").value = user.nome;
  document.getElementById("inputCpf").value = user.cpf;
  document.getElementById("inputEmail").value = user.email;
  // Senha não é preenchida por segurança
  document.getElementById("inputSenha").value = "";

  console.log("Selecionado ID:", user.id);
}

async function salvarCliente(metodo) {
  const id = document.getElementById("inputId").value;
  const nome = document.getElementById("inputNome").value;
  const cpf = document.getElementById("inputCpf").value;
  const email = document.getElementById("inputEmail").value;
  const senha = document.getElementById("inputSenha").value;

  // Validação simples
  if (!nome || !cpf || !email) {
    alert("Nome, CPF e Email são obrigatórios.");
    return;
  }

  // Objeto a ser enviado
  const dados = {
    nome: nome,
    cpf: cpf,
    email: email,
    senha: senha, // Pode ir vazia na edição
  };

  let url = API_URL;

  if (metodo === "PUT") {
    if (!id) {
      alert("Selecione um cliente para editar.");
      return;
    }
    url = `${API_URL}/${id}`;
  } else {
    // POST (Criar) exige senha
    if (!senha) {
      alert("Senha é obrigatória para cadastro.");
      return;
    }
  }

  try {
    const response = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (response.ok) {
      alert("Operação realizada com sucesso!");
      limparFormulario();
      carregarClientes();
    } else {
      const erro = await response.text(); // Tenta ler mensagem do backend
      alert("Erro ao salvar: " + erro);
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro de conexão.");
  }
}

async function excluirCliente() {
  const id = document.getElementById("inputId").value;

  if (!id) {
    alert("Selecione um cliente para excluir.");
    return;
  }

  if (confirm("Tem certeza que deseja excluir este cliente?")) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok || response.status === 204) {
        alert("Cliente excluído!");
        limparFormulario();
        carregarClientes();
      } else {
        alert("Erro ao excluir.");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  }
}

function limparFormulario() {
  document.querySelector("form").reset();
  document.getElementById("inputId").value = "";
}
