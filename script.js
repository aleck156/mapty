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

/////////////////////////////////////////////////////////////////
// CLASSES

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
  }

  _getPosition() {
    const error = function () {
      console.log('Your browser does not support geolocation');
    };

    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), error);
  }

  _loadMap(pos) {
    const { latitude, longitude } = pos.coords;

    const coords = [latitude, longitude];

    console.log(`Your browser do support geolocation`);
    console.log(`Latitude:`.padEnd(12) + `${latitude}`);
    console.log(`Longitude:`.padEnd(12) + `${longitude}`);

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords)
      .addTo(this.#map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();

    // viewing the internals of leaflet.js
    // console.log(map);

    // handling clicks on map
    this.#map.on('click', function (mapE) {
      this.#mapEvent = mapE;
      console.log(mapEvent);
      form.classList.remove('hidden');
      inputDistance.focus();
    });
  }

  _showForm() {}

  _toggleElevationField() {}

  _newWorkout() {}
}

const app = new App();

// app._getPosition();
/////////////////////////////////////////////////////////////////
// FUNCTIONS

/////////////////////////////////////////////////////////////////
// EVENT LISTENERES

form.addEventListener('submit', function (e) {
  e.preventDefault();

  // clear input fields
  inputDistance.value =
    inputDuration.value =
    inputElevation.value =
    inputCadence.value =
      '';

  // display marker
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

inputType.addEventListener('change', function (e) {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});

/////////////////////////////////////////////////////////////////
// Rendering Workout Input Form
