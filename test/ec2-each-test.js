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
    ec2 = require('../lib/ec2-each.js'),
    awssum = require('awssum');
    
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
.addBatch({
  'When DescribeInstances returns error' : {
    topic: function() {      
      var stubEc2Service = sinon.stub();
      stubEc2Service.DescribeInstances = function(callback) { return callback('ERR'); };
      sinon.stub(awssum, 'load').returns(function() { return stubEc2Service;});
      return null;
    },
    'and a valid EC2': {
      topic: function() { return new EC2({ accessKeyId: "x", secretAccessKey: "s", awsAccountId: "1", region: "rr"}); },
      'when calling all': {
        topic: function(ec2) {        
          ec2.all(null, this.callback);        
        },
        'should error': function(err, result) {
          should.exist(err);
          err.should.equal('ERR');
        }
      }
    },
    teardown: function(err, result){
      awssum.load.restore();
    }
  }
})
.addBatch({
  'When DescribeInstances returns two items' : {
    topic: function() {      
      var stubEc2Service = sinon.stub();
      var items = {
        Body: {
          DescribeInstancesResponse :{
            reservationSet: {
              item: [ 
                { reservationId: "r-xxxxxxxx" },
                { reservationId: "r-yyyyyyyy" }
              ]
            }
          }
        }
      };
      
      stubEc2Service.DescribeInstances = function(callback) { return callback(null, items); };
      sinon.stub(awssum, 'load').returns(function() { return stubEc2Service;});
      return null;
    },
    'and a valid EC2': {
      topic: function() { return new EC2({ accessKeyId: "x", secretAccessKey: "s", awsAccountId: "1", region: "rr"}); },
      'when calling all with a null action': {
        topic: function(ec2) {        
          ec2.all(null, this.callback);        
        },
        'should not error': function(err, result) {
          should.not.exist(err);
        },
        'should return something': function(err, result) {
          should.exist(result);
        },
        'should return two items': function(err, result) {
          result.should.have.length(2);
        },
        'should return reservationId "r-xxxxxxxx"': function(err, result) {
          result.should.includeEql({ item: { reservationId: "r-xxxxxxxx" }});
        },
        'should return reservationId "r-yyyyyyyy"': function(err, result) {
          result.should.includeEql({ item: { reservationId: "r-yyyyyyyy" }});
        },
      },
      'when calling all with an action that does not error': {
        topic: function(ec2) { 
          var action = sinon.stub();
          action.withArgs({ reservationId: "r-xxxxxxxx" }).yields(null, 'xxxxxxxx');
          action.withArgs({ reservationId: "r-yyyyyyyy" }).yields(null, 'yyyyyyyy');
          ec2.all(action, this.callback);        
        },
        'should not error': function(err, result) {
          should.not.exist(err);
        },
        'should return something': function(err, result) {
          should.exist(result);
        },
        'should return two items': function(err, result) {
          result.should.have.length(2);
        },
        'should return reservationId "r-xxxxxxxx" and xxxxxxxx': function(err, result) {
          result.should.includeEql({ item: { reservationId: "r-xxxxxxxx"} , error: null, data: 'xxxxxxxx'});
        },
        'should return reservationId "r-yyyyyyyy" and yyyyyyyy': function(err, result) {
          result.should.includeEql({ item: { reservationId: "r-yyyyyyyy"}, error: null, data: 'yyyyyyyy' });
        },        
      },
      'when calling all with an action that fails on the first call': {
        topic: function(ec2) { 
          var action = sinon.stub();
          action.withArgs({ reservationId: "r-xxxxxxxx" }).yields('xxxxxxxx failed', 'xxxxxxxx');
          action.withArgs({ reservationId: "r-yyyyyyyy" }).yields(null, 'yyyyyyyy');
          ec2.all(action, this.callback);        
        },
        'should error': function(err, result) {
          should.exist(err);
          err.should.eql('xxxxxxxx failed');
        },
        'should return something': function(err, result) {
          should.exist(result);
        },
        'should return two items': function(err, result) {
          result.should.have.length(2);
        },
        'should return reservationId "r-xxxxxxxx" and xxxxxxxx and correct error': function(err, result) {
          result.should.includeEql({ item: { reservationId: "r-xxxxxxxx"} , error: 'xxxxxxxx failed', data: 'xxxxxxxx'});
        },
        'should return reservationId "r-yyyyyyyy" and yyyyyyyy': function(err, result) {
          result.should.includeEql({ item: { reservationId: "r-yyyyyyyy"}, error: null, data: 'yyyyyyyy' });
        },        
      },
      'when calling all with an action that fails on the second call': {
        topic: function(ec2) { 
          var action = sinon.stub();
          action.withArgs({ reservationId: "r-xxxxxxxx" }).yields(null, 'xxxxxxxx');
          action.withArgs({ reservationId: "r-yyyyyyyy" }).yields('yyyyyyyy failed', 'yyyyyyyy');
          ec2.all(action, this.callback);        
        },
        'should error': function(err, result) {
          should.exist(err);
          err.should.eql('yyyyyyyy failed');
        },
        'should return something': function(err, result) {
          should.exist(result);
        },
        'should return two items': function(err, result) {
          result.should.have.length(2);
        },
        'should return reservationId "r-xxxxxxxx" and xxxxxxxx': function(err, result) {
          result.should.includeEql({ item: { reservationId: "r-xxxxxxxx"} , error: null, data: 'xxxxxxxx'});
        },
        'should return reservationId "r-yyyyyyyy" and yyyyyyyy and correct error': function(err, result) {
          result.should.includeEql({ item: { reservationId: "r-yyyyyyyy"}, error: 'yyyyyyyy failed', data: 'yyyyyyyy' });
        },        
      },
    },
    teardown: function(err, result){
      awssum.load.restore();    
    }
  }
})
.addBatch({
  'When DescribeInstances returns one item' : {
    topic: function() {      
      var stubEc2Service = sinon.stub();
      var items = {
        Body: {
          DescribeInstancesResponse :{
            reservationSet: {
              item:  { reservationId: "r-xxxxxxxx" }
            }
          }
        }
      }; 
      
      stubEc2Service.DescribeInstances = function(callback) { return callback(null, items); };
      sinon.stub(awssum, 'load').returns(function() { return stubEc2Service;});
      return null;
    },
    'and a valid EC2': {
      topic: function() { return new EC2({ accessKeyId: "x", secretAccessKey: "s", awsAccountId: "1", region: "rr"}); },
      'when calling all with a null action': {
        topic: function(ec2) {        
          ec2.all(null, this.callback);        
        },
        'should not error': function(err, result) {
          should.not.exist(err);
        },
        'should return something': function(err, result) {
          should.exist(result);
        },
        'should return one item': function(err, result) {
          result.should.have.length(1);
        },
        'should return reservationId "r-xxxxxxxx"': function(err, result) {
          result.should.includeEql({ item: { reservationId: "r-xxxxxxxx" }});
        },
      }
    },
    teardown: function(err, result){
      awssum.load.restore();    
    }
  }
})
.export(module);
