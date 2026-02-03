function createSVG(width, height) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.maxWidth = "100%";
  svg.style.display = "block";
  return svg;
}

// 1) Bar chart
(function barChart() {
  const mount = document.getElementById("chartArea");
  if (!mount) return;

  mount.innerHTML = "";
  mount.style.position = "relative"; // for tooltip positioning

  let data = [
    { label: "Music 🎵", value: 20 ,color: "#111111"},
    { label: "Art 🎨", value: 25, color: "#111111"  },
    { label: "School 🏫", value: 35, color: "#dc2626"  },
    { label: "Sleep 🛏️", value: 15, color: "#111111"  },
    { label: "Shopping 🛍️", value: 5, color: "#111111"  },
  ];

  // sort descending
  data = data.slice().sort((a, b) => b.value - a.value);

  const W = 720, H = 260;
  const pad = 36;
  const chartH = H - pad * 2;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const maxV = Math.max(...data.map(d => d.value));

  const svg = createSVG(W, H);

  // tooltip element (HTML, reliable)
  const tip = document.createElement("div");
  tip.className = "tooltip";
  mount.appendChild(tip);

  function showTip(text, clientX, clientY) {
    tip.textContent = text;

    const box = mount.getBoundingClientRect();
    const x = clientX - box.left + 12;
    const y = clientY - box.top + 12;

    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
    tip.classList.add("show");
  }

  function moveTip(clientX, clientY) {
    const box = mount.getBoundingClientRect();
    tip.style.left = `${clientX - box.left + 12}px`;
    tip.style.top = `${clientY - box.top + 12}px`;
  }

  function hideTip() {
    tip.classList.remove("show");
  }

  // axis line
  const axis = document.createElementNS(svg.namespaceURI, "line");
  axis.setAttribute("x1", pad);
  axis.setAttribute("y1", H - pad);
  axis.setAttribute("x2", W - pad);
  axis.setAttribute("y2", H - pad);
  axis.setAttribute("stroke", "black");
  axis.setAttribute("stroke-width", "1");
  svg.appendChild(axis);

  const gap = 12;
  const barW = (W - pad * 2 - gap * (data.length - 1)) / data.length;

  data.forEach((d, i) => {
    const percent = total === 0 ? 0 : Math.round((d.value / total) * 100);

    const barH = (d.value / maxV) * chartH;
    const x = pad + i * (barW + gap);
    const y = H - pad - barH;

    // bar
    const rect = document.createElementNS(svg.namespaceURI, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barW);
    rect.setAttribute("height", barH);
    rect.setAttribute("fill", d.color);
    rect.dataset.baseColor = d.color; // 记住原本颜色（School 红 / 其他黑）
    rect.style.cursor = "pointer";

    // custom hover
    rect.addEventListener("mouseenter", (e) => {
        rect.setAttribute("fill", "#486de5ff");
  showTip(`${d.label}: ${percent}% of my life`, e.clientX, e.clientY);
});

rect.addEventListener("mousemove", (e) => {
  moveTip(e.clientX, e.clientY);
});

rect.addEventListener("mouseleave", () => {
  rect.setAttribute("fill", d.color); 
  hideTip();
});


    svg.appendChild(rect);

    // percentage text
    const pText = document.createElementNS(svg.namespaceURI, "text");
    pText.setAttribute("x", x + barW / 2);
    pText.setAttribute("y", y - 8);
    pText.setAttribute("text-anchor", "middle");
    pText.setAttribute("font-size", "12");
    pText.textContent = `${percent}%`;
    svg.appendChild(pText);

    // category label
    const label = document.createElementNS(svg.namespaceURI, "text");
    label.setAttribute("x", x + barW / 2);
    label.setAttribute("y", H - pad + 18);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "12");
    label.textContent = d.label;
    svg.appendChild(label);
  });

  mount.appendChild(svg);
})();


// 2) Donut chart: Preferred Learning Positions
(function learningPositions() {
  const mount = document.getElementById("artArea");
  if (!mount) return;

  mount.innerHTML = "";
  mount.style.position = "relative";

  const data = [
    { label: "Sitting", value: 60, color: "#3b82f6" },
    { label: "Lying down", value: 30, color: "#f59e0b" },
    { label: "Standing", value: 10, color: "#10b981" },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);

  const W = 720, H = 320;
  const svg = createSVG(W, H);

  // ---- helper: darken a hex color (keeps original hue) ----
  function darkenColor(hex, factor) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.floor(r * factor);
    g = Math.floor(g * factor);
    b = Math.floor(b * factor);

    return `rgb(${r}, ${g}, ${b})`;
  }

  // ---- tooltip ----
  const tip = document.createElement("div");
  tip.className = "tooltip";
  mount.appendChild(tip);

  function showTip(text, clientX, clientY) {
    tip.textContent = text;
    const box = mount.getBoundingClientRect();
    tip.style.left = `${clientX - box.left + 12}px`;
    tip.style.top = `${clientY - box.top + 12}px`;
    tip.classList.add("show");
  }

  function moveTip(clientX, clientY) {
    const box = mount.getBoundingClientRect();
    tip.style.left = `${clientX - box.left + 12}px`;
    tip.style.top = `${clientY - box.top + 12}px`;
  }

  function hideTip() {
    tip.classList.remove("show");
  }

  // ---- donut geometry ----
  const cx = 240, cy = 170;
  const outerR = 110;
  const innerR = 62;

  function polarToXY(cx, cy, r, angleDeg) {
    const a = (angleDeg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function arcPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
    const startOuter = polarToXY(cx, cy, rOuter, startAngle);
    const endOuter = polarToXY(cx, cy, rOuter, endAngle);
    const startInner = polarToXY(cx, cy, rInner, endAngle);
    const endInner = polarToXY(cx, cy, rInner, startAngle);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${rInner} ${rInner} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
      "Z",
    ].join(" ");
  }

  // ---- center labels ----
  const centerText = document.createElementNS(svg.namespaceURI, "text");
  centerText.setAttribute("x", cx);
  centerText.setAttribute("y", cy - 2);
  centerText.setAttribute("text-anchor", "middle");
  centerText.setAttribute("font-size", "14");
  centerText.setAttribute("fill", "rgba(31,31,29,0.75)");
  centerText.textContent = "Study";
  svg.appendChild(centerText);

  const centerText2 = document.createElementNS(svg.namespaceURI, "text");
  centerText2.setAttribute("x", cx);
  centerText2.setAttribute("y", cy + 18);
  centerText2.setAttribute("text-anchor", "middle");
  centerText2.setAttribute("font-size", "12");
  centerText2.setAttribute("fill", "rgba(31,31,29,0.55)");
  centerText2.textContent = "positions";
  svg.appendChild(centerText2);

  // ---- draw arcs + legend ----
  let angle = 0;

  const legendX = 420;
  const legendY = 90;
  const legendGap = 34;

  data.forEach((d, i) => {
    const percent = total === 0 ? 0 : Math.round((d.value / total) * 100);
    const sweep = total === 0 ? 0 : (d.value / total) * 360;

    const start = angle;
    const end = angle + sweep;

    // slice
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", arcPath(cx, cy, outerR, innerR, start, end));
    path.setAttribute("fill", d.color);
    path.setAttribute("stroke", "#fff");       // optional but makes slices clearer
    path.setAttribute("stroke-width", "2");    // optional
    path.style.cursor = "pointer";

    path.dataset.baseColor = d.color;

    path.addEventListener("mouseenter", (e) => {
      const base = path.dataset.baseColor;
      path.setAttribute("fill", darkenColor(base, 0.75)); // slightly darker
      showTip(`${d.label}: ${percent}%`, e.clientX, e.clientY);
    });

    path.addEventListener("mousemove", (e) => {
      moveTip(e.clientX, e.clientY);
    });

    path.addEventListener("mouseleave", () => {
      path.setAttribute("fill", path.dataset.baseColor);
      hideTip();
    });

    svg.appendChild(path);

    // legend (same color as slice)
    const dot = document.createElementNS(svg.namespaceURI, "rect");
    dot.setAttribute("x", legendX);
    dot.setAttribute("y", legendY + i * legendGap - 10);
    dot.setAttribute("width", 14);
    dot.setAttribute("height", 14);
    dot.setAttribute("rx", 4);
    dot.setAttribute("fill", d.color);
    svg.appendChild(dot);

    const lText = document.createElementNS(svg.namespaceURI, "text");
    lText.setAttribute("x", legendX + 22);
    lText.setAttribute("y", legendY + i * legendGap);
    lText.setAttribute("font-size", "14");
    lText.setAttribute("fill", "rgba(31,31,29,0.8)");
    lText.textContent = `${d.label} — ${percent}%`;
    svg.appendChild(lText);

    angle = end;
  });

  mount.appendChild(svg);
})();
