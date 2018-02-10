var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var PatientSchema = Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Declaring our URLs as a virtual in the schema is a good idea because then
// the URL for an item only ever needs to be changed in one place
// Virtual for author's full name
PatientSchema
.virtual('name')
.get(function () {
  return this.family_name + ', ' + this.first_name;
});

// Virtual for author's URL
PatientSchema
.virtual('url')
.get(function () {
  return '/catalog/patient/' + this._id;
});

// this will format the date to a prettier way
PatientSchema
.virtual('lifespan')
.get(function () {
  var lifetime_string='';
  if (this.date_of_birth) {
      lifetime_string=moment(this.date_of_birth).format('MMMM Do, YYYY');
      }
  lifetime_string+=' - ';
  if (this.date_of_death) {
      lifetime_string+=moment(this.date_of_death).format('MMMM Do, YYYY');
      }
  return lifetime_string
});

//Export model
module.exports = mongoose.model('Patient', PatientSchema);