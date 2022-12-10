import { LinkType, Meta, Things, ThingType } from "@garden/types";

class MetaFactory {
  meta;
  thingsFactory;

  constructor(thingsFactory: ThingsFactory, meta: Meta) {
    this.thingsFactory = thingsFactory;
    this.meta = meta;
  }

  links(...names: string[]) {
    for (const name of names) {
      this.meta.links.push({ name, value: 1, type: LinkType.To });
    }
    return this;
  }

  new() {
    return this.thingsFactory;
  }
}

class ThingsFactory {
  things: Things = {};

  thing(name: string) {
    const meta = {
      title: name,
      links: [],
      aliases: [],
      value: 1,
      type: ThingType.Item,
    };
    this.things[name] = meta;
    return new MetaFactory(this, meta);
  }

  linked(name: string, to: string) {
    return this.thing(name).links(to).new();
  }

  deep(base: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.thing(`${base}-${i}`).links(`${base}-${i + 1}`);
    }
    return this;
  }

  build() {
    return this.things;
  }
}

export const factory = () => new ThingsFactory();
