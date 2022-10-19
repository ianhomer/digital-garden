import { getAllItems } from "@garden/garden";
import { toConfig } from "@garden/garden";

import options from "../../garden.config";
const config = toConfig(options);

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
  const items = (await getAllItems(config)).map((item) => item.name);

  return { props: { items } };
}

export default All;
