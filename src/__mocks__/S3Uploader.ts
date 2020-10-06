/**
 * @file Mock file for S3Uploader.
 * */

export const mockStartUpload = jest.fn();
export const mockGetNextIndex = jest.fn();
const mock = jest.fn().mockImplementation(() => {
    return { startUpload: mockStartUpload, getNextIndex: mockGetNextIndex };
});

export default mock;
