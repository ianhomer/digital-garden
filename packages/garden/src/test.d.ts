declare module "expect" {
  interface Matchers<R> {
    toHaveExplicitLinks(thing: Thing): R;
  }
}
