import { getAllItems } from "../../lib/content";

function All({ items }) {
  return (
    <ul className="links">
      {items.sort().map((link) => (
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
