export type DallEResponse = {
  created: number;
  data: Data[];
};

type Data = {
  revisedPrompt: string;
  url: string;
};
