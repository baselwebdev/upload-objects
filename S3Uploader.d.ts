/**
 * @file Definition for S3Uploader.
 * */

export interface S3UploaderOptions {
    bucketName: string;
    objectPrefix: string;
    indexPath: string;
    uploadFileDirectory: string;
}
