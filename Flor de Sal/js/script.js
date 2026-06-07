document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const aberto = nav.classList.toggle("show");
      toggle.setAttribute("aria-expanded", String(aberto));
    });
  }

  const contatoForm = document.getElementById("contactForm");
  if (contatoForm) {
    contatoForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = document.getElementById("contactStatus");
      if (status) status.textContent = "Mensagem enviada. Retornaremos em breve.";
      contatoForm.reset();
    });
  }

  configurarFiltrosCardapio();
  configurarReserva();
  configurarAnimacoes();
  configurarModalProduto();
});

function configurarModalProduto(){
  const modalId = 'productModal';
  // criar modal com DOM puro, sem innerHTML
  if(!document.getElementById(modalId)){
    const modal = document.createElement('div');
    modal.className = 'modal product-modal';
    modal.id = modalId;
    modal.setAttribute('aria-hidden','true');
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-labelledby','productTitle');

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const btnClose = document.createElement('button');
    btnClose.className = 'modal-close';
    btnClose.id = 'productClose';
    btnClose.type = 'button';
    btnClose.setAttribute('aria-label','Fechar');
    btnClose.textContent = '×';

    const h3 = document.createElement('h3');
    h3.id = 'productTitle';

    const pPrice = document.createElement('p');
    pPrice.id = 'productPrice';
    pPrice.className = 'price';
    pPrice.style.marginTop = '6px';

    const tagsDiv = document.createElement('div');
    tagsDiv.id = 'productTags';
    tagsDiv.style.margin = '10px 0';

    const pDesc = document.createElement('p');
    pDesc.id = 'productDescription';

    const h4 = document.createElement('h4');
    h4.textContent = 'Tabela nutricional';

    const table = document.createElement('table');
    table.id = 'productNutrition';
    table.className = 'nutrition-table';
    table.setAttribute('aria-label','Tabela nutricional');

    modalContent.appendChild(btnClose);
    modalContent.appendChild(h3);
    modalContent.appendChild(pPrice);
    modalContent.appendChild(tagsDiv);
    modalContent.appendChild(pDesc);
    modalContent.appendChild(h4);
    modalContent.appendChild(table);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }

  const modal = document.getElementById('productModal');
  const closeBtn = document.getElementById('productClose');

  function abrirProduto(item){
    if(!modal) return;
    const title = item.querySelector('.menu-meta h4')?.textContent || 'Produto';
    const price = item.querySelector('.price')?.textContent || (item.dataset.price ? `R$ ${item.dataset.price}` : '');
    const desc = item.dataset.description || item.querySelector('p')?.textContent || '';
    const tags = (item.dataset.tags||'').split(' ').filter(Boolean);
    const nutritionRaw = item.dataset.nutrition || '';

    document.getElementById('productTitle').textContent = title;
    document.getElementById('productPrice').textContent = price;
    const tagsWrap = document.getElementById('productTags');
    tagsWrap.innerHTML = '';
    tags.forEach(t=>{
      const el = document.createElement('span');
      el.className = 'tag';
      el.textContent = t.replace(/-/g,' ');
      tagsWrap.appendChild(el);
    });
    document.getElementById('productDescription').textContent = desc;

    const table = document.getElementById('productNutrition');
    table.innerHTML = '';
    if(nutritionRaw){
      const rows = nutritionRaw.split('|');
      rows.forEach(r=>{
        const parts = r.split(':');
        if(parts.length===2){
          const tr = document.createElement('tr');
          const tdK = document.createElement('td');
          tdK.textContent = parts[0];
          const tdV = document.createElement('td');
          tdV.textContent = parts[1];
          tr.appendChild(tdK); tr.appendChild(tdV); table.appendChild(tr);
        }
      });
    } else {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.textContent = 'Informação não disponível';
      tr.appendChild(td); table.appendChild(tr);
    }

    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    prenderFoco(modal);
  }

  function fecharProduto(){
    if(!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
    liberarFoco();
  }

  // attach clicks
  document.querySelectorAll('.menu-item').forEach(it=>{
    it.style.cursor = 'pointer';
    it.addEventListener('click', (e)=>{
      // ignore clicks on buttons inside
      if(e.target.closest('button')) return;
      abrirProduto(it);
    });
  });

  if(closeBtn) closeBtn.addEventListener('click', fecharProduto);
  if(modal) modal.addEventListener('click', (e)=>{ if(e.target===modal) fecharProduto(); });

  // close with Esc
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      if(modal && modal.classList.contains('show')) fecharProduto();
    }
  });
}

// Implementação simples de "prender foco" no modal
let _previousFocus = null;
function prenderFoco(modal){
  _previousFocus = document.activeElement;
  const focusable = modal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
  if(focusable.length) focusable[0].focus();
  function handleTab(e){
    if(e.key !== 'Tab') return;
    const nodes = Array.from(focusable).filter(n => n.offsetParent !== null);
    if(!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
  modal.__handleTab = handleTab;
  document.addEventListener('keydown', handleTab);
}
function liberarFoco(){
  const modal = document.getElementById('productModal');
  if(modal && modal.__handleTab) document.removeEventListener('keydown', modal.__handleTab);
  if(_previousFocus) _previousFocus.focus();
  _previousFocus = null;
}

const NUMERO_WHATSAPP = "5511999999999";

function configurarFiltrosCardapio() {
  const botoesFiltro = document.querySelectorAll("[data-filter]");
  const itensMenu = document.querySelectorAll("[data-category]");

  if (!botoesFiltro.length || !itensMenu.length) return;

  botoesFiltro.forEach((botao) => {
    botao.addEventListener("click", () => {
      const filtro = botao.dataset.filter;

      botoesFiltro.forEach((b) => b.classList.remove("active"));
      botao.classList.add("active");

      itensMenu.forEach((item) => {
        const preco = Number(item.dataset.price || 0);
        const tags = item.dataset.tags || "";
        const isCategoria = item.dataset.category === filtro;
        const isTag = tags.split(" ").includes(filtro);
        const isFaixaPreco = (filtro === "ate-30" && preco <= 30) || (filtro === "acima-50" && preco > 50);
        const mostrar = filtro === "todos" || isCategoria || isTag || isFaixaPreco;

        item.classList.toggle("hidden", !mostrar);
      });
    });
  });
}

function configurarReserva() {
  const modal = document.getElementById("reserveModal");
  const closeButton = document.getElementById("modalClose");
  const botoesReserva = document.querySelectorAll(".reserve");
  const formReserva = document.getElementById("reserveForm");
  const inputData = document.getElementById("r-date");

  if (inputData) {
    inputData.min = new Date().toISOString().split("T")[0];
  }

  botoesReserva.forEach((botao) => {
    botao.addEventListener("click", () => {
      if (!modal) {
        window.location.href = "reservas.html";
        return;
      }
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      document.getElementById("r-name")?.focus();
    });
  });

  const fecharModal = () => {
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  };

  if (closeButton) closeButton.addEventListener("click", fecharModal);
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) fecharModal();
    });
  }

  if (formReserva) {
    formReserva.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(formReserva);
      const mensagemValidacao = validarReserva(data);
      const status = document.getElementById("reserveStatus");

      if (mensagemValidacao) {
        if (status) status.textContent = mensagemValidacao;
        return;
      }

      const pessoas = data.get("people");
      const date = data.get("date");
      const time = data.get("time");
      if (status) status.textContent = `Reserva pronta para envio no WhatsApp: ${pessoas} pessoa(s), em ${formatarData(date)} às ${time}.`;
      window.open(montarUrlWhatsApp(data), "_blank", "noopener");
      formReserva.reset();
      if (inputData) inputData.min = new Date().toISOString().split("T")[0];
      setTimeout(fecharModal, 900);
    });
  }
}

function montarUrlWhatsApp(data) {
  const name = data.get("name") || "Cliente";
  const phone = data.get("phone") || "";
  const email = data.get("email") || "";
  const people = data.get("people");
  const date = formatarData(data.get("date"));
  const time = data.get("time");
  const note = data.get("note") || "Sem observações";
  const message = [
    "Olá, Flor de Sal! Gostaria de fazer uma reserva.",
    "",
    `Nome: ${name}`,
    `Telefone: ${phone}`,
    email ? `E-mail: ${email}` : "",
    `Data: ${date}`,
    `Horário: ${time}`,
    `Pessoas: ${people}`,
    `Observações: ${note}`
  ].filter(Boolean).join("\n");

  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function configurarAnimacoes() {
  const elements = document.querySelectorAll(".section, .menu-item, .info-card, .stat, .testimonial, .real-photo");
  if (!elements.length) return;

  elements.forEach((element) => element.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  elements.forEach((element) => observer.observe(element));
}

function validarReserva(data) {
  const date = data.get("date");
  const time = data.get("time");
  const people = Number(data.get("people"));

  if (!date) return "Escolha uma data para a reserva.";
  if (!time) return "Escolha um horário para a reserva.";
  if (!Number.isInteger(people) || people < 1 || people > 12) return "Informe uma quantidade entre 1 e 12 pessoas.";

  const selectedDate = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) return "A data da reserva não pode estar no passado.";

  const day = selectedDate.getDay();
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute;
  const opens = 12 * 60;
  const closes = day === 0 ? 17 * 60 : 23 * 60;

  if (day === 1) return "O Flor de Sal não abre às segundas-feiras.";
  if (totalMinutes < opens || totalMinutes > closes) return "Escolha um horário dentro do funcionamento da casa.";

  return "";
}

function formatarData(value) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
