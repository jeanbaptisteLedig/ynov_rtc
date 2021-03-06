'use strict';

const express = require('express');
const minimist = require('minimist');
const ws = require('ws');
const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const io = require('socket.io')(https);

const app = express();

const argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: 'https://localhost:8443/',
        ws_uri: 'ws://edwinnss.fr:8888/kurento'
    }
});

// app.get('*', function(req,res) {
//     return res.redirect('https://' + req.headers.host + req.url)
//
// }).listen(8443);

const options = {
    key: fs.readFileSync('keys/server.key'),
    cert: fs.readFileSync('keys/server.crt')
};

require('./config/authentification.js')(app);

mongoose.connect('mongodb://localhost/rtc', function (err) {
    if (err) {
        throw err;
    }
    const server = https.createServer(options, app).listen(8443, function () {
        console.log('init server');
        const wss = new ws.Server({
            server: server,
            path: '/kurento'
        });
        require('./kurento.js').kurento(wss, argv);
        io.listen(server);
    });
});

io.on('connection', function (socket) {
    socket.on('own_message', function (msg) {
        if (msg && msg.length > 0) {
            socket.emit('own_message', msg);
        }
    });
    socket.on('other_message', function (msg) {
        if (msg && msg.length > 0) {
            socket.broadcast.emit('other_message', msg);
        }
    });
});

app.use('/public', express.static(__dirname + '/public'));
app.use('/', require('./controllers'));

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: require('handlebars-helpers')()
}));
app.set('view engine', 'handlebars');
