import { IAfterActivation, IBeforeActivation, IContext } from 'lib-intercept';
import { ClassData, MethodData, MethodDecoratorFactory } from 'lib-reflect';
import { isNil } from 'lodash';
import { Logger } from '../services/logger';

// Log decorator, this just mark's the method for logging
export const Log = (): MethodDecorator =>
  MethodDecoratorFactory((cd: ClassData, md: MethodData, desc: any) => {
    md.tags['Log'] = true;
  });

// Intercept a method call and check if we should log the call or not
export class LogInterceptor implements IBeforeActivation, IAfterActivation {
  public before(context: IContext): boolean {
    const activation = context.getActivation();
    // The method is not a target for logging, remove the before activation
    //  from the call chain so the second time that method is called we don't execute
    if (isNil(activation.method.tags['Log'])) {
      activation.removeBeforeActivation(this, context);
      return true;
    }
    const line = `BEFORE ${activation.class.name}.${activation.method.name}`;
    const logger = context.getContainer().get<Logger>(Logger);
    logger.info(line);
    return true;
  }

  public after(context: IContext): void | Promise<void> {
    const activation = context.getActivation();
    // The method is not a target for logging, remove the after activation
    //  from the call chain so the second time that method is called we don't execute
    if (isNil(activation.method.tags['Log'])) {
      activation.removeAfterActivation(this, context);
      return;
    }
    let line = `AFTER ${activation.class.name}.${activation.method.name}`;
    const result = context.getResult();
    if (result.isError()) {
      line += ' There was an error handling the method invocation';
    } else {
      line += result.payload instanceof Promise ? ' Result is a Promise' : ' Result is : ' + result.payload;
    }
    const logger = context.getContainer().get<Logger>(Logger);
    logger.info(line);
  }
}
