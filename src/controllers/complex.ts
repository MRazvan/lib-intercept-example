import { inject } from 'inversify';
import { IContext, UseBefore } from 'lib-intercept';
import { head } from 'lodash';
import { Api } from '../attributes/api';
import { Controller } from '../attributes/controller';
import { Body } from '../interceptors/body';
import * as Models from '../interceptors/dto';
import { Log } from '../interceptors/log';
import { Logger } from '../services/logger';

@Models.Model()
class BaseDTO {
  @Models.Header('X-ID')
  public requestId: string;
}

@Models.Model()
class UpdateUser extends BaseDTO {
  // Class validator - need an interceptor to call validate on the method arguments and check if they are valid
  // @IsString()
  // Class sanitizer - need an interceptor to call sanitize on the method arguments
  // @ToInt()
  @Models.Query('ln')
  public language: string;
  @Models.Param('id')
  public userId: string;
  @Models.Body()
  public username: string;
  @Models.Body()
  public password: string;
}

@Controller()
export class ComplexController {
  @inject(Logger)
  private readonly _log: Logger;

  // To call this and use all functionality
  // POST on
  //    /complex/MyUserId & ln=en -> it will set the param as 'MyUserId' and the query ln as 'en'
  // header X-ID = SomeRequestId
  // body : { username: 'name', password: 'pass' }
  //  This request will produce the following object as argument for the method:
  /*
   {
      "language":"en",
      "userId":"MyUserId",
      "username":"name",
      "password":"pass",
      "requestId":"SomeRequestId"
   }
   */
  @Api('POST', '/:id')
  // Just a fast and dirty example on validation
  @UseBefore({
    before: (ctx: IContext) => {
      // validate(ctx.getArguments())
      // if not valid return false
      // Get the first argument
      const first: UpdateUser = head(ctx.getArguments());
      if (first.username === 'test') {
        // We can throw from interceptors, the parent that called us will set the error on the result
        throw new Error('Invalid username');
        // ctx.getResult().setError('Invalid username');
        // return false;
      }
      return true;
    }
  })
  // Log the method invocation
  @Log()
  public updateUser(
    // The ModelInterceptor will take care of creating an UpdateUser instance and populating the properties with
    //     information from the request
    user: UpdateUser,
    // This is the simple body decorator for a parameter, this will continue to work
    @Body('username') username: string
  ): boolean {
    this._log.info('User model :  ' + JSON.stringify(user) + '  - UserName:  ' + username);
    return true;
  }
}
