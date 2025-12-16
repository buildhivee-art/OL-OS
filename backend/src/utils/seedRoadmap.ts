import Roadmap from '../models/Roadmap';
import User from '../models/User';

export const seedRoadmap = async () => {
  try {
    const count = await Roadmap.countDocuments();
    if (count > 0) {
        console.log('Roadmap already seeded.');
        return;
    }

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        console.log('No admin found to seed roadmap items.');
        return;
    }

    const items = [
        // FEATURES (Planned)
        {
            title: 'Spotify Integration',
            description: 'Connect Spotify API to control focus playlists directly from the Deep Work module.',
            status: 'planned',
            priority: 'high',
            type: 'feature'
        },
        {
            title: 'AI Journal Analysis',
            description: 'Use LLM to analyze daily journal entries and provide weekly psychological insights.',
            status: 'planned',
            priority: 'medium',
            type: 'feature'
        },
        {
            title: 'Sleep Tracker Sync',
            description: 'Integrate with Oura Ring or Apple Health for sleep metrics.',
            status: 'planned',
            priority: 'medium',
            type: 'feature'
        },
        
        // IN PROGRESS (Active)
        {
            title: 'Mobile App React Native',
            description: 'Porting the web dashboard to a native iOS/Android application.',
            status: 'in-progress',
            priority: 'critical',
            type: 'feature'
        },
        {
            title: 'Gamification V2: Badges',
            description: 'Designing new 3D badges for milestone achievements.',
            status: 'in-progress',
            priority: 'high',
            type: 'enhancement'
        },
        
        // COMPLETED (Deployed)
        {
            title: 'Dark Mode Implementation',
            description: 'System-wide dark mode with OLED black support.',
            status: 'completed',
            priority: 'high',
            type: 'enhancement'
        },
        {
            title: 'Initial Server Setup',
            description: 'Deploy backend on smooth, scalable infrastructure.',
            status: 'completed',
            priority: 'critical',
            type: 'feature'
        },

        // BUGS
        {
            title: 'Fix: Mobile Sidebar Scroll',
            description: 'Sidebar gets stuck on iPhone 14 Pro Max landscape mode.',
            status: 'planned',
            priority: 'low',
            type: 'bug'
        },
        {
            title: 'Calendar Sync Delay',
            description: 'Google Calendar events take 5 mins to appear.',
            status: 'in-progress',
            priority: 'medium',
            type: 'bug'
        },
        
        // ENHANCEMENTS
        {
            title: 'Faster Dashboard Loading',
            description: 'Optimize MongoDB queries to reduce load time by 40%.',
            status: 'planned',
            priority: 'high',
            type: 'enhancement'
        },
        {
            title: 'Interactive Heatmap',
            description: 'Add GitHub-style contribution graph for habit consistency.',
            status: 'planned',
            priority: 'medium',
            type: 'enhancement'
        }
    ];

    const seededItems = items.map(item => ({ ...item, user: admin._id }));
    await Roadmap.insertMany(seededItems);
    console.log('Roadmap seeded with 11 sample protocols.');

  } catch (error) {
    console.error('Error seeding roadmap:', error);
  }
};
