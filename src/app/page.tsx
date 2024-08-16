'use client'
import { useSession, signIn, signOut } from "next-auth/react";
import { FormEvent, FormEventHandler, useEffect, useState } from "react";


export default function Home() {
  const [question, setQuestion ] = useState('');
  const [answer, setAnswer ] = useState('');

  const onSubmit = async (e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
      const res = await fetch('/api/ask',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
          messages:[],
          question
        })
      })
      
      const json = await res.json();  
      setAnswer(json.answer)    

  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>{answer}</div>
      <form onSubmit={onSubmit}>
        <input type="text" className=" text-black"  placeholder="answer" onChange={(e)=>setQuestion(e.target.value)} value={question}/>
        <input type="submit" value="Enviar" />
      </form>
    </main>
  );
}
