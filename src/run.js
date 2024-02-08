import minimist from 'minimist';
import {
    CloudFormationClient,
    DeleteStackCommand,
    ListStackResourcesCommand,
    waitUntilStackDeleteComplete,
} from '@aws-sdk/client-cloudformation';
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import ora from 'ora';
import pressAnyKey from 'press-any-key';

/** @type {S3Client} */
let s3;

export async function run() {
    const argv = minimist(process.argv.slice(2));
    const stackName = argv._[0];
    if (!stackName) {
        console.error('Missing stack name');
        console.error('Usage: cloudformation-force-delete <stack-name>');
        process.exit(1);
    }

    s3 = new S3Client({
        region: argv.region,
        profile: argv.profile,
    });

    const cloudFormation = new CloudFormationClient({
        region: argv.region,
        profile: argv.profile,
    });

    console.log(`Deleting stack ${stackName}`);
    await pressAnyKey('Press Enter to continue, or Ctrl+C to cancel');
    console.log();

    const spinner = ora('retrieving stack').start();

    // Retrieve all S3 buckets in the CloudFormation stack
    const {StackResourceSummaries} = await cloudFormation.send(new ListStackResourcesCommand({
        StackName: stackName,
    }));
    const buckets = StackResourceSummaries
        .filter((resource) => resource.ResourceType === 'AWS::S3::Bucket')
        .map((resource) => resource.PhysicalResourceId);

    spinner.text = `emptying ${buckets.length} S3 buckets`;

    // Empty all S3 buckets
    let i = 0;
    for (const bucket of buckets) {
        await emptyBucket(bucket);
        i++;
        spinner.text = `emptying ${buckets.length} S3 buckets (${i}/${buckets.length})`;
    }

    spinner.text = 'deleting stack';

    // Delete the CloudFormation stack
    await cloudFormation.send(new DeleteStackCommand({
        StackName: stackName,
    }));
    await waitUntilStackDeleteComplete({client: cloudFormation, StackName: stackName});

    spinner.succeed('stack deleted');
}

async function emptyBucket(bucket) {
    const {Contents} = await s3.send(new ListObjectsV2Command({
        Bucket: bucket,
    }));
    const keys = Contents.map((object) => object.Key);
    await s3.send(new DeleteObjectsCommand({
        Bucket: bucket, Delete: {
            Objects: keys.map((Key) => ({Key})),
        },
    }));
}
