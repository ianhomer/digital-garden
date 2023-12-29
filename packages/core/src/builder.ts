import { LinkType, Meta, Things, ThingType } from "@garden/types";

import { toFakeName } from "./fake";
import { hash } from "./hash";

interface ChainedBuilder {
  build: () => Things;
  name: (name: string) => MetaBuilder;
  and: () => ThingsBuilder;
}

class MetaBuilder implements ChainedBuilder {
  private meta;
  private thingsBuilder;

  constructor(thingsBuilder: ThingsBuilder, meta: Meta) {
    this.thingsBuilder = thingsBuilder;
    this.meta = meta;
  }

  link(name: string, type = LinkType.To) {
    this.meta.links.push({ name, value: 1, type });
    return this;
  }

  to(...names: string[]) {
    for (const name of names) {
      this.link(name);
    }
    return this;
  }

  and() {
    return this.thingsBuilder;
  }

  build() {
    return this.thingsBuilder.build();
  }

  name(name: string) {
    return this.thingsBuilder.name(name);
  }
}

class ThingsBuilder implements ChainedBuilder {
  private things: Things = {};

  name(name: string) {
    const meta = {
      title: name,
      hash: hash(name),
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
      this.name(`${base}-${i}`).to(`${base}-${i + 1}`);
    }
    return this;
  }

  // Generate many things in a deterministic way. The same inputs will
  // consistently give the same set of things.
  many(
    count: number,
    options: { linkCount?: number; linkCluster?: number } = {},
  ) {
    const { linkCluster, linkCount } = {
      ...{ linkCount: 5, linkCluster: 0.75 },
      ...options,
    };
    const lookup: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = toFakeName(i);
      lookup.push(name);
    }

    // Generate links between things
    for (let i = 0; i < count; i++) {
      const metaBuilder = this.name(lookup[i]);
      let distance = 1;
      let trigger = linkCluster;
      let direction = 1;
      for (let j = 0; j < linkCount; j++) {
        // Aim for the given the number of links. Clustered around the given
        // thing
        let relation = i + distance * direction;
        while (trigger < 1 && relation > -1 && relation < count) {
          trigger += linkCluster;
          distance += 1;
          direction *= -1;
          relation = i + distance * direction;
        }
        trigger -= 1;
        if (relation > -1 && relation < count) {
          metaBuilder.to(lookup[relation]);
        }
      }
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
