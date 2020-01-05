import { IAfterActivation, IBeforeActivation, IContext } from 'lib-intercept';

export class PerformanceInterceptor implements IBeforeActivation, IAfterActivation {
  public before(ctx: IContext): boolean {
    ctx.setData('Start', process.hrtime());
    // Let the execution continue after this method
    return true;
  }
  public after(ctx: IContext): void {
    const start = ctx.getData<[number, number]>('Start');
    const time = process.hrtime(start);
    const msg = `Took : ${time[0] * 1000 + time[1] / 1e6} ms`;
    // Replace the result
    ctx.getResult().setSuccess(msg);
  }
}
