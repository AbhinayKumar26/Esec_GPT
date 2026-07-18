// import "dotenv/config";

// const getOpenAIAPIResponse = async (message) => {

//     const options = {
//         method: "POST",
//         headers: {
//             "Content-Type" : "application/json",
//             "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
//         },
//         body: JSON.stringify({
//             model: "gpt-4o-mini",
//             messages: [{
//                 role: "user",
//                 content: message
//             }]
//         })
//     };

//     try {
//         const response = await fetch("https://api.openai.com/v1/chat/completions", options);

//         const data = await response.json();
       
//         return data.choices[0].message.content;   //////////reply
        
//     }
//     catch (err) {
//         console.error(err);
//     }
// }

// export default getOpenAIAPIResponse;

 
import "dotenv/config";   // ✅ LOAD ENV HERE (MOST IMPORTANT)
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY is missing from environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function getOpenAIAPIResponse(message) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: message }],
  });

  return completion.choices[0].message.content;
}
