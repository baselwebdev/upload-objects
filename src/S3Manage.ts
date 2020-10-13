import { AWSError } from 'aws-sdk/lib/error';
import S3 from 'aws-sdk/clients/s3';
import { S3UploaderOptions } from '../S3Uploader';

/**
 * @file AWS SDK S3 Usages.
 * */

export default class S3Manage {
    private myS3: S3;
    public readonly bucketName: string;
    public readonly objectPrefix: string;

    constructor(options: S3UploaderOptions) {
        this.myS3 = new S3();
        this.bucketName = options.bucketName;
        this.objectPrefix = options.objectPrefix;
    }

    public async listUploads(): Promise<S3.ObjectList> {
        const data = await this.myS3
            .listObjectsV2({ Bucket: this.bucketName, Prefix: this.objectPrefix })
            .promise()
            .catch((err: AWSError) => {
                throw Error(err.message);
            });

        return data.Contents as S3.ObjectList;
    }
}
