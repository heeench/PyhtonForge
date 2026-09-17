"use client";
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,BookOpen,Download,Search} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Button} from '@/components/ui/button';
import {highlightCode} from '@/lib/highlight';
import {lessons,courseModules,resolveLessonIndex} from '@/lib/lessons';
import {tasks,type Entry} from '@/lib/training';

type Props={
 onRead:(lessonId:string,taskId?:string)=>void;
 initialLesson?:string;entries:Entry[];
 onSubmit:(check:{topic:string;taskId?:string|null;lessonId?:string},answer:string,score:number)=>void;
 onApply:(topic:string,taskId?:string|null)=>void;
};
export function TheoryPanel({onRead,entries,onSubmit,onApply,initialLesson}:Props){
 const [index,setIndex]=useState(()=>resolveLessonIndex(initialLesson));
 const [search,setSearch]=useState('');
 const [drafts,setDrafts]=useState<Record<string,string>>({});
 const [revealed,setRevealed]=useState<Record<string,boolean>>({});
 const lesson=lessons[index],lessonKey=lesson.id||lesson.topic,answer=drafts[lessonKey]||'';
 const articleRef=useRef<HTMLElement>(null),endRef=useRef<HTMLDivElement>(null),readCallback=useRef(onRead);
 readCallback.current=onRead;
 useEffect(()=>{if(initialLesson)setIndex(resolveLessonIndex(initialLesson));},[initialLesson]);
 useEffect(()=>{
  articleRef.current?.scrollIntoView({block:'start'});
  const el=endRef.current;if(!el)return;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const observer=new IntersectionObserver(([entry])=>{
   if(timer)clearTimeout(timer);
   if(entry.isIntersecting&&!document.hidden)timer=setTimeout(()=>{if(!document.hidden)readCallback.current(lessonKey,lesson.taskId||undefined);},1500);
  },{threshold:0.5});
  observer.observe(el);
  return()=>{observer.disconnect();if(timer)clearTimeout(timer);};
 },[lessonKey,lesson.taskId]);
 const isRead=(id:string)=>entries.some(e=>e.kind==='read'&&e.lessonId===id);
 const saved=entries.filter(e=>e.kind==='theory'&&(lesson.id?e.lessonId===lesson.id:!e.lessonId&&tasks.find(t=>t.id===e.task)?.topic===lesson.topic));
 const match=(i:number)=>!search.trim()||[lessons[i].title,lessons[i].markdown||'',lessons[i].topic].join(' ').toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
 const chapterButton=(i:number)=><button key={lessons[i].id||lessons[i].topic} aria-current={index===i?'page':undefined} className={index===i?'selected':''} onClick={()=>setIndex(i)}><span>{lessons[i].title}{isRead(lessons[i].id||lessons[i].topic)&&<small className="read-badge">✓ Прочитано</small>}</span></button>;
 const module=courseModules.find(m=>m.id===lesson.moduleId);
 const siblings=module?module.lessonIds.map(id=>lessons.findIndex(l=>l.id===id)):lessons.map((l,i)=>l.moduleId?-1:i).filter(i=>i>=0);
 const position=siblings.indexOf(index);
 const headings:{line:number;text:string}[]=[];
 let fenced=false;
 for(const [i,line] of (lesson.markdown||'').split('\n').entries()){
  if(line.startsWith('```'))fenced=!fenced;
  if(!fenced&&/^#{1,3} /.test(line))headings.push({line:i+1,text:line.replace(/^#+ /,'').replaceAll('`','')});
 }
 return <div className="theory-shell course-reader">
  <aside className="theorynav">
   <div className="theorynav-label"><BookOpen size={16}/> Ваш учебник</div>
   <label className="course-search"><Search size={15}/><input aria-label="Поиск по теории" placeholder="Поиск по тексту курса" value={search} onChange={e=>setSearch(e.target.value)}/></label>
   {courseModules.map(m=>{
    const indices=lessons.map((l,i)=>l.moduleId===m.id&&match(i)?i:-1).filter(i=>i>=0);
    return <details key={m.id+Boolean(search)} open={lesson.moduleId===m.id||Boolean(search)}>
     <summary>{m.title}<small>{m.lessonIds.filter(isRead).length} / {m.lessonIds.length} прочитано</small></summary>
     {indices.map(chapterButton)}
     {!indices.length&&<p className="quiet">Нет совпадений</p>}
    </details>;
   })}
   <details open={!lesson.moduleId}><summary>Дополнительные материалы<small>Практические заметки и другие темы</small></summary>{lessons.map((l,i)=>!l.moduleId&&match(i)?chapterButton(i):null)}</details>
  </aside>
  <article className="theoryarticle" key={lessonKey} ref={articleRef}>
   <div className="theoryarticle-top"><span className="pill">{lesson.moduleTitle||'Дополнительный материал'}</span><span className="quiet">{position+1} / {siblings.length}</span></div>
   {lesson.markdown?<><div className="source-note"><span>Полный текст вашей главы · без сокращений</span><a href={'/course-sources/'+encodeURIComponent(lesson.sourceFile!)} download><Download size={14}/> Исходный файл</a></div>
    <details className="chapter-outline"><summary>В этой главе · {headings.length} разделов</summary><nav>{headings.map(h=><a key={h.line} href={'#chapter-'+lessonKey+'-'+h.line}>{h.text}</a>)}</nav></details>
    <div className="course-markdown"><Markdown remarkPlugins={[remarkGfm]} components={{
     h1:({node,children})=><h2 className="source-heading" id={'chapter-'+lessonKey+'-'+node?.position?.start.line}>{children}</h2>,
     h2:({node,children})=><h3 id={'chapter-'+lessonKey+'-'+node?.position?.start.line}>{children}</h3>,
     h3:({node,children})=><h4 id={'chapter-'+lessonKey+'-'+node?.position?.start.line}>{children}</h4>,
     pre:({children})=><pre className="lesson-code">{children}</pre>,
     code:({className,children})=>className?.includes('language-python')?<code className={className} dangerouslySetInnerHTML={{__html:highlightCode(String(children),'python')}}/>:<code className={className}>{children}</code>,
     table:({children})=><div className="markdown-table"><table>{children}</table></div>
    }}>{lesson.markdown}</Markdown></div></>:<>
    <h1>{lesson.title}</h1><p className="theorylead">{lesson.path}</p>
    <nav className="lesson-toc" aria-label="Разделы главы">{lesson.sections.map((s,i)=><a href={'#section-'+i} key={s.title}>{i+1} · {s.title}</a>)}</nav>
    {lesson.sections.map((s,i)=><section className="lesson-section" id={'section-'+i} key={s.title}><h2>{s.title}</h2>{s.paragraphs.map(p=><p key={p}>{p}</p>)}</section>)}
    <section className="lesson-section"><h2>Разобранный пример</h2><pre className="lesson-code"><code dangerouslySetInnerHTML={{__html:highlightCode(lesson.code,lesson.topic==='PostgreSQL / SQL'?'sql':'python')}}/></pre><ol className="walkthrough">{lesson.walkthrough.map(step=><li key={step}>{step}</li>)}</ol><div className="lesson-callout"><b>На что обратить внимание</b><p>{lesson.pitfall}</p></div></section>
   </>}
   <div ref={endRef} className="read-marker">{isRead(lessonKey)?'✓ Глава прочитана · отметка добавлена':'Конец главы · прочтение отмечается автоматически'}</div>
   <details className="chapter-response"><summary>Проверить понимание · письменный ответ</summary><section className="knowledge-check">
    <h2>Объясните своими словами</h2><p>{lesson.question}</p>
    <textarea value={answer} maxLength={1200} onChange={e=>{setDrafts({...drafts,[lessonKey]:e.target.value});setRevealed({...revealed,[lessonKey]:false});}} placeholder="Ваше объяснение, пример и граничный случай…" rows={7} aria-label="Ваше объяснение"/>
    <div className="knowledge-actions"><small>{answer.length} / 1200</small><Button disabled={!answer.trim()} onClick={()=>{onSubmit({topic:lesson.topic,taskId:lesson.taskId,lessonId:lesson.id||lesson.topic},answer,0);setRevealed({...revealed,[lessonKey]:true});}}>Сохранить и сверить</Button></div>
    {revealed[lessonKey]&&<div className="lesson-callout" role="status"><b>Ориентир для сверки</b><p>{lesson.reference}</p><p>Ответ сохраняется без автоматической оценки. Освоение нужно подтвердить самостоятельным кодом.</p></div>}
    {saved.length>0&&<details className="saved-answers"><summary>Предыдущие ответы · {saved.length}</summary>{saved.slice().reverse().map(e=><div key={e.id}><small>{new Date(e.time).toLocaleDateString('ru-RU')}</small><p>{e.explanation}</p></div>)}</details>}
   </section></details>
   {!!lesson.taskIds?.length&&<div className="lesson-exercises"><h3>Практика по теме</h3>{lesson.taskIds.map(id=><button key={id} onClick={()=>onApply(lesson.topic,id)}><span>{tasks.find(t=>t.id===id)?.title}</span><small>{entries.some(e=>e.kind==='run'&&e.task===id&&e.passed)?'✓ Решено':'К задаче →'}</small></button>)}</div>}
   <div className="lesson-pagination"><Button variant="ghost" disabled={position<=0} onClick={()=>setIndex(siblings[position-1])}>Предыдущая глава</Button><Button variant="ghost" disabled={position===siblings.length-1} onClick={()=>setIndex(siblings[position+1])}>Следующая глава <ArrowRight size={16}/></Button></div>
  </article>
 </div>;
}
