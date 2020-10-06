/**
 * @file Defining an abstract class to allow user to implement/extend their own S3Uploader logic.
 * */
import { CloudUploadOptions } from '../S3Uploader';

export default abstract class CloudUploader {
    protected readonly objectPrefix: string;
    protected readonly indexPath: string;
    protected readonly uploadFileDirectory: string = __dirname + '/../uploads/files/';

    protected constructor(options: CloudUploadOptions) {
        this.objectPrefix = options.objectPrefix + '_';
        this.indexPath = '/' + options.indexPath;
        this.uploadFileDirectory = options.uploadFileDirectory ?? this.uploadFileDirectory;
    }

    public abstract printUrl(index: string): void;
}
