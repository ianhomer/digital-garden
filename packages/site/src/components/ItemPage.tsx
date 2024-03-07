import {
  GraphDiagram,
  itemName,
  toParentName,
  useKey,
  useWindowDimensions,
} from "@garden/react";
import { Link, Things } from "@garden/types";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export interface ItemPageProps {
  item: {
    name: string;
    content: string;
    links: Link[];
  };
  scripts: { [key: string]: string }[];
}

export function ItemPage({ item, scripts }: ItemPageProps) {
  const ref = useRef<null | HTMLDivElement>(null);

  const [callbackInvoked, setCallbackInvoked] = useState(false);

  const { height, width } = useWindowDimensions();
  const [scale, setScale] = useState(1.3);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Things>({});
  const router = useRouter();

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

      <main>
        <div className="container max-w-4xl px-4">
          <div dangerouslySetInnerHTML={{ __html: item.content }} />
        </div>
      </main>

      {!isLoading && data && (
        <div ref={ref}>
          <GraphDiagram
            data={data}
            height={height}
            scale={scale}
            start={itemName(data, item.name)}
            width={width}
            callback={(name) => {
              const href = "/" + name;
              const baseHref = toParentName(href) ?? href;
              router.push(baseHref, undefined, { scroll: false });
              setCallbackInvoked(true);
            }}
          />
        </div>
      )}
    </>
  );
}
