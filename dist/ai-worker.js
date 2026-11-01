// Real local inference. No remote billing API, credentials or catalogue generation.
let engine, generator;
self.onmessage=async({data})=>{
 try{
 if(data.type==='load'){
  let gpu=false;
  try { gpu=!!(await self.navigator.gpu?.requestAdapter()); } catch {}
  if(gpu){
   try {
    const {CreateMLCEngine}=await import('https://esm.run/@mlc-ai/web-llm@0.2.79');
    engine=await CreateMLCEngine('Qwen2.5-0.5B-Instruct-q4f16_1-MLC',{initProgressCallback:p=>self.postMessage({type:'progress',text:p.text})});
   } catch { self.postMessage({type:'progress',text:'GPU runtime unavailable. Loading CPU-compatible model…'}); }
  }
  if(!engine){
   const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
   env.allowLocalModels=false; env.backends.onnx.wasm.numThreads=1;
   generator=await pipeline('text-generation','onnx-community/Qwen2.5-0.5B-Instruct',{device:'wasm',dtype:'q4',progress_callback:p=>{
    if(p.status==='progress')self.postMessage({type:'progress',text:`Loading Qwen · ${p.file} · ${Math.round(p.progress||0)}%`});
   }});
  }
  self.postMessage({type:'ready',backend:engine?'WebGPU':'CPU / WASM'});
 }else if(data.type==='infer'){
  if(!engine&&!generator)throw Error('Model not loaded');
  const prompt=`Update shopping requirements. Return only a JSON object containing fields explicitly changed by the NEW message. Omit fields not mentioned; they will be preserved. Fields: budget (USD number or null to remove limit), floral ("any", "prefer", "must"), keepMug, keepNecklace, lid, freeShipping, cheapest, ignoreHistory (booleans). Keeping either item does not mean keeping the other. Both are false unless explicitly requested. If a change is ambiguous return {"clarification":true}. Unsupported add/delete items: {"unsupported":true}. Previous confirmed requirements: ${JSON.stringify(data.previous)}. A follow-up such as "raise my budget to 55" changes ONLY budget. "This is a gift, ignore my history" sets ignoreHistory=true.`;
  const messages=[{role:'system',content:prompt},
   {role:'user',content:'Keep the necklace. Flowers required. Under 40 dollars.'},
   {role:'assistant',content:'{"keepNecklace":true,"floral":"must","budget":40}'},
   {role:'user',content:'Then raise my budget to 55.'},
   {role:'assistant',content:'{"budget":55}'},
   {role:'user',content:data.text}];
  let text;
  if(engine){
   const r=await engine.chat.completions.create({messages,temperature:0,max_tokens:130,response_format:{type:'json_object'}});
   text=r.choices[0].message.content;
  }else{
   const r=await generator(messages,{max_new_tokens:130,do_sample:false,return_full_text:false});
   const output=r[0].generated_text; text=typeof output==='string'?output:output.at(-1).content;
  }
  const start=text.indexOf('{'),end=text.lastIndexOf('}');
  if(start<0||end<start)throw Error('The model did not return valid conditions. Please edit them manually.');
  self.postMessage({type:'result',id:data.id,value:JSON.parse(text.slice(start,end+1))});
 }
 }catch(e){self.postMessage({type:'error',id:data.id,message:String(e.message||e)});}
};
