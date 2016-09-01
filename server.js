var express= require("express");
var bodyParser= require("body-parser");
var morgan= require("morgan");
var mongoose= require("mongoose");

// Module
var config= require("./config");

var app= express();


/* Mongoose and Mongodb */
mongoose.connect(config.database, function(err){
   if (err) {
      console.log(err);
   }else{
      console.log("The database is connected");
   }
});

/* bodyParser*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true  // To parse all kind of data.
}));

/* Morgan as dev Dependency */
app.use(morgan('dev'));

// static files
app.use(express.static(__dirname + '/public'));

var api= require("./app/routes/api.js")(app, express);
app.use('/api', api);


app.get("*", function(req, res){
   res.sendFile(__dirname + "/public/index.html");
});
  

app.listen(config.port, function (err) {
   if (err) {
      console.log(err);
   }else{
      console.log("The express app listen on port: "+ config.port);
   }
});














