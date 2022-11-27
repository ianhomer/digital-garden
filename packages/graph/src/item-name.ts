import { Things } from "@garden/types";

export default (data: Things, name: string) => {
  const childName = window.location.hash;
  const compositeName = name + childName;
  return compositeName in data ? compositeName : name;
};
