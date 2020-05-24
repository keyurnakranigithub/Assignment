var express = require('express')
var app = express();
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');
const io = require('socket.io')(http);
var mongoose = require('mongoose');

var User = mongoose.model('Users', {
    username: String,
    email: String,
    password: String
});

var Chat = mongoose.model('Chats', {
    fromUser: String,
    toUser: String,
    message: String,
    timestamp: String
});

var dbUrl = 'mongodb://127.0.0.1:27017/Assignment'
mongoose.connect(dbUrl, (err) => {
    console.log('mongodb connected', err);
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
    fs.readFile('signup.html', function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
});

app.get('/signup_success', function (req, res) {
    fs.readFile('signup_success.html', function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
});

app.get('/loginpage', function (req, res) {
    //Open a file on the server and return its content:
    fs.readFile('login.html', function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
});

app.get('/indexpage', function (req, res) {
    //Open a file on the server and return its content:
    fs.readFile('index.html', function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
});

app.post('/signup', function (req, res) {
    console.log(req.body);
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });
    user.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Note."
            });
        });
});

app.get('/login', (req, res) => {
    const user = req.query;
    User.find({ username: user.username, password: user.password }, (err, users) => {
        res.send(users);
    })
});

app.post('/savechat', (req, res) => {
    const chat = new Chat({
        fromUser: req.body.fromUser,
        toUser: req.body.toUser,
        message: req.body.message,
        timestamp: new Date()
    });
    chat.save((err) => {
        if (err)
            sendStatus(500);
        io.emit('message', req.body);
        res.sendStatus(200);
    })
});

io.on('connection', () => {
    console.log('a user is connected')
})

var server = app.listen(8080, () => {
    console.log('server is running on port', 8080);
});
