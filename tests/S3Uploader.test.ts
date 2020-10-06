/**
 * @file S3Uploader tests.
 * */

import { mocked } from 'ts-jest/utils';
import S3Uploader from '../src/S3Uploader';
import { S3UploaderOptions } from '../S3Uploader';
import { MaybeMocked } from 'ts-jest/dist/utils/testing';
import mock = jest.mock;

jest.mock('../src/S3Uploader');

const options: S3UploaderOptions = {
    bucketName: 'test',
    objectPrefix: 's3_tester',
};

describe('S3Uploader', () => {
    let s3: MaybeMocked<any>;

    beforeEach(() => {
        s3 = mocked(new S3Uploader(options));
        s3.startUpload.mockClear();
    });

    it('should check the constructor has abeen called', () => {
        new S3Uploader(options);
        expect(S3Uploader).toBeCalledTimes(2);
    });
});
