import { ApiRequestHandler, handleApiRequest } from "@/lib/api-ai-handle";
import { NextResponse } from "next/server";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";

interface CodeRequestBody {
  messages: ChatCompletionRequestMessage[];
}

const validateCodeRequest = ({ messages }: CodeRequestBody) => {
  if (!messages) {
    return new NextResponse("Messages are required", { status: 400 });
  }

  return null;
};

const processCodeRequest: ApiRequestHandler<CodeRequestBody> = async ({
  body,
  openai,
}) => {
  const { messages } = body;

  const instructionMessage: ChatCompletionRequestMessage = {
    role: ChatCompletionRequestMessageRoleEnum.System,
    content:
      "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.",
  };

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [instructionMessage, ...messages],
  });

  return NextResponse.json(response.data.choices[0].message);
};

export const POST = (req: Request) =>
  handleApiRequest<CodeRequestBody>(
    req,
    processCodeRequest,
    validateCodeRequest
  );
