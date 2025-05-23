const classes = [
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

const elementData = {};
const closeUp = document.getElementById('CloseUp');

let elementAtomicNumber;

fetch("JsonData/Elements.json")
//fetch("https://raw.githubusercontent.com/stefalgo/My-Periodic-Table/main/JsonData/Elements.json")
  .then(response => response.json())
  .then(jsonData => {
    Object.assign(elementData, jsonData);
	console.log("JSON loaded successfully:");

	let urlSelectedElement = URL_readParam("SelectedElement")

	if (urlSelectedElement) {
		elementClicked(document.querySelector(`[data-atomic="${urlSelectedElement}"]`));
	} else {
		generateAtom('1');
	}
  })
  .catch(error => console.error("Error loading JSON:", error));

function energyLevel(elementName) {
	const smallElement = closeUp.querySelector('small');
	smallElement.innerHTML = '';

	if (elementData.hasOwnProperty(elementName)) {

		let element = elementData[elementName];

	for (const level of element.energyLevels) {
		let spanElement = document.createElement('span');
		spanElement.textContent = level;
		smallElement.appendChild(spanElement);
	}
	} else {
		console.log('Element with name "' + elementName + '" does not exist.');
	}
}

function generateAtom(atomicNumber) {
	const atomContainer = document.getElementById('atom');
	const atomCore = atomContainer.querySelector('.atom');
	const atom = elementData[atomicNumber];
	if (!atom) {console.error('Atomic number not found in the data.'); return;}

	//atomContainer.innerHTML = '<div class="atom"></div>';
	atomCore.innerHTML = '';

	atom.energyLevels.forEach((numElectrons, index) => {
		const energyLevelDiv = document.createElement('div');
		const radius = (index + 2) * 9;
		const animationSpeed = radius / 2;
		//const xPos = '50%';
		//const yPos = '50%';

		energyLevelDiv.classList.add('energy-level');
		energyLevelDiv.style.width = radius * 2 + 'px';
		energyLevelDiv.style.height = radius * 2 + 'px';
		//energyLevelDiv.style.top = yPos;
		//energyLevelDiv.style.left = xPos;
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

function showElementData(target) {
	const targetClasses = Array.from(target.classList);
	const atomic = closeUp.querySelector('.closeUp-atomic');
	const symbol = closeUp.querySelector('.closeUp-shortName');
	const name = closeUp.querySelector('.closeUp-name');
	const mass = closeUp.querySelector('.closeUp-mass');
	const allChildElements = target.children;//getChildrenElements(onElement);
	const matchingClassObj = classes.find(c => targetClasses.includes(c.en));
				
	atomic.textContent = elementAtomicNumber;
	energyLevel(elementAtomicNumber);
	generateAtom(elementAtomicNumber)
	name.textContent = elementData[elementAtomicNumber].name;
	
	symbol.textContent = elementData[elementAtomicNumber].shortName;
	mass.textContent = allChildElements[3].textContent;
	closeUp.classList = ["elementStyle"];
	if (matchingClassObj) {
		closeUp.classList.add(matchingClassObj.en);
	}
}

//-----------------------------------------------------------------------------------------------

function infoElement() {
	const infoPopup = document.getElementById('infoPopup');
	const name = infoPopup.querySelector('.popup-name');
	const atomic = infoPopup.querySelector('.popup-atomic');
	const energyLevels = infoPopup.querySelector('.popup-energyLevels');
	const discovered = infoPopup.querySelector('.popup-discovered');
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
				
	if (typeof elementAtomicNumber !== 'undefined') {
		element = elementAtomicNumber;
	} else {
		element = '1';
	}
	
	if (elementData[element].linkElementName) {
		link = "https://el.wikipedia.org/wiki/" + elementData[element].linkElementName;
		pdf = "https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[element].linkElementName;
	} else {
		link = "https://el.wikipedia.org/wiki/" + elementData[element].name;
		pdf = "https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[element].name;
	}
	
	name.innerHTML = elementData[element].name;
	atomic.innerHTML = element;
				
	energyLevels.innerHTML = elementData[element].energyLevels.join(', ');
	discovered.innerHTML = elementData[element].discovered;

	block.innerHTML = elementData[element].block;// + '-τομέας';
	elementClass.innerHTML = classes.find(c => c.en === elementData[element].class)?.gr ?? "Άγνωστη κατηγορία";
				
	closeUp2.addEventListener('click', wikipediaIframeOpen);
	infoPopup.querySelector('.close').addEventListener('click', closePopup);
	wikipediaLink.href = link;
	downloadPDF.href = pdf;

	infoPopup.style.display = "block";
}

function elementClicked(clickedElement) {
	elementAtomicNumber = clickedElement.getAttribute('data-linkedElement') || clickedElement.getAttribute('data-atomic');
	const elementToShow = clickedElement.hasAttribute('data-linkedElement') ? document.querySelector(`[data-atomic="${elementAtomicNumber}"]`) : clickedElement;

	showElementData(elementToShow);
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
		//document.querySelector('#sitePopup').removeEventListener('click', closePopup);
	}

	if (elementData[rowId].linkElementName) {
		link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].linkElementName + "#view=Fit";
	} else {
		link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].name + "#view=Fit";
	}
	
	sitePopup.querySelector('iframe').src = link;
	
	sitePopup.style.display = "block";
	sitePopup.querySelector('.close').addEventListener('click', closePopup);
	//document.querySelector('#sitePopup').addEventListener('click', closePopup);
}


document.addEventListener('click', (event) => {
	if (event.target.matches('.element')) {
		elementClicked(event.target);
		URL_setParam("SelectedElement", event.target.getAttribute('data-atomic') || event.target.getAttribute('data-linkedElement') );
	}
});

closeUp.addEventListener('click', function(event) {
	infoElement();
});
