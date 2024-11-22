export const API_KEY = process.env.NEXT_PUBLIC_DODO_API_KEY;
export const RETURN_URL = process.env.NEXT_PUBLIC_RETURN_URL;
let PUBLIC_API: string;

if (typeof window !== "undefined") {
  const hostname = window.location.hostname;
  const extractedSubdomain = hostname.split(".")[1];

  switch (extractedSubdomain) {
    case "live": {
      PUBLIC_API = process.env.NEXT_PUBLIC_DODO_LIVE_API || "";
      break;
    }
    default: {
      PUBLIC_API = process.env.NEXT_PUBLIC_DODO_TEST_API || "";
    }
  }
}
export { PUBLIC_API };
