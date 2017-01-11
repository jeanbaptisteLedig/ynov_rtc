var passport = require('passport');

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/test', function (req, res) {
        res.end("salut mon pote");
    });

    app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
        res.redirect('/');
    });
}
