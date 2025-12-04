
import { PlayerProfile } from '../types';

export const getStoredUsername = (): string | null => {
  return localStorage.getItem('flappy-genai-username');
};

export const setStoredUsername = (username: string): void => {
  localStorage.setItem('flappy-genai-username', username);
};

export const syncToGoogleDrive = async (data: any): Promise<boolean> => {
    // Simulate network latency for Drive API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app with OAuth, we would use:
    // gapi.client.drive.files.create({ ... })
    
    // For this simulation/demo without a backend DB:
    // We save to a special LocalStorage key that represents "Cloud Cache"
    try {
        localStorage.setItem('flappy-genai-cloud-backup', JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));
        return true;
    } catch (e) {
        return false;
    }
};

export const getLeaderboard = (playerName: string, playerScore: number) => {
    // Simulate a leaderboard since we have no DB
    const base = [
        { name: 'SkyWalker99', score: 102 },
        { name: 'BirdMaster', score: 89 },
        { name: 'FlapKing', score: 76 },
        { name: 'NoobSlayer', score: 45 },
    ];
    
    // Inject player if score is good
    const all = [...base, { name: playerName || 'You', score: playerScore }];
    // Remove duplicates if player name matches base
    const unique = all.filter((v,i,a)=>a.findIndex(t=>(t.name===v.name))===i);
    
    return unique.sort((a, b) => b.score - a.score).slice(0, 5);
};
