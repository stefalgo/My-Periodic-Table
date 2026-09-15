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
