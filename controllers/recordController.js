var Record = require('../models/record');
var Patient = require('../models/patient');
var Clinician = require('../models/clinician');
var Accessed = require('../models/accessed');

var async = require('async');

exports.index = function(req, res) {   
    
    async.parallel({
        record_count: function(callback) {
            Record.count(callback);
        },
        accessed_count: function(callback) {
            Accessed.count(callback);
        },
        accessed_available_count: function(callback) {
            Accessed.count({medication:'Codeine'}, callback);
        },
        patient_count: function(callback) {
            Patient.count(callback);
        },
        clinician_count: function(callback) {
            Clinician.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Medical Home', error: err, data: results });
    });
};

// Display list of all Books
exports.record_list = function(req, res, next) {
    
    Record.find({}, 'number patient')
    .populate('patient')
    .exec(function (err, list_records) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('record_list', { title: 'Record List', record_list: list_records });
    });
    
};

// Display detail page for a specific book
exports.record_detail = function(req, res, next) {
    
      async.parallel({
        record: function(callback) {     
            
          Record.findById(req.params.id)
            .populate('patient')
            .populate('clinician')
            .exec(callback);
        },
        accessed: function(callback) {
    
          Accessed.find({ 'record': req.params.id })
            //.populate('book')
            .exec(callback);
        },
      }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('record_detail', { title: 'Title', record: results.record, accesses: results.accessed });
      });
        
    };

// Display book create form on GET
exports.record_create_get = function(req, res, next) { 
    
  //Get all authors and genres, which we can use for adding to our book.
  async.parallel({
      patients: function(callback) {
          Patient.find(callback);
      },
      clinicians: function(callback) {
          Clinician.find(callback);
      },
  }, function(err, results) {
      if (err) { return next(err); }
      res.render('record_form', { title: 'Create Record', patients: results.patients, clinicians: results.clinicians });
  });
  
};

// Handle book create on POST
exports.record_create_post = function(req, res, next) {
    
    req.checkBody('number', 'Number must not be empty.').notEmpty();
    req.checkBody('patient', 'Patient must not be empty').notEmpty();
    req.checkBody('provider', 'Provider must not be empty').notEmpty();
    req.checkBody('id', 'ID must not be empty').notEmpty();

    req.sanitize('number').escape();
    req.sanitize('patient').escape();
    req.sanitize('provider').escape();
    req.sanitize('id').escape();
    req.sanitize('number').trim();
    req.sanitize('patient').trim();
    req.sanitize('provider').trim();
    req.sanitize('id').trim();
    req.sanitize('clinician').escape();

    var record = new Record(
        { number: req.body.number,
        patient: req.body.patient,
        provider: req.body.provider,
        id: req.body.id,
        clinician: (typeof req.body.clinician==='undefined') ? [] : req.body.clinician.split(",")
        });

    console.log('RECORD: '+record);

    var errors = req.validationErrors();
    if (errors) {
        // Some problems so we need to re-render our book
        console.log('CLINICIAN: '+req.body.clinician);

        console.log('ERRORS: '+errors);
        //Get all authors and genres for form
        async.parallel({
            patients: function(callback) {
                Patient.find(callback);
            },
            clinicians: function(callback) {
                Clinician.find(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }

            // Mark our selected genres as checked
            for (i = 0; i < results.clinicians.length; i++) {
                if (record.clinician.indexOf(results.clinicians[i]._id) > -1) {
                    //console.log('IS_IN_GENRES: '+results.genres[i].name);
                    results.clinicians[i].checked='true';
                    //console.log('ADDED: '+results.genres[i]);
                }
            }

            res.render('record_form', { title: 'Create Record',patients:results.patients, clinicians:results.clinicians, record: record, errors: errors });
        });

    }
    else {
    // Data from form is valid.
    // We could check if book exists already, but lets just save.

        record.save(function (err) {
            if (err) { return next(err); }
                //successful - redirect to new book record.
                res.redirect(record.url);
            });
    }

};

// Display book delete form on GET
exports.record_delete_get = function(req, res, next) {
    
    async.parallel({
        record: function(callback) {
            Record.findById(req.params.id).populate('patient').populate('clinician').exec(callback);
        },
        record_accesses: function(callback) {
            Accessed.find({ 'record': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('record_delete', { title: 'Delete Record', record: results.record, accesses: results.record_accesses } );
    });

};

// Handle book delete on POST
exports.record_delete_post = function(req, res, next) {
    
    //Assume the post will have id (ie no checking or sanitisation).

    async.parallel({
        record: function(callback) {
            Record.findById(req.params.id).populate('patient').populate('clinician').exec(callback);
        },
        record_accesses: function(callback) {
            Accessed.find({ 'record': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.record_accesses.length > 0) {
            //Book has book_instances. Render in same way as for GET route.
            res.render('record_delete', { title: 'Delete Record', record: results.record, accesses: results.record_accesses } );
            return;
        }
        else {
            //Book has no bookinstances. Delete object and redirect to the list of books.
            Record.findByIdAndRemove(req.body.id, function deleteRecord(err) {
                if (err) { return next(err); }
                //Success - got to books list
                res.redirect('/catalog/records');
            });

        }
    });

};

// Display book update form on GET
exports.record_update_get = function(req, res, next) {
    
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get book, authors and genres for form
    async.parallel({
        record: function(callback) {
            Record.findById(req.params.id).populate('patient').populate('clinician').exec(callback);
        },
        patients: function(callback) {
            Patient.find(callback);
        },
        clinicians: function(callback) {
            Clinician.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
            
        // Mark our selected genres as checked
        for (var all_c_iter = 0; all_c_iter < results.clinicians.length; all_c_iter++) {
            for (var record_c_iter = 0; record_c_iter < results.record.clinician.length; record_c_iter++) {
                if (results.clinicians[all_c_iter]._id.toString()==results.record.clinician[record_c_iter]._id.toString()) {
                    results.clinicians[all_c_iter].checked='true';
                }
            }
        }
        res.render('record_form', { title: 'Update Record', patients:results.patients, clinicians:results.clinicians, record: results.record });
    });
    
};

// Handle book update on POST 
exports.record_update_post = function(req, res, next) {
    
    //Sanitize id passed in. 
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    
    //Check other data
    req.checkBody('number', 'Number must not be empty.').notEmpty();
    req.checkBody('patient', 'Patient must not be empty').notEmpty();
    req.checkBody('provider', 'Provider must not be empty').notEmpty();
    req.checkBody('id', 'ID must not be empty').notEmpty();
    
    req.sanitize('number').escape();
    req.sanitize('patient').escape();
    req.sanitize('provider').escape();
    req.sanitize('id').escape();
    req.sanitize('number').trim();
    req.sanitize('patient').trim(); 
    req.sanitize('provider').trim();
    req.sanitize('id').trim();
    //req.sanitize('clinician').escape();
    
    var record = new Record(
      { number: req.body.number, 
        patient: req.body.patient, 
        provider: req.body.provider,
        id: req.body.id,
        clinician: (typeof req.body.clinician==='undefined') ? [] : req.body.clinician.split(","),
        _id:req.params.id //This is required, or a new ID will be assigned!
       });
    
    var errors = req.validationErrors();
    if (errors) {
        // Re-render book with error information
        // Get all authors and genres for form
        async.parallel({
            patients: function(callback) {
                Patient.find(callback);
            },
            clinicians: function(callback) {
                Clinician.find(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }
            
            // Mark our selected genres as checked
            for (i = 0; i < results.clinicians.length; i++) {
                if (record.clinician.indexOf(results.clinicians[i]._id) > -1) {
                    results.clinicians[i].checked='true';
                }
            }
            res.render('record_form', { title: 'Update Record',patients:results.patients, clinicians:results.clinicians, record: record, errors: errors });
        });

    } 
    else {
        // Data from form is valid. Update the record.
        Record.findByIdAndUpdate(req.params.id, record, {}, function (err,therecord) {
            if (err) { return next(err); }
            //successful - redirect to book detail page.
            res.redirect(therecord.url);
        });
    }

};