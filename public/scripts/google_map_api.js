$(() => {
  const loadMap = function(location, element) {
    let newMap = new google.maps.Map(element, {
      center: location,
      zoom: 16
    });
    new google.maps.Marker({
      position: location,
      map: newMap,
      title: 'Hello World!'
    });
  };

  const getGeolocation = function(callback) {
    $.ajax({
      method:'POST',
      url:'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCS2HA8sY280xwjwAZbVRoA5hIzfDg41xM'
    }).done((location) => {
      callback(location.location);
    });
  };

  const getPlaces  = function(options ,callback) {
    const urlOption = options.split(' ').join('&');
    $.ajax({
      method: 'POST',
      url: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?query=${urlOption}&key=AIzaSyCS2HA8sY280xwjwAZbVRoA5hIzfDg41xM`
    }).done((placeList) => {
      let placeObj = {};
      placeList.results.forEach(element => {
        placeObj[element.place_id] = {
          placeId: element.place_id,
          placeName: element.name,
          rating: element.rating,
          formattedAddress: element.formatted_address,
          long: element.geometry.location.lng,
          lat: element.geometry.location.lat,
          photoReference: element.photo_reference,
          type: element.type
        };
      });
      callback(placeObj);
    });
  };

  const displayPlaces = function(placeObj) {
    for (let place in placeObj) {
      $.ajax({
        method: 'POST',
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photoReference}&key=AIzaSyCS2HA8sY280xwjwAZbVRoA5hIzfDg41xM`
      }).done((url)=>{
        const markup = `
        <div class = "card" style = "width: 18rem;">
          <img class="card-img-top" src=${url} alt="image">
            <div class='card-body'>
            <h5 class="card-title">${place.placeName}</h5>
            <span class="badge badge-pill badge-info">${place.type[0]}</span>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">Rating: ${place.rating}</li>
              <li class="list-group-item">${place.formattedAddress}</li>
            </ul>
            </div>
        </div>
        `;
      });
    }
  };

  $showGeolocation = $('#showGeolocation');
  $showGeolocation.on('click', (event) => {
    event.preventDefault();
    getGeolocation((location) => {
      $(`<div>${'lat: ' + location.lat + ',' + 'lng: ' + location.lng}</div>`).appendTo('#toShowLoc');
    });
  });

  $showmap = $('#showmap');
  $showmap.on('click', (even) => {
    const mapElement = $('.map')[0];
    let myloc;
    // {lat: 49.2807762, lng: -123.022516000000}

    getGeolocation((location)=>{
      loadMap(location,mapElement);
    });
  });

  $('.findPlaces').on('submit', (event) => {
    event.preventDefault();
    getPlaces($('.textQuery').val());
    const markup = `
    <section class='place-viewer mx-auto'>
    </section>
    <button class='close-display-layer btn mx-auto'>Exit</button>
    `;
    const element = $('<div>').addClass('display-places-options');
    element.html(markup);
    element.appendTo('body');
    $('.close-display-layer').on('click' ,() => {
      $('.display-places-options').remove();
    });
  });

  

});
