# Factual API Test

* Testing out the Factual API - comprises a Bootstrap / JQuery front end and a Node JS / Express back end
* You will need a Factual API key and secret to use this, these are read by the Node app from environment variables

##Running the Server

```
cd server
npm install
export PORT=<desired port or will default to 8888>
export FACTUAL_KEY=<factual api key>
export FACTUAL_SECRET=<factual api secret>
npm start
```

##Example Test Queries

Coffee shops within 5000 meters of a residence in downtown San Diego:

```
http://localhost:8888/places?q=coffee&country=us&latitude=32.721467&longitude=-117.164403&radius=5000
```


Other location services place IDs for Pappalecco, a San Diego coffee/gelato shop with factual_id = "1adee49b-39d9-4189-9bab-bf19c59c46a2":

```
http://localhost:8888/crosswalk?id=1adee49b-39d9-4189-9bab-bf19c59c46a2
```

Just the Yelp information for Pappalecco:

```
http://localhost:8888/crosswalk?id=1adee49b-39d9-4189-9bab-bf19c59c46a2&namespace=yelp
```

Places whose name begins with "pa" within 5000 meters of a residence in downtown San Diego:

```
http://localhost:8888/namesearch?searchTerm=pa&latitude=32.721467&longitude=-117.164403&radius=5000
```

Coffee places in Berlin, Germany:

```
http://localhost:8888/cityplaces?q=coffee&city=berlin&country=de
```

Coffee places in Springfield, United States:

(returns results for multiple cities named Springfield).

```
http://localhost:8888/cityplaces?q=coffee&city=springfield&country=us
```

Coffee places in Springfield, Virginia, United States:

(returns results for Springfield, VA only).

```
http://localhost:8888/cityplaces?q=coffee&city=springfield&stateProvince=va&country=us
```

##Running Example

The sample front end is running at:

* https://factualclient.marriottlabs.com/

This currently has two input boxes.  The topmost one demonstrates place name autocomplete for a hard coded geolocation in Little Italy, San Diego.

The bottom one demonstrates full text search relative to your current location.

The API proxy backend is running at:

* https://factualserver.marriottlabs.com

So to make the queries shown above against this instance, just go to:

* https://factualserver.marriottlabs.com/places?q=coffee&country=us&latitude=32.721467&longitude=-117.164403&radius=5000
* https://factualserver.marriottlabs.com/crosswalk?id=1adee49b-39d9-4189-9bab-bf19c59c46a2
* https://factualserver.marriottlabs.com/crosswalk?id=1adee49b-39d9-4189-9bab-bf19c59c46a2&namespace=yelp
* https://factualserver.marriottlabs.com/namesearch?searchTerm=pa&latitude=32.721467&longitude=-117.164403&radius=5000
* https://factualserver.marriottlabs.com/cityplaces?q=coffee&city=berlin&country=de

To try other locations, just substitute their lat/long in.

## Factual API Documentation

Factual's API supports a lot more search critera and complex polygon geofencing.  Documentation is here:

* http://developer.factual.com/
* http://developer.factual.com/common-places-use-case-examples/

