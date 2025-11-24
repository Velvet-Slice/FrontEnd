const API_URL = "http://localhost:8080/produtos";

const inputId = document.getElementById("idProd");
const inputNome = document.getElementById("nome");
const inputPreco = document.getElementById("preco");
const inputDescricao = document.getElementById("descricao");
const inputImagem = document.getElementById("imagem"); // Input type="file"
const tabelaBody = document.getElementById("tabelaProdutosBody");
const form = document.getElementById("formProduto");

const btnSalvar = document.getElementById("btnSalvar");
const btnEditar = document.getElementById("btnEditar");
const btnExcluir = document.getElementById("btnExcluir");

document.addEventListener("DOMContentLoaded", () => {
  listarProdutos();

  btnSalvar.onclick = (e) => {
    e.preventDefault();
    salvarProduto();
  };
  btnEditar.onclick = (e) => {
    e.preventDefault();
    editarProduto();
  };
  btnExcluir.onclick = (e) => {
    e.preventDefault();
    excluirProduto();
  };
});

async function listarProdutos() {
  try {
    const response = await fetch(API_URL);
    const produtos = await response.json();
    renderizarTabela(produtos);
  } catch (error) {
    console.error("Erro ao listar:", error);
  }
}

async function salvarProduto() {
  if (!inputNome.value || !inputPreco.value) {
    alert("Preencha Nome e Preço!");
    return;
  }

  const formData = new FormData();

  formData.append("nome", inputNome.value);
  formData.append("descricao", inputDescricao.value);

  let precoFormatado = inputPreco.value
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  formData.append("preco", precoFormatado);

  if (inputImagem.files[0]) {
    formData.append("imagem", inputImagem.files[0]);
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Produto salvo com sucesso!");
      limparFormulario();
      listarProdutos();
    } else {
      const erroTexto = await response.text();
      console.error("Erro do Backend:", erroTexto);
      alert("Erro ao salvar: " + response.status);
    }
  } catch (error) {
    console.error("Erro de rede:", error);
    alert("Erro de conexão.");
  }
}

async function editarProduto() {
  const id = inputId.value;
  if (!id) return alert("Selecione um produto.");

  const formData = new FormData();
  formData.append("nome", inputNome.value);
  formData.append("descricao", inputDescricao.value);

  let precoFormatado = inputPreco.value
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  formData.append("preco", precoFormatado);

  // Na edição, a imagem é opcional. Só envia se o usuário escolheu uma nova.
  if (inputImagem.files[0]) {
    formData.append("imagem", inputImagem.files[0]);
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (response.ok) {
      alert("Produto atualizado!");
      limparFormulario();
      listarProdutos();
    } else {
      alert("Erro ao editar: " + response.status);
    }
  } catch (e) {
    console.error(e);
  }
}

async function excluirProduto() {
  const id = inputId.value;
  if (!id || !confirm("Deseja realmente excluir?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (response.ok) {
      alert("Produto excluído!");
      limparFormulario();
      listarProdutos();
    } else {
      alert("Erro ao excluir.");
    }
  } catch (e) {
    console.error(e);
  }
}

function renderizarTabela(lista) {
  tabelaBody.innerHTML = "";
  lista.forEach((p) => {
    const tr = document.createElement("tr");

    const imgTag = p.imagemUrl
      ? `<img src="http://localhost:8080${p.imagemUrl}" style="height:50px;">`
      : "Sem img";

    tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nome}</td>
            <td>R$ ${p.preco}</td>
            <td>${p.descricao || ""}</td>
            <td>${imgTag}</td>
        `;
    tr.onclick = () => preencherFormulario(p);
    tr.style.cursor = "pointer";
    tabelaBody.appendChild(tr);
  });
}

function preencherFormulario(p) {
  inputId.value = p.id;
  inputNome.value = p.nome;
  inputPreco.value = p.preco;
  inputDescricao.value = p.descricao;
  // Nota: Não é possível definir o valor de um input type="file" por segurança

  btnSalvar.style.display = "none";
  btnEditar.style.display = "inline-block";
  btnExcluir.style.display = "inline-block";
}

function limparFormulario() {
  form.reset();
  inputId.value = "";
  btnSalvar.style.display = "inline-block";
  btnEditar.style.display = "none";
  btnExcluir.style.display = "none";
}
