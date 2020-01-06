import { ClassData, PropertyData, PropertyDecoratorFactory } from 'lib-reflect';
export class QueryPropDTO {
  constructor(public name: string) {}
}

export const Query = (name?: string): PropertyDecorator =>
  PropertyDecoratorFactory((cd: ClassData, pd: PropertyData) => {
    pd.tags['Model'] = true;
    pd.attributesData.push(new QueryPropDTO(name ? name : pd.name));
  });
