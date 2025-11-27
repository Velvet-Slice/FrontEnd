const API_BASE_URL = "http://localhost:8080";


let produtoSelecionadoId = null;
let quantidadeAtual = 1;
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));


document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    setupInterfaceGrafica();
    verificarLoginHeader();
    
    if (usuarioLogado && usuarioLogado.clienteId) {
        carregarItensCarrinho();
    }
});

async function carregarProdutos() {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos`);
        const produtos = await response.json();

        const gradeProdutos = document.querySelector(".grade");
        gradeProdutos.innerHTML = ""; 

        produtos.forEach(produto => {
            let imgUrl = "../../assets/img/logo var 4.png";
            if (produto.imagemUrl) {
                imgUrl = produto.imagemUrl.startsWith('http') 
                    ? produto.imagemUrl 
                    : `${API_BASE_URL}${produto.imagemUrl}`;
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
        const grade = document.querySelector(".grade");
        if(grade) grade.innerHTML = "<p>Erro ao carregar catálogo.</p>";
    }
}


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


async function abrirCarrinho() {
    const cartModal = document.getElementById("cart-modal");
    cartModal.style.display = "flex";
    
    if (usuarioLogado && usuarioLogado.clienteId) {
        await carregarItensCarrinho();
    } else {
        document.querySelector(".cart-items").innerHTML = "<p style='text-align:center; padding:20px;'>Faça login para ver seu carrinho.</p>";
        document.getElementById("subtotal-value").innerText = "R$ 0,00";
        atualizarContadorIcone(null);
    }
}

async function carregarItensCarrinho() {
    try {
        const response = await fetch(`${API_BASE_URL}/carrinho/ver?clienteId=${usuarioLogado.clienteId}`);
        
        if (response.status === 404 || response.status === 500) {
             renderizarItensCarrinho({ itens: [], valorTotal: 0 });
             return;
        }

        const pedido = await response.json();
        renderizarItensCarrinho(pedido);
        
    } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
    }
}

function renderizarItensCarrinho(pedido) {
    atualizarContadorIcone(pedido);

    const container = document.querySelector(".cart-items");
    if (!container) return; 
    
    container.innerHTML = ""; 

    if (!pedido.itens || pedido.itens.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px; color: #A65110;'>Seu carrinho está vazio.</p>";
        document.getElementById("subtotal-value").innerText = "R$ 0,00";
        return;
    }

    document.getElementById("subtotal-value").innerText = `R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}`;

    pedido.itens.forEach(item => {
        let imgUrl = "../../assets/img/logo var 4.png";
        if (item.produto.imagemUrl) {
            imgUrl = item.produto.imagemUrl.startsWith('http') 
                ? item.produto.imagemUrl 
                : `${API_BASE_URL}${item.produto.imagemUrl}`;
        }

        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");

        itemDiv.innerHTML = `
            <img src="${imgUrl}" alt="${item.produto.nome}" style="width: 70px; height: 70px; border-radius: 10px; object-fit: cover; margin-right: 15px;">
            <div class="item-info">
                <div class="item-title-line">
                    <h3>${item.produto.nome}</h3>
                    <button class="remove-item" onclick="removerItemCarrinho(${item.id})">×</button>
                </div>
                <p>Unitário: R$ ${item.precoUnitario.toFixed(2).replace('.', ',')}</p>
                <div class="item-bottom">
                    <div class="qty-box">
                        <button onclick="alterarQuantidade(${item.id}, ${item.quantidade - 1})">−</button>
                        <span>${item.quantidade.toString().padStart(2, '0')}</span>
                        <button onclick="alterarQuantidade(${item.id}, ${item.quantidade + 1})">+</button>
                    </div>
                    <span class="price">R$ ${item.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
        `;
        container.appendChild(itemDiv);
    });
}

function atualizarContadorIcone(pedido) {
    const badge = document.getElementById("cart-count");
    if (!badge) return;

    let qtdItensDistintos = 0;
    if (pedido && pedido.itens) {
        qtdItensDistintos = pedido.itens.length;
    }

    badge.innerText = qtdItensDistintos;
    badge.style.display = qtdItensDistintos > 0 ? "block" : "none";
}

window.alterarQuantidade = async (idItem, novaQuantidade) => {
    if (novaQuantidade <= 0) {
        removerItemCarrinho(idItem);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/carrinho/item/${idItem}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade: novaQuantidade })
        });

        if (response.ok) {
            carregarItensCarrinho(); 
        }
    } catch (error) {
        console.error("Erro update qtd:", error);
        exibirToast("Erro ao atualizar quantidade.", "error");
    }
};

window.removerItemCarrinho = async (idItem) => {
    try {
        const response = await fetch(`${API_BASE_URL}/carrinho/item/${idItem}`, {
            method: "DELETE"
        });

        if (response.ok) {
            carregarItensCarrinho();
            exibirToast("Item removido.", "info");
        }
    } catch (error) {
        console.error("Erro delete item:", error);
        exibirToast("Erro ao remover item.", "error");
    }
};



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
            exibirToast("Item adicionado ao carrinho!", "success");
            carregarItensCarrinho(); 
        } else {
            const text = await response.text();
            exibirToast("Erro ao adicionar: " + text, "error");
        }
    } catch (error) {
        console.error(error);
        exibirToast("Erro de conexão.", "error");
    }
}

async function finalizarPedidoBackend(dataEntrega) {
    const url = `${API_BASE_URL}/pedidos/checkout?clienteId=${usuarioLogado.clienteId}&dataEntrega=${dataEntrega}`;

    try {
        const response = await fetch(url, { method: "POST" });
        const data = await response.json();

        if (response.ok && data.whatsappUrl) {
            document.getElementById("confirmOverlay").style.display = "none";
            
            exibirToast("Pedido gerado! Redirecionando...", "success");
            
            setTimeout(() => {
             
                window.open(data.whatsappUrl, "_blank");
              
                location.reload();
            }, 1500);
        } else {
       
            exibirToast(data.message || "Verifique a data (mínimo 5 dias).", "error");
        }
    } catch (error) {
        console.error("Erro checkout:", error);
        exibirToast("Erro ao processar pedido.", "error");
    }
}


function setupInterfaceGrafica() {
    document.getElementById('closeModal').onclick = () => modalProduto.style.display = 'none';
    
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

    const btnAdicionar = document.querySelector('.add-btn');
    if(btnAdicionar) {
        btnAdicionar.onclick = async () => {
            if (!usuarioLogado || !usuarioLogado.clienteId) {
                exibirToast("Faça login para comprar.", "info");
                setTimeout(() => window.location.href = "../TELASLOGIN/Login.html", 1500);
                return;
            }
            await adicionarAoCarrinho(produtoSelecionadoId, quantidadeAtual);
            modalProduto.style.display = 'none';
        };
    }

    const cartModal = document.getElementById("cart-modal");
    const btnCart = document.getElementById("btn-cart");
    const closeBtnCart = document.querySelector(".close-btn");

    if (btnCart) {
        btnCart.addEventListener("click", () => {
            abrirCarrinho();
        });
    }

    if (closeBtnCart) {
        closeBtnCart.addEventListener("click", () => {
            cartModal.style.display = "none";
        });
    }

    const confirmOverlay = document.getElementById("confirmOverlay");
    const finalizeBtn = document.querySelector(".finalize-btn");
    const closeConfirm = document.getElementById("closeConfirm");
    const cancelConfirm = document.getElementById("cancelConfirm");
    const confirmForm = document.getElementById("confirmForm");

    
    if (finalizeBtn) {
        finalizeBtn.addEventListener("click", () => {
            if (!usuarioLogado) {
                exibirToast("Faça login para finalizar.", "info");
                return;
            }
            const totalTexto = document.getElementById("subtotal-value").innerText;
            if (totalTexto === "R$ 0,00") {
                exibirToast("Seu carrinho está vazio.", "error");
                return;
            }

            
            const hoje = new Date();
            hoje.setDate(hoje.getDate() + 5);
            
           
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            const dataMinimaFormatada = `${ano}-${mes}-${dia}`;

            const inputData = document.getElementById("confDate");
            inputData.min = dataMinimaFormatada; 
            inputData.value = dataMinimaFormatada; 

           
            const inputNome = document.getElementById("confName");
            const inputTelefone = document.getElementById("confPhone");

            
            if (usuarioLogado.nome) {
                inputNome.value = usuarioLogado.nome;
            }
            
        
            if (usuarioLogado.telefone) {
                inputTelefone.value = usuarioLogado.telefone;
            }

            confirmOverlay.style.display = "flex";
            cartModal.style.display = "none"; 
        });
    }

    const fecharCheckout = () => confirmOverlay.style.display = "none";
    if (closeConfirm) closeConfirm.addEventListener("click", fecharCheckout);
    if (cancelConfirm) cancelConfirm.addEventListener("click", fecharCheckout);

    if (confirmForm) {
        confirmForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const dataEntrega = document.getElementById("confDate").value;
            
            if (!dataEntrega) {
                exibirToast("Selecione a data de entrega.", "error");
                return;
            }
        
            finalizarPedidoBackend(dataEntrega);
        });
    }

    window.onclick = (e) => {
        if (e.target == modalProduto) modalProduto.style.display = 'none';
        if (e.target == cartModal) cartModal.style.display = 'none';
        if (e.target == confirmOverlay) confirmOverlay.style.display = 'none';
    };
}

function verificarLoginHeader() {
    if (usuarioLogado) {
        const loginBtn = document.querySelector('.login-btn a');
        if(loginBtn) {
            loginBtn.textContent = `Olá, ${usuarioLogado.nome.split(' ')[0]}`;
            loginBtn.href = "#";
        }
    }
}

function exibirToast(mensagem, tipo = 'success') {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    let icone = '';
    if (tipo === 'success') icone = '✅';
    if (tipo === 'error') icone = '❌';
    if (tipo === 'info') icone = 'ℹ️';

    toast.innerHTML = `<span>${icone} ${mensagem}</span>`;

    container.appendChild(toast);

    void toast.offsetWidth; 
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => {
            if(container.contains(toast)) {
                toast.remove();
            }
        }, 400); 
    }, 1500); 
}