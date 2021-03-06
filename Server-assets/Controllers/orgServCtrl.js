var mongoose = require('mongoose');
var Org = require('../Models/orgSchema');
var User = require('../Models/userSchema');

module.exports = {


  /* addOrg checks creators userID to see if it exists. If yes, then the function
  moves onto check whether if the Organzation name submitted is an original,
  if yes, then an Organization is created with the desired inputs from the user
  and the user's ID and role is set to a members property before the org is saved to the database */
  addOrg: function(req, res) {
    console.log(11111, req.body);
    console.log(2222, req.params.userID);
    User.findById(req.params.userID).exec().then(function(user) {
      if (!user) {
        return res.status(500).end();
      }
      else {
        Org.findOne({name: req.body.name}).exec().then(function(org) {
          if(org) {
            return res.send("exists");
          }
          else {
          org = new Org(req.body);
          org.members.push({userid: req.params.userID, role: 'Admin'});
          org.save(function() {
            res.status(200).end();
          });
          }
        });
      }
    });
  },

  //gets Organizations for users not associated with an organization yet
  getOrgs: function(req, res) {
    Org.find({}).find({status: "Active"}).sort({name: 1}).exec().then(function(results) {
      return res.json(results);
    }).then(null, function(err) {
      return res.status(500).json(err);
    });
  },

  //gets an Organization for users not associated with an organization yet
  getOrg: function(req, res) {
    Org.findById(req.params.orgID).populate("apts._id").exec().then(function(results) {
      if(!results) {
        res.status(404);
      }
      else {
      return res.json(results);
      }
    }).then(null, function(err) {
      return res.status(500).json(err);
    });
  },

  //This allows for organization properties like description, location, name, etc. to be changed
  //also, checks that organization name doesn't already exist

  updateOrg: function(req, res){
    Org.findOne({name: req.body.name}).exec().then(function(org){
      if(org) {
          return res.send("exists");
        } else {
          Org.update({_id: req.params.orgID}, req.body).exec().then(function(results){
            return res.send("Organization Updated");
          });
        }
    });
  },

  // app.post('/api/org/:orgID/users', orgServCtrl.addOrgUser);
  addOrgUser: function(req, res){
    Org.findById({_id: req.params.orgID}).exec().then(function(org){
      if(!org) {
        res.status(404);
      }
      else {
        var members = org.members;
        var userExists;
        for(var i = 0; i < members.length; i++) {
          if(members[i].userid === req.body.userid){
            userExists = true;
            break;
          }
          else{
              userExists = false;
          }
        }
        if(userExists === false) {
          org.members.push(req.body);
          org.save(function() {
              return res.status(200).end();
            });
        }
        else if (userExists === true) {
          console.log("User not in Org!");
          return res.status(404).end();
        }
      }
      });
  },

  // app.put('/api/org/:orgID/users', orgServCtrl.removeOrgUser);
  removeOrgUser: function(req, res) {
   Org.findById({_id: req.params.orgID}).exec().then(function(org) {
     if(!org) {
       res.status(404);
     }
     else {
       var members = org.members;
       for(var i = 0; i < members.length; i++) {
         if(members[i].userid === req.body.userid){
            members.splice(i, 1);
            break;
         }
       }
       org.save(function(){
          res.status(200).end();
       });
     }
   });
 },

// api/org/:orgID // GET
 getOrgUsers: function(req, res){
  Org.findById({_id: req.params.orgID}).populate("members.userid").exec().then(function(results){
    res.json(results.members);
  });
 },

  changeOrgRole: function(req, res) {
  Org.findById({_id: req.params.orgID}).exec().then(function(org) {
    if(!org) {
      res.status(404);
    }
    else {
      var members = org.members;
      var userExists;
      for(var i = 0; i < members.length; i++) {
        if(members[i].userid === req.body.userid){
          userExists = true;
          break;
        }
        else{
            userExists = false;
        }
      }
      if(userExists === true) {
        members[i].role = req.body.role;
      }
      else if (userExists === false) {
        console.log("User not in Org!");
        return res.status(404).end();
      }
    }
  org.save(function(){
    res.status(200).end();
  });
});
},














};
