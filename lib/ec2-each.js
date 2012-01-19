/*
 * ec2-each.js: Iterate ec2 instances and do things.
 *
 * (C) 2012 B2M Solutions
 * MIT LICENSE
 *
 */

var control = require('control');

// Expose version through 'pkginfo'.
require('pkginfo')(module, 'version');

var EC2 = exports.EC2 = function(config) {
  this.config = config;
};

EC2.prototype.all = function(callback) {
  setTimeout(function() {
    return callback('not implemented');  
  }, 500);  
};