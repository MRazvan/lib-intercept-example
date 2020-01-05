import { ClassData, MethodData, MethodDecoratorFactory } from 'lib-reflect';

export type HttpMethod = 'GET' | 'POST' | 'PUT';

export class ApiData {
  constructor(public method: HttpMethod, public path: string) {}
}

export const Api = (method: HttpMethod, path?: string): MethodDecorator =>
  MethodDecoratorFactory((cd: ClassData, md: MethodData, desc: any) => {
    // We should check to see if we already have the same API bound?? Neah;
    md.attributesData.push(new ApiData(method, path ? path : md.name));
  });
