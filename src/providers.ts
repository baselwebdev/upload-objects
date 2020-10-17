/**
 * @file Defining an abstract class to allow user to implement/extend their own S3Object logic.
 * */

export default abstract class Providers {
    public readonly objectPrefix: string;
    public readonly indexPath: string = 'Index.html';
    public readonly uploadFileDirectory: string = __dirname + '/../uploads/files/';

    protected constructor(options: CloudUploadOptions) {
        this.objectPrefix = options.objectPrefix + '_';
        this.indexPath = '/' + options.indexPath;
        this.uploadFileDirectory = options.uploadFileDirectory ?? this.uploadFileDirectory;
    }
}

export interface CloudUploadOptions {
    objectPrefix: string;
    indexPath?: string;
    uploadFileDirectory?: string;
}
