import {degToRad, inputEvent} from '@utils';
import {rotationActions} from './actions';
import {store} from './store';

const rotationXEl: HTMLInputElement | null = document.querySelector(
    '#camera__rotation-x',
);

const rotationYEl: HTMLInputElement | null = document.querySelector(
    '#camera__rotation-y',
);

const rotationZEl: HTMLInputElement | null = document.querySelector(
    '#camera__rotation-z',
);

rotationXEl?.addEventListener('input', async () => {
    const value = parseInt(rotationXEl.value);

    if (Number.isInteger(value)) {
        store.dispatch(
            rotationActions.setRotation({
                x: degToRad(value),
            }),
        );
    }
});

rotationXEl?.addEventListener('contextmenu', async (e) => {
    e.preventDefault();

    store.dispatch(
        rotationActions.setRotation({
            x: 0,
        }),
    );

    rotationXEl.value = '0';
    rotationXEl.dispatchEvent(inputEvent);
});


rotationYEl?.addEventListener('input', async () => {
    const value = parseInt(rotationYEl.value);

    if (Number.isInteger(value)) {
        store.dispatch(
            rotationActions.setRotation({
                y: degToRad(value),
            }),
        );
    }
});

rotationYEl?.addEventListener('contextmenu', async (e) => {
    e.preventDefault();

    store.dispatch(
        rotationActions.setRotation({
            y: 0,
        }),
    );

    rotationYEl.value = '0';
    rotationYEl.dispatchEvent(inputEvent);
});

rotationZEl?.addEventListener('input', async () => {
    const value = parseInt(rotationZEl.value);

    if (Number.isInteger(value)) {
        store.dispatch(
            rotationActions.setRotation({
                z: degToRad(value),
            }),
        );
    }
});

rotationZEl?.addEventListener('contextmenu', async (e) => {
    e.preventDefault();

    store.dispatch(
        rotationActions.setRotation({
            z: 0,
        }),
    );

    rotationZEl.value = '0';
    rotationZEl.dispatchEvent(inputEvent);
});

