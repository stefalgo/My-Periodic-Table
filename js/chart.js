function drawLineChart({ canvasId, data, labelFormat = null, delay = 0, duration = 1000 }) {
    const canvas = document.getElementById(canvasId), ctx = canvas.getContext("2d");

    const w = canvas.width, h = canvas.height, pad = 60, cW = w - pad * 2, cH = h - pad * 2;
    const maxV = Math.max(...data.map(d => d.value)), minV = Math.min(...data.map(d => d.value));
    const spacing = cW / (data.length - 1);

    const getCoords = (d, i, p = 1) => {
        const x = pad + i * spacing;
        const yT = h - pad - ((d.value - minV) / (maxV - minV)) * cH;
        return { x, y: h - pad - (h - pad - yT) * p };
    };

    let start = null;
    function animate(ts) {
        if (!start) start = ts;
        const t = Math.min((ts - start) / duration, 1);
        const prog = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = "#374151"; ctx.fillStyle = "#e5e7eb";
        ctx.font = "12px sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
        for (let i = 0; i <= 5; i++) {
            const val = minV + (maxV - minV) * i / 5, y = h - pad - cH * i / 5;
            ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
            ctx.fillText(Math.round(val), pad - 10, y);
        }

        ctx.textAlign = "center"; ctx.textBaseline = "top";
        data.forEach((d, i) => ctx.fillText(d.xLabel, pad + i * spacing, h - pad + 8));

        const grad = ctx.createLinearGradient(0, pad, 0, h - pad);
        grad.addColorStop(0, "hsl(211.7, 96.4%, 78.4%, 0.5)");
        grad.addColorStop(1, "hsl(211.7, 96.4%, 78.4%, 0.05)");

        ctx.globalAlpha = prog;
        ctx.beginPath();
        data.forEach((d, i) => {
            const { x, y } = getCoords(d, i, prog);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.lineTo(pad + (data.length - 1) * spacing, h - pad);
        ctx.lineTo(pad, h - pad);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        data.forEach((d, i) => {
            const { x, y } = getCoords(d, i, prog);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = "hsl(211.7, 96.4%, 78.4%)";
        ctx.lineWidth = 2;
        ctx.stroke();

        data.forEach((d, i) => {
            const { x, y } = getCoords(d, i, prog);
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "hsl(211.7, 96.4%, 78.4%)"; ctx.fill();

            if (labelFormat !== "") {
                ctx.fillStyle = "#e5e7eb"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
                const label = labelFormat === null ? d.value : labelFormat.replace("{x}", d.value);
                ctx.fillText(label, x, y - 8);
            }
        });

        ctx.globalAlpha = 1;
        if (prog < 1) requestAnimationFrame(animate);
    }

    setTimeout(() => requestAnimationFrame(animate), delay);
}