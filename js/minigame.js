import * as helpers from './UtilsAndLib/helpers.js'
import * as URLUtils from './UtilsAndLib/UrlParamsUtils.js'
import { elementData } from './Main.js'

const popup = document.getElementById('minigamePopup');
const closeUp = popup.querySelector('.CloseUp');
const popupTitle = popup.querySelector('h2');
const minigameScore = document.getElementById('minigameScore');
const userInput = document.getElementById('minigameAnsware');
const checkBtn = document.getElementById('miniameCheckAnsware');

const minigames = [
    { type: "atomic" },
    { type: "symbol" },
    { type: "name" }
];

let currentQuestion = null;
let score = 0;
let totalQuestions = 0;

const simpleStr = (input) => helpers.removeDiacritics(input.trim().toLowerCase())

function getRandomElement() {
    const keys = Object.keys(elementData);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    const gameType = minigames[Math.floor(Math.random() * minigames.length)];

    return {
        atomicNumber: randomKey,
        type: gameType.type
    };
}

function setVisualData(atomicNumber, type) {
    const atomic = closeUp.querySelector('.closeUp-atomic');
    const symbol = closeUp.querySelector('.closeUp-shortName');
    const name = closeUp.querySelector('.closeUp-name');
    const energyLevel = closeUp.querySelector('small');

    const el = elementData[atomicNumber];

    energyLevel.innerHTML = '';
    for (const level of helpers.energyLevels(el.electronConfiguration)) {
        let spanElement = document.createElement('span');
        spanElement.textContent = level;
        energyLevel.appendChild(spanElement);
    }

    if (!el) {
        console.error("Invalid element:", atomicNumber);
        return;
    }

    closeUp.className = `CloseUp ${el.category}`;

    let fields = { atomic: el.atomic, symbol: el.symbol, name: el.name };

    fields[type] = "?";

    const hideSecond = Math.random() < 0.5;
    if (hideSecond) {
        const otherKeys = Object.keys(fields).filter(k => k !== type);
        const secondKey = otherKeys[Math.floor(Math.random() * otherKeys.length)];
        fields[secondKey] = "-";
    }

    atomic.textContent = fields.atomic;
    symbol.textContent = fields.symbol;
    name.textContent = fields.name;

    switch (type) {
        case "atomic":
            popupTitle.textContent = "Ποιος είναι ο ατομικός αριθμός;";
            break;
        case "symbol":
            popupTitle.textContent = "Ποιο είναι το σύμβολο;";
            break;
        case "name":
            popupTitle.textContent = "Ποιο είναι το όνομα;";
            break;
    }
}

function checkAnswer() {
    const el = elementData[currentQuestion.atomicNumber];
    const answer = simpleStr(userInput.value);

    let correct = "";

    switch (currentQuestion.type) {
        case "atomic":
            correct = String(el.atomic);
            break;
        case "symbol":
            correct = el.symbol.toLowerCase();
            break;
        case "name":
            correct = simpleStr(el.name);
            break;
    }

    totalQuestions++;

    if (answer === correct) {
        score++;
    }

    minigameScore.textContent = `Σκορ: ${score}/${totalQuestions}`;

    currentQuestion = getRandomElement();
    setVisualData(currentQuestion.atomicNumber, currentQuestion.type);

    userInput.value = "";
}

function OpenPopup() {

    currentQuestion = getRandomElement();
    setVisualData(currentQuestion.atomicNumber, currentQuestion.type);

    URLUtils.setParam('minigame', 1);
    
    function closePopup() {
        score = 0;
        totalQuestions = 0;
        minigameScore.textContent = 'Σκορ: 0/0'
        URLUtils.removeParam('minigame')
        popup.style.display = "none";
        popup.querySelector('.close-btn').removeEventListener('click', closePopup);
    }

    popup.style.display = "block";
    popup.querySelector('.close-btn').addEventListener('click', closePopup);

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closePopup();
        }
    });
}

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        checkAnswer();
    }
});

checkBtn.addEventListener("click", (e) => {
    checkAnswer();
})

export {
    OpenPopup
}