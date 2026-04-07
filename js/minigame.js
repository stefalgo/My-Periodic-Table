import * as helpers from './UtilsAndLib/helpers.js'
import * as URLUtils from './UtilsAndLib/UrlParamsUtils.js'
import { elementData } from './Main.js'

const popup = document.getElementById('minigamePopup');
const closeUp = popup.querySelector('.CloseUp');
const popupTitle = popup.querySelector('h2');
const minigameScore = document.getElementById('minigameScore');
const userInput = document.getElementById('minigameAnsware');
const checkBtn = document.getElementById('miniameCheckAnsware');
const multipleChoice = document.getElementById('minigame-multipleChoice');
const multipleChoise_MaxOptions = 5;

const minigames = [
    { type: "atomic" },
    { type: "symbol" },
    { type: "name" }
];

let currentQuestion = null;
let score = 0;
let totalQuestions = 0;

const simpleStr = (input) => helpers.removeDiacritics(input.trim().toLowerCase());

function getRandomElement() {
    const keys = Object.keys(elementData);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    const gameType = minigames[Math.floor(Math.random() * minigames.length)];

    return {
        atomicNumber: randomKey,
        type: gameType.type
    };
}

function updateMultipleChoice() {
    multipleChoice.innerHTML = "";

    const correctEl = elementData[currentQuestion.atomicNumber];

    let correctAnswer;

    switch (currentQuestion.type) {
        case "atomic":
            correctAnswer = String(correctEl.atomic);
            break;
        case "symbol":
            correctAnswer = correctEl.symbol;
            break;
        case "name":
            correctAnswer = correctEl.name;
            break;
    }

    const options = new Set();
    options.add(correctAnswer);

    const keys = Object.keys(elementData);

    while (options.size < multipleChoise_MaxOptions) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const el = elementData[randomKey];

        let value;

        switch (currentQuestion.type) {
            case "atomic":
                value = String(el.atomic);
                break;
            case "symbol":
                value = el.symbol;
                break;
            case "name":
                value = el.name;
                break;
        }

        options.add(value);
    }

    const shuffled = [...options].sort(() => Math.random() - 0.5);

    shuffled.forEach((opt, i) => {
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "answer";
        input.value = opt;
        input.id = `minigame-opt-${i}`;

        const label = document.createElement("label");
        label.setAttribute("for", input.id);
        label.textContent = opt;

        multipleChoice.appendChild(input);
        multipleChoice.appendChild(label);
    });
}

function setVisualData(atomicNumber, type) {
    const atomic = closeUp.querySelector('.closeUp-atomic');
    const symbol = closeUp.querySelector('.closeUp-shortName');
    const name = closeUp.querySelector('.closeUp-name');
    const energyLevel = closeUp.querySelector('small');

    const el = elementData[atomicNumber];

    if (!el) {
        console.error("Invalid element:", atomicNumber);
        return;
    }

    let fields = { atomic: el.atomic, symbol: el.symbol, name: el.name };

    if (type) {
        updateMultipleChoice();
        fields[type] = "?";
    }

    if (type === "atomic") {
        energyLevel.innerHTML = '';
    } else {
        energyLevel.innerHTML = '';
        for (const level of helpers.energyLevels(el.electronConfiguration)) {
            let spanElement = document.createElement('span');
            spanElement.textContent = level;
            energyLevel.appendChild(spanElement);
        }
    }

    closeUp.className = `CloseUp ${el.category}`;

    const hideSecond = Math.random() < 0.5;
    if (hideSecond && type) {
        const otherKeys = Object.keys(fields).filter(k => k !== type);
        const secondKey = otherKeys[Math.floor(Math.random() * otherKeys.length)];
        fields[secondKey] = "-";

        if (secondKey === "atomic") {
            energyLevel.innerHTML = "";
        }
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

function nextQuestion() {
    currentQuestion = getRandomElement();
    setVisualData(currentQuestion.atomicNumber, currentQuestion.type);
    userInput.value = "";
    userInput.disabled = false;
    checkBtn.dataset.NextQuestion = 'false';
    checkBtn.textContent = 'Έλεγχος απάντησης.';
}

function checkAnswer(ans) {
    const el = elementData[currentQuestion.atomicNumber];
    const answer = simpleStr(ans);

    let correct = "";
    let raw_correct = "";

    userInput.disabled = true;

    checkBtn.dataset.NextQuestion = 'true';
    checkBtn.textContent = '> Επόμενη ερώτηση';

    switch (currentQuestion.type) {
        case "atomic":
            correct = String(el.atomic);
            raw_correct = correct;
            break;
        case "symbol":
            correct = el.symbol.toLowerCase();
            raw_correct = el.symbol;
            break;
        case "name":
            correct = simpleStr(el.name);
            raw_correct = el.name;
            break;
    }

    totalQuestions++;

    if (answer === correct) {
        score++;
        popupTitle.innerHTML = "<span style='color: var(--success);'>Σωστό!</span>";
        setTimeout(nextQuestion, 1000);
    } else {
        popupTitle.innerHTML = `<span style='color: var(--danger);'>Λάθος!</span> Σωστή απάντηση: <span style='color: var(--success);'>${raw_correct}</span>`;
        setVisualData(currentQuestion.atomicNumber);
    }

    minigameScore.innerHTML = `Σκορ: <span style='color: var(--success);'>${score}</span>/<span style='color: var(--danger);'>${totalQuestions - score}</span>`;
}

function OpenPopup() {

    nextQuestion();

    URLUtils.setParam('minigame', 1);

    function closePopup() {
        score = 0;
        totalQuestions = 0;
        minigameScore.innerHTML = "Σκορ: <span style='color: var(--success);'>0</span>/<span style='color: var(--danger);'>0</span>";
        URLUtils.removeParam('minigame');
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
    const selected = multipleChoice.querySelector('input[name="answer"]:checked');
    let ans = selected ? selected.value : userInput.value;

    if (selected) {
        selected.checked = false;
    }
    if (e.key === "Enter") {
        checkAnswer(ans);
    }
});

checkBtn.addEventListener("click", () => {
    if (checkBtn.dataset.NextQuestion === 'true') {
        nextQuestion();
    } else {
        const selected = multipleChoice.querySelector('input[name="answer"]:checked');
        let ans = selected ? selected.value : userInput.value;
        checkAnswer(ans);
    }
});

multipleChoice.addEventListener("click", (e) => {
    if (e.target && e.target.matches('input[name="answer"]')) {
        userInput.value = "";
    }
});

export {
    OpenPopup
}