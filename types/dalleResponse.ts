export type DallEResponse = {
  created: number;
  data: Data[];
};

type Data = {
  revised_prompt: string;
  url: string;
};
