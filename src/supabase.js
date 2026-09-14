import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);

export async function getRows(table, options={}) {
  let q = supabase.from(table).select(options.select || '*');
  if (options.order) q = q.order(options.order, {ascending: options.ascending ?? false});
  if (options.limit) q = q.limit(options.limit);
  if (options.eq) for (const [k,v] of Object.entries(options.eq)) q = q.eq(k,v);
  const {data,error}=await q;
  if(error) throw error;
  return data || [];
}

export function publicStorageUrl(path) {
  if(!path) return '';
  const {data}=supabase.storage.from('research-media').getPublicUrl(path);
  return data.publicUrl;
}
