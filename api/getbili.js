module.exports=(q,s)=>{const F=require('node-fetch');F(`https://api.bilibili.com/x/space/acc/info?mid=${q.query.mid}`,{method:'GET'}).then(r=>r.json()).then(function(j){if(q.query.type=='1'){F(j.data.face,{method:'GET'}).then(i=>i.buffer()).then(b=>s.status(200).send(b));}else{s.status(200).json({code:j.code,data:{name:j.data.name,face:j.data.face}})};});};
