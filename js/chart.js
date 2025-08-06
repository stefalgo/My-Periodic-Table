export function drawLineChartSVG({ svgID, data, labelFormat = "{label}: {value}", showLabels = true, showDots = true, duration = 1000 }) {
    const svg = document.getElementById(svgID), NS = "http://www.w3.org/2000/svg";
    const w = svg.clientWidth, h = svg.clientHeight, pad = showLabels ? 30 : 0,
        cW = w - pad * 2, cH = h - pad * 2,
        maxV = Math.max(...data.map(d => d.value)),
        minV = Math.min(...data.map(d => d.value)),
        spacing = cW / (data.length - 1);

    const makeEl = (tag, attrs) => {
        const el = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        return el;
    };

    svg.innerHTML = "";
    const gradID = `grad-${svgID}`;
    svg.innerHTML = `<defs><linearGradient id="${gradID}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="hsl(211.7,96.4%,78.4%)" stop-opacity="0.5" />
                <stop offset="100%" stop-color="hsl(211.7,96.4%,78.4%)" stop-opacity="0.05" />
            </linearGradient></defs>`;

    for (let i = 0; i <= 5; i++) {
        const y = h - pad - cH * i / 5, val = minV + (maxV - minV) * i / 5;
        svg.appendChild(makeEl("line", { x1: pad, x2: w - pad, y1: y, y2: y, stroke: "#374151" }));
        if (showLabels) svg.appendChild(makeEl("text", { x: pad - 10, y, fill: "#e5e7eb", "text-anchor": "end", "dominant-baseline": "middle", "font-size": 12 })).append(val.toFixed(0));
    }

    if (showLabels) {
        const maxLabels = 8;
        const step = Math.ceil(data.length / maxLabels);
        data.forEach((d, i) => {
            if (i % step === 0 || i === data.length - 1) {
                svg.appendChild(makeEl("text", {
                    x: pad + i * spacing,
                    y: h - pad + 12,
                    fill: "#e5e7eb",
                    "text-anchor": "middle",
                    "font-size": 12
                })).append(d.xLabel);
            }
        });
    }

    const path = svg.appendChild(makeEl("path", { fill: "none", stroke: "hsl(211.7,96.4%,78.4%)", "stroke-width": 2 }));
    const area = svg.appendChild(makeEl("path", { fill: `url(#${gradID})` }));

    const getCoords = (d, i, p = 1) => ({ x: pad + i * spacing, y: h - pad - ((d.value - minV) / (maxV - minV)) * cH * p });
    let coords = [], start = null;

    function animate(ts) {
        if (!start) start = ts;
        const t = Math.min((ts - start) / duration, 1), p = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        coords = data.map((d, i) => getCoords(d, i, p));

        path.setAttribute("d", coords.map((c, i) => `${i ? "L" : "M"}${c.x},${c.y}`).join(" "));
        area.setAttribute("d", `${path.getAttribute("d")} L${coords.at(-1).x},${h - pad} L${coords[0].x},${h - pad}Z`);

        if (showDots) {
            svg.querySelectorAll("circle.point").forEach(c => c.remove());
            coords.forEach((c) => svg.appendChild(makeEl("circle", { cx: c.x, cy: c.y, r: 4, fill: "hsl(211.7,96.4%,78.4%)", class: "point" })));
        } else {
            svg.querySelectorAll("circle.point").forEach(c => c.remove());
        }

        if (p < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    const guideLine = svg.appendChild(makeEl("line", {
        stroke: "#9ca3af", "stroke-dasharray": "2", y1: pad, y2: h - pad, visibility: "hidden"
    }));

    const hoverDot = svg.appendChild(makeEl("circle", {
        r: 5, fill: "#9ca3af", stroke: "#fff", "stroke-width": 2, visibility: "hidden"
    }));

    const tooltipGroup = svg.appendChild(makeEl("g", { visibility: "hidden" }));
    const tooltipBg = tooltipGroup.appendChild(makeEl("rect", {
        fill: "rgba(17,24,39,0.9)", rx: 4, ry: 4, height: 20
    }));
    const tooltipText = tooltipGroup.appendChild(makeEl("text", {
        x: 0, y: 14, fill: "#e5e7eb", "font-size": 12
    }));

    svg.addEventListener("mousemove", e => {
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        let nearestIndex = 0, nearestDist = Infinity;

        coords.forEach((c, i) => {
            const dist = Math.abs(c.x - mouseX);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestIndex = i;
            }
        });

        const point = coords[nearestIndex];
        if (point) {
            guideLine.setAttribute("x1", point.x);
            guideLine.setAttribute("x2", point.x);
            guideLine.setAttribute("visibility", "visible");

            hoverDot.setAttribute("cx", point.x);
            hoverDot.setAttribute("cy", point.y);
            hoverDot.setAttribute("visibility", "visible");

            const textValue = labelFormat.replace("{label}", data[nearestIndex].xLabel).replace("{value}", data[nearestIndex].value.toFixed(2));
            tooltipText.textContent = textValue;

            const textWidth = tooltipText.getBBox().width;
            tooltipBg.setAttribute("width", textWidth + 8);
            tooltipBg.setAttribute("x", -4);

            let tooltipX = point.x + 8;
            const tooltipY = point.y - 30;

            if (tooltipX + textWidth + 10 > w) {
                tooltipX = point.x - textWidth - 12;
            }

            tooltipGroup.setAttribute("transform", `translate(${tooltipX}, ${tooltipY})`);
            tooltipGroup.setAttribute("visibility", "visible");
        }
    });

    svg.addEventListener("mouseleave", () => {
        guideLine.setAttribute("visibility", "hidden");
        hoverDot.setAttribute("visibility", "hidden");
        tooltipGroup.setAttribute("visibility", "hidden");
    });
}