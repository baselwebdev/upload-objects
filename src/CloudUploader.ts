/**
 * @file Defining an abstract class to allow user to implement/extend their own S3Object logic.
 * */
import { CloudUploadOptions } from '../S3Uploader';

export default abstract class CloudUploader {
    public readonly objectPrefix: string;
    public readonly indexPath: string = 'Index.html';
    public readonly uploadFileDirectory: string = __dirname + '/../uploads/files/';

    protected constructor(options: CloudUploadOptions) {
        this.objectPrefix = options.objectPrefix + '_';
        this.indexPath = '/' + options.indexPath;
        this.uploadFileDirectory = options.uploadFileDirectory ?? this.uploadFileDirectory;
    }
}
