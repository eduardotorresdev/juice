const sliders = document.querySelectorAll('.slider');

sliders.forEach((slider) => {
    const input: HTMLInputElement | null =
        slider.querySelector('.slider__input');
    const progress = slider.querySelector('.slider__progress');
    const marker = slider.querySelector('.slider__marker');

    input.addEventListener('input', () => {
        const value = parseInt(input.value);
        const max = parseInt(input.max) || 100;
        const percentage = (value / max) * 100;

        progress.setAttribute('style', `width: ${percentage}%`);
        marker.setAttribute('style', `left: ${percentage}%`);
    });
});
