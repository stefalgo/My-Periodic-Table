const visualizeOption = document.getElementById('visualizeOption')

function toNumber(str) {
    const match = str.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : NaN;
}

function showBlocks(show) {
    if (show) {
        document.documentElement.classList.add('blocks');
    } else {
        document.documentElement.classList.remove('blocks');
    }
}

function visualize(show, prop, useLog = false, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.74]) {

    const elements = [
        ...document.querySelectorAll('.element'),
        ...document.querySelectorAll('#CloseUp')
    ];

    if (!show) {
        elements.forEach(el => (el.style.backgroundColor = ''));
        return;
    }

    const getValue = el => {
        const key   = el.getAttribute('data-atomic') || el.getAttribute('data-linkedElement');
        const raw   = elementData[key]?.[prop];
        const match = (raw || '').toString().match(/-?\d+(\.\d+)?/);
        return match ? +match[0] : NaN;
    };

    const MIN = minColor;
    const MAX = maxColor;
    const unknownColor = [128, 128, 128, 0.35];

    const mapped = elements.map(el => ({ el, val: getValue(el) }));
    const data = mapped.filter(d => !isNaN(d.val));

    if (!data.length) return;

    const symlog = v => v === 0 ? 0 : Math.sign(v) * Math.log10(Math.abs(v));

    const toScale = v => useLog ? symlog(v) : v;

    const vals = data.map(d => toScale(d.val));
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const span = maxVal - minVal || 1;

    mapped.forEach(({ el, val }) => {
        if (el.hasAttribute('data-linkedElement')) {
            el.style.backgroundColor = 'transparent';
            return;
        }
        if (isNaN(val)) {
            el.style.backgroundColor = `rgba(${unknownColor.join(',')})`;
            return;
        }

        const v = toScale(val);
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

function visualizeOptionFunc() {
    const value = visualizeOption.value
    showBlocks(false)
    visualize(false)

    if (value === 'ElectronConfiguration') {
        showBlocks(true)
    }
    if (value === 'AtomicMass') {
        visualize(true, 'atomicMass', useLog = false, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.75])
    }
    if (value === 'MeltPoint') {
        visualize(true, 'melt', useLog = false, minColor = [0, 255, 255, 0.01], maxColor = [0, 255, 255, 0.75])
    }
    if (value === 'BoilPoint') {
        visualize(true, 'boil', useLog = false, minColor = [255, 0, 0, 0.01], maxColor = [255, 0, 0, 0.75])
    }
    if (value === 'Electronegativity') {
        visualize(true, 'electronegativity', useLog = true, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.75])
    }
    if (value === 'ElectronAffinity') {
        visualize(true, 'electronAffinity', useLog = true, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.75])
    }
    if (value === 'Ionization') {
        visualize(true, 'ionizationEnergy', useLog = true, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.75])
    }
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('darkMode');
    document.documentElement.classList.remove('lightMode');
} else {
    document.documentElement.classList.add('lightMode');
    document.documentElement.classList.remove('darkMode');
}

if (URL_readParam('lighting') === 'other') {
    toggleColorScheme()
}

if (URL_readParam('visualizeOption')) {
    visualizeOption.value = URL_readParam('visualizeOption')
}

adjustElementsText();

visualizeOption.addEventListener('change', () => {
    visualizeOptionFunc();
    URL_setParam('visualizeOption', visualizeOption.value)
});

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