import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { config } from "dotenv";
config();

// import { openai } from '@ai-sdk/openai';
// import { StreamingTextResponse, streamText } from 'ai';
const outputParser = new StringOutputParser();
const splitter = new RecursiveCharacterTextSplitter();

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

const llmChain = prompt.pipe(chatModel).pipe(outputParser);

const loader = new TextLoader("app/aboutme.txt");

const docs = await loader.load();
console.log(docs.length);

const splitDocs = await splitter.splitDocuments(docs);


export async function POST(req) {
}
