var Clinician = require('../models/clinician');
var Record = require('../models/record');
var async = require('async');

// Display list of all Genre
exports.clinician_list = function(req, res, next) {
    
    Clinician.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_clinician) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('clinician_list', { title: 'Clinician List', clinician_list: list_clinician });
    });

};

// Display detail page for a specific Genre
exports.clinician_detail = function(req, res, next) {
    
    async.parallel({
    clinician: function(callback) {  
        Clinician.findById(req.params.id)
        .exec(callback);
    },
        
    clinician_records: function(callback) {            
        Record.find({ 'clinician': req.params.id })
        .exec(callback);
    },

    }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('clinician_detail', { title: 'Clinician Detail', clinician: results.clinician, clinician_records: results.clinician_records } );
    });

};

// Display Genre create form on GET
exports.clinician_create_get = function(req, res, next) {       
    res.render('clinician_form', { title: 'Create Clinician' });
};

// Handle Genre create on POST 
exports.clinician_create_post = function(req, res, next) {
    
    //Check that the name field is not empty
    req.checkBody('name', 'Clinician name required').notEmpty(); 
    
    //Trim and escape the name field. 
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    
    //Run the validators
    var errors = req.validationErrors();

    //Create a genre object with escaped and trimmed data.
    var clinician = new Clinician(
      { name: req.body.name }
    );
    
    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('clinician_form', { title: 'Create Clinician', clinician: clinician, errors: errors});
    return;
    } 
    else {
        // Data from form is valid.
        //Check if Genre with same name already exists
        Clinician.findOne({ 'name': req.body.name })
            .exec( function(err, found_clinician) {
                 console.log('found_clinician: ' + found_clinician);
                 if (err) { return next(err); }
                 
                 if (found_clinician) { 
                     //Genre exists, redirect to its detail page
                     res.redirect(found_clinician.url);
                 }
                 else {
                     
                    clinician.save(function (err) {
                       if (err) { return next(err); }
                       //Genre saved. Redirect to genre detail page
                       res.redirect(clinician.url);
                     });
                     
                 }
                 
             });
    }

};

// Display Genre delete form on GET
exports.clinician_delete_get = function(req, res, next) {
    
    async.parallel({
        clinician: function(callback) {
            Clinician.findById(req.params.id).exec(callback);
        },
        clinician_records: function(callback) {
            Record.find({ 'clinician': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('clinician_delete', { title: 'Delete Clinician', clinician: results.clinician, clinician_records: results.clinician_records } );
    });

};

// Handle Genre delete on POST
exports.clinician_delete_post = function(req, res, next) {

    req.checkBody('id', 'Clinician id must exist').notEmpty();

    async.parallel({
        clinician: function(callback) {
            Clinician.findById(req.params.id).exec(callback);
        },
        clinician_records: function(callback) {
            Record.find({ 'clinician': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.clinician_records.length > 0) {
            //Genre has books. Render in same way as for GET route.
            res.render('clinician_delete', { title: 'Delete Clinician', clinician: results.clinician, clinician_records: results.clinician_records } );
            return;
        }
        else {
            //Genre has no books. Delete object and redirect to the list of genres.
            Clinician.findByIdAndRemove(req.body.id, function deleteClinician(err) {
                if (err) { return next(err); }
                //Success - got to genres list
                res.redirect('/catalog/clinicians');
            });

        }
    });

};

// Display Genre update form on GET
exports.clinician_update_get = function(req, res, next) {

    req.sanitize('id').escape();
    req.sanitize('id').trim();
    Clinician.findById(req.params.id, function(err, clinician) {
        if (err) { return next(err); }
        //On success
        res.render('clinician_form', { title: 'Update Clinician', clinician: clinician });
    });

};

// Handle Genre update on POST
exports.clinician_update_post = function(req, res, next) {

    req.sanitize('id').escape();
    req.sanitize('id').trim();
    //Check that the name field is not empty
    req.checkBody('name', 'Clinician name required').notEmpty();
    //Trim and escape the name field.
    req.sanitize('name').escape();
    req.sanitize('name').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a genre object with escaped and trimmed data (and the old id!)
    var clinician = new Clinician(
        {
        name: req.body.name,
        _id: req.params.id
        }
    );

    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('clinician_form', { title: 'Update Clinician', clinician: clinician, errors: errors});
    return;
    }
    else {
        // Data from form is valid. Update the record.
        Clinician.findByIdAndUpdate(req.params.id, clinician, {}, function (err,theclinician) {
            if (err) { return next(err); }
                //successful - redirect to genre detail page.
                res.redirect(theclinician.url);
            });
    }

};