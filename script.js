'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const btnReset = document.querySelector('.resetData');

/////////////////////////////////////////////////////////////////
// CLASSES
class Workout {
  #date = new Date();
  id = (Date.now() + '').slice(-10);
  #click = 0;

  constructor(coords, dist, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = dist; // in km
    this.duration = duration; // in minutes
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.#date.getMonth()]
    } ${this.#date.getDate()}`;
  }

  click() {
    this.#click++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, dist, duration, cadence) {
    super(coords, dist, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, dist, duration, elevation) {
    super(coords, dist, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//////////////////////////////////////////////////
// ARCHITECTURE
class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 13;

  constructor() {
    // get user's position
    this._getPosition();

    // get data from local storage
    this._getLocalStorage();

    // attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    containerWorkouts.addEventListener('click', this._deleteWorkout.bind(this));
    btnReset.addEventListener('click', e => this.reset(e));
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

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords)
      .addTo(this.#map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();

    // handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(w => {
      this._renderWorkout(w);
      this._renderWorkoutMarker(w);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;

    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        '';

    // no the best way to do it, but couldn't figure out any other way ... yet
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1500);
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
    }

    // add new object to workout array
    this.#workouts.push(workout);

    // render workout on map as marker
    this._renderWorkoutMarker(workout);
    // render new workout on the list
    this._renderWorkout(workout);

    // hide form and clear the input fields
    this._hideForm();

    // set localStorage for all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        }).setContent(
          `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
        )
      )
      .openPopup();

    this.#map.setView(workout.coords, this.#mapZoomLevel);
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <button class='workout__delete'>X</button>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        } </span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>`;

    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence.toFixed(1)}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;
    }

    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevation.toFixed(1)}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using the public interface
    // workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    // the problem with loading data from localStorage is that it loses information about __proto__ reference - every workout has a base of Object, not Workout
    // the prototype chain is lost //
    const localStorageWorkouts = localStorage.getItem('workouts');

    if (!localStorageWorkouts) return;

    // here, we should recreate proper instances of object classes to keep the inherited methods working
    this.#workouts = JSON.parse(localStorageWorkouts);

    return JSON.parse(localStorageWorkouts);
  }

  reset(e) {
    e.preventDefault();
    localStorage.removeItem('workouts');
    location.reload();
  }

  _deleteWorkout(e) {
    // guard against false-positive trigger
    if (!e.target.classList.contains('workout__delete')) return;

    // grab the nearest html element
    const workoutHTML = e.target.closest('.workout');

    // find that workout in current workout object list
    const workoutEl = this.#workouts.find(
      work => work.id === workoutHTML.dataset.id
    );

    // remove it from the workouts list visible on page
    workoutHTML.remove();

    // remove it from workout list
    this.#workouts.splice(this.#workouts.indexOf(workoutEl), 1);

    // console.log(this.#workouts);
    this._setLocalStorage();
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
