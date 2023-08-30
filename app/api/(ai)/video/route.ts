import { ApiRequestHandler, handleApiRequest } from "@/lib/api-ai-handle";
import { NextResponse } from "next/server";

interface VideoRequestBody {
  prompt: string;
}

const validateVideoRequest = ({ prompt }: VideoRequestBody) => {
  if (!prompt) {
    return new NextResponse("Prompt is required", { status: 400 });
  }

  return null;
};

const processVideoRequest: ApiRequestHandler<VideoRequestBody> = async ({
  body,
  replicate,
}) => {
  const { prompt } = body;

  const response = await replicate.run(
    "anotherjesse/zeroscope-v2-xl:71996d331e8ede8ef7bd76eba9fae076d31792e4ddf4ad057779b443d6aea62f",
    {
      input: {
        prompt,
      },
    }
  );

  return NextResponse.json(response);
};

export const POST = (req: Request) =>
  handleApiRequest<VideoRequestBody>(
    req,
    processVideoRequest,
    validateVideoRequest
  );
