module.exports=(q,s)=>{const fetch=require('node-fetch');const {URLSearchParams}=require('url');const p=new URLSearchParams();p.append('image',q.query.image);p.append('apiType','ai58,sougou');p.append('token','b3b46a4146e79d57c5d3227cdf949f0e');var j;fetch('https://www.hualigs.cn/api/upload',{method:'POST',body:p}).then(res=>res.json()).then(json=>j=json);s.status(200).json({url:j.data.url.ai58});};
