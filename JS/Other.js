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

function showWeight(useLog = false) {
    const elements = [...document.querySelectorAll('.element')];

    if (elements.some(el => el.style.backgroundColor)) {
        elements.forEach(el => el.style.backgroundColor = '');
        return;
    }

    const getMass = el => {
        const key = el.getAttribute('data-atomic') || el.getAttribute('data-linkedElement');
        const m = (elementData[key]?.mass || '').match(/-?\d+(\.\d+)?/);
        return m ? +m[0] : NaN;
    };

    const minColor = [255, 200, 200, 0.2];
    const maxColor = [200, 30, 30, 1];

    const data = elements
        .map(el => ({ el, mass: getMass(el) }))
        .filter(e => !isNaN(e.mass) && (!useLog || e.mass > 0));
    if (!data.length) return;

    const values = useLog 
        ? data.map(e => Math.log(e.mass))
        : data.map(e => e.mass);

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    data.forEach(({ el, mass }) => {
        if (el.hasAttribute('data-linkedElement')) {
            el.style.backgroundColor = 'transparent';
            return;
        }
        const val = useLog ? Math.log(mass) : mass;
        const t = (val - min) / range;

        const r = Math.round(minColor[0] + t * (maxColor[0] - minColor[0]));
        const g = Math.round(minColor[1] + t * (maxColor[1] - minColor[1]));
        const b = Math.round(minColor[2] + t * (maxColor[2] - minColor[2]));
        const a = minColor[3] + t * (maxColor[3] - minColor[3]);

        el.style.backgroundColor = `rgba(${r},${g},${b},${a})`;
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
    document.documentElement.classList.toggle('darkMode');
    document.documentElement.classList.toggle('lightMode');
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
