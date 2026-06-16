// ==============================================================================
// chart.js — Gráfico de Evolução Diária (Canvas API, sem dependências)
// Projeto de Credenciamento GRU — JSL S/A
//
// Os dados (labels e values) são injetados pelo Python no index.html
// como variáveis globais antes deste script ser carregado:
//
//   window.CHART_LABELS = ["01/06", "02/06", ...]
//   window.CHART_VALUES = [120, 145, ...]
//   window.CHART_TOTAL  = 698
// ==============================================================================

(function () {

  // ── Dados injetados pelo Python via index.html ─────────────────────────────
  const labels = window.CHART_LABELS || [];
  const values = window.CHART_VALUES || [];
  const total  = window.CHART_TOTAL  || 698;

  // ── Configuração do canvas ─────────────────────────────────────────────────
  const canvas = document.getElementById('chart-evolucao');
  const ctx    = canvas.getContext('2d');
  const W      = canvas.offsetWidth  || 800;
  const H      = canvas.offsetHeight || 200;
  canvas.width  = W;
  canvas.height = H;

  // Margens internas do gráfico
  const PAD = { top: 16, right: 24, bottom: 36, left: 48 };
  const cW  = W - PAD.left - PAD.right;   // largura útil
  const cH  = H - PAD.top  - PAD.bottom;  // altura útil
  const maxV = Math.max(...values, total);
  const n    = labels.length;

  // ── Fallback para dados insuficientes ─────────────────────────────────────
  if (n < 2) {
    ctx.fillStyle = '#6B7280';
    ctx.textAlign = 'center';
    ctx.font      = '13px Inter, sans-serif';
    ctx.fillText('Dados insuficientes para exibir evolução', W / 2, H / 2);
    return;
  }

  // ── Grade horizontal e eixo Y ─────────────────────────────────────────────
  ctx.strokeStyle = '#E2E5EA';
  ctx.lineWidth   = 1;
  ctx.fillStyle   = '#6B7280';
  ctx.font        = '11px Inter, sans-serif';
  ctx.textAlign   = 'right';

  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const v = Math.round(maxV / gridSteps * i);
    const y = PAD.top + cH - (v / maxV * cH);

    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + cW, y);
    ctx.stroke();

    ctx.fillText(v, PAD.left - 6, y + 4);
  }

  // ── Eixo X — máximo de 10 labels para não sobrepor ────────────────────────
  ctx.textAlign   = 'center';
  const labelStep = Math.max(1, Math.floor(n / 10));

  labels.forEach((lbl, i) => {
    if (i % labelStep !== 0 && i !== n - 1) return;
    const x = PAD.left + i / (n - 1) * cW;
    ctx.fillText(lbl, x, H - PAD.bottom + 18);
  });

  // ── Área preenchida sob a linha ────────────────────────────────────────────
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = PAD.left + i / (n - 1) * cW;
    const y = PAD.top  + cH - (v / maxV * cH);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(PAD.left + cW, PAD.top + cH);
  ctx.lineTo(PAD.left,      PAD.top + cH);
  ctx.closePath();

  const gradiente = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
  gradiente.addColorStop(0, 'rgba(45,106,79,.35)');
  gradiente.addColorStop(1, 'rgba(45,106,79,.02)');
  ctx.fillStyle = gradiente;
  ctx.fill();

  // ── Linha principal ────────────────────────────────────────────────────────
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

  // ── Ponto final destacado ──────────────────────────────────────────────────
  const xFinal = PAD.left + cW;
  const yFinal = PAD.top  + cH - (values[n - 1] / maxV * cH);

  ctx.beginPath();
  ctx.arc(xFinal, yFinal, 5, 0, Math.PI * 2);
  ctx.fillStyle   = '#2D6A4F';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 2;
  ctx.stroke();

})();
