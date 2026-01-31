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

export function updateTemperatureInputs(from, value) {
	let k, c;
	switch (from) {
		case "slider": {
			k = Number(value);
			c = helpers.KelvinToCelsius(k);
			tempNumberInputK.value = k;
			tempNumberInputC.value = c;
			break;
		}
		case "kelvin": {
			k = Number(value);
			c = helpers.KelvinToCelsius(k);
			tempRangeSlider.value = k;
			tempNumberInputC.value = c;
			break;
		}
		case "celsius": {
			c = Number(value);
			k = helpers.CelsiusToKelvin(c);
			tempRangeSlider.value = k;
			tempNumberInputK.value = k;
			break;
		}
		default: {
			k = Number(value);
			c = helpers.KelvinToCelsius(k);
			tempRangeSlider.value = k;
			tempNumberInputK.value = k;
			tempNumberInputC.value = c;
		}
	}

	tempChanged(k);
}

export function initEvents() {
	const propertyKeyEl = document.getElementById('propertyKey');
	if (propertyKeyEl) {
		propertyKeyEl.addEventListener('change', () => {
			const selected = propertyKeyEl.querySelector('input[name="scale"]:checked');
			if (selected) {
				updateVisualizer(selected.value === 'log');
			}
		});
	}

	if (visOption) {
		visOption.addEventListener('change', () => {
			visualizeOptionFunc(visOption.value);
			URLUtils.setParam('visualizeOption', visOption.value);
		});
	}

	['temp', 'tempNumInputC', 'tempNumInputK'].forEach(id => {
		const el = document.getElementById(id);
		if (!el) return;
		el.addEventListener('input', (e) => {
			const rawValue = e.target.value || 0;
			const targetId = e.target.id;
			const isKelvinInput = (targetId === 'temp' || targetId === 'tempNumInputK');

			debouncedTempSetParam(
				isKelvinInput
					? rawValue
					: helpers.CelsiusToKelvin(rawValue)
			);

			if (targetId === 'temp') {
				updateTemperatureInputs('slider', rawValue);
			} else if (targetId === 'tempNumInputK') {
				updateTemperatureInputs('kelvin', rawValue);
			} else {
				updateTemperatureInputs('celsius', rawValue);
			}
		});
	});

	const periodicTable = document.getElementById('periodicTable');
	if (periodicTable) {
		periodicTable.addEventListener('click', (e) => {
			const el = e.target.closest('.element');
			if (!el) return;
			const elementClickedAtomic = el.getAttribute('data-linkedElement') || el.getAttribute('data-atomic');
			showElementData(elementClickedAtomic);
			URLUtils.setParam('SelectedElement', elementClickedAtomic);
		});

		periodicTable.addEventListener('dblclick', (e) => {
			const el = e.target.closest('.element');
			if (!el) return;
			const elementClickedAtomic = el.getAttribute('data-linkedElement') || el.getAttribute('data-atomic');
			infoElement(elementClickedAtomic);
		});
	} else {
		document.querySelectorAll('.element').forEach(el => {
			el.addEventListener('click', () => {
				const elementClickedAtomic = el.getAttribute('data-linkedElement') || el.getAttribute('data-atomic');
				showElementData(elementClickedAtomic);
				URLUtils.setParam('SelectedElement', elementClickedAtomic);
			});

			el.addEventListener('dblclick', () => {
				const elementClickedAtomic = el.getAttribute('data-linkedElement') || el.getAttribute('data-atomic');
				infoElement(elementClickedAtomic);
			});
		});
	}

	if (closeUp) {
		closeUp.addEventListener('click', () => {
			const elementClickedAtomic = closeUp.getAttribute('data-atomic');
			infoElement(elementClickedAtomic);
		});
	}

	const searchbar = document.getElementById('searchbar');
	if (searchbar) {
		searchbar.addEventListener('input', function () {
			let rawInput = this.value.trim().toLowerCase();
			let searchTerms = rawInput
				.split(/\s*(?:,)\s*/i) //split by comma
				.filter(term => term !== '')
				.map(term => helpers.removeDiacritics(term));

			let items = document.querySelectorAll('.element');

			items.forEach(item => {
				const contains = el => el ? helpers.removeDiacritics(el.textContent.trim().toLowerCase()) : '';

				let atomicValue = helpers.removeDiacritics(item.getAttribute('data-atomic') || '');
				let emElement = item.querySelector('em');
				let abbrElement = item.querySelector('abbr');
				let dataElement = item.querySelector('data');

				let abbrElementText = contains(abbrElement);
				let emText = contains(emElement);
				let dataText = contains(dataElement);

				if (searchTerms.length === 0) {
					item.classList.remove('highlight');
					return;
				}

				let matched = searchTerms.some(term =>
					atomicValue === term ||
					abbrElementText === term ||
					dataText.includes(term) ||
					emText.includes(term)
				);

				if (matched) {
					item.classList.add('highlight');
				} else {
					item.classList.remove('highlight');
				}
			});
		});
	}
}