import { inject } from 'inversify';
import { Api } from '../attributes/api';
import { Controller } from '../attributes/controller';
import { Body } from '../interceptors/body';
import { Log } from '../interceptors/log';
import { Logger } from '../services/logger';

@Controller()
export class Hello {
  @inject(Logger)
  private readonly _log: Logger;

  @Api('GET')
  @Log()
  public index(): string {
    return 'Hello World';
  }

  @Api('POST', 'test')
  public sayHello(@Body('name', 'Unknown') name: string): Promise<string> {
    this._log.info('In POST test');
    return Promise.resolve(`Hello ${name}`);
  }
}
