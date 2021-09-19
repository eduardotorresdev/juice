import {inputEvent} from '@utils';
import {cameraActions} from './actions';
import {store} from './store';

const positionXEl: HTMLInputElement | null = document.querySelector(
    '#camera__position-x',
);

const positionYEl: HTMLInputElement | null = document.querySelector(
    '#camera__position-y',
);

const positionZEl: HTMLInputElement | null = document.querySelector(
    '#camera__position-z',
);

positionXEl?.addEventListener('input', async () => {
    const value = parseInt(positionXEl.value);
    if (Number.isInteger(value)) {
        store.dispatch(
            cameraActions.setPosition({
                x: value,
            }),
        );
    }
});

positionXEl?.addEventListener('contextmenu', async (e) => {
    e.preventDefault();

    store.dispatch(
        cameraActions.setPosition({
            x: 0,
        }),
    );

    positionXEl.value = '0';
    positionXEl.dispatchEvent(inputEvent);
});

positionYEl?.addEventListener('input', async () => {
    const value = parseInt(positionYEl.value);

    if (Number.isInteger(value)) {
        store.dispatch(
            cameraActions.setPosition({
                y: value,
            }),
        );
    }
});

positionYEl?.addEventListener('contextmenu', async (e) => {
    e.preventDefault();

    store.dispatch(
        cameraActions.setPosition({
            y: 0,
        }),
    );

    positionYEl.value = '0';
    positionYEl.dispatchEvent(inputEvent);
});

positionZEl?.addEventListener('input', async () => {
    const value = parseInt(positionZEl.value);

    if (Number.isInteger(value)) {
        store.dispatch(
            cameraActions.setPosition({
                z: value,
            }),
        );
    }
});

positionZEl?.addEventListener('contextmenu', async (e) => {
    e.preventDefault();

    store.dispatch(
        cameraActions.setPosition({
            z: 0,
        }),
    );

    positionZEl.value = '0';
    positionZEl.dispatchEvent(inputEvent);
});
