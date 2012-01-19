# ec2-each
Node package for iterating ec2 instances and doing things.

## Usage
<pre>
  var EC2 = require('ec2-each').EC2;
  
  var ec2 = new EC2();  
  ec2.all(function(err, details) {
    // do something
  });  
</pre>