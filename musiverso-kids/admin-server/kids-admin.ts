// No browser key has administrative privileges. Every request is verified by Auth.
const allowedOrigins = new Set(['https://musiverso-kids.vercel.app', 'https://musiverso-kids.igocarvalhor.chatgpt.site']);
export async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin') || '';
  const headers: Record<string,string> = {'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS'};
  if (allowedOrigins.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), {status,headers});
  if (origin && !allowedOrigins.has(origin)) return reply(403,{error:'Origem não autorizada.'});
  if (req.method === 'OPTIONS') return new Response(null,{status:204,headers});
  if (!['GET','POST','DELETE'].includes(req.method)) return reply(405,{error:'Método não permitido.'});
  const authorization = req.headers.get('authorization') || '';
  if (!/^Bearer \S+$/i.test(authorization)) return reply(401,{error:'Entre na sua conta para continuar.'});
  const base = Deno.env.get('SUPABASE_URL');
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || !secret) return reply(503,{error:'Serviço administrativo indisponível.'});
  try {
    const identity = await fetch(base+'/auth/v1/user',{headers:{apikey:secret,Authorization:authorization}});
    if (!identity.ok) return reply(401,{error:'Sua sessão expirou. Entre novamente.'});
    const user = await identity.json();
    // Read fresh, server-controlled app_metadata; never trust user_metadata or decoded JWTs.
    if (!user.id || user.app_metadata?.musiverso_kids_admin !== true) return reply(403,{error:'Acesso exclusivo do administrador.'});
    const adminHeaders = {apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'};
    if (req.method === 'POST' || req.method === 'DELETE') {
      const raw = await req.text();
      if(raw.length>10000) return reply(413,{error:'Solicitação muito grande.'});
      let body: any;try{body=JSON.parse(raw)}catch{return reply(400,{error:'Dados inválidos.'})}
      if(req.method==='POST'){
        const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
        const name=typeof body.name==='string'?body.name.trim():'';
        const password=typeof body.password==='string'?body.password:'';
        if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254||name.length<2||name.length>100||password.length<8||password.length>128)return reply(400,{error:'Informe nome, e-mail válido e senha com 8 a 128 caracteres.'});
        const created=await fetch(base+'/auth/v1/admin/users',{method:'POST',headers:adminHeaders,body:JSON.stringify({email,password,email_confirm:true,user_metadata:{display_name:name},app_metadata:{musiverso_kids_account:true}})});
        if(!created.ok){const detail=await created.json().catch(()=>({}));return reply(created.status===422||created.status===400?400:502,{error:detail.code==='email_exists'||detail.error_code==='email_exists'?'Este e-mail já possui uma conta.':'Não foi possível criar a conta. Confira se o e-mail já está cadastrado e se a senha atende às regras.'})}
        const account=await created.json();return reply(201,{message:'Conta criada. O usuário já pode entrar com e-mail e senha.',user:{id:account.id,email:account.email}});
      }
      const targetId=typeof body.user_id==='string'?body.user_id:'';
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId))return reply(400,{error:'Conta inválida.'});
      if(targetId===user.id)return reply(403,{error:'Sua própria conta administradora não pode ser excluída.'});
      const targetResponse=await fetch(base+'/auth/v1/admin/users/'+targetId,{headers:adminHeaders});
      if(!targetResponse.ok)return reply(targetResponse.status===404?404:502,{error:'Não foi possível localizar a conta.'});
      const target=await targetResponse.json();
      if(target.app_metadata?.musiverso_kids_admin===true)return reply(403,{error:'Contas administradoras não podem ser excluídas pelo painel.'});
      if(target.app_metadata?.musiverso_kids_account!==true){
        const lookup=await fetch(base+'/rest/v1/kids_progress?select=user_id&user_id=eq.'+targetId+'&limit=1',{headers:adminHeaders});
        if(!lookup.ok)return reply(502,{error:'Não foi possível verificar os dados da conta.'});
        if(!(await lookup.json()).length)return reply(403,{error:'Esta conta pertence ao serviço compartilhado e ainda não está identificada como usuária do Kids.'});
      }
      const removed=await fetch(base+'/auth/v1/admin/users/'+targetId,{method:'DELETE',headers:adminHeaders,body:JSON.stringify({should_soft_delete:false})});
      if(!removed.ok)return reply(502,{error:'Não foi possível excluir a conta. Verifique se há arquivos ou vínculos em outros aplicativos.'});
      return reply(200,{message:'Conta excluída.'});
    }
    const url = new URL(req.url);
    if (url.searchParams.get('action') === 'check') return reply(200,{admin:true});
    const page = Number(url.searchParams.get('page') || '1');
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000) return reply(400,{error:'Página inválida.'});
    const result = await fetch(base+'/auth/v1/admin/users?page='+page+'&per_page=50',{headers:{apikey:secret,Authorization:'Bearer '+secret}});
    if (!result.ok) return reply(502,{error:'Não foi possível consultar os usuários. Tente novamente.'});
    const payload = await result.json();
    const accounts=payload.users||[];
    let progress: any[]=[];
    if(accounts.length){
      const ids=accounts.map((u:any)=>u.id).filter((id:string)=>/^[0-9a-f-]{36}$/i.test(id));
      const summary=await fetch(base+'/rest/v1/kids_progress?select=user_id,progress,updated_at&user_id=in.('+ids.join(',')+')',{headers:adminHeaders});
      if(!summary.ok)return reply(502,{error:'Não foi possível consultar o progresso das contas.'});
      progress=await summary.json();
    }
    const users = accounts.map((u: any) => {const p=progress.find((v:any)=>v.user_id===u.id);return {id:u.id,email:u.email || '',name:u.user_metadata?.display_name || u.user_metadata?.full_name || '',created_at:u.created_at,last_sign_in_at:u.last_sign_in_at,email_confirmed:!!u.email_confirmed_at,providers:u.app_metadata?.providers || [],admin:u.app_metadata?.musiverso_kids_admin === true,kids_account:!!p||u.app_metadata?.musiverso_kids_account===true,progress:p?{xp:Number(p.progress?.xp)||0,chapters:Array.isArray(p.progress?.done)?p.progress.done.length:0,saved_at:p.updated_at}:null}});
    return reply(200,{users,page,has_more:users.length===50,scope:'shared_auth'});
  } catch { return reply(503,{error:'Falha temporária ao consultar o serviço.'}); }
}
Deno.serve(handler);
