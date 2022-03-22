import { getAllItems } from "../../lib/content";

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
            <a href={"../" + link}>{link}</a>
          </li>
        ))}
    </ul>
  );
}

export async function getStaticProps() {
  const items = (await getAllItems()).map((item) => item.name);

  console.log(JSON.stringify(items));
  return { props: { items } };
}

export default All;
