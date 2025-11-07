//----------------------------General utilities----------------------------
/**
 * Hex to RGBA colors.
 * @param {string} hex - RGBA string (e.g. "rgba(255, 0, 0, 1)" or "rgb(255,0,0)"
 * @returns {string} Converted RGBA to HEX color string
 */
export function rgbaToHex([r, g, b, a]) {
    const toHex = c => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

/**
 * Hex to RGBA colors.
 * @param {string} hex - HEX string (e.g. "#ff0000" or "#bbeeffaa")
 * @returns {string} Converted HEX to RGBA color string
 */
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

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Linearly interpolates between two RGBA colors.
 * @param {string} color1 - RGBA or RGB string (e.g. "rgba(255, 0, 0, 1)" or "rgb(255,0,0)")
 * @param {string} color2 - RGBA or RGB string (e.g. "rgba(0, 0, 255, 0.5)")
 * @param {number} t - Interpolation factor between 0 and 1
 * @returns {string} The interpolated RGBA color string
 */
export function lerpColor(color1, color2, t) {
    const parse = color => color.match(/[\d.]+/g).map(Number);

    const [r1, g1, b1, a1 = 1] = parse(color1);
    const [r2, g2, b2, a2 = 1] = parse(color2);

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    const a = a1 + (a2 - a1) * t;

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Gets nested value in a array.
 * @param {string} obj - The array to search for value
 * @param {string} path - The path to the value (e.g. "car.engine.type")
 * @returns {any} The value followed from the path
 */
export function getNestedValue(obj, path) {
    if (!obj || typeof path !== 'string') return undefined;
    return path
        .split('.')
        .reduce((acc, key) => acc?.[key], obj);
}

/**
 * Formats a year to the Greek notation.
 * @param {number} year - The year (e.g., 1930 → "1930 μ.Χ.", -2300 → "2300 π.Χ.")
 * @returns {string} The formatted year in Greek notation, handling BC and AD
 */
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

/**
 * Removes accent/diacritical marks from letters.
 * @param {string} str - The string to normalize (e.g., "é" becomes "e", "ύ" becomes "υ")
 * @returns {string} The normalized string without diacritics
 */
export function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Shares this current page (FULL URL).
 */
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