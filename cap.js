const GEOCODE_SEARCH_URL = "https://maps.googleapis.com/maps/api/geocode/json?";
const FOURSQUARE_SEARCH_URL = "https://api.foursquare.com/v2/venues/explore?&client_id=UZD3LGAGEODLXRADR530ZNHVCWFVA4V3B4ESJ52IB2YWQR0M&client_secret=L0OKMQE4AO1J24VTOD0FN15MUX3V3SUXRMYB4AABEL0RHCOH&v=20170915";
const WEATHER_SEARCH_URL = "https://api.openweathermap.org/data/2.5/weather?APPID=eb1406fdf4f43571a136a6bbc04b170c"


function scrollPageTo(myTarget, topPadding) {
    if (topPadding == undefined) {
        topPadding = 0;
    };
    var moveTo = $(myTarget).offset().top - topPadding;
    $('html, body').stop().animate({
        scrollTop: moveTo
    }, 200);
}

function getGeocodeData(searchTerm, callback) {
    const apiKey = 'AIzaSyCfa3SngF_7sadsZMJmY5vCeo_F-LczrC8';
    const query = {
        address: searchTerm,
        key: apiKey,
    };
    $.getJSON(GEOCODE_SEARCH_URL, query, callback);

}

function enterLocation() {
    $('.category-button').click(function () {
        $('button').removeClass("selected");
        $(this).addClass("selected");
    });
    $('.search-form').submit(function (event) {
        event.preventDefault();
        const queryTarget = $(event.currentTarget).find('.js-query');
        const query = queryTarget.val();
        console.log(query);
        queryTarget.val("");
        const restriction = /[^a-zA-Z0-9\s]/;
        if (restriction.test(query)) {
            $("#errMsg").removeClass("hidden");
        } else {
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

function displayWeather(data) {
    return `
    <div class="weather-results">
        <h1><strong>Current Weather for ${data.name}</strong></h1>
        <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="current weather icon">
        <p style="font-size:30px; margin-top:10px;">${data.weather[0].main}</p>
        <p style="color:steelblue;" ">Description:</p><p"> ${data.weather[0].description}</p>
        <p style="color:steelblue;">Temperature:</p><p> ${data.main.temp} &#8457; / ${(((data.main.temp)-32)*(5/9)).toFixed(2)} &#8451;</p>
        <p style="color:steelblue;">Min. Temperature:</p><p> ${data.main.temp_min} &#8457; / ${(((data.main.temp_min)-32)*(5/9)).toFixed(2)} &#8451</p>
        <p style="color:steelblue;">Max. Temperature:</p><p> ${data.main.temp_max} &#8457; / ${(((data.main.temp_max)-32)*(5/9)).toFixed(2)} &#8451</p>
        <p style="color:steelblue;">Humidity:</p><p> ${data.main.humidity} &#37;</p>
    </div>
`;
}

function getFourSquareData(latitude, longitude) {
    $('.category-button').click(function () {
        let category = $(this).text();
        $.ajax(FOURSQUARE_SEARCH_URL, {
            data: {
                ll: `${latitude},${longitude}`,
                radius: 500,
                venuePhotos: 1,
                limit: 9,
                query: 'recommended',
                section: category,
            },
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                let results = data.response.groups[0].items.map(function (item, index) {
                    return displayResults(item);
                });
                $('#foursquare-results').html(results);
                scrollPageTo('#foursquare-results', 15);
            },
            error: function () {
                $('#foursquare-results').html("<div class='result'><p>Sorry! No Results Found.</p></div>");
            }

        });
    });
}

function displayResults(result) {
    console.log(result);
    return `
<div class="result col-3">
<div class="result-description">
    <h2 class="result-name"><a href="https://foursquare.com/v/${result.venue.id}" target="_blank">${result.venue.name}</a></h2>
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

/*function lettersOnly(input) {
    let regex = /[^a-z]/gi;
    $('#search-term').key
 }*/

/* $("#search-term").validate({
    rules: {
      name: {
        required: true,
        minlength: 2
      }
    },
    messages: {
      name: {
        required: "Please try again!",
        minlength: jQuery.validator.format("At least {0} characters required!")
      }
    }
  });*/


$(enterLocation);