/**
 * @file Upload files to S3.
 * */

import S3 from 'aws-sdk/clients/s3';

export default class S3Object {
    /**
     * @param index - The index number which will be transformed into a string in a format of '0000'.
     */
    public indexToString(index: number): string {
        let formattedNumber = index.toString();

        if (index < 10) {
            formattedNumber = '000' + index.toString();
        } else if (index < 100) {
            formattedNumber = '00' + index.toString();
        } else if (index < 1000) {
            formattedNumber = '0' + index.toString();
        }

        return formattedNumber;
    }

    /**
     * @param index - The index number.
     * @returns Transformed number index into number type value.
     */
    public indexToNumber(index: string): number {
        const brokenIndexDigits = index.split('');
        const brokenIndexDigitsCount = brokenIndexDigits.length;

        for (let i = 0; i < brokenIndexDigitsCount; i++) {
            if (brokenIndexDigits[i] !== '0') {
                break;
            }
            brokenIndexDigits.splice(i, 1);
        }

        if (brokenIndexDigits.length === 0) {
            brokenIndexDigits.push('0');
        }

        return parseInt(brokenIndexDigits.join(''));
    }

    /**
     * @param objects - The aws S3 object list items.
     * @param objectPrefix - The prefix that is attached to object. Required to split the prefix from the index.
     * @returns Return the index value for the latest object in the S3 object list for the given prefix.
     */
    public getNextIndex(objects: S3.ObjectList, objectPrefix: string): number {
        let index = 0;

        if (objects.length > 0) {
            const objectIndex = objects
                // Return all the key values
                // todo: lose the ambiguity of a chance that key might be undefined.
                .map((o: S3.Object) => {
                    if (o.Key !== undefined) {
                        return o.Key;
                    } else {
                        throw Error('Failed getting the key for getNextIndex().');
                    }
                })
                // Split the strings by / which indicates the url pattern.
                // Return the first part of the url pattern which contains the index numbers.
                .map((path: string) => {
                    return path.split('/')[0];
                })
                // Split the url pattern using the prefix
                .map((path: string) => {
                    return path.split(objectPrefix)[1];
                })
                // Return only the unique numbers
                .filter((value, index, self) => {
                    return self.indexOf(value) === index;
                })
                // Turn the strings into numbers
                .map((index: string) => {
                    return this.indexToNumber(index);
                })
                // Sort the number by the highest numbers
                .sort((a: number, b: number) => b - a);

            index = objectIndex[0];
            index += 1;
        }

        return index;
    }
}
