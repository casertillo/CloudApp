// Pulls Mongoose dependency for creating schemas
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var CrimeSchema = new Schema({
    //type of crime car, bikes, robbery
    crimetype: {type: String, required: true},
    //total or partial
    losttype:{type: String, required: false},
    //if the lost was partial
    stolenparts:{type: [String], required:false},
    //device used to secure your car/bike that was inefective
    securitytype:{type: [String], required:false},
    //if the crime was with violence
    violenceused:{type:Boolean, required:true},
    //if the crime was with violence, the number of people who commit the act
    numberthiefs:{type:Number, required:true},
    //what they used to take your belongings cold, fire weapons, force or nothing
    weaponsused:{type:[String], required:false},
    //when it happened
    event_at:{type:Date, required:true},
    //where it happened
    eventlocation:{type: [Number], required:true},

    //Meta data
    verified:{type:Boolean, required:true, default:0},
    versionKey : false


});

// Indexes this schema in 2dsphere format (critical for running proximity searches)
CrimeSchema.index({eventlocation: '2dsphere'});

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-users"
module.exports = mongoose.model('crimes', CrimeSchema);