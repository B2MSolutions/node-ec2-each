# ec2-each
_ec2-each_ is a [node](http://nodejs.org) package for iterating EC2 instances and doing things.

[![Build Status](https://secure.travis-ci.org/B2MSolutions/node-ec2-each.png)](http://travis-ci.org/B2MSolutions/node-ec2-each)

## Installation
    $ npm install ec2-each
  
## Example

    var logReservationIds = function(callback) {
    
      var config = {
        accessKeyId: "AAAABBBBCCCCDDDDEEEE",
        secretAccessKey: "aaaa2222bbbb3333cccc4444dddd5555eeeefff",
        awsAccountId: 123456789012,
        region: "eu-west-1"
      };
            
      var logReservationId = function(item, state, callback) {
        console.log(item.reservationId);
        callback(null);
      };
      
      var ec2 = new each.EC2(config);
      ec2.running(function(err, instances) {
        ec2.each(instances, logReservationId, null, callback);
      });
      
    };
    
## all(filters, callback)

Returns a set of all EC2 instances (irrespective of status) that can be passed into _each_. 
The supplied [awssum](https://github.com/appsattic/node-awssum) filters will be applied.

## running(action, callback)

Returns a set of all running EC2 instances that can be passed into _each_.

## each(instances, action, state, callback)

Calls the action function once per EC2 instance passed in.
The instances must be in the format as returned by _all_, _running_ or an [awssum](https://github.com/appsattic/node-awssum) DescribeInstances call.

The action could, for example, make an ssh call to the EC2 instance.

The state is passed to every action.

The callback is passed an error if any of the actions fail and the callback data contains an array of action results.

All actions are called in parallel.

## Contributors
Pair programmed by [Roy Lines](http://roylines.co.uk) and [James Bloomer](https://github.com/jamesbloomer).