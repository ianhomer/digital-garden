import { getAllItems } from "@garden/garden";

import { garden } from "../../components/siteGarden";

type AllData = {
  items: string[];
};

function All({ items }: AllData) {
  return (
    <ul className="links">
      {Array.from(new Set(items))
        .sort()
        .map((link) => (
          <li key={link}>
            <a href={"/" + link}>{link}</a>
          </li>
        ))}
    </ul>
  );
}

export async function getStaticProps() {
  const items = (await getAllItems(garden.repository)).map((item) => item.name);

  return { props: { items } };
}

export default All;
