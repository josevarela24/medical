var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ClinicianSchema = Schema({
  name: { type: String, required: true, min: 3, max: 100 }, //reference to the associated book
});

// Virtual for genre's URL
ClinicianSchema
.virtual('url')
.get(function () {
  return '/catalog/clinician/' + this._id;
});
// enum allows us to set the allowed values of a string

//Export model
module.exports = mongoose.model('Clinician', ClinicianSchema);