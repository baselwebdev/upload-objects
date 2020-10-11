/**
 * @file S3Uploader CLI logic.
 * */

import yargs from 'yargs';
import { S3UploaderOptions } from '../S3Uploader';
import S3Uploader from './S3Uploader';
import { ManagedUpload } from 'aws-sdk/clients/s3';

const projectPath = __dirname + '/../';

yargs
    .option('b', {
        alias: 'bucketname',
        describe: 'The AWS bucketname',
        type: 'string',
        demandOption: true,
    })
    .option('d', {
        alias: 'directoryprefix',
        describe: 'The prefix for the directory',
        type: 'string',
        demandOption: true,
    })
    .option('e', {
        alias: 'entryfile',
        describe: 'The entry point file',
        type: 'string',
        default: 'Index.html',
    })
    .option('u', {
        alias: 'uploadfilepath',
        describe: 'The path to files you want to upload to S3',
        type: 'string',
        default: projectPath + 'uploads/files/',
    }).argv;

const options: S3UploaderOptions = {
    bucketName: yargs.argv.bucketname as string,
    objectPrefix: yargs.argv.directoryprefix as string,
    indexPath: yargs.argv.entryfile as string,
    uploadFileDirectory: yargs.argv.uploadfilepath as string,
};

try {
    const s3 = new S3Uploader(options);
    let indexString: string;

    s3.getNextIndex().then((index) => {
        indexString = s3.indexToString(index);

        const files = s3.findFiles();

        s3.upload(files, indexString)
            .catch((error) => {
                throw Error(error);
            })
            .then((result: ManagedUpload.SendData[]) => {
                result.map((item) => {
                    console.log('Successfully uploaded files to: ' + item.Location);
                });
                s3.printUrl(indexString);
            });
    });
} catch (e) {
    console.log(e.message);
}
