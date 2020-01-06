import { ClassData, ClassDecoratorFactory } from 'lib-reflect';

// Simple DTO for storing Controller data
export class ControllerData {
  constructor(public path: string) {}
}

// The controller decorator
//    it takes an optional route parameter
export const Controller = (path?: string): ClassDecorator =>
  ClassDecoratorFactory((cd: ClassData) => {
    let ctrlPath = (path ? path : cd.name).toLowerCase();
    /* 
        We can use conventions for controllers if the class is HomeController the route will be '/home'

        The convention is not enforced so we can have HomeCtrl and the route will be '/homectrl'
        If we need to enforce the convention we can throw an error in case the name of the controller
        does not match what we want
    */
    if (ctrlPath.indexOf('controller') > 0) {
      ctrlPath = ctrlPath.substr(0, ctrlPath.indexOf('controller'));
    }
    cd.attributeData.push(new ControllerData(ctrlPath));
  });
