import { IBeforeActivation } from 'lib-intercept';
import { ParameterData, PropertyData, ReflectHelper } from 'lib-reflect';
import { flattenDeep, get, head, isEmpty, isNil } from 'lodash';
import { HttpContext } from '../../context';
import * as b from './body';
import * as h from './header';
import * as p from './param';
import * as q from './query';

// This interceptor creates a class that has it's properties decorated with various attributes to retreive the data
//    from an HTTP request, this will allow us to make use of other functionalities like class-validator or class-sanitizer
export class ModelInterceptor implements IBeforeActivation {
  public before(context: HttpContext): boolean {
    // First check if the method has and parameters that we can construct
    // To do that we need to check all parameters and the type of the parameter to see if it's something we can recognize
    const params = context.getActivation().method.parameters;
    // Method parameters
    const anyWithModel = params.filter((p: ParameterData) => {
      // We don't have a target on the parameter (might be a method / parameter not decorated)
      if (isNil(p.target)) return false;
      // Check to see if we know anything about the target
      const cd = ReflectHelper.getClass(p.target);
      if (isNil(cd)) {
        // It is an object type not known to us (nothing decorated, no method, parameter, property or the class)
        return false;
      }
      // It's valid if it was decorated with the 'Model' decorator
      return cd.tags['Model'] === true;
    });

    // Check to see if we have any parameter that we can handle
    if (isEmpty(anyWithModel)) {
      // This method does not take any parameter that we can handle, so remove the interceptor from the call chain
      context.getActivation().removeBeforeActivation(this, context);
      // Continue the execution
      return true;
    }
    const req = context.getRequest();
    const args = context.getArguments();
    // We have a list of parameters that we can handle, start processing in turn, we could do this a bit better, since it's an example
    //    fast and dirty
    anyWithModel.forEach((paramData: ParameterData) => {
      // We could have a parent that has some properties, so get all the parents also
      const cd = ReflectHelper.getClassWithParentsIncluded(paramData.target);
      // Create the object
      const instance: any = Reflect.construct(paramData.target, []);
      // Merge all properties from all classes and get only the properties that we can handle
      const props = flattenDeep(cd.map(c => c.properties)).filter(p => p.tags['Model'] === true);
      props.forEach((propData: PropertyData) => {
        // We could do a lot better by having a base DTO class, getting that and checking the instance type
        const header = head(propData.getAttributesOfType<h.HeaderPropDTO>(h.HeaderPropDTO));
        if (!isNil(header)) {
          instance[propData.name] = req.header(header.name);
          return;
        }
        const body = head(propData.getAttributesOfType<b.BodyPropDTO>(b.BodyPropDTO));
        if (!isNil(body)) {
          instance[propData.name] = get(req.body, body.name);
          return;
        }
        const param = head(propData.getAttributesOfType<p.ParamPropDTO>(p.ParamPropDTO));
        if (!isNil(param)) {
          instance[propData.name] = req.param(param.name);
          return;
        }
        const query = head(propData.getAttributesOfType<q.QueryPropDTO>(q.QueryPropDTO));
        if (!isNil(query)) {
          instance[propData.name] = req.param(query.name);
        }
      });

      args[paramData.idx] = instance;
    });

    return true;
  }
}
