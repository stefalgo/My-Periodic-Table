import { initEvents } from './Events.js';
import { onDataLoaded } from './Main.js';
import { sharePage } from './UtilsAndLib/helpers.js';
import { OpenPopup as openMinigame } from './minigame.js';


function toggleColorScheme() {
    document.documentElement.classList.toggle('darkMode');
    document.documentElement.classList.toggle('lightMode');
}


async function loadJson(path) {
    const start = performance.now();
    const res = await fetch(path);
    const duration = (performance.now() - start).toFixed(2);
    console.log(`Loading ${path} [${duration} ms]`);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} while loading ${path}`);
    }
    return res.json();
}

function t(key, variables = {}) {
    const exact = document.localization?.[key];
    let translation = exact;
    if (translation === undefined) {
        const parts = key.split(".");
        for (let i = parts.length - 1; i > 0; i--) {
            const objectKey = parts.slice(0, i).join(".");
            const object = document.localization?.[objectKey];
            if (object !== undefined) {
                translation = parts.slice(i).reduce(
                    (value, part) => value?.[part],
                    object
                );
                break;
            }
        }
    }
    if (translation === undefined) {
        return key;
    }
    return translation.replace(/\$\{(\w+)\}/g, (_, name) => {
        return variables[name] ?? `\${${name}}`;
    });
}
window.t = t;

async function loadLocalization(language = "el") {
    try {
        const translations = await loadJson(`locales/${language}.json`);
        document.localization = translations;
        document.localizationLanguage = language;
        document.documentElement.lang = language;
        document.querySelectorAll("[data-i18n]").forEach(element => {
            const key = element.dataset.i18n;
            const translation = t(key);
            if (translation === key) {
                console.warn(`Missing translation: ${key}`);
                return;
            }
            if ("placeholder" in element) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        const elementNames = Object.values(translations.elements);
        document.querySelectorAll(".element[data-atomic]").forEach(element => {
            const atomic = Number(element.dataset.atomic);
            const nameElement = element.querySelector("em");
            if (!nameElement) {
                console.warn(`No <em> found in element with atomic number ${atomic}`);
                return;
            }
            if (!Number.isInteger(atomic) || atomic < 1) {
                console.warn(`Invalid atomic number: ${atomic}`);
                return;
            }
            const localizedName = elementNames[atomic - 1];
            if (localizedName === undefined) {
                console.warn(`Missing localized name for atomic number: ${atomic}`);
                return;
            }
            nameElement.textContent = localizedName;
        });

    } catch (error) {
        console.error("Failed to load localization:", error);
    }
}


async function bootstrap() {
    try {
        const [elements, spectrumIMG] = await Promise.all([
            loadJson("JsonData/ElementsV6.json"),
            loadJson("JsonData/spectrum.json")
        ]);
        onDataLoaded(elements, spectrumIMG);
        initEvents();
        console.log("loaded successfully");
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    window.toggleColorScheme = toggleColorScheme;
    window.sharePage = sharePage;
    window.openMinigame = openMinigame;
    document.documentElement.classList.add("darkMode");
    const languageSelect = document.querySelector("#language");
    const supportedLanguages = ["el", "ja", "en"];
    const urlLanguage = new URLSearchParams(window.location.search).get("lan");
    const browserLanguage = navigator.language.split("-")[0];
    const language = supportedLanguages.includes(urlLanguage) ? urlLanguage : supportedLanguages.includes(browserLanguage) ? browserLanguage : "en";
    languageSelect.value = language;
    languageSelect.addEventListener("change", async () => {
        const language = languageSelect.value;
        const url = new URL(window.location.href);
        url.searchParams.set("lan", language);
        window.history.pushState({}, "", url);
        await loadLocalization(language);
    });
    await loadLocalization(language);
    await bootstrap();
});