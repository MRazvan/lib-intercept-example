import { inject } from 'inversify';
import { Api } from '../attributes/api';
import { Controller } from '../attributes/controller';
import { Body } from '../interceptors/body';
import { Log } from '../interceptors/log';
import { Logger } from '../services/logger';

@Controller()
export class Hello {
  // Inject the logger service from DI
  @inject(Logger)
  private readonly _log: Logger;

  // Set this method as an API, since we don't set a path
  //    the path will be the method name '/index'
  @Api('GET')
  // Log the execution of this method
  //    The attribute will mark this method for logging, the Log interceptor will handle the actual logging part
  //    That interceptor is invoked on all controllers / methods since it it set on the server level however it will
  //      check if the target method is marked for logging using the attribute, if not it will remove itself from the call chain
  @Log()
  public index(): string {
    return 'Hello World';
  }

  // Set this method as an api with a different route name '/test'
  @Api('POST', 'test')
  public sayHello(
    // Add a parameter taken from the body of the post, if that body field name is not found return a default value
    @Body('name', 'Unknown') name: string
  ): Promise<string> {
    // Use the injected service
    this._log.info('In POST test');
    // Return a promise (resolved) so we can see how we can handle promises
    return Promise.resolve(`Hello ${name}`);
  }
}
