import { injectable } from 'inversify';

// Simple logger service available from DI
@injectable()
export class Logger {
  public info(message: string): void {
    console.log(message);
  }
}
