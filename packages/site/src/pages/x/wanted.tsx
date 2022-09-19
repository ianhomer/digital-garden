import { findItemOrWanted, findLinks, findWantedThings } from "@garden/garden";

import { garden } from "../../components/siteGarden";

type AllData = {
  items: { name: string; count: number }[];
};
function Wanted({ items }: AllData) {
  return (
    <ul>
      {Array.from(new Set(items))
        .sort((a, b) =>
          a.count == b.count
            ? a.name > b.name
              ? 1
              : -1
            : a.count < b.count
            ? 1
            : -1
        )
        .map((item) => (
          <li key={item.name}>
            <a href={`/${item.name}`}>{item.name}</a> : {item.count}
          </li>
        ))}
    </ul>
  );
}

export async function getStaticProps() {
  const things = await garden.load();
  const items = await Promise.all(
    findWantedThings(things).map(async (name) => {
      const item = await findItemOrWanted(garden.config, name);
      const links = await findLinks(garden, item);

      return {
        name,
        count: links.length,
      };
    })
  );

  return { props: { items } };
}

export default Wanted;
