import {
	visualize,
	visualizeOptionFunc,
	showElementData,
	infoElement,
	tempChanged,
	visualizationParams,
	closeUp
} from './Main.js'

import * as URLUtils from './UtilsAndLib/UrlParamsUtils.js'
import * as helpers from './UtilsAndLib/helpers.js'

const tempNumberInputC = document.getElementById('tempNumInputC');
const tempNumberInputK = document.getElementById('tempNumInputK');
const tempRangeSlider = document.getElementById('temp');

const K2C = k => k - 273;
const C2K = c => c + 273;

const visOption = document.getElementById('visualizeOption');

export function initEvents() {
	document.getElementById('propertyKey').addEventListener('change', () => {
		const selected = document.getElementById('propertyKey').querySelector('input[name="scale"]:checked');
		if (selected) {
			if (visualizationParams) {
				visualizationParams[3] = selected.value === 'log' && true || false
				visualize(...visualizationParams);
			}
		}
	});

	visOption.addEventListener('change', () => {
		visualizeOptionFunc();
		URLUtils.setParam('visualizeOption', visOption.value);
	});

	['temp', 'tempNumInputC', 'tempNumInputK'].forEach(id =>
		document.getElementById(id).addEventListener('input', (e) => {
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
			tempChanged(k);
		})
	);

	document.addEventListener('click', (event) => {
		if (event.target.matches('.element')) {
			const elementClickedAtomic = event.target.getAttribute('data-linkedElement') || event.target.getAttribute('data-atomic');

			showElementData(elementClickedAtomic);
			URLUtils.setParam("SelectedElement", elementClickedAtomic);
		}
	});

	closeUp.addEventListener('click', (event) => {
		const elementClickedAtomic = event.target.getAttribute('data-atomic');
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