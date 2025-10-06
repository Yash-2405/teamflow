export async function POST(request) {
  try {
    const body = await request.json();
    const { text, type = "task" } = body;

    if (!text || !text.trim()) {
      return Response.json(
        { error: "Text content is required for summarization" },
        { status: 400 },
      );
    }

    // If text is very short, return early with intelligent fallback
    if (text.trim().length < 50) {
      return Response.json({
        summary: "Task details are brief and already concise.",
        source: "auto",
        message: "Text is already concise enough",
      });
    }

    // Determine the prompt based on type
    let systemPrompt = "";
    if (type === "task") {
      systemPrompt =
        "You are a helpful assistant that creates concise, actionable summaries of task descriptions. Focus on the main objectives, key requirements, and deliverables. Use bullet points if helpful. Keep it under 100 words and make it different from the original text.";
    } else if (type === "sprint") {
      systemPrompt =
        "You are a helpful assistant that summarizes sprint logs and notes. Provide a clear overview of progress, blockers, and next steps. Keep it under 150 words.";
    } else {
      systemPrompt =
        "You are a helpful assistant that provides concise summaries. Keep your response clear and under 100 words.";
    }

    try {
      // Call OpenAI API using the integration
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `Please create a concise summary of this ${type} description (make it different from the original): "${text}"`,
            },
          ],
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();

        if (aiResponse.choices && aiResponse.choices.length > 0) {
          const summary = aiResponse.choices[0].message.content.trim();

          // Ensure the summary is different from the original
          if (summary && summary !== text.trim() && summary.length > 10) {
            return Response.json({
              summary: summary,
              source: "openai",
              usage: aiResponse.usage || null,
            });
          }
        }
      }

      console.warn(
        "AI API response was invalid or same as original, using enhanced fallback",
      );
    } catch (aiError) {
      console.error("AI API call failed:", aiError);
    }

    // Enhanced fallback summarization
    const fallbackSummary = createEnhancedSummary(text, type);
    return Response.json({
      summary: fallbackSummary,
      source: "enhanced_fallback",
      message: "AI unavailable, using intelligent text processing",
    });
  } catch (error) {
    console.error("Failed to generate summary:", error);
    return Response.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}

// Enhanced fallback summarization with better intelligence
function createEnhancedSummary(text, type) {
  if (!text || text.length === 0) {
    return "No content to summarize.";
  }

  const cleanText = text.trim().replace(/\s+/g, " ");

  // If text is already short, provide a structured version
  if (cleanText.length <= 100) {
    return `📝 Summary: ${cleanText}`;
  }

  // Extract key information
  const sentences = cleanText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
  const words = cleanText.toLowerCase().split(/\s+/);

  // Look for action words and key terms
  const actionWords = [
    "create",
    "develop",
    "build",
    "implement",
    "design",
    "research",
    "analyze",
    "write",
    "update",
    "fix",
    "improve",
  ];
  const priorityWords = [
    "important",
    "critical",
    "urgent",
    "required",
    "must",
    "should",
    "need",
  ];

  const foundActions = actionWords.filter((word) => words.includes(word));
  const foundPriorities = priorityWords.filter((word) => words.includes(word));

  let summary = "";
  const maxLength = type === "sprint" ? 120 : 80;

  // Try to get the most important sentence (often the first)
  if (sentences.length > 0) {
    let mainSentence = sentences[0].trim();

    // If first sentence is too long, truncate intelligently
    if (mainSentence.length > maxLength) {
      // Try to break at a comma or conjunction
      const breakPoints = [", and ", ", but ", ", or ", ", which ", ", that "];
      let bestBreak = -1;

      for (const bp of breakPoints) {
        const index = mainSentence.indexOf(bp);
        if (index > 30 && index < maxLength) {
          bestBreak = index;
          break;
        }
      }

      if (bestBreak > 0) {
        mainSentence = mainSentence.substring(0, bestBreak);
      } else {
        mainSentence = mainSentence.substring(0, maxLength - 3) + "...";
      }
    }

    summary = mainSentence;

    // Add action context if found
    if (foundActions.length > 0) {
      summary = `🎯 Action: ${foundActions[0]} - ${summary}`;
    } else {
      summary = `📋 Task: ${summary}`;
    }

    // Add priority indicator if found
    if (foundPriorities.length > 0) {
      summary = `⚡ ${summary}`;
    }
  } else {
    // Fallback to simple truncation
    summary = `📝 ${cleanText.substring(0, maxLength - 3)}...`;
  }

  return summary;
}
