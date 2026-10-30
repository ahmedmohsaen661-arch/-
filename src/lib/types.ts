export interface MemoryCard {
  id: number;
  image: string;
  title: string;
  note: string;
}

export interface SiteContent {
  countdownGreeting: string; // "كل ثانية بتقربني من أجمل يوم.. يوم ميلاد أجمل إنسانة في حياتي ❤️"
  celebrationTitle: string; // "كل سنة وإنتي أجمل حاجة حصلتلي.. عيد ميلاد سعيد يا أجمل بنوتة في الدنيا ❤️"
  mainMessageTitle: string; // "رسالة من حبيبك ❤️"
  mainMessage: string; // The love letter text
  memoriesTitle: string; // "ذكرياتنا سوا 📸❤️"
  memories: MemoryCard[];
  dalaaTitle: string; // "دلع بنوتي 🥰"
  dalaaWords: string[]; // List of sweet nicknames
  isUnlocked: boolean; // Permanent database flag
  targetDate: string; // Target ISO date: '2026-10-31T00:00:00+02:00'
  musicUrl?: string; // Optional custom music URL
}

export interface AdminSession {
  authenticated: boolean;
  username: string;
}

