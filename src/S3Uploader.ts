/**
 * @file Upload files to S3.
 * */

import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import glob from 'glob';
import { AWSError } from 'aws-sdk/lib/error';
import { S3UploaderOptions } from '../S3Uploader';
import CloudUploader from './CloudUploader';

class S3Uploader extends CloudUploader {
    private myS3: S3;
    private readonly bucketName: string;
    private readonly globOptions: { cwd: string };
    protected formattedNumber: string;

    constructor(options: S3UploaderOptions) {
        super(options);
        this.myS3 = new S3();
        this.bucketName = options.bucketName;
        this.globOptions = {
            cwd: this.uploadFileDirectory,
        };
        this.formattedNumber = '';
    }

    public startUpload(): void {
        (async () => {
            try {
                await this.getNextIndex().then((index) => {
                    this.indexToString(index);
                    this.printUrl();
                });

                const htmlFiles = glob.sync('**/*.html', this.globOptions);
                const cssFiles = glob.sync('**/*.css', this.globOptions);
                const jsFiles = glob.sync('**/*.js', this.globOptions);
                const jsChunks = glob.sync('**/*.js.map', this.globOptions);
                const cssChunks = glob.sync('**/*.css.map', this.globOptions);

                this.uploadFiles(htmlFiles, 'text/html');
                this.uploadFiles(cssFiles, 'text/css');
                this.uploadFiles(jsFiles, 'text/js');
                this.uploadFiles(cssChunks, 'text/css');
                this.uploadFiles(jsChunks, 'text/js');
            } catch (e) {
                console.log(e.message);
            }
        })();
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

        this.formattedNumber = formattedNumber;
    }

    public printUrl(): void {
        console.log(
            'Url is: ' +
                'https://baselwebdev2.s3.eu-west-2.amazonaws.com/' +
                this.objectPrefix +
                this.formattedNumber +
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
     */
    private uploadFiles(customElementFiles: string[], contentType: string): void {
        const s3Options: S3.ManagedUpload.ManagedUploadOptions = {};

        customElementFiles.map((filePath: string) => {
            const file = fs.createReadStream(this.uploadFileDirectory + filePath);
            const s3Params: S3.Types.PutObjectRequest = {
                Bucket: this.bucketName,
                Key: this.objectPrefix + this.formattedNumber + '/' + filePath,
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

export default S3Uploader;
