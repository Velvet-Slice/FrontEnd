const items = document.querySelectorAll('.item');
const modal = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');

const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const quantity = document.getElementById('quantity');

let qtd = 1;

items.forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img').src;
    const title = item.querySelector('.nome').innerText;
    const price = item.querySelector('.preco').innerText;

    modalImg.src = img;
    modalTitle.textContent = title;
    modalPrice.textContent = price;
    modalDesc.textContent = "Um bolo macio e úmido, coberto por uma camada generosa de caramelo cremoso e dourado. O sabor doce e suave do caramelo combina perfeitamente com a massa leve, criando uma sobremesa irresistível que agrada a todos"; // Ajustável
    

    qtd = 1;
    quantity.textContent = "01";

    modal.style.display = 'flex';
  });
});

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

document.getElementById('increase').addEventListener('click', () => {
  qtd++;
  quantity.textContent = qtd.toString().padStart(2, '0');
});

document.getElementById('decrease').addEventListener('click', () => {
  if (qtd > 1) qtd--;
  quantity.textContent = qtd.toString().padStart(2, '0');
});
