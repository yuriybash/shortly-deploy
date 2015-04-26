var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

var Q = require('q');


exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {

  var findAll = Q.nbind(Link.find, Link);

  findAll({})
    .then(function (links) {
      res.json(links);
    })
    .fail(function (error) {
      res.status(404).send("No links found")
    });




  // Links.reset().fetch().then(function(links) {
  //   res.send(200, links.models);
  // })
};

exports.saveLink = function(req, res) {

  var url = req.body.url;
  console.log(req.body);
  if (!util.isValidUrl(url)) {
    console.log("IT IS NOT A VALID URL");
    return res.send(404);
  }

  console.log("TEST111111111111111");

  var createLink = Q.nbind(Link.create, Link);
  var findLink = Q.nbind(Link.findOne, Link);
  console.log("TEST2222222222222222");

  findLink({url: url})
    .then(function (match) {
        console.log("TEST3333333333333")
        console.log("match", match)

      if (match) {
        console.log("match YES")
        res.send(match);
      } else {
        console.log("match NO")
        return  util.getUrlTitle(url);
      }
    })
    .then(function (title) {
        console.log("TEST4444444444444444")

      if (title) {
        var newLink = {
          url: url,
          visits: 0,
          base_url: req.headers.origin,
          title: title
        };
        return createLink(newLink);
      }
    })
    .then(function (createdLink) {
        console.log("TEST5555555555555")
      if (createdLink) {
        res.json(createdLink);
      }
    })
    .fail(function (error) {
      console.log("FAIL", error);
      res.send(404);
    });
















  // var uri = req.body.url;

  // if (!util.isValidUrl(uri)) {
  //   console.log('Not a valid url: ', uri);
  //   return res.send(404);
  // }

  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.send(200, found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.send(404);
  //       }

  //       var link = new Link({
  //         url: uri,
  //         title: title,
  //         base_url: req.headers.origin
  //       });

  //       link.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.send(200, newLink);
  //       });
  //     });
  //   }
  // });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var findUser = Q.nbind(User.findOne, User);
  findUser({username: username})
    .then(function (user) {
      if (!user) {
        res.redirect('/login');
      } else {
        return user.comparePasswords(password)
          .then(function(foundUser) {
            if (foundUser) {
              util.createSession(req, res, user);
            } else {
              res.redirect('/login');
            }
          });
      }
    })
    .fail(function (error) {
      res.redirect('/login');
    });
};

exports.signupUser = function(req, res) {
  var username  = req.body.username,
          password  = req.body.password,
          create,
          newUser;

      var findOne = Q.nbind(User.findOne, User);

      // check to see if user already exists
      findOne({username: username})
        .then(function(user) {
          if (user) {
            console.log('Account already exists');
            res.redirect('/signup');
          } else {
            // make a new user if not one
            create = Q.nbind(User.create, User);
            newUser = {
              username: username,
              password: password
            };

            create(newUser);
            util.createSession(req, res, newUser);

          }
        })
        .then(function (user) {
          // create token to send back for auth

        })
        .fail(function (error) {
          res.redirect('/signup');
        });

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           util.createSession(req, res, newUser);
  //           Users.add(newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   })
};

exports.navToLink = function(req, res) {


  var link = req.params[0];
  link.visits++;
  link.save(function (err, savedLink) {
    if (err) {
      res.redirect('/');
    } else {
      res.redirect(savedLink.url);
    }
  })
};


  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });

