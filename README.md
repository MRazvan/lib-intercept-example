# lib-intercept-example

Example project showcasing some of the functionalities available in [lib-reflect](https://github.com/MRazvan/lib-reflect) and [lib-intercept](https://github.com/MRazvan/lib-intercept)

- How to create decorators (interceptors - attributes)
- How to create method execution interceptors (before and after execution) (interceptors - attributes)
- How to use / execute the method activations (server)
- How to handle method parameters (interceptors)
- How to integrate with express (with both routing and having interceptors integration by creating an HTTP Execution context and getting information from the request body to send to the method) (server)
- How to create more advanced use cases for an API - complex object as parameter when executing the method (interceptors - dto - complex controller)

The two libraries do not impose a style of development, or a certain project structure, it is the job of the user to decide how to organize the project, what the target methods return, how to handle that return, and what it needs to ease development and functionality implementation.

PS. The only thing that is hardlinked for now is the [inversify](https://github.com/inversify/InversifyJS) DI system.