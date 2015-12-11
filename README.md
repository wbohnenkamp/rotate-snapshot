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

### Required

#### filters

`filters` params are used for to describe snapshots.

#### dryRun

`dryRun` param is used to dry-run execution.

#### rotate

Filterd snapshots are hold up to `rotate` number.

### Preserved Options

#### daily

When `daily` param is `true`, it keeps the first snapshot in a day for every each day. And, Filterd snapshots are hold up to `rotate` number.
