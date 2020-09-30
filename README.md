# upload-objects

Upload objects to cloud object hosting solutions like AWS S3. 

It will upload them incrementally with the provided prefix to the hosting solution.

These object will be publicly available

Planning to add the support to extend the base uploading capabilities. 

## TODO

- [ ] Add tests

- [ ] Add the ability to extend

- [ ] Improve documentation

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save upload-objects
```

## Usage

Programmatically uploading the objects.

```js
import S3Uploader from 'S3Uploader';

const options: S3UploaderOptions = {
    bucketName: bucketname,
    objectPrefix: directoryprefix,
    uploadFileDirectory: uploadfilepath,
};

const s3 = new S3Uploader(options);

s3.startUpload();
```

Using the CLI

```sh
$ node src/s3_filer_uploader.js --bucketname= --directoryprefix= --entryfile=
```

## About

### Contributing

Pull requests are always welcome. 

For bugs and feature requests, [please create an issue](../../issues/new).

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. 

You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Basel Ahmed**

* [github/baselwebdev](https://github.com/baselwebdev)
* [twitter/baselwebdev](https://twitter.com/baselwebdev)

### License

Copyright © 2020, [Basel Ahmed](https://github.com/baselwebdev).
Released under the [MIT License](LICENSE).
