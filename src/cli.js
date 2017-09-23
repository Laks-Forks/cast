import yargs from 'yargs/yargs';
import {logger} from './utils';
import {doctor} from './processor';

/**
 * CLI Log helper
 */
const log = logger('cli');

/**
 * Examine process args and strip away any shell scruff
 * @return Array containing argv
 */
function args() {
  let args = process.argv

  // Clean initial parameter which is the executable itself.
  if (args[0].indexOf("node") >= 0) {
    args.shift()
  }

  // Clean any executable javascript argument
  if (args[0].indexOf(".js") >= 0) {
    args.shift()
  }

  return args
}

/**
 * Indicate to node process that we wish to stop.
 * Flush stdout and stop the process.
 */
function stop_gracefully(code) {
    process.exitCode = code
}

/*
 * Execute command line switches
 * Will exit process upon completion or failure.
 */
function exec() {
    let executed = false;
    const parser = yargs()
          .usage('$0 <cmd> [args]')
          .command(
              'transform [input] [output]',
              'transform input docs into output destination', {
                  name: {
                      default: 'transform',
                      describe: 'file you wish to extract docs from'
                  }
              }, (argv) => {
                  executed = true;
                  if (!argv.input) {
                      console.error(
                          "\nFile [input] needs to be specified\n")
                  } else {
                      let ret = 1;
                      let process = doctor(argv.input, argv.output)
                          .then((result)=>{
                              if (result) { ret = 0; }
                              stop_gracefully(ret);
                          })
                          .catch((err)=>{
                              log.error(
                                  "The doctor failed to process your input", err);
                              stop_gracefully(1);
                          });

                      return;
                  }
              }).help()

    const parsed = parser.parse(args());
    if (!executed) {
        // Show help screen if nothing else..
        parser.help().parse(["--help"])
    }
}

/**
 * Expose exec api
 */
export {exec};

