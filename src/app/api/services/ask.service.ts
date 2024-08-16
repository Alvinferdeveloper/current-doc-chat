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
    const topicsRelated = await getTopicsRelated(question);
    let textContext = '';
    for(let topic of topicsRelated){
        const { data } = await supabase.from('topic').select('content').eq('name',topic).limit(1);
        textContext += data ? data[0]?.content : '';
    }

    const documentation = textContext.replace(/\n/g, ' ');
    const { text} = await generateText({
        model: groq('llama3-8b-8192'),
        messages:[
            ...messages,
            {
                role:'system',
                content:`Eres un asistente de programacion, solo debes responder preguntas basadas en programacion, te debes basar primero en el siguiente contexto que estara entre las etiquetas content.<content>${documentation}</content>, si en el contexto no esta la respuesta la puedes dar de tu conocimiento y si la pregunta no es sobre programacion di que no puedes contestar por que eres un asistente de programacion. responde tambien si la respuesta la obtuviste del contexto que te di o de tu propio conocimiento`
            },
            {
                role:'user',
                content: question
            }
        ]
    });


    return text;
}

const getTopicsRelated = async (question:string)=>{
    const { data } = await supabase.from('topic').select('name');
    const allTopics = data?.map(({name}) => name).join(', ');
    const { text} = await generateText({
        model: groq('llama3-8b-8192'),
        messages:[
            {
                role:'system',
                content:`Eres una herramienta y quiero que me ayuedes con esto, te vos a pasar una pregunta que ira dentro de una etiqueta llamada question a continuacion: <question>${question}</question>, quiero que analices esa pregunta y mires a que contenido se relaciona mejor con los siguientes contenidos que te vos a pasar dentro de corchetes: [${allTopics}], si puedes interpretar que se trata de una pregunta sobre next js, trata de darme los resultados adecuados, si no estas seguro cual es el mejor puedes darme diferentes opciones separadas por coma dentro de las etiquetas <answer></answer>, no quiero que me devuelvas mas texto que unicamnete el que te pedi dentro de  <answer></answer>`
            },
        ]
    });

    const topicsRelated= text.startsWith('<') ? text.substring(text.indexOf('>') + 1, text.indexOf('</')).split(',') : ''
    return topicsRelated;
}