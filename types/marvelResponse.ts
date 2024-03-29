export type MarvelResponse = {
  attributionText: string;
  data: Data;
};

type Data = {
  total: number;
  count: number;
  results: Results[];
};

type Results = {
  id: number;
  title: string;
  description: string;
  start: string; // String but in Date format
  end: string;
  urls: Urls[];
};

export type Urls = {
  type: string;
  url: string;
};

export type StoryResult = {
  id: number;
  title: string;
  description: string;
  start: string; // String but in Date format
  end: string;
  url: string;
  used: boolean;
  imgUrl: string;
  revisedPrompt: string;
  dateUpdated: string;
};

export enum QueryType {
  EVENTS = "events",
  CHARACTERS = "characters",
  COMICS = "comics",
  SERIES = "series",
  STORIES = "stories",
}

export interface FetcherProps {
  queryType?: QueryType;
  limit?: number;
  offset?: number;
}
