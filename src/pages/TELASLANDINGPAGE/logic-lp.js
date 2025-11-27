const API_BASE_URL = "http://localhost:8080";

// Estado global
let produtoSelecionadoId = null;
let quantidadeAtual = 1;
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    setupInterfaceGrafica(); // Substitui o seu script inline antigo
    verificarLoginHeader();
});

/* --- 1. CARREGAR PRODUTOS --- */
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos`);
        const produtos = await response.json();

        const gradeProdutos = document.querySelector(".grade");
        gradeProdutos.innerHTML = "";

        produtos.forEach(produto => {
            let imgUrl = "../../assets/img/logo var 4.png";
            if (produto.imagemUrl) {
                // Verifica se o link já começa com http (link externo)
                if (produto.imagemUrl.startsWith('http')) {
                    imgUrl = produto.imagemUrl;
                } else {
                    // Se não começar com http, assume que é uma imagem local do servidor
                    imgUrl = `${API_BASE_URL}${produto.imagemUrl}`;
                }
            }

            const card = document.createElement("div");
            card.classList.add("item");
            card.innerHTML = `
                <img src="${imgUrl}" alt="${produto.nome}">
                <p class="nome">${produto.nome}</p>
                <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
            `;
            card.addEventListener("click", () => abrirModalProduto(produto, imgUrl));
            gradeProdutos.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

/* --- 2. LÓGICA DE INTERFACE (MODAIS) --- */
// Esta função substitui o código que estava solto no seu HTML
function setupInterfaceGrafica() {
    // A. CONTROLES DO CARRINHO (ABRIR/FECHAR)
    const cartModal = document.getElementById("cart-modal");
    const btnCart = document.getElementById("btn-cart");
    const closeBtnCart = document.querySelector(".close-btn"); // Botão X do carrinho

    if (btnCart) {
        btnCart.addEventListener("click", () => {
            cartModal.style.display = "flex";
            // Opcional: carregar itens do carrinho aqui se quiser exibir a lista
        });
    }

    if (closeBtnCart) {
        closeBtnCart.addEventListener("click", () => {
            cartModal.style.display = "none";
        });
    }

    if (cartModal) {
        cartModal.addEventListener("click", e => {
            if (e.target === cartModal) cartModal.style.display = "none";
        });
    }

    // B. CONTROLES DO MODAL DE CONFIRMAÇÃO (CHECKOUT)
    const confirmOverlay = document.getElementById("confirmOverlay");
    const finalizeBtn = document.querySelector(".finalize-btn"); // Botão "Finalizar Pedido" no carrinho
    const closeConfirm = document.getElementById("closeConfirm");
    const cancelConfirm = document.getElementById("cancelConfirm");
    const confirmForm = document.getElementById("confirmForm");

    // Abrir modal de confirmação
    if (finalizeBtn) {
        finalizeBtn.addEventListener("click", () => {
            if (!usuarioLogado) {
                alert("Faça login para finalizar o pedido.");
                return;
            }
            confirmOverlay.style.display = "flex";
            // Opcional: Esconder o carrinho quando abrir a confirmação
            if (cartModal) cartModal.style.display = "none";
        });
    }

    // Função para fechar modal de confirmação
    const fecharConfirmacao = () => {
        if (confirmOverlay) confirmOverlay.style.display = "none";
    };

    if (closeConfirm) closeConfirm.addEventListener("click", fecharConfirmacao);
    if (cancelConfirm) cancelConfirm.addEventListener("click", fecharConfirmacao);
    if (confirmOverlay) {
        confirmOverlay.addEventListener("click", e => {
            if (e.target === confirmOverlay) fecharConfirmacao();
        });
    }

    // C. ENVIO DO FORMULÁRIO (INTEGRAÇÃO BACKEND)
    if (confirmForm) {
        confirmForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const dataEntrega = document.getElementById("confDate").value;

            // Nota: Os campos 'Nome' e 'Telefone' do form visual são ignorados 
            // pois o backend usa os dados do usuário logado e gera a mensagem oficial.

            if (!dataEntrega) {
                alert("Por favor, selecione uma data de entrega.");
                return;
            }

            await finalizarPedidoBackend(dataEntrega);
        });
    }
}

/* --- 3. LÓGICA DO PRODUTO (MODAL DE DETALHES) --- */
const modalProduto = document.getElementById('modalOverlay');
const quantitySpan = document.getElementById('quantity');

function abrirModalProduto(produto, imgUrl) {
    produtoSelecionadoId = produto.id;
    quantidadeAtual = 1;
    quantitySpan.textContent = "01";

    document.getElementById('modalImg').src = imgUrl;
    document.getElementById('modalTitle').textContent = produto.nome;
    document.getElementById('modalPrice').textContent = `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;
    document.getElementById('modalDesc').textContent = produto.descricao || "Delícia artesanal da Velvet Slice.";

    modalProduto.style.display = 'flex';
}

// Fechar modal de produto
document.getElementById('closeModal').onclick = () => modalProduto.style.display = 'none';
window.onclick = (e) => { if (e.target == modalProduto) modalProduto.style.display = 'none'; };

// Controles de quantidade
document.getElementById('increase').onclick = () => {
    quantidadeAtual++;
    quantitySpan.textContent = quantidadeAtual.toString().padStart(2, '0');
};
document.getElementById('decrease').onclick = () => {
    if (quantidadeAtual > 1) {
        quantidadeAtual--;
        quantitySpan.textContent = quantidadeAtual.toString().padStart(2, '0');
    }
};

// Adicionar ao carrinho
document.querySelector('.add-btn').onclick = async () => {
    if (!usuarioLogado || !usuarioLogado.clienteId) {
        alert("Faça login para comprar.");
        window.location.href = "../TELASLOGIN/Login.html";
        return;
    }
    await adicionarAoCarrinho(produtoSelecionadoId, quantidadeAtual);
    modalProduto.style.display = 'none';
};

/* --- 4. CHAMADAS DE API --- */

async function adicionarAoCarrinho(idProduto, qtd) {
    const payload = {
        clienteId: usuarioLogado.clienteId,
        produtoId: idProduto,
        quantidade: qtd
    };

    try {
        const response = await fetch(`${API_BASE_URL}/carrinho/adicionar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Adicionado ao carrinho!");
        } else {
            alert("Erro ao adicionar.");
        }
    } catch (error) {
        console.error(error);
    }
}

async function finalizarPedidoBackend(dataEntrega) {
    const url = `${API_BASE_URL}/pedidos/checkout?clienteId=${usuarioLogado.clienteId}&dataEntrega=${dataEntrega}`;

    try {
        const response = await fetch(url, { method: "POST" });
        const data = await response.json();

        if (response.ok && data.whatsappUrl) {
            // Sucesso: Abre o WhatsApp com a mensagem gerada pelo Java
            window.open(data.whatsappUrl, "_blank");
            document.getElementById("confirmOverlay").style.display = "none";
            setTimeout(() => location.reload(), 1000); // Recarrega para limpar status
        } else {
            alert("Atenção: " + (data.message || "Erro ao finalizar pedido. Verifique a data (mínimo 5 dias)."));
        }
    } catch (error) {
        console.error("Erro checkout:", error);
        alert("Erro de conexão.");
    }
}

function verificarLoginHeader() {
    if (usuarioLogado) {
        const loginBtn = document.querySelector('.login-btn a');
        if (loginBtn) {
            loginBtn.textContent = `Olá, ${usuarioLogado.nome.split(' ')[0]}`;
            loginBtn.href = "#";
        }
    }
}