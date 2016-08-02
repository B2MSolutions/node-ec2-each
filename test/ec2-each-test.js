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
    ec2each = require('../lib/ec2-each.js'),
    awssum = require('awssum');

var EC2 = ec2each.EC2;

vows.describe('ec2-each')
 .addBatch({
  'with non-null configuration': {
    'should return accessKey error': function() {
      try {
        new EC2({ accessKeyId: "x", secretAccessKey: "s", awsAccountId: "1", region: "rr"});
        throw 'shouldnt get here';
      } catch(e) {
        e.should.eql('ec2: invalid region \'rr\'');
      }
    }
  }
})
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
      stubEc2Service.DescribeInstances = function(filter, callback) { return callback('ERR'); };
      sinon.stub(awssum, 'load').returns({ Ec2: function() { return stubEc2Service;} });
      return null;
    },
    'and a valid EC2': {
      topic: function() { return new EC2({ accessKeyId: "x", secretAccessKey: "s", awsAccountId: "1", region: "rr"}); },
      'when calling running': {
        topic: function(ec2) {
          ec2.running(this.callback);
        },
        'should error': function(err, result) {
          should.exist(err);
          err.should.equal('ERR');
        }
      },
      'when calling all with no filters': {
        topic: function(ec2) {
          ec2.all(null, this.callback);
        },
        'should error': function(err, result) {
          should.exist(err);
          err.should.equal('ERR');
        }
      },
    },
    teardown: function(err, result){
      awssum.load.restore();
    }
  }
})
.addBatch({
  'Given two instances' : {
    topic: function() {

      var instances = {
        Body: {
          DescribeInstancesResponse :{
            reservationSet: [{
              item: [
                { reservationId: "r-xxxxxxxx" },
                { reservationId: "r-yyyyyyyy" }
              ]
            }]
          }
        }
      };

      var stubEc2Service = sinon.stub();
      sinon.stub(awssum, 'load').returns({ Ec2: function() { return stubEc2Service;} });
      return instances;
    },
    'and a valid EC2': {
      topic: function(instances) {
        return {
          ec2: new EC2({ accessKeyId: "x", secretAccessKey: "s", awsAccountId: "1", region: "rr"}),
          instances: instances
        };
      },
      'when calling any' : {
        topic : function(data) {
          return data.ec2.any(data.instances);
        },
        'should return true': function(result) {
          result.should.equal(true);
        }
      },
      'when calling each with a null action': {
        topic: function(data) {
          data.ec2.each(data.instances, null, null, this.callback);
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
      'when calling each with an action that does not error': {
        topic: function(data) {
          var action = sinon.stub();
          action.withArgs({ reservationId: "r-xxxxxxxx" }, 'somestate').yields(null, 'xxxxxxxx');
          action.withArgs({ reservationId: "r-yyyyyyyy" }, 'somestate').yields(null, 'yyyyyyyy');
          data.ec2.each(data.instances, action, 'somestate', this.callback);
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
      'when calling each with an action that fails on the first call': {
        topic: function(data) {
          var action = sinon.stub();
          action.withArgs({ reservationId: "r-xxxxxxxx" }).yields('xxxxxxxx failed', 'xxxxxxxx');
          action.withArgs({ reservationId: "r-yyyyyyyy" }).yields(null, 'yyyyyyyy');
          data.ec2.each(data.instances, action, null, this.callback);
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
      'when calling each with an action that fails on the second call': {
        topic: function(data) {
          var action = sinon.stub();
          action.withArgs({ reservationId: "r-xxxxxxxx" }).yields(null, 'xxxxxxxx');
          action.withArgs({ reservationId: "r-yyyyyyyy" }).yields('yyyyyyyy failed', 'yyyyyyyy');
          data.ec2.each(data.instances, action, null, this.callback);
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

      var instances = {
        Body: {
          DescribeInstancesResponse :{
            reservationSet: [{
              item:  [{ reservationId: "r-xxxxxxxx" }]
            }]
          }
        }
      };

      var stubEc2Service = sinon.stub();
      sinon.stub(awssum, 'load').returns({ Ec2: function() { return stubEc2Service;} });
      return instances;
    },
    'and a valid EC2': {
      topic: function(instances) {
        return {
          ec2: new EC2({ accessKeyId: "x", secretAccessKey: "s", awsAccountId: "1", region: "rr"}),
          instances: instances
        };
      },
      'when calling any' : {
        topic : function(data) {
          return data.ec2.any(data.instances);
        },
        'should return true': function(result) {
          result.should.equal(true);
        }
      },
      'when calling each with a null action': {
        topic: function(data) {
          data.ec2.each(data.instances, null, null, this.callback);
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
.addBatch({
  'When DescribeInstances returns undefined item' : {
    topic: function() {
      var instances = {
        Body: {
          DescribeInstancesResponse :{
            reservationSet: [{
            }]
          }
        }
      };

      var stubEc2Service = sinon.stub();
      sinon.stub(awssum, 'load').returns({ Ec2: function() { return stubEc2Service;} });
      return instances;
    },
    'and a valid EC2': {
       topic: function(instances) {
        return {
          ec2: new EC2({ accessKeyId: "x", secretAccessKey: "s", awsAccountId: "1", region: "rr"}),
          instances: instances
        };
      },
      'when calling any' : {
        topic : function(data) {
          return data.ec2.any(data.instances);
        },
        'should return false': function(result) {
          result.should.equal(false);
        }
      },
      'when calling each with a null action': {
        topic: function(data) {
          data.ec2.each(data.instances, null, null, this.callback);
        },
        'should not error': function(err, result) {
          should.not.exist(err);
        },
        'should return something': function(err, result) {
          should.exist(result);
        },
        'should return zero items': function(err, result) {
          result.should.have.length(0);
        },
      }
    },
    teardown: function(err, result){
      awssum.load.restore();
    }
  }
})
.addBatch({
  'with a valid EC2': {
    topic: function() {
      var stubEc2Service = sinon.stub();
      stubEc2Service.DescribeInstances = function(filter, callback) { return callback(null, filter); };
      sinon.stub(awssum, 'load').returns({ Ec2: function() { return stubEc2Service;} });
      return new EC2({ accessKeyId: "x", secretAccessKey: "s", awsAccountId: "1", region: "rr"});
    },
    'when calling all with no filters': {
      topic: function(ec2) {
        ec2.all(null, this.callback);
      },
      'should not error': function(err, stub) {
        should.not.exist(err);
      },
      'should call DescribeInstances with null filter': function(err, filter){
        should.exist(filter);
        should.not.exist(filter.Filter);
      }
    },
    'when calling all with filters': {
      topic: function(ec2) {
        ec2.all('some filters', this.callback);
      },
      'should not error': function(err, stub) {
        should.not.exist(err);
      },
      'should call DescribeInstances with supplied filters': function(err, filter){
        should.exist(filter);
        filter.Filter.should.eql('some filters');
      }
    },
    'when calling running': {
      topic: function(ec2) {
        ec2.running(this.callback);
      },
      'should not error': function(err, stub) {
        should.not.exist(err);
      },
      'should call DescribeInstances with expected filter': function(err, filter){
        should.exist(filter);
        var expected = { Filter: [{ Name  : 'instance-state-name', Value : [ 'running' ] }] };
        filter.should.eql(expected);
      },
    }
  },
  teardown: function(err, result){
    awssum.load.restore();
  }
})
.export(module);
