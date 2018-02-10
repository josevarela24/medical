var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RecordSchema = Schema({
  number: {type: String, required: true},
 patient: {type: Schema.ObjectId, ref: 'Patient', required: true},
  provider: {type: String, required: true},
  id: {type: String, required: true},
 clinician: [{type: Schema.ObjectId, ref: 'Clinician'}]
});
// author is a reference to a single Author model object
// genre is a reference to an array of Genre model objects

// Virtual for book's URL
RecordSchema
.virtual('url')
.get(function () {
  return '/catalog/record/' + this._id;
});

//Export model
module.exports = mongoose.model('Record', RecordSchema);