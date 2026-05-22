import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { buildPrestataireInjection } from "@/lib/prestatairesSearch.server";

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(): string {
  const claudePath = path.join(process.cwd(), "CLAUDE.md");
  const knowledgePath = path.join(process.cwd(), "KNOWLEDGE.md");

  let claudeMd = "";
  let knowledgeMd = "";

  try {
    claudeMd = fs.readFileSync(claudePath, "utf8");
  } catch (err) {
    console.error("Error reading CLAUDE.md:", err);
    claudeMd = "Tu es ARECIE Assistant, l'assistant officiel de l'ARECIE.";
  }

  try {
    knowledgeMd = fs.readFileSync(knowledgePath, "utf8");
  } catch (err) {
    console.error("Error reading KNOWLEDGE.md:", err);
    knowledgeMd = "";
  }

  return `
${claudeMd}

---
## BASE DE CONNAISSANCE OFFICIELLE ARECIE
Tu disposes ci-dessous de la base de connaissance complète
issue des documents officiels ARECIE (Statuts, Règlement
Intérieur, ASMAR, WTW, MediNova). Utilise-la en priorité
absolue pour répondre. Ne dis JAMAIS "consulter les statuts"
si la réponse s'y trouve déjà — réponds directement.

## RÉSEAU DE SOINS ASMAR / WTW
Quand un bloc [PRESTATAIRES DISPONIBLES À …] est fourni dans le message utilisateur,
cite UNIQUEMENT les établissements de cette liste (nom exact). N'invente jamais de prestataire.
${knowledgeMd}
`.trim();
}

const systemPrompt = buildSystemPrompt();

function enrichMessagesWithPrestataires(messages: ChatMessage[]): ChatMessage[] {
  const lastUserIndex = [...messages]
    .map((m, i) => ({ m, i }))
    .reverse()
    .find(({ m }) => m.role === "user")?.i;

  if (lastUserIndex === undefined) return messages;

  const lastUser = messages[lastUserIndex];
  const injection = buildPrestataireInjection(lastUser.content);
  if (!injection) return messages;

  return messages.map((msg, index) =>
    index === lastUserIndex
      ? { ...msg, content: `${msg.content}\n\n${injection}` }
      : msg
  );
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "Configuration serveur incomplète. Veuillez réessayer plus tard." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const enrichedMessages = enrichMessagesWithPrestataires(
      messages as ChatMessage[]
    );

    let attempts = 0;
    const maxRetries = 2;

    while (attempts <= maxRetries) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 1024,
          system: systemPrompt,
          messages: enrichedMessages,
        });

        const contentBlock = response.content.find((block) => block.type === "text");
        const text =
          contentBlock && contentBlock.type === "text" ? contentBlock.text : "";

        return NextResponse.json({ reply: text });
      } catch (error) {
        attempts++;
        console.error(`Anthropic API Error (Attempt ${attempts}):`, error);
        if (attempts > maxRetries) {
          return NextResponse.json(
            {
              error:
                "Je rencontre actuellement des difficultés techniques. Ne vous inquiétez pas, veuillez réessayer dans quelques instants.",
            },
            { status: 500 }
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
