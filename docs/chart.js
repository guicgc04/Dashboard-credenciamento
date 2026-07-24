// ==============================================================================
// chart.js — Interatividade e Gráficos do Dashboard
// Projeto de Credenciamento GRU — JSL S/A
// ==============================================================================

// ── Estado global ──────────────────────────────────────────────────────────────
let colaboradorSelecionado = null;
const dados     = window.DADOS_COLABORADORES || {};
const topGlobal = window.TOP_DOCS_GLOBAL    || [];

// ── Inicialização ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  renderizarTabela(Object.values(dados));
  renderizarPizza(window.GRUPOS_LABELS, window.GRUPOS_VALUES);
  renderizarRankingGlobal();
});


// ==============================================================================
// TABELA DE COLABORADORES
// ==============================================================================

function renderizarTabela(lista) {
  const tbody = document.getElementById('tbody-colabs');
  tbody.innerHTML = '';

  lista.forEach(c => {
    const tr        = document.createElement('tr');
    const isPronto  = c.pendencias.length === 0;
    tr.className    = isPronto ? 'pronto' : 'pendente';
    tr.dataset.mat  = c.matricula;

    tr.innerHTML = `
      <td>${c.matricula}</td>
      <td><strong>${c.nome}</strong></td>
      <td>${c.cargo}</td>
      <td>
        <span class="status-badge ${isPronto ? 'pronto' : 'pendente'}">
          ${isPronto ? 'Pronto' : 'Pendente'}
        </span>
      </td>`;

    tr.addEventListener('click', () => selecionarColaborador(c.matricula, tr));
    tbody.appendChild(tr);
  });

  document.getElementById('badge-total').textContent = lista.length;
}


// ── Busca na tabela ────────────────────────────────────────────────────────────
function filtrarTabela() {
  const termo = document.getElementById('busca-colab').value.toLowerCase();
  const lista = Object.values(dados).filter(c =>
    c.nome.toLowerCase().includes(termo) ||
    c.matricula.toLowerCase().includes(termo)
  );
  renderizarTabela(lista);
}


// ==============================================================================
// SELEÇÃO DE COLABORADOR — filtra gráficos e mostra painel
// ==============================================================================

function selecionarColaborador(matricula, tr) {
  // Deseleciona se clicar no mesmo
  if (colaboradorSelecionado === matricula) {
    limparFiltro();
    return;
  }

  colaboradorSelecionado = matricula;

  // Marca linha selecionada
  document.querySelectorAll('#tbody-colabs tr').forEach(r => r.classList.remove('selecionado'));
  tr.classList.add('selecionado');

  // Mostra hint de filtro
  document.getElementById('filter-hint').style.display = 'inline';

  const c = dados[matricula];
  if (!c) return;

  // Atualiza painel de detalhe
  mostrarPainel(c);

  // Atualiza ranking para este colaborador
  atualizarRanking(c);
}


function limparFiltro() {
  colaboradorSelecionado = null;
  document.querySelectorAll('#tbody-colabs tr').forEach(r => r.classList.remove('selecionado'));
  document.getElementById('filter-hint').style.display = 'none';
  document.getElementById('painel-detalhe').style.display = 'none';
  document.getElementById('ranking-titulo').textContent = 'Documentos mais faltantes';
  renderizarRankingGlobal();
}


// ==============================================================================
// PAINEL DE DETALHE
// ==============================================================================

function mostrarPainel(c) {
  const painel    = document.getElementById('painel-detalhe');
  const titulo    = document.getElementById('painel-titulo');
  const conteudo  = document.getElementById('painel-conteudo');

  painel.style.display = 'block';
  titulo.textContent   = 'Detalhe do Colaborador';

  const totalDocs    = c.docs_obrigatorios.length;
  const coletados    = c.docs_coletados.length;
  const pct          = totalDocs > 0 ? Math.round(coletados / totalDocs * 100) : 100;
  const isPronto     = c.pendencias.length === 0;

  // Monta lista de docs
  let listaHTML = '<div class="doc-lista">';

  c.docs_coletados.forEach(doc => {
    listaHTML += `
      <div class="doc-item coletado">
        <span class="icone">&#10003;</span>
        <span class="doc-nome">${doc.replace(/_/g, ' ')}</span>
      </div>`;
  });

  c.pendencias.forEach(doc => {
    listaHTML += `
      <div class="doc-item faltante">
        <span class="icone">&#10005;</span>
        <span class="doc-nome">${doc.replace(/_/g, ' ')}</span>
      </div>`;
  });

  listaHTML += '</div>';

  conteudo.innerHTML = `
    <div class="detalhe-header">
      <div class="detalhe-nome">${c.nome}</div>
      <div class="detalhe-info">
        Mat. ${c.matricula} &bull; ${c.cargo} &bull; Grupo ${c.grupo}
      </div>
    </div>
    <div class="detalhe-progresso">
      <div class="detalhe-prog-label">
        ${coletados} de ${totalDocs} documentos coletados (${pct}%)
      </div>
      <div class="detalhe-prog-track">
        <div class="detalhe-prog-fill" style="width:${pct}%"></div>
      </div>
    </div>
    ${listaHTML}`;
}


// ==============================================================================
// RANKING
// ==============================================================================

function renderizarRankingGlobal() {
  document.getElementById('ranking-titulo').textContent = 'Documentos mais faltantes';
  const html = gerarRankingHTML(topGlobal);
  document.getElementById('ranking-conteudo').innerHTML = html;
}


function atualizarRanking(c) {
  document.getElementById('ranking-titulo').textContent =
    `Pendencias de ${c.nome.split(' ')[0]}`;

  if (c.pendencias.length === 0) {
    document.getElementById('ranking-conteudo').innerHTML =
      '<p style="color:var(--green);font-size:13px;padding:8px 0;">Documentacao completa!</p>';
    return;
  }

  // Para colaborador individual, todos os docs pendentes valem 1
  const lista = c.pendencias.map(doc => [doc, 1]);
  const html  = gerarRankingHTML(lista);
  document.getElementById('ranking-conteudo').innerHTML = html;
}


function gerarRankingHTML(lista) {
  if (!lista || lista.length === 0)
    return '<p style="color:var(--muted);font-size:13px;">Nenhuma pendencia.</p>';

  const maxQtd = Math.max(...lista.map(d => d[1]));
  let html = '';

  lista.forEach(([doc, qtd], i) => {
    const largura = Math.round(qtd / maxQtd * 100);
    const label   = doc.replace(/_/g, ' ');
    html += `
      <div class="rank-row">
        <span class="rank-pos">#${i + 1}</span>
        <span class="rank-label">${label}</span>
        <div class="rank-bar-wrap">
          <div class="rank-bar" style="width:${largura}%"></div>
        </div>
        <span class="rank-count">${qtd}</span>
      </div>`;
  });

  return html;
}


// ==============================================================================
// GRAFICO DE PIZZA — Pendencias por Grupo (Canvas API)
// ==============================================================================

(function () {
  const labels = window.GRUPOS_LABELS || [];
  const values = window.GRUPOS_VALUES || [];

  function renderizarPizza(labels, values) {
    const canvas = document.getElementById('chart-pizza');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W   = canvas.offsetWidth  || 300;
    const H   = canvas.offsetHeight || 300;
    canvas.width  = W;
    canvas.height = H;

    const CORES = ['#E30613','#1A3A5C','#B5720A','#2D6A4F','#7FA8D1','#6B7280'];
    const total = values.reduce((a, b) => a + b, 0);

    if (total === 0) {
      ctx.fillStyle = '#6B7280';
      ctx.textAlign = 'center';
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText('Sem pendencias', W / 2, H / 2);
      return;
    }

    const legendH    = 32 * labels.length;
    const chartH     = H - legendH - 20;
    const cx         = W / 2;
    const cy         = chartH / 2 + 8;
    const raio       = Math.min(cx, cy) - 8;
    const raioBuraco = raio * 0.48;

    let angulo = -Math.PI / 2;

    values.forEach((v, i) => {
      const fatia = (v / total) * 2 * Math.PI;
      const cor   = CORES[i % CORES.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, raio, angulo, angulo + fatia);
      ctx.closePath();
      ctx.fillStyle   = cor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 2;
      ctx.stroke();

      const pct = v / total * 100;
      if (pct > 5) {
        const mid = angulo + fatia / 2;
        ctx.fillStyle = '#fff';
        ctx.font      = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pct.toFixed(0) + '%',
          cx + Math.cos(mid) * raio * 0.72,
          cy + Math.sin(mid) * raio * 0.72 + 4);
      }

      angulo += fatia;
    });

    // Buraco
    ctx.beginPath();
    ctx.arc(cx, cy, raioBuraco, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Total no centro
    ctx.fillStyle = '#1A1D23';
    ctx.font      = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(total, cx, cy - 4);
    ctx.font      = '11px Inter, sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('pendentes', cx, cy + 14);

    // Legenda
    const startY = chartH + 12;
    labels.forEach((lbl, i) => {
      const cor  = CORES[i % CORES.length];
      const midY = startY + i * 32 + 10;
      ctx.fillStyle = cor;
      ctx.fillRect(0, midY - 7, 14, 14);
      ctx.fillStyle = '#1A1D23';
      ctx.font      = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Grupo ${lbl}  —  ${values[i]} pendentes`, 22, midY + 5);
    });
  }

  window.renderizarPizza = renderizarPizza;
  document.addEventListener('DOMContentLoaded', () => renderizarPizza(labels, values));
})();