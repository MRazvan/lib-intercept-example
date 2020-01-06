import * as express from 'express';
import { Container } from 'inversify';
import { ActivationsGenerator, IActivation, IAfterActivation, IBeforeActivation } from 'lib-intercept';
import { head, isNil, trim, trimEnd } from 'lodash';
import { ApiData } from './attributes/api';
import { ControllerData } from './attributes/controller';
import { HttpContext } from './context';

// Method for wrapping an activation inside an express handler
function generateHandler(container: Container, activation: IActivation): any {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Create a new execution context
    const context = new HttpContext(container, activation, req, res);
    // Execute the activation
    //    This will call each interceptor in turn, execute the method and return the result
    //    The execution of the activation will never throw, instead the result object will
    //      have an error set on it.
    // activation.execute(context, (i: IBeforeActivation | IAfterActivation, err: any) => {}).then.....
    context.execute().then(() => {
      // Get the result of the execution
      const result = context.getResult();
      // The result can be anything, it depends on the implementation what it returns
      //    in our case we are using only a simple data type or a promise.
      // If the api needs to return something else it can do so, however the code must check the return type and
      //    handle that specifically. For example returning a stream, or an Observable or anything else
      if (result.isError()) {
        next(result.error);
      } else {
        const payload = result.payload;
        if (payload instanceof Promise) {
          // Even if the execution of the activation does not throw, it does not mean the
          //    result from the target method does not throw. So we need to handle that
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

    // Generate all activations from the registered 'Controllers' and Interceptors
    const activations = this.generator.generateActivations(this.container);
    // For each activation first check if it's a controller and if it has an 'API'
    activations.forEach(activation => {
      // Check if we have a controller decorator on the class
      const controller = head(activation.class.getAttributesOfType<ControllerData>(ControllerData));
      if (isNil(controller)) {
        return;
      }
      // Check if we have an api decorator on the method
      //    we could also skip this step and apply a convention based api
      //  for example :
      //  - method starts with an '_' it's a private method. Skip don't expose
      //  - method starts with a 'get' it's a GET http method the route can be the remainder (getUser) -> GET '/user'
      //  - method starts with a 'post' it's a POSST http method the route can be the remainder (postUser) -> POST '/user'
      //  ..........
      const api = head(activation.method.getAttributesOfType<ApiData>(ApiData));
      if (isNil(api)) {
        return;
      }
      // Calculate the full route path
      const routePath = trimEnd(`/${trim(controller.path, '/\\')}/${trim(api.path, '/\\')}`, '/\\');
      console.log(
        `METHOD : ${api.method}    PATH : ${routePath}    TARGET: ${activation.class.name}.${activation.method.name}`
      );
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
        case 'PUT': {
          router.put(routePath, generateHandler(this.container, activation));
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
