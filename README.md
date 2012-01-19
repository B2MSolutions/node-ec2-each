# ec2-each
Node package for iterating ec2 instances and doing things.

## Usage
<pre>
  var ec2-each = require('ec2-each');

  var config = {};
  var ec2 = ec2-each.initialise(config);
  var ec2 = new ec2-each.EC2(config);
  
  ec2.running(function(err, details) {
    // do something
  });  
</pre>