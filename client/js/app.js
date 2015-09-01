var app = {
	API_BASE_URL: 'https://factualserver.marriottlabs.com',
	GOOGLE_MAPS_KEY: 'AIzaSyB6gr2x_5tRO07och-OMr44GFjGA_zmGxc',
	ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

	initialize: function() {
		$('#searchBtn').click(app.onSearchInitiated);
	},

	metersToMiles: function(i, decimalPlaces) {
		var miles = i * 0.000621371192;

		if (decimalPlaces) {
			miles = miles.toFixed(decimalPlaces);
		}

		return miles;
	},

	milesToMeters: function(i) {
    	return i * 1609.344;
	},

	getNthLetterOfAlphabet: function(n) {
		return app.ALPHABET[n - 1];
	},

	displayError: function(errorMessage) {
		console.warn(errorMessage);
		$('#formError').html('' 
			+ '<div class="alert alert-danger alert-dismissible" role="alert">'
				+ '    <button type="button" class="close" data-dismiss="alert">'
				+ '        <span>&times;</span>'
				+ '    </button>' 
				+ '    <strong><i class="fa fa-exclamation-triangle"></i>&nbsp;Error:&nbsp;</strong> ' + errorMessage
			+ '</div>'
		);
	},

	onSearchInitiated: function(e) {
		var searchTerm = undefined;

		e.stopPropagation();

		searchTerm = '' + $('#searchTerm').val();

		if (searchTerm.length === 0) {
			app.displayError('Please enter a search term.');
		} else {
			app.searchByLatLong(searchTerm);
		}

		return false;
	},

	onGeolocationError: function(err) {
		app.displayError('Failed to get your location, please allow the app access to your location when asked.');
	},

	onSearchError: function(xhr, status, error) {
		app.displayError('Search failed - ' + error);
	},

	onSearchSuccess: function(data, status, xhr, userLatitude, userLongitude) {
		var n = 0;
		var m = 0;
		var len = data.length || 0;
		var place = undefined;
		var searchResults = $('#searchResults');
		var resultsHTML = '';
		var map = undefined;
		var marker = undefined;
		var markerLabel = undefined;
		var bounds = undefined;

		console.log(data);

		if (len > 0) {
			map = new google.maps.Map(document.getElementById('map'), {
				center: {
					lat: userLatitude,
					lng: userLongitude
				},
				zoom: 16
			});

			$('#map').show();

			bounds = new google.maps.LatLngBounds();

			for (n = 0; n < len; n++) {
				place = data[n];
				markerLabel = app.getNthLetterOfAlphabet(n + 1);

				marker = new google.maps.Marker({
    				map: map,
    				animation: google.maps.Animation.DROP,
    				position: {
    					lat: place.latitude, 
    					lng: place.longitude
    				},
    				label: markerLabel
  				});

  				bounds.extend(marker.getPosition());

				resultsHTML += ''
					+ '<div class="panel panel-primary">'
					+ '    <div class="panel-heading"><span class="panel-title">' + markerLabel + ') ' + place.name + ' </span>(' + app.metersToMiles(place['$distance'], 1) + ' mi)' + (place.neighborhood ? '<span class="pull-right"><i class="fa fa-home"></i> ' + place.neighborhood[0] + '</span>' : '') + '</div>'
					+ '    <div class="panel-body">'
    				+ '        ' + place.address + ' ' + (place.address_extended || '') + '<br/>'
    				+ '        ' + place.locality + ', ' + place.region + ' ' + place.postcode + '<br/>';

    			if (place.tel) {
    				resultsHTML += '<br/><i class="fa fa-phone"></i> <a href="tel:' + place.tel + '">' + place.tel + '</a><br/>';
     			}

     			if (place.website) {
     				resultsHTML += '<br/><i class="fa fa-external-link"></i> <a href="' + place.website + '" target="_blank">' + place.website + '</a><br/>';
     			}

     			if (place.hours_display) {
     				resultsHTML += '<br/><i class="fa fa-clock-o"></i> ' + place.hours_display + '<br/>';
     			}

     			resultsHTML += '<br/>';

     			if (place.category_labels) {
     				for (m = 0; m < place.category_labels[0].length; m++) {
     					resultsHTML += '<span class="label label-primary categoryLabel">' + place.category_labels[0][m] + '</span>  ';
     				}
     			}

    			resultsHTML += ''
     				+ '    </div>'
					+ '</div>';

			}

			map.fitBounds(bounds);
			map.setZoom(map.getZoom() - 1); 
			if (map.getZoom() > 15) {
  				map.setZoom(12);
			}

			searchResults.html(resultsHTML);
		} else {
			$('#map').hide();

			searchResults.html('' 
				+ '<div class="alert alert-info alert-dismissible" role="alert">'
				+ '    <button type="button" class="close" data-dismiss="alert">'
				+ '        <span>&times;</span>'
				+ '    </button>' 
				+ '    <strong><i class="fa fa-info-circle"></i>&nbsp;Info:&nbsp;</strong> Your search returned no results.'
				+ '</div>'
			);
		}
	},

	searchByLatLong: function(searchTerm) {
		navigator.geolocation.getCurrentPosition(
			function(pos) {
				console.log('Geolocated user at ' + pos.coords.latitude + ', ' + pos.coords.longitude);
				console.log('Search term: ' + searchTerm);
				$.ajax({
					cache: false,
					error: app.onSearchError,
					method: 'GET',
					success: function(data, status, xhr) {
						app.onSearchSuccess(data, status, xhr, pos.coords.latitude, pos.coords.longitude);
					},
					timeout: 5000,
					url: app.API_BASE_URL + '/places?q=' + searchTerm + '&latitude=' + pos.coords.latitude + '&longitude=' + pos.coords.longitude
				});	
			},
			app.onGeolocationError,
			{
				enableHighAccuracy: true,
				maximumAge: 0
			}
		);
	}
};

window.onload = function() {
	app.initialize();
}
