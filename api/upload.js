module.exports=(q,s)=>{const d=new FormData();d.append('image',q.query.image);d.append('apiType','ai58,sougou');d.append('token','b3b46a4146e79d57c5d3227cdf949f0e');var x;fetch('https://www.hualigs.cn/api/upload',{method:'POST',body:d}).then(function(r){return r.json();}).then(function(j){x=j;});s.status(200).json({url:x.data.url.ai58});};
