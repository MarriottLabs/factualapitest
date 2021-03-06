var express = require('express');
var cors = require('cors');
var app = express();
var router = express.Router();
var port = process.env.PORT || 8888;
var Factual = require('./factual');
var factual = new Factual(process.env.FACTUAL_KEY, process.env.FACTUAL_SECRET);
var logFactualJSON = process.env.FACTUAL_LOG_JSON 
var util = require('util');

crosswalkCache = {};

router.route('/resolve').get(
	function(request, response) {
		factual.get(
			'/t/places/resolve?values={"name":"' + request.query.name + '", "latitude": ' + request.query.latitude + ', "longitude": ' + request.query.longitude + '}',
			function (error, res) {
				if (! error) {
					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log(util.inspect(res.data, { depth: null }));
					}
					response.jsonp(res.data);
				} else {
					console.log(error);
					
					if (logFactualJSON) { 
						console.log(request.url + '\n');
						console.log([]); 
					}
					response.jsonp([]);
				}
			}
		);
	}
);

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
					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log(util.inspect(res.data, { depth: null }));
					}
					response.jsonp(res.data);
				} else {
					// TODO error case...
					console.log(error);

					if (logFactualJSON) { 
						console.log(request.url + '\n');
						console.log([]); 
					}
					response.jsonp([]);
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
					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log(util.inspect(res.data, { depth: null }));
					}

					response.jsonp(res.data);
				} else {
					// TODO error case...
					console.log(error);
					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log([]);
					}
					response.jsonp([]);
				}
			}
		);
	}
);

router.route('/crosswalk').get(
	function(request, response) {
		factual.get('/t/crosswalk?filters={"factual_id": "' + request.query.id + '"' + (request.query.namespace ? ', "namespace": "' + request.query.namespace + '"' : '') + '}',
			function (error, res) {
				if (! error) {
					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log(util.inspect(res.data, { depth: null }));
					}

					response.jsonp(res.data);
				} else {
					console.log(error);
					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log([]);
					}
					response.jsonp([]);
				}
			}
		);
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
					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log(util.inspect(res.data, { depth: null }));
					}
					response.jsonp(res.data);
				} else {
					console.log(error);

					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log([]);
					}

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
					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log(util.inspect(res.data, { depth: null }));
					}
					response.jsonp(res.data);
				} else {
					console.log(error);
					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log([]);
					}
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
							var fbArr = [];
							var n = 0;
							var nsId = '';
							var urlParts = [];

							if (! e) {
								if (r.data) {
									// We notice somtimes Facebook data was coming back with a 
									// URL but no ID so this is a kludge to try and get ID from 
									// URL in those cases
									for (n = 0; n < r.data.length; n++) {
										if (r.data[n].namespace_id) {
											nsId = r.data[n].namespace_id;
										} else {
											if (r.data[n].url) {
												urlParts = r.data[n].url.split('/');
												if (urlParts.length > 0) {
													nsId = urlParts[urlParts.length - 1];
												}
											}
										}

										fbArr.push({
											id: nsId,
											profileUrl: r.data[n].url
										});
									} 
								}

								res.data[0].facebook = fbArr;

								if (logFactualJSON) { 
									console.log(request.url + '\n'); 
									console.log(util.inspect(res.data, { depth: null }));
								}
								response.jsonp(res.data[0]);
							} else {
								if (logFactualJSON) { 
									console.log(request.url + '\n'); 
									console.log([]);
								}
								response.jsonp([]);
							}
						}
					);
				} else {
					console.log(error);
					if (logFactualJSON) { 
						console.log(request.url + '\n'); 
						console.log([]);
					}
					response.jsonp([]);
				}
			}
		);
	}
);

router.route('/quota').get(
	function(request, response) {
		response.jsonp(factual.getApiAllocation());
	}
);

app.use(cors());
app.use('/', router);
app.listen(port);
console.log('Factual API Server listening on port ' + port);
