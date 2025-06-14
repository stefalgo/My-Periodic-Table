const visualizeOption = document.getElementById('visualizeOption');
let visualizationParams = [];
let temp;

const stateEngGr = [
    {en: "solid", gr: "Στερεά"},
    {en: "liquid", gr: "Υγρά"},
    {en: "gas", gr: "Αέρια"},
    {en: "plasma", gr: "Πλάσμα"},
];

const classesEngGr = [
	{en: "alkali", gr: "Αλκαλικά μέταλλα"},
	{en: "alkaline", gr: "Αλκαλικές γαίες"},
	{en: "nonmetal", gr: "Αμέταλλο"},
	{en: "transition", gr: "Μετάλλα μετάπτωσης"},
	{en: "unknown", gr: "Άγνωστο"},
	{en: "lanthanoid", gr: "Λανθανίδα"},
	{en: "actinoid", gr: "Ακτινίδα"},
	{en: "metalloid", gr: "Μεταλλοειδές"},
	{en: "poor", gr: "Φτωχό μέταλλο"},
	{en: "noble", gr: "Ευγενές αέριο"}
];

function toNumber(str) {
    const match = str.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : NaN;
}

function getTableElements() {
    return elements = [
        ...document.querySelectorAll('.element'),
        ...document.querySelectorAll('#CloseUp')
    ];
}

function getBlock(el) {
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

function energyLevels(eConfig) {
	const totals = {};

	eConfig.trim().split(/\s+/).forEach(tok => {
		const m = tok.match(/^(\d+)[spdfg](\d+)$/i);
		if (!m) return;
	    const n = +m[1];
	    const e = +m[2];
	    totals[n] = (totals[n] || 0) + e;
	});

	const maxN = Math.max(...Object.keys(totals));
	return Array.from({ length: maxN }, (_, i) => totals[i + 1] || 0);
}

function showElementColor(show) {
    const elements = getTableElements();

    if (!show) {
        elements.forEach(el => (el.style.backgroundColor = ''));
        return;
    }

    elements.forEach(el => {
        if (el.hasAttribute('data-linkedElement')) return;

        const key  = el.getAttribute('data-atomic');
        const data = elementData[key];
        if (!data || !data.color) return;

        const val  = data.color;

        el.querySelector('data').textContent = String(val);
        el.style.backgroundColor = '#'+val;
    });
}

function showBlocks(show) {
    const elements = getTableElements();

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

        el.querySelector('data').textContent = String(val);
    });

    document.documentElement.classList.add('blocks');
}

function showState(show, temp=273) {
    const elements = getTableElements();

    if (!show) {
        elements.forEach(el => (el.style.backgroundColor = ''));
        return;
    }

    const getPhase = (el) => {
        const key = el.getAttribute('data-atomic') || el.getAttribute('data-linkedElement');
        const meltTemp = elementData[key]?.melt;
        const boilTemp = elementData[key]?.boil;
        const dataPhase = elementData[key]?.phase?.trim().toLowerCase();
        let phase = dataPhase || 'unknown';

        const validMelt = (typeof meltTemp === 'number') && !isNaN(meltTemp);
        const validBoil = (typeof boilTemp === 'number') && !isNaN(boilTemp);

        if (!validMelt && !validBoil) {
            return phase;
        }

        if (validMelt && validBoil) {
            if (temp >= boilTemp) {
                phase = 'gas';
            } else if (temp >= meltTemp) {
                phase = 'liquid';
            } else if (temp < meltTemp) {
                phase = 'solid';
            }
            return phase;
        }

        if (validMelt) {
            phase = (temp < meltTemp) ? 'solid' : (dataPhase || 'liquid');
            return phase;
        }

        if (validBoil) {
            phase = (temp >= boilTemp) ? 'gas' : (dataPhase || 'liquid');
            return phase;
        }

        return phase;
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
        el.querySelector('data').textContent = stateEngGr.find(c => c.en === phase)?.gr ?? "Άγνωστη";
        el.style.backgroundColor = `rgba(${rgba.join(',')})`;
    });
}

function visualize(array, show, prop, useLog = false, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.74]) {
    const elements = getTableElements();

    if (!show) {
        elements.forEach(el => (el.style.backgroundColor = ''));
        document.getElementById('PropertyKey').style.display = 'none';
        return;
    }
    document.getElementById('PropertyKey').style.display = 'flex';

    if (useLog) {
        document.getElementById('logarithmic').checked = true;
    } else {
        document.getElementById('Linear').checked = true;
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
            el.querySelector('data').textContent = '';
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
	visualizationParams = null;

	document.documentElement.classList.remove('chemicalGroupBlock');
	showBlocks(false);
	showState(false);
	visualize(false);

	if (value === 'ElectronConfiguration') {
		showBlocks(true);
	} else if (value === 'State') {
		showState(true, temp);
	} else if (value === 'AtomicMass') {
		visualizationParams = [elementData, true, 'atomicMass', false, [8, 212, 170, 0], [8, 212, 170, 0.75]];
	} else if (value === 'MeltPoint') {
		visualizationParams = [elementData, true, 'melt', false, [0, 255, 255, 0.01], [0, 255, 255, 0.75]];
	} else if (value === 'BoilPoint') {
		visualizationParams = [elementData, true, 'boil', false, [255, 0, 0, 0.01], [255, 0, 0, 0.75]];
	} else if (value === 'Density') {
		visualizationParams = [elementData, true, 'density', false, [8, 212, 170, 0], [8, 212, 170, 0.75]];
	} else if (value === 'Electronegativity') {
		visualizationParams = [elementData, true, 'electronegativity', true, [0, 60, 240, 0.75], [175, 193, 0, 0.75]];
	} else if (value === 'ElectronAffinity') {
		visualizationParams = [elementData, true, 'electronAffinity', true, [200, 0, 200, 0], [200, 0, 200, 0.75]];
	} else if (value === 'Ionization') {
		visualizationParams = [elementData, true, 'ionizationEnergy', true, [8, 212, 170, 0], [175, 193, 0, 0.75]];
	} else if (value === 'EnergyLevels') {
		const calculated = {};
		Object.entries(elementData).forEach(([key, el]) => {
			const period = Number(el.period);
			const shells = energyLevels(el.electronConfiguration) ?? [];
			const idx = period - 1;
			const electrons = shells[idx] ?? 0;
			(calculated[key] ??= { Total: 0 }).Total += electrons;
		});
		visualizationParams = [calculated, true, 'Total', false, [133, 173, 49, 0], [133, 173, 49, 0.75]];
	} else {
		const elements = getTableElements();
		document.documentElement.classList.add('chemicalGroupBlock');
		elements.forEach(el => {
			if (el.hasAttribute('data-linkedElement')) return;
			const key = el.getAttribute('data-atomic');
			const data = elementData[key];
			if (!data || !data.category) return;
			const dataTag = el.querySelector('data');
			dataTag.textContent = String(data.category);
		});
	}

	if (visualizationParams) {
		visualize(...visualizationParams);
	}
}

function tempChange(e) {
    const tempNumberInputC = document.getElementById('tempNumInputC');
    const tempNumberInputK = document.getElementById('tempNumInputK');
    const tempRangeSlider  = document.getElementById('temp');

    const K2C = k => k - 273;
    const C2K = c => c + 273;

    let k, c;

    if (e.target === tempRangeSlider) {
        k = Number(e.target.value);
        c = K2C(k);
    } else if (e.target === tempNumberInputK) {
        k = Number(e.target.value);
        c = K2C(k);
        tempRangeSlider.value = k;
    } else {
        c = Number(e.target.value);
        k = C2K(c);
        tempRangeSlider.value = k;
    }

    if (document.activeElement !== tempNumberInputK) tempNumberInputK.value = k;
    if (document.activeElement !== tempNumberInputC) tempNumberInputC.value = c;

    temp = k;
    visualizeOptionFunc();
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

document.getElementById('PropertyKey').addEventListener('change', () => {
    const selected = document.getElementById('PropertyKey').querySelector('input[name="scale"]:checked');
    if (selected) {
        if (visualizationParams) {
            visualizationParams[3] = selected.value === 'log' && true || false
            visualize(...visualizationParams);
        }
    }
});

visualizeOption.addEventListener('change', () => {
    visualizeOptionFunc();
    URL_setParam('visualizeOption', visualizeOption.value);
});

document.getElementById('temp').addEventListener('input', tempChange);
document.getElementById('tempNumInputC').addEventListener('input', tempChange);
document.getElementById('tempNumInputK').addEventListener('input', tempChange);

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