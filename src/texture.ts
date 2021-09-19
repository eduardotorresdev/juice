import {textureActions} from './actions';
import {store} from './store';

const texturaButton = document.querySelectorAll('.textura__button');

texturaButton.forEach((button) => {
    button.addEventListener('click', () => {
        const img = button.getAttribute('data-texture');
        if (img) store.dispatch(textureActions.setTexture(img));

        texturaButton.forEach((b) => {
            b.classList.remove('btn--active');
        });
        button.classList.add('btn--active');
    });
});
