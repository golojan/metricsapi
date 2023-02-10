//openai api routes
import { Router, Request, Response } from "express";
import { Configuration, OpenAIApi } from "openai";

const openaiRouter = Router();
const openAiConfiguration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(openAiConfiguration);

openaiRouter.all("/", async (req: Request, res: Response) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Hi there! I'm Chux. What's your name?",
    temperature: 0.5,
    max_tokens: 500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  res.status(200).json({
    status: true,
    result: response,
  });
});

export default openaiRouter;
