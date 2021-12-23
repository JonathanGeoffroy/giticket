# core

@giticket/core is the core of giticket, as it handles every features we can apply on a repository :

- initializing / cloning repository,
- handling commits,
- handling tickets

This is meant to be used by others Giticket application, not be used as a standalone.  
If we want to use giticket (not developing a software on top of it), please check other packages.

## Running unit tests

Run `nx test core` to execute the unit tests via [Jest](https://jestjs.io).
