import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import glob from 'glob';

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

uploadFiles(htmlFiles, 'text/html');
uploadFiles(cssFiles, 'text/css');
uploadFiles(jsFiles, 'text/js');
uploadFiles(cssChunks, 'text/css');
uploadFiles(jsChunks, 'text/js');

function uploadFiles(customElementFiles: string[], contentType: string) {
    const s3Options: S3.ManagedUpload.ManagedUploadOptions = {};
    customElementFiles.map((filePath: string) => {
        const file = fs.createReadStream(uploadFileDirectory + filePath);
        const s3Params: S3.Types.PutObjectRequest = {
            Bucket: bucketName,
            Key: filePath,
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
