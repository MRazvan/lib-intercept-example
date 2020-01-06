import { IBeforeActivation } from 'lib-intercept';
import { ClassData, MethodData, ParameterData, ParameterDecoratorFactory } from 'lib-reflect';
import { get, head, isNil } from 'lodash';
import { HttpContext } from 'src/context';

// Simple Body Parameter configuration DTO
class BodyParamData {
  constructor(public path?: string, public defaultVal?: any) {}
}

// The Body attribute to be used on method parameters
export const Body = (path?: string, defaultVal?: any): ParameterDecorator =>
  ParameterDecoratorFactory((cd: ClassData, md: MethodData, pd: ParameterData) => {
    // Optimization so we don't check all the method parameters if we can execute the interceptor
    md.tags['HasBodyParams'] = true;
    pd.attributesData.push(new BodyParamData(path, defaultVal));
  });

/* 
      The body parameter interceptor
      This handles getting the parameter from the body of the request and passing that as an argument to the method
*/
export class BodyParamInterceptor implements IBeforeActivation {
  public before(ctx: HttpContext): boolean {
    // First check to see if this 'activation' has any parameters with the 'body' attribute
    //    The activation contains the method that we need to execute along with the class
    const activation = ctx.getActivation();
    if (isNil(activation.method.tags['HasBodyParams'])) {
      // This method does not have parameters with 'Body' attribute, we can remove this interceptor
      //    from the method's interceptor chain so it will not be called again for this method
      activation.removeBeforeActivation(this, ctx);
      return true;
    }
    // activation.method.parameters.filter(p => !isEmpty(p.getAttributesOfType(BodyParamData)));
    const params = activation.method.parameters;
    // Get the http request
    const req = ctx.getRequest();
    // We have some parameters with 'body' attribute
    // Get the argument values for this method, the execution performed in lib-intercept will create an array of values
    //    for the arguments, initially it will be an array of 'null' values
    const args = ctx.getArguments();
    params.forEach(p => {
      // Get the body data for this parameter, just the first one. we should have only one body decorator per parameter if the attribute
      //    is implemented correctly (check that we don't have duplicates)
      const bodyData = head(p.getAttributesOfType<BodyParamData>(BodyParamData));
      if (!isNil(bodyData)) {
        // Set the argument that corresponds to this parameter
        args[p.idx] = bodyData.path ? get(req.body, bodyData.path, bodyData.defaultVal) : req.body;
      }
    });

    return true;
  }
}
