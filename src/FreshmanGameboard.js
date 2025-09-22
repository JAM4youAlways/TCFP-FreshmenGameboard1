import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const defaultTiles = [
  'Complete assessments','Create a Binder or Folder','Explore: Interests and Careers','Read and Build Vocabulary 1','Strengthen your future college application',
  'Get Involved at School','Read and Build Vocabulary 2','Volunteer and Give Back','Build Your Resume','Plan for Summer Opportunities',
  'Passion Project 1: Learn','Passion Project 2: Brainstorm','Passion Project 3: Choose','Stay Informed','Read and Build Vocabulary 3',
  'PSAT Prep','AP Prep','Organize Study Space','Create Personal Action Plan','Bonus: Add your counselor to contacts'
];

const tileBadges = ['📋','🗂️','🧭','📚','🏛️','🤝','🧠','❤️','🧾','🌞','🔥','💡','✅','📰','🔤','📝','📈','📚','🗺️','📱'];

function simpleCSVparse(csvText){
  const lines=csvText.trim().split('\n');
  return lines.map(l=>l.split(','));
}

export default function FreshmanGameboard(){
  const [sheetLink,setSheetLink]=useState(localStorage.getItem('counselorSheetLink')||'');
  const [showModal,setShowModal]=useState(false);  // default = hidden
  const [students,setStudents]=useState([]);
  const [selectedStudentIndex,setSelectedStudentIndex]=useState(null);
  const [inputCode,setInputCode]=useState('');
  const [error,setError]=useState('');
  const [lastLoaded,setLastLoaded]=useState(null);

  // Only allow Settings popup if ?setup=true is in the URL
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    if(params.get("setup")==="true"){
      setShowModal(true);
    }
  },[]);

  useEffect(()=>{ if(sheetLink) fetchAndLoad(sheetLink); },[sheetLink]);

  async function fetchAndLoad(link){
    try{
      const res=await fetch(link);
      if(!res.ok) throw new Error('Fetch failed');
      const text=await res.text();
      const rows=simpleCSVparse(text);
      const header=rows[0].map(h=>h.trim());
      const nameCol=header.findIndex(h=>/student name/i.test(h));
      const tileCols=header.map((h,i)=>({h,i})).filter(x=>/tile\s*\d+/i.test(x.h));
      const studentRows=rows.slice(1).map(r=>{
        const name=(r[nameCol]||'').trim();
        const codes=tileCols.map(tc=>(r[tc.i]||'').trim());
        return {name,codes};
      }).filter(s=>s.name);
      setStudents(studentRows);
      setSelectedStudentIndex(studentRows.length?0:null);
      localStorage.setItem('counselorSheetLink',link);
      setLastLoaded(new Date().toLocaleString());
    }catch(e){
      alert('Error loading sheet. Ensure you used Google Sheets Publish as CSV link.');
      console.error(e);
    }
  }

  function storageKeyFor(studentName){ return `unlocked|${sheetLink}|${studentName}`; }

  function handleUnlockTile(index){
    setError('');
    if(selectedStudentIndex===null){ setError('Select a student first'); return; }
    const student=students[selectedStudentIndex];
    const expected=(student.codes[index]||'').trim();
    if(!expected){ setError('No code set for this tile for this student.'); return; }
    if(inputCode.trim()===expected){
      const key=storageKeyFor(student.name);
      let arr=JSON.parse(localStorage.getItem(key)||'[]');
      arr[index]=true;
      localStorage.setItem(key,JSON.stringify(arr));
      setInputCode('');
    } else {
      setError('Incorrect code.');
    }
  }

  function isTileUnlocked(index){
    if(selectedStudentIndex===null) return false;
    const key=storageKeyFor(students[selectedStudentIndex].name);
    const raw=localStorage.getItem(key);
    if(!raw) return false;
    const arr=JSON.parse(raw);
    return !!arr[index];
  }

  return (
    <div style={{padding:20,maxWidth:1100,margin:'0 auto',fontFamily:'Arial,sans-serif'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>🎲 Freshman Gameboard (Grid)</h1>
        <div style={{textAlign:'right'}}>
          {lastLoaded && <div style={{fontSize:12,color:'#555'}}>Sheet loaded: {lastLoaded}</div>}
          {/* Only counselors with ?setup=true can see this button */}
          {showModal && (
            <button onClick={()=>setShowModal(true)} style={{padding:'6px 10px'}}>⚙️ Settings</button>
          )}
        </div>
      </header>

      <section style={{marginTop:12}}>
        {students.length>0 && (
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:6}}>Select student</label>
            <select value={selectedStudentIndex ?? ''} onChange={e=>{ setSelectedStudentIndex(parseInt(e.target.value)); setError(''); }} style={{ padding:8 }}>
              {students.map((s,idx)=>(<option key={idx} value={idx}>{s.name}</option>))}
            </select>
          </div>
        )}

        <div style={{marginBottom:12,display:'flex',gap:8,alignItems:'center'}}>
          <input placeholder='Enter tile code here' value={inputCode} onChange={e=>setInputCode(e.target.value)} style={{padding:8,flex:1}} />
          <div style={{fontSize:12,color:'red'}}>{error}</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
          { defaultTiles.map((label,idx)=>{
            const unlocked=isTileUnlocked(idx);
            return (
              <motion.div key={idx} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:idx*0.03}}>
                <div style={{background:unlocked? '#fffbe6':'#f1f5f9',borderRadius:12,padding:12,minHeight:110,display:'flex',flexDirection:'column',justifyContent:'space-between',alignItems:'center',textAlign:'center'}}>
                  <div style={{fontSize:14,fontWeight:600}}>{label}</div>
                  <div style={{fontSize:28,marginTop:6}}>{ unlocked ? tileBadges[idx] : '🔒' }</div>
                  <div style={{marginTop:8,width:'100%'}}>
                    { unlocked ? <div style={{fontSize:12,color:'#007700'}}>Completed</div> 
                    : <button onClick={()=>{handleUnlockTile(idx)}} style={{padding:'6px 8px',width:'100%'}}>Unlock with entered code</button> }
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {showModal && (
        <div style={{position:'fixed',left:0,right:0,top:0,bottom:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:20,borderRadius:8,maxWidth:760,width:'95%'}}>
            <h2>Setup: Counselor Sheet (only visible with ?setup=true)</h2>
            <ol>
              <li>In Google Sheets: File → Share → Publish to web → choose <strong>CSV</strong>.</li>
              <li>Copy the link and paste it below.</li>
            </ol>
            <div style={{marginTop:8}}>
              <input placeholder='Paste CSV link here' value={sheetLink} onChange={e=>setSheetLink(e.target.value)} style={{width:'100%',padding:8}} />
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button onClick={()=>{ if(sheetLink) fetchAndLoad(sheetLink); }} style={{padding:'8px 12px'}}>Save & Load</button>
                <button onClick={()=>{ setShowModal(false); }}>Close</button>
                <button onClick={()=>{ localStorage.removeItem('counselorSheetLink'); setSheetLink(''); setStudents([]); setSelectedStudentIndex(null); setShowModal(true); }} style={{marginLeft:'auto'}}>Reset</button>
              </div>
            </div>
            <p style={{marginTop:12,fontSize:13,color:'#555'}}>
              <strong>Note:</strong> Your sheet must include column headers like: 
              <em> Student Name, Tile 1, Tile 2, ... Tile 20 </em>.
            </p>
          </div>
        </div>
      )}

      <footer style={{marginTop:20,fontSize:12,color:'#666'}}>
        Need help? Ask me to generate your counselor CSV template with Tile columns.
      </footer>
    </div>
  );
}
