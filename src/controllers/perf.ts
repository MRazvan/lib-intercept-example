import { UseActivation } from 'lib-intercept';
import { Api } from '../attributes/api';
import { Controller } from '../attributes/controller';
import { PerformanceInterceptor } from '../interceptors/performance';

@Controller()
@UseActivation(PerformanceInterceptor)
export class PerfTest {
  @Api('GET', '/')
  public index(): string {
    return 'Performance Test';
  }
}
