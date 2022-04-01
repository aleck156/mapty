'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map;

/////////////////////////////////////////////////////////////////
// FUNCITONS

const success = function (pos) {
  const { latitude, longitude } = pos.coords;

  const coords = [latitude, longitude];

  console.log(`Your browser do support geolocation`);
  console.log(`Latitude:`.padEnd(12) + `${latitude}`);
  console.log(`Longitude:`.padEnd(12) + `${longitude}`);

  map = L.map('map').setView(coords, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker(coords)
    .addTo(map)
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup();

  // viewing the internals of leaflet.js
  // console.log(map);
  map.on('click', function (mapEvent) {
    console.log(mapEvent);
    form.classList.remove('hidden');
    inputDistance.focus();
  });
};

const error = function () {
  console.log('Your browser does not support gelocation');
};

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(success, error);

/////////////////////////////////////////////////////////////////
// EVENT LISTENERES

form.addEventListener('submit', function (e) {
  // display marker
  e.preventDefault();
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      }).setContent('hello world')
    )
    .openPopup();
});

/////////////////////////////////////////////////////////////////
// Rendering Workout Input Form
