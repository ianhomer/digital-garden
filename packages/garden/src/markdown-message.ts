export class MarkdownMessage {
  message;
  heading;

  constructor(heading: string, message: string) {
    this.message = message;
    this.heading = heading;
  }

  toMarkdown() {
    return `\n\n## ${this.heading}\n\n\`\`\`txt\n${this.message}\n\`\`\``;
  }
}
