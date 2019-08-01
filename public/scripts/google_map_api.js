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

  // $showGeolocation = $('#showGeolocation');
  // $showGeolocation.on('click', (event) => {
  //   event.preventDefault();
  //   getGeolocation((location) => {
  //     $(`<div>${'lat: ' + location.lat + ',' + 'lng: ' + location.lng}</div>`).appendTo('#toShowLoc');
  //   });
  // });

  // $showmap = $('#showmap');
  // $showmap.on('click', (event) => {
  //   const mapElement = $('.map')[0];
  //   let myloc;

  //   getGeolocation((location)=>{
  //     loadMap(location,mapElement);
  //   });
  // });

  const deletePlaces = function() {
    $('.delete-places').on('click', function() {
      const placeName = $(this).parent().children('.place-name').text();
      $.ajax({
        method: "POST",
        url: `/delete`,
        data: {
          placeName
        }
      }).done(() => {
      })
      $(this).parent().parent().remove()
    })
    }   


  const addEventlisterForMap = function() {
    $('.findPlaces').on('submit', function(event) {
      const id = $(this).children('.mapid').text()
      event.preventDefault();
      const markup = `
      <section class='place-viewer mx-auto'>
      <div class='card-group'>
      </div>
      </section>
      <div class='id-for-add-place d-none'>${id}</div>
      <button class='close-display-layer btn mx-auto'>Exit</button>
      `;
      const element = $('<div>').addClass('display-places-options');
      element.html(markup);
      element.appendTo('body');

      getPlaces($('.textQuery').val(),displayPlaces);

      $('.close-display-layer').on('click' , function (event) {
        const mapId = $(this).parent().children('.id-for-add-place').text()
        const mapObj = {
          id: mapId
        }
        
        getPlacesFromSql(mapObj, (map,places) => {
          const placeTORender = $(`div[data-value="${mapId}"]`).parent().parent().children('.marked-places')
          placeTORender.html('')
          for (let place of places) {
            console.log("currently working on => ", place);
            const placeElement = $('<section>').addClass('row').addClass('marked-place')
            placeElement.html(`
            <div class='place-imgs col-3'><img class='map-img' src=${place.image}></div>
            <div class='place-details col-9'>
              <button type="button" class="btn btn-danger float-right delete-places"><i class="fas fa-times"></i></button>
              <p class='place-name'>${place.name}</p>
              <p class='place-rating'>rating: ${place.rating}</p>
              <p class='place-address'>address: ${place.address}</p>
            </div>
            `)
            placeTORender.append(placeElement);
          }
          deletePlaces()

        })


        $('.display-places-options').remove();
      });
    });
    deletePlaces()
  }
  



  const getPlacesFromSql = function (map, callback) {
    $.ajax({
      method: "POST",
      url: "/map_info",
      data: {
        "mapId" : map.id
      }
    }).done((places) => {
      callback(map, places)
    })
  }

  const getmapsFromSql = function(callback) {
    $.ajax({
      method: "GET",
      url: "/maps",
    }).done((maps) => {
      callback(maps)
    })
  }

  const createHtml = function (map, places) {
    let html = `
      <p class='map-name'>map name: ${map.name}</p>
      <div class="row map-row">
          <div class="map col-6">
          <div class='d-none mapid' data-value='${map.id}'>${map.id}</div>
          </div>
          <div class='col-6 marked-places'>
    `;
    for (let place of places) {
      console.log(place.image)
      html += `
      <section class='row marked-place'>
      <div class='place-imgs col-3'><img class='map-img' src=${place.image}></div>
      <div class='place-details col-9'>
        <button type="button" class="btn btn-danger float-right delete-places"><i class="fas fa-times"></i></button>
        <p class='place-name'>${place.name}</p>
        <p class='place-rating'>rating: ${place.rating}</p>
        <p class='place-address'>address: ${place.address}</p>
      </div>
    </section>
      `
    }
    html += `
    </div>
      </div>
        <div class='edit d-flex flex-row-reverse'>
            <button class="btn btn-primary mr-3 mt-2" type="button" data-toggle="collapse" data-target="#searchForm${map.id}" aria-expanded="false" aria-controls="searchForm">
                Edit
            </button>
        </div>
          <div class="collapse" id="searchForm${map.id}">
            <div class='row'>
              <form class='col-5 findPlaces'>
                  <div class='mapid d-none'>${map.id}</div>
                  <div class="form-group">
                    <p>Find Places</p>
                    <input type="text" class="form-control textQuery" name='textQuery' placeholder="Enter places">
                  </div>
                  <button type="submit" class="btn btn-primary">Submit</button>
              </form>
            </div>
        </div>
    `
    return html;



  }

  const renderMapsections = function() {
    getmapsFromSql((maps) => {

      for (let map of maps) {
        getPlacesFromSql(map, (map, places) => {

          
          // create html content
          const htmlElement = createHtml(map,places);
          // create element and add class
          const mapSection = $('<section>').addClass('map-element');
          // add html to section
          mapSection.html(htmlElement)
          // appened to target 
          $('<div>').addClass('map-container').html(mapSection).appendTo('.main-section')
          // call showmap directly


          //add event listen
          addEventlisterForMap()

        })
      }
      
    })
  }
  renderMapsections();


  $('.addMap').on('submit', (event)=>{
    event.preventDefault();

  });
});
