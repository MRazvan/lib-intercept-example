import * as express from 'express';
import { Container } from 'inversify';
import { ActivationsGenerator, IActivation, IAfterActivation, IBeforeActivation } from 'lib-intercept';
import { head, isNil, trim } from 'lodash';
import { ApiData } from './attributes/api';
import { ControllerData } from './attributes/controller';
import { HttpContext } from './context';

function generateHandler(container: Container, activation: IActivation): any {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Create a new execution context
    const context = new HttpContext(container, activation, req, res);
    // Execute the activation
    //    This will call each interceptor in turn, execute the method and return the result
    context.execute().then(() => {
      // Return the result
      const result = context.getResult();
      if (result.isError()) {
        next(result.error);
      } else {
        const payload = result.payload;
        if (payload instanceof Promise) {
          payload
            .then(val => {
              res.send(val);
              next();
            })
            .catch(err => {
              next(err);
            });
        } else {
          res.send(result.payload);
          // We processed the result, let express continue
          next();
        }
      }
    });
  };
}

export class Server {
  public container: Container = new Container();
  public generator = new ActivationsGenerator();

  public registerController(target: Function): Server {
    this.generator.register(target);
    return this;
  }

  public addActivations(interceptor: Function | IAfterActivation | IBeforeActivation): Server {
    this.generator.addActivations(interceptor);
    return this;
  }

  public registerService(target: any): Server {
    this.container.bind(target).toSelf();
    return this;
  }

  public registerInExpress(app: express.Application): void {
    const router = express.Router();

    const activations = this.generator.generateActivations(this.container);
    activations.forEach(activation => {
      const controller = head(activation.class.getAttributesOfType<ControllerData>(ControllerData));
      if (isNil(controller)) {
        return;
      }
      const api = head(activation.method.getAttributesOfType<ApiData>(ApiData));
      if (isNil(api)) {
        return;
      }
      const routePath = `/${trim(controller.path, '/\\')}/${trim(api.path, '/\\')}`;
      console.log(`METHOD : ${api.method}    PATH : ${routePath}`);
      // We are using typescript so we can't use directly app[api.method](....);
      switch (api.method) {
        case 'GET': {
          router.get(routePath, generateHandler(this.container, activation));
          break;
        }
        case 'POST': {
          router.post(routePath, generateHandler(this.container, activation));
          break;
        }
        default: {
          break;
        }
      }
    });
    app.use(router);
  }
}
