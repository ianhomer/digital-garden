import { TagMatcher } from "@garden/garden/src/garden";

import { garden } from "../../components/site-garden";

type Props = {
  directory: string;
  publish: TagMatcher;
  hasMultiple: string;
  type: string;
};

function Config(props: Props) {
  return (
    <ul>
      <li>exclude : {props.publish.exclude.join(",")}</li>
      <li>include : {props.publish.include.join(",")}</li>
      <li>directory : {props.directory}</li>
      <li>hasMultiple : {props.hasMultiple}</li>
      <li>type : {props.type}</li>
    </ul>
  );
}

export async function getStaticProps() {
  return {
    props: {
      publish: garden.config.publish,
      hasMultiple: garden.config.hasMultiple ? "true" : "false",
      directory: garden.config.directory,
      type: garden.config.type,
    },
  };
}

export default Config;
