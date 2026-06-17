// ==============================================================================
// chart.js — Gráficos do Dashboard (Canvas API, sem dependências)
// Projeto de Credenciamento GRU — JSL S/A
//
// Variáveis globais injetadas pelo Python no index.html:
//   window.CHART_LABELS  → datas da evolução diária
//   window.CHART_VALUES  → completos por dia
//   window.CHART_TOTAL   → total de colaboradores
//   window.GRUPOS_LABELS → nomes dos grupos (A, B, C, D)
//   window.GRUPOS_VALUES → pendências por grupo
// ==============================================================================

// ── Gráfico de linha — Evolução diária ────────────────────────────────────────
(function () {
  const labels = window.CHART_LABELS || [];
  const values = window.CHART_VALUES || [];
  const total  = window.CHART_TOTAL  || 698;

  const canvas = document.getElementById('chart-evolucao');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W   = canvas.offsetWidth  || 700;
  const H   = canvas.offsetHeight || 240;
  canvas.width  = W;
  canvas.height = H;

  const PAD  = { top: 20, right: 20, bottom: 40, left: 52 };
  const cW   = W - PAD.left - PAD.right;
  const cH   = H - PAD.top  - PAD.bottom;
  const maxV = Math.max(...values, total);
  const n    = labels.length;

  // Fallback
  if (n < 2) {
    ctx.fillStyle = '#6B7280';
    ctx.textAlign = 'center';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Dados insuficientes para exibir evolução', W / 2, H / 2);
    return;
  }

  // Grade e eixo Y
  ctx.strokeStyle = '#E2E5EA';
  ctx.lineWidth   = 1;
  ctx.fillStyle   = '#6B7280';
  ctx.font        = '11px Inter, sans-serif';
  ctx.textAlign   = 'right';

  for (let i = 0; i <= 5; i++) {
    const v = Math.round(maxV / 5 * i);
    const y = PAD.top + cH - (v / maxV * cH);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + cW, y);
    ctx.stroke();
    ctx.fillText(v, PAD.left - 6, y + 4);
  }

  // Eixo X
  ctx.textAlign   = 'center';
  const labelStep = Math.max(1, Math.floor(n / 8));
  labels.forEach((lbl, i) => {
    if (i % labelStep !== 0 && i !== n - 1) return;
    const x = PAD.left + i / (n - 1) * cW;
    ctx.fillText(lbl, x, H - PAD.bottom + 18);
  });

  // Área preenchida
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = PAD.left + i / (n - 1) * cW;
    const y = PAD.top  + cH - (v / maxV * cH);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(PAD.left + cW, PAD.top + cH);
  ctx.lineTo(PAD.left,      PAD.top + cH);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
  grad.addColorStop(0, 'rgba(45,106,79,.4)');
  grad.addColorStop(1, 'rgba(45,106,79,.02)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Linha
  ctx.beginPath();
  ctx.strokeStyle = '#2D6A4F';
  ctx.lineWidth   = 2.5;
  ctx.lineJoin    = 'round';
  values.forEach((v, i) => {
    const x = PAD.left + i / (n - 1) * cW;
    const y = PAD.top  + cH - (v / maxV * cH);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Ponto final
  const xF = PAD.left + cW;
  const yF = PAD.top  + cH - (values[n - 1] / maxV * cH);
  ctx.beginPath();
  ctx.arc(xF, yF, 5, 0, Math.PI * 2);
  ctx.fillStyle   = '#2D6A4F';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 2;
  ctx.stroke();
})();


// ── Gráfico de pizza — Pendências por grupo ────────────────────────────────────
(function () {
  const labels = window.GRUPOS_LABELS || [];
  const values = window.GRUPOS_VALUES || [];

  const canvas = document.getElementById('chart-pizza');
  if (!canvas || !values.length) return;
  const ctx = canvas.getContext('2d');
  const W   = canvas.offsetWidth  || 300;
  const H   = canvas.offsetHeight || 240;
  canvas.width  = W;
  canvas.height = H;

  const CORES = ['#E30613', '#1A3A5C', '#B5720A', '#2D6A4F', '#7FA8D1', '#6B7280'];

  const total   = values.reduce((a, b) => a + b, 0);
  if (total === 0) {
    ctx.fillStyle = '#6B7280';
    ctx.textAlign = 'center';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Sem pendências registradas', W / 2, H / 2);
    return;
  }

  // Dimensões — legenda com mais espaço (32px/linha) e gráfico maior
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

    // Fatia
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, raio, angulo, angulo + fatia);
    ctx.closePath();
    ctx.fillStyle = cor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Percentual dentro da fatia (só se > 5%)
    const pct = v / total * 100;
    if (pct > 5) {
      const mid = angulo + fatia / 2;
      const tx  = cx + Math.cos(mid) * (raio * 0.72);
      const ty  = cy + Math.sin(mid) * (raio * 0.72);
      ctx.fillStyle = '#fff';
      ctx.font      = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pct.toFixed(0) + '%', tx, ty + 4);
    }

    angulo += fatia;
  });

  // Buraco do donut
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

  // Legenda embaixo — quadrado centralizado com o texto
  const startY = chartH + 12;
  labels.forEach((lbl, i) => {
    const cor  = CORES[i % CORES.length];
    const y    = startY + i * 32;
    const midY = y + 10;  // centro vertical da linha

    // Quadrado colorido centralizado verticalmente
    ctx.fillStyle = cor;
    ctx.fillRect(0, midY - 7, 14, 14);

    // Texto alinhado ao centro vertical do quadrado
    ctx.fillStyle = '#1A1D23';
    ctx.font      = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Grupo ${lbl}  —  ${values[i]} pendentes`, 22, midY + 5);
  });
})();