module.exports=(q,s)=>{if(/^[0-9]+$/.test(q.query.mid)){const F=require('node-fetch');F(`https://api.bilibili.com/x/space/acc/info?mid=${q.query.mid}`).then(r=>r.json()).then(function(j){if(q.query.type=='1'){var h;if(j.code==0){F(j.data.face).then(function(i){h=i.headers.get('Content-Type');return i.buffer();}).then(b=>s.setHeader('Content-Type',h).status(200).send(b));}else{F('http://i0.hdslb.com/bfs/face/member/noface.jpg').then(i=>i.buffer()).then(b=>s.setHeader('Content-Type','image/jpg').status(404).send(b))};}else if(i.code==0){s.status(200).json({code:0,data:{name:j.data.name,face:j.data.face}});}else{s.status(404).json({code:404});};});}else{s.status(400).json({code:400})};};
