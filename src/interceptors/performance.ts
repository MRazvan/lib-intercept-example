import { IAfterActivation, IBeforeActivation, IContext } from 'lib-intercept';

// Performance interceptor to track the execution time of call
//    Depending on where it is placed, we can track the execution of
//  - All 'interceptors'
//  - Class 'interceptors'
//  - Method 'interceptors'
//  - Only the method execution
export class PerformanceInterceptor implements IBeforeActivation, IAfterActivation {
  public before(ctx: IContext): boolean {
    ctx.setData('Start', process.hrtime());
    // Let the execution continue after this point,
    //  if we return false the execution will stop here and the 'After' interceptors will execute
    return true;
  }
  public after(ctx: IContext): void {
    const start = ctx.getData<[number, number]>('Start');
    const time = process.hrtime(start);
    const msg = `Took : ${time[0] * 1000 + time[1] / 1e6} ms`;
    // Replace the result, since we have access to the result object, we can override whatever is returned by the target method
    //    Carefull with replacing the result, if the target method returned a promise and we replace that, the promise might throw
    //    and nobody will catch that
    ctx.getResult().setSuccess(msg);
  }
}
