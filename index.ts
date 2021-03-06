import * as bp from 'body-parser';
import * as express from 'express';
import { ComplexController } from './src/controllers/complex';
import { Hello } from './src/controllers/hello';
import { PerfTest } from './src/controllers/perf';
import { BodyParamInterceptor } from './src/interceptors/body';
import { ModelInterceptor } from './src/interceptors/dto/interceptor';
import { LogInterceptor } from './src/interceptors/log';
import { Server } from './src/server';
import { Logger } from './src/services/logger';

const app = express();
app.use(bp.json());

const server = new Server();
// Register all interceptors
server
  .addActivations(BodyParamInterceptor)
  .addActivations(LogInterceptor)
  .addActivations(ModelInterceptor)

  // Register the services
  .registerService(Logger)

  // Register our controller
  .registerController(Hello)
  .registerController(PerfTest)
  .registerController(ComplexController)

  // Finally register all controllers in express
  .registerInExpress(app);

// Register all routes
app.listen(3000, () => {
  console.log('Started');
});
