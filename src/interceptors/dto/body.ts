import { ClassData, PropertyData, PropertyDecoratorFactory } from 'lib-reflect';
export class BodyPropDTO {
  constructor(public name: string) {}
}
export const Body = (name?: string): PropertyDecorator =>
  PropertyDecoratorFactory((cd: ClassData, pd: PropertyData) => {
    pd.tags['Model'] = true;
    pd.attributesData.push(new BodyPropDTO(name ? name : pd.name));
  });
