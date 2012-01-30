/*
 * log-all.js: cli to iterate all instances and log reservation id to 
 *
 * (C) 2012 B2M Solutions
 * MIT LICENSE
 *
 */
 
var each = require('../lib/ec2-each.js');
 
if(process.argv.length != 6) {
  console.log('Usage: node log-all.js accessKeyId secretAccessKey awsAccountId region');
  process.exit(1);
}

var config = {
  accessKeyId: process.argv[2],
  secretAccessKey: process.argv[3],
  awsAccountId: process.argv[4],
  region: process.argv[5]
};
      
var logReservationId = function(item, callback) {
  console.log(item.reservationId);
  callback(null);
};

var ec2 = new each.EC2(config);
ec2.all(function(err, instances) {
  if(err) {
    console.log(err);
    process.exit(1);
  }
  
  ec2.each(instances, logReservationId, function(err) {
    if(err) {
      console.log(err);
      process.exit(1);
    }
    
    process.exit(0);
  });
});