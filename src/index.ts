import './sass/main.sass';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './webgl';
import './slider';
import './cameraRotation';

const canvas = document.querySelector('.canvas');
canvas.setAttribute('width', window.innerWidth.toString());
canvas.setAttribute('height', window.innerHeight.toString());

window.onload = () => {
    document.querySelector('.app').classList.remove('preload');
};
