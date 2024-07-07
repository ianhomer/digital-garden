import { Items } from "@garden/types";

export default (data: Items, name: string) => {
  const childName = window.location.hash;
  const compositeName = name + childName;
  return compositeName in data ? compositeName : name;
};
