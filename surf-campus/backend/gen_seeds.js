// Generate seed JSON from frontend demo.js mock data
// Run: node gen_seeds.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

// Read demo.js and extract just the DATA section
const js = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'demo.js'), 'utf-8');
const dataStart = js.indexOf('/* ═══ DATA ═══ */');
const dataEnd = js.indexOf('/* ═══ STATE ═══ */');
const dataSection = js.substring(dataStart, dataEnd);

// Provide stubs then eval data section
const stubs = `var $=()=>null;var escapeHTML=s=>String(s??'');var h=s=>String(s??'');var toast=()=>{};var refreshIcons=()=>{};var formatTime=v=>v;var isWithinDays=()=>true;var isInTimeRange=()=>true;var getDayGroupKey=()=>'zzz';var getDayGroupLabel=()=>'';var formatNotifTime=()=>'';var postAvatar=()=>'';var stateBlock=()=>'';var pageHeader=()=>'';`;

try {
  const code = stubs + '\n' + dataSection + '\n;return {MOCK_POSTS,MOCK_NOTIFICATIONS,MOCK_RESOURCES,MOCK_QUESTIONS,MOCK_DIRECTORY,ME_PROFILE,ME_RESUMES,MOCK_GROUPS,MOCK_TREEHOLES,DEMO_OPPORTUNITIES,DEMO_EVENTS,UPCOMING_COMPETITIONS,PROFESSORS,MOCK_TEACHERS,FACULTY_COURSES_MAP,MOCK_MSGS,DANMU_PRESET,DANMU_BANNED,SECTION_META,OPP_CATEGORIES,SUB_CATEGORIES,CAT_ICONS,ROLE_TYPES,COLLAB_MODES,EVENT_CATEGORIES,CONTACT_TEACHER_MAP};';
  const fn = new Function(code);
  const data = fn();

  function save(filename, obj) {
    const filepath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(obj, null, 2), 'utf-8');
    const count = Array.isArray(obj) ? obj.length :
      (obj.posts ? obj.posts.length :
        obj.events ? obj.events.length :
        obj.users ? obj.users.length :
        obj.conversations ? obj.conversations.length :
        obj.groups ? obj.groups.length :
        Object.keys(obj).length);
    console.log(`  ${filename}: ${count} records`);
  }

  console.log('Generating seed JSON files...');

  // 1. posts.json
  save('posts.json', { posts: data.MOCK_POSTS });

  // 2. courses.json (resources + qa + courses catalog)
  const courses = [
    {id:'c1',code:'CSE101',name:'程序设计基础',year:'Year 1',term:'Semester 2',major:'ICS',credits:4,instructor:'Prof. Li'},
    {id:'c2',code:'MTH008',name:'微积分',year:'Year 1',term:'Semester 1',major:'MTH',credits:5,instructor:'Prof. Chen'},
    {id:'c3',code:'INT305',name:'机器学习导论',year:'Year 3',term:'Semester 1',major:'ICS',credits:4,instructor:'Prof. Zhang'},
    {id:'c4',code:'EAP023',name:'学术英语',year:'Year 2',term:'Semester 1',major:'All',credits:3,instructor:'EAP中心'},
    {id:'c5',code:'CST201',name:'数据结构与算法',year:'Year 2',term:'Semester 1',major:'CST',credits:4,instructor:'Prof. Wang'},
    {id:'c6',code:'DMT101',name:'数字媒体基础',year:'Year 1',term:'Semester 2',major:'DMT',credits:3,instructor:'Prof. Liu'},
  ];
  save('courses.json', { resources: data.MOCK_RESOURCES, qa: data.MOCK_QUESTIONS, courses });

  // 3. users.json
  const me = {id:'u001',name:'张三',username:'张三',role:'student',department:'计算机科学与技术',year:'大三',tags:['AI/机器学习','竞赛选手','ACM'],email:'zhangsan@student.xjtlu.edu.cn',avatar:'sun',profile_complete:true,bio:'计算机科学·大三 | 喜欢AI和开源 | 竞赛选手'};
  const allUsers = [me, ...data.MOCK_DIRECTORY.filter(u => u.id !== 'u001')];
  save('users.json', { users: allUsers });

  // 4. events.json
  save('events.json', { events: data.DEMO_EVENTS, clubs: [] });

  // 5. opportunities.json
  save('opportunities.json', { opportunities: data.DEMO_OPPORTUNITIES });

  // 6. treeholes.json
  save('treeholes.json', { posts: data.MOCK_TREEHOLES });

  // 7. messages.json
  save('messages.json', { conversations: data.MOCK_MSGS, notifications: data.MOCK_NOTIFICATIONS });

  // 8. groups.json
  save('groups.json', { groups: data.MOCK_GROUPS });

  // 9. teachers.json (new module)
  save('teachers.json', { teachers: data.MOCK_TEACHERS });

  // 10. competitions.json (new)
  save('competitions.json', { competitions: data.UPCOMING_COMPETITIONS });

  // 11. professors.json
  save('professors.json', { professors: data.PROFESSORS });

  // 12. resumes.json (new)
  save('resumes.json', { resumes: data.ME_RESUMES });

  // 13. auth.json (initial empty state)
  save('auth.json', {
    session: { phone_authenticated:false, email_authenticated:false, phone_masked:'', campus_verified:false, user_id:'', name:'', campus_account:'' },
    accounts: []
  });

  // 14-19. supporting files
  save('likes.json', { users: { u001: [] } });
  save('collections.json', { collections: [], tags: {} });
  save('reports.json', { reports: [] });
  save('audit.json', { records: [] });
  save('preferences.json', {});
  save('participation.json', { u001: { points: 120, records: [] } });

  console.log('\nDone! All seed JSON files generated in data/');
} catch(e) {
  console.error('ERROR:', e.message);
  console.error(e.stack);
}
