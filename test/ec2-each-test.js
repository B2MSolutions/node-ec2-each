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

vows.describe('ec2-each')
.addBatch({
  'when configuration is undefined' : {
    topic: undefined,
    'should throw when creating EC2': function(config) {
      (function(){
        new EC2(config);
      }).should.throw('Missing configuration');
    }
  },
  'when configuration is null' : {
    topic: null,
    'should throw when creating EC2': function(config) {
      (function(){
        new EC2(config);
      }).should.throw('Missing configuration');
    }
  },
  'when configuration is missing access key Id' : {
    topic: { secretAccessKey: "s", awsAccountId: "1", region:"r"},
    'should throw when creating EC2': function(config) {      
      (function() {
        new EC2(config);
      }).should.throw('missing AWS access key Id');
    }
  },
  'when configuration is missing secretAccessKey' : {
    topic: { accessKeyId: "x", awsAccountId: "1", region:"r"},
    'should throw when creating EC2': function(config) {      
      (function() {
        new EC2(config);
      }).should.throw('missing AWS secret access key');
    }
  },
  'when configuration is missing account Id' : {
    topic: { accessKeyId: "x", secretAccessKey: "s", region:"r"},
    'should throw when creating EC2': function(config) {      
      (function() {
        new EC2(config);
      }).should.throw('missing AWS account Id');
    }
  },
  'when configuration is missing region' : {
    topic: { accessKeyId: "x", secretAccessKey: "s", awsAccountId: "1"},
    'should throw when creating EC2': function(config) {      
      (function() {
        new EC2(config);
      }).should.throw('missing AWS region');
    }
  },
})
/*
.addBatch({
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
})*/.export(module);