module.exports=(q,s)=>{const F=require('node-fetch');F(`https://api.bilibili.com/x/space/acc/info?mid=${q.query.mid}`,{method:'GET'}).then(r=>r.json()).then(j=>(function(){if(q.query.type=='1'){F(j.data.face,{method:'GET'}).then(i=>i.blob()).then(d=>s.status(200).send(d))}else{s.status(200).json(j)};})());};
