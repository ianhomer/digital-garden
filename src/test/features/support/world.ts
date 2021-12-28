import { setWorldConstructor, World } from "@cucumber/cucumber";

class CustomWorld extends World {}

setWorldConstructor(World);
