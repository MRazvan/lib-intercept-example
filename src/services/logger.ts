import { injectable } from 'inversify';

@injectable()
export class Logger {
  public info(message: string): void {
    console.log(message);
  }
}
