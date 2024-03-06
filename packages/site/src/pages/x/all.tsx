import { getAllItems } from "@garden/garden";

import { garden } from "../../components/site-garden";

type AllData = {
  items: string[];
};

function All({ items }: AllData) {
  const all = new Set(items);
  return (
    <div>
      <div>count : {all.size}</div>
      <ul className="links">
        {Array.from(all)
          .sort()
          .map((link) => (
            <li key={link}>
              <a href={"/" + link}>{link}</a>
            </li>
          ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const items = (await getAllItems(garden.repository)).map((item) => item.name);

  return { props: { items } };
}

export default All;
