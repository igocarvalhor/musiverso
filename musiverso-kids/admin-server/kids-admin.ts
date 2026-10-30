// No browser key has administrative privileges. Every request is verified by Auth.
const allowedOrigins = new Set(['https://musiverso-kids.vercel.app', 'https://musiverso-kids.igocarvalhor.chatgpt.site']);
export async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin') || '';
  const headers: Record<string,string> = {'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'GET, OPTIONS'};
  if (allowedOrigins.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), {status,headers});
  if (origin && !allowedOrigins.has(origin)) return reply(403,{error:'Origem não autorizada.'});
  if (req.method === 'OPTIONS') return new Response(null,{status:204,headers});
  if (req.method !== 'GET') return reply(405,{error:'Método não permitido.'});
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
    const url = new URL(req.url);
    if (url.searchParams.get('action') === 'check') return reply(200,{admin:true});
    const page = Number(url.searchParams.get('page') || '1');
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000) return reply(400,{error:'Página inválida.'});
    const result = await fetch(base+'/auth/v1/admin/users?page='+page+'&per_page=50',{headers:{apikey:secret,Authorization:'Bearer '+secret}});
    if (!result.ok) return reply(502,{error:'Não foi possível consultar os usuários. Tente novamente.'});
    const payload = await result.json();
    const users = (payload.users || []).map((u: any) => ({id:u.id,email:u.email || '',name:u.user_metadata?.display_name || u.user_metadata?.full_name || '',created_at:u.created_at,last_sign_in_at:u.last_sign_in_at,email_confirmed:!!u.email_confirmed_at,providers:u.app_metadata?.providers || [],admin:u.app_metadata?.musiverso_kids_admin === true}));
    return reply(200,{users,page,has_more:users.length===50,scope:'shared_auth'});
  } catch { return reply(503,{error:'Falha temporária ao consultar o serviço.'}); }
}
Deno.serve(handler);
