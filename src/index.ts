import { spawn } from 'child_process';
import { GenerateOptions } from './types';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export class sshKeygen {
  async generate(options?: GenerateOptions) {
    return this.execute(options);
  }

  private getLocation(location: string,) {
    return !location ? path.join(os.tmpdir(),`id_rsa_${new Date()}`) : location;
  }

  private execute(options: GenerateOptions): Promise<{ key: string, pubKey: string }> {
    if(!options.comment) options.comment = '';
    if(!options.password) options.password = '';
    if(!options.size) options.size = '2048';
    if(!options.format) options.format = 'RFC4716';
    if(!options.type) options.type = 'rsa';
    if(!options.read) options.read = true;
    if(!options.force) options.force = true;
    if(!options.destroy) options.destroy = false;
    let location = this.getLocation(options.location);
    let pubLocation = location+'.pub';

    let keygen = spawn(this.binPath(), [
      '-t', options.type,
      '-b', options.size,
      '-C', options.comment,
      '-N', options.password,
      '-f', location,
      '-m', options.format
    ]);
    
    return new Promise((resolve, reject) => {
      keygen.on('exit', () =>{
        if(options.read){
          fs.readFile(location, 'utf8', function(err: any, key: any){
            if(options.destroy){
              fs.unlink(location, function(err){
                if(err) reject(err);
                readPubKey();
              });
            } else readPubKey();
            function readPubKey(){
              fs.readFile(pubLocation, 'utf8', function(err, pubKey){
                if(options.destroy){
                  fs.unlink(pubLocation, function(err){
                    if(err) return reject(err);
                    key = key.toString();
                    key = key.substring(0, key.lastIndexOf("\n")).trim();
                    pubKey = pubKey.toString();
                    pubKey = pubKey.substring(0, pubKey.lastIndexOf("\n")).trim();
                    return resolve({ key, pubKey });
                  });
                } else {
                  return resolve({ key, pubKey });
                }
              });
            }
          });
        }
      });
    })
  }

  private log(a: unknown){
    // if(process.env.VERBOSE) 
    // console.log(`ssh-keygen: ${a}`);
  }

  private binPath() {
    if(process.platform !== 'win32') return 'ssh-keygen';
  
    switch(process.arch) {
      case 'ia32': return path.join(__dirname, '..', 'bin', 'ssh-keygen-32.exe');
      case 'x64': return path.join(__dirname, '..', 'bin', 'ssh-keygen-64.exe');
    }
  
    throw new Error('Unsupported platform');
  }
}

export default new sshKeygen();
