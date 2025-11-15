import {
	visualizeOptionFunc,
	updateVisualizer,
	showElementData,
	infoElement,
	tempChanged,
} from './Main.js'

import * as URLUtils from './UtilsAndLib/UrlParamsUtils.js'
import * as helpers from './UtilsAndLib/helpers.js'

const tempNumberInputC = document.getElementById('tempNumInputC');
const tempNumberInputK = document.getElementById('tempNumInputK');
const tempRangeSlider = document.getElementById('temp');

const closeUp = document.getElementById('CloseUp');
const visOption = document.getElementById('visualizeOption');

const debouncedTempSetParam = ((delay) => {
    let t;
    return (value) => {
        clearTimeout(t);
        t = setTimeout(() => URLUtils.setParam("temp", value), delay);
    };
})(300);

export function updateTemperature(from, value) {
    let k, c;

    if (from === "slider") {
        k = Number(value);
        c = helpers.KelvinToCelsius(k);
        tempNumberInputK.value = k;
        tempNumberInputC.value = c;
    } 
    else if (from === "kelvin") {
        k = Number(value);
        c = helpers.KelvinToCelsius(k);
        tempRangeSlider.value = k;
        tempNumberInputC.value = c;
    } 
    else if (from === "celcius") {
        c = Number(value);
        k = helpers.CelsiusToKelvin(c);
        tempRangeSlider.value = k;
        tempNumberInputK.value = k;
    } else {
		k = Number(value);
		c = helpers.KelvinToCelsius(k);
		tempRangeSlider.value = k;
        tempNumberInputK.value = k;
        tempNumberInputC.value = c;
	}

    tempChanged(k);
}

export function initEvents() {
	document.getElementById('propertyKey').addEventListener('change', () => {
		const selected = document.getElementById('propertyKey').querySelector('input[name="scale"]:checked');
		if (selected) {
			updateVisualizer(selected.value === 'log' && true || false);
		}
	});

	visOption.addEventListener('change', () => {
		visualizeOptionFunc(visOption.value);
		URLUtils.setParam('visualizeOption', visOption.value);
	});

	['temp', 'tempNumInputC', 'tempNumInputK'].forEach(id =>
		document.getElementById(id).addEventListener('input', (e) => {

			const rawValue = e.target.value || 0;
			debouncedTempSetParam(
				(e.target === tempRangeSlider || e.target === tempNumberInputK)
					? rawValue
					: helpers.CelsiusToKelvin(rawValue)
			);

			if (e.target === tempRangeSlider) {
				updateTemperature("slider", rawValue);
			} else if (e.target === tempNumberInputK) {
				updateTemperature("kelvin", rawValue);
			} else {
				updateTemperature("celcius", rawValue);
			}
		})
	);

	document.querySelectorAll('.element').forEach(el => {
		el.addEventListener('click', () => {
			const elementClickedAtomic = el.getAttribute('data-linkedElement') || el.getAttribute('data-atomic');

			showElementData(elementClickedAtomic);
			URLUtils.setParam("SelectedElement", elementClickedAtomic);
		});
	});

	closeUp.addEventListener('click', () => {
		const elementClickedAtomic = closeUp.getAttribute('data-atomic');
		infoElement(elementClickedAtomic);
	});

	document.getElementById("searchbar").addEventListener("input", function () {
		let rawInput = this.value.trim().toLowerCase();
		let searchTerms = rawInput
			.split(/\s*(?:,)\s*/i) // Split by "," or "and"
			.filter(term => term !== "")
			.map(term => helpers.removeDiacritics(term));

		let items = document.querySelectorAll(".element");

		items.forEach(item => {
			let atomicValue = helpers.removeDiacritics(item.getAttribute("data-atomic") || "");
			let emElement = item.querySelector("em");
			let abbrElement = item.querySelector("abbr");

			let abbrElementText = abbrElement ? helpers.removeDiacritics(abbrElement.textContent.trim().toLowerCase()) : "";
			let emText = emElement ? helpers.removeDiacritics(emElement.textContent.trim().toLowerCase()) : "";

			if (searchTerms.length === 0) {
				item.classList.remove("highlight");
				return;
			}

			let matched = searchTerms.some(term =>
				atomicValue === term ||
				abbrElementText === term ||
				emText.includes(term)
			);

			if (matched) {
				item.classList.add("highlight");
			} else {
				item.classList.remove("highlight");
			}
		});
	});
};