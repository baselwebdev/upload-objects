import {config} from 'aws-sdk/index';
import S3 from  'aws-sdk/clients/s3';
import fs from 'fs';

config.update({region: 'eu-west-2'});

const File = fs.createReadStream(__dirname + '/test2.html')

let myS3 = new S3();

const S3Params: S3.Types.PutObjectRequest = {
    Bucket: 'baselwebdev2',
    Key: 'test2.html',
    Body: File,
    ContentType: 'text/html',
    ACL: 'public-read'
};

const S3Options: S3.ManagedUpload.ManagedUploadOptions = {}

myS3.upload(S3Params, S3Options, (error: Error, data: S3.ManagedUpload.SendData) => {
    if (error) {
        console.log('Error', error);
    } else {
        console.log('Success', data);
    }
});