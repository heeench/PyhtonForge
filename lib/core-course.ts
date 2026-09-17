import data from './core-course.json';
import type {Entry} from './training';
export const coreUnits=data.units;
export const coreTasks=data.tasks;
export type CoreUnit=typeof coreUnits[number];
export function independentRuns(ids:string[],entries:Entry[]){
 return entries.filter(e=>ids.includes(e.task)&&e.kind==='run'&&e.passed&&e.hints===0&&!e.assisted&&!entries.some(h=>h.session===e.session&&h.kind==='hint'));
}
export function coreProgress(unit:CoreUnit,entries:Entry[],now=Date.now()){
 const runs=independentRuns([...unit.taskIds,unit.id+'-review'],entries).sort((a,b)=>a.time-b.time);
 const solved=unit.taskIds.filter(id=>runs.some(e=>e.task===id));
 const allSolved=solved.length===unit.taskIds.length;
 const completedAt=allSolved?Math.max(...unit.taskIds.map(id=>runs.find(e=>e.task===id)!.time)):0;
 const repeated=allSolved&&runs.some(e=>e.time>=completedAt+86400000&&(e.task===unit.id+'-review'||runs.some(old=>old.task===e.task&&old.session!==e.session&&old.time<=completedAt)));
 const started=entries.some(e=>unit.taskIds.includes(e.task));
 const status=repeated?'mastered':started?'learning':'upcoming';
 const due=allSolved&&!repeated&&now>=completedAt+86400000;
 return {status,solved:solved.length,total:unit.taskIds.length,allSolved,repeated,due,reviewAt:completedAt?completedAt+86400000:0,nextTask:unit.taskIds.find(id=>!solved.includes(id))||unit.id+'-review'} as const;
}
export function nextCoreTask(entries:Entry[],exclude='',now=Date.now()){
 const due=coreUnits.find(u=>coreProgress(u,entries,now).due&&coreProgress(u,entries,now).nextTask!==exclude);
 if(due)return {id:coreProgress(due,entries,now).nextTask,reason:`Повторение «${due.title}»: решите новую задачу на тот же навык спустя минимум сутки без подсказок.`};
 for(const u of coreUnits){const wins=independentRuns(u.taskIds,entries);const id=u.taskIds.find(id=>id!==exclude&&!wins.some(e=>e.task===id));if(id)return {id,reason:`Python core · ${u.title}. ${u.taskIds.indexOf(id)+1} из 3 упражнений блока.`};}
 return null;
}
