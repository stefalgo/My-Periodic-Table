function drawLineChart({ canvasID, data, labelFormat = null, showLables = true}) {
    const canvas = document.getElementById(canvasID), ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height, pad = showLables && 30 || 0, cW = w - pad * 2, cH = h - pad * 2;
    const maxV = Math.max(...data.map(d => d.value)), minV = Math.min(...data.map(d => d.value));
    const spacing = cW / (data.length - 1);

    function getCoords(d, i, p = 1) {
        const x = pad + i * spacing;
        const yTarget = h - pad - ((d.value - minV) / (maxV - minV)) * cH;
        const y = h - pad - (h - pad - yTarget) * p;
        return { x, y };
    }

    let start = null;
    function animate(ts) {
        if (!start) start = ts;
        const dur = 1000, elapsed = ts - start;
        const t = Math.min(elapsed / dur, 1);
        const progress = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = "#374151"; ctx.fillStyle = "#e5e7eb";
        ctx.font = "12px sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
        for (let i = 0; i <= 5; i++) {
            const val = minV + (maxV - minV) * i / 5;
            const y = h - pad - cH * i / 5;
            ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
            ctx.fillText(Math.round(val), pad - 10, y);
        }

        ctx.textAlign = "center"; ctx.textBaseline = "top";
        data.forEach((d, i) => ctx.fillText(d.xLabel, pad + i * spacing, h - pad + 8));

        const grad = ctx.createLinearGradient(0, pad, 0, h - pad);
        grad.addColorStop(0, "hsl(211.7, 96.4%, 78.4%, 0.5)");
        grad.addColorStop(1, "hsl(211.7, 96.4%, 78.4%, 0.05)");

        ctx.globalAlpha = progress;
        ctx.beginPath();
        data.forEach((d, i) => {
            const { x, y } = getCoords(d, i, progress);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.lineTo(pad + (data.length - 1) * spacing, h - pad);
        ctx.lineTo(pad, h - pad);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        data.forEach((d, i) => {
            const { x, y } = getCoords(d, i, progress);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = "hsl(211.7, 96.4%, 78.4%)";
        ctx.lineWidth = 2;
        ctx.stroke();

        data.forEach((d, i) => {
            const { x, y } = getCoords(d, i, progress);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "hsl(211.7, 96.4%, 78.4%)";
            ctx.fill();

            if (labelFormat !== "") {
                ctx.fillStyle = "#e5e7eb";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                const label = labelFormat === null ? d.value : labelFormat.replace("{x}", d.value);
                ctx.fillText(label, x, y - 8);
            }
        });

        ctx.globalAlpha = 1;
        if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}