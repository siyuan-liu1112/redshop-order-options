let pipelinePromise;
self.onmessage=async({data})=>{
 try{
  if(!pipelinePromise){
   const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
   env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
   pipelinePromise=pipeline('automatic-speech-recognition','onnx-community/whisper-tiny',{device:'wasm',dtype:'q8',progress_callback:p=>{if(p.status==='progress')self.postMessage({type:'progress',text:`Loading speech model · ${Math.round(p.progress||0)}%`});}});
  }
  const model=await pipelinePromise;
  const result=await model(data.audio,{language:data.language==='zh-CN'?'chinese':'english',task:'transcribe',chunk_length_s:25,stride_length_s:5});
  self.postMessage({type:'result',text:result.text});
 }catch(e){pipelinePromise=null;self.postMessage({type:'error',message:String(e.message||e)});}
};
