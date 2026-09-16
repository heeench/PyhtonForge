import raw from './tasks.json';
import phase1Raw from './phase1-tasks.json';
import foundationRaw from './foundation-tasks.json';
export type Test={name:string;check?:string;setup?:string;expected?:Record<string,unknown>[]};
export type Task={id:string;topic:string;title:string;description:string;starter:string;tests:Test[];hints:string[];theory:string;level:number;production:boolean;example:string;constraints:string[];language:string;packages:string[]};
export const tasks=[...(raw as Task[]),...(phase1Raw as Task[]),...(foundationRaw as Task[])];
export const topics=[...new Set(tasks.map(t=>t.topic))];
export type Result={name:string;pass:boolean;error?:string;type?:string};
export type Entry={id:string;session:string;task:string;mode:string;kind:'run'|'hint'|'review'|'skip'|'theory';time:number;elapsed:number;hints:number;before:number;after?:number;results?:Result[];code?:string;passed?:boolean;assisted?:boolean;explanation?:string;score?:number};
export function skill(topic:string,entries:Entry[]){
 const ids=tasks.filter(t=>t.topic===topic).map(t=>t.id);const runs=entries.filter(e=>ids.includes(e.task)&&e.kind==='run');
 const sessions=[...new Set(runs.map(e=>e.session))].map(s=>{const rs=runs.filter(e=>e.session===s);const win=rs.find(e=>e.passed);return {runs:rs,win};});
 const wins=sessions.filter(s=>s.win);const independent=wins.filter(s=>!s.win!.assisted&&s.win!.hints===0);
 const distinct=new Set(independent.map(s=>s.win!.task)).size;
 const days=new Set(independent.map(s=>new Date(s.win!.time).toISOString().slice(0,10))).size;
 const recent=sessions.slice(-5);const accuracy=recent.length?recent.filter(s=>s.win).length/recent.length:0;
 const last=wins.length?Math.max(...wins.map(s=>s.win!.time)):0;
 const spacedDays=[...new Set(independent.map(s=>new Date(s.win!.time).toISOString().slice(0,10)))].length;
 const theoryEntries=entries.filter(e=>ids.includes(e.task)&&e.kind==='theory');
 const implementation=Math.min(100,Math.round((wins.length?wins.reduce((n,s)=>n+(s.win!.hints||s.win!.assisted?0.55:1),0)/Math.max(runs.length,1):0)*100));
 const independence=Math.min(100,Math.round((independent.length/Math.max(2,distinct*2))*100));
 const retention=Math.min(100,Math.round((Math.min(spacedDays,5)/5)*100));
 const theoryUnderstanding=0; // Written answers are ungraded evidence, never automatic mastery.
 const theoryResponses=theoryEntries.length;
 const calibrationError=runs.length?Math.round(runs.reduce((n,e)=>n+Math.abs((e.before===1?.2:e.before===2?.5:.8)-(e.passed?1:0)),0)/runs.length*100):0;
 const mastery=Math.min(days<2?60:100,Math.round(implementation*.5+independence*.25+retention*.25));
 const intervalDays=[1,3,7,14,30][Math.min(4,Math.floor(mastery/25))];
 const due=last>0&&Date.now()-last>=intervalDays*86400000;
 return {theoryResponses,mastery,implementation,independence,retention,theoryUnderstanding,debugging:0,interviewExplanation:0,calibrationError,runs:runs.length,wins:wins.length,independent:independent.length,distinct,days,accuracy,due,last,intervalDays,proven:mastery>=80&&distinct>=2&&spacedDays>=2};
}
export function recommend(entries:Entry[],mode:string,filter='Все темы',exclude=''){
 const pool=tasks.filter(t=>(filter==='Все темы'||t.topic===filter)&&(mode!=='Production'||t.production));
 const scored=pool.map((t,i)=>{
   const s=skill(t.topic,entries);
   const topicIds=tasks.filter(x=>x.topic===t.topic).map(x=>x.id);
   const topicRuns=entries.filter(e=>topicIds.includes(e.task)&&e.kind==='run');
   const recent=topicRuns.slice(-6);
   const sessions=[...new Set(recent.map(r=>r.session))];
   // Beta posterior with a conservative prior. Treat each session as one observation.
   let alpha=2,beta=2;
   sessions.forEach(id=>{const rs=recent.filter(r=>r.session===id);const win=rs.find(r=>r.passed);if(win){alpha+=win.hints?0.35:1;beta+=Math.min(.6,(rs.length-1)*.15);}else beta+=1;});
   const probability=alpha/(alpha+beta);
   const recentWin=recent.filter(r=>r.passed).at(-1);
   const effort=recentWin?recentWin.elapsed/(tasks.find(x=>x.id===recentWin.task)!.level===1?480:900):1;
   const review=entries.filter(e=>topicIds.includes(e.task)&&e.kind==='review'&&e.after).at(-1);
   const anxious=review?.after===1;
   const overconfident=recent.some(r=>r.before===3&&!r.passed);
   const errors=recent.flatMap(r=>r.results?.filter(x=>!x.pass).map(x=>x.type)||[]);
   const repeatedError=errors.some(e=>errors.filter(x=>x===e).length>=3);
   let target=s.mastery<25?1:s.mastery<60?2:3;
   if(probability<.4||effort>1.8||anxious)target=Math.max(1,target-1);
   if(probability>.7&&effort<.8&&!anxious)target=Math.min(3,target+1);
   const r=topicRuns.filter(e=>e.task===t.id),last=r.at(-1),passed=r.filter(e=>e.passed);
   const daysSince=s.last?(Date.now()-s.last)/86400000:0;
   let score=70-s.mastery*.5-Math.abs(t.level-target)*27-i*.15;
   if(s.due)score+=55+Math.min(daysSince,20);if(!passed.length)score+=20;
   if(last&&!last.passed)score+=14;if(repeatedError)score+=12;if(overconfident||anxious)score+=8;
   if(passed.some(e=>Date.now()-e.time<86400000))score-=85;if(t.id===exclude)score-=150;
   const reason=s.due?'Пора проверить навык спустя время. Восстановите решение без прежнего кода.':anxious?'Закрепим навык небольшой задачей: после прошлой попытки вы отметили неуверенность.':repeatedError?'Повторяющаяся ошибка в этой теме — дадим другую задачу для её устранения.':effort>1.8?'Уменьшим сложность: последнее решение потребовало много времени.':overconfident?'Проверим граничные случаи: высокая уверенность пока не совпала с результатами тестов.':target>1?'Самостоятельные решения позволяют перейти к более сложному контракту.':'Короткая задача, чтобы проверить самостоятельную базу.';
   return {task:t,score,reason};
 });
 return scored.sort((a,b)=>b.score-a.score)[0]||{task:tasks[0],reason:'Начнём с базовой задачи.'};
}
export function feedback(results:Result[]){const fail=results.find(r=>!r.pass);if(!fail)return 'Все проверки пройдены. Сформулируйте, почему решение работает и какие крайние случаи оно учитывает.'; const type=fail.type||'';if(type.includes('Syntax')||type.includes('Indentation'))return 'Python не смог разобрать код. Проверьте двоеточия, скобки и отступы в указанной строке.';if(type.includes('Name'))return 'Использовано неизвестное имя. Проверьте опечатки, импорты и область видимости переменных.';if(type.includes('Attribute'))return 'У объекта нет такого атрибута или метода. Проверьте его тип: у set есть .add(), у dict — нет; для словаря событие читайте через event["id"].';if(type.includes('Key'))return 'В словаре нет запрошенного ключа. Проверьте точное имя поля и обработку отсутствующего ключа.';if(type.includes('Type'))return 'Операция получила неподходящий тип. Проследите типы значений от входа до возврата результата.';if(type.includes('Timeout'))return 'Выполнение заняло слишком много времени. Проверьте условие выхода из цикла и ожидание async-задач.';return `Начните с проверки «${fail.name}». Сначала разберите первую красную проверку и сообщение ошибки, затем переходите к следующим.`;}
