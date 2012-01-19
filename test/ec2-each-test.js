/*
 * ec2-each-tests.js: Tests for ec2-each.js
 *
 * (C) 2012 B2M Solutions
 * MIT LICENSE
 *
 */
 
/*jshint expr:true es5:true*/

var should = require('should'),
    sinon = require('sinon'),
    vows = require('vows'),
    ec2 = require('../lib/ec2-each.js');

var EC2 = ec2.EC2;

vows.describe('ec2-each').addBatch({
  'An EC2' : {
    topic: new EC2(),
      'with invalid configuration' : {
        topic: function(ec2) {
          // set up condition
          return ec2;
        },
        'when calling all': {
          topic: function(ec2) {
            ec2.all(this.callback);
          },
          'should error' : function(err, result) {
            should.exist(err);
          }
        }
      }
  }
}).export(module);