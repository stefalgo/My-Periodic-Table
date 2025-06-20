const closeUp = document.getElementById('CloseUp');
let elementData;

(async () => {
	try {
		const res = await fetch('JsonData/ElementsV3.json');
		if (!res.ok) throw new Error(`Failed to fetch JSON: ${res.status}`);

		elementData = await res.json();
		console.log('JSON loaded successfully');

		onDataLoaded();

		} catch (err) {
			console.error(err);
		}
})();

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

function generateAtom(atomicNumber) {
	const atomContainer = document.getElementById('atom');
	const atomCore = atomContainer.querySelector('.atom');
	if (!elementData[atomicNumber]) {console.error('Atomic number not found in the data.'); return;}
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

//-----------------------------------------------------------------------------------------------

function infoElement(elementAtomicNumber) {
	const infoPopup = document.getElementById('infoPopup');
	const popupData = infoPopup.querySelector('.popup-data');
	const wikipediaLink = infoPopup.querySelector('.popup-wikipediaLink');
	const downloadPDF = infoPopup.querySelector('.popup-pdfDownload');
	const closeUp2 = copyCloseUp();

	let element;
	let link;
	let pdf;

	popupData.innerHTML = '';

	function createData(title, data) {
		const div = document.createElement('div');
		const legendtitle = document.createElement('legend');
		const h3data = document.createElement('h3');
		const hr = document.createElement('hr');

		legendtitle.innerHTML = '<b>' + title + ':</b>';
		h3data.innerHTML = data;

		div.appendChild(legendtitle);
		div.appendChild(h3data);
		popupData.appendChild(div);
		popupData.appendChild(hr);

	}

	function copyCloseUp() {
		let clonedElement = closeUp.cloneNode(true);
		let closeUp2 = document.getElementById('CloseUp2');
		closeUp2.innerHTML = '';
		closeUp2.appendChild(clonedElement);
		return clonedElement;
	}

	function closePopup(event) {
		infoPopup.style.display = "none";
		wikipediaLink.href = '';
		downloadPDF.href = '';
		closeUp2.removeEventListener('click', wikipediaIframeOpen);
		infoPopup.querySelector('.close').removeEventListener('click', closePopup);
	}

	function wikipediaIframeOpen(event) {
		openLinkInIframe(element);
	}
				
	element = elementAtomicNumber;
	
	if (elementData[element].linkElementName) {
		link = 'https://el.wikipedia.org/wiki/' + elementData[element].linkElementName;
		pdf = 'https://el.wikipedia.org/api/rest_v1/page/pdf/' + elementData[element].linkElementName;
	} else {
		link = 'https://el.wikipedia.org/wiki/' + elementData[element].name;
		pdf = 'https://el.wikipedia.org/api/rest_v1/page/pdf/' + elementData[element].name;
	}

	createData('Ονομα', elementData[element].name || '--');
	createData('Ατομικός', elementData[element].atomic || '--');
	createData('Ηλεκτρονική δομή', energyLevels(elementData[element].electronConfiguration).join(', ') || '--');
	createData('Διαμόρφωση', elementData[element].electronStringConf) || '--';
	createData('Βάρος', (elementData[element].atomicMass || '--') + ' u');
	createData('Ταξινόμηση', engToGr.find(c => c.en === elementData[element].category)?.gr ?? "Άγνωστη κατηγορία");
	createData('Μπλοκ', getBlock(elementData[elementAtomicNumber]) || '--');

	createData('Σημείο τήξης', (elementData[element].melt || '--') + ' K');
	createData('Σημείο ζέσεως', (elementData[element].boil || '--') + ' K');
	createData('Ακτίνα', (elementData[element].atomicRadius || '--') + ' pm');
	createData('Ηλεκτραρνητικότητα', elementData[element].electronegativity || '--');
	createData('Ιονισμός', (elementData[element].ionizationEnergy || '--') + ' kJ/mol');
	createData('Ηλεκτροσυγγένεια', (elementData[element].electronAffinity || '--') + ' kJ/mol');
	createData('Πυκνότητα', (elementData[element].density || '--') + ' kJ/m<sup>3</sup>');
	createData('Ανακαλύφθηκε', formatGreekDate(elementData[element].discovered) || '--');
				
	closeUp2.addEventListener('click', wikipediaIframeOpen);
	infoPopup.querySelector('.close').addEventListener('click', closePopup);
	wikipediaLink.href = link;
	downloadPDF.href = pdf;

	infoPopup.style.display = "block";
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

document.addEventListener('click', (event) => {
	if (event.target.matches('.element')) {
		const elementClickedAtomic = event.target.getAttribute('data-linkedElement') || event.target.getAttribute('data-atomic');

		showElementData(elementClickedAtomic);
		URL_setParam("SelectedElement", elementClickedAtomic);
	}
});

closeUp.addEventListener('click', (event) => {
	const elementClickedAtomic = event.target.getAttribute('data-atomic');
	infoElement(elementClickedAtomic);
});