/**
 * @file Definition for S3Object.
 * */

export interface S3UploaderOptions extends CloudUploadOptions {
    bucketName: string;
}

export interface CloudUploadOptions {
    objectPrefix: string;
    indexPath?: string;
    uploadFileDirectory?: string;
}
