var express = require('express');
var cors = require('cors');
var app = express();
var router = express.Router();
var port = process.env.PORT || 8888;
var Factual = require('factual-api');
var factual = new Factual(process.env.FACTUAL_KEY, process.env.FACTUAL_SECRET);

crosswalkCache = {};

router.route('/cityplaces').get(
	function(request, response) {
		// TODO check paramters
		// filters={"$and":[{"locality":"santa monica"},{"region":"ca"}]}

		var filterObj = {
			"locality": request.query.city
		};

		if (request.query.stateProvince) {
			filterObj.region = request.query.stateProvince
		}

		factual.get(
			'/t/places' + (request.query.country ? '-' + request.query.country : ''),
			{
				q: request.query.q,
				filters: filterObj
			},
			function (error, res) {
				if (! error) {
					response.jsonp(res.data);
				} else {
					// TODO error case...
				}
			}
		);

	}
);

router.route('/places').get(
	function(request, response) {
		// TODO check parameters

		factual.get(
			'/t/places' + (request.query.country ? '-' + request.query.country : ''), 
			{
				q: request.query.q, 
				geo: {
					"$circle": {
						"$center": [
							request.query.latitude, 
							request.query.longitude
						],
						"$meters": request.query.radius || 1000
					}
				},
				sort: "$distance"
			}, 
			function (error, res) {
				if (! error) {
					response.jsonp(res.data);
				} else {
					// TODO error case...
				}
			}
		);
	}
);

router.route('/crosswalk').get(
	function(request, response) {
		// Check if we have this in the cache as we only get 500 crosswalk queries a day
		//var cacheKey = 'cacheKey' + request.query.id + (request.query.namespace || '');
		//var cachedData = crosswalkCache.cacheKey;

		// if (cachedData) {
		// 	console.log('Serving ' + cacheKey + ' from crosswalk API cache.');
		// 	response.jsonp(cachedData);
		// 	return;
		// } else {
			factual.get('/t/crosswalk?filters={"factual_id": "' + request.query.id + '"' + (request.query.namespace ? ', "namespace": "' + request.query.namespace + '"' : '') + '}',
				function (error, res) {
					if (! error) {
						// console.log('Setting ' + cacheKey);
						// crosswalkCache.cacheKey = JSON.parse(JSON.stringify(res.data));
						console.log(res.data);
						response.jsonp(res.data);
					} else {
						// TODO error case...
						console.log(error);
						response.jsonp([]);
					}
				}
			);
		// }
	}
);

router.route('/citynamesearch').get(
	function(request, response) {
		var filterObj = {
			"$and": [
				{ "locality": request.query.city },
				{ "name" : { "$bw": request.query.searchTerm } }
			]
		};

		if (request.query.stateProvince) {
			filterObj['$and'].push({ "region": request.query.stateProvince });
		}

		factual.get('/t/places' + (request.query.country ? '-' + request.query.country : ''),
				{
					filters: filterObj,
					select: 'name,factual_id,address'
				},
				function(error, res) {
				if (! error) {
					response.jsonp(res.data);
				} else {
					console.log(error);
					response.jsonp([]);
				}
			}
		);
	}
);

router.route('/namesearch').get(
	function(request, response) {
		factual.get('/t/places-us?geo={"$circle":{"$center":[' + request.query.latitude + ',' + request.query.longitude + '],"$meters":' + (request.query.radius || 1000) + '}}&filters={"name":{"$bw":"' + request.query.searchTerm + '"}}&select=name,factual_id',
			function(error, res) {
				if (! error) {
					response.jsonp(res.data);
				} else {
					console.log(error);
					response.jsonp([]);
				}
			}
		);
	}
);

router.route('/place').get(
	function(request, response) {
		factual.get('/t/places/' + request.query.id, 
			function(error, res) {
				if (! error) {
					// Let's go get the crosswalk data now
					factual.get('/t/crosswalk?filters={"factual_id": "' + request.query.id + '", "namespace": "facebook"}',
						function (e, r) {
							// var fbObj = {
							// 	id: '',
							// 	profileUrl: ''
							// };
							var fbArr = [];
							var n = 0;

							if (! e) {
								console.log(r.data);
								if (r.data) {
									for (n = 0; n < r.data.length; n++) {
										fbArr.push({
											id: r.data[n].namespace_id,
											profileUrl: r.data[n].url
										});
									} 
								}

								res.data[0].facebook = fbArr;
								response.jsonp(res.data[0]);
							} else {
								console.log(e);
								response.jsonp([]);
							}
						}
					);
				} else {
					console.log(error);
					response.jsonp([]);
				}
			}
		);
	}
);

app.use(cors());
app.use('/', router);
app.listen(port);
console.log('Factual API Server listening on port ' + port);
