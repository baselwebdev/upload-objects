import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import glob from 'glob';
import { AWSError } from 'aws-sdk/lib/error';
import { type } from 'os';

const myS3 = new S3();
const bucketName = 'baselwebdev2';
const objectPrefix = 'term_selector' + '_';

const uploadFileDirectory = __dirname + '/uploads/files/';
const globOptions = {
    cwd: uploadFileDirectory,
};
const htmlFiles = glob.sync('**/*.html', globOptions);
const cssFiles = glob.sync('**/*.css', globOptions);
const jsFiles = glob.sync('**/*.js', globOptions);
const jsChunks = glob.sync('**/*.js.map', globOptions);
const cssChunks = glob.sync('**/*.css.map', globOptions);

const getListOfObjects: Promise<number> = new Promise((resolve, reject) => {
    myS3.listObjectsV2(
        { Bucket: bucketName, Prefix: objectPrefix },
        (err: AWSError, data: S3.Types.ListObjectsOutput) => {
            if (err) return reject(err);
            const index: number = findIndex(data.Contents as S3.ObjectList);

            resolve(index);
        },
    );
});

try {
    (async () => {
        const index: number = await getListOfObjects;
        const formattedIndex: string = formatIndex(index);

        uploadFiles(htmlFiles, 'text/html', formattedIndex);
        uploadFiles(cssFiles, 'text/css', formattedIndex);
        uploadFiles(jsFiles, 'text/js', formattedIndex);
        uploadFiles(cssChunks, 'text/css', formattedIndex);
        uploadFiles(jsChunks, 'text/js', formattedIndex);
    })();
} catch (e) {
    console.log(e);
}

function formatIndex(index: number): string {
    let formattedNumber = index.toString();

    if (index < 10) {
        formattedNumber = '000' + index.toString();
    } else if (index < 100) {
        formattedNumber = '00' + index.toString();
    } else if (index < 1000) {
        formattedNumber = '0' + index.toString();
    }

    return formattedNumber;
}

function findIndex(objects: S3.ObjectList) {
    const index = 0;

    if (objects.length > 0) {
        const objectKeys = objects
            .map((o: S3.Object) => {
                return o.Key;
            })
            .map((path: string | undefined) => {
                if (typeof path === 'string') {
                    const delimitedString: string[] = path.split('/');

                    return delimitedString[0];
                } else {
                    return [];
                }
            })
            .map((path: string | never[]) => {
                if (typeof path === 'string') {
                    return path.split('term_selector')[1];
                }

                return [];
            });

        console.log(objectKeys);

        return index;
    }

    return index;
}

function uploadFiles(customElementFiles: string[], contentType: string, index: string): void {
    const s3Options: S3.ManagedUpload.ManagedUploadOptions = {};

    customElementFiles.map((filePath: string) => {
        const file = fs.createReadStream(uploadFileDirectory + filePath);
        const s3Params: S3.Types.PutObjectRequest = {
            Bucket: bucketName,
            Key: objectPrefix + index + '/' + filePath,
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
