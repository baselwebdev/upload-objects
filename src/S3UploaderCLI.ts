/**
 * @file S3Uploader CLI logic.
 * */

import yargs from 'yargs';
import { S3UploaderOptions } from '../S3Uploader';
import S3Uploader from './S3Uploader';

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

const options: S3UploaderOptions = {
    bucketName: yargs.argv.bucketname as string,
    objectPrefix: yargs.argv.directoryprefix as string,
    indexPath: yargs.argv.entryfile as string,
    uploadFileDirectory: yargs.argv.uploadfilepath as string,
};

const s3 = new S3Uploader(options);

s3.startUpload();
