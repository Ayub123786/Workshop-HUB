import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured, readLocalStore, writeLocalStore } from '../utils/supabase.js';
import { randomUUID } from 'crypto';

function attachMethods(user) {
  if (!user) return null;
  const clone = { ...user, _id: user.id };

  clone.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, user.password_hash || user.passwordHash);
  };

  clone.toSafeObject = function () {
    const safe = { ...clone };
    delete safe.password_hash;
    delete safe.passwordHash;
    return safe;
  };

  return clone;
}

export default {
  async create(data) {
    const id = data.id || randomUUID();
    let password_hash = data.passwordHash || data.password_hash;
    if (password_hash && !password_hash.startsWith('$2')) {
      password_hash = await bcrypt.hash(password_hash, 10);
    }

    const record = {
      id,
      name: data.name,
      email: data.email.toLowerCase(),
      password_hash,
      role: data.role || 'editor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data: inserted, error } = await supabase
        .from('users')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return attachMethods(inserted);
    } else {
      const store = readLocalStore();
      store.users.push(record);
      writeLocalStore(store);
      return attachMethods(record);
    }
  },

  async findOne(query = {}) {
    if (isSupabaseConfigured) {
      let req = supabase.from('users').select('*');
      if (query.email) req = req.eq('email', query.email.toLowerCase());
      if (query.id) req = req.eq('id', query.id);
      if (query._id) req = req.eq('id', query._id);
      const { data, error } = await req.maybeSingle();
      if (error) throw error;
      return attachMethods(data);
    } else {
      const store = readLocalStore();
      const found = store.users.find((u) => {
        if (query.email && u.email.toLowerCase() !== query.email.toLowerCase()) return false;
        if (query.id && u.id !== query.id) return false;
        if (query._id && u.id !== query._id) return false;
        return true;
      });
      return attachMethods(found);
    }
  },

  async findById(id) {
    return this.findOne({ id });
  },

  async deleteMany() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    } else {
      const store = readLocalStore();
      store.users = [];
      writeLocalStore(store);
    }
    return { acknowledged: true };
  },
};
