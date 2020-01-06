import { ClassData, MethodData, MethodDecoratorFactory } from 'lib-reflect';

export type HttpMethod = 'GET' | 'POST' | 'PUT';

// Simple DTO for storing API configuration data
export class ApiData {
  constructor(public method: HttpMethod, public path: string) {}
}

// The API method decorator it takes
//    - the HTTP method
//    - optional route path
export const Api = (method: HttpMethod, path?: string): MethodDecorator =>
  MethodDecoratorFactory((cd: ClassData, md: MethodData, desc: any) => {
    // We should check to see if we already have the same API bound on the method?? Neah, we are only using one api
    //  in our example so no need to check, in a more complex case where we can bind multiple routes on the same method
    //  or same route with different http methods, we should check to see that we don't decorate the method with multiple
    //  api's with the same definition
    //  const alreadyExists = md.getAttributesOfType<ApiData>(ApiData).find(a => a.method === method && a.path === apiPath);
    const apiPath = path ? path : md.name;
    md.attributesData.push(new ApiData(method, apiPath));
  });
