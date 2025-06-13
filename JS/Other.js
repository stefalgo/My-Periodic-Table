function toNumber(str) {
    const match = str.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : NaN;
}

function showBlocks() {
    document.documentElement.classList.toggle('blocks');
    if (document.documentElement.classList.contains('blocks')) {
        URL_setParam("blocks", 'true');
    } else {
        URL_removeParam("blocks")
    }
}

function visualize(prop, useLog = false, minColor = [255, 200, 200, 0.2], maxColor = [200,  30,  30, 1]) {
    const elements = [...document.querySelectorAll('.element')];

    if (elements.some(el => el.style.backgroundColor)) {
        elements.forEach(el => (el.style.backgroundColor = ''));
        return;
    }

    const getValue = el => {
        const key = el.getAttribute('data-atomic') || el.getAttribute('data-linkedElement');
        const raw  = elementData[key]?.[prop];
        const match = (raw || '').toString().match(/-?\d+(\.\d+)?/);
        return match ? +match[0] : NaN;
    };

    const MIN = minColor;
    const MAX = maxColor;

    const data = elements
        .map(el => ({ el, val: getValue(el) }))
        .filter(d => !isNaN(d.val) && (!useLog || d.val > 0));

    if (!data.length) return;

    const vals   = useLog ? data.map(d => Math.log(d.val)) : data.map(d => d.val);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const span   = maxVal - minVal || 1;

    data.forEach(({ el, val }) => {
        if (el.hasAttribute('data-linkedElement')) {
            el.style.backgroundColor = 'transparent';
            return;
        }
        const v = useLog ? Math.log(val) : val;
        const t = (v - minVal) / span;

        const rgba = MIN.map((c, i) => i < 3
            ? Math.round(c + t * (MAX[i] - c))
            : c + t * (MAX[3] - c));

        el.style.backgroundColor = `rgba(${rgba.join(',')})`;
    });
}

function adjustElementsText() {
    const containerWidth = 57;
    const elements = document.querySelectorAll('.element');
    elements.forEach(el => {
        const emEl = el.querySelector('em');
        if (emEl) {

            const measuredWidth = emEl.scrollWidth;

            const scaleX = containerWidth / measuredWidth;

            const translateX = 50 * (scaleX - 1);

            const wordLength = emEl.textContent.length;
            const letterSpacing = (wordLength >= 11) ? 0.05 : 0;

            emEl.style.transform = `translateX(${translateX}%) scaleX(${scaleX})`;
            emEl.style.letterSpacing = `${letterSpacing}em`;
        }
    });
}

function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
}

function toggleColorScheme() {
    document.documentElement.classList.toggle('darkMode');
    document.documentElement.classList.toggle('lightMode');
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('darkMode');
    document.documentElement.classList.remove('lightMode');
} else {
    document.documentElement.classList.add('lightMode');
    document.documentElement.classList.remove('darkMode');
}

if (URL_readParam('blocks') === 'true') {
    document.documentElement.classList.toggle('blocks');
}

if (URL_readParam('lighting') === 'other') {
    toggleColorScheme()
}

adjustElementsText();

document.getElementById("searchbar").addEventListener("input", function () {
    let searchValue = removeDiacritics(this.value.trim().toLowerCase());
    let items = document.querySelectorAll(".element");

    items.forEach(item => {
        let atomicValue = removeDiacritics(item.getAttribute("data-atomic") || "");
        let emElement = item.querySelector("em");
        let emText = emElement ? removeDiacritics(emElement.textContent.trim().toLowerCase()) : "";

        if (searchValue === "") {
            item.classList.remove("highlight");
        } else if (atomicValue === searchValue || emText.includes(searchValue)) {
            item.classList.add("highlight");
        } else {
            item.classList.remove("highlight");
        }
    });
});
