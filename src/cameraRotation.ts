import {degToRad} from '@utils';
import {webgl} from './webgl';

const rotationXEl: HTMLInputElement | null = document.querySelector(
    '#camera__rotation-x',
);

const rotationYEl: HTMLInputElement | null = document.querySelector(
    '#camera__rotation-y',
);

const rotationZEl: HTMLInputElement | null = document.querySelector(
    '#camera__rotation-z',
);

let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;

const update = async () => {
    const instance = await webgl;
    instance.render(rotationX, rotationY, rotationZ);
};


rotationXEl?.addEventListener('input', async () => {
    const value = parseInt(rotationXEl.value);

    if (Number.isInteger(value)) {
        rotationX = degToRad(value);
        update();
    }
});

rotationYEl?.addEventListener('input', async () => {
    const value = parseInt(rotationYEl.value);

    if (Number.isInteger(value)) {
        rotationY = degToRad(value);
        update();
    }
});

rotationZEl?.addEventListener('input', async () => {
    const value = parseInt(rotationZEl.value);

    if (Number.isInteger(value)) {
        rotationZ = degToRad(value);
        update();
    }
});

update();
