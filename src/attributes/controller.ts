import { ClassData, ClassDecoratorFactory } from 'lib-reflect';

export class ControllerData {
  constructor(public path: string) {}
}
export const Controller = (path?: string): ClassDecorator =>
  ClassDecoratorFactory((cd: ClassData) => {
    cd.attributeData.push(new ControllerData(path ? path : cd.name));
  });
