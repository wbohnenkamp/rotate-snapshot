var aws    = require("aws-sdk")
  , _      = require("underscore")
  , async  = require("async")
  , moment = require("moment")
  , ec2    = new aws.EC2({apiVersion: "2015-10-01"})
  ;

var delList = function(snapshots, event) {
  if (event.hasOwnProperty("daily")) {
    var whitelist = _.chain(snapshots)
                     .groupBy(function(o) {
                       var m = moment(o.StartTime);
                       return m.format("YYYYMMDD");
                     })
                     .map(function(v) {
                       return _.chain(v)
                               .sortBy(function(o) { return o.StartTime.getTime(); })
                               .first()
                               .value();
                     })
                     .value()
      , a = _.pluck(snapshots, "SnapshotId")
      , b = _.pluck(whitelist, "SnapshotId")
      ;

    return _.map(_.difference(a, b), function(d) {
      return {"SnapshotId": d};
    });

  }

  return _.chain(snapshots)
          .sortBy(function(o) {
            return -o.StartTime.getTime();
          })
          .rest(event.rotate)
          .map(function(d) {
            return _.pick(d, "SnapshotId");
          })
          .value()
          ;
};

var delParams = function(snapshots, dryRun) {
  return _.map(snapshots, function(o) {
    return _.extend(o, { DryRun: dryRun });
  });
};

// async map iterator
var iterator = function(params, callback) {
  console.log("Deleted snapshotId : ", params);
  ec2.deleteSnapshot(params, function(err, data) {
    if (err) {
      if (err.hasOwnProperty("code") && err.code == "DryRunOperation") {
        data = err;
        err = null;
      }
    }
    callback(err, data);
  });
};

exports.handler = function(event, context) {
  // validate event
  if (!event.hasOwnProperty("filters")) {
    return context.done("event.filters is require.");
  }
  if (!event.hasOwnProperty("dryRun")) {
    return context.done("event.dryRun is require.");
  }
  if (!event.hasOwnProperty("rotate")) {
    return context.done("event.rotate is require.");
  }

  // params
  var params = { DryRun: false, Filters: event.filters };

  // describe snapshots and delete them.
  ec2.describeSnapshots(params, function(err, data) {
    if (err) {
      return context.done(err, err.stack);
    }

    // find snapshot ids to delete
    var snapshotIds = delList(data.Snapshots, event);
    console.log(snapshotIds);
    if (+snapshotIds.length == 0) {
      console.log("Do nothing. There is no snapshot to delete.");
      return context.succeed();
    }

    // delete snapshots
    var params = delParams(snapshotIds, event.dryRun);
    async.map(params, iterator, function(err, results) {
      return context.done(err, results);
    });

  });
};
