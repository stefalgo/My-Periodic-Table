import { initEvents } from './Events.js';
import { onDataLoaded } from './Main.js';
import { sharePage } from './UtilsAndLib/helpers.js';

function toggleColorScheme() {
    document.documentElement.classList.toggle('darkMode');
    document.documentElement.classList.toggle('lightMode');
}

async function loadJson(path) {
    const startTime = performance.now();

    try {
        const res = await fetch(path);

        const endTime = performance.now();
        console.log("Loading", path);
        console.log(`^[Took ${(endTime - startTime).toFixed(2)} ms]`);

        if (!res.ok) {
            alert(`Failed to load ${path}: ${res.status}`);
            throw new Error(`HTTP error ${res.status} while loading ${path}`);
        }

        return await res.json();

    } catch (err) {
        alert(`Failed to load ${path}`);
        throw err;
    }
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
});