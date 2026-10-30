import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import bcrypt from 'bcryptjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteContent, MemoryCard } from './types';

export const DEFAULT_MEMORIES: MemoryCard[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
    title: 'أول نظرة بيننا.. بداية الحكاية 🌹',
    note: 'اليوم اللي شفتك فيه لأول مرة حسيت إن كل حاجة في حياتي ابتدت تتغير للأجمل.. عيونك كانت وستظل أجمل مكان أهرب له من كل الدنيا.'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    title: 'ضحكتك اللي بتنوّر دنيتي ✨',
    note: 'لما بتضحكي، الدنيا كلها بتنور في عيني.. ضحكتك دي بالنسبة لي حياة تانية وصوتك هو الأمان والسكينة لقلبي دايماً.'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    title: 'أيامنا وسوالفنا الحلوة 💌',
    note: 'كل دقيقة بنتكلم فيها بتعدي كأنها ثانية واحدة من حلاوتها.. تفاصيل يومك وكلماتك هي أحلى حاجة بتصبرني على بعدك.'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    title: 'وعد العمر والأيام الجاية 💍❤️',
    note: 'كل سنة وإنتي معايا وبجانبي، أوعدك أفضل أحبك وأسندك وأكون أمانك وضحكتك وسندك في كل خطوة في عمرنا وسنيننا الجاية كلها.'
  }
];

export const DEFAULT_MAIN_MESSAGE = `حبيبتي ونور عيوني وأغلى ما أملك في الوجود.. ❤️

في مثل هذا اليوم الجميل، أشرقت الدنيا بنورك وجيتي عشان تصيري أجمل قدر وأحلى صدفة وأغلى هدية ربي رزقني بيها.

من يوم ما دخلتي حياتي، وكل حاجة بقى ليها طعم ومعنى مختلف، بقيتي أنتي الأمان اللي بلجأ له، والفرحة اللي مستخبية في قلبي، والضحكة اللي بتطلع من روحي بصدق.

كل سنة وإنتي بنوتي المدللة، كل سنة وإنتي قمري اللي ما بيغيبش، وكل سنة وإنتي معايا وفي قلبي أقرب من روحي لنفسي.

عيد ميلاد سعيد يا ست البنات ويا أجمل حكاية عشتها وهعيشها طول العمر.. بحبك بعدد دقات قلبي وأكتر بكتير مما تتخيلي! ❤️✨`;

export const DEFAULT_DALAA = [
  'سُكرتي اللذيذة 🍬',
  'أميرتي الصغيرة 👑',
  'قمري المنور 🌙',
  'وتين قلبي ❤️',
  'روح الروح 🕊️',
  'طفلتي المدللة 🧸',
  'فراشتي الرقيقة 🦋',
  'نور حياتي ✨'
];

interface StoredData {
  content: SiteContent;
  passwordHash: string;
}

// In-memory runtime cache for high-speed access and serverless fallback
let inMemoryStore: StoredData | null = null;

function getDefaultData(): StoredData {
  return {
    content: {
      countdownGreeting: 'كل ثانية بتقربني من أجمل يوم.. يوم ميلاد أجمل إنسانة في حياتي ❤️',
      celebrationTitle: 'كل سنة وإنتي أجمل حاجة حصلتلي.. عيد ميلاد سعيد يا أجمل بنوتة في الدنيا ❤️',
      mainMessageTitle: 'رسالة من حبيبك ❤️',
      mainMessage: DEFAULT_MAIN_MESSAGE,
      memoriesTitle: 'ذكرياتنا سوا 📸❤️',
      memories: DEFAULT_MEMORIES,
      dalaaTitle: 'دلع بنوتي 🥰',
      dalaaWords: DEFAULT_DALAA,
      isUnlocked: false,
      targetDate: '2026-10-31T00:00:00+02:00',
      musicUrl: '/audio/romantic-melody.mp3',
    },
    // Default initial password is 2023 (bcrypt hash)
    passwordHash: bcrypt.hashSync('2023', 10),
  };
}

// Helper to get safe writable file path (handles local dev, VPS, and serverless read-only environments)
function getSafeStoragePath(): string | null {
  // Check local data directory first
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testPath = path.join(localDir, '.write-test');
    fs.writeFileSync(testPath, '1');
    fs.unlinkSync(testPath);
    return path.join(localDir, 'romantic_store.json');
  } catch {
    // Read-only filesystem (e.g. Vercel / Netlify serverless)
  }

  // Fallback to /tmp
  try {
    const tmpDir = path.join(os.tmpdir(), 'romantic-data');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return path.join(tmpDir, 'romantic_store.json');
  } catch (err) {
    console.warn('Failed to access tmp storage directory:', err);
    return null;
  }
}

function readLocalStorage(): StoredData {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  const filePath = getSafeStoragePath();
  if (filePath && fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.content && parsed.passwordHash) {
        inMemoryStore = parsed;
        return inMemoryStore!;
      }
    } catch (err) {
      console.warn('Error reading local JSON store:', err);
    }
  }

  inMemoryStore = getDefaultData();
  writeLocalStorage(inMemoryStore);
  return inMemoryStore;
}

function writeLocalStorage(data: StoredData): void {
  inMemoryStore = data;
  const filePath = getSafeStoragePath();
  if (filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not persist to disk, stored in memory:', err);
    }
  }
}

// Supabase client instance (if user provided credentials in env)
function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.warn('Supabase client creation error:', e);
    }
  }
  return null;
}

// -------------------------------------------------------------
// PUBLIC API FUNCTIONS
// -------------------------------------------------------------

export async function getSiteContent(): Promise<SiteContent> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      // 1. Fetch settings from Supabase
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('key, value');

      // 2. Fetch memories from Supabase
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('memories')
        .select('id, image, title, note, sort_order')
        .order('sort_order', { ascending: true });

      if (!settingsError && settingsData && settingsData.length > 0) {
        const settingsMap: Record<string, string> = {};
        settingsData.forEach((row: { key: string; value: string }) => {
          settingsMap[row.key] = row.value;
        });

        let dalaaWords = DEFAULT_DALAA;
        try {
          if (settingsMap.dalaaWords) {
            dalaaWords = JSON.parse(settingsMap.dalaaWords);
          }
        } catch {
          dalaaWords = DEFAULT_DALAA;
        }

        const memories: MemoryCard[] =
          memoriesData && memoriesData.length > 0
            ? (memoriesData as MemoryCard[])
            : DEFAULT_MEMORIES;

        return {
          countdownGreeting: settingsMap.countdownGreeting || 'كل ثانية بتقربني من أجمل يوم.. يوم ميلاد أجمل إنسانة في حياتي ❤️',
          celebrationTitle: settingsMap.celebrationTitle || 'كل سنة وإنتي أجمل حاجة حصلتلي.. عيد ميلاد سعيد يا أجمل بنوتة في الدنيا ❤️',
          mainMessageTitle: settingsMap.mainMessageTitle || 'رسالة من حبيبك ❤️',
          mainMessage: settingsMap.mainMessage || DEFAULT_MAIN_MESSAGE,
          memoriesTitle: settingsMap.memoriesTitle || 'ذكرياتنا سوا 📸❤️',
          memories: memories,
          dalaaTitle: settingsMap.dalaaTitle || 'دلع بنوتي 🥰',
          dalaaWords: dalaaWords,
          isUnlocked: settingsMap.isUnlocked === '1',
          targetDate: settingsMap.targetDate || '2026-10-31T00:00:00+02:00',
          musicUrl: settingsMap.musicUrl || '/audio/romantic-melody.mp3',
        };
      } else if (!settingsError && (!settingsData || settingsData.length === 0)) {
        // Tables exist but are empty -> initialize them in Supabase
        const defaultData = getDefaultData();
        await updateSiteContent(defaultData.content);
        return defaultData.content;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local store:', err);
    }
  }

  // Fallback to local storage
  const local = readLocalStorage();
  return local.content;
}

export async function updateSiteContent(content: Partial<SiteContent>): Promise<SiteContent> {
  const current = await getSiteContent();

  const updated: SiteContent = {
    ...current,
    ...content,
    memories: content.memories || current.memories,
    dalaaWords: content.dalaaWords || current.dalaaWords,
  };

  // 1. Update in Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const settingsEntries = [
        { key: 'countdownGreeting', value: updated.countdownGreeting },
        { key: 'celebrationTitle', value: updated.celebrationTitle },
        { key: 'mainMessageTitle', value: updated.mainMessageTitle },
        { key: 'mainMessage', value: updated.mainMessage },
        { key: 'memoriesTitle', value: updated.memoriesTitle },
        { key: 'dalaaTitle', value: updated.dalaaTitle },
        { key: 'dalaaWords', value: JSON.stringify(updated.dalaaWords) },
        { key: 'isUnlocked', value: updated.isUnlocked ? '1' : '0' },
        { key: 'targetDate', value: updated.targetDate },
        { key: 'musicUrl', value: updated.musicUrl || '/audio/romantic-melody.mp3' },
      ];

      for (const entry of settingsEntries) {
        await supabase.from('site_settings').upsert(entry, { onConflict: 'key' });
      }

      if (updated.memories && Array.isArray(updated.memories)) {
        for (let i = 0; i < updated.memories.length; i++) {
          const m = updated.memories[i];
          await supabase.from('memories').upsert({
            id: m.id || i + 1,
            image: m.image || '',
            title: m.title || '',
            note: m.note || '',
            sort_order: i,
          }, { onConflict: 'id' });
        }
      }
    } catch (err) {
      console.warn('Supabase update warning, falling back to local:', err);
    }
  }

  // 2. Always persist locally as well
  const local = readLocalStorage();
  local.content = updated;
  writeLocalStorage(local);

  return updated;
}

export async function unlockSurprise(): Promise<boolean> {
  return (await updateSiteContent({ isUnlocked: true })).isUnlocked;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_auth')
        .select('password_hash')
        .eq('id', 1)
        .single();

      if (!error && data && data.password_hash) {
        return bcrypt.compareSync(password, data.password_hash);
      } else if (!error && !data) {
        // Initialize default password in Supabase
        const initialHash = bcrypt.hashSync('2023', 10);
        await supabase.from('admin_auth').upsert({
          id: 1,
          password_hash: initialHash,
          updated_at: new Date().toISOString(),
        });
        return bcrypt.compareSync(password, initialHash);
      }
    } catch (err) {
      console.warn('Supabase auth verification failed, using local store:', err);
    }
  }

  const local = readLocalStorage();
  return bcrypt.compareSync(password, local.passwordHash);
}

export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('admin_auth').upsert({
        id: 1,
        password_hash: newHash,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase password update failed, using local store:', err);
    }
  }

  const local = readLocalStorage();
  local.passwordHash = newHash;
  writeLocalStorage(local);

  return true;
}
