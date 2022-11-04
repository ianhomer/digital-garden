import { findWantedThings } from "@garden/garden";

import { garden } from "../../components/siteGarden";

type Props = {
  thingsCount: number;
  wantedCount: number;
};

function Stats(stats: Props) {
  return (
    <ul>
      <li>item count : {stats.thingsCount}</li>
      <li>wanted count : {stats.wantedCount}</li>
    </ul>
  );
}

export async function getStaticProps() {
  const things = await garden.load();
  const wantedThings = findWantedThings(things);

  return {
    props: {
      thingsCount: Object.keys(things).length,
      wantedCount: Object.keys(wantedThings).length,
    },
  };
}

export default Stats;
