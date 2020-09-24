import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import glob from 'glob';
import { AWSError } from 'aws-sdk/lib/error';

const myS3 = new S3();
const bucketName = 'baselwebdev2';

const uploadFileDirectory = __dirname + '/uploads/files/';
// get a list of all files for a given path
const globOptions = {
    cwd: uploadFileDirectory,
};
const htmlFiles = glob.sync('**/*.html', globOptions);
const cssFiles = glob.sync('**/*.css', globOptions);
const jsFiles = glob.sync('**/*.js', globOptions);
const jsChunks = glob.sync('**/*.js.map', globOptions);
const cssChunks = glob.sync('**/*.css.map', globOptions);

try {
    (async () => {
        await myS3.listObjectsV2({ Bucket: bucketName }, (err: AWSError, data: S3.Types.ListObjectsOutput) => {
            if (err) {
                throw Error(err.message);
            } else {
                console.log(data);
            }
        });
    })();
} catch (e) {
    console.log(e);
}

uploadFiles(htmlFiles, 'text/html', 1000);
uploadFiles(cssFiles, 'text/css', 1000);
uploadFiles(jsFiles, 'text/js', 1000);
uploadFiles(cssChunks, 'text/css', 1000);
uploadFiles(jsChunks, 'text/js', 1000);

function uploadFiles(customElementFiles: string[], contentType: string, index: number) {
    const s3Options: S3.ManagedUpload.ManagedUploadOptions = {};

    customElementFiles.map((filePath: string) => {
        const file = fs.createReadStream(uploadFileDirectory + filePath);
        const s3Params: S3.Types.PutObjectRequest = {
            Bucket: bucketName,
            Key: index + '/' + filePath,
            Body: file,
            ContentType: contentType,
            ACL: 'public-read',
        };

        myS3.upload(s3Params, s3Options, (error: Error, data: S3.ManagedUpload.SendData) => {
            if (error) {
                console.log('Error', error);
            } else {
                console.log('Success', data);
            }
        });
    });
}
