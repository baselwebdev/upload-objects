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
    let s3: S3Uploader;

    beforeEach(() => {
        s3 = new S3Uploader(options);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('calls constructor once', () => {
        expect(S3Uploader).toBeCalledTimes(1);
    });

    it('returns the correct index value', () => {});
});
