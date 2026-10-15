export class TooltipManager {
    constructor() {
        this.tooltip = document.createElement('div');
        this.tooltip.classList.add('tooltip');
        document.body.appendChild(this.tooltip);

        this.activeElement = null;
        this.tooltipSize = { width: 0, height: 0 };

        this.updateTooltip = this.updateTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.tipObserver = new MutationObserver(() => {
            if (this.activeElement) {
                this.tooltip.innerHTML = t(this.activeElement.dataset.tip || "");
                this.tooltipSize = {
                    width: this.tooltip.offsetWidth,
                    height: this.tooltip.offsetHeight
                };
            }
        });

        this.init();
    }

    init() {
        document.addEventListener('mousemove', this.updateTooltip);
        document.addEventListener('mouseout', this.hideTooltip);
    }

    hideTooltip(event) {
        if (this.activeElement && !event.relatedTarget?.closest('[data-tip]')) {
            this.tooltip.style.visibility = 'hidden';
            this.tooltip.style.opacity = '0';
            this.activeElement = null;
        }
    }

    updateTooltip(event) {
        const target = event.target.closest('[data-tip]');

        if (!target || target.dataset.tip === '') {
            this.tooltip.style.visibility = 'hidden';
            this.tooltip.style.opacity = '0';
            this.tipObserver.disconnect();
            this.activeElement = null;
            return;
        }

        if (target !== this.activeElement) {
            this.tipObserver.disconnect();
            this.tipObserver.observe(target, {
                attributes: true,
                attributeFilter: ['data-tip']
            });
            this.activeElement = target;
            const tooltipKey = target.dataset.tip;
            this.tooltip.innerHTML = t(tooltipKey);
            const horizontalMargin = 20;
            const maxTooltipWidth = window.innerWidth - horizontalMargin * 2;

            this.tooltip.style.maxWidth = `${maxTooltipWidth}px`;

            this.tooltipSize = {
                width: this.tooltip.offsetWidth,
                height: this.tooltip.offsetHeight
            };
        }
        const margin = 10;
        const cursorOffset = 10;
        let left = event.clientX + cursorOffset;
        let top = event.clientY + 20;
        const availableRight = window.innerWidth - left - margin;
        if (availableRight < 200) {
            left = Math.max(margin, event.clientX - this.tooltip.offsetWidth - cursorOffset);
        }
        const availableWidth = window.innerWidth - left - margin;
        this.tooltip.style.maxWidth = `${Math.max(100, availableWidth)}px`;
        const tooltipWidth = this.tooltip.offsetWidth;
        const tooltipHeight = this.tooltip.offsetHeight;
        if (top + tooltipHeight + margin > window.innerHeight) {
            top = event.clientY - tooltipHeight - margin;
        }
        if (left < margin) {
            left = margin;
        }
        if (left + tooltipWidth + margin > window.innerWidth) {
            left = window.innerWidth - tooltipWidth - margin;
        }
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.visibility = 'visible';
        this.tooltip.style.opacity = '1';
    }

    destroy() {
        document.removeEventListener('mousemove', this.updateTooltip);
        document.removeEventListener('mouseout', this.hideTooltip);
        this.tooltip.remove();
    }
}

export class LanguageDropdown {
    constructor(container, {
        languages,
        initial = "en",
        flagsPath = "flags/",
        onChange = () => { }
    }) {
        this.container = typeof container === "string"
            ? document.querySelector(container)
            : container;

        if (!this.container) {
            throw new Error("Language dropdown container not found.");
        }

        this.languages = languages;
        this.flagsPath = flagsPath;
        this.onChange = onChange;
        this.open = false;

        this.selected = languages.some(lang => lang.code === initial)
            ? initial
            : languages[0]?.code;

        this.build();
        this.render();
        this.bindEvents();
    }

    build() {
        this.container.replaceChildren();
        this.container.classList.add("language-dropdown");

        this.trigger = document.createElement("button");
        this.trigger.type = "button";
        this.trigger.className = "language-dropdown-trigger";
        this.trigger.setAttribute("aria-haspopup", "listbox");
        this.trigger.setAttribute("aria-expanded", "false");

        this.menu = document.createElement("ul");
        this.menu.className = "language-dropdown-menu";
        this.menu.id = `language-list-${crypto.randomUUID()}`;
        this.menu.setAttribute("role", "listbox");
        this.trigger.setAttribute("aria-controls", this.menu.id);

        this.items = [];

        for (const language of this.languages) {
            const li = document.createElement("li");
            li.setAttribute("role", "presentation");

            const button = document.createElement("button");
            button.type = "button";
            button.className = "language-dropdown-option";
            button.setAttribute("role", "option");
            button.dataset.code = language.code;

            const flag = document.createElement("img");
            flag.className = "language-dropdown-flag";
            flag.src = this.flagsPath + language.flag;
            flag.alt = "";
            flag.draggable = false;

            const name = document.createElement("span");
            name.className = "language-dropdown-name";
            name.textContent = language.name;

            const check = document.createElement("span");
            check.className = "language-dropdown-check";
            check.textContent = "<";
            check.setAttribute("aria-hidden", "true");

            button.append(flag, name, check);
            li.append(button);
            this.menu.append(li);
            this.items.push(button);

            button.addEventListener("click", () => {
                this.setLanguage(language.code);
                this.close(true);
            });

            button.addEventListener("keydown", e => {
                const index = this.items.indexOf(button);

                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const direction = e.key === "ArrowDown" ? 1 : -1;
                    const next = (index + direction + this.items.length) % this.items.length;
                    this.items[next]?.focus();
                }

                if (e.key === "Home" || e.key === "End") {
                    e.preventDefault();
                    this.items[e.key === "Home" ? 0 : this.items.length - 1]?.focus();
                }

                if (e.key === "Escape") {
                    e.preventDefault();
                    this.close(true);
                }

                if (e.key === "Tab") {
                    this.close(false);
                }
            });
        }

        this.container.append(this.trigger, this.menu);
    }

    render() {
        const language = this.languages.find(lang => lang.code === this.selected);
        if (!language) return;

        this.trigger.replaceChildren();

        const flag = document.createElement("img");
        flag.className = "language-dropdown-flag";
        flag.src = this.flagsPath + language.flag;
        flag.alt = "";
        flag.draggable = false;

        const name = document.createElement("span");
        name.className = "language-dropdown-name";
        name.textContent = language.name;

        const arrow = document.createElement("span");
        arrow.className = "language-dropdown-arrow";
        arrow.setAttribute("aria-hidden", "true");

        this.trigger.append(flag, name, arrow);

        for (const item of this.items) {
            const selected = item.dataset.code === this.selected;
            item.setAttribute("aria-selected", String(selected));
            item.tabIndex = selected ? 0 : -1;
        }
    }

    setLanguage(code) {
        const language = this.languages.find(lang => lang.code === code);
        if (!language || code === this.selected) return;

        this.selected = code;
        this.render();
        this.onChange(code, language);
    }

    show(focusSelected = false) {
        this.open = true;
        this.menu.classList.add("is-open");
        this.trigger.setAttribute("aria-expanded", "true");

        if (focusSelected) {
            const item = this.items.find(item => item.dataset.code === this.selected);
            (item || this.items[0])?.focus();
        }
    }

    close(restoreFocus = false) {
        this.open = false;
        this.menu.classList.remove("is-open");
        this.trigger.setAttribute("aria-expanded", "false");

        if (restoreFocus) this.trigger.focus();
    }

    bindEvents() {
        this.onTriggerClick = () => {
            if (this.open) {
                this.close();
            } else {
                this.show();
            }
        };

        this.onTriggerKeydown = e => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                this.show(true);

                if (e.key === "ArrowUp") {
                    const selectedIndex = this.items.findIndex(item => item.dataset.code === this.selected);
                    this.items[selectedIndex >= 0 ? selectedIndex : this.items.length - 1]?.focus();
                }
            } else if (e.key === "Escape") {
                this.close();
            }
        };

        this.onDocumentPointerDown = e => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        };

        this.onDocumentKeydown = e => {
            if (e.key === "Escape" && this.container.contains(document.activeElement)) {
                this.close(true);
            }
        };

        this.trigger.addEventListener("click", this.onTriggerClick);
        this.trigger.addEventListener("keydown", this.onTriggerKeydown);
        document.addEventListener("pointerdown", this.onDocumentPointerDown);
        document.addEventListener("keydown", this.onDocumentKeydown);
    }

    setValue(code) {
        const language = this.languages.find(lang => lang.code === code);
        if (!language) return false;
        if (code !== this.selected) {
            this.selected = code;
            this.render();
        }
        return true;
    }

    destroy() {
        this.trigger.removeEventListener("click", this.onTriggerClick);
        this.trigger.removeEventListener("keydown", this.onTriggerKeydown);
        document.removeEventListener("pointerdown", this.onDocumentPointerDown);
        document.removeEventListener("keydown", this.onDocumentKeydown);
        this.container.replaceChildren();
    }
}
