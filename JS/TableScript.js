const closeUp = document.getElementById('CloseUp');
let elementData;

(async () => {
	try {
		const res = await fetch('JsonData/ElementsV2.json');
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
		showElementData(URL_readParam('SelectedElement'));
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
	const mass = closeUp.querySelector('.closeUp-mass');
	const energyLevel = closeUp.querySelector('small');

	energyLevel.innerHTML = '';
	atomic.textContent = elementAtomicNumber;
	name.textContent = elementData[elementAtomicNumber].name;
	symbol.textContent = elementData[elementAtomicNumber].symbol;
	mass.textContent = elementData[elementAtomicNumber].atomicMass;
	

	closeUp.classList = ["elementStyle"];
	closeUp.classList.add(elementData[elementAtomicNumber].category);
	closeUp.classList.add(getBlock(elementData[elementAtomicNumber]));
	closeUp.setAttribute('data-atomic', elementAtomicNumber)
	
	visualizeOptionFunc();

	for (const level of energyLevels(elementData[elementAtomicNumber].electronConfiguration)) {
		let spanElement = document.createElement('span');
		spanElement.textContent = level;
		energyLevel.appendChild(spanElement);
	}

	generateAtom(elementAtomicNumber);
}

//-----------------------------------------------------------------------------------------------

function infoElement(elementAtomicNumber) {
	const infoPopup = document.getElementById('infoPopup');
	const name = infoPopup.querySelector('.popup-name');
	const atomic = infoPopup.querySelector('.popup-atomic');
	const energyLevels = infoPopup.querySelector('.popup-energyLevels');
	const discovered = infoPopup.querySelector('.popup-discovered');
	const mass = infoPopup.querySelector('.popup-mass');
	const block = infoPopup.querySelector('.popup-block');
	const elementClass = infoPopup.querySelector('.popup-class');
	const wikipediaLink = infoPopup.querySelector('.popup-wikipediaLink');
	const downloadPDF = infoPopup.querySelector('.popup-pdfDownload');
	const closeUp2 = copyCloseUp();

	let element;
	let link;
	let pdf;

	function copyCloseUp() {
		let clonedElement = closeUp.cloneNode(true);
		let closeUp2 = document.getElementById('CloseUp2');
		closeUp2.innerHTML = '';
		closeUp2.appendChild(clonedElement);
		return clonedElement;
	}

	function closePopup(event) {
		infoPopup.style.display = "none";
		wikipediaLink.href = "";
		downloadPDF.href = "";
		closeUp2.removeEventListener('click', wikipediaIframeOpen);
		infoPopup.querySelector('.close').removeEventListener('click', closePopup);
	}

	function wikipediaIframeOpen(event) {
		openLinkInIframe(element);
	}
				
	element = elementAtomicNumber;
	
	if (elementData[element].linkElementName) {
		link = "https://el.wikipedia.org/wiki/" + elementData[element].linkElementName;
		pdf = "https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[element].linkElementName;
	} else {
		link = "https://el.wikipedia.org/wiki/" + elementData[element].name;
		pdf = "https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[element].name;
	}
	
	name.innerHTML = elementData[element].name;
	atomic.innerHTML = element;
	energyLevels.innerHTML = elementData[element].electronConfiguration;
	discovered.innerHTML = elementData[element].discoveredBy;
	mass.innerHTML = elementData[element].atomicMass;
	block.innerHTML = getBlock(elementData[elementAtomicNumber]);// + '-τομέας';
	elementClass.innerHTML = classesEngGr.find(c => c.en === elementData[element].category)?.gr ?? "Άγνωστη κατηγορία";
				
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
	let link;

	function closePopup(event) {
		sitePopup.querySelector('iframe').src = '';
		sitePopup.style.display = "none";
		sitePopup.querySelector('.close').removeEventListener('click', closePopup);
	}

	if (elementData[rowId].linkElementName) {
		link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].linkElementName + "#view=Fit";
	} else {
		link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].name + "#view=Fit";
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
