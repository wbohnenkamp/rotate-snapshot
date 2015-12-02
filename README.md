# rotate-snapshot
This is an AWS lambda function.
This function rotates snapshots that filtered by event source.
Spapshots will be kept up to `rotate` number sort by new date.

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

All parametes are reuiqre.

### filters

`filters` params are used for to describe snapshots.

### dryRun

`dryRun` param is used to dry-run execution.

### rotate

Filterd snapshots are hold up to `rotate` number.
