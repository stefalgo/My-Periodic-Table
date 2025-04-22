const classes = ["alkali", "alkaline", "nonmetal", "transition", "unknown", "lanthanoid", "actinoid", "metalloid", "poor", "noble"];
const closeUp = document.getElementById('CloseUp');
var elementAtomicNumber;

const elementData = {};

//fetch("../JsonData/Elements.json")
fetch("JsonData/Elements.json")
  .then(response => response.json())
  .then(jsonData => {
    Object.assign(elementData, jsonData);
	console.log("JSON loaded successfully:");

	var urlSelectedElement = URL_readParam("SelectedElement")

	if (urlSelectedElement) {
		elementClicked(document.querySelector(`[data-atomic="${urlSelectedElement}"]`));
	} else {
		generateAtom('1');
	}
  })
  .catch(error => console.error("Error loading JSON:", error));

function energyLevel(elementName) {
	closeUp.querySelector('small').innerHTML = '';

	if (elementData.hasOwnProperty(elementName)) {

		var element = elementData[elementName];

		for (var i = 0; i < element.energyLevels.length; i++) {

			var spanElement = document.createElement('span');
			spanElement.textContent = (element.energyLevels[i]);
			closeUp.querySelector('small').appendChild(spanElement);
			//console.log('Energy Level ' + (i + 1) + ': ' + element.energyLevels[i]);
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

	//function update(onElement) {
	const atomic = closeUp.querySelector('.closeUp-atomic');
	const symbol = closeUp.querySelector('.closeUp-shortName');
	const name = closeUp.querySelector('.closeUp-name');
	const mass = closeUp.querySelector('.closeUp-mass');
				
	atomic.textContent = elementAtomicNumber;
	energyLevel(elementAtomicNumber);
	generateAtom(elementAtomicNumber)
	name.textContent = elementData[elementAtomicNumber].name;
				
	const allChildElements = target.children;//getChildrenElements(onElement);
	symbol.textContent = elementData[elementAtomicNumber].shortName;
	mass.textContent = allChildElements[3].textContent;
	closeUp.classList = ["elementStyle"];
	const matchingClass = targetClasses.find(cls => classes.includes(cls));
	if (matchingClass) {
		closeUp.classList.add(matchingClass);
	}
	//}
	/*
	if (targetClasses.some(cls => classes.includes(cls))) {
		update(target);
	}
	*/
}

//-----------------------------------------------------------------------------------------------

function infoElement() {
	const infoPopup = document.getElementById('infoPopup');
	var element;
				
	if (typeof elementAtomicNumber !== 'undefined') {
		element = elementAtomicNumber;
	} else {
		element = '1';
	}
	function updateInfoPopup() {
		function copyCloseUp() {
			var clonedElement = closeUp.cloneNode(true);
			var closeUp2 = document.getElementById('CloseUp2');
			closeUp2.innerHTML = '';
			closeUp2.appendChild(clonedElement);
			return clonedElement
		}
		const closeUp2 = copyCloseUp()
					
		const name = infoPopup.querySelector('.popup-name');
		const atomic = infoPopup.querySelector('.popup-atomic');
		const energyLevels = infoPopup.querySelector('.popup-energyLevels');
		const discovered = infoPopup.querySelector('.popup-discovered');
		const block = infoPopup.querySelector('.popup-block');
		const elementClass = infoPopup.querySelector('.popup-class');
		const wikipediaLink = infoPopup.querySelector('.popup-wikipediaLink');
		const downloadPDF = infoPopup.querySelector('.popup-pdfDownload');
		
		var link;
		var pdf;
		
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
		block.innerHTML = elementData[element].block + '-block';
		elementClass.innerHTML = closeUp2.classList[1];
		
		function wikipediaIframeOpen(event) {
			openLinkInIframe(element);
		}
					
		function closePopup(event) {
			infoPopup.style.display = "none";
			wikipediaLink.href = "";
			downloadPDF.href = "";
			closeUp2.removeEventListener('click', wikipediaIframeOpen);
			infoPopup.querySelector('.close').removeEventListener('click', closePopup);
		}
					
		closeUp2.addEventListener('click', wikipediaIframeOpen);
		infoPopup.querySelector('.close').addEventListener('click', closePopup);
		wikipediaLink.href = link;
		downloadPDF.href = pdf;
	}

	infoPopup.style.display = "block";
	updateInfoPopup();
}

function elementClicked(clickedElement) {
	if (clickedElement.hasAttribute('data-linkedElement')) {
		elementAtomicNumber = clickedElement.getAttribute('data-linkedElement');
		showElementData(document.querySelector(`[data-atomic="${elementAtomicNumber}"]`));
		return;
	} else {
		elementAtomicNumber = clickedElement.getAttribute("data-atomic");
		showElementData(clickedElement);
		return;
	}
}
function openLinkInIframe(rowId) {
	const sitePopup = document.getElementById('sitePopup');
	//var link = "Files/ElementsPDF/" + elementData[rowId].name + ".pdf#zoom=100&navpanes=0&page=1";
	//var link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].name + "#view=Fit"
	//var link = "https://el.wikipedia.org/wiki/" + elementData[rowId].name;
	
	var link;
	if (elementData[rowId].linkElementName) {
		link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].linkElementName + "#view=Fit";
	} else {
		link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].name + "#view=Fit";
	}
	
	sitePopup.querySelector('iframe').src = link;
	
	sitePopup.style.display = "block";
	function closePopup(event) {
		sitePopup.querySelector('iframe').src = '';
		sitePopup.style.display = "none";
		sitePopup.querySelector('.close').removeEventListener('click', closePopup);
		//document.querySelector('#sitePopup').removeEventListener('click', closePopup);
	}
	sitePopup.querySelector('.close').addEventListener('click', closePopup);
	//document.querySelector('#sitePopup').addEventListener('click', closePopup);
}


document.addEventListener('click', (event) => {
	if (event.target.matches('.element')) {
		elementClicked(event.target);
		URL_setParam("SelectedElement", event.target.getAttribute('data-atomic'));
	}
});

closeUp.addEventListener('click', function(event) {
	infoElement()
});
