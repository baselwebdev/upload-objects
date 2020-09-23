import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import glob from 'glob';

const UploadFileDirectory = __dirname + '/uploads/files/';
// get a list of all files for a given path
const GlobOptions = {
    cwd: UploadFileDirectory,
};
const HtmlFiles = glob.sync('**/*.html', GlobOptions);
const CssFiles = glob.sync('**/*.css', GlobOptions);
const JsFiles = glob.sync('**/*.js', GlobOptions);
const JsChunks = glob.sync('**/*.js.map', GlobOptions);
const CssChunks = glob.sync('**/*.css.map', GlobOptions);

UploadFiles(HtmlFiles, 'text/html');
UploadFiles(CssFiles, 'text/css');
UploadFiles(JsFiles, 'text/js');
UploadFiles(JsChunks, 'text/js');
UploadFiles(CssChunks, 'text/js');

function UploadFiles(CustomElementFiles: string[], ContentType: string) {
    let myS3 = new S3();
    const S3Options: S3.ManagedUpload.ManagedUploadOptions = {};
    CustomElementFiles.map((filePath: string) => {
        const File = fs.createReadStream(UploadFileDirectory + filePath);
        const S3Params: S3.Types.PutObjectRequest = {
            Bucket: 'baselwebdev2',
            Key: filePath,
            Body: File,
            ContentType: ContentType,
            ACL: 'public-read',
        };

        myS3.upload(S3Params, S3Options, (error: Error, data: S3.ManagedUpload.SendData) => {
            if (error) {
                console.log('Error', error);
            } else {
                console.log('Success', data);
            }
        });
    });
}
