import '@babel/polyfill';
import {displayMap} from './mapbox';
import {login, logout} from './login';
import { updateData } from './updateSettings';

const loginForm = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');

//checking if id map exist
if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if(loginForm){
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password);
    });
}

if(logOutBtn) logOutBtn.addEventListener('click', logout);


if(userDataForm){
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        updateData(name,email);
    });
}