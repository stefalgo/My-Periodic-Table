import { initEvents } from './Events.js';
import { onDataLoaded } from './Main.js';
import { sharePage } from './UtilsAndLib/helpers.js';

import { OpenPopup as openMinigame } from './minigame.js'

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

async function bootstrap() {
    try {
        const [elements, spectrumIMG] = await Promise.all([
            //loadJson("HelperScriptsAndDev/new_periodic_table.json"),
            loadJson("JsonData/ElementsV5.json"),
            loadJson("JsonData/spectrum.json")
        ]);

        onDataLoaded(elements, spectrumIMG);
        initEvents();

        console.log("loaded successfully");
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    bootstrap();
    window.toggleColorScheme = toggleColorScheme;
    window.sharePage = sharePage;
    window.openMinigame = openMinigame;
    document.documentElement.classList.add('darkMode');
    // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //     document.documentElement.classList.add('darkMode');
    //     document.documentElement.classList.remove('lightMode');
    // } else {
    //     document.documentElement.classList.add('lightMode');
    //     document.documentElement.classList.remove('darkMode');
    // }
});