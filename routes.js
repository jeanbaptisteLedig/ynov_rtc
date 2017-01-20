var passport = require('passport');
var userController = require("./controller/userController");
var user = new userController();

module.exports = function (app) {

    app.get('/', function (req, res) {
        //console.log(req);
        if (req.session.messages) {
            var message = req.session.messages[0];
            //console.log(req);
        }else{
            message = false;
        }

        var isConnected = req.isAuthenticated();

        res.render('index', {isConnected: isConnected, message: message});
    });

    app.get('/signup', function (req,res) {
        res.render('signup');
    });

    app.post('/signup',  function (req,res) {
        user.create(req.body, function () {

            req.login(user, function (err) {
                if ( ! err ){

                    res.redirect('/',{message: 'test'});
                    //console.log(res.message);
                } else {

                    res.render('index',{message: 'Erreur d inscription'});
                    //console.log(res.message);
                }
            })
        });
    });

    app.post('/login',
        passport.authenticate('local', { successRedirect: '/',
            failureRedirect: '/',
            failureMessage : "Impossible de vous connectez",
            successMessage : "Welcome",
            failureFlash: true
             })
    );

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    var ensureAuthenticated = function(req, res, next) {
        if (req.isAuthenticated()){
            return next();
            //ici les routes quand nous somme authentifier

        }
        else
        {
            res.redirect('/login');
        }
    };


};
