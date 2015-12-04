# rotate-snapshot
[![Circle CI](https://circleci.com/gh/szkkentaro/rotate-snapshot/tree/master.svg?style=svg)](https://circleci.com/gh/szkkentaro/rotate-snapshot/tree/master)

This is an AWS lambda function.
This function rotates snapshots that filtered by event source.
Snapshots will be kept up to `rotate` number sort by new date.

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

`dryRun` param is used to dry-run execution.

### rotate

Filterd snapshots are hold up to `rotate` number.
