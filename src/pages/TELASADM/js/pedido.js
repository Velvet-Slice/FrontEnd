const API_URL = "http://localhost:8080/api/pedidos";
const CLIENTES_URL = "http://localhost:8080/admin/clientes";

// 1. Inicialização
document.addEventListener("DOMContentLoaded", () => {
  listarPedidos();
  carregarClientesNoSelect();
});

// Função para máscara de moeda no input (R$ 1.000,00)
// Deve ser chamada no onkeyup do HTML: onkeyup="formatarMoeda(this)"
function formatarMoeda(i) {
  let v = i.value.replace(/\D/g, "");
  v = (v / 100).toFixed(2) + "";
  v = v.replace(".", ",");
  v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
  v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
  i.value = "R$ " + v;
}

// Carrega os clientes no <select>
async function carregarClientesNoSelect() {
  try {
    const response = await fetch(CLIENTES_URL);
    if (response.ok) {
      const clientes = await response.json();
      const select = document.getElementById("clienteSelect");

      // Limpa opções antigas mantendo a primeira
      select.innerHTML =
        '<option value="" disabled selected>Selecione o Cliente</option>';

      clientes.forEach((cli) => {
        const option = document.createElement("option");
        // Verifica se o ID está na raiz (User) ou dentro de objeto cliente
        option.value = cli.cliente ? cli.cliente.id : cli.id;
        option.text = `${cli.nome} (${cli.cpf})`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
  }
}

// Função GET (Listar Pedidos)
async function listarPedidos() {
  try {
    const response = await fetch(API_URL);
    const pedidos = await response.json();
    const tbody = document.getElementById("tabela-corpo");
    tbody.innerHTML = "";

    pedidos.forEach((pedido) => {
      const tr = document.createElement("tr");

      const dataEntrega = pedido.dataEntrega
        ? new Date(pedido.dataEntrega).toLocaleDateString("pt-BR")
        : "-";

      const nomeCliente = pedido.cliente
        ? pedido.cliente.nome
        : "Cliente Removido";

      const valorExibicao = pedido.valorTotal
        ? pedido.valorTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "R$ 0,00";

      // Lógica visual para Sim/Não na coluna Pago
      const pagoTexto = pedido.pago
        ? '<span style="color:green; font-weight:bold;">Sim</span>'
        : '<span style="color:red;">Não</span>';

      tr.innerHTML = `
            <td>#${pedido.id}</td>
            <td>${nomeCliente}</td>
            <td>${dataEntrega}</td>
            <td>${pedido.status}</td>
            <td>${pagoTexto}</td>
            <td>${valorExibicao}</td>
            <td>
              <button onclick='preencherFormulario(${JSON.stringify(
                pedido
              )})'>Selecionar</button>
            </td>
          `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao listar:", error);
  }
}

// Captura dados e converte valor formatado para float (Java BigDecimal)
function capturarDadosFormulario() {
  const selectCliente = document.getElementById("clienteSelect");
  const valorString = document.getElementById("valorTotal").value;

  // Remove "R$", pontos de milhar e troca vírgula por ponto
  const valorLimpo = valorString
    ? parseFloat(
        valorString
          .replace("R$", "")
          .replace(/\./g, "")
          .replace(",", ".")
          .trim()
      )
    : 0.0;

  return {
    id: document.getElementById("pedidoId").value || null,
    clienteId: selectCliente.value,
    dataEntrega: document.getElementById("dataEntrega").value,
    descricao: document.getElementById("descricao").value,
    status: document.getElementById("statusPedido").value,
    pago: document.getElementById("isPago").checked, // Captura o estado do checkbox
    valorTotal: valorLimpo,
  };
}

// Função POST (Criar)
async function salvarPedido(e) {
  e.preventDefault();
  const dados = capturarDadosFormulario();
  delete dados.id; // Remove ID para criar novo

  if (!dados.clienteId) {
    alert("Selecione um cliente!");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (response.ok) {
      alert("Pedido salvo com sucesso!");
      limparFormulario();
      listarPedidos();
    } else {
      const erro = await response.text();
      alert("Erro ao salvar: " + erro);
    }
  } catch (error) {
    console.error("Erro:", error);
  }
}

// Função PUT (Editar)
async function editarPedidoBackend(e) {
  e.preventDefault();
  const dados = capturarDadosFormulario();

  if (!dados.id) {
    alert("Selecione um pedido na lista para editar.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${dados.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (response.ok) {
      alert("Pedido atualizado com sucesso!");
      limparFormulario();
      listarPedidos();
    } else {
      alert("Erro ao atualizar.");
    }
  } catch (error) {
    console.error("Erro:", error);
  }
}

// Função DELETE (Excluir)
async function excluirPedido(e) {
  e.preventDefault();
  const id = document.getElementById("pedidoId").value;

  if (!id) {
    alert("Selecione um pedido para excluir.");
    return;
  }

  if (confirm("Tem certeza que deseja excluir este pedido?")) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok || response.status === 204) {
        alert("Pedido excluído!");
        limparFormulario();
        listarPedidos();
      } else {
        alert("Erro ao excluir.");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  }
}

// Preenche o formulário ao clicar em "Selecionar" na tabela
function preencherFormulario(pedido) {
  document.getElementById("pedidoId").value = pedido.id;

  if (pedido.cliente) {
    document.getElementById("clienteSelect").value = pedido.cliente.id;
  }

  document.getElementById("dataEntrega").value = pedido.dataEntrega;
  document.getElementById("descricao").value = pedido.descricao;
  document.getElementById("statusPedido").value = pedido.status;

  // Marca o checkbox baseado no valor real do banco
  document.getElementById("isPago").checked = pedido.pago;

  // Formata o valor vindo do banco para exibir no input com máscara
  if (pedido.valorTotal) {
    const valorFormatado = pedido.valorTotal.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    document.getElementById("valorTotal").value = "R$ " + valorFormatado;
  } else {
    document.getElementById("valorTotal").value = "";
  }
}

function limparFormulario() {
  document.querySelector("form").reset();
  document.getElementById("pedidoId").value = "";
  document.getElementById("valorTotal").value = "";
}
