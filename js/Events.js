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

const tempNumberInputC = document.getElementById('tempNumInputC');
const tempNumberInputK = document.getElementById('tempNumInputK');
const tempRangeSlider = document.getElementById('temp');

const K2C = k => k - 273.15;
const C2K = c => c + 273.15;

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

	visualizeOption.addEventListener('change', () => {
		visualizeOptionFunc();
		URLUtils.setParam('visualizeOption', visualizeOption.dataset.selected);
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
			.map(term => removeDiacritics(term));

		let items = document.querySelectorAll(".element");

		items.forEach(item => {
			let atomicValue = removeDiacritics(item.getAttribute("data-atomic") || "");
			let emElement = item.querySelector("em");
			let abbrElement = item.querySelector("abbr");

			let abbrElementText = abbrElement ? removeDiacritics(abbrElement.textContent.trim().toLowerCase()) : "";
			let emText = emElement ? removeDiacritics(emElement.textContent.trim().toLowerCase()) : "";

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

	document.querySelectorAll('.dropdown').forEach(drop => {
		const current = drop.querySelector('.dropdown-current');
		const toggle = drop.querySelector('#dropdown-toggle');
		const radios = drop.querySelectorAll('input[type=radio]');

		const valueOf = r => {
			const sub = r.parentElement.querySelector('select');
			return sub ? `${r.value}-${sub.value}` : r.value;
		};

		const labelOf = r => {
			const labelText = [...r.parentElement.childNodes]
				.filter(n => n.nodeType === 3 && n.textContent.trim())[0]
				.textContent.trim();
			const sub = r.parentElement.querySelector('#subOptions');
			return sub
				? `${labelText} > ${sub.options[sub.selectedIndex].textContent.trim()}`
				: labelText;
		};

		const setCurrent = r => {
			drop.dataset.selected = valueOf(r);
			current.textContent = labelOf(r);
			toggle.checked = false;
		};

		const [wantRadio, wantSub] = (drop.dataset.selected || "").split("-");
		let init = [...radios].find(r => r.value === wantRadio);

		if (init) {
			const s = init.parentElement.querySelector('#subOptions');
			if (s && wantSub) s.value = wantSub;
		} else {
			init = radios[0];
		}

		init.checked = true;
		setCurrent(init);

		radios.forEach(r => {
			r.addEventListener('change', () => setCurrent(r));
			r.addEventListener('click', () => setCurrent(r));

			const sub = r.parentElement.querySelector('#subOptions');
			if (sub) sub.addEventListener('change', () => r.checked && setCurrent(r));
		});

		document.addEventListener('click', e => {
			if (!drop.contains(e.target)) toggle.checked = false;
		});
	});
};