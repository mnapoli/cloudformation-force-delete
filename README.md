# Clean up old CloudFormation stacks

Is your AWS account littered with old CloudFormation stacks? Deleting them is a pain when they contain S3 buckets: you need to empty those manually.

This tool automates the process:

```sh
npx cloudformation-force-delete your-stack-name
```

It will delete the stack after emptying any S3 buckets it contains.

> [!WARNING]
> Use at your own risk! This tool will delete resources in your AWS account. Make sure you select the right stack, region, and profile.

## Options

- `--region` - The AWS region to use. Defaults to your profile's default (or `us-east-1` if not set).
- `--profile` - The AWS profile to use. Defaults to your default profile.
