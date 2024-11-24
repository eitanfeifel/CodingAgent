import { generateChatCompletion } from "./llms/chat";
import OpenAI from "openai";
import * as xml2js from "xml2js";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// export async function syntaxReviewAgent(patch: string, context: string): Promise<string> {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo", // Or "gpt-4" based on your preference
//       messages: [{
//         role: "system",
//         content: "You are a code reviewer specializing in syntax and logical consistency.",
//       },
//       {
//         role: "user",
//         content: `
//           Review the following code patch for syntax errors and logical issues:
//           Context:
//           ${context}
          
//           Code Patch:
//           ${patch}
//         `,
//       },],
//       max_tokens: 500,
//       temperature: 0.7,
//     });
  
//     if (completion.choices && completion.choices.length > 0) {
//       return completion.choices[0].message.content.trim();
//     } else {
//       throw new Error("No valid response from OpenAI API");
//     }
//   }
  

//   export async function dependencyReviewAgent(patch: string, context: string): Promise<string> {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo", // Or "gpt-4" based on your preference
//       messages: [
//         {
//           role: "system",
//           content: "You are a code reviewer specializing in dependency management.",
//         },
//         {
//           role: "user",
//           content: `
//             Review the following code patch for dependency issues:
//             - Identify unused, outdated, or unnecessary dependencies.
//             - Suggest improvements to security and efficiency.
//             Context:
//             ${context}
            
//             Code Patch:
//             ${patch}
//           `,
//         },
//       ],
//       max_tokens: 500,
//       temperature: 0.7,
//     });
  
//     if (completion.choices && completion.choices.length > 0) {
//       return completion.choices[0].message.content.trim();
//     } else {
//       throw new Error("No valid response from OpenAI API for dependencyAgent");
//     }
//   }
  

//   export async function styleReviewAgent(patch: string, context: string): Promise<string> {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo", // Or "gpt-4" based on your preference
//       messages: [
//         {
//           role: "system",
//           content: "You are a code reviewer specializing in code style and readability.",
//         },
//         {
//           role: "user",
//           content: `
//             Review the following code patch for style and readability improvements:
//             - Focus on adherence to style guides and improving code maintainability.
//             - Suggest improvements for better readability and structure.
//             Context:
//             ${context}
            
//             Code Patch:
//             ${patch}
//           `,
//         },
//       ],
//       max_tokens: 500,
//       temperature: 0.7,
//     });
  
//     if (completion.choices && completion.choices.length > 0) {
//       return completion.choices[0].message.content.trim();
//     } else {
//       throw new Error("No valid response from OpenAI API for styleAgent");
//     }
//   }

  interface Review {
    type: string;
    suggestion: string;
  }
  
  interface FileReview {
    filename: string;
    reviews: Review[];
  }
  


  export async function syntaxReviewAgent(patch: string, context: string): Promise<any> {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a code reviewer specializing in syntax and logical consistency.",
        },
        {
          role: "user",
          content: `Review the following code patch for syntax issues:
  Context:
  ${context}
  
  Code Patch:
  ${patch}`,
        },
      ],
    });
  
    if (completion.choices && completion.choices.length > 0) {
        return completion.choices[0].message.content.trim();
      } else {
        throw new Error("No valid response from OpenAI API for styleAgent");
      }
  }
  
  export async function dependencyReviewAgent(patch: string, context: string): Promise<any> {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a code reviewer focusing on dependency and modularity issues.",
        },
        {
          role: "user",
          content: `Review the following code patch for dependency and modularity issues:
  Context:
  ${context}
  
  Code Patch:
  ${patch}`,
        },
      ],
    });
  
    if (completion.choices && completion.choices.length > 0) {
        return completion.choices[0].message.content.trim();
      } else {
        throw new Error("No valid response from OpenAI API for styleAgent");
      }
  }
  
  export async function styleReviewAgent(patch: string, context: string): Promise<any> {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a code reviewer focusing on readability and maintainability.",
        },
        {
          role: "user",
          content: `Review the following code patch for readability and maintainability:
  Context:
  ${context}
  
  Code Patch:
  ${patch}`,
        },
      ],
    });
  
    if (completion.choices && completion.choices.length > 0) {
        return completion.choices[0].message.content.trim();
      } else {
        throw new Error("No valid response from OpenAI API for styleAgent");
      }
  }

  const generateXMLFromReviews = (reviews: FileReview[]): string => {
    const builder = new xml2js.Builder();
    const xmlReviews = reviews.map((fileReview) => ({
      file: fileReview.filename,
      reviews: fileReview.reviews.map((r: Review) => ({
        type: r.type,
        suggestion: r.suggestion,
      })),
    }));
  
    return builder.buildObject({ reviews: xmlReviews });
  };
  
  export async function aggregateReviewsAndGenerateXML(
    files: { filename: string; patch: string; context: string }[]
  ): Promise<string> {
    const aggregatedReviews: FileReview[] = [];
  
    for (const file of files) {
      const syntaxReviews = await syntaxReviewAgent(file.patch, file.context);
      const dependencyReviews = await dependencyReviewAgent(file.patch, file.context);
      const readabilityReviews = await styleReviewAgent(file.patch, file.context);
  
      aggregatedReviews.push({
        filename: file.filename,
        reviews: [...syntaxReviews, ...dependencyReviews, ...readabilityReviews],
      });
    }
  
    // Generate XML from aggregated reviews
    return generateXMLFromReviews(aggregatedReviews);
  }

//   export { syntaxReviewAgent, styleReviewAgent, dependencyReviewAgent };
