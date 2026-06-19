export function showCopyToast(event: MouseEvent | HTMLElement, message: string, duration = 2000) {
    const target = event instanceof HTMLElement ? event : (event.currentTarget as HTMLElement || event.target as HTMLElement);
    if (!target) return;

    // 기존 띄워진 동일한 위치의 툴팁이 있다면 제거 (중복 방지)
    const existingTooltips = document.querySelectorAll('.copy-tooltip-floating');
    existingTooltips.forEach(el => el.remove());

    // 툴팁 엘리먼트 생성
    const tooltip = document.createElement('div');
    tooltip.className = 'copy-tooltip-floating';
    tooltip.innerText = message;

    document.body.appendChild(tooltip);

    // 좌표 계산
    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // 버튼 상단 중앙에 배치
    const tooltipHeight = 32; // 대략적인 높이
    const top = rect.top + scrollTop - tooltipHeight - 8; // 8px 간격
    const left = rect.left + scrollLeft + (rect.width / 2);

    tooltip.style.position = 'absolute';
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.zIndex = '99999';

    // 브라우저 렌더링 동기화 후 활성화 클래스 추가
    requestAnimationFrame(() => {
        tooltip.classList.add('visible');
    });

    // 5초(duration) 후 제거
    setTimeout(() => {
        tooltip.classList.remove('visible');
        const onTransitionEnd = () => {
            tooltip.removeEventListener('transitionend', onTransitionEnd);
            tooltip.remove();
        };
        tooltip.addEventListener('transitionend', onTransitionEnd);
        // 트랜지션 미작동 대비 안전 제거 장치
        setTimeout(() => tooltip.remove(), 300);
    }, duration);
}
