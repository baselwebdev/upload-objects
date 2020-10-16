import { AWSError } from 'aws-sdk/lib/error';
import S3, { ManagedUpload } from 'aws-sdk/clients/s3';
import { S3UploaderOptions } from '../../index';
import fs from 'fs';
import glob from 'glob';
import CloudUploader from '../CloudUploader';

/**
 * @file AWS SDK S3 Usages.
 * */

export default class S3Manage implements CloudUploader {
    private myS3: S3;
    public readonly bucketName: string;
    public readonly objectPrefix: string;
    public readonly indexPath = 'Index.html';
    public readonly uploadFileDirectory: string;

    constructor(options: S3UploaderOptions) {
        this.myS3 = new S3();
        this.bucketName = options.bucketName;
        this.objectPrefix = options.objectPrefix;
        this.uploadFileDirectory = options.uploadFileDirectory as string;
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

    /**
     * @param customElementFiles - The files to be uploaded to S3.
     * @param contentType - The type of files to be uploaded to S3.
     * @param index - The index of which the folder directory the files should be uploaded to.
     * @returns Promise<ManagedUpload.SendData>[] - A collection of upload promises.
     */
    private collectUploadFiles(
        customElementFiles: string[],
        contentType: string,
        index: string,
    ): Promise<ManagedUpload.SendData>[] {
        const s3Options: S3.ManagedUpload.ManagedUploadOptions = {};

        const uploads: Promise<ManagedUpload.SendData>[] = [];

        customElementFiles.map((filePath: string) => {
            const file = fs.createReadStream(this.uploadFileDirectory + filePath);
            const s3Params: S3.Types.PutObjectRequest = {
                Bucket: this.bucketName,
                Key: this.objectPrefix + index + '/' + filePath,
                Body: file,
                ContentType: contentType,
                ACL: 'public-read',
            };

            uploads.push(this.myS3.upload(s3Params, s3Options).promise());
        });

        return uploads;
    }

    public findFiles(): string[][] {
        const globOptions = {
            cwd: this.uploadFileDirectory,
        };
        const htmlFiles = glob.sync('**/*.html', globOptions);
        const cssFiles = glob.sync('**/*.css', globOptions);
        const jsFiles = glob.sync('**/*.js', globOptions);
        const jsChunks = glob.sync('**/*.js.map', globOptions);
        const cssChunks = glob.sync('**/*.css.map', globOptions);

        return [htmlFiles, cssFiles, jsFiles, jsChunks, cssChunks];
    }

    public async upload(files: string[][], index: string): Promise<ManagedUpload.SendData[]> {
        const results1 = this.collectUploadFiles(files[0], 'text/html', index);
        const results2 = this.collectUploadFiles(files[1], 'text/css', index);
        const results3 = this.collectUploadFiles(files[2], 'text/js', index);
        const results4 = this.collectUploadFiles(files[3], 'text/css', index);
        const results5 = this.collectUploadFiles(files[4], 'text/js', index);

        return Promise.all(results1.concat(results2, results3, results4, results5));
    }

    public printUrl(index: string): void {
        console.log(
            'Entry url is: ' +
                'https://baselwebdev2.s3.eu-west-2.amazonaws.com/' +
                this.objectPrefix +
                index +
                this.indexPath,
        );
    }
}
