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
In the AWS Console, you'll need to [create a policy](https://console.aws.amazon.com/iam/home?#policies) to allow the Lambda task to delete snapshots and the log the results. Here's a policy you can use:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
        {
            "Action": [
                "ec2:DeleteSnapshot",
                "ec2:DescribeSnapshots"
            ],
            "Effect": "Allow",
            "Resource": [
                "*"
            ]
        }
    ]
}
```
You'll also need to [create an IAM role](https://console.aws.amazon.com/iam/home?#roles) with a name like `lambda-rotate-snapshots` and attach the policy created above to it. 

Next, package the directory for deployment:

   npm run-script package-for-deployment

Next, [create a new lambda function](https://console.aws.amazon.com/lambda/home?#/create). The default handler name of *index.handler* is the correct value. Use the zip file and Role you created above. 

The default Memory value of 128 MB should be fine, but consider raising the Timeout value to 1 minute to be sure the task has time to finish.

After creating the Lambda function, you'll need to add an Event Source to trigger the lambda function.  Using the *Scheduled Task* source is recommended, which works like cron. The syntax to trigger snapshot pruning after day at 3:00 UTC would be:

    cron(0 3 * * ? *)

Now you use the *Test* function in the console, selecting the *Scheduled Event* as the *Sample Event*.  For safety, make sure you have *dryRun* set to *true* in your configuration.

The dry run output in the Console will confirm the Description, Tags and StartTime of the snapshots that would be deleted to allow you to confirm before you enable. the task


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
