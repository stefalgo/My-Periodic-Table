"use strict";

import * as URLUtils from './UtilsAndLib/UrlParamsUtils.js'
import * as helpers from './UtilsAndLib/helpers.js'
import { updateTemperatureInputs } from './Events.js';

const periodicTable = document.getElementById('periodicTable');

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

const engToGrMap = Object.fromEntries(engToGr.map(i => [i.en, i.gr]));

const DEFAULT_TEMP = 273

let elementData, spectrumData;

let currentVisualizer = {
    params: null,
    action: null
};

let temp = DEFAULT_TEMP;

let cachedTableElements = null;

function getTableElements(includeCloseUp = true) {
    if (!cachedTableElements) {
        const elements = [...document.querySelectorAll('.element')];

        const closeUp = document.getElementById('CloseUp');
        const closeUp2 = document.getElementById('CloseUp2');

        if (closeUp) elements.push(closeUp);
        if (closeUp2) elements.push(closeUp2);

        cachedTableElements = elements;
    }

    return includeCloseUp
        ? cachedTableElements
        : cachedTableElements.filter(el => !el.id?.startsWith('CloseUp'));
}

function displayDataOnElement(dataMap, prop, sliceNum, convertFunc) {
    getTableElements().forEach(el => {
        const key = el.dataset.atomic || el.getAttribute('data-linkedElement');
        const cell = el.querySelector('data');
        if (!cell) return;

        let value = helpers.getNestedValue(dataMap?.[key], prop);
        if (value === '' || value === undefined) value = '--';

        if (sliceNum != null) {
            if (typeof value === 'string' || Array.isArray(value)) {
                value = value.slice(0, sliceNum);
            } else if (typeof value === 'number') {
                value = parseFloat(String(value).slice(0, sliceNum));
                if (Number.isNaN(value)) value = 0;
            }
        }

        const displayValue = convertFunc ? convertFunc(value) : value;

        if (cell.textContent !== String(displayValue)) {
            cell.textContent = displayValue;
        }
    });
}

function showBlocks(show) {
    if (!show) return;

    getTableElements().forEach(el => {
        const key = el.dataset.atomic;
        const data = elementData[key];
        if (!data) return;

        const val = helpers.getBlock(data);

        el.querySelector('data').textContent = String(val);
    });
}

function showState(show, temp) {
    if (!show) return;

    const phases = ['solid', 'liquid', 'gas', 'unknownState'];

    for (const el of getTableElements()) {
        const data = elementData[el.dataset.atomic];
        const phase = helpers.getPhase(data.melt, data.boil, temp);

        if (el.classList.contains(phase)) continue;

        const dataText = el.querySelector('data');
        const text = engToGrMap[phase] ?? 'Άγνωστη';

        el.style.background = `var(--${phase})`;

        el.classList.remove(...phases);
        el.classList.add(phase);

        if (dataText && dataText.textContent !== text) {
            dataText.textContent = text;
        }
    }
}

function showSpectralAnalysis(show) {
    if (!show) return;

    //periodicTable.classList.add('other')
    getTableElements().forEach(el => {
        const key = el.dataset.atomic;
        const data = elementData?.[key];
        const img = data ? spectrumData?.[data.symbol?.toLowerCase()] : null;
        if (img) {
            el.style.background = `url(${img})`;
            el.style.backgroundSize = '100% 100%';
        } else {
            el.style.background = 'var(--unknown)';
        }
    });
}

function visualize(array, prop, useLog = false, displayData = true, minColor = 'rgba(8, 212, 170, 0)', maxColor = 'rgba(8, 212, 170, 0.75)', radial = false, show = true) {
    const elements = getTableElements();
    if (!show || !array || !prop) {
        elements.forEach(el => (el.style.background = ''));
        return;
    }

    if (useLog) {
        document.getElementById('logarithmic').checked = true;
    } else {
        document.getElementById('Linear').checked = true;
    }

    const getValue = el => {
        const key = el.dataset.atomic || el.getAttribute('data-linkedElement');
        const raw = helpers.getNestedValue(array[key], prop);

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

    document.getElementById('rangeGradient').style.background = `linear-gradient(to top, ${maxColor}, ${minColor})`;

    if (displayData) displayDataOnElement(array, prop, 7, x => x.toLocaleString('el-GR'));

    mapped.forEach(({ el, val }) => {
        if (isNaN(val)) {
            //el.querySelector('data').textContent = '';
            el.style.background = `rgba(${unknownColor.join(',')})`;
            return;
        }

        const v = toScale(val);
        const t = (v - minVal) / span;

        const rgba = helpers.lerpColor(`${minColor}`, `${maxColor}`, t);

        if (!radial) {
            el.style.background = rgba;
        } else {
            const max = Math.max(...data.map(d => d.val))
            el.style.background = `
                radial-gradient(
                    circle,
                    ${maxColor} ${((val / max) * 50)}%,
                    rgba(241, 241, 241, 0.1) ${((val / max) * 50) + 10}%
                )
            `;
        }
    });
}

function visualizeOptionFunc(option) {
    const [value, value2] = option.split("-");
    currentVisualizer = { params: null, action: null };

    //periodicTable.classList = '';
    //periodicTable.classList.add(value);

    periodicTable.dataset.mode = value;
    getTableElements(false).forEach(el => { el.classList.remove('radioactive') });
    //<array, prop, propKey, useLog = false, displayData = true, minColor = 'rgba(8, 212, 170, 0)', 'rgba(8, 212, 170, 0.75)', radial, show>
    const config = {
        'category': {},
        'blocks': { action: () => showBlocks(true) },
        'state': { action: () => showState(true, temp) },
        'SpectralAnalysis': {
            action: () => {
                showSpectralAnalysis(true);
                periodicTable.dataset.mode = "other";
            }
        },
        'atomicMass': { params: [elementData, 'atomicMass', false, true, 'rgba(8, 212, 170, 0)', 'rgba(8, 212, 170, 0.75)'] }, // u
        'meltPoint': { params: [elementData, 'melt', false, true, 'rgba(50, 100, 255, 0.01)', 'rgba(0, 255, 255, 0.75)'] }, // K
        'boilPoint': { params: [elementData, 'boil', false, true, 'rgba(255, 100, 50, 0.01)', 'rgba(255, 0, 0, 0.75)'] }, // K
        'density': { params: [elementData, 'density', false, true, 'rgba(8, 212, 170, 0)', 'rgba(8, 212, 170, 0.75)'] }, // kg/m3
        'electronegativity': { params: [elementData, 'electronegativity', true, true, 'rgba(0, 60, 240, 0.75)', 'rgba(175, 193, 0, 0.75)'] },
        'electronAffinity': { params: [elementData, 'electronAffinity', true, true, 'rgba(200, 0, 200, 0)', 'rgba(200, 0, 200, 0.75)'] }, // kJ/mol
        'ionization': { params: [elementData, 'ionizationEnergy', true, true, 'rgba(8, 212, 170, 0)', 'rgba(175, 193, 0, 0.75)'] }, // kJ/mol
        'radius': { params: [elementData, 'atomicRadius', false, true, 'rgba(43, 125, 125, 0)', 'rgba(43, 125, 125, 0.75)', true] }, // pm
        'valence': { params: [elementData, 'valence', false, true, 'rgba(100, 125, 255, 0.75)', 'rgba(255, 16, 16, 0.75)'] },
        'heat': { params: [elementData, 'heatCap', true, true, 'rgba(72, 138, 118, 0.75)', 'rgba(255, 69, 69, 0.75)'] }, // J/kgK
        'thermalConductivity': { params: [elementData, 'thermalConductivity', false, true, 'rgba(69, 165, 255, 0)', 'rgba(69, 165, 255, 0.75)'] }, // W/mK
        'energyLevels': {
            action: () => {
                const calculated = {};
                Object.entries(elementData).forEach(([key, el]) => {
                    const period = Number(el.period);
                    const shells = helpers.energyLevels(el.electronConfiguration) ?? [];
                    const idx = period - 1;
                    const electrons = shells[idx] ?? 0;
                    (calculated[key] ??= { Total: 0 }).Total += electrons;
                });
                let params = [calculated, 'Total', false, false, 'rgba(133, 173, 49, 0)', 'rgba(133, 173, 49, 0.75)'];
                displayDataOnElement(
                    elementData,
                    'electronConfiguration',
                    null,
                    x => {
                        const levels = helpers.energyLevels(x);
                        const last3 = levels.slice(-3);
                        return (levels.length > 3
                            ? ['-'].concat(last3)
                            : last3)
                            .join(' ');
                    }
                );
                return params;
            }
        },
        'configuration': {
            action: () => {
                const calculated = {};
                Object.entries(elementData).forEach(([key, el]) => {
                    (calculated[key] ??= { Total: 0 }).Total += helpers.lastElectronCount(el.electronConfiguration);
                });
                let params = [calculated, 'Total', false, false, 'rgba(133, 173, 49, 0)', 'rgba(133, 173, 49, 0.75)'];
                displayDataOnElement(
                    elementData,
                    'electronConfiguration',
                    null,
                    x => {
                        const last3 = x.slice(-8);
                        return (last3);
                    }
                );
                return params;
            }
        },
        'oxidationStates': {
            action: () => {
                const calculated = {};
                Object.entries(elementData).forEach(([key, el]) => {
                    const ox = el.oxidation
                        ?.replaceAll('c', '')
                        .split(',')
                        .map(val => val === '' ? '' : Number(val)) ?? [];

                    const oxidationState = (!ox || ox.length === 0 || ox.includes('')) ? '' : ox.reduce((acc, val) => acc + val, 0);

                    (calculated[key] ??= { Total: '' }).Total += (oxidationState);
                });

                let params = [calculated, 'Total', false, false, 'rgba(100, 125, 255, 0.75)', 'rgba(255, 16, 16, 0.75)'];
                displayDataOnElement(
                    elementData,
                    'oxidation',
                    null,
                    x => {
                        return helpers.getRepresentativeOxidation(x);
                    }
                );
                return params;
            }
        },
        'discoveryDate': {
            params: [elementData, 'discovered', false, false, 'rgba(43, 125, 125, 0)', 'rgba(43, 125, 125, 0.75)'],
            action: () => {
                displayDataOnElement(elementData, 'discovered', null, helpers.formatGreekDate);
            },
        },
        'abundance': {
            action: () => {
                displayDataOnElement(elementData, `elementAbundance.${value2}`, null, x => `${x}%`);
            },
            params: [elementData, `elementAbundance.${value2}`, true, false, 'rgba(43, 125, 125, 0)', 'rgba(43, 125, 125, 0.75)']
        },
        'radioactiveEl': {
            action: () => {
                displayDataOnElement(elementData, `radioactive`, null, x => `${'Ραδιεν.'}`);
                const elements = getTableElements();
                elements.forEach(el => {
                    if (elementData[el.dataset.atomic]?.radioactive) {
                        el.classList.add('radioactive');
                    }
                })
                //periodicTable.classList.add('other')
                periodicTable.dataset.mode = "other";
            },
            params: [elementData, `radioactive`, false, false, 'rgba(156, 137, 52, 0.75)']
        },
        'atomicVolume': { // cm3/mol
            action: () => {
                const calculated = {};
                Object.entries(elementData).forEach(([key, el]) => {
                    (calculated[key] ??= { Total: 0 }).Total = ((el.atomicMass / 1000) / el.density) * 1e6;
                });

                return [calculated, 'Total', true, true, 'rgba(133, 173, 49, 0)', 'rgba(133, 173, 49, 0.75)'];
            }
        },
    };

    const selected = config[value];
    visualize();

    if (value2 && selected?.params) {
        const clonedParams = [...selected.params];
        if (typeof clonedParams[2] === 'string') {
            clonedParams[2] = `${clonedParams[2]}.${value2}`;
        }
        currentVisualizer.params = clonedParams;
    }

    if (selected) {
        currentVisualizer.action = selected.action || null;

        if (selected.action) {
            let params = selected.action();
            if (params) {
                currentVisualizer.params = params
            }
        }
        if (selected.params && !currentVisualizer.params) {
            currentVisualizer.params = selected.params;
        }
    }

    if (!currentVisualizer.params && !selected?.action) {
        displayDataOnElement(elementData, 'category');
    }

    if (currentVisualizer.params) {
        visualize(...currentVisualizer.params);
    }
}

function updateVisualizer(LogMode) {
    if (currentVisualizer.action) {
        currentVisualizer.action();
    }
    if (!currentVisualizer.params && !currentVisualizer?.action) {
        displayDataOnElement(elementData, 'category');
    }
    if (currentVisualizer.params) {
        if (LogMode != null) {
            currentVisualizer.params[2] = LogMode;
        }
        visualize(...currentVisualizer.params);
    }
}

function createElectron(x, y, transform = '') {
    const electron = document.createElement('div');
    electron.className = 'electron';
    electron.style.top = `${y}px`;
    electron.style.left = `${x}px`;
    if (transform) electron.style.transform = transform;
    return electron;
}

function generateAtom(atomicNumber, threeD) {
    const atomContainer = document.getElementById('atom');
    const atomCore = atomContainer.querySelector('.atom');

    const element = elementData[atomicNumber];
    if (!element) {
        console.error('Atomic number not found in the data.');
        return;
    }

    atomCore.textContent = '';
    atomCore.insertAdjacentHTML('afterbegin', `<span>${element.symbol}</span>`);

    const fragment = document.createDocumentFragment();
    const energyLevels = helpers.energyLevels(element.electronConfiguration);

    energyLevels.forEach((numElectrons, index) => {
        if (!Number.isFinite(numElectrons) || numElectrons <= 0) return;

        const energyLevelDiv = document.createElement('div');
        const radius = (index + 2.5) * 9;
        const animationSpeed = radius / 2;

        energyLevelDiv.className = 'energy-level';
        energyLevelDiv.style.width = `${radius * 2}px`;
        energyLevelDiv.style.height = `${radius * 2}px`;
        energyLevelDiv.style.animation = `${threeD ? 'spin3d' : 'spin'} ${animationSpeed}s linear infinite`;

        if (threeD === 2) {
            energyLevelDiv.style.border = 'none';
        }

        const angleStep = 360 / numElectrons;

        for (let i = 0; i < numElectrons; i++) {
            const angle = angleStep * i - 90;
            const rad = angle * Math.PI / 180;

            const x = radius * Math.cos(rad) + radius - 5;
            const y = radius * Math.sin(rad) + radius - 5;

            energyLevelDiv.appendChild(
                createElectron(x, y)
            );

            if (threeD) {
                energyLevelDiv.appendChild(
                    createElectron(x, y, 'translate(40%, 40%) rotateY(90deg)')
                );
                energyLevelDiv.appendChild(
                    createElectron(x, y, 'translate(40%, 40%) rotateX(90deg)')
                );
            }
        }

        fragment.appendChild(energyLevelDiv);
    });

    atomCore.appendChild(fragment);
}

function updateCloseUp(atomicNumber, closeUp) {
    const atomic = closeUp.querySelector('.closeUp-atomic');
    const symbol = closeUp.querySelector('.closeUp-shortName');
    const name = closeUp.querySelector('.closeUp-name');
    const energyLevel = closeUp.querySelector('small');

    energyLevel.innerHTML = '';
    atomic.textContent = atomicNumber;
    name.textContent = elementData[atomicNumber].name;
    symbol.textContent = elementData[atomicNumber].symbol;


    closeUp.className = '';
    closeUp.classList.add(elementData[atomicNumber].category);
    closeUp.classList.add(helpers.getBlock(elementData[atomicNumber]));
    if (elementData[atomicNumber]?.radioactive) {
        closeUp.classList.add('radioactive');
    }

    for (const level of helpers.energyLevels(elementData[atomicNumber].electronConfiguration)) {
        let spanElement = document.createElement('span');
        spanElement.textContent = level;
        energyLevel.appendChild(spanElement);
    }
}

function showElementData(atomicNumber) {
    const closeUp = document.getElementById('CloseUp');
    const closeUp2 = document.getElementById('CloseUp2');

    closeUp.setAttribute('data-atomic', atomicNumber);
    closeUp2.setAttribute('data-atomic', atomicNumber);

    updateCloseUp(atomicNumber, closeUp);
    updateVisualizer();
    generateAtom(atomicNumber, URLUtils.readParam('a3'));
    helpers.adjustElementsText('#CloseUp', 'em', 65);
}

function openLinkInIframe(atomicNumber) {
    const sitePopup = document.getElementById('sitePopup');
    const sitePopupSearchBar = document.getElementById('sitePopupSearchBar');
    let link;

    function closePopup() {
        sitePopup.querySelector('iframe').src = '';
        sitePopup.style.display = "none";
        sitePopup.querySelector('.close-btn').removeEventListener('click', closePopup);
    }

    link = 'https://el.wikipedia.org/wiki/' + elementData[atomicNumber].wiki + '?withgadget=dark-mode';
    sitePopup.querySelector('iframe').src = link;
    sitePopupSearchBar.value = link;

    sitePopup.style.display = "block";
    sitePopup.querySelector('.close-btn').addEventListener('click', closePopup);
    sitePopup.addEventListener('click', (e) => {
        if (e.target === sitePopup) {
            closePopup();
        }
    });
}

function infoElement(atomicNumber) {
    const infoPopup = document.getElementById('infoPopup');
    const popupData = infoPopup.querySelector('.popup-data');
    const wikipediaLink = infoPopup.querySelector('.popup-wikipediaLink');
    const downloadPDF = infoPopup.querySelector('.popup-pdfDownload');

    const closeUp = document.getElementById('CloseUp');

    const closeUp2 = document.getElementById('CloseUp2');
    updateCloseUp(atomicNumber, closeUp2);
    //closeUp2.style.background = closeUp.style.background;
    //closeUp2.classList = closeUp.classList;

    const data = elementData[atomicNumber];
    const spectrumImg = spectrumData[data.symbol.toLowerCase()] || '';

    const wikipediaIframeOpen = () => openLinkInIframe(atomicNumber);

    wikipediaLink.href = `https://el.wikipedia.org/wiki/${data.wiki}`;
    downloadPDF.href = `https://el.wikipedia.org/api/rest_v1/page/pdf/${data.wiki}`;

    popupData.innerHTML = '';

    const createData = (title, value, customValueTag) => {
        const dataTag = customValueTag ? value : `<h3>${value}</h3>`
        popupData.insertAdjacentHTML('beforeend', `
            <fieldset>
                <legend><b>${title}</b></legend>
                ${dataTag}
            </fieldset>
        `);
    };

    function closePopup() {
        infoPopup.style.display = "none";
        wikipediaLink.href = downloadPDF.href = '';
        closeUp2.removeEventListener('click', wikipediaIframeOpen);
        infoPopup.querySelector('.close-btn').removeEventListener('click', closePopup);
    }

    const fields = [
        ['Ονομα', data.name || '--'],
        ['Ατομικός', data.atomic || '--'],
        ['Βάρος', `${data.atomicMass || '--'} u`],
        ['Κατηγορία', engToGrMap[data.category] ?? "Άγνωστη κατηγορία"],
        ['Τομέας', helpers.getBlock(data) || '--'],

        ['Ηλεκτρονική δομή', helpers.energyLevels(data.electronConfiguration).join(', ') || '--'],
        ['Ιονισμός', `${data.ionizationEnergy || '--'} kJ/mol`],
        ['Φασματική εκπομπή', spectrumImg ? `<img src='${spectrumImg}'>` : '--', spectrumImg ? true : false],

        ['Ομάδα', data.group || '--'],
        ['Περίοδος', data.period || '--'],

        ['Σημείο τήξης', `${data.melt || '--'} K`],
        ['Σημείο ζέσεως', `${data.boil || '--'} K`],
        ['Θερμότητα', `${data.heatCap || '--'} J/kgK`],
        ['Θερμική Αγωγιμότητα', `${data.thermalConductivity || '--'} W/mK`],
        ['Ακτίνα', `${data.atomicRadius || '--'} pm`],
        ['Πυκνότητα', `${data.density || '--'} kg/m<sup>3</sup>`],
        ['Ατομικός όγκος', `${((((data.atomicMass / 1000) / data.density) * 1e6)).toPrecision(3) || '--'} cm<sup>3</sup>/mol`],

        ['Διαμόρφωση', data.electronStringConf || '--'],
        ['Σθενότητα', `${data.valence || '--'}`],
        ['Κατάσταση οξείδωσης', `${data.oxidation?.replace(/c/g, '').replace(/,/g, ' ') || '--'}`],
        ['Ηλεκτραρνητικότητα', data.electronegativity || '--'],
        ['Ηλεκτροσυγγένεια', `${data.electronAffinity || '--'} kJ/mol`],

        ['Ανακαλύφθηκε', helpers.formatGreekDate(data.discovered) || '--']
    ];

    if (data.radioactive) {
        popupData.insertAdjacentHTML('beforeend', `
            <div class="radioactive">
                <h3><b>Ραδιενεργό</b></h3>
            </div>
        `);
    }

    fields.forEach(([i, j, k]) => createData(i, j, k));

    closeUp2.addEventListener('click', wikipediaIframeOpen);
    infoPopup.querySelector('.close-btn').addEventListener('click', closePopup);
    infoPopup.addEventListener('click', (e) => {
        if (e.target === infoPopup) {
            closePopup();
        }
    });
    infoPopup.style.display = "block";
}

function tempChanged(k) {
    temp = k;
    updateVisualizer();
}

function onDataLoaded(element, spectrum) {
    elementData = Object.freeze(element);
    spectrumData = Object.freeze(spectrum);
    if (!element) return;
    showElementData(
        elementData[URLUtils.readParam('SelectedElement')]
            ? URLUtils.readParam('SelectedElement')
            : 1
    );

    temp = URLUtils.readParam('temp') ? URLUtils.readParam('temp') : DEFAULT_TEMP
    updateTemperatureInputs(null, temp)

    visualizeOptionFunc(URLUtils.readParam('visualizeOption') || "category");
    document.getElementById('visualizeOption').value = URLUtils.readParam('visualizeOption') || "category";

    helpers.adjustElementsText('.element', 'em', 60);
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('darkMode');
    document.documentElement.classList.remove('lightMode');
} else {
    document.documentElement.classList.add('lightMode');
    document.documentElement.classList.remove('darkMode');
}

export {
    onDataLoaded,
    visualizeOptionFunc,
    updateVisualizer,
    showElementData,
    infoElement,
    tempChanged
};