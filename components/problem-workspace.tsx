"use client";
import {useEffect,useState,type ReactNode} from 'react';
import {ResizablePanelGroup,ResizablePanel,ResizableHandle} from '@/components/ui/resizable';
export function ProblemWorkspace({children}:{children:[ReactNode,ReactNode]}){
 const [wide,setWide]=useState(false);
 useEffect(()=>{const mq=matchMedia('(min-width: 1000px)');const update=()=>setWide(mq.matches);update();mq.addEventListener('change',update);return()=>mq.removeEventListener('change',update);},[]);
 if(!wide)return <div className="workspace problem-workspace">{children}</div>;
 return <ResizablePanelGroup orientation="horizontal" className="workspace problem-workspace"><ResizablePanel defaultSize="42%" minSize="28%">{children[0]}</ResizablePanel><ResizableHandle withHandle/><ResizablePanel defaultSize="58%" minSize="35%">{children[1]}</ResizablePanel></ResizablePanelGroup>;
}
