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

const WORDS = ["foo", "bar", "baz", "qux", "fez", "tik", "mox"];
const RADIX = WORDS.length;

// numberToName that returns a deterministic name from a given number based on
// the array of available words.
const numberToName = (n: number) => {
  return n
    .toString(RADIX)
    .split("")
    .reverse()
    .map((i) => WORDS[parseInt(i)])
    .join("-");
};

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

  // Generate many things in a deterministic way. The same inputs will
  // consistently give the same set of things.
  many(count: number, options = { linkCount: 5, linkCluster: 0.75 }) {
    const lookup: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = numberToName(i);
      lookup.push(name);
    }

    // Generate links between things
    for (let i = 0; i < count; i++) {
      const metaBuilder = this.thing(lookup[i]);
      let distance = 1;
      let trigger = options.linkCluster;
      let direction = 1;
      for (let j = 0; j < options.linkCount; j++) {
        // Aim for the given the number of links. Clustered around the given
        // thing
        let relation = i + distance * direction;
        while (trigger < 1 && relation > -1 && relation < count) {
          trigger += options.linkCluster;
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
