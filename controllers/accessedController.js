var Accessed = require('../models/accessed');
var Record = require('../models/record');
var async = require('async');

// Display list of all BookInstances
exports.accessed_list = function(req, res, next) {
    
    Accessed.find()
    .populate('record')
    .exec(function (err, list_accessed) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('accessed_list', { title: 'Accessed List', accessed_list: list_accessed });
    });
    
};

// Display detail page for a specific BookInstance
exports.accessed_detail = function(req, res, next) {
    
    Accessed.findById(req.params.id)
    .populate('record')
    .exec(function (err, accessed) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('accessed_detail', { title: 'Record:', accessed: accessed });
    });
    
};

// Display BookInstance create form on GET
exports.accessed_create_get = function(req, res, next) {       
    
    Record.find({},'number')
    .exec(function (err, records) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('accessed_form', {title: 'Create Accessed', record_list:records});
    });
    
};

// Handle BookInstance create on POST 
exports.accessed_create_post = function(req, res, next) {
    
    req.checkBody('record', 'Record must be specified').notEmpty(); //We won't force Alphanumeric, because book titles might have spaces.
    req.checkBody('condition', 'Condition must be specified').notEmpty();
    //req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true }).isDate();
    
    req.sanitize('record').escape();
    req.sanitize('condition').escape();
    req.sanitize('medication').escape();
    req.sanitize('record').trim();
    req.sanitize('condition').trim();   
    req.sanitize('medication').trim();
    req.sanitize('date_accessed').toDate();
    
    var accessed = new Accessed({
        record: req.body.record,
        condition: req.body.condition, 
        medication: req.body.medication,
        date_accesed: req.body.date_accessed
    });

    var errors = req.validationErrors();
    if (errors) {
        
        Record.find({},'number')
        .exec(function (err, records) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('accessed_form', { title: 'Create Accessed', record_list : records, selected_record : accessed.record._id , errors: errors, accessed:accessed });
        });
        return;
    } 
    else {
    // Data from form is valid
    
        accessed.save(function (err) {
            if (err) { return next(err); }
                //successful - redirect to new book-instance record.
                res.redirect(accessed.url);
            }); 
    }

};

// Display BookInstance delete form on GET
exports.accessed_delete_get = function(req, res, next) {
    
    Accessed.findById(req.params.id)
    .populate('record')
    .exec(function (err, accessed) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('accessed_delete', { title: 'Delete Accessed', accessed:  accessed});
    })

};

// Handle BookInstance delete on POST
exports.accessed_delete_post = function(req, res, next) {
    //Assume valid bookinstance id in field (should check)
    Accessed.findByIdAndRemove(req.body.id, function deleteAccessed(err) {
        if (err) { return next(err); }
        //success, so redirect to list of bookinstances.
        res.redirect('/catalog/accesses')
        });

};

// Display BookInstance update form on GET
exports.accessed_update_get = function(req, res, next) {
    
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get book, authors and genres for form
    async.parallel({
        accessed: function(callback) {
            Accessed.findById(req.params.id).populate('record').exec(callback)
        },
        records: function(callback) {
            Record.find(callback)
        },

        }, function(err, results) {
            if (err) { return next(err); }

            res.render('accessed_form', { title: 'Update  Accessed', record_list : results.records, selected_record : results.accessed.record._id, accessed:results.accessed });
        });

};

// Handle bookinstance update on POST
exports.accessed_update_post = function(req, res, next) {

    req.sanitize('id').escape();
    req.sanitize('id').trim();

    req.checkBody('record', 'Record must be specified').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
    req.checkBody('condition', 'Condition must be specified').notEmpty();
    //req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true }).isDate();

    req.sanitize('record').escape();
    req.sanitize('condition').escape();
    req.sanitize('medication').escape();
    req.sanitize('record').trim();
    req.sanitize('condition').trim();
    req.sanitize('medication').trim();
    req.sanitize('date_accessed').toDate();

    var accessed = new Accessed(
        { record: req.body.record,
        condition: req.body.condition,
        medication: req.body.medication,
        date_accessed: req.body.date_accesed,
        _id: req.params.id
        });

    var errors = req.validationErrors();
    if (errors) {

        Record.find({},'number')
        .exec(function (err, records) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('accessed_form', { title: 'Update Accessed', record_list : records, selected_record : accessed.record._id , errors: errors, accessed:accessed });
        });
        return;
    }
    else {
        // Data from form is valid
        Accessed.findByIdAndUpdate(req.params.id, accessed, {}, function (err,theaccessed) {
            if (err) { return next(err); }
                //successful - redirect to genre detail page.
                res.redirect(theaccessed.url);
            });
    }

};