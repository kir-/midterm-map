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

  const createMap = function(query, name, userID) {
    const queryParsed = query.split(' ').join('+');
    $.ajax({
      method: 'POST',
      url: "/markup",
      data: {
        "query" : queryParsed
      }
    }).done((location)=>{
      const keys = Object.keys(location);
      if (keys) {
        $.ajax({
          method: 'POST',
          url: '/addmap',
          data: {
            user: userID,
            name: name,
            longitude: location.keys[0].geometry.location.lng,
            latitude: location.keys[0].geometry.location.lat
          }
        });
      }
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
    const urlOption = options.split(' ').join('+');
    $.ajax({
      method: "POST",
      url: "/markup",
      data: {
        "query" : urlOption
      }
    }).done((placeObject) => {
      let placeList = JSON.parse(placeObject);
      let placeObj = {};
      placeList.results.forEach(element => {
        if (Object.keys(placeObj).length <= 40 && element.photos) {
          placeObj[element.place_id] = {
            placeId: element.place_id,
            placeName: element.name,
            rating: element.rating,
            formattedAddress: element.formatted_address,
            long: element.geometry.location.lng,
            lat: element.geometry.location.lat,
            photoReference: element.photos[0].photo_reference,
            type: element.types
          };
        }
      });
      callback(placeObj);
    });
  };

  const displayPlaces = function(placeObj) {
    for (let place in placeObj) {
      $.ajax({
        method: "POST",
        url: "/loadimage",
        data: {
          "photoID" : placeObj[place].photoReference
        }
      }).done((url)=>{
        const markup = `
          <img class="card-img-top " src=${url} alt="image">
            <div class='card-body'>
            <h5 class="card-title">${placeObj[place].placeName}</h5>
            <span class="badge badge-pill badge-info">${placeObj[place].type[0]}</span>
            <ul class="list-group list-group-flush">
              <li class="list-group-item rating">Rating: ${placeObj[place].rating}</li>
              <li class="list-group-item address">${placeObj[place].formattedAddress}</li>
            </ul>
            </br>
            <div class='d-flex justify-content-end'>
            <button class='btn btn-outline-success mt-2 add-place'>add place</button>
            </div>
            <p class='d-none long'>${placeObj[place].long}</p>
            <p class='d-none lat'>${placeObj[place].lat}</p>
            <p class='d-none placeid'>${placeObj[place].placeId}</p>
            </div>
        `;
        const element = $('<span>').addClass("card");
        element.html(markup);
        element.appendTo('.card-group');

        $(".add-place").on('click',function() {
          const name = $(this).parent().parent().parent().children('.card-body').children('.card-title').text();
          const image = $(this).parent().parent().parent().children('.card-img-top').attr('src');
          const type = $(this).parent().parent().parent().children('.card-body').children('.badge-info').text();
          const rating = $(this).parent().parent().parent().children('.card-body').children('ul').children('.rating').text();
          const address = $(this).parent().parent().parent().children('.card-body').children('ul').children('.address').text();
          const longitude = $(this).parent().parent().parent().children('.card-body').children('.long').text();
          const latitude = $(this).parent().parent().parent().children('.card-body').children('.lat').text();
          const place_id = $(this).parent().parent().parent().children('.card-body').children('.placeid').text();
          console.log(`name: ${name}\nimage: ${image}\ntypee: ${type}\nrating: ${rating}\naddress: ${address}\nlongitude: ${longitude}\nlatitude: ${latitude}\nplace id: ${place_id}`);
          $(this).text('added');
          $(this).removeClass().addClass('btn btn-success mt-2 add-place');
          $(this).prop('disabled', true);
        });
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
  $showmap.on('click', (event) => {
    const mapElement = $('.map')[0];
    let myloc;

    getGeolocation((location)=>{
      loadMap(location,mapElement);
    });
  });

  $('.findPlaces').on('submit', (event) => {
    event.preventDefault();
    const markup = `
    <section class='place-viewer mx-auto'>
    <div class='card-group'>
    </div>
    </section>
    <button class='close-display-layer btn mx-auto'>Exit</button>
    `;
    const element = $('<div>').addClass('display-places-options');
    element.html(markup);
    element.appendTo('body');
    getPlaces($('.textQuery').val(),displayPlaces);
    $('.close-display-layer').on('click' ,() => {
      $('.display-places-options').remove();
    });
  })

  $('.addMap').on('submit', (event)=>{
    event.preventDefault();

  });

});
