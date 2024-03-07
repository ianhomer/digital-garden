import { useEffect, useState } from "react";

import { ItemPage } from "../components/ItemPage";

export default function Custom404() {
  const [name, setName] = useState("wanted");

  useEffect(() => {
    setName(window.location.pathname.replaceAll("/", ""));
  });

  return (
    <ItemPage
      item={{
        name,
        links: [],
        content: `<h1>${name}</h1><p>wanted</p>`,
      }}
      scripts={[]}
    />
  );
}
