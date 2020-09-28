/**
 * @file Upload files to S3.
 *
 * */
import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import glob from 'glob';
import { AWSError } from 'aws-sdk/lib/error';
import yargs from 'yargs';

const projectPath = __dirname + '/../';

yargs
    .option('bn', {
        alias: 'bucketname',
        describe: 'The AWS bucketname',
        type: 'string',
        demandOption: true,
    })
    .option('dpf', {
        alias: 'directoryprefix',
        describe: 'The prefix for the directory',
        type: 'string',
        demandOption: true,
    })
    .option('ifp', {
        alias: 'entryfile',
        describe: 'The entry point file',
        type: 'string',
        default: 'Index.html',
    })
    .option('ufp', {
        alias: 'uploadfilepath',
        describe: 'The path to files you want to upload to S3',
        type: 'string',
        default: projectPath + 'uploads/files/',
    }).argv;

const myS3 = new S3();
const bucketName = yargs.argv.bucketname as string;
const objectPrefix = (yargs.argv.directoryprefix as string) + '_';
const indexPath = '/' + yargs.argv.entryfile;

const uploadFileDirectory = yargs.argv.uploadfilepath as string;
const globOptions = {
    cwd: uploadFileDirectory,
};
const htmlFiles = glob.sync('**/*.html', globOptions);
const cssFiles = glob.sync('**/*.css', globOptions);
const jsFiles = glob.sync('**/*.js', globOptions);
const jsChunks = glob.sync('**/*.js.map', globOptions);
const cssChunks = glob.sync('**/*.css.map', globOptions);

const getNextIndex: Promise<number> = new Promise((resolve, reject) => {
    myS3.listObjectsV2(
        { Bucket: bucketName, Prefix: objectPrefix },
        (err: AWSError, data: S3.Types.ListObjectsOutput) => {
            if (err) {
                return reject(err);
            }
            const index: number = findIndex(data.Contents as S3.ObjectList) as number;

            return resolve(index + 1);
        },
    );
});

(async () => {
    try {
        const index: number = await getNextIndex;
        const formattedIndex: string = formatIndex(index);

        uploadFiles(htmlFiles, 'text/html', formattedIndex);
        uploadFiles(cssFiles, 'text/css', formattedIndex);
        uploadFiles(jsFiles, 'text/js', formattedIndex);
        uploadFiles(cssChunks, 'text/css', formattedIndex);
        uploadFiles(jsChunks, 'text/js', formattedIndex);

        console.log(
            'Url is: ' + 'https://baselwebdev2.s3.eu-west-2.amazonaws.com/' + objectPrefix + formattedIndex + indexPath,
        );
    } catch (e) {
        console.log(e.message);
    }
})();

/**
 * @param index - The index number.
 * @returns Transformed number index into string value in format of of '0000.
 */
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

/**
 * @param index - The index number.
 * @returns Transformed number index into number type value.
 */
function processFormattedNumber(index: string): number {
    const brokenIndexDigits = index.split('');
    const brokenIndexDigitsCount = brokenIndexDigits.length;

    for (let i = 0; i < brokenIndexDigitsCount; i++) {
        if (brokenIndexDigits[i] !== '0') {
            break;
        }
        brokenIndexDigits.splice(i, 1);
    }

    if (brokenIndexDigits.length === 0) {
        brokenIndexDigits.push('0');
    }

    return parseInt(brokenIndexDigits.join(''));
}

/**
 * @param objects - The aws S3 object list items.
 * @returns Return the index value for the latest object in the S3 object list for the given prefix.
 */
function findIndex(objects: S3.ObjectList): number {
    let index = 0;

    if (objects.length > 0) {
        const objectIndex = objects
            // Return all the key values
            // todo: lose the ambiguity of a chance that key might be undefined.
            .map((o: S3.Object) => {
                if (o.Key !== undefined) {
                    return o.Key;
                } else {
                    return '';
                }
            })
            // Split the strings by / which indicates the url pattern.
            // Return the first part of the url pattern which contains the index numbers.
            .map((path: string) => {
                const delimitedString: string[] = path.split('/');

                return delimitedString[0];
            })
            // Split the url pattern by the string of th
            .map((path: string) => {
                return path.split(objectPrefix)[1];
            })
            // Return only the unique numbers
            .filter((value, index, self) => {
                return self.indexOf(value) === index;
            })
            // Turn the strings into numbers
            .map((index: string) => {
                return processFormattedNumber(index);
            })
            // Sort the number by the highest numbers
            .sort((a: number, b: number) => b - a);

        index = objectIndex[0];
    }

    return index;
}

/**
 * @param customElementFiles - The files to be uploaded to S3.
 * @param contentType - The type of files to be uploaded to S3.
 * @param index - The index value attached to directory name that the uploaded files will be part of.
 */
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
                console.log('Successfully uploaded file to: ' + data.Location);
            }
        });
    });
}
