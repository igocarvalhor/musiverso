/* Authorization comes from RLS-protected approvals, never editable user metadata. */
(()=>{
 let status='student',allowed=false;
 async function load(client,user){
  allowed=false;status='student';
  try{
   if(user?.app_metadata?.musiverso_kids_admin===true){allowed=true;status='admin';return status}
   const {data,error}=await client.from('kids_teacher_access').select('status').eq('user_id',user.id).maybeSingle();
   if(error)throw error;status=data?.status||'student';allowed=status==='approved';return status;
  }catch{status='unavailable';return status}
 }
 async function request(client,user){
  const {error}=await client.from('kids_teacher_access').insert({user_id:user.id,status:'pending'});
  if(error&&error.code!=='23505')throw error;
  return load(client,user);
 }
 window.MusiversoRole={load,request,get canTeach(){return allowed},get status(){return status}};
})();
