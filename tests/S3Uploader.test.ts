/**
 * @file S3Uploader tests.
 * */

import S3Uploader from '../src/S3Uploader';
import S3 from 'aws-sdk/clients/s3';
import { S3UploaderOptions } from '../S3Uploader';
import { mocked } from 'ts-jest/utils';

jest.mock('../src/S3Uploader');

const mockListObjectsV2 = jest.fn(() => {
    return true;
});

jest.mock(
    'aws-sdk/clients/s3',
    jest.fn(() => {
        return jest.fn().mockImplementation(() => {
            return {
                listObjectsV2: mockListObjectsV2,
            };
        });
    }),
);

const options: S3UploaderOptions = {
    bucketName: 'test',
    objectPrefix: 's3_tester',
};

describe('S3Uploader', () => {
    const mockedS3 = mocked(new S3());
    let s3: S3Uploader;

    beforeEach(() => {
        s3 = new S3Uploader(options);
        mockedS3.listObjectsV2.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('calls constructor once', () => {
        expect(S3Uploader).toBeCalledTimes(1);
    });

    it('returns the correct index value', () => {
        expect(mockedS3.listObjectsV2()).toEqual(true);
    });
});
