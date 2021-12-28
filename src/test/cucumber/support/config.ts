import { LaunchOptions } from "playwright";
export const getBrowserOptions = (headless: boolean): LaunchOptions => {
  return {
    slowMo: 0,
    headless,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
    firefoxUserPrefs: {
      "media.navigator.streams.fake": true,
      "media.navigator.permission.disabled": true,
    },
  };
};
