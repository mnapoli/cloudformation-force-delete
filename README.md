# Clean up old CloudFormation stacks

Is your AWS account littered with old CloudFormation stacks? Deleting them is a pain when they contain S3 buckets: you need to empty them manually.

This tool automates the process:

```sh
npx cloudformation-force-delete stack-to-delete
```

It will delete the stack after emptying any S3 buckets it contains.

## Options

- `--region` - The AWS region to use. Defaults to your profile's default (or `us-east-1` if not set).
- `--profile` - The AWS profile to use. Defaults to your default profile.
