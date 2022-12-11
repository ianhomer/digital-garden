import { LinkType, Meta, Things, ThingType } from "@garden/types";

interface ChainedBuilder {
  build: () => Things;
  thing: (name: string) => MetaBuilder;
  and: () => ThingsBuilder;
}

class MetaBuilder implements ChainedBuilder {
  meta;
  thingsBuilder;

  constructor(thingsBuilder: ThingsBuilder, meta: Meta) {
    this.thingsBuilder = thingsBuilder;
    this.meta = meta;
  }

  to(...names: string[]) {
    for (const name of names) {
      this.meta.links.push({ name, value: 1, type: LinkType.To });
    }
    return this;
  }

  and() {
    return this.thingsBuilder;
  }

  build() {
    return this.thingsBuilder.build();
  }

  thing(name: string) {
    return this.thingsBuilder.thing(name);
  }
}

class ThingsBuilder implements ChainedBuilder {
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
    return new MetaBuilder(this, meta);
  }

  deep(base: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.thing(`${base}-${i}`).to(`${base}-${i + 1}`);
    }
    return this;
  }

  and() {
    return this;
  }

  build() {
    return this.things;
  }
}

export const builder = () => new ThingsBuilder();
