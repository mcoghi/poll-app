'use strict'

var mongo = require('mongodb').MongoClient
  , config = require('./credentials.js')
  , ObjectID = require('mongodb').ObjectID;
// search for a user in the database
function findUser(query, callBack){

  mongo.connect(config.dbUrl, function(err, db){
    
    if (err) throw err;
    
    var users = db.collection("users");
    users.find(query).toArray(function(err, documents){
      
      if (err) {
        
        // if the search went wrong, pass the error to the call back
        callBack(err, null);
        
        db.close();
        
      } else if (documents.length == 0){
        
        // if the search didn't produce any result, tell the callback
        callBack(null, null);
        
        db.close();
        
      } else {
      
        // if there is at least one result pass the first one
        callBack(null, documents[0]);
      
        db.close();
      }
    });
  });
}

// save new user
function saveUser(query, callBack){
  
  // open the database
  mongo.connect(config.dbUrl, function(err, db){
    
    // open the collection
    var users = db.collection("users");
    
    // insert the new user
    users.insert(query, function(err, data){
      
      // if there is an error during insertion, pass it to the call back
      if (err){ 
        
        callBack(err)
        
        db.close();
        
      } else {
        
        // if there are no errors, call the callback
        console.log("there's a new user!");
      
        callBack(null);
        
        db.close();
      }
    })
  })
}

// create new poll
function newPoll(query, callBack){
  
  //connect to database
  mongo.connect(config.dbUrl, function(err, db){
    
    if (err) throw err;
    
    // open the polls
    var polls = db.collection('polls');
    
    // insert the new poll
    polls.insert(query, function(err, data){
      
      if (err) throw err;
      
      callBack();
      
      db.close();
    })
    
  })
}

// get the polls
function getPolls(query, callBack){
  
  //connect to database
  mongo.connect(config.dbUrl, function(err, db){
    
    if (err) throw err;
    
    // open the polls collection
    var polls = db.collection('polls');
    
    // if the id is specified, modify the query
    if (query.id){
      query._id = ObjectID(query.id);
      delete query.id;
    }
    
    polls.find(query).toArray(function(err, documents){
      
      if (err) throw err;
      
      callBack(documents);
      db.close();
    })
  })
}

// cast a new vote OR add a new option!
function castVote(query, callBack){
  
  mongo.connect(config.dbUrl, function(err, db){
    
    if (err) throw err;
    
    // open the polls collection
    var polls = db.collection('polls');
      
    polls.find({
      "_id": ObjectID(query.id)
    }).toArray(function(err, documents){
      
      var doc = {
        title : documents[0].title,
        options : documents[0].options,
        votes : documents[0].votes,
        username : documents[0].username
      }
        
      // if is a new option, add it
      if (doc.options.indexOf(query.option) == -1){
        
        // add new option
        doc.options.push(query.option);
        
        // set the vote count to 0
        doc.votes.push(0);
        
        // if the option already exists vote it
      } else {
      
        doc.votes[doc.options.indexOf(query.option)] += 1;
        
      }
      console.log(doc);
      
      polls.update({
        "_id": ObjectID(query.id)
      }, doc);
      
      db.close();
    })
  })
}

// delete a poll
function deletePoll(query){
  
  mongo.connect(config.dbUrl, function(err, db){
     
    if (err) throw err;
    
    var polls = db.collection('polls');
    
    polls.remove({
      "_id" : ObjectID(query.id),
      "username" : query.username
    });
    
    db.close();
    
  })
}
// exports
module.exports = {
  findUser : findUser,
  saveUser : saveUser,
  newPoll : newPoll,
  getPolls : getPolls,
  castVote : castVote,
  deletePoll : deletePoll
}