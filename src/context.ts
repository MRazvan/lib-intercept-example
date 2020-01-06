import * as express from 'express';
import { Container } from 'inversify';
import { DefaultContext, IActivation } from 'lib-intercept';

// Since we are executing in an HTTP context we can create a context to represent that
//    and have the request and response available in our context
export class HttpContext extends DefaultContext {
  constructor(
    container: Container,
    activation: IActivation,
    private readonly _req: express.Request,
    private readonly _res: express.Response
  ) {
    super(container, activation);
  }

  public getRequest(): express.Request {
    return this._req;
  }

  public getResponse(): express.Response {
    return this._res;
  }
}
