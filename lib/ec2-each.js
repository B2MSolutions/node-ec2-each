/*
 * ec2-each.js: Iterate ec2 instances and do things.
 *
 * (C) 2012 B2M Solutions
 * MIT LICENSE
 *
 */
 
var awssum = require('awssum'),
    async = require('async'),
    check = require('validator').check;

// Expose version through 'pkginfo'.
require('pkginfo')(module, 'version');

var EC2 = exports.EC2 = function(config) {  
  if(config === null || config === undefined) {
    throw new Error('Missing configuration');
  }
  // var amazon = awssum.load('amazon/amazon'),
  var ec2Service = awssum.load('amazon/ec2');
  
  check(config.accessKeyId, 'missing AWS access key Id').notNull();
  check(config.secretAccessKey, 'missing AWS secret access key').notNull();
  check(config.awsAccountId, 'missing AWS account Id').notNull();
  check(config.region, 'missing AWS region').notNull();
  this.ec2 = new ec2Service(config.accessKeyId, config.secretAccessKey, config.awsAccountId, config.region);
};

EC2.prototype.all = function(action, callback) {  
  this.ec2.DescribeInstances(function(err, data) {
    if(err) {
      return callback(err);
    }
  
    var items = data.Body.DescribeInstancesResponse.reservationSet.item;

    var tasks = [];    
    items.forEach(function(item) {
      tasks.push(function(cb) {
        action(item, function(err, data) {
          return cb(err, { item: item, data: data});
        });
      });          
    });
            
    async.parallel(tasks, function(err, results) {
      return callback(err, results);
    });
  });
};