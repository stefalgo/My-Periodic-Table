import { initEvents } from './Events.js';
import { onDataLoaded, toggleColorScheme } from './Main.js';
import { sharePage } from './UtilsAndLib/helpers.js';

async function bootstrap() {
    try {
        const res = await fetch('JsonData/ElementsV4.json');
        if (!res.ok) throw new Error(`Failed to fetch JSON: ${res.status}`);
        const data = await res.json();
        onDataLoaded(data);
        initEvents();
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    bootstrap();
    window.toggleColorScheme = toggleColorScheme;
    window.sharePage = sharePage;
});