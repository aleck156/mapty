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
class Workout {
  #date = new Date();
  #id = (Date.now() + '').slice(-10);

  constructor(coords, dist, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = dist; // in km
    this.duration = duration; // in minutes
  }
}

class Running extends Workout {
  constructor(coords, dist, duration, cadence) {
    super(coords, dist, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, dist, duration, elevation) {
    super(coords, dist, duration);
    this.elevation = elevation;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.speed / 60);
    return this.speed;
  }
}

//////////////////////////////////////////////////
// ARCHITECTURE
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }

  _getPosition() {
    const error = function () {
      console.log('Your browser does not support geolocation');
    };

    // in a callback functions, it is the calling method that sets the context of *this* keyword
    // in order to make it work, you have to bind it with the current instance of class
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
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;

    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;

    // get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value; // handy way of converting strings to numbers
    const duration = +inputDuration.value;
    let workout;

    // check if data is valid

    // create Running/Cycling object based on the data
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !validInputs(cadence, distance, duration) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert('Inputs have to be positive numbers');
      }

      workout = new Running([lat, lng], distance, duration, cadence);
      console.log(workout);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(elevation, distance, duration) ||
        !allPositive(distance, duration)
      ) {
        return alert('Inputs have to be positive numbers');
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
      console.log(workout);
    }

    // add new object to workout array

    // render workout on map as marker
    L.marker([lat, lng])
      .addTo(this.#map)
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
    // render new workout on the list

    // hide form and clear the input fields

    // clear input fields
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        '';

    // display marker
  }
}

const app = new App();

// app._getPosition();
/////////////////////////////////////////////////////////////////
// FUNCTIONS

/////////////////////////////////////////////////////////////////
// EVENT LISTENERES

/////////////////////////////////////////////////////////////////
// Rendering Workout Input Form
