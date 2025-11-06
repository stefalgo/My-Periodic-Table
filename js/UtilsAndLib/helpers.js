//----------------------------General utilities----------------------------
export function toNumber(str) {
    const match = str.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : NaN;
}

export function rgbaToHex([r, g, b, a]) {
    const toHex = c => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

export function hexToRgba(hex) {
    hex = hex.replace(/^#/, '');
    let r, g, b, a = 1;
    if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = parseInt(hex.slice(6, 8), 16) / 255;
    } else {
        throw new Error('Invalid hex color');
    }

    return [r, g, b, a];
}

export function getNestedValue(obj, path) {
    if (!obj || typeof path !== 'string') return undefined;
    return path
        .split('.')
        .reduce((acc, key) => acc?.[key], obj);
}

export function formatGreekDate(yearLike) {
    if (yearLike == null) return '';

    const raw = String(yearLike).trim();

    const m = raw.match(/^([+-]?\d+)$/);
    if (!m) return raw;

    let year = Number(m[1]);

    if (year === 0) year = -1;

    return year < 0
        ? `${Math.abs(year)} π.Χ.`
        : `${year} μ.Χ.`;
}

export function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function sharePage() {
    const data = {
        title: "Periodic table",
        text: "Check out stefalgo's periodic table",
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(data)
            .then(() => console.log("Shared successfully"))
            .catch(err => console.error("Share failed:", err));
    } else {
        console.warn("Web Share API not supported in this browser.");
    }
}

export function adjustElementsText(element, child, width) {
    document.querySelectorAll(`${element} ${child}`).forEach(em => {
        em.style.transform = 'none';
        em.style.letterSpacing = '';

        const natural = em.scrollWidth;
        const scale = natural > width ? width / natural : 1;

        em.style.transformOrigin = 'left center';
        em.style.transform = `scaleX(${scale})`;

        if (em.textContent.length >= 10) {
            em.style.letterSpacing = '-0.05em';
        }
    });
}
//------------------------------Table helpers------------------------------
export const KelvinToCelcius = k => k - 273;
export const CelciusToKelvin = c => c + 273;

export function lastElectronCount(eConfig) {
    const match = eConfig.trim().match(/(\d+[spdfg]\d+)\s*$/);
    if (!match) return null;

    const lastPart = match[1];
    const countMatch = lastPart.match(/\d+$/);
    return countMatch ? Number(countMatch[0]) : null;
}

export function getRepresentativeOxidation(oxStr) {
    return oxStr
        .split(",")
        .map(s => s.trim())
        .filter(s => s.endsWith("c"))
        .map(s => s.replace(/c$/, ""))
        .join(" ");
}

export function getBlock(el) {
    const Z = Number(el.atomic);
    const group = Number(el.group);

    if ((Z >= 57 && Z <= 71) || (Z >= 89 && Z <= 103)) return 'f';

    if (group) {
        if (Z === 2) return 's';
        if (group === 1 || group === 2) return 's';
        if (group >= 13 && group <= 18) return 'p';
        if (group >= 3 && group <= 12) return 'd';
    }

    const cfg = el.electronConfiguration ?? '';
    let block = '';

    cfg.replace(/\[.*?\]/g, '')
        .trim()
        .split(/\s+/)
        .forEach(tok => {
            const m = tok.match(/^[0-9]+([spdfg])/i);
            if (m) block = m[1].toLowerCase();
        });

    return block;
}

export function energyLevels(eConfig) {
    const cleaned = eConfig.replace(/\[.*?]/g, '').trim();
    if (!cleaned) return [];

    const totals = new Map();

    for (const tok of cleaned.split(/\s+/)) {
        const m = tok.match(/^(\d+)[spdfg](\d+)$/i);
        if (!m) continue;
        const n = Number(m[1]);
        const e = Number(m[2]);
        totals.set(n, (totals.get(n) || 0) + e);
    }

    if (!totals.size) return [];

    const maxN = Math.max(...totals.keys());
    const shells = [];
    for (let n = 1; n <= maxN; n++) {
        shells.push(totals.get(n) || 0);
    }
    return shells;
}