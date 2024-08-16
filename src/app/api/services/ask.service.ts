import { generateText, streamText } from "ai"
import { createClient } from '@supabase/supabase-js'
import { createOpenAI } from '@ai-sdk/openai';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export async function getAnswer(question: string, messages: Message[]) {
    let textGenerated = '';
    const { data } = await supabase.from('pdf').select('text').eq("name", 'next');
    if (data) textGenerated = await data[0].text;
    const documentation = textGenerated.replace(/\n/g, ' ').slice(0,40);
    const { text} = await generateText({
        model: groq('llama3-8b-8192'),
        messages:[
            ...messages,
            {
                role:'system',
                content:`Eres un asistente de programacion, solo debes responder preguntas basadas en programacion, te debes basar primero en el siguiente contexto que estara entre las etiquetas content.<content>${documentation}</content>, si en el contexto no esta la respuesta la puedes dar de tu conocimiento y si la pregunta no es sobre programacion di que no puedes contestar por que eres un asistente de programacion`
            },
            {
                role:'user',
                content: question
            }
        ]
    });


    return text;
}