import { NextResponse } from "next/server";
import { ApiRequestHandler, handleApiRequest } from "@/lib/api-handle";
import { CreateImageRequestSizeEnum, OpenAIApi } from "openai";

interface ImageRequestBody {
  prompt: string;
  amount?: number;
  resolution?: CreateImageRequestSizeEnum;
}

function validateImageRequest({ prompt, amount, resolution }: ImageRequestBody) {

  if (!prompt) {
    return new NextResponse("Prompt is required", { status: 400 });
  }

  if (!amount) {
    return new NextResponse("Amount is required", { status: 400 });
  }

  if (!resolution) {
    return new NextResponse("Resolution is required", { status: 400 });
  }

  return null;
}

const processImageRequest: ApiRequestHandler<ImageRequestBody> = async ({ body, openai }) => {
  const { prompt, amount = 1, resolution = "512x512" } = body;

  const response = await openai.createImage({
    prompt,
    n: parseInt(amount.toString(), 10),
    size: resolution,
  });

  return NextResponse.json(response.data.data);
};

export const POST = (req: Request) =>
  handleApiRequest<ImageRequestBody>(req, processImageRequest, validateImageRequest);
