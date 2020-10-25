/**
 * @file S3 upload logic entry file.
 * */
import S3Object from './object';
import S3Manage from './management';
import S3, { ManagedUpload } from 'aws-sdk/clients/s3';
import { S3UploaderOptions } from './inteface';

export const main = (options: S3UploaderOptions): void => {
    try {
        const object = new S3Object();
        const manage = new S3Manage(options);
        let indexString: string;

        manage.listUploads().then((objects: S3.ObjectList) => {
            const nextIndex = object.getNextIndex(objects, options.objectPrefix);

            indexString = object.indexToString(nextIndex);

            const files = manage.findFiles();

            manage
                .upload(files, indexString)
                .catch((error: string) => {
                    throw Error(error);
                })
                .then((result: ManagedUpload.SendData[]) => {
                    result.map((item) => {
                        console.log('Successfully uploaded files to: ' + item.Location);
                    });
                    manage.printUrl(indexString);
                });
        });
    } catch (e) {
        console.log(e.message);
    }
};
