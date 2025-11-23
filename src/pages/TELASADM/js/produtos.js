const API_URL = "http://localhost:8080/produtos";

// Seleção de elementos do DOM
const form = document.getElementById("formProduto");
const inputId = document.getElementById("idProd");
const inputNome = document.getElementById("nome");
const inputPreco = document.getElementById("preco");
const inputDescricao = document.getElementById("descricao");
const inputImagem = document.getElementById("imagem");
const tabelaBody = document.getElementById("tabelaProdutosBody");

const btnSalvar = document.getElementById("btnSalvar");
const btnEditar = document.getElementById("btnEditar");
const btnExcluir = document.getElementById("btnExcluir");

// 1. Listar Produtos (GET)
async function listarProdutos() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao buscar produtos");
    const produtos = await response.json();
    renderizarTabela(produtos);
  } catch (error) {
    console.error("Erro:", error);
    alert("Não foi possível carregar os produtos.");
  }
}

// 2. Salvar Produto (POST)
async function salvarProduto() {
  if (!validarFormulario()) return;

  const formData = new FormData();
  formData.append("nome", inputNome.value);
  formData.append("preco", inputPreco.value);
  formData.append("descricao", inputDescricao.value);

  if (inputImagem.files[0]) {
    formData.append("imagem", inputImagem.files[0]);
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData, // Não definir Content-Type, o browser define o boundary
    });

    if (response.ok) {
      alert("Produto salvo com sucesso!");
      limparFormulario();
      listarProdutos();
    } else {
      alert("Erro ao salvar produto.");
    }
  } catch (error) {
    console.error("Erro:", error);
  }
}

// 3. Editar Produto (PUT)
async function editarProduto() {
  const id = inputId.value;
  if (!id) {
    alert("Selecione um produto na tabela para editar.");
    return;
  }

  const formData = new FormData();
  formData.append("id", id);
  formData.append("nome", inputNome.value);
  formData.append("preco", inputPreco.value);
  formData.append("descricao", inputDescricao.value);

  // Só anexa imagem se o usuário escolheu uma nova
  if (inputImagem.files[0]) {
    formData.append("imagem", inputImagem.files[0]);
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (response.ok) {
      alert("Produto atualizado com sucesso!");
      limparFormulario();
      listarProdutos();
    } else {
      alert("Erro ao editar produto.");
    }
  } catch (error) {
    console.error("Erro:", error);
  }
}

// 4. Excluir Produto (DELETE)
async function excluirProduto() {
  const id = inputId.value;
  if (!id) {
    alert("Selecione um produto na tabela para excluir.");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir este produto?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Produto excluído!");
      limparFormulario();
      listarProdutos();
    } else {
      alert("Erro ao excluir produto.");
    }
  } catch (error) {
    console.error("Erro:", error);
  }
}

// --- FUNÇÕES AUXILIARES ---

function renderizarTabela(produtos) {
  tabelaBody.innerHTML = "";
  produtos.forEach((produto) => {
    const tr = document.createElement("tr");

    // Formatar preço
    const precoFormatado = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(produto.preco);

    // Resolver URL da imagem (se houver)
    // Assume que o backend serve imagens estáticas mapeadas em /imagens-upload/**
    const imgUrl = produto.imagemUrl
      ? `http://localhost:8080${produto.imagemUrl}`
      : "";

    tr.innerHTML = `
            <td>#${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${precoFormatado}</td>
            <td>${produto.descricao || "-"}</td>
            <td>
                ${
                  imgUrl
                    ? `<img src="${imgUrl}" alt="${produto.nome}" class="produto-img" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">`
                    : "Sem imagem"
                }
            </td>
        `;

    // Evento de clique na linha para preencher o formulário
    tr.addEventListener("click", () => preencherFormulario(produto));
    tr.style.cursor = "pointer";

    tabelaBody.appendChild(tr);
  });
}

function preencherFormulario(produto) {
  inputId.value = produto.id;
  inputNome.value = produto.nome;
  inputPreco.value = produto.preco;
  inputDescricao.value = produto.descricao;
  // Nota: Por segurança, inputs do tipo "file" não podem ter valor definido via JS

  // Feedback visual
  btnSalvar.disabled = true;
  btnEditar.disabled = false;
  btnExcluir.disabled = false;
}

function limparFormulario() {
  form.reset();
  inputId.value = "";
  btnSalvar.disabled = false;
  btnEditar.disabled = true;
  btnExcluir.disabled = true;
}

function validarFormulario() {
  if (!inputNome.value || !inputPreco.value) {
    alert("Nome e Preço são obrigatórios.");
    return false;
  }
  return true;
}

// --- EVENTOS ---
document.addEventListener("DOMContentLoaded", () => {
  listarProdutos();
  btnEditar.disabled = true;
  btnExcluir.disabled = true;
});

btnSalvar.addEventListener("click", salvarProduto);
btnEditar.addEventListener("click", editarProduto);
btnExcluir.addEventListener("click", excluirProduto);
btnLimpar.addEventListener("click", limparFormulario);
