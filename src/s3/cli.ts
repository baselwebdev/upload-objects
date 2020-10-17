/**
 * @file S3Object CLI logic.
 * */

import yargs from 'yargs';
import { projectPath } from '../global';
import { S3UploaderOptions } from './inteface';

export const cli = yargs
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
    });

export const options: S3UploaderOptions = {
    bucketName: yargs.argv.bucketname as string,
    objectPrefix: yargs.argv.directoryprefix + '_',
    indexPath: yargs.argv.entryfile as string,
    uploadFileDirectory: yargs.argv.uploadfilepath as string,
};
