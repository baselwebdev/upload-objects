/**
 * @file Definition for S3Uploader.
 * */

export interface S3UploaderOptions extends CloudUploadOptions {
    bucketName: string;
}

export interface CloudUploadOptions {
    objectPrefix: string;
    indexPath?: string;
    uploadFileDirectory?: string;
}
