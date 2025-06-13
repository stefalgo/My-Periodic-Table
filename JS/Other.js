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
    //document.documentElement.classList.toggle('blocks');
    //if (document.documentElement.classList.contains('blocks')) {
    //    URL_setParam("blocks", 'true');
    //} else {
    //    URL_removeParam("blocks")
    //}
}

function visualize(show, prop, useLog = false, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.74]) {
    const elements = [...document.querySelectorAll('.element'), ...document.querySelectorAll('#CloseUp')];

    if (!show) {
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
    const unknownColor = [128, 128, 128, 0.35];

    const mapped = elements.map(el => ({ el, val: getValue(el) }));                          // changed
    const data   = mapped.filter(d => !isNaN(d.val));                                        // added

    if (!data.length) return;

    const vals   = useLog ? data.map(d => Math.log(d.val)) : data.map(d => d.val);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const span   = maxVal - minVal || 1;

    mapped.forEach(({ el, val }) => {                                                        // changed
        if (el.hasAttribute('data-linkedElement')) {
            el.style.backgroundColor = 'transparent';
            return;
        }
        if (isNaN(val)) {                                                                    // added
            el.style.backgroundColor = `rgba(${unknownColor.join(',')})`;                    // added
            return;                                                                          // added
        }
        const v = useLog ? Math.log(val) : val;
        const t = (v - minVal) / span;

        const rgba = MIN.map((c, i) => i < 3
            ? Math.round(c + t * (MAX[i] - c))
            : c + t * (MAX[3] - c));

        el.style.backgroundColor = `rgba(${rgba.join(',')})`;                                // changed
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
        visualize(true, 'atomicMass', useLog = false, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.74])
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
