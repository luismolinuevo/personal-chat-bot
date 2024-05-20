import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { config } from "dotenv";
config();

// import { openai } from '@ai-sdk/openai';
// import { StreamingTextResponse, streamText } from 'ai';
const outputParser = new StringOutputParser();

const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-3.5-turbo",
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a personal chat bot. That will answer questions about me.",
  ],
  ["user", "{input}"],
]);

// const chain = prompt.pipe(chatModel);

const llmChain = prompt.pipe(chatModel).pipe(outputParser);

export async function POST(req) {
}
