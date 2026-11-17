import {useRef,useState} from 'react';
import {commitDesign,createHistory,redoDesign,undoDesign} from './model';
import type {Design} from './model';
export function useDesignHistory(){
 const [history,setHistory]=useState(createHistory);const ref=useRef(history);const [draft,setDraft]=useState<Design|null>(null);const draftRef=useRef<Design|null>(null);
 const preview=(next:Design)=>{draftRef.current=next;setDraft(next);};
 const commit=(next?:Design)=>{const value=next||draftRef.current;if(value){ref.current=commitDesign(ref.current,value);setHistory(ref.current);}draftRef.current=null;setDraft(null);};
 const cancel=()=>{draftRef.current=null;setDraft(null);};
 const undo=()=>{cancel();ref.current=undoDesign(ref.current);setHistory(ref.current);};
 const redo=()=>{cancel();ref.current=redoDesign(ref.current);setHistory(ref.current);};
 const clear=()=>{cancel();ref.current=createHistory();setHistory(ref.current);};
 return {design:draft||history.present,preview,commit,cancel,undo,redo,clear,canUndo:history.past.length>0,canRedo:history.future.length>0};
}
