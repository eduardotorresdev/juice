import {isNumeric} from '@utils';
import {lightActions} from './actions';
import {store} from './store';

const amountEl: HTMLInputElement | null =
    document.querySelector('#ambient__amount');
const redEl: HTMLInputElement | null = document.querySelector('#ambient__red');
const greenEl: HTMLInputElement | null =
    document.querySelector('#ambient__green');
const blueEl: HTMLInputElement | null =
    document.querySelector('#ambient__blue');

const updateLight = () => {
    const amount = isNumeric(amountEl.value) ? parseInt(amountEl.value) : 1;
    const red = isNumeric(redEl.value) ? parseInt(redEl.value) : 255;
    const green = isNumeric(greenEl.value) ? parseInt(greenEl.value) : 255;
    const blue = isNumeric(blueEl.value) ? parseInt(blueEl.value) : 255;

    store.dispatch(lightActions.changeAmbientLight(amount, [red, green, blue]));
};

amountEl.addEventListener('input', updateLight);
redEl.addEventListener('input', updateLight);
greenEl.addEventListener('input', updateLight);
blueEl.addEventListener('input', updateLight);
