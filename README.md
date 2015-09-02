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
http://localhost:8888/places?q=coffee&latitude=32.721467&longitude=-117.164403&radius=5000
```


Other location services place IDs for Pappalecco, a San Diego coffee/gelato shop with factual_id = "1adee49b-39d9-4189-9bab-bf19c59c46a2":

```
http://localhost:8888/crosswalk?id=1adee49b-39d9-4189-9bab-bf19c59c46a2
```

Just the Yelp information for Pappalecco:

```
http://localhost:8888/crosswalk?id=1adee49b-39d9-4189-9bab-bf19c59c46a2&namespace=yelp
```


