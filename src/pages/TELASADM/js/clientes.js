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

    if (!response.ok) {
      throw new Error(`Erro na rede: ${response.status}`);
    }

    const clientes = await response.json();
    const tbody = document.getElementById("tabela-clientes");
    tbody.innerHTML = "";

    clientes.forEach((cliente) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td>#${cliente.id}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.cpf}</td>
                <td>${cliente.email}</td>
            `;

      tr.addEventListener("click", () => preencherFormulario(cliente));
      tr.style.cursor = "pointer";

      tr.onmouseover = () => (tr.style.backgroundColor = "#f0e6d2");
      tr.onmouseout = () => (tr.style.backgroundColor = "");

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    alert("Erro ao conectar com o servidor.");
  }
}

function preencherFormulario(cliente) {
  const inputId = document.getElementById("inputId");
  if (inputId) inputId.value = cliente.id;

  document.getElementById("inputNome").value = cliente.nome;
  document.getElementById("inputCpf").value = cliente.cpf;
  document.getElementById("inputEmail").value = cliente.email;

  document.getElementById("inputSenha").value = "";

  console.log("Cliente selecionado ID:", cliente.id); // Para debug
}

async function salvarCliente(metodo) {
  const id = document.getElementById("inputId")
    ? document.getElementById("inputId").value
    : null;

  const nome = document.getElementById("inputNome").value;
  const cpf = document.getElementById("inputCpf").value;
  const email = document.getElementById("inputEmail").value;
  const senha = document.getElementById("inputSenha").value;

  if (!nome || !cpf || !email) {
    alert("Por favor, preencha os campos obrigatórios (Nome, CPF, Email).");
    return;
  }

  let url = API_URL;
  if (metodo === "PUT") {
    if (!id) {
      alert("Selecione um cliente na tabela primeiro para poder editar.");
      return;
    }
    url = `${API_URL}/${id}`;
  } else if (metodo === "POST") {
    if (!senha) {
      alert("A senha é obrigatória para novos cadastros.");
      return;
    }
  }

  const dados = {
    nome: nome,
    cpf: cpf,
    email: email,
    senha: senha, // O backend deve tratar se a senha vier vazia na edição
  };

  try {
    const response = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    if (response.ok) {
      alert(
        metodo === "POST"
          ? "Cliente cadastrado com sucesso!"
          : "Cliente atualizado com sucesso!"
      );
      limparFormulario();
      carregarClientes(); // Recarrega a tabela
    } else {
      const erroTexto = await response.text();
      alert("Erro ao salvar: " + erroTexto);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Erro de conexão com o servidor.");
  }
}

async function excluirCliente() {
  const id = document.getElementById("inputId")
    ? document.getElementById("inputId").value
    : null;

  if (!id) {
    alert("Selecione um cliente na tabela para excluir.");
    return;
  }

  if (confirm("Tem certeza que deseja excluir este cliente?")) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok || response.status === 204) {
        alert("Cliente excluído com sucesso!");
        limparFormulario();
        carregarClientes();
      } else {
        alert("Erro ao excluir cliente.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao tentar excluir.");
    }
  }
}

function limparFormulario() {
  document.querySelector("form").reset();
  const inputId = document.getElementById("inputId");
  if (inputId) inputId.value = ""; // Limpa o ID oculto para evitar edições acidentais de novos registros
}
