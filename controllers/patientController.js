var Patient = require('../models/patient');
var async = require('async');
var Record = require('../models/record');

// Display list of all Authors
exports.patient_list = function(req, res, next) {
    
    Patient.find()
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_patients) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('patient_list', { title: 'Patient List', patient_list: list_patients });
    });

};

// Display detail page for a specific Author
exports.patient_detail = function(req, res, next) {
    
    async.parallel({
    patient: function(callback) {     
        Patient.findById(req.params.id)
        .exec(callback);
    },
    patients_records: function(callback) {
        Record.find({ 'patient': req.params.id },'number provider')
        .exec(callback);
    },
    }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('patient_detail', { title: 'Patient Detail', patient: results.patient, patient_records: results.patients_records });
    });
    
};

// Display Author create form on GET
exports.patient_create_get = function(req, res, next) {       
    res.render('patient_form', { title: 'Create Patient'});
};

// Handle Author create on POST 
exports.patient_create_post = function(req, res, next) {
    
     req.checkBody('first_name', 'First name must be specified.').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
     req.checkBody('family_name', 'Family name must be specified.').notEmpty();
     req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlpha();
     // optional() to run a validation only if a field has been entered. Check that the optional date of birth is a date
     //req.checkBody('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isDate(); //checkFalsy is we will accept either empty 
     //req.checkBody('date_of_death', 'Invalid date').optional({ checkFalsy: true }).isDate(); //string or null as an empty value
     
     // escape() removes HTML characters from the variable that might be used
     // in Javascript cross-site scripting attacks
     req.sanitize('first_name').escape();
     req.sanitize('family_name').escape();
     req.sanitize('first_name').trim();     
     req.sanitize('family_name').trim();
     req.sanitize('date_of_birth').toDate();
     req.sanitize('date_of_death').toDate();
 
     var errors = req.validationErrors();
     
     var patient = new Patient(
       { first_name: req.body.first_name, 
         family_name: req.body.family_name, 
         date_of_birth: req.body.date_of_birth,
         date_of_death: req.body.date_of_death
        });
        
     if (errors) {
         res.render('patient_form', { title: 'Create Patient', patient: patient, errors: errors});
     return;
     } 
     else {
     // Data from form is valid
     // Do not check if Author object already exists before saving. We should but assume 
     // there can be multiple authors with the same name
         patient.save(function (err) {
             if (err) { return next(err); }
                //successful - redirect to new author record.
                res.redirect(patient.url);
             });
     }
 
 };

// Display Author delete form on GET
exports.patient_delete_get = function(req, res, next) {       
    
    async.parallel({
        patient: function(callback) {     
            Patient.findById(req.params.id).exec(callback);
        },
        patients_records: function(callback) {
            Record.find({ 'patient': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('patient_delete', { title: 'Delete Patient', patient: results.patient, patient_records: results.patients_records } );
    });
    
};

// Handle Author delete on POST 
exports.patient_delete_post = function(req, res, next) {
    
    req.checkBody('patientid', 'Patient id must exist').notEmpty();  
    
    async.parallel({
        patient: function(callback) {     
            Patient.findById(req.body.patientid).exec(callback);
        },
        patients_records: function(callback) {
            Record.find({ 'patient': req.body.patientid },'number provider').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.patients_records.length > 0) {
            //Author has books. Render in same way as for GET route.
            res.render('patient_delete', { title: 'Delete Patient', patient: results.patient, patient_records: results.patients_records } );
            return;
        }
        else {
            //Author has no books. Delete object and redirect to the list of authors.
            Patient.findByIdAndRemove(req.body.patientid, function deletePatient(err) {
                if (err) { return next(err); }
                //Success - got to author list
                res.redirect('/catalog/patients');
            });

        }
    });

};

// Display Author update form on GET
exports.patient_update_get = function(req, res, next) {
    
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    Patient.findById(req.params.id, function(err, patient) {
        if (err) { return next(err); }
        //On success
        res.render('patient_form', { title: 'Update Patient', patient: patient });

    });
};

// Handle Author update on POST
exports.patient_update_post = function(req, res, next) {

    req.sanitize('id').escape();
    req.sanitize('id').trim();

    req.checkBody('first_name', 'First name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlpha();
    //req.checkBody('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isDate();
    //req.checkBody('date_of_death', 'Invalid date').optional({ checkFalsy: true }).isDate();
    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();
    req.sanitize('family_name').trim();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();

    //Run the validators
    var errors = req.validationErrors();

    //Create a author object with escaped and trimmed data (and the old id!)
    var patient = new Patient(
        {
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id
        }
    );

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('patient_form', { title: 'Update Patient', patient: patient, errors: errors});
    return;
    }
    else {
        // Data from form is valid. Update the record.
        Patient.findByIdAndUpdate(req.params.id, patient, {}, function (err,thepatient) {
            if (err) { return next(err); }
                //successful - redirect to genre detail page.
                res.redirect(thepatient.url);
            });
    }


};