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
  var ec2Service = awssum.load('amazon/ec2');
  
  check(config.accessKeyId, 'missing AWS access key Id').notNull();
  check(config.secretAccessKey, 'missing AWS secret access key').notNull();
  check(config.awsAccountId, 'missing AWS account Id').notNull();
  check(config.region, 'missing AWS region').notNull();
  this.ec2 = new ec2Service(config.accessKeyId, config.secretAccessKey, config.awsAccountId, config.region);
};

EC2.prototype.all = function(action, callback) {
  this.each(action, null, callback);
};

EC2.prototype.running = function(action, callback) {
  this.each(action, { FilterName  : [ 'instance-state-name'], FilterValue : [ [ 'running' ]] }, callback);
};

EC2.prototype.each = function(action, filters, callback) {
  this.ec2.DescribeInstances(filters, function(err, data) {
    if(err) {
      return callback(err);
    }
 
    _getTasks(action, data, function(err, tasks) { 
      if(err) {
        return callback(err);
      }    
      
      async.parallel(tasks, function(err, results) {
        return callback(err, results);
      });
    });
  });
};

var _getFunctionForAction = function(action, item) {
  return function(callback) {
    try {
      if(action === null || action === undefined) {
        return callback(null, { item: item });
      }      

      action(item, function(err, data) {
        return callback(err, { item: item, error: err, data: data});
      });
    } catch(actionerror) {
      return callback(actionerror);
    }          
  }; 
};

var _getTasks = function(action, data, callback) {
  try {    
    var tasks = [];    
    var items = data.Body.DescribeInstancesResponse.reservationSet.item;
    if (items !== undefined && items !== null) {
      if (items instanceof Array) {
        items.forEach(function(item) {
          tasks.push(_getFunctionForAction(action, item));
        });
      } else {
        tasks.push(_getFunctionForAction(action, items));
      }
    }
    
    return callback(null, tasks);  
  } catch(e) {
    return callback(e);
  }
};