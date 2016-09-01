var User= require("../models/user");
var Story= require("../models/contents");
var config= require("../../config");

var secretKey= config.secretKey;

var jsonwebtoken= require("jsonwebtoken");

/* JSON Token based Authentication  */

function createToken(user){
   var token= jsonwebtoken.sign({
       _id: user._id,
       name: user.name,
       username: user.username
   }, secretKey, {
      expiresIn: '1h'
   });
   return token; // returning token variable so later can pass that.
}

module.exports = function(app, express, io) {


  var api = express.Router();

  api.get('/all_stories', function(req, res) {
    
    Story.find({}, function(err, stories) {
      if(err) {
        res.send(err);
        return;
      }
      res.json(stories);
    });
  });

   api.post('/signup', function(req, res){
      var user = new User({
         name: req.body.name,
         username: req.body.username,
         password: req.body.password
      }); // The body here is basically body Parser. This enable us to read the value on the website.
      var token = createToken(user);
      user.save(function(err){
         if (err) {
            res.send(err);
            return;
         }
         res.json({
          success: true,
          message: "User has been Created",
          token: token
        });
      });
   }); 

api.get('/users', function(req, res){
   User.find({}, function(err, users){
      if (err) {
         res.send(err);
         return;
      }
         res.json(users); //users here is a parameter we passed.
   });
});

// Using the token based Authentication, instead of cookie based Authentication.Reason the token based more scalable.
  api.post("/login", function(req, res){
     // findOne to find user from mongodb database
     User.findOne({
        username: req.body.username
     }).select('name username password').exec(function(err, user){

           if (err) throw err;

           if(!user){
              res.send({message: "User don't Exist."});
           }

           else if(user){

              var validPassword = user.comparePassword(req.body.password);

              if (!validPassword) {
                 res.send({message: "Invalid Password."});
              }
              else{

                 // Token based  Authentication (Using JsonWebtoken package frpm npm )////////

                 var token = createToken(user);
                 res.json({
                    success: true,
                    message :"Successfully Login!!",
                    token: token
                 });

              }//else
           }//else if
     });//exec
  });//api.post

// The custom middleware, to access some pages of website have to login for that. It is kind of bridge b/w the page, to access the page we have to lgin.
// The middleware will check the token.

api.use(function(req, res, next){
  console.log('Someone access the app');

  var token = req.body.token || req.param('token') || req.headers['x-access-token'];

  // check if the token exist
  if(token){
    jsonwebtoken.verify(token, secretKey, function(err, decoded){
        if(err){
          res.status(403).send({ success: false, message: "False Authentication"});
        }else{
          // 
          req.decoded = decoded;
          next();
        }
    });
  }else{
      res.status(403).send({ success: false, message: "No token provided"});

  }
});

/* ////////// //////////////   ////////////////////////////////////////////////////////////////////////////////
All the api's will be written here, once the user pass through the middleware, the user can access the api's.    
//////////// ////////////// /////////////////////////////////////////////////////////////////////////////*/


// api.get('/', function(req, res){
//   res.json('Hello There you passed the Authentication');
// });

api.route('/')

  .post(function(req, res){

    var contents = new Contents({
      creator: req.decoded.id,
      content: req.body.content,
    });




    contents.save(function(err, newContents){
      if(err){
        res.send(err);
        return;
      }
      io.emit('content', newContents);
      res.json({message: "New Contents Created."});
    });

  })
  .get(function(req, res){ Contents.find({
        creator: req.decoded.id
    }, function(err, contents){
      if (err) {
        res.send(err);
        return;
      }
      res.send(contents);
    });
  });

//We need this when we want to do frontend.
  api.get('/me', function(req, res){
    res.send(req.decoded);
  });


/* Test Whether This api Work or not */
   return api;

 };


























