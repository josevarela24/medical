var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var AccessedSchema = Schema({
  record: { type: Schema.ObjectId, ref: 'Record', required: true }, //reference to the associated book
  condition: {type: String, required: true},
  medication: {type: String, required: true, enum: ['Codeine', 'Percocet', 'Vicodin', 'Lean'], default: 'Lean'},
  date_accessed: {type: Date, default: Date.now},
});

// Virtual for bookinstance's URL
AccessedSchema
.virtual('url')
.get(function () {
  return '/catalog/accessed/' + this._id;
});
// enum allows us to set the allowed values of a string

// this will format the date to a prettier way
AccessedSchema
.virtual('date_accessed_formatted')
.get(function () {
  return moment(this.due_back).format('MMMM Do, YYYY');
});

//Export model
module.exports = mongoose.model('Accessed', AccessedSchema);