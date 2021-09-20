import './sass/main.sass';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {store} from './store';
import {webgl} from './webgl';
import './slider';
import './cameraPosition';
import './cameraRotation';
import './texture';
import './lightPosition';
import './ambientLight';
import './diffuseLight';
import './specularLight';

const canvas = document.querySelector('.canvas');
canvas.setAttribute('width', window.innerWidth.toString());
canvas.setAttribute('height', window.innerHeight.toString());

window.onload = () => {
    document.querySelector('.app').classList.remove('preload');
};

store.subscribe(async () => {
    const instance = await webgl;
    instance.render();
});
