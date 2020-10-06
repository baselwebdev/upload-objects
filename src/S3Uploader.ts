/**
 * @file Upload files to S3.
 * */

import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import glob from 'glob';
import { AWSError } from 'aws-sdk/lib/error';
import { S3UploaderOptions } from '../S3Uploader';
import CloudUploader from './CloudUploader';
import { ManagedUpload } from 'aws-sdk/clients/s3';

class S3Uploader extends CloudUploader {
    private myS3: S3;
    private readonly bucketName: string;
    private readonly globOptions: { cwd: string };
    protected index: string;
    protected uploads: ManagedUpload.SendData[];

    constructor(options: S3UploaderOptions) {
        super(options);
        this.myS3 = new S3();
        this.bucketName = options.bucketName;
        this.uploads = [];
        this.globOptions = {
            cwd: this.uploadFileDirectory,
        };
        this.index = '';
    }

    public startUpload(): Promise<boolean> {
        return (async () => {
            try {
                await this.getNextIndex().then((index) => {
                    this.indexToString(index);
                });

                const files = this.findFiles();

                await this.upload(files)
                    .catch((error) => {
                        throw Error(error);
                    })
                    .then((result: ManagedUpload.SendData[]) => {
                        this.uploads = result;
                    });

                return true;
            } catch (e) {
                console.log(e.message);

                return false;
            }
        })();
    }

    public printUploadResults(): void {
        this.uploads.map((item) => {
            console.log('Successfully uploaded files to: ' + item.Location);
        });
    }

    private getNextIndex: () => Promise<number> = () => {
        return new Promise((resolve, reject) => {
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
    };

    /**
     * @param index - The index number which will be transformed into a string in a format of '0000'.
     */
    protected indexToString(index: number): void {
        let formattedNumber = index.toString();

        if (index < 10) {
            formattedNumber = '000' + index.toString();
        } else if (index < 100) {
            formattedNumber = '00' + index.toString();
        } else if (index < 1000) {
            formattedNumber = '0' + index.toString();
        }

        this.index = formattedNumber;
    }

    public printUrl(): void {
        console.log(
            'Entry url is: ' +
                'https://baselwebdev2.s3.eu-west-2.amazonaws.com/' +
                this.objectPrefix +
                this.index +
                this.indexPath,
        );
    }

    /**
     * @param index - The index number.
     * @returns Transformed number index into number type value.
     */
    private static indexToNumber(index: string): number {
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
                // Split the url pattern using the prefix
                .map((path: string) => {
                    return path.split(this.objectPrefix)[1];
                })
                // Return only the unique numbers
                .filter((value, index, self) => {
                    return self.indexOf(value) === index;
                })
                // Turn the strings into numbers
                .map((index: string) => {
                    return S3Uploader.indexToNumber(index);
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
     * @returns Promise<ManagedUpload.SendData>[] - A collection of upload promises.
     */
    private collectUploadFiles(customElementFiles: string[], contentType: string): Promise<ManagedUpload.SendData>[] {
        const s3Options: S3.ManagedUpload.ManagedUploadOptions = {};

        const uploads: Promise<ManagedUpload.SendData>[] = [];

        customElementFiles.map((filePath: string) => {
            const file = fs.createReadStream(this.uploadFileDirectory + filePath);
            const s3Params: S3.Types.PutObjectRequest = {
                Bucket: this.bucketName,
                Key: this.objectPrefix + this.index + '/' + filePath,
                Body: file,
                ContentType: contentType,
                ACL: 'public-read',
            };

            uploads.push(this.myS3.upload(s3Params, s3Options).promise());
        });

        return uploads;
    }

    private findFiles(): string[][] {
        const htmlFiles = glob.sync('**/*.html', this.globOptions);
        const cssFiles = glob.sync('**/*.css', this.globOptions);
        const jsFiles = glob.sync('**/*.js', this.globOptions);
        const jsChunks = glob.sync('**/*.js.map', this.globOptions);
        const cssChunks = glob.sync('**/*.css.map', this.globOptions);

        return [htmlFiles, cssFiles, jsFiles, jsChunks, cssChunks];
    }

    private async upload(files: string[][]): Promise<any> {
        const results1 = this.collectUploadFiles(files[0], 'text/html');
        const results2 = this.collectUploadFiles(files[1], 'text/css');
        const results3 = this.collectUploadFiles(files[2], 'text/js');
        const results4 = this.collectUploadFiles(files[3], 'text/css');
        const results5 = this.collectUploadFiles(files[4], 'text/js');

        return Promise.all(results1.concat(results2, results3, results4, results5));
    }
}

export default S3Uploader;
