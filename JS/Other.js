const visualizeOption = document.getElementById('visualizeOption');

function toNumber(str) {
    const match = str.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : NaN;
}

function showBlocks(show) {
    const elements = [
        ...document.querySelectorAll('.element'),
        ...document.querySelectorAll('#CloseUp')
    ];

    if (!show) {
        document.documentElement.classList.remove('blocks');
        return;
    }

    elements.forEach(el => {
        if (el.hasAttribute('data-linkedElement')) return;

        const key  = el.getAttribute('data-atomic');
        const data = elementData[key];
        if (!data) return;

        const val  = getBlock(data);

        const dataTag = el.querySelector('data');

        dataTag.textContent = String(val);
    });

    document.documentElement.classList.add('blocks');
}

function showState(show) {
    const elements = [
        ...document.querySelectorAll('.element'),
        ...document.querySelectorAll('#CloseUp')
    ];

    if (!show) {
        elements.forEach(el => (el.style.backgroundColor = ''));
        return;
    }

    const getPhase = el => {
        const key   = el.getAttribute('data-atomic') || el.getAttribute('data-linkedElement');
        return (elementData[key]?.phase || '').trim().toLowerCase();
    };

    const phaseColor = {
        solid: [190, 190, 190, 0.55],
        liquid: [30, 144, 255, 0.55],
        gas: [255, 140, 0, 0.55],
        plasma: [255, 0, 255, 0.55]
    };
    const unknownColor = [128, 128, 128, 0.35];

    const mapped = elements.map(el => ({ el, phase: getPhase(el) }));

    mapped.forEach(({ el, phase }) => {
        if (el.hasAttribute('data-linkedElement')) {
            el.style.backgroundColor = 'transparent';
            return;
        }
        const rgba = phaseColor[phase] || unknownColor;
        el.querySelector('data').textContent = phase;
        el.style.backgroundColor = `rgba(${rgba.join(',')})`;
    });
}

function visualize(array, show, prop, useLog = false, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.74]) {

    const elements = [
        ...document.querySelectorAll('.element'),
        ...document.querySelectorAll('#CloseUp')
    ];

    if (!show) {
        elements.forEach(el => (el.style.backgroundColor = ''));
        return;
    }

    const getValue = el => {
        const key = el.getAttribute('data-atomic') || el.getAttribute('data-linkedElement');
        const raw = array[key]?.[prop];

        if (raw == null || (typeof raw === 'string' && raw.trim() === '')) return NaN;
        const num = Number(raw);
        return Number.isFinite(num) ? num : NaN;
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
            el.querySelector('data').textContent = 'N/A';
            el.style.backgroundColor = `rgba(${unknownColor.join(',')})`;
            return;
        }

        const v = toScale(val);
        const t = (v - minVal) / span;

        const rgba = MIN.map((c, i) => i < 3
            ? Math.round(c + t * (MAX[i] - c))
            : c + t * (MAX[3] - c));

        el.querySelector('data').textContent = String(val).slice(0, 7);
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
    const value = visualizeOption.value;
    showBlocks(false);
    showState(false);
    visualize(false);

    if (value === 'ElectronConfiguration') {
        showBlocks(true);
    } else if (value === 'State') {
        showState(true);
    } else if (value === 'AtomicMass') {
        visualize(elementData, true, 'atomicMass', useLog = false, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.75]);
    } else if (value === 'MeltPoint') {
        visualize(elementData, true, 'melt', useLog = false, minColor = [0, 255, 255, 0.01], maxColor = [0, 255, 255, 0.75]);
    } else if (value === 'BoilPoint') {
        visualize(elementData, true, 'boil', useLog = false, minColor = [255, 0, 0, 0.01], maxColor = [255, 0, 0, 0.75]);
    } else if (value === 'Electronegativity') {
        visualize(elementData, true, 'electronegativity', useLog = true, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.75]);
    } else if (value === 'ElectronAffinity') {
        visualize(elementData, true, 'electronAffinity', useLog = true, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.75]);
    } else if (value === 'Ionization') {
        visualize(elementData, true, 'ionizationEnergy', useLog = true, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.75]);
    } else if (value === 'EnergyLevels') {
        const calculated = {};

        Object.entries(elementData).forEach(([key, el]) => {
            const period  = Number(el.period);
            const shells  = el.shells ?? [];
            const idx     = period - 1;
            const electrons = shells[idx] ?? 0;

            (calculated[key] ??= { Total: 0 }).Total += electrons;
        });
        visualize(calculated, true, 'Total', useLog = false, minColor = [133, 173, 49, 0], maxColor = [133, 173, 49, 0.75]);
    } else {
        const elements = [
            ...document.querySelectorAll('.element'),
            ...document.querySelectorAll('#CloseUp')
        ];

        elements.forEach(el => {
            if (el.hasAttribute('data-linkedElement')) return;

            const key  = el.getAttribute('data-atomic');
            const data = elementData[key];
            if (!data || !data.category) return;
            const dataTag = el.querySelector('data');

            dataTag.textContent = String(data.category);
        });
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
    toggleColorScheme();
}

if (URL_readParam('visualizeOption')) {
    visualizeOption.value = URL_readParam('visualizeOption');
}

adjustElementsText();

visualizeOption.addEventListener('change', () => {
    visualizeOptionFunc();
    URL_setParam('visualizeOption', visualizeOption.value);
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
