import S3Uploader from '../src/S3Uploader';
import { S3UploaderOptions } from '../S3Uploader';

const options: S3UploaderOptions = {
    bucketName: 'asda',
    objectPrefix: 'asda',
    indexPath: 'asda',
    uploadFileDirectory: 'asda',
};

const s3 = new S3Uploader(options);

test('right index is returned', () => {
    s3.startUpload();
});
