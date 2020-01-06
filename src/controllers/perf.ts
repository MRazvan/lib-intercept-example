import { UseActivation } from 'lib-intercept';
import { Api } from '../attributes/api';
import { Controller } from '../attributes/controller';
import { PerformanceInterceptor } from '../interceptors/performance';

@Controller()
// Because we are setting the activation on the class level
//    the interceptor will execute for all method on this class and only on the methods from this class
// If we need to execute for everything, we can set it on the server level
// If we need to execute for a specific method, we can set it on the method
@UseActivation(PerformanceInterceptor)
export class PerfTest {
  // Create a test method and map it as the default handler
  @Api('GET', '/')
  public index(): string {
    return 'Performance Test';
  }

  // Create another test method
  @Api('GET', '/second')
  public secondCall(): string {
    return 'Performance Test 2';
  }
}
