#! /usr/bin/env node

console.log('This script populates a some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

//Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Record = require('./models/record')
var Patient = require('./models/patient')
var Clinician = require('./models/clinician')
var Accessed = require('./models/accessed')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var patients = []
var clinicians = []
var records = []
var accesses = []

function patientCreate(first_name, family_name, d_birth, d_death, cb) {
  patientdetail = {first_name:first_name , family_name: family_name }
  if (d_birth != false) patientdetail.date_of_birth = d_birth
  if (d_death != false) patientdetail.date_of_death = d_death
  
  var patient = new Patient(patientdetail);
       
  patient.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Patient: ' + patient);
    patients.push(patient)
    cb(null, patient)
  }  );
}

function clinicianCreate(name, cb) {
  var clinician = new Clinician({ name: name });
       
  clinician.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Clinician: ' + clinician);
    clinicians.push(clinician)
    cb(null, clinician);
  }   );
}

function recordCreate(number, provider, id, patient, clinician, cb) {
  recorddetail = { 
    number: number,
    provider: provider,
    patient: patient,
    id: id
  }
  if (clinician != false) recorddetail.clinician = clinician
    
  var record = new Record(recorddetail);    
  record.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Record: ' + record);
    records.push(record)
    cb(null, record)
  }  );
}

function accessedCreate(record, condition, date_accessed, medication, cb) {
  accesseddetail = { 
    record: record,
    condition: condition
  }    
  if (date_accessed != false) accesseddetail.date_accessed = date_accessed
  if (medication != false) accesseddetail.medication = medication
    
  var accessedinstance = new Accessed(accesseddetail);    
  accessedinstance.save(function (err) {
    if (err) {
      console.log('ERROR CREATING Accessed: ' + accessedinstance);
      cb(err, null)
      return
    }
    console.log('New Accessed: ' + accessedinstance);
    accesses.push(accessedinstance)
    cb(null, record)
  }  );
}


function createClinicianPatients(cb) {
    async.parallel([
        function(callback) {
          patientCreate('Patrick', 'Rothfuss', '1973-06-06', false, callback);
        },
        function(callback) {
          patientCreate('Ben', 'Bova', '1932-11-8', false, callback);
        },
        function(callback) {
          patientCreate('Isaac', 'Asimov', '1920-01-02', '1992-04-06', callback);
        },
        function(callback) {
          patientCreate('Bob', 'Billings', false, false, callback);
        },
        function(callback) {
          patientCreate('Jim', 'Jones', '1971-12-16', false, callback);
        },
        function(callback) {
          clinicianCreate("Dr. Carson", callback);
        },
        function(callback) {
          clinicianCreate("Dr. Blumenthal", callback);
        },
        function(callback) {
          clinicianCreate("Dr. Pepper", callback);
        },
        ],
        // optional callback
        cb);
}


function createRecords(cb) {
    async.parallel([
        function(callback) {
          recordCreate('111111', 'Blue Cross Blue Shield', 'HO9781473211896', patients[0], [clinicians[0],], callback);
        },
        function(callback) {
          recordCreate("222222", 'Aetna', 'HO9788401352836', patients[0], [clinicians[0],], callback);
        },
        function(callback) {
          recordCreate("333333", 'Kaiser', 'HO9780756411336', patients[0], [clinicians[0],], callback);
        },
        function(callback) {
          recordCreate("444444", "United Healthcare", 'HO9780765379528', patients[1], [clinicians[1],], callback);
        },
        function(callback) {
          recordCreate("555555","Humana", 'HO9780765379504', patients[1], [clinicians[1],], callback);
        },
        function(callback) {
          recordCreate('666666', 'Cigna', 'HO9780776779504', patients[4], [clinicians[0],clinicians[1]], callback);
        },
        function(callback) {
          recordCreate('777777', 'Assurant', 'HO9780765311474', patients[4], false, callback)
        }
        ],
        // optional callback
        cb);
}


function createAccesses(cb) {
    async.parallel([
        function(callback) {
          accessedCreate(records[0], 'stomach', false, 'Codeine', callback)
        },
        function(callback) {
          accessedCreate(records[1], ' headache', false, 'Percocet', callback)
        },
        function(callback) {
          accessedCreate(records[2], ' headache', false, false, callback)
        },
        function(callback) {
          accessedCreate(records[3], 'stomach', false, 'Codeine', callback)
        },
        function(callback) {
          accessedCreate(records[3], 'stomach', false, 'Vicodin', callback)
        },
        function(callback) {
          accessedCreate(records[3], 'stomach', false, 'Codeine', callback)
        },
        function(callback) {
          accessedCreate(records[4], 'stomach', false, 'Vicodin', callback)
        },
        function(callback) {
          accessedCreate(records[4], 'stomach', false, 'Percocet', callback)
        },
        function(callback) {
          accessedCreate(records[4], 'flu', false, 'Lean', callback)
        },
        function(callback) {
          accessedCreate(records[0], 'toe', false, false, callback)
        },
        function(callback) {
          accessedCreate(records[1], 'toe', false, false, callback)
        }
        ],
        // optional callback
        cb);
}



async.series([
    createClinicianPatients,
    createRecords,
    createAccesses
],
// optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('ACCESSES: '+accesses);
        
    }
    //All done, disconnect from database
    mongoose.connection.close();
});



