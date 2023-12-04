import { uploadToDb } from "./db";
import {
  FetcherProps,
  MarvelResponse,
  QueryType,
  StoryResults,
  Urls,
} from "../types/marvelResponse";
import * as crypto from "crypto";

const buildUrl = ({ queryType, limit, offset }: FetcherProps): string => {
  const privateK = process.env.PRIVATE_KEY;
  const publicK = process.env.PUBLIC_KEY;

  const ts = Date.now();

  const combinedInfo = `${ts}${privateK}${publicK}`;
  const md5 = crypto.createHash("md5").update(combinedInfo).digest("hex");

  return `http://gateway.marvel.com/v1/public/${queryType}?&limit=${limit}&offset=${offset}&ts=${ts}&apikey=${publicK}&hash=${md5}`;
};

const fetcher = async ({
  queryType = QueryType.EVENTS,
  limit = 100,
  offset = 0,
}: FetcherProps): Promise<MarvelResponse> => {
  return await fetch(buildUrl({ queryType, limit, offset }), {
    signal: AbortSignal.timeout(10 * 1000),
  })
    .then(resp => resp.json() as unknown as MarvelResponse)
    .catch(e => {
      throw e;
    });
};

const toResults = (rawData: MarvelResponse): StoryResults[] => {
  const getUrl = (items: Urls[]) => {
    const url = items
      .filter(item => item.type === "detail")
      .map(urls => urls.url)[0];

    return url ?? "http://marvel.com";
  };

  return rawData.data.results.map(item => {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      start: item.start,
      end: item.end,
      url: getUrl(item.urls),
    };
  });
};

const fetchStories = async () => {
  let hasAllResults = false;
  let data: StoryResults[] = [];
  let fetcherProps: FetcherProps = { offset: 0 };
  let attributionText: string = "";

  while (!hasAllResults) {
    console.info(
      `Fetching stories starting at offset ${fetcherProps.offset}...`
    );
    const rawData = await fetcher(fetcherProps);
    data = data.concat(toResults(rawData));

    console.info(`Fetched ${rawData.data.total} records on this pass...`);
    hasAllResults = rawData.data.count === rawData.data.total;
    if (!hasAllResults) {
      fetcherProps = {
        offset: rawData.data.count,
      };
    } else {
      attributionText = rawData.attributionText;
    }
  }

  console.info(`Total records fetched: ${data.length}`);

  const dbResult = uploadToDb(data);
  if (dbResult) {
    throw dbResult;
  }
};

export const handler = fetchStories;
