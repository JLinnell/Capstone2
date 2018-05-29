const GEOCODE_SEARCH_URL = "https://maps.googleapis.com/maps/api/geocode/json?";
const FOURSQUARE_SEARCH_URL = "https://api.foursquare.com/v2/venues/explore?&client_id=UZD3LGAGEODLXRADR530ZNHVCWFVA4V3B4ESJ52IB2YWQR0M&client_secret=L0OKMQE4AO1J24VTOD0FN15MUX3V3SUXRMYB4AABEL0RHCOH";
const WEATHER_SEARCH_URL = "https://api.openweathermap.org/data/2.5/weather?APPID=eb1406fdf4f43571a136a6bbc04b170c"


function scrollPageTo(myTarget, topPadding) {
    if (topPadding == undefined) {
        topPadding = 0;
    };
    let moveTo = $(myTarget).offset().top - topPadding;
    $('html, body').stop().animate({
        scrollTop: moveTo
    }, 200);
}

/*function autocompleteLocationInput() {
    let options = {
        types: ['(regions)']
    };
    let input = document.getElementById('search-term');
    let autocomplete = new google.maps.places.Autocomplete(input, options);
}*/



function getGeocodeData(searchTerm, callback) {
    const apiKey = 'AIzaSyCfa3SngF_7sadsZMJmY5vCeo_F-LczrC8';
    const query = {
        address: searchTerm,
        key: apiKey,
    };
    $.getJSON(GEOCODE_SEARCH_URL, query, callback);

}

function enterLocation() {
    $('.js-search-form').submit(function (event) {
        event.preventDefault();
        const queryTarget = $(event.currentTarget).find('.js-query');
        const query = queryTarget.val();
        console.log(query);
        queryTarget.val("");
        $('.navigation').removeClass("hide");
        $('#weather-display').html("");
        $('#foursquare-results').html("");
        $('button').removeClass("selected");
        getGeocodeData(query, handleGeocodeResponse);
    });
}

function handleGeocodeResponse(response) {
    console.log("the server responded!");
    console.log(response);
    const first = response.results[0];
    if (first && first.geometry) {
        const latitude = first.geometry.location.lat;
        const longitude = first.geometry.location.lng;
        getFourSquareData(latitude, longitude);
        console.log(latitude, longitude);
        getWeatherData(latitude, longitude);
    };
}

function getWeatherData(latitude, longitude) {
    $.ajax(WEATHER_SEARCH_URL, {
        data: {
            units: 'imperial',
            lat: latitude,
            lon: longitude
        },
        dataType: 'jsonp',
        type: 'GET',
        success: function (data) {
            let widget = displayWeather(data);
            $('#weather-display').html(widget);
            scrollPageTo('#weather-display', 15);
        }
    });
}


/*function getWeatherData(city, callback) {
    const apiKey = 'eb1406fdf4f43571a136a6bbc04b170c';
    let city = $('.search-query').val();
    const query = {
        units: 'imperial',
        q: city,
    };
    $.getJSON(WEATHER_SEARCH_URL, query, callback);

    function ifCorrect(data) {
        let widget = newFunction(data);
        $('#weather-display').html(widget);
        scrollPageTo('#weather-display', 15);
    }*/




    function displayWeather(data) {
        return `
    <div class="weather-results">
        <h1><strong>Current Weather for ${data.name}</strong></h1>
        <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png">
        <p style="font-size:30px; margin-top:10px;">${data.weather[0].main}</p>
        <p style="color:steelblue;" ">Description:</p><p"> ${data.weather[0].description}</p>
        <p style="color:steelblue;">Temperature:</p><p> ${data.main.temp} &#8457; / ${(((data.main.temp)-32)*(5/9)).toFixed(2)} &#8451;</p>
        <p style="color:steelblue;">Min. Temperature:</p><p> ${data.main.temp_min} &#8457; / ${(((data.main.temp_min)-32)*(5/9)).toFixed(2)} &#8451</p>
        <p style="color:steelblue;">Max. Temperature:</p><p> ${data.main.temp_max} &#8457; / ${(((data.main.temp_max)-32)*(5/9)).toFixed(2)} &#8451</p>
        <p style="color:steelblue;">Humidity:</p><p> ${data.main.humidity} &#37;</p>
    </div>
`;
    }

    /*function getFoursquareData(ll, query, callback) {
        $('.category-button').click(function () {
            let city = $('.js-query').val();
            let category = $(this).text();
            const query = {
                ll: `${latitude},${longitude}`,
                //client_id = 'UZD3LGAGEODLXRADR530ZNHVCWFVA4V3B4ESJ52IB2YWQR0M',
                //client_secret = 'L0OKMQE4AO1J24VTOD0FN15MUX3V3SUXRMYB4AABEL0RHCOH',
                near: city,
                venuePhotos: 1,
                limit: 9,
                q: 'recommended',
                section: category,
            };
            $.getJSON(FOURSQUARE_SEARCH_URL, query, callback);
        });*/
    

    function getFourSquareData(latitude, longitude) {
        $('.category-button').click(function () {
            let city = $('.js-query').val();
            let category = $(this).text();
            $.ajax(FOURSQUARE_SEARCH_URL, {
                data: {
                    ll: `${latitude},${longitude}`,
                    near: city,
                    venuePhotos: 1,
                    limit: 9,
                    query: 'recommended',
                    section: category,
                    v: '20180410'
                },
                dataType: 'json',
                type: 'GET',
                success: function (data) {
                    try {
                        let results = data.response.groups[0].items.map(function (item, index) {
                            return displayResults(item);
                        });
                        $('#foursquare-results').html(results);
                        scrollPageTo('#foursquare-results', 15);
                    } catch (e) {
                        $('#foursquare-results').html("<div class='result'><p>Sorry! No Results Found.</p></div>");
                    }
                },
                error: function () {
                    $('#foursquare-results').html("<div class='result'><p>Sorry! No Results Found.</p></div>");
                }
            });
        });
    

    function displayResults(result) {
        return `
<div class="result col-3">
<div class="result-image" style="background-image: url(https://igx.4sqi.net/img/general/width960${result.venue.photos.groups[0].items[0].suffix})" ;>
</div>
<div class="result-description">
    <h2 class="result-name"><a href="${result.venue.url}" target="_blank">${result.venue.name}</a></h2>
    <span class="icon">
        <img src="${result.venue.categories[0].icon.prefix}bg_32${result.venue.categories[0].icon.suffix}" alt="category-icon">
    </span>
    <span class="icon-text">
        ${result.venue.categories[0].name}
    </span>
    <p class="result-address">${result.venue.location.formattedAddress[0]}</p>
    <p class="result-address">${result.venue.location.formattedAddress[1]}</p>
    <p class="result-address">${result.venue.location.formattedAddress[2]}</p>
</div>
</div>
`;
    }
}



    $(enterLocation);
