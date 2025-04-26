function showBlocks() {
    document.documentElement.classList.toggle('blocks');
    if (document.documentElement.classList.contains('blocks')) {
        URL_setParam("blocks", 'true');
    } else {
        URL_removeParam("blocks")
    }
}

function adjustElementsText() {
    const containerWidth = 57;
    const elements = document.querySelectorAll('.element');
    elements.forEach(el => {
        const emEl = el.querySelector('em');
        if (emEl) {

            const measuredWidth = emEl.scrollWidth;

            const scaleX = containerWidth / measuredWidth;

            const translateX = 50 * (scaleX - 1);

            const wordLength = emEl.textContent.length;
            const letterSpacing = (wordLength >= 11);

            emEl.style.transform = `translateX(${translateX}%) scaleX(${scaleX})`;
            emEl.style.letterSpacing = `${letterSpacing}em`;
        }
    });
}

function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.toggle('darkMode');
} else {
    document.documentElement.classList.toggle('lightMode');
}

if (URL_readParam('blocks') === 'true') {
    document.documentElement.classList.toggle('blocks');
}

if (URL_readParam('lighting') === 'other') {
    document.documentElement.classList.toggle('darkMode');
    document.documentElement.classList.toggle('lightMode');
}

adjustElementsText();

document.getElementById("searchbar").addEventListener("input", function () {
    let searchValue = removeDiacritics(this.value.trim().toLowerCase());
    let items = document.querySelectorAll(".element");

    items.forEach(item => {
        let atomicValue = removeDiacritics(item.getAttribute("data-atomic") || "");
        let emElement = item.querySelector("em");
        let emText = emElement ? removeDiacritics(emElement.textContent.trim().toLowerCase()) : "";

        if (searchValue === "") {
            item.classList.remove("highlight");
        } else if (atomicValue === searchValue || emText.includes(searchValue)) {
            item.classList.add("highlight");
        } else {
            item.classList.remove("highlight");
        }
    });
});

/*
document.querySelectorAll(".highlightElement").forEach(highlight => {
    highlight.addEventListener("mouseenter", () => {
        const category = [...highlight.classList].find(cls => cls !== "highlightElement");
    
        document.querySelectorAll(".element, .highlightElement").forEach(el => {
            el.style.opacity = el.classList.contains(category) ? "1" : "0.3";
        });
    });

    highlight.addEventListener("mouseleave", () => {
        document.querySelectorAll(".element, .highlightElement").forEach(el => el.style.opacity = "1");
    });
});
*/
