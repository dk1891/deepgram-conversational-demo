import { Message } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // gotta use the request object to invalidate the cache every request :vomit:
    const url = req.url;
    const model = req.nextUrl.searchParams.get("model") ?? "aura-asteria-en";
    const data = await req.json();
    const message: Message = data.message;
    const voiceId = data.voiceId;
    const start = Date.now();

    let text = message.content;

    text = text
        .replaceAll("¡", "")
        .replaceAll("https://", "")
        .replaceAll("http://", "")
        .replaceAll(".com", " dot com")
        .replaceAll(".org", " dot org")
        .replaceAll(".co.uk", " dot co dot UK")
        .replaceAll(/```[\s\S]*?```/g, "\nAs shown on the app.\n")
        .replaceAll(
        /([a-zA-Z0-9])\/([a-zA-Z0-9])/g,
        (match, precedingText, followingText) => {
            return precedingText + " forward slash " + followingText;
        }
        );
    
    // const voiceId = 'XrExE9yKIg1WjnnlVkGX';
    const xilabsUrl =  `${process.env.ELEVENLABS_URL}/v1/text-to-speech/${voiceId}/stream`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi_api_key': process.env.ELEVENLABS_API_KEY,
            'X-DG-Referrer': url,
        },
        body: JSON.stringify({"model_id":"eleven_turbo_v2", "text":text }),
    };
    
    return await fetch(xilabsUrl, options)
    .then(async (response) => {
        const headers = new Headers();
        headers.set("X-DG-Latency", `${Date.now() - start}`);
        headers.set("Content-Type", "audio/mp3");

        if (!response?.body) {
        return new NextResponse("Unable to get response from API.", {
            status: 500,
        });
        }

        return new NextResponse(response.body, { headers });
    })
    .catch((error: any) => {
        console.log('caught error');
        return new NextResponse(error || error?.message, { status: 500 });
    });
}