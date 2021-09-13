import './sass/main.sass';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const canvas = document.querySelector('.canvas');
canvas.setAttribute('width', window.innerWidth.toString());
canvas.setAttribute('height', window.innerHeight.toString());