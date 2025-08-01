const closeUp = document.getElementById('CloseUp');
const visualizeOption = document.getElementById('visualizeOption');

let elementData;

let visualizationParams = [];
let temp;

const engToGr = [
    { en: "solid", gr: "Στερεά" },
    { en: "liquid", gr: "Υγρά" },
    { en: "gas", gr: "Αέρια" },
    { en: "plasma", gr: "Πλάσμα" },

    { en: "alkali", gr: "Αλκαλικά μέταλλα" },
    { en: "alkaline", gr: "Αλκαλικές γαίες" },
    { en: "nonmetal", gr: "Αμέταλλο" },
    { en: "transition", gr: "Μετάλλα μετάπτωσης" },
    { en: "unknown", gr: "Άγνωστο" },
    { en: "lanthanoid", gr: "Λανθανίδα" },
    { en: "actinoid", gr: "Ακτινίδα" },
    { en: "metalloid", gr: "Μεταλλοειδές" },
    { en: "poor", gr: "Φτωχό μέταλλο" },
    { en: "noble", gr: "Ευγενές αέριο" }
];

function onDataLoaded() {
    if (!elementData) return;
    if (URL_readParam('SelectedElement')) {
        if (elementData[URL_readParam('SelectedElement')]) {
            showElementData(URL_readParam('SelectedElement'));
        } else {
            showElementData(1);
            URL_setParam('SelectedElement', 1)
        }
    } else {
        showElementData(1);
    }

    visualizeOptionFunc();
}

function toNumber(str) {
    const match = str.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : NaN;
}

function rgbaToHex([r, g, b, a]) {
    const toHex = c => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgba(hex) {
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

function getNestedValue(obj, path) {
    if (!obj || typeof path !== 'string') return undefined;
    return path
        .split('.')
        .reduce((acc, key) => acc?.[key], obj);
}

function formatGreekDate(yearLike) {
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

function openLinkInIframe(rowId) {
    const sitePopup = document.getElementById('sitePopup');
    //let link = "Files/ElementsPDF/" + elementData[rowId].name + ".pdf#zoom=100&navpanes=0&page=1";
    //let link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].name + "#view=Fit"
    //let link = "https://el.wikipedia.org/wiki/" + elementData[rowId].name;

    //https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/ + + "#view=Fit"
    let link;

    function closePopup(event) {
        sitePopup.querySelector('iframe').src = '';
        sitePopup.style.display = "none";
        sitePopup.querySelector('.close').removeEventListener('click', closePopup);
    }

    if (elementData[rowId].linkElementName) {
        link = 'https://el.wikipedia.org/wiki/' + elementData[rowId].linkElementName + '?withgadget=dark-mode';
    } else {
        link = 'https://el.wikipedia.org/wiki/' + elementData[rowId].name + '?withgadget=dark-mode';
    }
    sitePopup.querySelector('iframe').src = link;

    sitePopup.style.display = "block";
    sitePopup.querySelector('.close').addEventListener('click', closePopup);
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

function displayDataOnElement(dataMap, prop, sliceNum, convertFunc) {
    const elements = getTableElements();

    elements.forEach(el => {
        const key =
            el.getAttribute('data-atomic') ||
            el.getAttribute('data-linkedElement');

        const cell = el.querySelector('data');
        if (!cell) return;

        let value = getNestedValue(dataMap[key], prop);

        if (value == null) {
            cell.textContent = '';
            return;
        }

        if (sliceNum != null) {
            if (typeof value === 'string' || Array.isArray(value)) {
                value = value.slice(0, sliceNum);
            } else if (typeof value === 'number') {
                value = parseFloat(String(value).slice(0, sliceNum));
                if (Number.isNaN(value)) value = 0;
            }
        }

        cell.textContent = convertFunc
            ? convertFunc(value)
            : value;
    });
}

function showElementColor(show) {
    const elements = getTableElements();

    if (!show) {
        elements.forEach(el => (el.style.backgroundColor = ''));
        return;
    }

    elements.forEach(el => {
        const key = el.getAttribute('data-atomic');
        const data = elementData[key];
        if (!data || !data.color) return;

        const val = data.color;

        el.querySelector('data').textContent = String(val);
        el.style.backgroundColor = '#' + val;
    });
}

function showBlocks(show) {
    const elements = getTableElements();

    if (!show) {
        return;
    }

    elements.forEach(el => {
        const key = el.getAttribute('data-atomic');
        const data = elementData[key];
        if (!data) return;

        const val = getBlock(data);

        el.querySelector('data').textContent = String(val);
    });
}

function showState(show, temp = 273) {
    const elements = getTableElements();
    const phaseClasses = ['solid', 'liquid', 'gas', 'unknownState'];

    if (!show) {
        return;
    }

    const getPhase = (el) => {
        const key = el.getAttribute('data-atomic')
        const meltTemp = elementData[key]?.melt;
        const boilTemp = elementData[key]?.boil;
        let phase = 'unknownState';

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
            phase = (temp < meltTemp) ? 'solid' : ('unknownState');
            return phase;
        }

        if (validBoil) {
            phase = (temp >= boilTemp) ? 'gas' : ('liquid');
            return phase;
        }

        return phase;
    };

    const mapped = elements.map(el => ({ el, phase: getPhase(el) }));

    mapped.forEach(({ el, phase }) => {
        const dataText = el.querySelector('data');
        const text = engToGr.find(c => c.en === phase)?.gr ?? "Άγνωστη";
        if (el.style.backgroundColor !== `var(--${phase})`) {
            el.style.backgroundColor = `var(--${phase})`;
        }
        if (!el.classList.contains(phase)) {
            phaseClasses.forEach(cls => el.classList.remove(cls));
            el.classList.add(phase);
        }
        if (dataText.textContent !== text) {
            dataText.textContent = text;
        }
    });
}

function visualize(array, show, prop, useLog = false, displayData = true, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.74]) {
    const elements = getTableElements();

    if (!show) {
        elements.forEach(el => (el.style.backgroundColor = ''));
        //document.getElementById('propertyKey').style.display = 'none';
        return;
    }
    //document.getElementById('propertyKey').style.display = 'flex';

    if (useLog) {
        document.getElementById('logarithmic').checked = true;
    } else {
        document.getElementById('Linear').checked = true;
    }

    const getValue = el => {
        const key = el.getAttribute('data-atomic') || el.getAttribute('data-linkedElement');
        const raw = getNestedValue(array[key], prop);

        if (raw == null || (typeof raw === 'string' && raw.trim() === '')) return NaN;
        const num = Number(raw);
        return Number.isFinite(num) ? num : NaN;
    };

    const unknownColor = [128, 128, 128, 0.35];

    const mapped = elements.map(el => ({ el, val: getValue(el) }));
    const data = mapped.filter(d => !isNaN(d.val));

    if (!data.length) return;

    const symlog = (v, minLog) => v === 0 ? 0 : Math.sign(v) * (Math.log10(Math.abs(v)) - minLog);

    const rawVals = data.map(d => d.val);
    const logs = rawVals.filter(v => v !== 0).map(v => Math.sign(v) * Math.log10(Math.abs(v)));
    const minLog = Math.min(...logs);
    const toScale = v => useLog ? symlog(v, minLog) : v;

    const scaledVals = data.map(d => toScale(d.val));
    const minVal = Math.min(...scaledVals);
    const maxVal = Math.max(...scaledVals);
    const span = maxVal - minVal || 1;

    document.getElementById('rangeGradient').style.background = `linear-gradient(to top, rgba(${maxColor.join(',')}), rgba(${minColor.join(',')}))`;

    if (displayData) displayDataOnElement(array, prop, 7, x => x.toLocaleString('el-GR'));

    mapped.forEach(({ el, val }) => {
        if (isNaN(val)) {
            el.querySelector('data').textContent = '';
            el.style.backgroundColor = `rgba(${unknownColor.join(',')})`;
            return;
        }

        const v = toScale(val);
        const t = (v - minVal) / span;

        const rgba = minColor.map((c, i) => i < 3
            ? Math.round(c + t * (maxColor[i] - c))
            : c + t * (maxColor[3] - c));

        el.style.backgroundColor = `rgba(${rgba.join(',')})`;
    });
}

function adjustElementsText(element, child, width) {
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

function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function toggleColorScheme() {
    document.documentElement.classList.toggle('darkMode');
    document.documentElement.classList.toggle('lightMode');
}

function visualizeOptionFunc(setLogMode = true) {
    const value = visualizeOption.dataset.selected.split('-')[0];
    const value2 = visualizeOption.dataset.selected.split('-')[1];
    const logState = Array.isArray(visualizationParams) ? visualizationParams[3] : undefined;

    visualizationParams = null;


    //<array, show, prop, propKey, useLog = false, displayData = true, minColor = [8, 212, 170, 0], maxColor = [8, 212, 170, 0.74]>
    const config = {
        'category': {},
        'blocks': { action: () => showBlocks(true) },
        'state': { action: () => showState(true, temp) },
        'atomicMass': { params: [elementData, true, 'atomicMass', false, true, [8, 212, 170, 0], [8, 212, 170, 0.75]] },
        'meltPoint': { params: [elementData, true, 'melt', false, true, [0, 255, 255, 0.01], [0, 255, 255, 0.75]] },
        'boilPoint': { params: [elementData, true, 'boil', false, true, [255, 0, 0, 0.01], [255, 0, 0, 0.75]] },
        'density': { params: [elementData, true, 'density', false, true, [8, 212, 170, 0], [8, 212, 170, 0.75]] },
        'electronegativity': { params: [elementData, true, 'electronegativity', true, true, [0, 60, 240, 0.75], [175, 193, 0, 0.75]] },
        'electronAffinity': { params: [elementData, true, 'electronAffinity', true, true, [200, 0, 200, 0], [200, 0, 200, 0.75]] },
        'ionization': { params: [elementData, true, 'ionizationEnergy', true, true, [8, 212, 170, 0], [175, 193, 0, 0.75]] },
        'radius': { params: [elementData, true, 'atomicRadius', false, true, [43, 125, 125, 0], [43, 125, 125, 0.75]] },
        'energyLevels': {
            action: () => {
                const calculated = {};
                Object.entries(elementData).forEach(([key, el]) => {
                    const period = Number(el.period);
                    const shells = energyLevels(el.electronConfiguration) ?? [];
                    const idx = period - 1;
                    const electrons = shells[idx] ?? 0;
                    (calculated[key] ??= { Total: 0 }).Total += electrons;
                });
                visualizationParams = [calculated, true, 'Total', false, false, [133, 173, 49, 0], [133, 173, 49, 0.75]];
                displayDataOnElement(
                    elementData,
                    'electronConfiguration',
                    null,
                    x => {
                        const levels = energyLevels(x);
                        const last3 = levels.slice(-3);
                        return (levels.length > 3
                            ? ['-'].concat(last3)
                            : last3)
                            .join(' ');
                    }
                );
            }
        },
        'discoveryDate': {
            action: () => {
                document.documentElement.classList.add('category');
                displayDataOnElement(elementData, 'discovered', null, formatGreekDate);
            },
            //params: [elementData, true, 'discovered', false, false, [43, 125, 125, 0], [43, 125, 125, 0.75]]
        },
        'abundance': { params: [elementData, true, 'elementAbundance', true, false, [43, 125, 125, 0], [43, 125, 125, 0.75]] },
    };

    const selected = config[value];

    if (value2) {
        for (const key in config) {
            const entry = config[key];
            if (entry.params && typeof entry.params[2] === 'string') {
                entry.params[2] = `${entry.params[2]}.${value2}`;
                displayDataOnElement(elementData, entry.params[2], null, x => `${x}%`);
            }
        }
    }
    if (!document.documentElement.classList.contains(value)) {
        Object.keys(config).forEach(cls => document.documentElement.classList.remove(cls));
        document.documentElement.classList.add(value);
    };
    showBlocks(false);
    showState(false);
    visualize(null, false);

    if (selected) {
        if (selected.action && (!visualizationParams)) {
            selected.action();
        }
        if (selected.params && (!visualizationParams)) {
            visualizationParams = selected.params;
        }
    }

    if (!visualizationParams && !selected?.action) {
        displayDataOnElement(elementData, 'category');
    }

    if (visualizationParams) {
        if (!setLogMode && logState) {
            visualizationParams[3] = logState;
        }
        visualize(...visualizationParams);
    }
}

function generateAtom(atomicNumber) {
    const atomContainer = document.getElementById('atom');
    const atomCore = atomContainer.querySelector('.atom');
    if (!elementData[atomicNumber]) { console.error('Atomic number not found in the data.'); return; }
    atomCore.innerHTML = '';
    energyLevels(elementData[atomicNumber].electronConfiguration).forEach((numElectrons, index) => {
        const energyLevelDiv = document.createElement('div');
        const radius = (index + 2) * 9;
        const animationSpeed = radius / 2;

        energyLevelDiv.classList.add('energy-level');
        energyLevelDiv.style.width = radius * 2 + 'px';
        energyLevelDiv.style.height = radius * 2 + 'px';
        energyLevelDiv.style.animation = `spin ${animationSpeed}s linear infinite`;
        atomCore.appendChild(energyLevelDiv);

        for (let i = 0; i < numElectrons; i++) {
            const angle = (360 / numElectrons) * i - 90;
            const electron = document.createElement('div');
            electron.classList.add('electron');
            const electronX = radius * Math.cos(angle * Math.PI / 180) + radius - 5;
            const electronY = radius * Math.sin(angle * Math.PI / 180) + radius - 5;
            electron.style.top = electronY + 'px';
            electron.style.left = electronX + 'px';
            energyLevelDiv.appendChild(electron);
        }
    });
}

function showElementData(elementAtomicNumber) {
    const atomic = closeUp.querySelector('.closeUp-atomic');
    const symbol = closeUp.querySelector('.closeUp-shortName');
    const name = closeUp.querySelector('.closeUp-name');
    const energyLevel = closeUp.querySelector('small');

    energyLevel.innerHTML = '';
    atomic.textContent = elementAtomicNumber;
    name.textContent = elementData[elementAtomicNumber].name;
    symbol.textContent = elementData[elementAtomicNumber].symbol;


    closeUp.classList = '';
    closeUp.classList.add(elementData[elementAtomicNumber].category);
    closeUp.classList.add(getBlock(elementData[elementAtomicNumber]));
    closeUp.setAttribute('data-atomic', elementAtomicNumber)

    visualizeOptionFunc(false);

    for (const level of energyLevels(elementData[elementAtomicNumber].electronConfiguration)) {
        let spanElement = document.createElement('span');
        spanElement.textContent = level;
        energyLevel.appendChild(spanElement);
    }

    generateAtom(elementAtomicNumber);
    adjustElementsText('#CloseUp', 'em', 70);
}

function infoElement(elementAtomicNumber) {
    const infoPopup = document.getElementById('infoPopup');
    const popupData = infoPopup.querySelector('.popup-data');
    const wikipediaLink = infoPopup.querySelector('.popup-wikipediaLink');
    const downloadPDF = infoPopup.querySelector('.popup-pdfDownload');
    const closeUp2 = copyCloseUp();

    const element = elementAtomicNumber;
    const data = elementData[element];
    const name = data.linkElementName || data.name;

    popupData.innerHTML = '';

    const createData = (title, value) => {
        popupData.insertAdjacentHTML('beforeend', `
            <div>
                <legend><b>${title}:</b></legend>
                <h3>${value}</h3>
            </div>
            <hr>
        `);
    };

    function copyCloseUp() {
        const clone = closeUp.cloneNode(true);
        document.getElementById('CloseUp2').innerHTML = '';
        document.getElementById('CloseUp2').appendChild(clone);
        return clone;
    }

    function closePopup() {
        infoPopup.style.display = "none";
        wikipediaLink.href = downloadPDF.href = '';
        closeUp2.removeEventListener('click', wikipediaIframeOpen);
        infoPopup.querySelector('.close').removeEventListener('click', closePopup);
    }

    const wikipediaIframeOpen = () => openLinkInIframe(element);

    wikipediaLink.href = `https://el.wikipedia.org/wiki/${name}`;
    downloadPDF.href = `https://el.wikipedia.org/api/rest_v1/page/pdf/${name}`;

    const fields = [
        ['Ονομα', data.name || '--'],
        ['Ατομικός', data.atomic || '--'],
        ['Ηλεκτρονική δομή', energyLevels(data.electronConfiguration).join(', ') || '--'],
        ['Διαμόρφωση', data.electronStringConf || '--'],
        ['Βάρος', `${data.atomicMass || '--'} u`],
        ['Ταξινόμηση', engToGr.find(c => c.en === data.category)?.gr ?? "Άγνωστη κατηγορία"],
        ['Μπλοκ', getBlock(data) || '--'],
        ['Σημείο τήξης', `${data.melt || '--'} K`],
        ['Σημείο ζέσεως', `${data.boil || '--'} K`],
        ['Ακτίνα', `${data.atomicRadius || '--'} pm`],
        ['Ηλεκτραρνητικότητα', data.electronegativity || '--'],
        ['Ιονισμός', `${data.ionizationEnergy || '--'} kJ/mol`],
        ['Ηλεκτροσυγγένεια', `${data.electronAffinity || '--'} kJ/mol`],
        ['Πυκνότητα', `${data.density || '--'} kJ/m<sup>3</sup>`],
        ['Ανακαλύφθηκε', formatGreekDate(data.discovered) || '--']
    ];
    fields.forEach(([t, v]) => createData(t, v));

    closeUp2.addEventListener('click', wikipediaIframeOpen);
    infoPopup.querySelector('.close').addEventListener('click', closePopup);
    infoPopup.style.display = "block";
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
    visualizeOption.dataset.selected = URL_readParam('visualizeOption');
}

adjustElementsText('.element', 'em', 60);