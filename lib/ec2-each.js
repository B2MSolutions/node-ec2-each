/*
 * ec2-each.js: Iterate ec2 instances and do things.
 *
 * (C) 2012 B2M Solutions
 * MIT LICENSE
 *
 */
var awssum = require('awssum');
var check = require('validator').check;

// Expose version through 'pkginfo'.
require('pkginfo')(module, 'version');

var EC2 = exports.EC2 = function(config) {  
  if(config == null) {
    throw new Error('Missing configuration');
  }
  
  check(config.accessKeyId, 'missing AWS access key Id').notNull();
  check(config.secretAccessKey, 'missing AWS secret access key').notNull();
  check(config.awsAccountId, 'missing AWS account Id').notNull();
  check(config.region, 'missing AWS region').notNull();
  this.config = config;
};

EC2.prototype.all = function(callback) {
  setTimeout(function() {
    return callback('not implemented');  
  }, 500);  
};