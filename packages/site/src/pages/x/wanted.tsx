import { findWantedThings } from "@garden/garden";

import { garden } from "../../components/siteGarden";

type AllData = {
  items: string[];
};
function Wanted({ items }: AllData) {
  return (
    <ul>
      {Array.from(new Set(items))
        .sort()
        .map((name) => (
          <li key={name}>{name}</li>
        ))}
    </ul>
  );
}

export async function getStaticProps() {
  const things = await garden.load();
  const items = findWantedThings(things);

  return { props: { items } };
}

export default Wanted;
