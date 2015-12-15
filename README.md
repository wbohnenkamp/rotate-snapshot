# rotate-snapshot
[![Circle CI](https://circleci.com/gh/szkkentaro/rotate-snapshot/tree/master.svg?style=svg)](https://circleci.com/gh/szkkentaro/rotate-snapshot/tree/master)

This is an AWS lambda function.
This function rotates snapshots that filtered by event source.
Snapshots will be kept up to `rotate` number sort by new date.

## Usage

If you want to filter with resource tag, you can request event like this.
```json
{
  "filters": [
    {
      "Name": "tag:Name",
      "Values": [
        "foo"
      ]
    },
    {
      "Name": "description",
      "Values": [
        "Created by *"
      ]
    }
  ],
  "dryRun": true,
  "rotate": 7
}
```

## Setup

```console
cd /path/to/anywhere
git clone https://github.com/szkkentaro/rotate-snapshot.git
cd rotate-snapshot
npm install
```

## Sample event

```json
{
  "filters": [
    { "Name": "description", "Values": [ "test *" ] },
    { "Name": "status", "Values": [ "completed" ] }
  ],
  "dryRun": true,
  "rotate": 7
}
```

## Event Params

All parameters are required.

### filters

`filters` params are used for to describe snapshots.

### dryRun

The `dryRun` boolean checks whether you have the required permissions to delete the snapshots, without actually deleting anything, and provides an error response. If you have the required permissions, the error response is DryRunOperation. Otherwise, it is UnauthorizedOperation. Erros are logged to the [Amazon CloudWatch Logs stream associated with the Lambda function](http://docs.aws.amazon.com/lambda/latest/dg/monitoring-functions-logs.html). If you invoke the function using the Lambda console, the console displays the logs in the Log output section. 

### rotate

Filterd snapshots are hold up to `rotate` number.

## See Also

 * [Official Docs: Programming Model for Authoring Lambda Functions in Node.js](http://docs.aws.amazon.com/lambda/latest/dg/programming-model.html)
