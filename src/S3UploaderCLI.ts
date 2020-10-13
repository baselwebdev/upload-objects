/**
 * @file S3Object CLI logic.
 * */

import yargs from 'yargs';
import { S3UploaderOptions } from '../S3Uploader';
import S3Object from './S3Object';
import S3Manage from './S3Manage';
import S3, { ManagedUpload } from 'aws-sdk/clients/s3';

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
    const object = new S3Object(options);
    const manage = new S3Manage(options);
    let indexString: string;

    manage.listUploads().then((objects: S3.ObjectList) => {
        const nextIndex = object.getNextIndex(objects);

        indexString = object.indexToString(nextIndex);

        const files = object.findFiles();

        object
            .upload(files, indexString)
            .catch((error: string) => {
                throw Error(error);
            })
            .then((result: ManagedUpload.SendData[]) => {
                result.map((item) => {
                    console.log('Successfully uploaded files to: ' + item.Location);
                });
                object.printUrl(indexString);
            });
    });
} catch (e) {
    console.log(e.message);
}
