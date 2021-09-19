const sliders = document.querySelectorAll('.slider');

const updateSlider = (
    input: HTMLInputElement,
    progress: Element,
    marker: Element,
) => {
    const value = parseInt(input.value);
    const min = parseInt(input.min) || 0;
    const max = parseInt(input.max) || 100;
    const percentage = ((value - min) / (max - min)) * 100;

    progress.setAttribute('style', `width: ${percentage}%`);
    marker.setAttribute('style', `left: ${percentage}%`);
};

sliders.forEach((slider) => {
    const input: HTMLInputElement | null =
        slider.querySelector('.slider__input');
    const progress = slider.querySelector('.slider__progress');
    const marker = slider.querySelector('.slider__marker');

    input.addEventListener('input', () =>
        updateSlider(input, progress, marker),
    );
    updateSlider(input, progress, marker);
});
