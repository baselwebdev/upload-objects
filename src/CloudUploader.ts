/**
 * @file Defining an abstract class to allow user to implement/extend their own S3Uploader logic.
 * */
import { CloudUploadOptions } from '../S3Uploader';

export default abstract class CloudUploader {
    protected readonly objectPrefix: string;
    protected readonly indexPath: string;
    protected readonly uploadFileDirectory: string;

    protected constructor(options: CloudUploadOptions) {
        this.objectPrefix = options.objectPrefix + '_';
        this.indexPath = '/' + options.indexPath;
        this.uploadFileDirectory = options.uploadFileDirectory;
    }

    public abstract startUpload(): void;

    public abstract printUrl(): void;
}
