import '@babel/polyfill';
import {displayMap} from './mapbox';
import {login, logout} from './login';
import { updateSettings } from './updateSettings';

const loginForm = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password')

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
		//using multipart form data
		const form = new FormData();
		form.append('name',document.getElementById('name').value)
		form.append('email',document.getElementById('email').value)
		form.append('photo',document.getElementById('photo').files[0])
		console.log(form);
		updateSettings(form,'data');

		//a normal way without image
		// const name = document.getElementById('name').value;
		// const email =  document.getElementById('email').value;
		// updateSettings({name,email}, 'data');
	});
}

if(userPasswordForm){
	userPasswordForm.addEventListener('submit', async e => {
		e.preventDefault();
		document.querySelector('.btn--save-password').textContent = 'Updating ...' ;
		
		const passwordCurrent = document.getElementById('password-current').value;
		const password = document.getElementById('password').value;
		const passwordConfirm = document.getElementById('password-confirm').value;
		await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');
		
		document.getElementById('password-current').value = '';
		document.getElementById('password').value = '';
		document.getElementById('password-confirm').value = '';
		document.querySelector('.btn--save-password').textContent = 'Save Password' ;
	});
}