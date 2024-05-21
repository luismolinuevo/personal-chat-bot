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
import { openai } from '@ai-sdk/openai';
import { StreamingTextResponse, streamText } from 'ai';
// import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";

import { config } from "dotenv";
config();

export async function POST(req) {
  try {
    const body = await req.json();
      // const messages = body.messages;
    // const chatHistory = messages;

    const splitter = new RecursiveCharacterTextSplitter();
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const chatModel = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-3.5-turbo",
    });

    //Load the document that has the data
    const loader = new TextLoader("app/lib/aboutme.txt");

    const docs = await loader.load();
    // console.log(docs);

    //Split the docement up so that its easier to read
    const splitDocs = await splitter.splitDocuments(docs);
    // console.log(splitDocs);

    //Memory vector store
    const vectorstore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );

    //Create initial retrevial chain
    // const prompt =
    //   ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:

    // <context>
    // {context}
    // </context>

    // Question: {input}`);

    // const documentChain = await createStuffDocumentsChain({
    //   llm: chatModel,
    //   prompt,
    // });

    //Checks the file
    const retriever = vectorstore.asRetriever();

    // const retrievalChain = await createRetrievalChain({
    //   combineDocsChain: documentChain,
    //   retriever,
    // });
    
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
      [
        "user",
        "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only return the query and nothing else",
      ],
    ]);
    
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: chatModel,
      retriever,
      rephrasePrompt: historyAwarePrompt,
    });

    // const chatHistory = [
    //   new HumanMessage("How old am I"),
    //   new AIMessage("22"),
    // ];
    
    // await historyAwareRetrieverChain.invoke({
    //   chat_history: chatHistory,
    //   input: "What year was I born",
    // });

    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "Answer the user's questions based on the below context:\n\n{context}",
      ],
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
    ]);
    
    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
      llm: chatModel,
      prompt: historyAwareRetrievalPrompt,
    });
    
    const conversationalRetrievalChain = await createRetrievalChain({
      retriever: historyAwareRetrieverChain,
      combineDocsChain: historyAwareCombineDocsChain,
    });

    const result = await conversationalRetrievalChain.invoke({
      chat_history: [
        new HumanMessage("How old am I?"),
        new AIMessage("22!"),
      ],
      input: "what year i was born",
    });
    
    console.log(result.answer);

    // console.log(result)
    return NextResponse.json(result.answer);
  } catch (error) {
    console.log(error);
  }
}
