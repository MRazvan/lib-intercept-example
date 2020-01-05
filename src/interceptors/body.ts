import { IBeforeActivation } from "lib-intercept";
import { ClassData, MethodData, ParameterData, ParameterDecoratorFactory } from "lib-reflect";
import { get, head, isNil } from "lodash";
import { HttpContext } from "src/context";

class BodyParamData {
   constructor(public path?: string, public defaultVal?: any){}
}

export const Body = (path?: string, defaultVal? : any): ParameterDecorator =>
   ParameterDecoratorFactory((cd: ClassData, md: MethodData, pd: ParameterData) => {
      md.tags['HasBodyParams'] = true;
      pd.attributesData.push(new BodyParamData(path, defaultVal));
   });

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
      const params = activation.method.parameters; //activation.method.parameters.filter(p => !isEmpty(p.getAttributesOfType(BodyParamData)));
      const req = ctx.getRequest();
      // We have some parameters with 'body' attribute
      // Get the argument values for this method, the execution performed in lib-intercept will create an array of values
      //    for the arguments, initially it will be an array of 'null' values
      const args = ctx.getArguments();
      params.forEach(p => {
         // Get the body data for this parameter, just the first one. we should have only one if the attribute 
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