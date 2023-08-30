import { ApiRequestHandler, handleApiRequest } from "@/lib/api-ai-handle";
import { NextResponse } from "next/server";

interface MusicRequestBody {
  prompt: string;
}

const validateMusicRequest = ({ prompt }: MusicRequestBody) => {
  if (!prompt) {
    return new NextResponse("Prompt is required", { status: 400 });
  }

  return null;
};

const processMusicRequest: ApiRequestHandler<MusicRequestBody> = async ({
  body,
  replicate,
}) => {
  const { prompt } = body;

  const response = await replicate.run(
    "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
    {
      input: {
        prompt_a: prompt,
      },
    }
  );

  return NextResponse.json(response);
};

export const POST = (req: Request) =>
  handleApiRequest<MusicRequestBody>(
    req,
    processMusicRequest,
    validateMusicRequest
  );
