# ec2-each
_ec2-each_ is a [node](http://nodejs.org) package for iterating EC2 instances and doing things.

## Installation
    $ npm install ec2-each
  
## Example

    var config = {
      accessKeyId: "AAAABBBBCCCCDDDDEEEE",
      secretAccessKey: "aaaa2222bbbb3333cccc4444dddd5555eeeefff",
      awsAccountId: 123456789012,
      region: "eu-west-1"
    };
          
    var logReservationId = function(item, callback) {
      console.log(item.reservationId);
      callback(null);
    };
    
    var ec2 = new each.EC2(config);
    ec2.all(logReservationId, function(err, results) {
      if(err) {
        console.log(err);
      }
      
      console.log(results);
    });
    
## each(action, filter, callback)

Calls the action function once per EC2 instance that satisy the [awssum](https://github.com/appsattic/node-awssum) filter.
Each call is passed item data describing the instance.
The action could, for example, make an ssh call to the EC2 instance.

The callback is passed an error if any of the actions fail and the callback data contains an array of action results.

All actions are called in parallel.

## all(action, callback)

Calls _each_ for all EC2 instances (irrespective of status).

## running(action, callback)

Calls _each_ for all running EC2 instances.
