import { ItemLink, Meta, Things } from "@garden/types";

class MetaFactory {
  meta;
  thingsFactory;

  constructor(thingsFactory: ThingsFactory, meta: Meta) {
    this.thingsFactory = thingsFactory;
    this.meta = meta;
  }

  links(...names: string[]) {
    for (const name of names) {
      this.meta.links.push({ name });
    }
    return this;
  }

  pop() {
    return this.thingsFactory;
  }
}

class ThingsFactory {
  things: Things = {};

  thing(name: string) {
    const meta = {
      title: name,
      links: [],
    };
    this.things[name] = meta;
    return new MetaFactory(this, meta);
  }

  linked(name: string, to: string) {
    return this.thing(name).links(to).pop();
  }

  deep(base: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.thing(`${base}-${i}`).links(`${base}-${i + 1}`);
    }
    return this;
  }

  create() {
    return this.things;
  }
}

export const factory = () => new ThingsFactory();
export const bySource = (source: string) => (link: ItemLink) =>
  link.source === source;
