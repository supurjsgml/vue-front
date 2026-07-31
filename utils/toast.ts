export function showCopyToast(event?: MouseEvent | HTMLElement | null, message = '클립보드에 복사 되었습니다.', duration = 2200) {
    if (typeof document === 'undefined') return;

    // 1. 기존 버튼 근처 플로팅 툴팁 처리 (event가 전달되었을 경우)
    if (event) {
        const target = event instanceof HTMLElement ? event : (event.currentTarget as HTMLElement || event.target as HTMLElement);
        if (target) {
            const existingTooltips = document.querySelectorAll('.copy-tooltip-floating');
            existingTooltips.forEach(el => el.remove());

            const tooltip = document.createElement('div');
            tooltip.className = 'copy-tooltip-floating';
            tooltip.innerText = message;

            document.body.appendChild(tooltip);

            const rect = target.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            const tooltipHeight = 32;
            const top = rect.top + scrollTop - tooltipHeight - 8;
            const left = rect.left + scrollLeft + (rect.width / 2);

            tooltip.style.position = 'absolute';
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.zIndex = '99999';

            requestAnimationFrame(() => {
                tooltip.classList.add('visible');
            });

            setTimeout(() => {
                tooltip.classList.remove('visible');
                const onTransitionEnd = () => {
                    tooltip.removeEventListener('transitionend', onTransitionEnd);
                    tooltip.remove();
                };
                tooltip.addEventListener('transitionend', onTransitionEnd);
                setTimeout(() => tooltip.remove(), 300);
            }, duration);
        }
    }

    // 2. 엘든링 스타일 중앙 배너 연출 함수 호출
    showEldenRingBanner(message, duration);
}

export function showEldenRingBanner(message = '클립보드에 복사 되었습니다.', duration = 2200) {
    if (typeof document === 'undefined') return;

    // 기존 활성화된 배너가 있다면 제거
    const existingBanners = document.querySelectorAll('.elden-ring-banner-overlay');
    existingBanners.forEach(el => el.remove());

    const overlay = document.createElement('div');
    overlay.className = 'elden-ring-banner-overlay';

    const content = document.createElement('div');
    content.className = 'elden-banner-content';

    const textWrapper = document.createElement('div');
    textWrapper.className = 'elden-text-wrapper';

    const titleText = 'COPIED TO CLIPBOARD';

    const ghostEl = document.createElement('div');
    ghostEl.className = 'elden-banner-title ghost-layer';
    ghostEl.innerText = titleText;

    const mainEl = document.createElement('div');
    mainEl.className = 'elden-banner-title main-layer';
    mainEl.innerText = titleText;

    textWrapper.appendChild(ghostEl);
    textWrapper.appendChild(mainEl);

    const subTitleEl = document.createElement('div');
    subTitleEl.className = 'elden-banner-subtitle';
    subTitleEl.innerText = message;

    content.appendChild(textWrapper);
    content.appendChild(subTitleEl);

    overlay.appendChild(content);

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    setTimeout(() => {
        overlay.classList.remove('active');
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
        }, 500);
    }, duration);
}
