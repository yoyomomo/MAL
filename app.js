const dotenv = require('dotenv').config()
const express = require('express')
const MongoClient = require('mongodb').MongoClient

// setup debug.log
const fs = require('fs')
const util = require('util')
let logFile = fs.createWriteStream('./debug.log')
console.log = (message) => {
    message = util.format(message) + '\n'
    logFile.write(message)
}

const app = express(); // activate an express app
app.use(express.json()); // enable parsing of JSON data in our app

app.use('/JikanAPI', express.static('public'))

// Listen for HTTP GET requests.
app.get('/JikanAPI/MAL/', (req, res) => {

    // log information about the request
    console.log('Anime requested' +
        ' on ' + new Date() +
        ' by ' + req.headers['x-forwarded-for'] +
        ' with ' + req.headers['user-agent'] +
        ' at ' + req.headers['referer']
    )

    const client = new MongoClient(
        process.env.DB, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }
    );

    client.connect(err => {
        if (err) {
            console.log(err);
        }
        let query = {}
        let projection = {
            'title': 1,
            'title_english': 1,
            'title_japanese': 1,
            'episodes': 1,
            'synopsis': 1,
            'image_url': 1
        }
        // search mongo collection for all dragons
        client.db("Anime").collection("Test")
            .find(query)
            .project(projection)
            .toArray((err, item) => {
                if (err) {
                    res.send({
                        'error': 'An error has occured'
                    });
                } else {
                    res.send(item);
                } // send the result back.
            });
    });
});

app.listen(0, () => {
    console.log("We are live.");
});
