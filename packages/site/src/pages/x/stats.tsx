import { findWantedThings } from "@garden/garden";
import { LinkType } from "@garden/types";

import { garden } from "../../components/site-garden";

type Props = {
  thingsCount: number;
  wantedCount: number;
  singleWantedCount: number;
  singleNaturalWantedCount: number;
};

function Stats(stats: Props) {
  return (
    <ul>
      <li>item count : {stats.thingsCount}</li>
      <li>wanted count : {stats.wantedCount}</li>
      <li>single wanted count : {stats.singleWantedCount}</li>
      <li>single natural wanted count : {stats.singleNaturalWantedCount}</li>
    </ul>
  );
}

export async function getStaticProps() {
  const things = await garden.load();
  const wantedThings = findWantedThings(things);
  const listOfThings = Object.values(things);
  const singleWantedThings = wantedThings.filter(
    (name) =>
      listOfThings.filter((thing) =>
        thing.links.find((link) => link.name === name)
      ).length === 1
  );
  const singleNaturalWantedThings = wantedThings.filter(
    (name) =>
      listOfThings.filter((thing) =>
        thing.links.find(
          (link) => link.name === name && link.type === LinkType.NaturalTo
        )
      ).length === 1
  );

  return {
    props: {
      thingsCount: Object.keys(things).length,
      wantedCount: wantedThings.length,
      singleWantedCount: singleWantedThings.length,
      singleNaturalWantedCount: singleNaturalWantedThings.length,
    },
  };
}

export default Stats;
