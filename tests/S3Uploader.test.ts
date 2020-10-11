/**
 * @file S3Uploader tests.
 * */

import S3Uploader from '../src/S3Uploader';
import { S3UploaderOptions } from '../S3Uploader';

jest.mock('../src/S3Uploader');

const options: S3UploaderOptions = {
    bucketName: 'test',
    objectPrefix: 's3_tester',
};

describe('S3Uploader', () => {
    it('calls constructor once', () => {
        new S3Uploader(options);
        expect(S3Uploader).toBeCalledTimes(1);
    });
});
