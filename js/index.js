import { initEvents } from './Events.js';
import { onDataLoaded, toggleColorScheme } from './Main.js';
import { sharePage } from './UtilsAndLib/helpers.js';

async function loadJson(path) {
    const startTime = performance.now();
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    const endTime = performance.now();
    console.log("Loading", path);
    console.log(`^[Took ${(endTime - startTime).toFixed(2)} ms]`)
    return await res.json();
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