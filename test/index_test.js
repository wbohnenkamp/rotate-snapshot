var proxyquire = require('proxyquire')
  , assert     = require('assert')
  , sinon      = require('sinon')
  ;

describe('func-rotate-snapshot', function() {
  describe('#handler(event, context)', function() {

    context('when event does not have require param', function() {
      it('should call context.done', function () {
        var context = {}
          , lambda  = require('../index')
          ;

        // filters
        context.done = function(err, data) {
          assert.equal('event.filters is require.', err);
        };
        lambda.handler({dryRun: true, rotate: 7}, context);

        // dryRun
        context.done = function(err, data) {
          assert.equal('event.dryRun is require.', err);
        };
        lambda.handler({filters: [], rotate: 7}, context);

        // rotate
        context.done = function(err, data) {
          assert.equal('event.rotate is require.', err);
        };
        lambda.handler({filters: [], dryRun: true}, context);
      });
    });

    context('when ec2.describeSnapshots() calls back with err', function() {
      it('should call context.done', function () {
        var context = { done: function(err, data) {
                          assert.deepEqual({stack: 'foo'}, err);
                          assert.equal('foo', err.stack);
                      }}
          , ec2 = function() {
                    this.describeSnapshots = function(params, callback) {
                      var err = {stack: 'foo'}
                      callback(err, null);
                    };
                  }
          , lambda = proxyquire('../index', { 'aws-sdk': {EC2: ec2} })
          ;

        lambda.handler({ filters: [], dryRun: true, rotate: 7 }, context);
      });
    });

    context('when ec2.describeSnapshots() calls back with data', function() {
      var context = { done: function(err, results) {
                              assert.deepEqual([{}], results);
                            },
                      succeed: function(){}
                    }
        , ec2 = function() {
                  this.describeSnapshots = function(params, callback) {
                    callback(null, {Snapshots: [
                      {SnapshotId: 's-1', StartTime: new Date(2015,1,1)},
                      {SnapshotId: 's-2', StartTime: new Date(2015,1,2)}
                    ]})
                  };
                  this.deleteSnapshot = function(params, callback) {
                    assert.deepEqual({ SnapshotId: 's-1', DryRun: true }, params);
                    callback(null, {});
                  };
                }
        , lambda = proxyquire('../index', { 'aws-sdk': { EC2: ec2 } })
        , spy    = sinon.spy(console, 'log')
        ;

      lambda.handler({ filters: [], dryRun: true, rotate: 2 }, context);
      it('should call context.succeed', function () {
        var msg = 'Do nothing. There is no snapshot to delete.'
        assert.ok(spy.calledWith(msg));
      });

      lambda.handler({ filters: [], dryRun: true, rotate: 1 }, context);
      it('should call context.done', function () {
        var params = {DryRun: true, SnapshotId: 's-1'};
        assert.ok(spy.calledWith('Deleted snapshotId : ', params));
      });

    });
  });
});
