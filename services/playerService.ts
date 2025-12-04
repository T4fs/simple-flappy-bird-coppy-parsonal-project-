import { PlayerProfile } from '../types';

export const getPlayerIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn("Could not fetch IP, using fallback");
    return `Guest-${Math.floor(Math.random() * 10000)}`;
  }
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

export const getLeaderboard = (playerIp: string, playerScore: number) => {
    // Simulate a leaderboard since we have no DB
    const base = [
        { name: '104.22.54.11', score: 102 },
        { name: '192.168.1.5', score: 89 },
        { name: '203.0.113.42', score: 76 },
        { name: '172.16.254.1', score: 45 },
    ];
    
    // Inject player if score is good
    const all = [...base, { name: playerIp || 'You', score: playerScore }];
    return all.sort((a, b) => b.score - a.score).slice(0, 5);
};