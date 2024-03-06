import { garden } from "../../components/site-garden";

type Props = {
  excludes: string[];
  hasMultiple: string;
  type: string;
};

function Config(props: Props) {
  return (
    <ul>
      <li>excludes : {props.excludes.join(",")}</li>
      <li>hasMultiple : {props.hasMultiple}</li>
      <li>type : {props.type}</li>
    </ul>
  );
}

export async function getStaticProps() {
  return {
    props: {
      excludes: garden.config.excludes,
      hasMultiple: garden.config.hasMultiple ? "true" : "false",
      type: garden.config.type,
    },
  };
}

export default Config;
