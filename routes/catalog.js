var express = require('express');
var router = express.Router();

// Require controller modules
var record_controller = require('../controllers/recordController');
var patient_controller = require('../controllers/patientController');
var clinician_controller = require('../controllers/clinicianController');
var accessed_controller = require('../controllers/accessedController');

/// BOOK ROUTES ///

/* GET catalog home page. */
router.get('/', record_controller.index);

/* GET request for creating a Book. NOTE This must come before routes that display Book (uses id) */
router.get('/record/create', record_controller.record_create_get);

/* POST request for creating Book. */
router.post('/record/create', record_controller.record_create_post);

/* GET request to delete Book. */
router.get('/record/:id/delete', record_controller.record_delete_get);

// POST request to delete Book
router.post('/record/:id/delete', record_controller.record_delete_post);

/* GET request to update Book. */
router.get('/record/:id/update', record_controller.record_update_get);

// POST request to update Book
router.post('/record/:id/update', record_controller.record_update_post);

/* GET request for one Book. */
router.get('/record/:id', record_controller.record_detail);

/* GET request for list of all Book items. */
router.get('/records', record_controller.record_list);

/// AUTHOR ROUTES ///

/* GET request for creating Author. NOTE This must come before route for id (i.e. display author) */
router.get('/patient/create', patient_controller.patient_create_get);

/* POST request for creating Author. */
router.post('/patient/create', patient_controller.patient_create_post);

/* GET request to delete Author. */
router.get('/patient/:id/delete', patient_controller.patient_delete_get);

// POST request to delete Author
router.post('/patient/:id/delete', patient_controller.patient_delete_post);

/* GET request to update Author. */
router.get('/patient/:id/update', patient_controller.patient_update_get);

// POST request to update Author
router.post('/patient/:id/update', patient_controller.patient_update_post);

/* GET request for one Author. */
router.get('/patient/:id', patient_controller.patient_detail);

/* GET request for list of all Authors. */
router.get('/patients', patient_controller.patient_list);

/// GENRE ROUTES ///

/* GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id) */
router.get('/clinician/create', clinician_controller.clinician_create_get);

/* POST request for creating Genre. */
router.post('/clinician/create', clinician_controller.clinician_create_post);

/* GET request to delete Genre. */
router.get('/clinician/:id/delete', clinician_controller.clinician_delete_get);

// POST request to delete Genre
router.post('/clinician/:id/delete', clinician_controller.clinician_delete_post);

/* GET request to update Genre. */
router.get('/clinician/:id/update', clinician_controller.clinician_update_get);

// POST request to update Genre
router.post('/clinician/:id/update', clinician_controller.clinician_update_post);

/* GET request for one Genre. */
router.get('/clinician/:id', clinician_controller.clinician_detail);

/* GET request for list of all Genre. */
router.get('/clinicians', clinician_controller.clinician_list);

/// BOOKINSTANCE ROUTES ///

/* GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id) */
router.get('/accessed/create', accessed_controller.accessed_create_get);

/* POST request for creating BookInstance. */
router.post('/accessed/create', accessed_controller.accessed_create_post);

/* GET request to delete BookInstance. */
router.get('/accessed/:id/delete', accessed_controller.accessed_delete_get);

// POST request to delete BookInstance
router.post('/accessed/:id/delete', accessed_controller.accessed_delete_post);

/* GET request to update BookInstance. */
router.get('/accessed/:id/update', accessed_controller.accessed_update_get);

// POST request to update BookInstance
router.post('/accessed/:id/update', accessed_controller.accessed_update_post);

/* GET request for one BookInstance. */
router.get('/accessed/:id', accessed_controller.accessed_detail);

/* GET request for list of all BookInstance. */
router.get('/accesses', accessed_controller.accessed_list);

module.exports = router;