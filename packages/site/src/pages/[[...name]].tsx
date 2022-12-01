import {
  findItemOrWanted,
  findLinks,
  getPageItems,
  isNotValidPageName,
} from "@garden/garden";
import {
  GraphDiagram,
  itemName,
  markdownToHtml,
  toParentName,
  useKey,
  useWindowDimensions,
} from "@garden/react";
import { Item, Link, Things } from "@garden/types";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { garden } from "../components/site-garden";

interface Props {
  item: {
    name: string;
    content: string;
    links: Link[];
  };
  scripts: { [key: string]: string }[];
}

function ItemPage({ item, scripts }: Props) {
  const ref = useRef<null | HTMLDivElement>(null);

  const [callbackInvoked, setCallbackInvoked] = useState(false);

  const { height, width } = useWindowDimensions();
  const [scale, setScale] = useState(1.3);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Things>({});
  const router = useRouter();

  useKey((key) => setDepth(parseInt(key)), ["1", "2", "3", "4", "5"]);

  useKey(() => setScale(scale / 1.5), ["b"]);
  useKey(() => setScale(scale / 1.3), ["v"]);
  useKey(() => setScale(scale), ["c"]);
  useKey(() => setScale(scale * 1.3), ["x"]);
  useKey(() => setScale(scale * 1.5), ["z"]);

  useEffect(() => {
    if (callbackInvoked) {
      ref.current?.scrollIntoView();
    }
  }, [callbackInvoked, item]);

  useEffect(() => {
    fetch("/garden.json")
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setData(data);
      });
  }, []);

  return (
    <>
      <Head>
        <title>{data[item.name]?.title || item.name}</title>
      </Head>
      {scripts.map((script, index) => (
        <Script key={`script-${index}`} {...script} />
      ))}

      <div className="container max-w-4xl px-4">
        <div dangerouslySetInnerHTML={{ __html: item.content }} />
      </div>

      {!isLoading && data && (
        <div ref={ref}>
          <GraphDiagram
            data={data}
            height={height}
            scale={scale}
            start={itemName(data, item.name)}
            width={width}
            callback={(name, event) => {
              const href = "/" + name;
              const baseHref = toParentName(href) ?? href;
              router.push(baseHref, undefined, { scroll: false });
              // window.history.replaceState(null, name, href);
              setCallbackInvoked(true);
              // event.preventDefault();
            }}
          />
        </div>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const itemName = (params?.name && params?.name[0]) ?? false;
  const item = await findItemOrWanted(garden.repository, itemName);
  const links = await findLinks(garden, item);
  const content = await markdownToHtml(item.content);

  return {
    props: {
      item: {
        ...item,
        links,
        content,
      },
      scripts: garden.config.scripts,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const things = await garden.load();
  const items = await getPageItems(garden.repository, things);

  const invalidPageNames = items
    .map((item) => item.name)
    .filter(isNotValidPageName);

  if (invalidPageNames.length > 0) {
    console.log("Invalid page names found");
    console.log(JSON.stringify(invalidPageNames, null, "  "));
  }

  return {
    paths: items.map((item: Item) => ({
      params: {
        name: [item.name],
      },
    })),
    fallback: false,
  };
};

export default ItemPage;
