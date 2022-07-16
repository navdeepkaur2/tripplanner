const accessToken = `pk.
eyJ1IjoiY2hyaXMtbWFjZG9uYWxk
IiwiYSI6ImNrNGN3NHdtNTBoYXozbGxyaW16MW52Y3EifQ.OcnydfpxGWU11o0GbRyoyw
`;
const transitApiKey = 'pmPtmdmquyccT_1ubmb2';
const B_BOX = '-97.325875, 49.766204, -96.953987, 49.99275';

const BASE_URL= 'https://api.mapbox.com/geocoding/v5';

let originGeoArr = [];
let destinationGeoArr = [];

const originFormEle = document.querySelector(`.origin-form`);
originFormEle.addEventListener(`submit`, function (event) {
    event.preventDefault();
    const input = event.target.querySelector(`input`);
    searchOriginLocation(input.value);
    input.value='';
});

const destinationFormEle = document.querySelector(`.destination-form`);
destinationFormEle.addEventListener(`submit`, function (event) {
    event.preventDefault();
    const input = event.target.querySelector(`input`);
    searchDestinationLocation(input.value);
    input.value='';
});

function removeTheSelectedListElement(location) {
  const listEle = location.querySelectorAll(`li`);
  listEle.forEach((list) => {
    if(list.classList.contains(`selected`)) {
      list.classList.remove(`selected`);
    }
  });
}

const originListEl = document.querySelector(`.origins`);
originListEl.addEventListener(`click`, function (event) {
    const targetListEl = event.target.closest('.origin-container .origins li');
    removeTheSelectedListElement(originListEl);
    targetListEl.classList.add(`selected`);
    originGeoArr = [];
    originGeoArr.push(targetListEl.dataset.lat, targetListEl.dataset.long);
    return originGeoArr;
});

const destinationListEl = document.querySelector(`.destinations`);
destinationListEl.addEventListener(`click`, function (event) {
    const targetListEl = event.target.closest(".destination-container .destinations li");
    removeTheSelectedListElement(destinationListEl);
    targetListEl.classList.add(`selected`);
    destinationGeoArr = [];
    destinationGeoArr.push(targetListEl.dataset.lat, targetListEl.dataset.long);
    return destinationGeoArr;
});

const buttonEle = document.querySelector(`.plan-trip`);
buttonEle.addEventListener(`click`, function (event) {
  
let originLon=originGeoArr[1];
let originLat=originGeoArr[0];
let destinationLon=destinationGeoArr[1];
let destinationLat=destinationGeoArr[0];

    if(originLon !== undefined && destinationLon !== undefined) {
        if(originLat == destinationLat && originLon == destinationLon) {
          alert(`No need to move!`);
        } else {
          getTrip(originLat, originLon, destinationLat, destinationLon);
        }
      }
});

function searchOriginLocation(query) {
  const url=`${BASE_URL}/mapbox.places/${query}.json?access_token=${accessToken}&limit=10&bbox=${B_BOX}`
  console.log(url)
  fetch(url)
    .then((response) => response.json())
    .then((data) => renderOriginLocations(data.features));
}

function searchDestinationLocation(query) {
  const url=`${BASE_URL}/mapbox.places/${query}.json?access_token=${accessToken}&limit=10&bbox=${B_BOX}`
  fetch(url)
  .then((response) => response.json())
  .then(data => renderDestinationsLocations(data.features));
}

const renderOriginLocations=features=> {
  console.log(features)
  originListEl.innerHTML = "";
  for (let feature of features) {
    originListEl.insertAdjacentHTML('beforeend', `
      <li data-long=${feature.center[0]} data-lat=${feature.center[1]} class="">
        <div class="name">${feature.text}</div>
        <div>${feature.properties.address}</div>
      </li>
    `)
  }
}

const renderDestinationsLocations=features=> {
  destinationListEl.innerHTML = "";
  for (let feature of features) {
    destinationListEl.insertAdjacentHTML('beforeend', `
      <li data-long=${feature.center[0]} data-lat=${feature.center[1]} class="">
        <div class="name">${feature.text}</div>
        <div>${feature.properties.address}</div>
      </li>
    `)
  }
}

function getTrip(originLat,originLon,destinationLat,destinationLon){
 const url=`https://api.winnipegtransit.com/v3/trip-planner.json?`
+ `api-key=${transitApiKey}&origin=geo/${originLat},${originLon}`
+ `&destination=geo/${destinationLat},${destinationLon}`;
 fetch(url)
  .then(response => {
    if (url) {
      return response.json();
    } else {
      throw new Error('No related trips!');
    }
  })
  .then(data => renderTrip( data.plans[0].segments));
}

  function renderTrip(plansArr){
  const tripEle = document.querySelector('.my-trip');
  tripEle.innerHTML='';
  tripEle.innerHTML = listOfPlans(plansArr);
  }

  function listOfPlans(plans){
    let html='';
    plans.forEach(plan => {
      if (plan.type === `walk`) {
        if (plan.to.stop === undefined) {
          html +=  `<li>
          <i class="fas fa-walking" aria-hidden="true"></i> Walk for ${plan.times.durations.total} minutes to your destination.
        </li>`
        } else {
          html +=  `<li>
          <i class="fas fa-walking" aria-hidden="true"></i>
          Walk for ${plan.times.durations.total} minutes to stop #${plan.to.stop.key} - ${plan.to.stop.name}
        </li>`
        }
      } else if (plan.type === `ride`) {
        html +=  `<li>
          <i class="fas fa-bus" aria-hidden="true"></i>
          Ride the ${plan.route.name ? plan.route.name : plan.route.key} for ${plan.times.durations.total} minutes.
        </li>`
      } else if (plan.type === `transfer`) {
        html +=  `<li>
        <i class="fas fa-ticket-alt" aria-hidden="true"></i>
       Transfer from stop #${plan.from.stop.key} - ${plan.from.stop.name} to stop #${plan.to.stop.key} - ${plan.to.stop.name}
      </li>`
      }
    });
  return html;
  }