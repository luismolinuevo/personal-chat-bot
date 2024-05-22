import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
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
import { openai } from "@ai-sdk/openai";
import { LangChainAdapter, StreamingTextResponse, streamText } from 'ai';
import { NextResponse } from "next/server";

import { config } from "dotenv";
config();

export async function POST(req) {
  try {
    const body = await req.json();
    const messages = body.messages;
    const chatHistory = messages;

    const splitter = new RecursiveCharacterTextSplitter();
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const chatModel = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-3.5-turbo",
      verbose: true,
      streaming: true
    });

    const loader = new TextLoader("app/lib/aboutme.txt");
    const docs = await loader.load();

    console.log(docs)
    const splitDocs = await splitter.splitDocuments(docs);
    const vectorstore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );
    const retriever = vectorstore.asRetriever();

    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
      [
        "user",
        "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only return the query and nothing else. All the data is about me. so someone could ask like me, your and etc",
      ],
    ]);

    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: chatModel,
      retriever,
      rephrasePrompt: historyAwarePrompt,
    });

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
      chat_history: messages.map(m =>
        m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
      input: messages[messages.length - 1].content,
    });

    // let answer = result.answer;

    console.log("The answer:", result.answer);

    const assistantMessage = { role: "assistant", content: result.answer };
    messages.push(assistantMessage);

    const streamingResult = await streamText({
      model: chatModel,
      messages,
    });
  
    // return new StreamingTextResponse(streamingResult.toAIStream());
    // return NextResponse.json(answer)
    // return new StreamingTextResponse(streamingResult.toAIStream());
    // return new StreamingTextResponse(result.toAIStream())

    // const streamingResult = await chatModel.stream(chatHistory);

    // const aiStream = LangChainAdapter.toAIStream(streamingResult);

    // return new StreamingTextResponse(aiStream);
  } catch (error) {
    console.log(error);
  }
}


