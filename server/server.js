var express = require('express');
var cors = require('cors');
var app = express();
var router = express.Router();
var port = process.env.PORT || 8888;
var Factual = require('factual-api');
var factual = new Factual(process.env.FACTUAL_KEY, process.env.FACTUAL_SECRET);

var crosswalkCache = {};

router.route('/places').get(
	function(request, response) {
		// TODO check parameters

		factual.get(
			'/t/places-us', 
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
		var cacheKey = 'cacheKey' + request.query.id + (request.query.namespace || '');
		var cachedData = crosswalkCache.cacheKey;

		if (cachedData) {
			console.log('Serving ' + cacheKey + ' from crosswalk API cache.');
			response.jsonp(cachedData);
		} else {
			factual.get('/t/crosswalk?filters={"factual_id": "' + request.query.id + '"' + (request.query.namespace ? ', "namespace": "' + request.query.namespace + '"' : '') + '}',
				function (error, res) {
					if (! error) {
						crosswalkCache.cacheKey = res.data;
						response.jsonp(res.data);
					} else {
						// TODO error case...
						console.log(error);
						response.jsonp([]);
					}
				}
			);
		}
	}
);

app.use(cors());
app.use('/', router);
app.listen(port);
console.log('Factual API Server listening on port ' + port);
