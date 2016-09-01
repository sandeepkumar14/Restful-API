var mongoose= require("mongoose");
var bcrypt= require("bcrypt-nodejs");

var Schema= mongoose.Schema;

var UserSchema= new Schema({

   name: String,

   // Schema for User
   username: {
      type: String,
      required: true,
      index: {unique: true}
   },
   // Schema for user password
   password: {
      type: String,
      required: true,
      select: false /* Prevent password to query when nwe query user. */
   }

});

/* Hash The user password */
UserSchema.pre('save', function(next){

   var user = this;

   if (!user.isModified('password')) return (next);  // next();
// Node bcrypt hash method to hash password
   bcrypt.hash(user.password, null, null, function(err, hash){
      if (err) return next(err);
      user.password= hash;
      next();
   });
});

/* Custom Method to comapre the user typed password and the password in the database. */
UserSchema.methods.comparePassword = function(password){
  
   var user = this;
   // node bycrypt compareSync methid to compare passwords
   return bcrypt.compareSync(password, user.password);
};

 module.exports= mongoose.model('User', UserSchema); 