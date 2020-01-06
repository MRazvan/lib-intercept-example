import { ClassData, PropertyData, PropertyDecoratorFactory } from 'lib-reflect';
export class HeaderPropDTO {
  constructor(public name: string) {}
}

export const Header = (name?: string): PropertyDecorator =>
  PropertyDecoratorFactory((cd: ClassData, pd: PropertyData) => {
    pd.tags['Model'] = true;
    pd.attributesData.push(new HeaderPropDTO(name ? name : pd.name));
  });
