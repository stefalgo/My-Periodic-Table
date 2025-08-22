export function toNumber(str) {
    const match = str.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : NaN;
}

export function rgbaToHex([r, g, b, a]) {
    const toHex = c => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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