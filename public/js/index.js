/* eslint-disable */
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSetting } from './updateSettings';
import { bookTour } from './stripe';

// DOM Elements
const mapBox = document.querySelector('#map');
const loginForm = document.querySelector('.login--form');
const updateForm = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-password');
const logoutBtn = document.querySelector('.nav__el--logout');
const bookBtn = document.querySelector('#bookTour');
console.log(bookBtn);

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    console.log(`email from index: `, email, password);
    login(email, password);
  });

// if (updateForm) updateSetting(updateForm, 'data');
if (updateForm)
  updateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSetting(form, 'data');
  });

// if (updatePassword) updateSetting(updatePassword, 'password');
if (updatePassword)
  updatePassword.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('currentPassword', document.getElementById('password-current').value);
    form.append('newPassword', document.getElementById('password').value);
    form.append('newPasswordConfirm', document.getElementById('password-confirm').value);

    const data = Object.fromEntries(form);
    updateSetting(data, 'password');
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.innerHTML = 'Processing';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
