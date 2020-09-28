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

interface S3UploaderOptions {
    bucketName: string;
    objectPrefix: string;
    indexPath: string;
    uploadFileDirectory: string;
}

const options: S3UploaderOptions = {
    bucketName: yargs.argv.bucketname as string,
    objectPrefix: yargs.argv.directoryprefix as string,
    indexPath: yargs.argv.entryfile as string,
    uploadFileDirectory: yargs.argv.uploadfilepath as string,
};

class S3Uploader {
    private myS3: S3;
    private readonly bucketName: string;
    private readonly objectPrefix: string;
    private readonly indexPath: string;
    private readonly uploadFileDirectory: string;
    private readonly globOptions: { cwd: string };

    constructor(options: S3UploaderOptions) {
        this.myS3 = new S3();
        this.bucketName = options.bucketName;
        this.objectPrefix = options.objectPrefix + '_';
        this.indexPath = '/' + options.indexPath;
        this.uploadFileDirectory = options.uploadFileDirectory;
        this.globOptions = {
            cwd: this.uploadFileDirectory,
        };
    }

    private getNextIndex: Promise<number> = new Promise((resolve, reject) => {
        this.myS3.listObjectsV2(
            { Bucket: this.bucketName, Prefix: this.objectPrefix },
            (err: AWSError, data: S3.Types.ListObjectsOutput) => {
                if (err) {
                    return reject(err);
                }
                const index: number = this.findIndex(data.Contents as S3.ObjectList) as number;

                return resolve(index + 1);
            },
        );
    });

    main(): void {
        (async () => {
            try {
                const index: number = await this.getNextIndex;
                const formattedIndex: string = S3Uploader.formatIndex(index);

                const htmlFiles = glob.sync('**/*.html', this.globOptions);
                const cssFiles = glob.sync('**/*.css', this.globOptions);
                const jsFiles = glob.sync('**/*.js', this.globOptions);
                const jsChunks = glob.sync('**/*.js.map', this.globOptions);
                const cssChunks = glob.sync('**/*.css.map', this.globOptions);

                this.uploadFiles(htmlFiles, 'text/html', formattedIndex);
                this.uploadFiles(cssFiles, 'text/css', formattedIndex);
                this.uploadFiles(jsFiles, 'text/js', formattedIndex);
                this.uploadFiles(cssChunks, 'text/css', formattedIndex);
                this.uploadFiles(jsChunks, 'text/js', formattedIndex);

                console.log(
                    'Url is: ' +
                        'https://baselwebdev2.s3.eu-west-2.amazonaws.com/' +
                        this.objectPrefix +
                        formattedIndex +
                        this.indexPath,
                );
            } catch (e) {
                console.log(e.message);
            }
        })();
    }

    /**
     * @param index - The index number.
     * @returns Transformed number index into string value in format of of '0000.
     */
    private static formatIndex(index: number): string {
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
    private static processFormattedNumber(index: string): number {
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
    private findIndex(objects: S3.ObjectList): number {
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
                    return path.split(this.objectPrefix)[1];
                })
                // Return only the unique numbers
                .filter((value, index, self) => {
                    return self.indexOf(value) === index;
                })
                // Turn the strings into numbers
                .map((index: string) => {
                    return S3Uploader.processFormattedNumber(index);
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
    private uploadFiles(customElementFiles: string[], contentType: string, index: string): void {
        const s3Options: S3.ManagedUpload.ManagedUploadOptions = {};

        customElementFiles.map((filePath: string) => {
            const file = fs.createReadStream(this.uploadFileDirectory + filePath);
            const s3Params: S3.Types.PutObjectRequest = {
                Bucket: this.bucketName,
                Key: this.objectPrefix + index + '/' + filePath,
                Body: file,
                ContentType: contentType,
                ACL: 'public-read',
            };

            this.myS3.upload(s3Params, s3Options, (error: Error, data: S3.ManagedUpload.SendData) => {
                if (error) {
                    console.log('Error', error);
                } else {
                    console.log('Successfully uploaded file to: ' + data.Location);
                }
            });
        });
    }
}

const hello = new S3Uploader(options);

hello.main();

// export default S3Uploader;
