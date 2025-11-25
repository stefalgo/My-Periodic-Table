import * as URLUtils from './UtilsAndLib/UrlParamsUtils.js'
import * as helpers from './UtilsAndLib/helpers.js'
import { updateTemperatureInputs } from './Events.js';

const closeUp = document.getElementById('CloseUp');
const visualizeOption = document.getElementById('visualizeOption');
const periodicTable = document.getElementById('periodicTable');

let elementData, spectrumData;

let currentVisualizer = {
    params: null,
    action: null
};

let temp = 273;

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

function openLinkInIframe(rowId) {
    const sitePopup = document.getElementById('sitePopup');
    let link;

    function closePopup() {
        sitePopup.querySelector('iframe').src = '';
        sitePopup.style.display = "none";
        sitePopup.querySelector('.close-btn').removeEventListener('click', closePopup);
    }

    link = 'https://el.wikipedia.org/wiki/' + elementData[rowId].wiki + '?withgadget=dark-mode';
    sitePopup.querySelector('iframe').src = link;

    sitePopup.style.display = "block";
    sitePopup.querySelector('.close-btn').addEventListener('click', closePopup);
    sitePopup.addEventListener('click', (e) => {
        if (e.target === sitePopup) {
            closePopup();
        }
    });
}

function getTableElements() {
    return [
        ...document.querySelectorAll('.element'),
        ...document.querySelectorAll('#CloseUp')
    ];
}

function displayDataOnElement(dataMap, prop, sliceNum, convertFunc) {
    const elements = getTableElements();

    elements.forEach(el => {
        const key =
            el.getAttribute('data-atomic') ||
            el.getAttribute('data-linkedElement');

        const cell = el.querySelector('data');
        if (!cell) return;

        let value = helpers.getNestedValue(dataMap[key], prop);
        if (value === '' || value === undefined) {
            cell.textContent = '--';
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

        const val = helpers.getBlock(data);

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
        const key = el.getAttribute('data-atomic') || el.getAttribute('data-linkedElement');
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

    //<array, prop, propKey, useLog = false, displayData = true, minColor = 'rgba(8, 212, 170, 0)', 'rgba(8, 212, 170, 0.75)', radial, show>
    const config = {
        'category': {},
        'blocks': { action: () => showBlocks(true) },
        'state': { action: () => showState(true, temp) },
        'atomicMass': { params: [elementData, 'atomicMass', false, true, 'rgba(8, 212, 170, 0)', 'rgba(8, 212, 170, 0.75)'] },
        'meltPoint': { params: [elementData, 'melt', false, true, 'rgba(50, 100, 255, 0.01)', 'rgba(0, 255, 255, 0.75)'] },
        'boilPoint': { params: [elementData, 'boil', false, true, 'rgba(255, 100, 50, 0.01)', 'rgba(255, 0, 0, 0.75)'] },
        'density': { params: [elementData, 'density', false, true, 'rgba(8, 212, 170, 0)', 'rgba(8, 212, 170, 0.75)'] },
        'electronegativity': { params: [elementData, 'electronegativity', true, true, 'rgba(0, 60, 240, 0.75)', 'rgba(175, 193, 0, 0.75)'] },
        'electronAffinity': { params: [elementData, 'electronAffinity', true, true, 'rgba(200, 0, 200, 0)', 'rgba(200, 0, 200, 0.75)'] },
        'ionization': { params: [elementData, 'ionizationEnergy', true, true, 'rgba(8, 212, 170, 0)', 'rgba(175, 193, 0, 0.75)'] },
        'radius': { params: [elementData, 'atomicRadius', false, true, 'rgba(43, 125, 125, 0)', 'rgba(43, 125, 125, 0.75)', true] },
        'valence': { params: [elementData, 'valence', false, true, 'rgba(100, 125, 255, 0.75)', 'rgba(255, 16, 16, 0.75)'] },
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
            params: [elementData, 'elementAbundance', true, false, 'rgba(43, 125, 125, 0)', 'rgba(43, 125, 125, 0.75)']
        },
    };

    const selected = config[value];
    periodicTable.classList = '';
    periodicTable.classList.add(value);
    showBlocks(false);
    showState(false);
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

function generateAtom(atomicNumber) {
    const atomContainer = document.getElementById('atom');
    const atomCore = atomContainer.querySelector('.atom');
    if (!elementData[atomicNumber]) { console.error('Atomic number not found in the data.'); return; }
    atomCore.innerHTML = '';
    helpers.energyLevels(elementData[atomicNumber].electronConfiguration).forEach((numElectrons, index) => {
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
    closeUp.classList.add(helpers.getBlock(elementData[elementAtomicNumber]));
    elementData[elementAtomicNumber].radioactive ? closeUp.classList.add('radioactive') : '';
    closeUp.setAttribute('data-atomic', elementAtomicNumber)

    updateVisualizer();

    for (const level of helpers.energyLevels(elementData[elementAtomicNumber].electronConfiguration)) {
        let spanElement = document.createElement('span');
        spanElement.textContent = level;
        energyLevel.appendChild(spanElement);
    }

    generateAtom(elementAtomicNumber);
    helpers.adjustElementsText('#CloseUp', 'em', 65);
}

function infoElement(elementAtomicNumber) {
    const infoPopup = document.getElementById('infoPopup');
    const popupData = infoPopup.querySelector('.popup-data');
    const wikipediaLink = infoPopup.querySelector('.popup-wikipediaLink');
    const downloadPDF = infoPopup.querySelector('.popup-pdfDownload');
    const closeUp2 = () => {
        const clone = closeUp.cloneNode(true);
        document.getElementById('CloseUp2').innerHTML = '';
        document.getElementById('CloseUp2').appendChild(clone);
        return clone;
    };

    const element = elementAtomicNumber;
    const data = elementData[element];
    const spectrumImg = spectrumData[data.symbol.toLowerCase()] || '';

    const wikipediaIframeOpen = () => openLinkInIframe(element);

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
        closeUp2().removeEventListener('click', wikipediaIframeOpen);
        infoPopup.querySelector('.close-btn').removeEventListener('click', closePopup);
    }

    const fields = [
        ['Ονομα', data.name || '--'],
        ['Ατομικός', data.atomic || '--'],
        ['Βάρος', `${data.atomicMass || '--'} u`],
        ['Κατηγορία', engToGr.find(c => c.en === data.category)?.gr ?? "Άγνωστη κατηγορία"],
        ['Τομέας', helpers.getBlock(data) || '--'],

        ['Ηλεκτρονική δομή', helpers.energyLevels(data.electronConfiguration).join(', ') || '--'],
        ['Ιονισμός', `${data.ionizationEnergy || '--'} kJ/mol`],
        ['Φασματική ανάλυση', spectrumImg ? `<img src='${spectrumImg}'>` : '--', spectrumImg ? true : false],

        ['Ομάδα', data.group || '--'],
        ['Περίοδος', data.period || '--'],

        ['Σημείο τήξης', `${data.melt || '--'} K`],
        ['Σημείο ζέσεως', `${data.boil || '--'} K`],
        ['Ακτίνα', `${data.atomicRadius || '--'} pm`],
        ['Πυκνότητα', `${data.density || '--'} kg/m<sup>3</sup>`],

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

    closeUp2().addEventListener('click', wikipediaIframeOpen);
    infoPopup.querySelector('.close-btn').addEventListener('click', closePopup);
    infoPopup.addEventListener('click', (e) => {
        if (e.target === infoPopup) {
            closePopup();
        }
    });
    infoPopup.style.display = "block";
}

function toggleColorScheme() {
    document.documentElement.classList.toggle('darkMode');
    document.documentElement.classList.toggle('lightMode');
}

function tempChanged(k) {
    temp = k;
    updateVisualizer();
}

function onDataLoaded(element, spectrum) {
    elementData = element
    spectrumData = spectrum
    if (!element) return;
    showElementData(
        elementData[URLUtils.readParam('SelectedElement')]
            ? URLUtils.readParam('SelectedElement')
            : 1
    );

    temp = URLUtils.readParam('temp') ? URLUtils.readParam('temp') : temp
    updateTemperatureInputs(null, temp)

    visualizeOptionFunc(URLUtils.readParam('visualizeOption') || "category");
    visualizeOption.value = URLUtils.readParam('visualizeOption') || "category";

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
    toggleColorScheme,
    tempChanged
};