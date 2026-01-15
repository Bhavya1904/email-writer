package com.email.service;

import com.email.payload.EmailRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;
    private final String apiKey;

    public EmailGeneratorService(
            WebClient.Builder webClientBuilder,
            @Value("${gemini.api.url}") String baseUrl,
            @Value("${gemini.api.key}") String geminiApiKey) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.apiKey = geminiApiKey;
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        // Build prompt
        String prompt = buildPrompt(emailRequest);
        // Prepare raw JSON body
        String requestBody = String.format("""
                {
                  "contents": [
                    {
                      "parts": [
                        {
                          "text": "%s"
                        }
                      ]
                    }
                  ]
                }
                """, prompt);
        // Send Request
        String response = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("v1beta/models/gemini-2.5-flash:generateContent")
                        .build())
                .header("x-goog-api-key", apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // Extract Response
        return extractResponseContent(response);

    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing response from Gemini API: " + response);
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("""
                You are an AI email assistant specialized in writing clear, professional, and context-aware email replies.
                
                Your task:
                - Read the original email carefully
                - Generate a well-structured reply that directly addresses the sender’s points
                - Maintain clarity, politeness, and professionalism
                - Avoid unnecessary repetition
                - Do NOT invent facts or commitments not implied in the original email
                
                """);
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Tone to use: ").append(emailRequest.getTone()).append(".\n");
        }
        prompt.append("""
                Formatting rules:
                - Start with an appropriate greeting
                - Use short, clear paragraphs
                - Keep the reply concise but complete
                - End with a suitable closing and sign-off
                
                Original Email:
                """);
        prompt.append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}

