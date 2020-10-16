/**
 * @file S3Object tests.
 * */

import S3Object from '../src/S3Object';
import { S3UploaderOptions } from '../S3Uploader';

describe('S3Object', () => {
    const objectPrefix = 's3_tester';
    const options: S3UploaderOptions = {
        bucketName: 'test',
        objectPrefix: 's3_tester',
    };

    const s3 = new S3Object(options);

    it('finds the correct index', () => {
        const data = [
            {
                Key: objectPrefix + '_0001/Index.html',
            },
        ];

        expect(s3.getNextIndex(data)).toEqual(2);
    });

    it('finds the correct index when some are index are removed', () => {
        const data = [
            {
                Key: objectPrefix + '_0001/Index.html',
            },
            {
                Key: objectPrefix + '_0004/Index.html',
            },
            {
                Key: objectPrefix + '_0007/Index.html',
            },
        ];

        expect(s3.getNextIndex(data)).toEqual(8);
    });

    it('turns string into numbers', () => {
        expect(s3.indexToNumber('0001')).toEqual(1);
        expect(s3.indexToNumber('0065')).toEqual(65);
        expect(s3.indexToNumber('0123')).toEqual(123);
        expect(s3.indexToNumber('9955')).toEqual(9955);
    });

    it('turns numbers into string', () => {
        expect(s3.indexToString(1)).toEqual('0001');
        expect(s3.indexToString(23)).toEqual('0023');
        expect(s3.indexToString(340)).toEqual('0340');
        expect(s3.indexToString(8866)).toEqual('8866');
    });
});
