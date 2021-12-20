import { micromark } from "micromark";

export default async function markdownToHtml(markdown: string) {
  return micromark(markdown);
}
