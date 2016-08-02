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
  var ec2Service = awssum.load('amazon/ec2').Ec2;

  check(config.accessKeyId, 'missing AWS access key Id').notNull();
  check(config.secretAccessKey, 'missing AWS secret access key').notNull();
  check(config.awsAccountId, 'missing AWS account Id').notNull();
  check(config.region, 'missing AWS region').notNull();
  this.ec2 = new ec2Service(config);
};

EC2.prototype.all = function(filters, callback) {
  this.ec2.DescribeInstances({ Filter: filters }, callback);
};

EC2.prototype.running = function(callback) {
  this.ec2.DescribeInstances({ Filter: [{ Name  : 'instance-state-name', Value : [ 'running' ] }] }, callback);
};

EC2.prototype.each = function(instances, action, state, callback) {
  _getTasks(action, instances, state, function(err, tasks) {
    if(err) {
      return callback(err);
    }

    async.parallel(tasks, function(err, results) {
      return callback(err, results);
    });
  });
};

EC2.prototype.any = function(instances) {
  return instances.Body.DescribeInstancesResponse.reservationSet[0].item !== undefined;
};

var _getFunctionForAction = function(action, state, item) {
  return function(callback) {
    try {
      if(action === null || action === undefined) {
        return callback(null, { item: item });
      }

      action(item, state, function(err, data) {
        return callback(err, { item: item, error: err, data: data});
      });
    } catch(actionerror) {
      return callback(actionerror);
    }
  };
};

var _getTasks = function(action, data, state, callback) {
  try {
    var tasks = [];
    if(EC2.prototype.any(data)) {
      var items = data.Body.DescribeInstancesResponse.reservationSet[0].item;
      items.forEach(function(item) {
        tasks.push(_getFunctionForAction(action, state, item));
      });
    }

    return callback(null, tasks);
  } catch(e) {
    return callback(e);
  }
};