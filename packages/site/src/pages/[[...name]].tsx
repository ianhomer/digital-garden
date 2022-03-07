import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import DepthSlider, { defaultDepth } from "../components/depthSlider";
import GraphDiagram from "../components/graph-diagram";
import useWindowDimensions from "../components/useWindowDimensions";
import {
  findBackLinks,
  findImplicitBackLinks,
  findImplicitForwardLinks,
  findItem,
  getAllItems,
} from "../lib/content";
import { findWantedThings, garden } from "../lib/garden/garden";
import { findDeepLinks } from "../lib/garden/gardenGraph";
import { Item, Link, LinkType } from "../lib/garden/types";
import { createGraph } from "../lib/graph/graph";
import markdownToHtml from "../lib/markdownToHtml";

function ItemPage({ item }) {
  const { height, width } = useWindowDimensions();
  const [depth, setDepth] = useState(defaultDepth);
  const [scale, setScale] = useState(() => {
    if (typeof window !== "undefined") {
      const savedScale = JSON.parse(localStorage.getItem("graph-scale"));
      if (savedScale) {
        return savedScale;
      }
    }
    return 2;
  });

  useEffect(() => {
    localStorage.setItem("graph-scale", JSON.stringify(scale));
  }, [scale]);

  const handleScaleChange = (event: any, newValue: number | number[]) => {
    setScale(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  return (
    <>
      <div className="container max-w-4xl px-4">
        <div dangerouslySetInnerHTML={{ __html: item.content }} />
        <ul className="links">
          {item.links.map((link: Link) => (
            <li key={link.name} className={link.type}>
              <a href={link.name}>{link.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <GraphDiagram
        width={width}
        height={height}
        scale={scale}
        graph={createGraph(
          item.name,
          item.garden,
          findDeepLinks(item.garden, item.name, depth)
        )}
      />
      <div className="graph-controls">
        <DepthSlider value={depth} setValue={setDepth} />
        <Box sx={{ padding: "0.4em", width: 100, border: "1px dashed grey" }}>
          <Typography id="scale">Scale</Typography>
          <Slider
            defaultValue={scale}
            onChange={handleScaleChange}
            aria-labelledby="scale-slider"
            min={1}
            max={5}
            step={1}
            size="small"
            marks
            valueLabelDisplay="auto"
          />
        </Box>
      </div>
    </>
  );
}

async function findItemOrWanted(name: string): Promise<Item> {
  try {
    return await findItem(name);
  } catch (error) {
    console.log(`Wanted page : ${name}`);
    return {
      name,
      content: `# ${name}\n\nWanted`,
    };
  }
}

export async function getStaticProps({ params }) {
  const item = await findItemOrWanted(params.name && params.name[0]);
  const explicitBackLinks = params.name
    ? await findBackLinks(params.name[0])
    : [];
  const implicitBackLinks = await findImplicitBackLinks(params.name);
  const implicitForwardLinks = item.filename
    ? await findImplicitForwardLinks(item)
    : [];
  const links = Array.from(
    new Set([
      ...implicitForwardLinks,
      ...explicitBackLinks,
      ...implicitBackLinks,
    ]).values()
  )
    .filter((name) => name !== "README" && name !== item.name)
    .sort()
    .map(
      (link): Link => ({
        name: link,
        type: ((link) => {
          if (explicitBackLinks.includes(link)) {
            return LinkType.From;
          } else if (implicitBackLinks.includes(link)) {
            return LinkType.Has;
          }
          return LinkType.In;
        })(link),
      })
    );
  const content = await markdownToHtml(item.content || "no content");
  const things = await garden.load();

  return {
    props: {
      item: {
        ...item,
        links,
        content,
        garden: things,
      },
    },
  };
}

export async function getStaticPaths() {
  const things = await garden.load();
  const items = [
    ...(await getAllItems()),
    ...[{ name: "" }],
    ...findWantedThings(things).map((name) => ({
      name,
    })),
  ];

  return {
    paths: items.map((item: Item) => ({
      params: {
        name: [item.name],
      },
    })),
    fallback: false,
  };
}

export default ItemPage;
