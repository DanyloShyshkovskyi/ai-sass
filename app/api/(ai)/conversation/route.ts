import { ApiRequestHandler, handleApiRequest } from "@/lib/api-ai-handle";
import { NextResponse } from "next/server";

interface ConversationRequestBody {
  messages: any[]; // Update this with the appropriate type for messages
}

function validateConversationRequest({ messages }: ConversationRequestBody) {
  if (!messages) {
    return new NextResponse("Messages are required", { status: 400 });
  }

  return null;
}

const processConversationRequest: ApiRequestHandler<
  ConversationRequestBody
> = async ({ body, openai }) => {
  const { messages } = body;

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
  });

  return NextResponse.json(response.data.choices[0].message);
};

export const POST = (req: Request) =>
  handleApiRequest<ConversationRequestBody>(
    req,
    processConversationRequest,
    validateConversationRequest
  );
