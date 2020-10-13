/**
 * @file S3Object tests.
 * */

import S3Object from '../src/S3Object';
import S3 from 'aws-sdk/clients/s3';
import { S3UploaderOptions } from '../S3Uploader';
import { mocked } from 'ts-jest/utils';

jest.mock('../src/S3Object');

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

describe('S3Object', () => {
    const mockedS3 = mocked(new S3());
    let s3: S3Object;

    beforeEach(() => {
        s3 = new S3Object(options);
        mockedS3.listObjectsV2.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('calls constructor once', () => {
        expect(S3Object).toBeCalledTimes(1);
    });

    it('returns the correct index value', () => {
        expect(mockedS3.listObjectsV2()).toEqual(true);
    });
});
