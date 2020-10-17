/**
 * @file Defining an abstract class to allow user to implement/extend their own S3Object logic.
 * */

import { CloudUploadOptions } from '../CloudUploader';

export interface S3UploaderOptions extends CloudUploadOptions {
    bucketName: string;
}
