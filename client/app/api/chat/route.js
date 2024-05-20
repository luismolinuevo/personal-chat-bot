import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { StreamingTextResponse, streamText } from "ai";
// import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";

import { config } from "dotenv";
config();

// import { openai } from '@ai-sdk/openai';
// import { StreamingTextResponse, streamText } from 'ai';

//   const retriever = vectorstore.asRetriever();

// const retrievalChain = await createRetrievalChain({
//   combineDocsChain: documentChain,
//   retriever,
// });
//   const chainprompt =
//   ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:

// <context>
// {context}
// </context>

// Question: {input}`);

// const documentChain = await createStuffDocumentsChain({
//   llm: chatModel,
//   chainprompt,
// });

export async function POST(req) {
  try {
    const body = await req.json();
    //   const messages = body.messages;

    const outputParser = new StringOutputParser();
    const splitter = new RecursiveCharacterTextSplitter();
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      // model: "gpt-3.5-turbo"
    });

    const chatModel = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-3.5-turbo",
    });

    // const result = await chatModel.invoke("what is LangSmith?");
    // console.log(result)
    // const result = "hay";

    //Load the document that has the data
    const loader = new TextLoader("app/lib/aboutme.txt");

    const docs = await loader.load();
    // console.log(docs);

    //Split the docement up so that its easier to read
    const splitDocs = await splitter.splitDocuments(docs);
    console.log(splitDocs);

    //Memory vector store
    const vectorstore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );

    //Create initial retrevial chain
    const prompt =
      ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:

    <context>
    {context}
    </context>

    Question: {input}`);

    const documentChain = await createStuffDocumentsChain({
      llm: chatModel,
      prompt,
    });

    const retriever = vectorstore.asRetriever();

    const retrievalChain = await createRetrievalChain({
      combineDocsChain: documentChain,
      retriever,
    });
    
    const result = await retrievalChain.invoke({
      input: "what is age?",
    });
    
    console.log(result.answer);
    // console.log(result2.answer);
    return NextResponse.json(splitDocs);
  } catch (error) {
    console.log(error);
  }
}
