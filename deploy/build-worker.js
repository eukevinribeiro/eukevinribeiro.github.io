const fs=require('fs');
const idx=fs.readFileSync(__dirname+'/../index.html','utf8'), nf=fs.readFileSync(__dirname+'/../404.html','utf8'), og=fs.readFileSync(__dirname+'/../og.png').toString('base64');
const js=`// Gerado por build.js: serve o site estático a partir de um único módulo.
const INDEX=${JSON.stringify(idx)};
const NOTFOUND=${JSON.stringify(nf)};
const OG=Uint8Array.from(atob(${JSON.stringify(og)}),c=>c.charCodeAt(0));
const SEC={'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
function res(body,type,status,cache,head){return new Response(head?null:body,{status,headers:{...SEC,'Content-Type':type,'Cache-Control':cache}});}
export default {fetch(req){
  const u=new URL(req.url), p=u.pathname, head=req.method==='HEAD';
  if(req.method!=='GET'&&!head)return new Response('Method Not Allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  if(p==='/index.html')return Response.redirect(u.origin+'/',301);
  if(p==='/')return res(INDEX,'text/html; charset=utf-8',200,'public, max-age=0, must-revalidate',head);
  if(p==='/og.png')return res(OG,'image/png',200,'public, max-age=86400',head);
  return res(NOTFOUND,'text/html; charset=utf-8',404,'no-store',head);
}};
`;
fs.writeFileSync(__dirname+'/_worker.js',js);console.log(js.length);
