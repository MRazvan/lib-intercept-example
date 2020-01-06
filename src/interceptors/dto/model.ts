import { ClassData, ClassDecoratorFactory } from "lib-reflect";
   export const Model = (): ClassDecorator => ClassDecoratorFactory((cd: ClassData) => {
      cd.tags['Model'] = true;
   });
