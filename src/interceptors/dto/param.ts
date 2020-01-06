import { ClassData, PropertyData, PropertyDecoratorFactory } from 'lib-reflect';

export class ParamPropDTO {
  constructor(public name: string) {}
}
export const Param = (name?: string): PropertyDecorator =>
  PropertyDecoratorFactory((cd: ClassData, pd: PropertyData) => {
    pd.tags['Model'] = true;
    pd.attributesData.push(new ParamPropDTO(name ? name : pd.name));
  });
