import yargs from 'yargs';
import { cli, options } from './s3/cli';
import { main } from './s3/main';

type Provider = 'aws-s3' | 'azure-storage';
const providers: ReadonlyArray<Provider> = ['aws-s3', 'azure-storage'];

yargs.option('c', {
    alias: 'cloud',
    describe: 'Cloud object storage provider',
    choices: providers,
    demandOption: true,
}).argv;

switch (yargs.argv.cloud) {
    case 'aws-s3':
        cli.argv;
        main(options);
}
