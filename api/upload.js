module.exports=(q,s)=>{const p=new URLSearchParams();p.append('image',q.query.image);p.append('apiType','ai58,sougou');p.append('token','b3b46a4146e79d57c5d3227cdf949f0e');const fetch=require('node-fetch');fetch('https://www.hualigs.cn/api/upload',{method:'POST',body:p}).then(resp=>resp.json()).then(json=>s.status(200).json(json););};
