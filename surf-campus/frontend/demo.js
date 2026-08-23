'use strict';
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'})[c]);
const h=escapeHTML;
function toast(msg,type){const e=document.createElement('div');e.className='toast'+(type==='error'?' is-error':'');e.textContent=(typeof T==='function')?T(msg):msg;$('toast-region').appendChild(e);setTimeout(()=>{e.style.opacity='0';e.style.transform='translateY(6px)';setTimeout(()=>e.remove(),200)},3000)}
function refreshIcons(){if(window.lucide)lucide.createIcons()}
function formatTime(v){if(!v)return'刚刚';var d=new Date(v);if(!isNaN(d))return String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');return String(v).replace(/^2026-/,'').replace(/:\d\d$/,'')}
function isWithinDays(dateStr,days){var d=new Date(dateStr);if(isNaN(d))return false;var now=new Date();var cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-days);return d>=cutoff}
function isInTimeRange(dateStr,range,customStart,customEnd){var d=new Date(dateStr);if(isNaN(d))return false;var now=new Date();if(range==='3days'){var cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-2);cutoff.setHours(0,0,0,0);return d>=cutoff}if(range==='week'){var cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-6);cutoff.setHours(0,0,0,0);return d>=cutoff}if(range==='month'){var cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-30);cutoff.setHours(0,0,0,0);return d>=cutoff}if(range==='custom'){if(!customStart||!customEnd)return true;var start=new Date(customStart);var end=new Date(customEnd);end.setHours(23,59,59,999);return d>=start&&d<=end}return true}
function getDayGroupKey(dateStr,range){var d=new Date(dateStr);if(isNaN(d))return'zzz';var now=new Date();var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());var notifDay=new Date(d.getFullYear(),d.getMonth(),d.getDate());var diffDays=Math.round((today-notifDay)/86400000);if(range==='3days'){if(diffDays===0)return'0_today';if(diffDays===1)return'1_yesterday';if(diffDays===2)return'2_daybefore';return'3_earlier'}var y=d.getFullYear();var m=String(d.getMonth()+1).padStart(2,'0');var dd=String(d.getDate()).padStart(2,'0');return String(y)+m+dd}
function getDayGroupLabel(key,dateStr,range){if(range==='3days'){if(key==='0_today')return'今天';if(key==='1_yesterday')return'昨天';if(key==='2_daybefore')return'前天'}var d=new Date(dateStr);if(isNaN(d))return'';if(range==='week'){var days=['周日','周一','周二','周三','周四','周五','周六'];return days[d.getDay()]}return String(d.getMonth()+1)+'月'+String(d.getDate())+'日'}
function formatNotifTime(dateStr,isCurrentZone,range){var d=new Date(dateStr);if(isNaN(d))return'';var time=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');if(!isCurrentZone)return String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+time;if(range==='3days'){var now=new Date();var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());var notifDay=new Date(d.getFullYear(),d.getMonth(),d.getDate());var diffDays=Math.round((today-notifDay)/86400000);if(diffDays===0)return time;if(diffDays===1)return'昨天 '+time;if(diffDays===2)return'前天 '+time;return time}if(range==='week'){var days=['周日','周一','周二','周三','周四','周五','周六'];return days[d.getDay()]+' '+time}return String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+time}
function postAvatar(p){return p.anonymous?'匿':(p.author||'校').slice(0,1)}
function stateBlock(t,m,i,a){return'<div class="state-block"><i data-lucide="'+(i||'inbox')+'"></i><strong>'+h(t)+'</strong><p>'+h(m)+'</p>'+(a||'')+'</div>'}
function pageHeader(k,t,d){var s='<div class="page-header"><span class="eyebrow">'+h(k)+'</span><h1>'+h(t)+'</h1>';if(d)s+='<p>'+h(d)+'</p>';s+='</div>';return s}

/* ═══ DATA ═══ */
const MOCK_POSTS=[{id:'p1',title:'求 CSE101 期末复习资料和往年试题',content:'马上期末了，有没有学长学姐分享下CSE101的复习资料和往年试卷？万分感谢！🙏',section:'academic',anonymous:false,author:'小明同学',time:'2026-08-09 14:30',likes:12,comments_count:3,tags:['CSE101','期末复习','资料'],media:[],liked:false,collected:false,comments:[{author:'助教Amy',content:'建议重点复习数组操作、链表和排序算法部分，去年大题考了二叉树遍历。',time:'2026-08-09 15:00',likes:5},{author:'学长小李',content:'E-bridge上有往年试卷，搜CSE101 past paper就行。',time:'2026-08-09 16:20',likes:3},{author:'同班小王',content:'同求！如果有整理好的笔记就更好了！',time:'2026-08-09 18:00',likes:1}]},{id:'p2',title:'图书馆B2自习区wifi信号太差了',content:'最近在图书馆B2层自习，发现靠窗户那排座位的校园网信号非常不稳定。有没有遇到同样情况的同学？',section:'campus-life',anonymous:true,author:'匿名同学',time:'2026-08-09 11:20',likes:8,comments_count:1,tags:['图书馆','校园网'],media:[],liked:false,collected:false,comments:[{author:'图书馆常客',content:'我前天也遇到了，靠窗第三排完全连不上。已经提交IT工单了，说是这周维修。',time:'2026-08-09 12:00',likes:2}]},{id:'p3',title:'2026 RoboMaster战队补强招募',content:'西浦RoboMaster战队新赛季补强中！急需嵌入式开发（STM32）1名，机械设计1名。已获学校20,000元启动资金，目标分区赛八强。',section:'teams',anonymous:false,author:'陈工',time:'2026-08-09 09:00',likes:15,comments_count:4,tags:['RoboMaster','组队','嵌入式'],media:[{type:'image',url:'https://placehold.co/600x300/236984/white?text=RoboMaster'}],liked:false,collected:false,comments:[{author:'机械萌新',content:'零基础可以吗？对SolidWorks会一点，想试试机械设计方向。',time:'2026-08-09 09:30',likes:4},{author:'陈工',content:'零基础没关系，只要愿意学。每周三次集训，周末可以单独补课。',time:'2026-08-09 10:00',likes:6},{author:'大三学长',content:'校队氛围很好，技术可以慢慢学，关键是有热情和毅力。',time:'2026-08-09 10:30',likes:3},{author:'嵌入式爱好者',content:'STM32我有经验，做过平衡车项目，怎么联系？',time:'2026-08-09 11:00',likes:2}]},{id:'p4',title:'交换到南洋理工的体验 — AMA',content:'上个学期去NTU交换了一学期，整体体验超乎预期。对交换/留学规划有疑问的同学欢迎提问！',section:'campus-life',anonymous:false,author:'李华',time:'2026-08-08 17:45',likes:24,comments_count:6,tags:['交换','NTU','留学'],media:[],liked:false,collected:false,comments:[{author:'准大三',content:'请问申请交换需要什么条件？GPA大概要多少？',time:'2026-08-08 18:00',likes:8},{author:'李华',content:'NTU要求GPA3.0+，雅思6.5或托福90。西浦交换名额每年有5-8个。',time:'2026-08-08 18:30',likes:12},{author:'大一新生',content:'大一可以申请吗？还是建议大二大三再考虑？',time:'2026-08-08 19:00',likes:5},{author:'李华',content:'建议大二下学期或大三申请，这样课程衔接比较顺畅。大一的同学可以先关注GPA。',time:'2026-08-08 19:30',likes:7},{author:'路人甲',content:'NTU的食堂和住宿怎么样？听说宿舍超豪华！',time:'2026-08-08 20:00',likes:6},{author:'李华',content:'宿舍确实不错，双人间带独立卫浴，食堂选择很多而且价格便宜。强烈推荐！',time:'2026-08-08 20:30',likes:9}]},{id:'p5',title:'数学建模竞赛：3=1急缺MATLAB高手',content:'我们3人已组好队，有编程和写作搭档，急缺一位MATLAB/Python建模能力强的同学加入。目标国一！',section:'teams',anonymous:false,author:'王小明',time:'2026-08-08 15:00',likes:6,comments_count:2,tags:['数学建模','组队','MATLAB'],media:[],liked:false,collected:false,comments:[{author:'建模达人',content:'我会MATLAB和Python，参加过两次国赛，怎么联系？',time:'2026-08-08 15:30',likes:3},{author:'王小明',content:'太棒了！加我微信wangxiaoming_xjtlu，我们赛前每周三次模拟训练。',time:'2026-08-08 16:00',likes:2}]},{id:'p6',title:'分享一个超好用的Zotero文献管理配置',content:'最近把Zotero的文献管理流彻底搭好了，写论文效率直接翻倍。需要自取！',section:'academic',anonymous:false,author:'文献管理爱好者',time:'2026-08-08 10:00',likes:18,comments_count:5,tags:['Zotero','文献','效率工具'],media:[],liked:false,collected:false,comments:[{author:'研究生',content:'终于有人分享Zotero配置了！我一直在用EndNote但感觉太重了。',time:'2026-08-08 10:30',likes:4},{author:'文献管理爱好者',content:'确实，Zotero配合ZotFile和OneDrive同步超方便，而且完全免费。',time:'2026-08-08 11:00',likes:5},{author:'毕业论文党',content:'求Notion链接！正在写毕业论文，文献管理完全一团乱。',time:'2026-08-08 11:30',likes:3},{author:'文献管理爱好者',content:'Notion链接在个人主页置顶了，有详细配置步骤和常见问题解答。',time:'2026-08-08 12:00',likes:4},{author:'学术萌新',content:'收藏了！下学期开始跟导师做项目正好需要。',time:'2026-08-08 13:00',likes:2}]}];
const MOCK_NOTIFICATIONS=[
  // 🔴 紧急/重要
  {id:'n1',level:'urgent',type:'booking',content:'【预约确认】您已成功预约 Dr. Sarah Chen 的 Office Hour：08-14 周五 09:00-10:00，CB 567。',time:'2026-08-13 09:30',read:false,processed:false,saved_for_later:false},
  {id:'n6',level:'urgent',type:'system',content:'【教务通知】2026秋季学期选课系统将于8月12日9:00开放，请提前规划课程。',time:'2026-08-11 16:00',read:false,processed:false,saved_for_later:false},
  {id:'n7',level:'urgent',type:'result',content:'【RA申请结果】张启明副教授已接受你图算法RA岗位的申请，请查看站内信确认。',time:'2026-08-10 14:00',read:false,processed:false,saved_for_later:false},
  {id:'n8',level:'urgent',type:'qa_reply',content:'【老师回复】张启明副教授回答了你的问题「CST201链表操作有哪些常见坑？」并标记为最佳答案。',time:'2026-08-09 16:30',read:false,processed:false,saved_for_later:false},
  {id:'n9',level:'urgent',type:'event',content:'【报名成功】您已成功报名「科技创客体验日」（8月18日 10:00-16:00），请凭电子票入场。',time:'2026-08-08 10:00',read:false,processed:false,saved_for_later:false},
  // 🟡 普通互动
  {id:'n2',level:'normal',type:'comment',content:'【新评论】Amy Wang 评论了你的话题「CSE101期末复习资料」：建议重点复习数组操作和链表。',time:'2026-08-09 10:00',read:false,processed:false,saved_for_later:false},
  {id:'n10',level:'normal',type:'like',content:'【点赞】赵敏教授赞了你的话题「RoboMaster战队补强招募」。',time:'2026-08-08 20:00',read:false,processed:false,saved_for_later:false},
  {id:'n11',level:'normal',type:'reminder',content:'【活动提醒】「摄影协会·校园外拍活动」将于30分钟后（15:00）在白鹭园集合，别迟到哦！',time:'2026-08-07 14:35',read:false,processed:false,saved_for_later:false},
  {id:'n12',level:'normal',type:'update',content:'【资料更新】你收藏的「CSE101 数据结构笔记（个人整理）」有新版更新，点击查看差异。',time:'2026-08-07 09:00',read:false,processed:false,saved_for_later:false},
  {id:'n3',level:'normal',type:'deadline',content:'【报名提醒】外研社·国才杯演讲比赛校赛报名8月20日截止，已提交报名表的同学请留意。',time:'2026-08-06 14:00',read:true,processed:false,saved_for_later:true},
  // ⚪ 可选阅读
  {id:'n13',level:'optional',type:'recommend',content:'【热门推荐】「交换到南洋理工的体验 — AMA」获得24个赞，成为本周最热话题。',time:'2026-08-08 18:00',read:false,processed:false,saved_for_later:false},
  {id:'n14',level:'optional',type:'new_resource',content:'【新资料】INT305 机器学习导论新增「Week 6: SVM与核方法」课件，来自 Prof. Zhang。',time:'2026-08-07 11:00',read:false,processed:false,saved_for_later:false},
  {id:'n15',level:'optional',type:'preview',content:'【活动预告】「TEDxXJTLU「融合+」系列沙龙」将于8月20日举办，敬请期待更多详情。',time:'2026-08-06 16:00',read:false,processed:false,saved_for_later:false},
  {id:'n16',level:'optional',type:'maintenance',content:'【系统维护】通知中心将于8月15日凌晨2:00-4:00进行系统升级，期间可能短暂不可用。',time:'2026-08-06 10:00',read:false,processed:false,saved_for_later:false},
  // 已处理
  {id:'n4',level:'normal',type:'system',content:'【图书馆】B2层Wi-Fi问题已确认，IT部门正在更换AP设备，预计8月13日前完成。',time:'2026-08-05 11:30',read:true,processed:true,saved_for_later:false},
  {id:'n5',level:'normal',type:'event',content:'【就业指导中心】8月4日职业规划工作坊参会提醒：请提前10分钟到场签到。',time:'2026-08-03 09:00',read:true,processed:true,saved_for_later:false}
];
const MOCK_RESOURCES=[{id:'r1',name:'CSE101 2024期末试卷（含答案）',course:'CSE101',courseName:'程序设计基础',type:'试卷',uploader:'助教Amy',year:'Year 1',term:'Semester 2',major:'ICS',source:'官方',size:'2.3MB',downloads:156},{id:'r2',name:'微积分全英文讲义',course:'MTH008',courseName:'微积分',type:'讲义',uploader:'Prof. Chen',year:'Year 1',term:'Semester 1',major:'Math',source:'官方',size:'8.1MB',downloads:89},{id:'r3',name:'机器学习课件合集（全14周）',course:'INT305',courseName:'机器学习导论',type:'课件',uploader:'Prof. Zhang',year:'Year 3',term:'Semester 1',major:'ICS',source:'官方',size:'15MB',downloads:203},{id:'r4',name:'学术英语写作手册',course:'EAP023',courseName:'学术英语',type:'资料',uploader:'EAP中心',year:'Year 2',term:'Semester 1',major:'All',source:'官方',size:'4.5MB',downloads:312},{id:'r5',name:'CSE101 数据结构笔记（个人整理）',course:'CSE101',courseName:'程序设计基础',type:'笔记',uploader:'张三',year:'Year 1',term:'Semester 2',major:'ICS',source:'个人',size:'1.2MB',downloads:67},{id:'r6',name:'MTH008 历年真题汇总',course:'MTH008',courseName:'微积分',type:'试卷',uploader:'学长分享',year:'Year 1',term:'Semester 1',major:'Math',source:'个人',size:'5.6MB',downloads:45}];
const MOCK_QUESTIONS=[{id:'q1',question:'CSE101期末难度跟期中比怎么样？',summary:'求问历届学长学姐——期中考了85但感觉期末难度完全不一样，尤其是最后的算法设计题...',course:'CSE101',courseName:'程序设计基础',author:'张三',major_class:'计算机2101',status:'solved',pinned:false,answers_count:2,views:156,votes:32,time:'2026-08-09T15:30',tag:'最新',answers_detail:[{id:'a1',role:'助教',content:'期中侧重基础语法，期末更注重算法和数据结构。重点复习数组、链表和排序算法。',accepted:true,votes:8},{id:'a2',role:'学长',content:'去年最后一道大题是二叉树遍历，建议提前看看递归写法。',accepted:false,votes:3}]},{id:'q2',question:'微积分的辅助教材推荐？',summary:'MTH008下周测验，教材上的例题太简单了，求推荐一些难度适中的练习册...',course:'MTH008',courseName:'微积分',author:'李华',major_class:'应数2203',status:'solved',pinned:false,answers_count:1,views:89,votes:23,time:'2026-08-09T10:00',tag:'热门',answers_detail:[{id:'a3',role:'教师',content:'推荐Stewart的Calculus和Apostol的Calculus Vol.1作为辅助阅读。',accepted:false,votes:6}]},{id:'q3',question:'INT305 Machine Learning项目选题求建议',summary:'这学期ML课的final project选题纠结中，目前考虑图像分类和NLP两个方向...',course:'INT305',courseName:'机器学习导论',author:'陈工',major_class:'机器人2104',status:'solved',pinned:false,answers_count:3,views:234,votes:47,time:'2026-08-08T18:20',tag:'热门',answers_detail:[{id:'a4',role:'同学',content:'推荐做图像分类，用MNIST或CIFAR-10，资料丰富容易上手。',accepted:false,votes:4},{id:'a5',role:'助教',content:'建议选NLP方向——情感分析，数据集好找，模型相对轻量。',accepted:true,votes:9}]},{id:'q4',question:'数据结构（CST201）链表操作有哪些常见坑？',summary:'写链表反转时总是指针跑飞，有没有什么debug技巧或者常见的边界条件需要注意？',course:'CST201',courseName:'数据结构与算法',author:'王小明',major_class:'数据科学2202',status:'unsolved',pinned:true,answers_count:1,views:67,votes:15,time:'2026-08-10T09:00',tag:'待解决',answers_detail:[{id:'a6',role:'学长',content:'最易出错的是空指针判断和循环链表边界条件。建议画图辅助。',accepted:false,votes:2}]},{id:'q5',question:'学术英语（EAP023）论文写作——怎么避免中式英语？',summary:'每次写essay都被导师圈一堆chinglish，明明语法没错但读起来就是不像英语...',course:'EAP023',courseName:'学术英语',author:'张三',major_class:'计算机2101',status:'unsolved',pinned:false,answers_count:2,views:112,votes:28,time:'2026-08-08T14:00',tag:'精华',answers_detail:[{id:'a7',role:'教师',content:'使用Grammarly辅助检查，多读英文论文培养语感。',accepted:false,votes:5},{id:'a8',role:'同学',content:'推荐The Elements of Style这本书，短小精悍。',accepted:false,votes:3}]},{id:'q6',question:'有推荐的Python编程练习平台吗？',summary:'LeetCode刷了50题但感觉和课程作业风格不太一样，有没有更贴近CSE101教学进度的练习...',course:'CSE101',courseName:'程序设计基础',author:'李华',major_class:'应数2203',status:'unsolved',pinned:false,answers_count:0,views:45,votes:8,time:'2026-08-10T20:00',tag:'待解决',answers_detail:[]}];
const MOCK_DIRECTORY=[
  {id:'u001',name:'刘教授','学院':'计算机科学','年级':'教授',role:'teacher',title:'教授·博士生导师',status:'online',availableTime:'本周三 14:00-16:00',verified:true,tags:['NLP','大语言模型'],bio:'NLP领域深耕15年，欢迎来交流'},
  {id:'u002',name:'张启明','学院':'智能工程学院','年级':'副教授',role:'teacher',title:'副教授',status:'busy',availableTime:'本周五 10:00-12:00',verified:true,tags:['算法','数据结构','教学名师'],bio:'清华博士，专注算法教学10年'},
  {id:'u003',name:'Amy Wang','学院':'计算机科学','年级':'助教',role:'teacher',title:'助教·研究生',status:'online',availableTime:'周一/三/五 14:00-17:00',verified:true,tags:['Python','CSE101','辅导'],bio:'CSE101助教，擅长Python辅导'},
  {id:'u004',name:'张三','学院':'计算机科学与技术','年级':'大三',role:'student',status:'online',major:'计算机科学与技术',sharedCourses:'数据结构',tags:['AI/机器学习','竞赛选手','ACM']},
  {id:'u005',name:'李华','学院':'商学院','年级':'大二',role:'student',status:'offline',major:'会计学',sharedCourses:'微积分',tags:['ACCA','商业分析']},
  {id:'u006',name:'王小明','学院':'数据科学','年级':'大三',role:'student',status:'online',major:'数据科学与大数据技术',sharedCourses:'机器学习',tags:['ACM','Kaggle','数据挖掘']},
  {id:'u007',name:'陈工','学院':'机器人工程','年级':'大三',role:'student',status:'online',major:'机器人工程',sharedCourses:'数据结构',tags:['RoboMaster','嵌入式','C++']},
  {id:'u008',name:'赵学姐','学院':'土木工程','年级':'2024届',role:'student',status:'offline',major:'土木工程',sharedCourses:'学术英语',tags:['剑桥大学','环境工程','留学']}
];
/* ═══ ME PROFILE (当前用户=张三) ═══ */
const ME_PROFILE={
  id:'me',name:'张三',avatar:'张',grade:'大三',major:'计算机科学与技术',clazz:'计算机2101',
  bio:'计算机科学·大三 | 喜欢AI和开源 | 竞赛选手',
  email:'zhangsan@student.xjtlu.edu.cn',
  phone:'',links:{github:'github.com/zhangsan',blog:'blog.zhangsan.dev'},
  verifyState:'verified', // 'none' | 'pending' | 'verified'
  studentId:'',tags:['AI/机器学习','竞赛选手','ACM']
};
const ME_RESUMES=[
  {id:'rv1',name:'通用简历 · 主版本',target:'图算法研究助理（张启明）',updated:'2026-08-09',status:'accepted',highlights:['Python/图论基础','C++ 竞赛经历','ACM 区域赛']},
  {id:'rv2',name:'NLP 方向精简版',target:'NLP 研究实习（赵敏教授）',updated:'2026-08-08',status:'pending',highlights:['INT305 机器学习','PyTorch 文本分类']},
  {id:'rv3',name:'竞赛简历 · 备赛版',target:'ICPC 训练营助教',updated:'2026-08-05',status:'draft',highlights:['ACM 区域赛银奖','数据结构 90+']}
];
/* ═══ CONTACT → TEACHER MAPPING ═══ */
const CONTACT_TEACHER_MAP={'u002':'t1'};
const MOCK_GROUPS=[{id:'g1',name:'互联网+ 项目冲刺群',description:'2026互联网+红旅赛道备赛群',members:[1,2,3,4],messages:[{sender:'张三',content:'明天下午2点CB线上会议',time:'2026-08-09 15:00'}]},{id:'g2',name:'CV论文复现小组',description:'张明教授组的CV论文复现学习',members:[1,3,5],messages:[{sender:'张明教授',content:'本周复现ResNet-50，周五讨论',time:'2026-08-08 10:00'}]}];
const MOCK_TREEHOLES=[{id:'t1',content:'第一次体验了学校的24小时自习室，比图书馆舒服多了。人少安静，空调也足。',time:'2026-08-09 23:15',author:'匿名同学',anonymous:true,likes:32,liked:false,comments_count:1,tags:['自习室','图书馆'],media:[],comments:[{author:'匿名同学',content:'具体在哪？求地址',time:'2026-08-09 23:20',likes:3,anonymous:true}]},{id:'t2',content:'发现食堂新开了一家奶茶店，价格比外面便宜一半！',time:'2026-08-08 18:30',author:'匿名同学',anonymous:true,likes:18,liked:false,comments_count:1,tags:['食堂','奶茶'],media:[],comments:[{author:'匿名同学',content:'在哪？？',time:'2026-08-08 18:32',likes:1,anonymous:true}]},{id:'t3',content:'关于GPA和科研该侧重哪个的问题…大三了还没有方向，很焦虑。',time:'2026-08-07 22:00',author:'匿名同学',anonymous:true,likes:45,liked:true,comments_count:1,tags:['GPA','科研','焦虑'],media:[],comments:[{author:'匿名同学',content:'GPA是敲门砖，科研是加分项',time:'2026-08-07 22:15',likes:8,anonymous:true}]},{id:'t4',content:'这学期的课程真的太硬了，一周7个DDL，已疯。',time:'2026-08-06 02:30',author:'匿名同学',anonymous:true,likes:56,liked:false,comments_count:0,tags:['DDL','吐槽'],media:[],comments:[]}];
const SECTION_META={all:{label:'推荐'},academic:{label:'学术'},'campus-life':{label:'校园生活'},teams:{label:'组队与项目'},hobby:{label:'兴趣圈子'},other:{label:'其他'}};

/* ═══ ENHANCED OPP/EVENT DATA ═══ */
const DEMO_OPPORTUNITIES=[{id:'opp_1',title:'【互联网+红旅赛道】寻有过获奖经验的视觉设计合伙人',kind:'比赛招募',category:'competition',sub_category:'创新创业大赛',role_type:'核心成员',collab_mode:'冲刺型',ai_summary:'发起者张三是策略型领袖，已在去年省赛中获银奖。需要一个能独立完成品牌视觉、PPT美化和路演材料的设计伙伴。',skills:['UI/UX','视觉设计','获奖经验'],tags:['互联网+','红旅赛道'],deadline:'2026-08-20',capacity:1,applications_count:1,owner:'张三',initiator_profile:{collab_tags:['策略型领袖','高效执行者'],bio:'计算机大三'},match_score:92,match_reason:'匹配2/3项技能：UI/UX,视觉设计',my_application:null,detail_description:'本项目聚焦红旅赛道乡村振兴方向，通过数字化手段帮助农产品上行。团队已完成市场调研，产品MVP已搭建完毕。',team_members:[{name:'张三',role:'产品经理/队长',skills:['产品规划','商业计划书'],style:'策略型领袖',avatar:'张'},{name:'陈工',role:'后端开发',skills:['Java','Spring Boot'],style:'稳健执行者',avatar:'陈'},{name:'刘同学',role:'前端开发',skills:['React','TypeScript'],style:'快速学习者',avatar:'刘'}],recruit_profile:{required_skills:['UI/UX设计','品牌视觉','演示文稿美化'],preferred_experience:'有竞赛获奖作品集优先',weekly_commitment:'8月每日4-6小时',team_fit:'团队氛围扁平直接，问题不过夜。'},team_culture:'🔴 高速冲刺·目标导向·开放直接'},{id:'opp_2',title:'【全国大学生数学建模竞赛】3=1求建模达人',kind:'比赛招募',category:'competition',sub_category:'数学建模大赛',role_type:'核心成员',collab_mode:'冲刺型',ai_summary:'王小明已有编程和写作搭档，急缺一位能快速建立数学模型的队友。',skills:['数学建模','MATLAB','Python','优化算法'],tags:['数学建模','国赛'],deadline:'2026-08-25',capacity:1,applications_count:0,owner:'王小明',initiator_profile:{collab_tags:['数据驱动者','快速学习者'],bio:'数据科学大三'},match_score:25,match_reason:'匹配1/4项技能：Python',my_application:null,detail_description:'目标冲击国家一等奖。计划赛前进行6次全真模拟训练。',team_members:[{name:'王小明',role:'编程/队长',skills:['Python','MATLAB'],style:'数据驱动者',avatar:'王'},{name:'赵同学',role:'写作/排版',skills:['LaTeX','学术写作'],style:'严谨型写手',avatar:'赵'}],recruit_profile:{required_skills:['数学建模','微分方程','优化理论'],preferred_experience:'有竞赛经验优先',weekly_commitment:'赛前每周3次训练',team_fit:'训练时互相挑刺但不伤感情。'},team_culture:'📐 逻辑为王·严谨但不死板'},{id:'opp_3',title:'【清华AIR暑期科研实习】招募NLP方向研究助理',kind:'科研招募',category:'research',sub_category:'AI/机器学习',role_type:'学徒求带',collab_mode:'稳健型',ai_summary:'赵敏教授实验室开放暑期研究实习名额，欢迎对NLP有基础的同学。',skills:['NLP','PyTorch','论文阅读','Python'],tags:['NLP','大语言模型','科研实习'],deadline:'2026-09-01',capacity:2,applications_count:1,owner:'赵敏教授',initiator_profile:{collab_tags:['学术导师','耐心指导者'],bio:'教授，已发表多篇顶会'},match_score:25,match_reason:'匹配1/4项技能：Python',my_application:{status:'accepted'},detail_description:'清华大学智能产业研究院赵敏教授组暑期研究实习项目。提供计算资源和周组会指导。',team_members:[{name:'赵敏教授',role:'导师',skills:['NLP','学术指导'],style:'学术导师',avatar:'赵'},{name:'张三',role:'研究助理（已加入）',skills:['Python','PyTorch'],style:'主动学习者',avatar:'张'}],recruit_profile:{required_skills:['Python','PyTorch','英文论文阅读'],preferred_experience:'修过NLP或深度学习课程',weekly_commitment:'每周15+小时',team_fit:'师徒制的研究环境。'},team_culture:'📖 学术导向·师徒传承'},{id:'opp_4',title:'【校园二手交易平台】全栈开发2=2',kind:'项目招募',category:'project',sub_category:'创业孵化',role_type:'灵感合伙人',collab_mode:'灵感碰撞型',ai_summary:'发起者只有产品和市场方向的想法，急缺技术合伙人和设计合伙人。',skills:['React','Node.js','UI/UX','创业'],tags:['创业','全栈开发'],deadline:'2026-09-15',capacity:2,applications_count:0,owner:'李华',initiator_profile:{collab_tags:['愿景驱动者','深度思考者'],bio:'商科大二'},match_score:0,match_reason:'可以补充新技能',my_application:null,detail_description:'CourseSwap面向西浦学生的C2C闲置交易平台，已完成200份问卷调研。',team_members:[{name:'李华',role:'产品/CEO',skills:['产品设计','用户研究'],style:'愿景驱动者',avatar:'李'}],recruit_profile:{required_skills:['React/Vue前端','Node.js/Python后端'],preferred_experience:'有全栈项目经验优先',weekly_commitment:'灵活，每周1-2次线下',team_fit:'需要ownership。'},team_culture:'💡 创意驱动·扁平协作'},{id:'opp_5',title:'【校园足球联赛】校队补强招募前锋和门将',kind:'活动招募',category:'sports',sub_category:'足球',role_type:'散人组局',collab_mode:'稳健型',ai_summary:'西浦足球队为秋季联赛补强阵容，急缺前锋和门将各1名。',skills:['足球','竞技体育'],tags:['足球','校队','联赛'],deadline:'2026-08-30',capacity:2,applications_count:1,owner:'体育部',initiator_profile:{collab_tags:['经验老将','团队领袖'],bio:'校队队长'},match_score:0,match_reason:'可以补充新技能',my_application:null,detail_description:'西浦男子足球队参加2026年苏州市大学生足球联赛。每周二、四下午训练。',team_members:[{name:'刘队',role:'队长/中场',skills:['中场组织'],style:'团队领袖',avatar:'刘'}],recruit_profile:{required_skills:['前锋：速度+射门意识','门将：反应快'],preferred_experience:'有校队经验优先',weekly_commitment:'每周2次训练+周末比赛',team_fit:'比赛日不能鸽。'},team_culture:'⚽ 团结拼搏·胜负共担'},{id:'opp_6',title:'【大疆RoboMaster机甲大师赛】嵌入式+机械招募',kind:'比赛招募',category:'competition',sub_category:'机器人竞赛',role_type:'核心成员',collab_mode:'冲刺型',ai_summary:'西浦RoboMaster战队已获校方资金支持，急缺嵌入式开发和机械设计各1名。',skills:['嵌入式','STM32','SolidWorks','机械设计'],tags:['RoboMaster','机甲大师'],deadline:'2026-09-10',capacity:2,applications_count:0,owner:'陈工',initiator_profile:{collab_tags:['技术极客','永不言弃'],bio:'机器人工程大三'},match_score:0,match_reason:'可以补充新技能',my_application:null,detail_description:'西浦RoboMaster战队第二年参赛，目标分区赛八强→全国赛入围。',team_members:[{name:'陈工',role:'队长/视觉算法',skills:['OpenCV'],style:'技术极客',avatar:'陈'}],recruit_profile:{required_skills:['嵌入式STM32','机械设计SolidWorks'],preferred_experience:'有机器人比赛经历优先',weekly_commitment:'每周3次线下集训',team_fit:'典型的工程师团队。'},team_culture:'🤖 硬核极客·实物为王'},{id:'opp_7',title:'【计算机视觉论文复现小组】CV方向科研入门',kind:'科研招募',category:'research',sub_category:'AI/机器学习',role_type:'学徒求带',collab_mode:'稳健型',ai_summary:'张明教授指导的论文复现小组，面向CV初学者。每周一次讨论会。',skills:['PyTorch','计算机视觉','论文阅读'],tags:['CV','论文复现','科研入门'],deadline:'2026-08-20',capacity:5,applications_count:2,owner:'张明教授',initiator_profile:{collab_tags:['学术导师','因材施教'],bio:'计算机系教授，CV方向'},match_score:33,match_reason:'匹配1/3项技能：PyTorch',my_application:null,detail_description:'张明教授发起的CV论文复现学习小组。12周计划覆盖经典网络。',team_members:[{name:'张明教授',role:'导师',skills:['计算机视觉'],style:'学术导师',avatar:'张'}],recruit_profile:{required_skills:['Python基础','PyTorch入门'],preferred_experience:'无科研经验要求',weekly_commitment:'每周讨论会2小时+自主复现5-8小时',team_fit:'学在一起而非卷在一起。'},team_culture:'📚 学在一起·不卷不急'},{id:'opp_8',title:'【Python开源项目】校园课程评价平台贡献者招募',kind:'项目招募',category:'project',sub_category:'开源贡献',role_type:'灵感合伙人',collab_mode:'灵感碰撞型',ai_summary:'已有的开源项目GitHub 200+stars，招募贡献者。',skills:['Vue3','FastAPI','PostgreSQL','开源'],tags:['开源','课程评价'],deadline:'2026-12-31',capacity:5,applications_count:0,owner:'开源社区',initiator_profile:{collab_tags:['开源布道者','技术导师'],bio:'项目创始人'},match_score:0,match_reason:'可以补充新技能',my_application:null,detail_description:'CourseWatch开源校园课程评价平台，提供mentor指导。',team_members:[{name:'学长A',role:'项目创始人',skills:['FastAPI','Vue3'],style:'开源布道者',avatar:'A'}],recruit_profile:{required_skills:['Python或JS基础','Git使用'],preferred_experience:'有个人项目即可',weekly_commitment:'完全灵活',team_fit:'异步协作的开源项目。'},team_culture:'开源精神·mentor带飞'}];
const DEMO_EVENTS=[{id:"evt_1",title:"TEDxXJTLU「融合+」系列沙龙",time:"2026-08-20 14:00-17:00",location:"CB G13W",organizer:"TEDxXJTLU 社团",speaker:"多位跨界讲者",category:"讲座",description:"TEDxXJTLU年度系列沙龙，邀请科技、艺术、人文领域讲者分享「融合」背后的故事与思考。",tags:["TEDx","融合","跨学科"],registered:160,capacity:300,registered_by_me:false},{id:"evt_2",title:"「融合式教育」主题学术论坛",time:"2026-08-25 14:00-17:00",location:"IA G01",organizer:"西浦学术支持中心",speaker:"多位教授",category:"讲座",description:"探讨融合式教育的理论与实践，国内外教育专家共同对话。",tags:["教育","学术","论坛"],registered:80,capacity:200,registered_by_me:false},{id:"evt_3",title:"科技创客体验日",time:"2026-08-18 10:00-16:00",location:"EB 1楼创客空间",organizer:"科技创新协会",category:"Workshop",description:"动手体验3D打印、激光切割、Arduino编程。零基础友好，材料由社团提供。",tags:["创客","科技","动手"],registered:25,capacity:30,registered_by_me:false},{id:"evt_4",title:"研究导向型学习工作坊",time:"2026-08-22 14:00-16:00",location:"CB 345",organizer:"西浦学习超市",speaker:"学术支持团队",category:"Workshop",description:"教你如何用研究导向的方法完成课程作业和论文——从选题、文献检索到批判性分析。",tags:["学习方法","论文","工坊"],registered:30,capacity:40,registered_by_me:false},{id:"evt_5",title:"摄影协会 · 校园外拍活动",time:"2026-08-16 15:00-18:00",location:"白鹭园集合",organizer:"摄影协会",category:"兴趣活动",description:"下午光线最佳时段，带队拍摄白鹭园、图书馆和中心湖畔。手机/相机均可参与。",tags:["摄影","户外","白鹭园"],registered:18,capacity:30,registered_by_me:false},{id:"evt_6",title:"动漫社 · 春日放映会",time:"2026-08-19 18:30-21:00",location:"CB G12",organizer:"动漫社",category:"兴趣活动",description:"精选三部经典剧场版动画连续放映，提供免费零食和饮料。",tags:["动漫","放映","社交"],registered:45,capacity:60,registered_by_me:true},{id:"evt_7",title:"校外导师师生见面会（秋季学期）",time:"2026-08-28 14:00-17:00",location:"IA G01",organizer:"西浦校外导师项目组",category:"校外导师",description:"本学期新增15位校外导师（来自微软、德勤、字节跳动、博世等），与同学面对面交流双向选择。",tags:["导师","见面会","职业"],registered:90,capacity:150,registered_by_me:false},{id:"evt_8",title:"导师职业沙龙 · 行业前沿分享",time:"2026-08-30 18:30-20:00",location:"BS G02",organizer:"校外导师团",speaker:"3位企业导师",category:"校外导师",description:"3位来自不同行业的校外导师分享行业趋势和职业发展建议。",tags:["职业","导师","分享"],registered:55,capacity:100,registered_by_me:false},{id:"evt_9",title:"百团大战 · 社团招新",time:"2026-09-05 10:00-17:00",location:"中心广场 & 下沉广场",organizer:"西浦社团支持中心",category:"社团活动",description:"新学期最盛大的社团招新活动！130+社团联合展示，舞蹈快闪、音乐live、电竞友谊赛全天不断。",tags:["社团","招新","百团"],registered:350,capacity:2000,registered_by_me:true},{id:"evt_10",title:"社团文化节 · 130+社团联合展演",time:"2026-09-12 14:00-20:00",location:"中心广场大舞台",organizer:"西浦社团支持中心",category:"社团活动",description:"舞蹈社、音乐社、戏剧社、武术社等20+社团带来精彩舞台表演，展现社团多元文化。",tags:["表演","文化","联合"],registered:280,capacity:800,registered_by_me:false},{id:"evt_11",title:"嘿科技大会暨生态合作伙伴大会",time:"2026-09-08 09:00-17:00",location:"EB Hall",organizer:"西浦就业发展中心",speaker:"多位企业代表",category:"职业发展",description:"科技企业展示最新产品与技术，现场设有招聘专区、技术体验区和创业路演。",tags:["科技","招聘","大会"],registered:120,capacity:500,registered_by_me:false},{id:"evt_12",title:"IBSS Bridging East and West 商业案例竞赛",time:"2026-09-10 09:00-18:00",location:"BS G02",organizer:"西浦国际商学院",category:"职业发展",description:"全英文商业案例竞赛，与国际学生混合组队，冠军队代表学校参加亚太区决赛。",tags:["商赛","国际化","组队"],registered:60,capacity:120,registered_by_me:false},{id:"evt_13",title:"秋季校园招聘会 · 名企宣讲",time:"2026-09-15 10:00-16:00",location:"CB 1楼大厅",organizer:"西浦就业发展中心",category:"职业发展",description:"30+名企现场招聘，涵盖互联网、金融、咨询、制造等行业。请穿正装、携带简历。",tags:["招聘","名企","正装"],registered:200,capacity:600,registered_by_me:true},{id:"evt_14",title:"留学申请经验分享会 · 学长学姐说",time:"2026-08-27 18:30-20:30",location:"CB G23W",organizer:"西浦留学服务中心",speaker:"5位西浦校友",category:"留学",description:"5位成功申请到G5+常春藤的校友分享文书写作、选校策略和面试经验。",tags:["留学","申请","文书"],registered:110,capacity:180,registered_by_me:false},{id:"evt_15",title:"2+2/海外交换项目宣讲",time:"2026-09-02 15:00-17:00",location:"CB G13W",organizer:"西浦国际办公室",category:"留学",description:"详细介绍利物浦2+2、海外交换、夏校等项目申请流程和注意事项。",tags:["2+2","交换","海外"],registered:75,capacity:200,registered_by_me:false},{id:"evt_16",title:"西浦运动会 · 秋季赛季",time:"2026-09-18 08:00-17:00",location:"体育馆 & 田径场",organizer:"西浦体育中心",category:"体育赛事",description:"包括田径、游泳、球类等20+项目。以专业/学院为单位报名，个人项目限报2项。",tags:["运动会","田径","报名"],registered:180,capacity:500,registered_by_me:false},{id:"evt_17",title:"「新生杯」篮球联赛",time:"2026-09-07 14:00-18:00",location:"体育馆篮球场",organizer:"西浦体育中心",category:"体育赛事",description:"以专业/年级为单位组队，5v5淘汰赛制。冠军队代表学校出战苏州大学生联赛。",tags:["篮球","新生","5v5"],registered:85,capacity:200,registered_by_me:false},{id:"evt_18",title:"青年志愿者协会 · 公益市集",time:"2026-09-03 10:00-15:00",location:"中心广场",organizer:"青年志愿者协会",category:"志愿公益",description:"旧书交换、手工艺品义卖、无偿献血车同步开放。市集所得将捐赠贵州山区学校。",tags:["义卖","献血","公益"],registered:70,capacity:400,registered_by_me:false},{id:"evt_19",title:"支教经验分享会 · 秋季招募",time:"2026-08-29 18:30-20:00",location:"CB G12",organizer:"西浦志工委",category:"志愿公益",description:"暑期贵州、云南支教团队成果展示，并启动秋季支教项目志愿者招募。认证志愿工时。",tags:["支教","招募","工时"],registered:40,capacity:100,registered_by_me:false},{id:"evt_20",title:"西浦国际文化节 · 四大洲市集",time:"2026-09-20 11:00-17:00",location:"中心广场 & 下沉广场",organizer:"西浦社团支持中心",category:"社团活动",description:"来自40+国家的国际学生展示各国美食、音乐和传统服饰。现场DIY手作+文化问答挑战。",tags:["国际","文化","美食"],registered:400,capacity:2000,registered_by_me:true},{id:"evt_21",title:"羽毛球社团活动",time:"2026-08-14 16:00-18:00",location:"中心体育馆 羽毛球场",organizer:"羽毛球社团",category:"社团活动",description:"新学期首场羽毛球自由打活动，提供球拍借用，欢迎零基础同学参与。",tags:["羽毛球","运动","社交"],registered:32,capacity:40,registered_by_me:false},{id:"evt_22",title:"AI时代教育变革讲座",time:"2026-08-14 14:00-16:00",location:"CB G23W",organizer:"西浦教育创新中心",speaker:"李教授",category:"讲座",description:"探讨AI如何重塑高等教育：个性化学习、智能评估与融合式教学的新可能。",tags:["AI","教育","讲座"],registered:58,capacity:120,registered_by_me:false}];


const UPCOMING_COMPETITIONS=[{id:'comp_1',name:'中国国际大学生创新大赛（互联网+）',type:'国家级赛事',org:'教育部',deadline:'2026-08-25',reward:'金奖¥50,000+保研加分',tags:['创新创业','互联网+'],urgency:'urgent',description:'教育部主办的全国性创新创业赛事，覆盖全国2800+高校。比赛分创意组、初创组、成长组。',topic:'2026年主题为「我敢闯，我会创」。参赛领域：人工智能与数字化、绿色低碳与新能源、乡村振兴、医疗健康、文化创意。',schedule:'校赛8月→省赛9月→国赛10月',fee:'免费（校方报销差旅）',req_cards:[{icon:'👤',label:'参赛资格',text:'在校本科生/研究生，毕业5年内校友可参赛'},{icon:'👥',label:'团队要求',text:'3-15人组队，鼓励跨学科交叉组队'},{icon:'📋',label:'提交材料',text:'商业计划书+路演PPT+1分钟项目视频'},{icon:'🔬',label:'项目要求',text:'需有实际落地或原型验证'}],registration_link:'https://cy.ncss.cn/',contact:'西浦创新创业中心：CB 101'},{id:'comp_2',name:'全国大学生数学建模竞赛',type:'国家级赛事',org:'中国工业与应用数学学会',deadline:'2026-09-05',reward:'国一奖金¥8,000+创新学分',tags:['数学建模','编程'],urgency:'normal',description:'世界上规模最大的数学建模竞赛。3人组队，3天时间完成一道实际问题建模并撰写论文。',topic:'2026年赛题方向：优化调度、微分方程建模、统计分析与机器学习、图论与网络分析。',schedule:'9月下旬竞赛（72小时连续）→10月公布成绩',fee:'每队¥300（学校代缴）',req_cards:[{icon:'👤',label:'参赛资格',text:'全国高校在籍本科生'},{icon:'👥',label:'团队要求',text:'3人一队，需自行组队'},{icon:'💻',label:'技能要求',text:'编程（MATLAB/Python）+数学建模+论文写作'},{icon:'📚',label:'赛前准备',text:'完成指导老师指定培训'}],registration_link:'http://www.mcm.edu.cn/',contact:'数学系王老师：CB 456'},{id:'comp_3',name:'RoboMaster 2026机甲大师高校联盟赛',type:'国家级赛事',org:'大疆创新',deadline:'2026-09-15',reward:'冠军队¥100,000+DJI实习直通',tags:['机器人','嵌入式','AI'],urgency:'normal',description:'大疆创新主办的全球性机器人竞赛。参赛队伍自主研发机器人进行5v5战术对抗。',topic:'2026赛季标准5v5对抗赛。核心技术：实时弹道解算、多机器人协同、能量机关击打、地形导航。',schedule:'报名9月→分区赛次年3-4月→全国总决赛5月',fee:'学校提供启动资金¥20,000',req_cards:[{icon:'👤',label:'参赛资格',text:'全国高校在籍学生'},{icon:'👥',label:'团队要求',text:'5-35人，机械/电控/视觉/算法分工'},{icon:'⏰',label:'时间投入',text:'每周≥3次线下集训，备赛约6个月'},{icon:'⚙️',label:'技术要求',text:'机械设计/嵌入式开发/计算机视觉（至少一项）'}],registration_link:'https://www.robomaster.com/',contact:'机器人社：微信rm_xjtlu'},{id:'comp_4',name:'挑战杯西浦校赛',type:'校赛选拔',org:'西浦团委',deadline:'2026-08-18',reward:'晋级省赛资格+经费¥3,000',tags:['挑战杯','科研创新'],urgency:'urgent',description:'共青团中央主办的最具影响力的学术科技竞赛。西浦校赛为省赛选拔通道。',topic:'竞赛类别：自然科学类学术论文、社会调查报告、科技发明制作。鼓励碳中和、AI社会伦理等方向选题。',schedule:'校赛8月18日→省赛10月→全国终审决赛次年',fee:'免费',req_cards:[{icon:'👤',label:'参赛资格',text:'西浦在读本科生/研究生'},{icon:'👥',label:'团队要求',text:'个人或团队（≤8人）'},{icon:'📄',label:'作品要求',text:'完整的学术论文或科技发明作品'},{icon:'✉️',label:'必需材料',text:'指导老师推荐信+项目申报书'}],registration_link:'https://www.tiaozhanbei.net/',contact:'西浦团委：FB 203'},{id:'comp_5',name:'「外研社·国才杯」英语演讲大赛校赛',type:'校赛选拔',org:'英语语言中心',deadline:'2026-08-20',reward:'校级奖项+代表学校出战省赛',tags:['英语演讲','外语'],urgency:'normal',description:'国内规模最大的英语演讲赛事。西浦校赛选拔前3名晋级省赛。',topic:'定题演讲主题赛前2周公布。比赛含：3分钟定题演讲+1分钟即兴问答+1分钟即兴演讲。',schedule:'校赛8月20日→省赛10月→全国总决赛12月',fee:'免费',req_cards:[{icon:'👤',label:'参赛资格',text:'西浦在校生'},{icon:'🗣',label:'演讲要求',text:'3分钟定题+1分钟即兴问答+1分钟即兴演讲'},{icon:'📊',label:'语言能力',text:'雅思6.5或同等英语水平优先'},{icon:'📝',label:'报名方式',text:'英语语言中心官网在线报名'}],registration_link:'https://uchallenge.unipus.cn/',contact:'英语语言中心：CB 567'},{id:'comp_6',name:'苏州市大学生程序设计竞赛',type:'市级赛事',org:'苏州市计算机学会',deadline:'2026-08-30',reward:'一等奖¥5,000+名企参观',tags:['ACM','算法','编程'],urgency:'normal',description:'面向苏州所有高校学生。赛制为ACM ICPC规则：3人一组，5小时完成8-12道算法题。',topic:'覆盖算法领域：动态规划、图论、数据结构、字符串算法、计算几何、数论。题目难度梯度分布。',schedule:'报名8月底→预赛9月→决赛10月（5小时）',fee:'免费（含午餐）',req_cards:[{icon:'👤',label:'参赛资格',text:'苏州高校在籍学生'},{icon:'👥',label:'团队要求',text:'3人一队，可跨校组队'},{icon:'💻',label:'编程语言',text:'熟练C/C++/Java/Python之一'},{icon:'🏅',label:'加分项',text:'有ACM/ICPC竞赛经验优先'}],registration_link:'https://acm.sip.edu.cn/',contact:'ACM集训队：EB 312'}];
const PROFESSORS=[{id:'prof_1',name:'赵敏教授',faculty:'智能工程学院',title:'教授、博士生导师',research:'自然语言处理、大语言模型的可信评估与对齐',education:'清华大学计算机博士，曾任微软亚洲研究院研究员',papers:['ACL 2024: Hallucination Detection in LLM','EMNLP 2023: Controllable Text Generation','NeurIPS 2022: Few-shot Prompting'],xjtlu_url:'https://www.xjtlu.edu.cn/',tags:['NLP','大模型','AI可信'],avatar:'赵',statement:'目前课题组开放2026暑期研究实习名额（2-3名），欢迎对NLP感兴趣的同学加入。'},{id:'prof_2',name:'张明教授',faculty:'智能工程学院',title:'副教授',research:'计算机视觉、自动驾驶感知、多模态学习',education:'浙江大学博士，曾于商汤科技从事CV研究',papers:['CVPR 2024: 3D Object Detection','ICCV 2023: Multi-modal Fusion','ECCV 2022: Self-supervised Depth'],xjtlu_url:'https://www.xjtlu.edu.cn/',tags:['计算机视觉','自动驾驶','深度学习'],avatar:'张',statement:'正在进行CV论文复现学习小组招募，12周计划覆盖经典网络。适合想入门CV方向的同学。'}];
const MOCK_TEACHERS=[{id:'t1',name:'张启明',faculty:'智能工程学院',title:'副教授',titleLabel:'副教授',course:'数据结构与算法',courseCode:'CST201',tags:['🏆 教学名师'],status:'online',officeHour:'周三 14:00-16:00',location:'主楼 A501',bio:'清华博士，专注算法教学10年。',color:'#c9b99a',rating:4.8,reviews_total:123,education:{phd:'清华大学 · 计算机科学博士',master:'北京大学 · 软件工程硕士',bachelor:'南京大学 · 计算机科学与技术学士'},research:'算法设计与分析、数据结构优化、竞赛算法训练',courses_taught:['CST201 数据结构与算法','CST301 算法设计与分析','CSE102 编程进阶'],papers:[{title:'Efficient Graph Traversal in Sparse Networks',venue:'IEEE TPAMI 2023'},{title:'A Novel Approach to Cache-Oblivious Data Structures',venue:'ACM TALG 2022'}],extraOfficeHour:'考试周加开：周二 10:00-12:00',phone:'0512-8816-1234',reviews:[{author:'李同学',text:'张老师讲链表反转那节课太清晰了，画图一步步推导，听完就懂了。',rating:5},{author:'匿名学生',text:'Office Hour非常耐心，帮我debug了半小时的代码。',rating:5},{author:'王同学',text:'建议上课前预习一下，语速稍微有点快但知识点覆盖很全。',rating:4}],projects:[{id:'rp1',title:'高性能图算法在社交网络中的应用研究',desc:'探索大规模稀疏图的社区检测与路径优化算法，与腾讯AI Lab合作项目。',positions:[{id:'pos1',name:'图算法研究助理',type:'RA',slots:2,hours:'每周8-10小时',deadline:'2026-09-15',period:'2026.09 - 2027.01',status:'open',desc:'参与图算法论文复现、数据集构建与实验评估。熟悉Python和基础图论，有C++经验加分。',responsibilities:['参与图算法论文复现、数据集构建与实验评估','协助撰写实验报告与论文文献调研','维护项目代码库，参与组会讨论'],reqs:['熟悉Python和基础图论','有C++经验优先','大二及以上年级'],reqs_hard:['Python / PyTorch 基础','英文文献阅读能力','每周保证固定工作时间'],reqs_plus:['NLP 项目经验','ACM / ICPC 竞赛经历','顶会论文发表'],work_hours:'每周三/五 下午 14:00-18:00（可协商）',salary:'180 元/天 · 按月结算',max_applicants:2,current_applicants:1,benefits:['科研项目参与证明','论文署名机会（视贡献度而定）','推荐信（表现优异者）']},{id:'pos2',name:'ICPC竞赛训练营助教',type:'项目助理',slots:1,hours:'每周4-6小时',deadline:'2026-08-20',period:'2026.09 - 2026.12',status:'open',desc:'协助组织校内ICPC训练营，出题、讲评和答疑。ACM区域赛获奖经历优先。',responsibilities:['协助组织校内 ICPC 训练营','负责训练题出题、讲评与答疑','参与训练计划制定与学员进度跟踪'],reqs:['熟悉C++或Java','有ACM/ICPC竞赛经历优先','耐心负责'],reqs_hard:['C++ 或 Java 熟练','耐心负责、表达清晰'],reqs_plus:['ACM / ICPC 区域赛获奖','竞赛教学或辅导经验'],work_hours:'每周二/四 晚 19:00-21:00（可协商）',salary:'80 元/次 · 按次结算',max_applicants:1,current_applicants:0,benefits:['助教证书','竞赛奖金分成','名企内推机会']}]}]},{id:'t2',name:'赵敏教授',faculty:'智能工程学院',title:'教授',titleLabel:'教授、博士生导师',course:'机器学习导论',courseCode:'INT305',tags:['🏆 教学名师','📅 本周可约'],status:'online',officeHour:'周三 14:00-16:00',location:'EB 305',bio:'NLP领域深耕15年，开放暑期实习名额。',color:'#a8b5c8',rating:4.9,reviews_total:87,education:{phd:'清华大学 · 计算机科学博士',master:'清华大学 · 人工智能硕士',bachelor:'复旦大学 · 数学与应用数学学士'},research:'自然语言处理、大语言模型可信评估、可控文本生成',courses_taught:['INT305 机器学习导论','INT402 自然语言处理','CSE203 Python科学计算'],papers:[{title:'Hallucination Detection in Large Language Models',venue:'ACL 2024'},{title:'Controllable Text Generation with Diffusion Models',venue:'EMNLP 2023'}],extraOfficeHour:'',phone:'0512-8816-5678',reviews:[{author:'陈同学',text:'赵教授的NLP课是我大学最有收获的课，项目选题给了很多启发。',rating:5},{author:'张同学',text:'科研指导非常负责，每周组会都会认真看我的进展。',rating:5}],projects:[{id:'rp2',title:'大语言模型的可信评估与幻觉检测',desc:'国家自然科学基金面上项目，探索LLM生成内容的真实性检测方法。与清华AIR联合研究。',positions:[{id:'pos3',name:'大模型微调研究助理',type:'RA',slots:2,hours:'每周10小时',deadline:'2026-09-10',status:'open',desc:'参与LLM微调实验、数据集标注、消融实验和论文撰写。有NLP课程基础即可，提供完整培训。',reqs:['熟悉Python/PyTorch','有NLP基础者优先','英文文献阅读能力'],benefits:['科研经历证明+推荐信','项目劳务补贴 ¥1200/月','论文署名机会（CCF-A类）']},{id:'pos4',name:'智能问答系统 · 毕设辅导',type:'毕业设计',slots:1,hours:'每周6小时',deadline:'2026-08-25',status:'closed',desc:'基于知识图谱的校园智能答疑系统开发，完成前后端全栈开发。适合大四毕设方向。',reqs:['全栈开发经验','熟悉Vue3或React','有知识图谱/Django经验优先'],benefits:['毕业设计导师指导','项目部署到学校服务器']}]}]},{id:'t3',name:'王磊教授',faculty:'数学物理学院',title:'教授',titleLabel:'教授',course:'微积分',courseCode:'MTH008',tags:['🏆 教学名师'],status:'busy',officeHour:'周一 15:00-17:00',location:'CB 201',bio:'剑桥数学博士，擅长启发式教学。',color:'#b8c9a8',rating:4.7,reviews_total:95,education:{phd:'剑桥大学 · 数学博士',master:'剑桥大学 · 数学硕士',bachelor:'北京大学 · 数学科学学院学士'},research:'微分方程、数学建模、应用数学',courses_taught:['MTH008 微积分','MTH201 线性代数','MTH302 概率论与数理统计'],papers:[{title:'Asymptotic Analysis of Nonlinear PDEs',venue:'J. Differential Equations 2024'}],extraOfficeHour:'',phone:'0512-8816-9012',reviews:[{author:'赵同学',text:'王老师的微积分板书太漂亮了，每道题都从定义出发推导。',rating:5},{author:'匿名学生',text:'作业有点多但确实有用，考试前复习课会讲重点。',rating:4}]},{id:'t4',name:'Dr. Sarah Chen',faculty:'语言学院',title:'讲师',titleLabel:'讲师、EAP中心主任',course:'学术英语',courseCode:'EAP023',tags:['📅 本周可约'],status:'online',officeHour:'周五 09:00-11:00',location:'CB 567',bio:'帮助过300+学生提升学术写作水平。',color:'#c8b5a8',rating:4.6,reviews_total:156,education:{phd:'约克大学 · 应用语言学博士',master:'UCL · TESOL硕士',bachelor:'北京外国语大学 · 英语语言文学学士'},research:'二语习得、学术写作教学、跨文化交际',courses_taught:['EAP023 学术英语','EAP101 学术写作基础'],papers:[{title:'Peer Feedback in EAP Writing',venue:'Journal of Second Language Writing 2023'}],extraOfficeHour:'',phone:'0512-8816-3456',reviews:[{author:'王同学',text:'Dr. Chen改essay超级仔细，每个语法点都会标注并解释原因。',rating:5},{author:'刘同学',text:'口语课的氛围很轻松，分组讨论的形式让我没那么紧张。',rating:5},{author:'匿名学生',text:'给分比较严格但学到的真的多。',rating:4}]},{id:'t5',name:'Amy Wang',faculty:'智能工程学院',title:'助教',titleLabel:'CSE101助教',course:'程序设计基础',courseCode:'CSE101',tags:[],status:'online',officeHour:'周二 16:00-18:00',location:'EB 101',bio:'大三学姐，CSE101拿了A+。',color:'#a8c4c8',rating:4.9,reviews_total:42,education:{bachelor:'西交利物浦大学 · 计算机科学与技术（在读大三）'},research:'',courses_taught:['CSE101 程序设计基础（助教）'],papers:[],extraOfficeHour:'期末前加开：周日 14:00-17:00',phone:'',reviews:[{author:'大一新生',text:'Amy学姐讲Python的list comprehension特别清楚，还分享了自己的期末笔记。',rating:5},{author:'匿名学生',text:'去问了好几次问题，每次都耐心解释到我真的理解。',rating:5}]},{id:'t6',name:'刘学长',faculty:'智能工程学院',title:'助教',titleLabel:'CST201助教',course:'数据结构与算法',courseCode:'CST201',tags:[],status:'offline',officeHour:'周三 19:00-21:00',location:'线上',bio:'刷过500道LeetCode。',color:'#c8a8b8',rating:4.5,reviews_total:28,education:{bachelor:'西交利物浦大学 · 数据科学与大数据技术（在读大四）'},research:'',courses_taught:['CST201 数据结构与算法（助教）'],papers:[],extraOfficeHour:'',phone:'',reviews:[{author:'大二同学',text:'LeetCode刷题经验太有用了，教了滑动窗口和双指针的解题模版。',rating:5},{author:'匿名学生',text:'线上答疑回复很快，有时候晚上11点还在回消息。',rating:4}]},{id:'t7',name:'张明教授',faculty:'智能工程学院',title:'副教授',titleLabel:'副教授',course:'深度学习与计算机视觉',courseCode:'CST301',tags:['📅 本周可约'],status:'online',officeHour:'周四 10:00-12:00',location:'EB 412',bio:'浙大博士，曾任商汤CV研究员。',color:'#a8b5c8',rating:4.7,reviews_total:65,education:{phd:'浙江大学 · 计算机科学博士',master:'浙江大学 · 计算机科学硕士',bachelor:'浙江大学 · 计算机科学与技术学士'},research:'计算机视觉、自动驾驶感知、多模态学习',courses_taught:['CST301 深度学习与计算机视觉','CST401 图像处理'],papers:[{title:'3D Object Detection with Point Clouds',venue:'CVPR 2024'},{title:'Multi-modal Fusion for Autonomous Driving',venue:'ICCV 2023'}],extraOfficeHour:'',phone:'0512-8816-7890',reviews:[{author:'王同学',text:'张教授的CV课实验设计很实用，学完就能搭自己的检测模型。',rating:5},{author:'匿名学生',text:'论文复现小组氛围很好，学到了很多实战经验。',rating:5}]}];
/* ═══ XJTLU FACULTY-COURSE MAPPING ═══ */
const FACULTY_COURSES_MAP={'智能工程学院':{label:'智能工程学院',courses:['CST201','CSE101','INT305','CST301','CSE102','INT402','CSE203']},'数学物理学院':{label:'数学物理学院',courses:['MTH008']},'语言学院':{label:'语言学院',courses:['EAP023']},'西浦国际商学院':{label:'西浦国际商学院',courses:[]},'人文社科学院':{label:'人文社科学院',courses:[]},'设计学院':{label:'设计学院',courses:[]}};
const CHAT_MESSAGES={};
const MOCK_MSGS=[{id:'m1',contact:'张启明',avatar:'张',role:'副教授',tag:'recruit',tagLabel:'RA申请',lastMsg:'好的，简历已收到。下周三下午3点来面聊。',time:'2026-08-10T15:00',msgs:[{from:'self',text:'张老师您好！我是计算机2101班张三，对您图算法RA岗位很感兴趣。',time:'2026-08-09T10:00'},{from:'contact',text:'你好张三！可以先发一份简历给我看看吗？',time:'2026-08-09T14:00'},{from:'self',text:'好的老师，这是我的简历。',time:'2026-08-09T14:30'},{from:'contact',text:'好的，简历已收到。下周三下午3点来面聊。',time:'2026-08-10T15:00'}],status:'面谈中'},{id:'m2',contact:'赵敏教授',avatar:'赵',role:'教授',lastMsg:'目前还有2个RA名额，欢迎下周来实验室参观。',time:'2026-08-08T16:00',msgs:[{from:'self',text:'赵教授您好，想咨询一下NLP项目RA的具体要求。',time:'2026-08-08T10:00'},{from:'contact',text:'你好！你有哪些NLP基础呢？',time:'2026-08-08T14:00'},{from:'self',text:'修过INT305，用PyTorch做过文本分类项目。',time:'2026-08-08T15:00'},{from:'contact',text:'很好的基础！目前还有2个RA名额，欢迎下周来实验室参观。',time:'2026-08-08T16:00'}],status:'沟通中'},{id:'m3',contact:'Amy Wang',avatar:'A',role:'助教',lastMsg:'Python的list comprehension常考，给你发了几个练习题。',time:'2026-08-07T20:00',msgs:[{from:'self',text:'Amy学姐，CSE101期中备考有什么建议？',time:'2026-08-07T18:00'},{from:'contact',text:'建议重点复习前三章。给你发了几个练习题。',time:'2026-08-07T20:00'}],status:''},{id:'m4',contact:'Dr. Sarah Chen',avatar:'S',role:'讲师',tag:'office_hour',tagLabel:'📅 预约确认',lastMsg:'已确认：本周五09:00-10:00 Office Hour。',time:'2026-08-06T09:00',msgs:[{from:'system',text:'📅 预约确认：周五09:00-10:00，CB 567。请准时参加。',time:'2026-08-06T09:00'}],status:'已确认'}];
const OPP_CATEGORIES=[{id:'all',label:'全部'},{id:'competition',label:'赛事经纬'},{id:'research',label:'学术共研'},{id:'project',label:'项目实战'},{id:'sports',label:'体育联盟'}];
const SUB_CATEGORIES={competition:['商赛','数学建模大赛','创新创业大赛','程序设计竞赛','英语演讲','机器人竞赛'],research:['AI/机器学习','社会科学','生命科学','物理/工程','人文艺术','数据科学'],project:['创业孵化','开源贡献','课程项目','社会实践','公益创新'],sports:['篮球','足球','飞盘','健身搭档','羽毛球','游泳']};
const CAT_ICONS={competition:'trophy',research:'microscope',project:'rocket',sports:'volleyball'};
const DANMU_PRESET=['今天也要加油呀','图书馆的咖啡救了我的命','有一起准备期末考的吗','好想出去走走','教授今天穿的袜子好可爱','谁能告诉我DDL是什么时候','中心湖的鸭子今天又胖了一圈','图书馆三楼靠窗的位置永远抢不到','食堂阿姨今天多给了我一块肉','论文写到凌晨三点 天都亮了','有人一起夜跑吗','期末周唯一的精神支柱是奶茶','B楼电梯今天又双叒叕坏了','组会前十分钟 大脑一片空白','下学期一定要早起去占座','谁懂啊 在走廊背书被教授表扬了','新来的小猫蹲在CB门口 好想rua','下雨天适合在宿舍躺平','实验报告终于写完了 撒花','今天也是元气满满的一天'];
const DANMU_BANNED=['傻逼','脑残','智障','低能','垃圾','废物','去死','贱人','婊子','妈的','操你','滚蛋','卧槽','傻叉','沙比','nmsl','cnm','wcnm','你妈','fuck','shit','bitch','死全家','全家桶'];
const ROLE_TYPES=['核心成员','灵感合伙人','学徒求带','散人组局'];
const COLLAB_MODES=['冲刺型','稳健型','灵感碰撞型'];
const EVENT_CATEGORIES=['全部','讲座','Workshop','兴趣活动','校外导师','社团活动','职业发展'];

/* ═══ STATE ═══ */
let state={
  route:'feed',section:'all',
  posts:MOCK_POSTS,notifications:MOCK_NOTIFICATIONS,resources:MOCK_RESOURCES,questions:MOCK_QUESTIONS,
  directoryPeople:MOCK_DIRECTORY,directoryKeyword:'',contactFilter:'all',activeDirectoryChat:'',directoryChatContact:null,directoryChatMsgs:{},groups:MOCK_GROUPS,
  treeholes:MOCK_TREEHOLES,treeholeText:'',treeholeDetail:'',activeTreeholeComment:'',treeholeMedia:[],treeholeComposing:false,
  danmuWall:false,danmuSpawned:false,danmuText:'',danmuList:[],
  danmuPokes:{'图书馆的咖啡救了我的命':15,'今天也要加油呀':12,'期末周唯一的精神支柱是奶茶':9,'中心湖的鸭子今天又胖了一圈':7,'谁能告诉我DDL是什么时候':6,'好想出去走走':4},
  composerExpanded:false,composerText:'',composerSection:'campus-life',composerAnonymous:false,composerTitle:'',composerTags:'',composing:false,
  search:{keyword:'',type:'all',section:'all',mode:'search',loading:false,result:null,error:'',aiReply:'',aiLoading:false},aiReplies:{},commentAIReplies:{},aiActivePost:'',aiBusy:{},resAI:{open:'',loading:false,reply:'',question:''},
  aiChat:{open:false,msgs:[],loading:false},
  resourceCatalog:{years:[{value:'Year 1',label:'大一'},{value:'Year 2',label:'大二'},{value:'Year 3',label:'大三'},{value:'Year 4',label:'大四'}],terms:[{value:'Semester 1',label:'上学期'},{value:'Semester 2',label:'下学期'}],majors:[{value:'ICS',label:'信息与计算科学'},{value:'CST',label:'计算机科学与技术'},{value:'DMT',label:'数字媒体技术'},{value:'EEE',label:'电气工程及其自动化'},{value:'MRS',label:'机械电子工程'},{value:'ARC',label:'建筑学'},{value:'CEN',label:'土木工程'},{value:'BIO',label:'生物科学'},{value:'CHE',label:'应用化学'},{value:'MTH',label:'金融数学'},{value:'ECO',label:'经济与金融'},{value:'BUS',label:'工商管理'},{value:'ACC',label:'会计学'},{value:'ENG',label:'英语研究'},{value:'COM',label:'传播学'}],courses:[{id:'c1',code:'CSE101',name:'程序设计基础',year:'Year 1',term:'Semester 2',major:'ICS',credits:4,desc:'学习Python编程基础、数据结构和算法入门。',instructor:'Prof. Li'},{id:'c2',code:'MTH008',name:'微积分',year:'Year 1',term:'Semester 1',major:'MTH',credits:5,desc:'涵盖极限、导数、积分和微分方程基础。',instructor:'Prof. Chen'},{id:'c3',code:'INT305',name:'机器学习导论',year:'Year 3',term:'Semester 1',major:'ICS',credits:4,desc:'监督学习、无监督学习、深度学习和模型评估。',instructor:'Prof. Zhang'},{id:'c4',code:'EAP023',name:'学术英语',year:'Year 2',term:'Semester 1',major:'All',credits:3,desc:'学术阅读、写作和演讲技巧。',instructor:'EAP中心'},{id:'c5',code:'CST201',name:'数据结构与算法',year:'Year 2',term:'Semester 1',major:'CST',credits:4,desc:'数组、链表、树、图等经典数据结构及算法分析。',instructor:'Prof. Wang'},{id:'c6',code:'DMT101',name:'数字媒体基础',year:'Year 1',term:'Semester 2',major:'DMT',credits:3,desc:'数字图像处理、音频视频基础、交互设计原理。',instructor:'Prof. Liu'}]},
  resourceFilters:{keyword:'',year:'all',term:'all',major:'all',course:'all',type:'all',source:'all',time:'all',types:[]},
  resourceTab:'public',resCourseDetail:'',resDetail:'',resSaved:{},resUploaded:{},resNotes:{},resDownloaded:{},resUploadForm:false,resUploadStep:1,resUploadData:{title:'',course:'',type:'',desc:'',fileName:'',fileType:'',keywords:'',major:'',grade:'',allowDownload:true},resComments:{},resRating:{},points:{balance:0,unlocked:{},seenIntro:true,loaded:false,freeCount:10,unlockCost:10,uploadReward:5},favTeachers:{t1:true},
  errors:{},activeReply:'',selectedPost:null,profileUser:null,profileHidden:{},contacts:[],feedScrollY:0,
  oppCat:'all',oppSub:'all',oppRole:'all',oppMode:'all',
  oppSearch:'',oppAI:false,oppAIText:'',oppAIPreview:null,oppAIGenerating:false,
  oppActiveApply:'',oppActiveGreet:'',oppActiveDetail:'',
  oppShowPublish:false,oppCompDetail:'',oppPreFillComp:'',
  oppProfView:'',oppChatProf:'',oppProfFromDetail:'',oppChatFromDetail:'',
  evtCat:'全部',evtTimeFilter:'month',evtTypes:[],evtDateSearch:'',evtCalendarMonth:8,evtCalendarYear:2026,evtDetail:'',evtShowMy:false,evtSelectedDay:'',
  publishForm:{title:'',category:'competition',sub_category:'',role_type:'核心成员',collab_mode:'冲刺型',description:'',skills:[],deadline:'',capacity:3,members:[{name:'',role:'',skills:'',style:''}],preferred:'',commitment:'',team_fit:''},
  theme:'light',qaTab:0,qaCourse:'all',qaKeyword:'',qaDetail:'',qaBookmarked:{},qaFrom:'',qaAskForm:null,qaAskStep:1,qaAskCourse:'',qaAskTitle:'',qaAskDetails:'',qaAskTags:[],qaAskCustomTag:'',qaAskAnonymous:false,qaAskMedia:[],qaAskMediaType:'',teacherFilter:{dept:'all',course:'all',title:'all',search:''},teacherDetail:'',teacherFrom:'',recruitDetail:'',recruitForm:{resume:'',statement:'',note:'',errors:{}},recruitSubmitting:false,myApplications:[{id:'app_0',posId:'pos1',posName:'图算法研究助理',teacher:'张启明',teacherTitle:'副教授',resumeName:'通用简历 · 主版本',statement:'对图算法方向有浓厚兴趣，修读过数据结构与算法，有C++竞赛经历。',note:'',time:'2026-08-10T09:00',status:'已投递'}],bookings:[],composeMedia:[],msgTab:0,activeMsg:'',collView:'',collTab:0,collShowNew:false,collActiveFolder:'',collAddOpen:false,collFolders:[{id:'f1',name:'大三上核心课',color:'#c9b99a',items:['r1','r3'],updated:'2026-08-10',public:false},{id:'f2',name:'期末复习合集',color:'#a8b5c8',items:['r2','r6'],updated:'2026-08-08',public:false},{id:'f3',name:'AI与编程',color:'#b8c9a8',items:['r5'],updated:'2026-08-05',public:true}],tchatPendingImage:'',
  notifSettings:{urgent:true,normal:true,optional:true},notifShowSettings:false,notifPrefsShow:false,notifTab:'current',notifTimeRange:'3days',notifCustomStart:'',notifCustomEnd:'',notifShowCustomPicker:false,
  notifPrefs:{channelInApp:true,channelEmail:{urgent:true,normal:false,optional:false},channelBrowser:false,normalSections:{topic:true,qa:true,like:true,reminder:true,update:true,deadline:true},optionalEnabled:true,dndEnabled:false,dndStart:'22:00',dndEnd:'07:00'},
  ohModal:{teacher:null,step:1,date:'',slot:'',topic:''},
  dirResumePick:false,dirResumeTarget:'',dirResumeSelected:'',
  ccModal:{person:null,step:1,date1:'',time1:'',date2:'',time2:'',location:'',topic:''},
  hotTab:'all',hotTick:0,hotPaused:false,_hotRendered:false,_lastHotKey:'',
  posterIdx:0,posterPaused:false,posterPool:[],_posterRendered:false,
  profileTab:0,myPostsFilter:'all',favTypeFilter:'all',profileMenuOpen:false,
  resumes:ME_RESUMES.map(r=>({...r})),resumeDefaultId:'rv1',
  homeDefault:'feed',privacyPrefs:{showPosts:true,showBookmarks:true,showResume:true,showActivity:true},
  verifyModal:false,verifyStep:1,verifyForm:{studentId:'2112098',name:'张三',idLast6:'',college:'智能工程学院',role:'student',department:''},
  editProfileModal:false,editProfileForm:{bio:'计算机科学·大三 | 喜欢AI和开源 | 竞赛选手',email:'zhangsan@student.xjtlu.edu.cn',links:{github:'github.com/zhangsan',blog:'blog.zhangsan.dev'}}
};

/* ═══ API LAYER ═══ */
/* 后端在线时，读操作从 /api 拉取真实数据，写操作提交到后端持久化；
   后端离线时，自动回退到本地 mock 数据（原 demo 模式），前端功能不受影响。 */
let apiOnline=false;
async function apiFetch(path,options){
  var opt=Object.assign({method:'GET',headers:{}},options||{});
  if(opt.body!=null){
    if(typeof opt.body==='object'){opt.body=JSON.stringify(opt.body)}
    if(!opt.headers['Content-Type'])opt.headers['Content-Type']='application/json';
  }
  var res=await fetch(path,opt);
  if(!res.ok){var d={};try{d=await res.json()}catch(e){}var detail=d.detail;if(Array.isArray(detail))detail=detail.map(function(x){return (x.loc?x.loc.join('.')+': ':'')+(x.msg||'')}).join('; ');throw new Error(detail||('HTTP '+res.status))}
  return res.json();
}
/* 读数据：启动时从后端拉取覆盖 state，任一失败则保留 mock */
async function loadFromApi(){
  var tasks=[
    ['posts','/api/community/feed','posts'],
    ['notifications','/api/notifications','notifications'],
    ['resources','/api/courses/resources','resources'],
    ['questions','/api/courses/qa','questions'],
    ['groups','/api/groups','groups'],
    ['treeholes','/api/treehole/hot','posts']
  ];
  var results=await Promise.allSettled(tasks.map(function(t){return apiFetch(t[1]).then(function(d){return{key:t[0],data:(d&&d[t[2]]&&d[t[2]].length)?d[t[2]]:null}})}));
  var ok=0;
  results.forEach(function(r){if(r.status==='fulfilled'&&r.value&&r.value.data){state[r.value.key]=r.value.data;ok++}});
  if(ok>0){apiOnline=true;render()}
}
/* 写操作：后端在线时 fire-and-forget 提交，失败仅提示不阻断本地体验 */
function apiWrite(path,body,okMsg){
  if(!apiOnline)return;
  apiFetch(path,{method:'POST',body:body}).then(function(){if(okMsg)toast(okMsg)}).catch(function(e){toast('同步失败：'+e.message,'error')});
}

/* ═══ 积分制 Points System ═══ */
async function loadPoints(){
  try{
    var d=await apiFetch('/api/points');
    var unlocked={};(d.unlocked||[]).forEach(function(id){unlocked[id]=true});
    state.points={balance:d.points||0,unlocked:unlocked,seenIntro:!!d.seen_intro,loaded:true,freeCount:d.free_count||10,unlockCost:d.unlock_cost||10,uploadReward:d.upload_reward||5};
    render();
  }catch(e){state.points.loaded=true}
}
/* 判断一份资料是否处于锁定状态（公共资料库前10份免费；之后需积分解锁；自己上传的永远免费） */
function resIsLocked(r){
  var p=state.points||{};
  var idx=state.resources.indexOf(r);
  if(idx<0||idx<(p.freeCount||10))return false;
  if(p.unlocked&&p.unlocked[r.id])return false;
  if(r.uploader_id&&state.authSession&&r.uploader_id===state.authSession.user_id)return false;
  return true;
}
/* 解锁一份资料（消耗积分） */
function unlockAttempt(rid){
  var r=state.resources.find(function(x){return x.id===rid});
  if(!r||!resIsLocked(r))return;
  var cost=(state.points&&state.points.unlockCost)||10;
  apiFetch('/api/resources/unlock',{method:'POST',body:{resource_id:rid}}).then(function(d){
    if(d.points!=null)state.points.balance=d.points;
    if(d.unlocked){var u={};d.unlocked.forEach(function(id){u[id]=true});state.points.unlocked=u}
    state.resDownloaded[rid]=true;
    toast('🔓 解锁成功！消耗 '+cost+' 积分，当前余额 '+state.points.balance+' 分');
    render();
  }).catch(function(e){toast(e.message||'解锁失败','error')});
}

/* ═══ ROUTER ═══ */
function routeTo(r){state.route=r;state.selectedPost=null;state.oppActiveDetail='';state.evtDetail='';state.oppCompDetail='';state.oppProfView='';state.oppChatProf='';state.teacherFrom='';state.profileReturn=false;render();window.scrollTo({top:0})}

/* ═══ FILTERS ═══ */
function filteredOpps(){let items=[...DEMO_OPPORTUNITIES];if(state.oppCat!=='all')items=items.filter(i=>i.category===state.oppCat);if(state.oppSub!=='all')items=items.filter(i=>i.sub_category===state.oppSub);if(state.oppRole!=='all')items=items.filter(i=>i.role_type===state.oppRole);if(state.oppMode!=='all')items=items.filter(i=>i.collab_mode===state.oppMode);if(state.oppSearch.trim()){const kw=state.oppSearch.trim().toLowerCase();items=items.filter(i=>i.title.toLowerCase().includes(kw)||(i.skills||[]).some(s=>s.toLowerCase().includes(kw))||(i.tags||[]).some(t=>t.toLowerCase().includes(kw))||(i.ai_summary||'').toLowerCase().includes(kw)||(i.owner||'').toLowerCase().includes(kw))}return items}

/* ═══ RENDER ═══ */
function render(){
  document.querySelectorAll('[data-route]').forEach(b=>b.classList.toggle('is-active',b.dataset.route===state.route));
  if(state.route==='feed'||state.route==='detail')renderFeed();
  else if(state.route==='opportunities')renderOpportunities();
  else if(state.route==='events')renderEvents();
  else if(state.route==='search')renderSearch();
  else if(state.route==='notifications')renderNotifications();
  else   if(state.route==='resources'||state.route==='resource-detail'){if(state.route==='resource-detail'&&state.resDetail){renderResDetail();return}renderResources();}
  else if(state.route==='qa')renderQa();
  else if(state.route==='directory')renderDirectory();
  else if(state.route==='treehole')renderTreehole();
  else if(state.route==='teachers')renderTeachers();
  else if(state.route==='profile')renderProfile();
  else renderFeed();
  refreshIcons();
  // Update nav notification badge — only count unread urgent+normal in current zone
  var currentUnread=state.notifications.filter(function(n){return isWithinDays(n.time,2)&&(n.level==='urgent'||n.level==='normal')&&!n.read}).length;
  document.querySelectorAll('.nav-item[data-route="notifications"], .icon-button[data-route="notifications"], .mobile-nav [data-route="notifications"]').forEach(function(btn){
    var old=btn.querySelector('.nav-badge');if(old)old.remove();
    if(currentUnread){var b=document.createElement('span');b.className='nav-badge';b.textContent=currentUnread;btn.appendChild(b)}
  });
  // Apply i18n translation after render
  if(typeof applyI18N==='function')applyI18N();
}

/* ═══ HELPERS ═══ */
/* ── Mock AI 层：契约对齐原版 POST /api/chat（{session_id,message,context:{type,label,text}} → {reply}）
     后端上线后只需将此函数体替换为 fetch('/api/chat',...)，所有触点零改动 ── */
function mockAIChat(payload){
  var ctx=payload.context||{},msg=(payload.message||'').trim(),type=ctx.type||'general';
  var kw=(msg||ctx.label||'').slice(0,24);
  var reply='';
  if(type==='search'){
    var r=state.search.result||{},parts=[];
    if((r.posts||[]).length)parts.push((r.posts.length)+'条相关话题');
    if((r.resources||[]).length)parts.push((r.resources.length)+'份课程资料');
    if((r.events||[]).length)parts.push((r.events.length)+'个活动');
    reply='关于「'+kw+'」，我为你检索到'+(parts.length?parts.join('、'):'暂时没有直接匹配的内容')+'。'+
      ((r.resources||[]).length?('建议优先查看资料《'+r.resources[0].name+'》（'+r.resources[0].course+'），与你的关键词相关度最高。'):'')+
      '如需进一步筛选，可以在左侧切换内容类型，或换用课程代码（如 CSE101）重新检索。';
  }else if(type==='post'||type==='post-draft'){
    var text=(ctx.text||'').replace(/\s+/g,'');
    var head=text.slice(0,40);
    reply='这条话题的核心信息是：'+(head.length>=40?head+'…':head||'（内容较短）')+'。从讨论角度看，建议补充：1) 具体场景与时间；2) 你已尝试的解决办法；3) 希望获得的帮助类型。这样其他同学或课程团队能更快给出有效回应。';
  }else if(type==='resource'){
    reply='基于这份资料的元数据（'+(ctx.label||'课程资料')+'），它适合用于课程复习与考前梳理。建议：1) 先看目录结构定位薄弱章节；2) 配合课件交叉验证重点；3) 若有配套试卷，先限时模拟再对答案。重要学术问题请以教师讲解或官方资料为准。';
  }else if(type==='comment'){
    reply='这条评论我理解的重点是「'+kw+'…」。我的建议：1) 如果是提问，补充课程代码与具体章节能让回答更精准；2) 如果是经验分享，可以举一个具体例子增强说服力。此回答由 AI 生成，可能存在不准确之处，请自行判断。';
  }else if(type==='campus'){
    reply=aiCampusReply(msg);
  }else{
    reply='我理解你想了解「'+kw+'」。在校园场景下，建议：1) 用课程代码在资料库精确检索；2) 在课程问答区查看是否有相似问题；3) 若涉及截止日期等重要事项，请以官方通知为准核对。';
  }
  return new Promise(function(resolve){setTimeout(function(){resolve({reply:reply})},800)})
}
/* ── AI 校园知识库 ── */
var AI_CHAT_SUGGESTIONS=[
  '西浦有哪些学院和专业？',
  '怎么联系老师咨询或预约Office Hour？',
  '有哪些课程资料可以下载？',
  '最近有什么活动或比赛？',
  '组队招募怎么用？',
  '课程问答怎么提问？'
];
function aiCampusReply(msg){
  var q=(msg||'').toLowerCase();
  var hits=[];
  /* 学校概况 */
  if(/西浦|西交利物浦|xjtlu|学校|合作|2\+2|4\+x|校区|独墅湖/.test(q)){
    hits.push('西交利物浦大学（XJTLU）是经教育部批准的中英合作办学大学，位于苏州独墅湖科教创新区。学校提供"2+2"（前两年在西浦，后两年赴利物浦大学）和"4+X"（全本在西浦）两种学制模式。校园拥有CB教学楼、图书馆、白鹭园等设施，融合中英教育特色。');
  }
  /* 学院专业 */
  if(/学院|专业|faculty|智能工程|数学物理|语言|商|人文社科|设计/.test(q)){
    var fl=Object.keys(FACULTY_COURSES_MAP).map(function(k){return FACULTY_COURSES_MAP[k].label}).join('、');
    var majors=state.resourceCatalog.majors.map(function(m){return m.label}).join('、');
    hits.push('西浦设有'+fl+'等6大学院。平台已覆盖的专业包括：'+majors+'等。在左侧「课程资料」中可按专业筛选相关资料。');
  }
  /* 课程 */
  if(/课程|选课|课|course|cse|mth|int|eap|cst|dmt/.test(q)){
    var cl=state.resourceCatalog.courses.map(function(c){return c.code+' '+c.name}).join('；');
    hits.push('平台当前收录的课程有：'+cl+'。在「课程资料」板块可按课程代码筛选资料，在「课程问答」板块可针对具体课程提问。');
  }
  /* 课程资料 */
  if(/资料|下载|课件|笔记|试卷|复习/.test(q)){
    var rl=MOCK_RESOURCES.slice(0,6).map(function(r){return '《'+r.name+'》('+r.course+')'}).join('、');
    hits.push('资料库现有'+MOCK_RESOURCES.length+'份课程资料，包括：'+rl+'等。可在「课程资料」板块按年份、学期、专业、课程筛选和下载。');
  }
  /* 课程问答 */
  if(/问答|提问|问题|question|qa/.test(q)){
    var qs=MOCK_QUESTIONS.slice(0,3).map(function(qa){return '「'+qa.question+'」'}).join('、');
    hits.push('课程问答板块目前有'+MOCK_QUESTIONS.length+'个问题，热门包括：'+qs+'。点击「课程问答」→选择课程→点击「提问」即可发布你的问题。');
  }
  /* 教师咨询 */
  if(/老师|教师|教授|consult|咨询|office hour|oh/.test(q)){
    var tl=MOCK_TEACHERS.map(function(t){return t.name+'（'+t.course+'）'}).join('、');
    hits.push('教师咨询板块收录了'+tl+'等老师。你可以查看老师详情、预约Office Hour、申请RA岗位，或通过站内信与老师沟通。');
  }
  /* 活动 */
  if(/活动|event|讲座|workshop|社团/.test(q)){
    var el=DEMO_EVENTS.slice(0,5).map(function(e){return '「'+e.title+'」('+formatTime(e.time)+')'}).join('、');
    hits.push('近期活动有：'+el+'等。在「活动」板块可查看详情并报名，支持按类型和日期筛选。');
  }
  /* 竞赛 */
  if(/竞赛|比赛|comp|互联网|数学建模|robomaster|挑战杯/.test(q)){
    var cl2=UPCOMING_COMPETITIONS.map(function(c){return c.name}).join('、');
    hits.push('当前热门赛事包括：'+cl2+'。在「组队招募」→「赛事经纬」中可查看赛事详情、截止日期和组队信息。');
  }
  /* 组队招募 */
  if(/组队|招募|opp|team|合伙/.test(q)){
    var ol=DEMO_OPPORTUNITIES.slice(0,3).map(function(o){return '「'+o.title+'」'}).join('、');
    hits.push('组队招募板块现有'+DEMO_OPPORTUNITIES.length+'个招募信息，包括：'+ol+'等。支持按类型（赛事/科研/项目/体育）、角色、协作模式筛选，并可申请加入。');
  }
  /* 通讯录 */
  if(/通讯录|联系人|消息|私信|message|directory/.test(q)){
    hits.push('通讯录板块支持与同学和老师站内信沟通，可发送消息、预约Office Hour、发起Coffee Chat、发送简历等。现有'+state.directoryPeople.length+'位联系人，包括教授、助教和同学。');
  }
  /* 树洞 */
  if(/树洞|匿名|treehole|吐槽/.test(q)){
    hits.push('匿名树洞板块支持完全匿名发表心声，保护隐私。还有弹幕墙功能，可以在校园话题中发送飞驰弹幕。');
  }
  /* 通知 */
  if(/通知|消息中心|notif/.test(q)){
    hits.push('通知中心采用三级分级体系：紧急（红色竖条）、普通（灰色竖条）、可选（浅色）。支持站内信、邮件、浏览器推送三种渠道，可自定义偏好设置和免打扰时段。');
  }
  /* 搜索 */
  if(/搜索|search|检索/.test(q)){
    hits.push('搜索功能支持双模式：内容搜索（话题/资料/活动）和问AI（输入关键词后AI帮你检索并总结）。在顶部搜索栏切换模式即可。');
  }
  /* 发布 */
  if(/发布|发帖|compose|写/.test(q)){
    hits.push('在左侧栏点击「发布话题」可以发布校园话题，支持选择板块（学术/校园生活/组队/兴趣）、添加标签、上传图片/视频。匿名树洞也支持独立发布入口。');
  }
  if(!hits.length){
    return '我是SURF Campus的AI校园助手，了解西交利物浦大学的方方面面。你可以问我：\n• 学院和专业信息\n• 课程和资料查询\n• 活动和竞赛\n• 教师咨询和Office Hour\n• 组队招募\n• 课程问答\n• 通讯录和消息\n• 匿名树洞\n• 通知设置\n\n请问你想了解什么？';
  }
  return hits.slice(0,2).join('\n\n')+(hits.length>2?'\n\n（还有更多相关信息，可以继续提问）':'')+'\n\n💡 此回答由AI生成，可能存在不准确之处，重要信息请以学校官方通知为准。';
}
/* ── AI Chat 弹窗 ── */
function openAiChat(){
  state.aiChat.open=true;
  if(!state.aiChat.msgs.length){
    state.aiChat.msgs=[{role:'bot',text:'你好！我是SURF Campus的AI校园助手 🎓\n我可以回答关于西交利物浦大学的各种问题——学院专业、课程资料、活动竞赛、教师咨询、组队招募等等。\n\n请问你想了解什么？'}];
  }
  renderAiChatModal();
}
function closeAiChat(){
  state.aiChat.open=false;
  var ov=document.getElementById('ai-chat-overlay');
  if(ov)ov.remove();
}
function sendAiChat(msg){
  if(!msg||!msg.trim())return;
  state.aiChat.msgs.push({role:'user',text:msg.trim()});
  state.aiChat.loading=true;
  renderAiChatModal();
  mockAIChat({session_id:'campus_chat_'+Date.now(),message:msg,context:{type:'campus',label:'校园助手',text:msg}}).then(function(ans){
    state.aiChat.msgs.push({role:'bot',text:ans.reply});
    state.aiChat.loading=false;
    renderAiChatModal();
  });
}
function renderAiChatModal(){
  var ov=document.getElementById('ai-chat-overlay');
  if(!state.aiChat.open){if(ov)ov.remove();return}
  var msgsHtml=state.aiChat.msgs.map(function(m){
    if(m.role==='bot'){
      return '<div class="ai-chat-msg bot"><span class="ai-chat-avatar"><i data-lucide="sparkles"></i></span><div class="ai-chat-bubble">'+escapeHTML(m.text).replace(/\n/g,'<br>')+'</div></div>';
    }
    return '<div class="ai-chat-msg user"><div class="ai-chat-bubble">'+escapeHTML(m.text).replace(/\n/g,'<br>')+'</div></div>';
  }).join('');
  if(state.aiChat.loading){
    msgsHtml+='<div class="ai-chat-msg bot"><span class="ai-chat-avatar"><i data-lucide="sparkles"></i></span><div class="ai-chat-bubble ai-chat-typing"><span></span><span></span><span></span></div></div>';
  }
  var chipsHtml=AI_CHAT_SUGGESTIONS.map(function(s){
    return '<button class="ai-chat-chip" data-ai-chat-chip="'+escapeHTML(s)+'">'+escapeHTML(s)+'</button>';
  }).join('');
  var html='<div class="publish-overlay" id="ai-chat-overlay">'+
    '<div class="ai-chat-modal">'+
      '<div class="ai-chat-header">'+
        '<span class="ai-chat-header-icon"><i data-lucide="sparkles"></i></span>'+
        '<div><strong>AI 校园助手</strong><small>了解西交利物浦大学的一切</small></div>'+
        '<button class="ai-chat-close" data-ai-chat-close><i data-lucide="x"></i></button>'+
      '</div>'+
      '<div class="ai-chat-window" id="ai-chat-window">'+msgsHtml+'</div>'+
      '<div class="ai-chat-chips">'+chipsHtml+'</div>'+
      '<form class="ai-chat-input-row" id="ai-chat-form">'+
        '<input type="text" id="ai-chat-input" placeholder="输入你的问题…" autocomplete="off">'+
        '<button type="submit" class="ai-chat-send" data-ai-chat-send><i data-lucide="send"></i></button>'+
      '</form>'+
      '<div class="ai-chat-footnote">AI 生成内容可能存在不准确之处，重要信息请以学校官方通知为准</div>'+
    '</div>'+
  '</div>';
  if(ov){ov.outerHTML=html}else{document.body.insertAdjacentHTML('beforeend',html)}
  refreshIcons();
  var w=document.getElementById('ai-chat-window');
  if(w)w.scrollTop=w.scrollHeight;
  var inp=document.getElementById('ai-chat-input');
  if(inp)inp.focus();
}
function renderPost(p,detail){var tags=(p.tags||[]).map(t=>`<button class="inline-tag" data-tag="${h(t)}">${h(t)}</button>`).join('');var media=p.media?.length?p.media.map(m=>`<div class="post-media"><img src="${h(m.url)}" alt="" style="max-width:100%;border-radius:8px;max-height:300px" loading=lazy></div>`).join(''):'';var bodyContent=detail?p.content:(p.content||'').split(/\n\n/).slice(0,2).join('\n\n');var cmts=detail?`<div class="comment-section"><div class="comment-count">共 ${p.comments_count||(p.comments||[]).length||0} 条评论</div>${(p.comments||[]).length?p.comments.map((c,i)=>`<div class="comment-item"><span class="comment-avatar">${h(c.anonymous?'匿':(c.author||'校').slice(0,1))}</span><div class="comment-body"><div class="comment-head"><span class="comment-name">${h(c.anonymous?'匿名同学':(c.author||'校园成员'))}</span><span class="comment-time">${h(formatTime(c.time||''))}</span></div><p class="comment-text">${h(c.content)}</p><div class="comment-foot"><button class="comment-like-btn${c.liked?' is-liked':''}" data-comment-like="${h(p.id)}:${i}"><i data-lucide="heart"></i><span>${c.likes||0}</span></button><button class="comment-reply-btn" data-comment-reply="${h(p.id)}:${i}">回复</button></div>${(c.replies||[]).length?c.replies.map(r=>`<div class="comment-reply"><span class="reply-author">${h(r.author||'匿名')}</span><span class="reply-text">${h(r.content)}</span></div>`).join(''):''}${state.commentAIReplies[h(p.id)+':'+i]?`<div class="ai-answer comment-ai-answer"><span class="ai-answer-icon"><i data-lucide="sparkles"></i></span><div class="ai-answer-body"><strong>AI 助手回应</strong><p>${h(state.commentAIReplies[h(p.id)+':'+i])}</p><small>AI 生成，可能存在不确定性；采纳前请自行验证或咨询课程团队。</small></div></div>`:''}<div class="reply-input-wrap" style="display:${state.activeReply===h(p.id)+':'+i?'flex':'none'}"><input class="reply-input" placeholder="回复..." data-reply-input="${h(p.id)}:${i}"><button class="reply-submit" data-reply-submit="${h(p.id)}:${i}">发送</button></div></div></div>`).join(''):`<div class="comment-empty">还没有评论，来发表第一条评论吧</div>`}<form class="comment-input-form" data-comment-form="${h(p.id)}"><span class="comment-avatar">张</span><div class="comment-input-wrap"><input class="comment-input-field" name="comment" placeholder="写下你的评论…" maxlength="500" autocomplete="off"><button type="button" class="ai-at-btn" data-ai-insert title="插入 @AI，评论后将获得 AI 回应"><i data-lucide="sparkles"></i>@AI</button><button type="submit" class="comment-submit-btn"><i data-lucide="send"></i></button></div></form></div>`:'';var av=p.anonymous?`<span class="avatar post-avatar-small" style="cursor:default">${h(postAvatar(p))}</span>`:`<button class="avatar post-avatar-small" data-profile="${h(p.author)}" data-profile-pid="${h(p.id)}">${h(postAvatar(p))}</button>`;var nm=p.anonymous?`<span class="profile-name-btn" style="cursor:default">${h(p.author)}</span>`:`<button class="profile-name-btn" data-profile="${h(p.author)}" data-profile-pid="${h(p.id)}">${h(p.author)}</button>`;return`<article class="post post-${p.section||'treehole'}" data-open-post="${h(p.id)}"><header class="post-head">${av}<div class="post-author">${nm}<span>${h(formatTime(p.time))}</span>${!detail&&p.section&&p.section!=='all'?`<span class="post-section-badge">${SECTION_META[p.section]?.label||''}</span>`:''}</div></header>${p.title?`<h2 class="post-title"><span>${h(p.title)}</span></h2>`:''}<p class="post-copy">${h(bodyContent)}</p>${tags?`<div class="post-tags">${tags}</div>`:''}${media}<div class="post-actions"><button class="action-button ${p.liked?'is-active':''}" data-like-post="${p.id}"><i data-lucide="heart"></i><span class="label">${p.liked?'已赞':'赞'}</span><span>${p.likes||''}</span></button><button class="action-button" data-comment-post="${p.id}"><i data-lucide="message-circle"></i><span class="label">评论</span><span>${p.comments_count||''}</span></button><button class="action-button ${p.collected?'collect-active':''}" data-collect-post="${p.id}"><i data-lucide="bookmark${p.collected?'-check':'-plus'}"></i><span class="label">${p.collected?'已收藏':'收藏'}</span></button><button class="action-button" data-ai-post="${p.id}"><i data-lucide="sparkles"></i><span class="label">问 AI</span></button><button class="action-button report" data-report-post="${p.id}"><i data-lucide="flag"></i></button></div>${state.aiActivePost===p.id?`<div class="ai-inline-form"><input id="ai-q-input" placeholder="向 AI 提问关于这条话题的内容…" maxlength="200" autocomplete="off"><button class="btn small" data-ai-send="${p.id}"><i data-lucide="sparkles" style="width:12px;height:12px;vertical-align:middle"></i> 提问</button></div>`:''}${state.aiBusy[p.id]?`<div class="ai-answer is-loading"><span class="ai-answer-icon"><i data-lucide="sparkles"></i></span><div class="ai-answer-body"><strong>AI 正在思考…</strong><p>基于这条话题的内容生成回答</p></div></div>`:''}${state.aiReplies[p.id]?`<div class="ai-answer"><span class="ai-answer-icon"><i data-lucide="sparkles"></i></span><div class="ai-answer-body"><strong>AI 回答</strong><p>${h(state.aiReplies[p.id])}</p><small>AI 生成内容仅供参考；重要事项请以官方信息为准。</small></div></div>`:''}${cmts}</article>`}
function renderComposer(){return`<div class="composer"><button class="composer-trigger" id="expand-composer"><span class="avatar">张</span><span style="color:var(--ink-3);font-size:14px">发布一个校园话题…</span><span style="margin-left:auto;color:var(--ink-3);font-size:12px">写点什么</span></button></div>`}
function renderComposerTreehole(){return`<div class="composer"><button class="composer-trigger" id="expand-treehole-composer"><span class="avatar" style="background:var(--th-muted,#c9b99a);color:#fff">匿</span><span style="color:var(--ink-3);font-size:14px">匿名写下你的故事…</span><span style="margin-left:auto;color:var(--ink-3);font-size:12px">树洞</span></button></div>`}

/* ═══ RENDER FUNCTIONS ═══ */
function renderFeed(){
  if(state.profileUser){renderUserProfile();return}
  if(state.composing){renderFeedCompose();return}
  if(state.route==='detail'&&state.selectedPost){$('view-root').innerHTML=`<div class="detail-overlay"><button class="detail-back" data-feed-back>← 返回话题流</button>${renderPost(state.selectedPost,true)}</div>`;refreshIcons();return}
  var ft=state.posts;if(state.section!=='all')ft=ft.filter(p=>p.section===state.section);
  var tabs=Object.entries(SECTION_META).map(([k,v])=>`<button class="feed-tab${state.section===k?' is-active':''}" data-section="${k}">${v.label}</button>`).join('');
  var feed=ft.length?ft.map(p=>renderPost(p)).join(''):stateBlock('还没有话题','发布第一个发现或问题','message-circle-dashed');
  var notice=state.notifications.find(i=>!i.read&&i.level==='urgent')||state.notifications.find(i=>!i.read&&i.level==='normal');
  var strip=notice?`<div class="priority-strip"><button data-route="notifications"><i data-lucide="bell-ring"></i><span><small>重要通知</small><strong>${h(notice.content.slice(0,50))}…</strong></span><i data-lucide="chevron-right"></i></button></div>`:'';
  $('view-root').innerHTML=`${pageHeader('Campus topics','校园话题','从学术问题到校园生活，按分区连续阅读。')}<div class="feed-tabs">${tabs}</div>${strip}${renderComposer()}<div class="feed-list">${feed}</div>`;refreshIcons()
}
function renderUserProfile(){
  var u=state.profileUser;if(!u){state.profileUser=null;render();return}
  var isHidden=u.id==='me'?state.profileHidden.me:state.profileHidden[u.id]||false;
  var isContact=state.contacts.includes(u.id);
  var userPosts=u.id==='me'?state.posts.filter(p=>!p.anonymous&&p.author==='张三'):state.posts.filter(p=>p.author===u.name);
  if(isHidden){$('view-root').innerHTML=`<div class="detail-overlay"><button class="detail-back" data-profile-back>← 返回</button><div style="text-align:center;padding:48px 24px"><span style="font-size:48px">🔒</span><h2 style="margin:12px 0">该用户设置了主页隐私</h2><p style="color:var(--ink-2)">${h(u.name)}选择不公开主页。</p></div></div>`;refreshIcons();return}
  var isSelf=u.id==='me';var contactBtn='';if(!isSelf){contactBtn=isContact?`<button class="btn" data-profile-contact style="background:var(--green-soft);color:var(--green)">✓ 已添加联系人</button>`:`<button class="btn primary" data-profile-contact>＋ 添加联系人</button>`}
  $('view-root').innerHTML=`<div class="detail-overlay"><button class="detail-back" data-profile-back>← 返回话题流</button>
    <div style="background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:28px 24px;margin-bottom:14px;text-align:center">
      <span class="avatar" style="width:72px;height:72px;font-size:28px;margin:0 auto 14px">${h(u.name.slice(0,1))}</span>
      <h2 style="margin:0;font-size:20px">${h(u.name)}</h2>
      <p style="color:var(--ink-2);font-size:13px;margin:4px 0 12px">${h(u.bio||'这个人很懒，什么都没有写')}</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        ${isSelf?`<button class="btn" data-profile-toggle>${state.profileHidden.me?'开启':'关闭'}我的主页公开</button>`:contactBtn+(isContact?'':'')}
        ${!isSelf?`<button class="btn ai" data-profile-chat="${u.id}">💬 发消息</button>`:''}</div></div>
    <div class="detail-section"><h3>发布的话题（${userPosts.length}篇）</h3>${userPosts.length?userPosts.map(p=>renderPost(p)).join(''):'<div class="comment-empty">还没有发布过话题</div>'}</div>
  </div>`;refreshIcons()
}

/* ═══ PROFILE (个人主页管理中心 · 张三) ═══ */
const PROFILE_TABS=[
  {key:0,label:'我的资料',icon:'user-round'},
  {key:1,label:'我的帖子',icon:'file-text'},
  {key:2,label:'我的收藏',icon:'bookmark'},
  {key:3,label:'我的简历',icon:'file-badge'},
  {key:4,label:'偏好设置',icon:'settings-2'}
];
function profileCounts(){
  return{
    posts:state.posts.filter(p=>!p.anonymous&&p.author==='张三').length,
    qas:state.questions.filter(q=>q.author==='张三').length,
    res:state.resources.filter(r=>r.uploader==='张三').length,
    favRes:Object.keys(state.resSaved||{}).length,
    favQa:Object.keys(state.qaBookmarked||{}).length,
    favPosts:state.posts.filter(p=>p.collected).length,
    favTeachers:Object.keys(state.favTeachers||{}).length,
    evts:DEMO_EVENTS.filter(e=>e.registered_by_me).length,
    opps:DEMO_OPPORTUNITIES.filter(o=>o.owner==='张三').length,
    resumes:state.resumes.length
  }
}
function profileVerifyBadge(){
  var s=ME_PROFILE.verifyState;
  if(s==='verified')return'<span class="profile-verify is-verified"><i data-lucide="badge-check"></i>校内身份已验证</span>';
  if(s==='pending')return'<span class="profile-verify is-pending"><i data-lucide="clock-3"></i>认证审核中</span>';
  return'<span class="profile-verify"><i data-lucide="shield-alert"></i>未认证</span>'
}
function renderProfile(){
  var me=ME_PROFILE,c=profileCounts(),tab=state.profileTab;
  var hero='<div class="profile-hero">'
    +'<span class="profile-hero-avatar">'+h(me.avatar)+'</span>'
    +'<div class="profile-hero-info">'
    +'<div class="profile-hero-name"><h1>'+h(me.name)+'</h1>'+profileVerifyBadge()+'</div>'
    +'<p class="profile-hero-bio">'+h(me.bio)+'</p>'
    +'<div class="profile-hero-meta"><span><i data-lucide="graduation-cap"></i>'+h(me.major)+' · '+h(me.grade)+'</span><span><i data-lucide="building-2"></i>'+h(me.clazz)+'</span><span><i data-lucide="mail"></i>'+h(me.email)+'</span></div>'
    +'<div class="profile-hero-tags">'+(me.tags||[]).map(t=>'<span class="profile-tag">'+h(t)+'</span>').join('')+'</div>'
    +'</div>'
    +'<div class="profile-hero-actions"><button class="btn" data-edit-profile><i data-lucide="pencil-line" style="width:14px;height:14px;vertical-align:middle"></i> 编辑资料</button></div>'
    +'</div>';
  var stats='<div class="profile-stats">'
    +'<div><strong>'+c.posts+'</strong><span>话题</span></div>'
    +'<div><strong>'+c.qas+'</strong><span>问答</span></div>'
    +'<div><strong>'+(c.res)+'</strong><span>资料</span></div>'
    +'<div><strong>'+(c.favRes+c.favQa+c.favPosts+c.favTeachers)+'</strong><span>收藏</span></div>'
    +'<div><strong>'+c.evts+'</strong><span>活动</span></div>'
    +'<div><strong>'+c.resumes+'</strong><span>简历</span></div>'
    +'</div>';
  var tabsHtml=PROFILE_TABS.map(t=>`<button class="profile-tab${tab===t.key?' is-active':''}" data-profile-tab="${t.key}"><i data-lucide="${t.icon}"></i><span>${t.label}</span></button>`).join('');
  var panel=tab===0?renderProfileInfo():tab===1?renderProfilePosts():tab===2?renderProfileFavs():tab===3?renderProfileResumes():renderProfilePrefs();
  $('view-root').innerHTML=hero+stats+'<div class="profile-tabs">'+tabsHtml+'</div>'+panel;
  refreshIcons()
}
/* ── TAB1 我的资料 ── */
function renderProfileInfo(){
  var me=ME_PROFILE;
  var basic='<div class="profile-card"><div class="profile-card-head"><h3><i data-lucide="id-card" style="width:15px;height:15px;vertical-align:middle"></i> 基本信息</h3><button class="profile-card-edit" data-edit-profile>编辑</button></div>'
    +'<div class="profile-info-grid">'
    +'<div class="profile-info-item"><span>姓名</span><strong>'+h(me.name)+'</strong></div>'
    +'<div class="profile-info-item"><span>年级</span><strong>'+h(me.grade)+'</strong></div>'
    +'<div class="profile-info-item"><span>专业</span><strong>'+h(me.major)+'</strong></div>'
    +'<div class="profile-info-item"><span>班级</span><strong>'+h(me.clazz)+'</strong></div>'
    +'<div class="profile-info-item"><span>邮箱</span><strong>'+h(me.email)+'</strong></div>'
    +'<div class="profile-info-item"><span>个人主页</span><strong>'+h(me.links.github||'—')+'</strong></div>'
    +'</div></div>';
  var s=me.verifyState;
  var verifyBody='';
  if(s==='verified'){
    verifyBody='<div class="verify-status is-verified"><span class="verify-icon"><i data-lucide="badge-check"></i></span><div><strong>校内身份已认证</strong><p>你的校园身份已通过验证，公开内容默认实名展示，通讯录对同学可见。</p></div></div>'
      +'<div class="profile-card-foot"><span class="verify-time"><i data-lucide="calendar-check" style="width:13px;height:13px;vertical-align:middle"></i> 认证时间 2026-06-18</span><button class="btn" data-verify-open><i data-lucide="refresh-cw" style="width:13px;height:13px;vertical-align:middle"></i> 重新认证</button></div>'
  }else if(s==='pending'){
    verifyBody='<div class="verify-status is-pending"><span class="verify-icon"><i data-lucide="clock-3"></i></span><div><strong>认证审核中</strong><p>资料已提交，预计 1-2 个工作日内完成审核。审核结果将通过站内信通知你。</p></div></div>'
      +'<div class="profile-card-foot"><button class="btn" data-verify-open><i data-lucide="eye" style="width:13px;height:13px;vertical-align:middle"></i> 查看进度</button></div>'
  }else{
    verifyBody='<div class="verify-status"><span class="verify-icon"><i data-lucide="shield-alert"></i></span><div><strong>尚未认证校园身份</strong><p>认证后可在主页展示校内身份标识，公开内容默认实名。</p></div></div>'
      +'<div class="profile-card-foot"><button class="btn primary" data-verify-open><i data-lucide="shield-check" style="width:13px;height:13px;vertical-align:middle"></i> 立即认证</button></div>'
  }
  var verify='<div class="profile-card"><div class="profile-card-head"><h3><i data-lucide="shield-check" style="width:15px;height:15px;vertical-align:middle"></i> 学校信息认证</h3></div>'+verifyBody+'</div>';
  var links='<div class="profile-card"><div class="profile-card-head"><h3><i data-lucide="link" style="width:15px;height:15px;vertical-align:middle"></i> 社交与链接</h3></div>'
    +'<div class="profile-link-row"><span class="profile-link-icon" style="color:var(--ink-3)"><i data-lucide="github"></i></span><div><span>GitHub</span><strong>'+h(me.links.github||'未设置')+'</strong></div></div>'
    +'<div class="profile-link-row"><span class="profile-link-icon" style="color:var(--ink-3)"><i data-lucide="rss"></i></span><div><span>博客</span><strong>'+h(me.links.blog||'未设置')+'</strong></div></div>'
    +'</div>';
  return basic+verify+links
}
/* ── TAB2 我的帖子 ── */
function renderProfilePosts(){
  var f=state.myPostsFilter;
  var chips=[['all','全部'],['post','话题'],['qa','问答'],['res','资料'],['event','活动'],['opp','组队']]
    .map(c=>`<button class="profile-chip${f===c[0]?' is-active':''}" data-my-posts-filter="${c[0]}">${c[1]}</button>`).join('');
  var items=[];
  if(f==='all'||f==='post')state.posts.filter(p=>!p.anonymous&&p.author==='张三').forEach(p=>items.push({type:'post',id:p.id,title:p.title||p.content.slice(0,40),meta:SECTION_META[p.section]?.label||'校园话题',time:p.time,icon:'messages-square',color:'var(--green-strong)'}));
  if(f==='all'||f==='qa')state.questions.filter(q=>q.author==='张三').forEach(q=>items.push({type:'qa',id:q.id,title:q.question,meta:q.courseName+' · '+q.status,time:q.time,icon:'message-circle-question',color:'var(--blue)'}));
  if(f==='all'||f==='res')state.resources.filter(r=>r.uploader==='张三').forEach(r=>items.push({type:'res',id:r.id,title:r.name,meta:r.course+' · '+r.type,time:r.term||'',icon:'book-open',color:'var(--green-strong)'}));
  if(f==='all'||f==='event')DEMO_EVENTS.filter(e=>e.registered_by_me).forEach(e=>items.push({type:'event',id:e.id,title:e.title,meta:e.time+' · '+e.location,time:e.time,icon:'calendar-days',color:'#c9b99a'}));
  if(f==='all'||f==='opp')DEMO_OPPORTUNITIES.filter(o=>o.owner==='张三').forEach(o=>items.push({type:'opp',id:o.id,title:o.title,meta:o.kind+' · '+o.sub_category,time:o.deadline||'',icon:'users-round',color:'#d4b5a7'}));
  var list=items.length?items.map(it=>{
    var act=it.type==='post'?`data-profile-open-post="${it.id}"`:it.type==='qa'?`data-profile-open-qa="${it.id}"`:it.type==='res'?`data-profile-open-res="${it.id}"`:it.type==='event'?`data-profile-open-evt="${it.id}"`:`data-profile-open-opp="${it.id}"`;
    return`<div class="profile-list-item" ${act}><span class="profile-list-icon" style="color:${it.color};background:color-mix(in srgb,${it.color} 12%,transparent)"><i data-lucide="${it.icon}" style="width:16px;height:16px"></i></span><div class="profile-list-main"><strong>${h(it.title)}</strong><p>${h(it.meta)}</p></div><span class="profile-list-time">${h(formatTime(it.time))}</span><i data-lucide="chevron-right" style="width:15px;height:15px;color:var(--ink-3);flex-shrink:0"></i></div>`
  }).join(''):stateBlock('还没有相关内容','在校园里留下你的第一份足迹吧','file-plus-2');
  return'<div class="profile-panel"><div class="profile-chip-row">'+chips+'</div><div class="profile-list">'+list+'</div></div>'
}
/* ── TAB3 我的收藏 ── */
function renderProfileFavs(){
  var f=state.favTypeFilter;
  var chips=[['all','全部'],['res','资料'],['qa','问答'],['post','话题'],['event','活动'],['teacher','教师']]
    .map(c=>`<button class="profile-chip${f===c[0]?' is-active':''}" data-fav-type-filter="${c[0]}">${c[1]}</button>`).join('');
  var items=[];
  if(f==='all'||f==='res')Object.keys(state.resSaved||{}).forEach(rid=>{var r=state.resources.find(x=>x.id===rid);if(r)items.push({type:'res',id:r.id,title:r.name,meta:r.course+' · '+r.type+' · 官方库',time:r.term||'',icon:'book-open',color:'var(--green-strong)'})});
  if(f==='all'||f==='qa')Object.keys(state.qaBookmarked||{}).forEach(qid=>{var q=state.questions.find(x=>x.id===qid);if(q&&state.qaBookmarked[qid])items.push({type:'qa',id:q.id,title:q.question,meta:q.courseName+' · '+q.status,time:q.time,icon:'message-circle-question',color:'var(--blue)'})});
  if(f==='all'||f==='post')state.posts.filter(p=>p.collected).forEach(p=>items.push({type:'post',id:p.id,title:p.title||p.content.slice(0,40),meta:SECTION_META[p.section]?.label||'校园话题',time:p.time,icon:'messages-square',color:'var(--green-strong)'}));
  if(f==='all'||f==='event')DEMO_EVENTS.filter(e=>e.registered_by_me).forEach(e=>items.push({type:'event',id:e.id,title:e.title,meta:e.time+' · '+e.location,time:e.time,icon:'calendar-days',color:'#c9b99a'}));
  if(f==='all'||f==='teacher')Object.keys(state.favTeachers||{}).forEach(tid=>{var t=MOCK_TEACHERS.find(x=>x.id===tid);if(t)items.push({type:'teacher',id:t.id,title:t.name,meta:t.title+' · '+t.course+' ('+t.courseCode+')',time:'',icon:'graduation-cap',color:'#a8b5c8'})});
  var list=items.length?items.map(it=>{
    var act=it.type==='post'?`data-profile-open-post="${it.id}"`:it.type==='qa'?`data-profile-open-qa="${it.id}"`:it.type==='res'?`data-profile-open-res="${it.id}"`:it.type==='event'?`data-profile-open-evt="${it.id}"`:`data-profile-open-teacher="${it.id}"`;
    return`<div class="profile-list-item" ${act}><span class="profile-list-icon" style="color:${it.color};background:color-mix(in srgb,${it.color} 12%,transparent)"><i data-lucide="${it.icon}" style="width:16px;height:16px"></i></span><div class="profile-list-main"><strong>${h(it.title)}</strong><p>${h(it.meta)}</p></div>${it.time?'<span class="profile-list-time">'+h(formatTime(it.time))+'</span>':''}<i data-lucide="chevron-right" style="width:15px;height:15px;color:var(--ink-3);flex-shrink:0"></i></div>`
  }).join(''):stateBlock('还没有收藏','去发现页逛逛，收藏感兴趣的内容吧','bookmark-plus');
  return'<div class="profile-panel"><div class="profile-chip-row">'+chips+'</div><div class="profile-list">'+list+'</div></div>'
}
/* ── TAB4 我的简历 ── */
function renderProfileResumes(){
  var rs=state.resumes;
  var cards=rs.map(function(r){
    var isDef=r.id===state.resumeDefaultId;
    var stMap={accepted:['已录用','is-accepted'],pending:['审核中','is-pending'],draft:['草稿','is-draft']};
    var st=stMap[r.status]||stMap.draft;
    return`<div class="resume-card${isDef?' is-default':''}"><div class="resume-card-top"><span class="resume-card-icon"><i data-lucide="file-badge"></i></span><div class="resume-card-info"><strong>${h(r.name)}</strong><p>${h(r.target)}</p></div><span class="resume-status ${st[1]}">${st[0]}</span></div>`
      +`<div class="resume-card-meta"><span class="resume-updated"><i data-lucide="clock" style="width:12px;height:12px;vertical-align:middle"></i> 更新于 ${h(r.updated)}</span>${isDef?'<span class="resume-default-tag"><i data-lucide="check-circle-2" style="width:12px;height:12px;vertical-align:middle"></i> 默认简历</span>':''}</div>`
      +`<div class="resume-card-highlights">${(r.highlights||[]).map(x=>'<span>'+h(x)+'</span>').join('')}</div>`
      +`<div class="resume-card-actions">${isDef?'':`<button class="resume-btn" data-resume-default="${r.id}"><i data-lucide="star" style="width:12px;height:12px;vertical-align:middle"></i> 设为默认</button>`}<button class="resume-btn danger" data-resume-del="${r.id}"><i data-lucide="trash-2" style="width:12px;height:12px;vertical-align:middle"></i> 删除</button></div></div>`
  }).join('');
  var ra='<div class="profile-card ra-card"><div class="profile-card-head"><h3><i data-lucide="flask-conical" style="width:15px;height:15px;vertical-align:middle"></i> RA 申请进度</h3></div>'
    +'<div class="ra-track"><div class="ra-step is-done"><span><i data-lucide="send"></i></span><small>已投递</small></div><div class="ra-line is-done"></div><div class="ra-step is-done"><span><i data-lucide="eye"></i></span><small>已查看</small></div><div class="ra-line is-done"></div><div class="ra-step is-done"><span><i data-lucide="check"></i></span><small>已接受</small></div><div class="ra-line"></div><div class="ra-step"><span><i data-lucide="calendar-check-2"></i></span><small>面谈</small></div></div>'
    +'<p class="ra-note"><i data-lucide="info" style="width:13px;height:13px;vertical-align:middle"></i> 张启明副教授已接受你的「图算法研究助理」申请，面谈时间：下周三 15:00（A501）。</p></div>';
  var add='<div class="profile-card"><button class="btn primary" data-resume-add style="width:100%"><i data-lucide="plus" style="width:14px;height:14px;vertical-align:middle"></i> 新建简历</button></div>';
  return'<div class="profile-panel"><div class="profile-card"><div class="profile-card-head"><h3><i data-lucide="folder-open" style="width:15px;height:15px;vertical-align:middle"></i> 简历版本</h3><span class="profile-card-count">'+rs.length+' 份</span></div></div>'+cards+add+ra+'</div>'
}
/* ── TAB5 偏好设置 ── */
function renderProfilePrefs(){
  var hd=state.homeDefault;
  var cards=[['feed','校园话题','messages-square','打开时直接进入话题流'],['resources','课程资料','book-open','打开时直接进入资料库'],['events','校园活动','calendar-days','打开时直接进入活动页'],['last','上次位置','history','记住上次浏览的板块']]
    .map(c=>`<button class="home-card${hd===c[0]?' is-active':''}" data-home-default="${c[0]}"><span class="home-card-icon"><i data-lucide="${c[2]}"></i></span><div><strong>${c[1]}</strong><p>${c[3]}</p></div><span class="home-card-radio">${hd===c[0]?'<i data-lucide="check"></i>':''}</span></button>`).join('');
  var pp=state.privacyPrefs;
  var privs=[['showPosts','公开我的话题帖子'],['showBookmarks','公开我的收藏列表'],['showResume','公开我的简历与项目'],['showActivity','公开我的活动足迹']]
    .map(k=>`<label class="np-toggle-row"><span>${k[1]}</span><label class="notif-toggle"><input type="checkbox" data-privacy-toggle="${k[0]}"${pp[k[0]]?' checked':''}><span class="notif-toggle-slider"></span></label></label>`).join('');
  return'<div class="profile-panel"><div class="profile-card"><div class="profile-card-head"><h3><i data-lucide="compass" style="width:15px;height:15px;vertical-align:middle"></i> 默认主页</h3><p style="font-size:11px;color:var(--ink-3);font-weight:400">登录后默认进入的板块</p></div><div class="home-cards">'+cards+'</div></div>'
    +'<div class="profile-card"><div class="profile-card-head"><h3><i data-lucide="bell" style="width:15px;height:15px;vertical-align:middle"></i> 通知偏好</h3></div><p class="np-section-desc">推送渠道、免打扰时段与互动开关的完整设置</p><button class="btn" data-np-open style="margin-top:10px"><i data-lucide="settings-2" style="width:13px;height:13px;vertical-align:middle"></i> 打开通知偏好设置</button></div>'
    +'<div class="profile-card"><div class="profile-card-head"><h3><i data-lucide="lock" style="width:15px;height:15px;vertical-align:middle"></i> 隐私与公开范围</h3></div><div class="np-section">'+privs+'</div></div>'
    +'</div>'
}
/* ── 认证弹窗（三态流转） ── */
function renderVerifyModal(){
  var vf=state.verifyForm,s=ME_PROFILE.verifyState;
  var stateHtml='';
  if(s==='verified')stateHtml='<div class="verify-hero is-verified"><span class="verify-hero-icon"><i data-lucide="badge-check"></i></span><div><strong>当前状态：已认证</strong><p>重新提交将进入审核流程，审核期间原认证状态保留。</p></div></div>';
  else if(s==='pending')stateHtml='<div class="verify-hero is-pending"><span class="verify-hero-icon"><i data-lucide="clock-3"></i></span><div><strong>当前状态：审核中</strong><p>资料已提交，预计 1-2 个工作日内完成审核。</p></div></div>';
  else stateHtml='<div class="verify-hero"><span class="verify-hero-icon"><i data-lucide="shield-alert"></i></span><div><strong>当前状态：未认证</strong><p>填写并提交校园信息即可完成身份认证。</p></div></div>';
  var formHtml='<div class="verify-form">'
    +'<label class="field-label">学号</label><input class="field" id="verify-student-id" value="'+h(vf.studentId)+'" placeholder="例如 2112098">'
    +'<label class="field-label">姓名</label><input class="field" id="verify-name" value="'+h(vf.name)+'" placeholder="与校园系统一致">'
    +'<label class="field-label">身份证号后 6 位</label><input class="field" id="verify-id-last6" value="'+h(vf.idLast6)+'" placeholder="用于身份校验（仅校验不存储）" maxlength="6">'
    +'<label class="field-label">所属学院</label><select class="field" id="verify-college"><option value="">请选择学院</option><option value="智能工程学院"'+('智能工程学院'===vf.college?' selected':'')+'>智能工程学院</option><option value="数学物理学院"'+('数学物理学院'===vf.college?' selected':'')+'>数学物理学院</option><option value="语言学院"'+('语言学院'===vf.college?' selected':'')+'>语言学院</option><option value="西浦国际商学院"'+('西浦国际商学院'===vf.college?' selected':'')+'>西浦国际商学院</option><option value="人文社科学院"'+('人文社科学院'===vf.college?' selected':'')+'>人文社科学院</option><option value="设计学院"'+('设计学院'===vf.college?' selected':'')+'>设计学院</option></select>'
    +'<label class="field-label">身份</label><div class="verify-role-row"><label class="verify-role'+(vf.role==='student'?' is-active':'')+'" data-verify-role="student"><i data-lucide="graduation-cap"></i><span>在校学生</span></label><label class="verify-role'+(vf.role==='teacher'?' is-active':'')+'" data-verify-role="teacher"><i data-lucide="presentation"></i><span>教师 / 教职工</span></label></div>'
    +'</div>';
  var pendingHtml='<div class="verify-pending">'
    +'<div class="verify-pending-ring"><i data-lucide="clock-3"></i></div>'
    +'<h3>资料已提交，等待审核</h3>'
    +'<p>预计 1-2 个工作日内完成审核<br>审核结果将通过站内信通知你</p>'
    +'<button class="button" data-verify-simulate style="background:var(--green-strong);border-color:var(--green-strong);color:#fff"><i data-lucide="check-circle-2" style="width:16px;height:16px;vertical-align:middle"></i> （演示）模拟审核通过</button>'
    +'</div>';
  var bodyHtml=stateHtml+'<div class="verify-divider"></div>'+(state.verifyStep===1?formHtml:pendingHtml)
    +'<div class="verify-footer">'
    +(state.verifyStep===1?'<button class="button button-ghost" data-verify-close>取消</button><button class="button" data-verify-submit style="background:#C2B2A4;border-color:#C2B2A4;color:#fff"><i data-lucide="shield-check" style="width:16px;height:16px;vertical-align:middle"></i> 提交认证</button>'
    :'<button class="button button-ghost" data-verify-close>关闭</button>')
    +'</div>';
  var existing=document.getElementById('verify-modal-overlay');
  if(existing){var b=existing.querySelector('.publish-body');if(b){b.innerHTML=bodyHtml;refreshIcons()}return}
  var html='<div class="publish-overlay" id="verify-modal-overlay"><div class="publish-modal" style="max-width:560px"><div class="publish-modal-header"><h2><i data-lucide="shield-check" style="width:18px;height:18px;vertical-align:middle"></i> 学校信息认证</h2><button class="publish-close" data-verify-close>✕</button></div><div class="publish-body">'+bodyHtml+'</div></div></div>';
  $('view-root').insertAdjacentHTML('beforeend',html);refreshIcons()
}
function submitVerify(){
  var vf=state.verifyForm;
  vf.studentId=$('verify-student-id')?.value.trim()||vf.studentId;
  vf.name=$('verify-name')?.value.trim()||vf.name;
  vf.idLast6=$('verify-id-last6')?.value.trim()||vf.idLast6;
  vf.college=$('verify-college')?.value||vf.college;
  if(!vf.studentId||!vf.name||vf.idLast6.length<6)return toast('请完整填写学号、姓名与身份证后6位','error');
  if(!vf.college)return toast('请选择所属学院','error');
  ME_PROFILE.verifyState='pending';state.verifyStep=2;state.verifyModal=true;renderVerifyModal();
  toast('认证资料已提交，等待审核');
}
/* ── 编辑资料弹窗 ── */
function renderEditProfileModal(){
  var ef=state.editProfileForm;
  var bodyHtml='<div class="edit-form">'
    +'<label class="field-label">个人简介</label><textarea class="field" id="edit-bio" rows="3" placeholder="介绍一下自己">'+h(ef.bio)+'</textarea>'
    +'<label class="field-label">邮箱</label><input class="field" id="edit-email" value="'+h(ef.email)+'">'
    +'<label class="field-label">GitHub</label><input class="field" id="edit-github" value="'+h(ef.links.github)+'" placeholder="github.com/username">'
    +'<label class="field-label">博客 / 个人主页</label><input class="field" id="edit-blog" value="'+h(ef.links.blog)+'" placeholder="blog.xxx.com">'
    +'</div>'
    +'<div class="verify-footer"><button class="button button-ghost" data-edit-close>取消</button><button class="button" data-edit-save style="background:var(--green-strong);border-color:var(--green-strong);color:#fff"><i data-lucide="check" style="width:15px;height:15px;vertical-align:middle"></i> 保存修改</button></div>';
  var existing=document.getElementById('edit-profile-overlay');
  if(existing){var b=existing.querySelector('.publish-body');if(b){b.innerHTML=bodyHtml;refreshIcons()}return}
  var html='<div class="publish-overlay" id="edit-profile-overlay"><div class="publish-modal" style="max-width:520px"><div class="publish-modal-header"><h2><i data-lucide="pencil-line" style="width:18px;height:18px;vertical-align:middle"></i> 编辑个人资料</h2><button class="publish-close" data-edit-close>✕</button></div><div class="publish-body">'+bodyHtml+'</div></div></div>';
  $('view-root').insertAdjacentHTML('beforeend',html);refreshIcons()
}
function saveEditProfile(){
  var ef=state.editProfileForm;
  var bio=$('edit-bio')?.value.trim(),email=$('edit-email')?.value.trim(),gh=$('edit-github')?.value.trim(),blog=$('edit-blog')?.value.trim();
  if(bio)ef.bio=bio;if(email)ef.email=email;ef.links.github=gh;ef.links.blog=blog;
  ME_PROFILE.bio=ef.bio;ME_PROFILE.email=ef.email;ME_PROFILE.links={github:ef.links.github,blog:ef.links.blog};
  var o=document.getElementById('edit-profile-overlay');if(o)o.remove();
  toast('个人资料已更新');render()
}
/* ── topbar 头像下拉菜单 ── */
function renderProfileMenu(){
  var m=$('profile-menu');if(!m)return;
  var items=[
    {route:'profile',tab:0,label:'个人主页',icon:'user-round',desc:'查看和管理我的主页'},
    {route:'profile',tab:0,label:'账号设置',icon:'settings',desc:'认证、资料与链接'},
    {route:'profile',tab:2,label:'我的收藏',icon:'bookmark',desc:'资料 / 问答 / 话题 / 教师'},
    {route:'profile',tab:1,label:'我的发布',icon:'file-text',desc:'帖子 / 问答 / 资料 / 活动'},
    {route:'',tab:-1,label:'退出登录',icon:'log-out',desc:'',danger:true}
  ];
  m.innerHTML='<div class="profile-menu-head"><span class="avatar">张</span><div><strong>张三</strong><small>计算机科学 · 大三</small></div></div>'
    +items.map(it=>`<button class="profile-menu-item${it.danger?' is-danger':''}" data-profile-menu-item="${it.label}" data-menu-route="${it.route}" data-menu-tab="${it.tab}"><i data-lucide="${it.icon}"></i><span><strong>${it.label}</strong><small>${it.desc}</small></span></button>`).join('');
  m.style.display='block';refreshIcons()
}
function closeProfileMenu(){var m=$('profile-menu');if(m)m.style.display='none';state.profileMenuOpen=false}
function renderFeedCompose(){
  var ct=state.composerTitle||'',cc=state.composerText||'',ctg=state.composerTags||'';
  $('view-root').innerHTML=`<div class="detail-overlay">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0 12px">
      <button class="detail-back" data-close-compose>← 取消</button>
      <span style="font-size:16px;font-weight:680">发布新话题</span>
      <button class="button" id="submit-compose"${cc.trim()?'':' disabled'}>发布</button></div>
    <div style="display:flex;gap:12px;padding:14px 0"><span class="avatar" style="width:40px;height:40px;font-size:14px">张</span><div style="flex:1"><div style="font-size:13px;font-weight:650">张三</div><div style="font-size:11px;color:var(--ink-3)">计算机科学·大三</div></div></div>
    <input class="field" id="compose-title" value="${h(ct)}" placeholder="添加标题（可选）" style="font-size:16px;font-weight:580;border:none;border-bottom:1px solid var(--line);border-radius:0;padding:10px 0;margin-bottom:8px">
    <textarea class="field" id="compose-text" placeholder="说说你在校园里想分享的事…" style="min-height:180px;resize:vertical;border:none;border-radius:0;padding:10px 0;font-size:15px;line-height:1.7">${h(cc)}</textarea>
    <div class="compose-media-section">
      <div class="compose-media-previews" id="compose-media-previews">${(state.composeMedia||[]).map((m,i)=>`<div class="compose-media-thumb" data-media-idx="${i}"><div class="compose-media-img" style="background:${h(m.type==='video'?'#2a2a2a':'#e8e4df')};display:grid;place-items:center;color:#fff;font-size:24px">${m.type==='video'?'▶':'🖼'}</div><span class="compose-media-clear" data-media-remove="${i}">✕</span></div>`).join('')}</div>
      <div class="compose-media-zone" id="compose-media-zone">
        <div class="compose-media-zone-inner">
          <span class="compose-media-plus">＋</span>
          <span class="compose-media-text">添加照片或视频</span>
          <span class="compose-media-hint">JPG/PNG/GIF/WebP · 最多9个</span>
        </div>
        <input type="file" id="compose-media-input" accept="image/*,video/*" multiple style="display:none">
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
      <input class="field" id="compose-tags" value="${h(ctg)}" placeholder="添加标签（可选），逗号分隔…" style="flex:1;min-width:140px">
      <select class="field" id="compose-section" style="width:auto;min-width:100px">${Object.entries(SECTION_META).filter(([k])=>k!=='all').map(([k,v])=>`<option value="${k}"${state.composerSection===k?' selected':''}>${v.label}</option>`).join('')}</select>
      <label style="font-size:12px;display:flex;align-items:center;gap:4px"><input type="checkbox" id="compose-anon"${state.composerAnonymous?' checked':''}>匿名</label></div>
    <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:5px"><span style="font-size:11px;color:var(--ink-3)">快速添加：</span>${['CSE101','期末复习','校园生活','找队友','提问','留学','其他'].map(t=>`<span class="compose-tag-chip" data-add-tag="${t}">${t}</span>`).join('')}</div>
  </div>`;refreshIcons()}
function renderSearch(){var s=state.search;var aiCard='';if(s.mode==='ai'&&s.result&&s.aiLoading)aiCard='<div class="ai-answer is-loading"><span class="ai-answer-icon"><i data-lucide="sparkles"></i></span><div class="ai-answer-body"><strong>AI 正在基于检索结果生成回答…</strong><p>正在阅读「'+h(s.keyword)+'」的相关内容，请稍候</p></div></div>';else if(s.mode==='ai'&&s.result&&s.aiReply)aiCard='<div class="ai-answer search-ai-answer"><span class="ai-answer-icon"><i data-lucide="sparkles"></i></span><div class="ai-answer-body"><strong>基于当前搜索结果的 AI 回答</strong><p>'+h(s.aiReply)+'</p><small>引用关键词与当前结果；重要事项请打开原始资料或官方通知核对。</small></div></div>';var b=s.loading?`<div style="padding:24px">${'<div class="skeleton-post"><div class="skeleton-line wide"></div><div class="skeleton-line medium"></div></div>'.repeat(2)}</div>`:s.result?aiCard+renderSearchResult(s.result):stateBlock('从一个关键词开始','搜索帖子标题、内容、Tag、资料和活动，或切换到「问 AI」获得解答','search');var typeSel='<select class="field" id="search-type" style="width:auto;min-width:110px"><option value="all"'+(s.type==='all'?' selected':'')+'>全部类型</option><option value="post"'+(s.type==='post'?' selected':'')+'>帖子</option><option value="resource"'+(s.type==='resource'?' selected':'')+'>课程资料</option><option value="event"'+(s.type==='event'?' selected':'')+'>活动</option></select>';$('view-root').innerHTML=`${pageHeader('Discover','发现校园内容','结果可按类型筛选，或切换「问 AI」直接获得解答。')}<section class="search-panel"><form id="search-page-form"><div class="search-form-large"><input class="field" id="search-keyword" value="${h(s.keyword)}" placeholder="CSE101、黑客松、期末复习…" required><button class="button" type="submit"><i data-lucide="${s.mode==='ai'?'sparkles':'search'}"></i>${s.mode==='ai'?'问 AI':'搜索'}</button></div><div class="search-filters" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px"><span class="ai-mode-seg"><button type="button" data-search-mode="search" class="${s.mode==='search'?'is-active':''}"><i data-lucide="search"></i>搜索内容</button><button type="button" data-search-mode="ai" class="${s.mode==='ai'?'is-active':''}"><i data-lucide="sparkles"></i>问 AI</button></span>${typeSel}</div></form></section>${b}`;refreshIcons()}
function renderSearchResult(r){var groups=[['posts','帖子',p=>`<strong>${h(p.title||p.content)}</strong><p>${h(SECTION_META[p.section]?.label||'')}·${(p.tags||[]).join(',')}</p>`],['resources','课程资料',i=>`<strong>${h(i.name)}</strong><p>${h(i.course)}·${h(i.type)}</p>`],['events','活动',i=>`<strong>${h(i.title)}</strong><p>${h(i.time)}·${h(i.location)}</p>`]];var sec=groups.map(([k,lb,rn])=>{var it=r[k]||[];if(!it.length)return'';return`<section class="result-section"><h2>${lb}<span>${it.length}条</span></h2>${it.map(i=>`<div class="result-row">${rn(i)}</div>`).join('')}</section>`}).join('');return`<div class="result-summary">"${h(r.keyword)}"—找到${r.total||0}条</div>${sec||stateBlock('没有匹配','试试更短的关键词','search-x')}`}
function renderNotifItem(n,timeStr){
  var lvl=n.level||'normal';
  var lvlClass=lvl==='urgent'?'level-urgent':lvl==='normal'?'level-normal':'level-optional';
  var iconMap={urgent:'bell-ring',normal:'bell',optional:'sparkles'};
  var icon=iconMap[lvl]||'bell';
  var leftBar=lvl==='urgent'?'<span class="notif-bar urgent"></span>':lvl==='normal'?'<span class="notif-bar normal"></span>':'';
  var unreadDot=n.read?'':'<span class="notif-unread-dot"></span>';
  var actions='<div class="notif-actions">';
  if(!n.processed){
    actions+='<button class="notif-action-btn later" data-notify-action="later" data-notify-id="'+n.id+'">'+(n.saved_for_later?'取消稍后':'<i data-lucide="clock" style="width:12px;height:12px"></i> 稍后')+'</button>';
    actions+='<button class="notif-action-btn done" data-notify-action="done" data-notify-id="'+n.id+'"><i data-lucide="check" style="width:12px;height:12px"></i> 标记处理</button>'
  }
  actions+='</div>';
  return'<div class="notif-item '+lvlClass+'">'+leftBar+'<div class="notif-item-icon"><i data-lucide="'+icon+'" style="width:16px;height:16px"></i></div><div class="notif-item-body"><div class="notif-item-top">'+unreadDot+'<strong class="notif-item-title">'+h(n.content)+'</strong></div><div class="notif-item-meta"><span class="notif-item-time">'+h(timeStr||formatTime(n.time))+'</span>'+renderNotifTypeTag(n.type)+'</div>'+(n.processed?'<span class="notif-processed-badge">已处理</span>':'')+'</div>'+actions+'</div>'
}
function renderNotifTypeTag(type){
  var map={booking:'预约确认',result:'申请结果',qa_reply:'老师回复',event:'活动报名',system:'系统通知',comment:'新评论',like:'点赞',reminder:'提醒',update:'资料更新',deadline:'截止提醒',recommend:'推荐',new_resource:'新资料',preview:'预告',maintenance:'维护'};
  return map[type]?'<span class="notif-type-tag">'+map[type]+'</span>':''
}
function renderNotifSettings(){
  var ls=[{key:'urgent',label:'🔴 紧急/重要',desc:'需要立即处理的事项：预约确认、申请结果、老师回复、系统重要公告',color:'#D4B5A7'},{key:'normal',label:'🟡 普通互动',desc:'社交互动：新评论、点赞、收藏更新、活动提醒（每日10点可合并汇总）',color:'#C9C4C0'},{key:'optional',label:'⚪ 可选阅读',desc:'兴趣推荐：热门话题、新资料提醒、活动预告、系统维护通知',color:'#9A9693'}];
  var rows=ls.map(function(l){
    var on=state.notifSettings[l.key];
    return'<div class="notif-settings-row"><div class="notif-settings-info"><strong>'+l.label+'</strong><p>'+l.desc+'</p></div><label class="notif-toggle"><input type="checkbox" data-notif-toggle="'+l.key+'"'+(on?' checked':'')+'><span class="notif-toggle-slider"></span></label></div>'
  }).join('');
  return'<div class="notif-settings-panel"><div class="notif-settings-header"><h3><i data-lucide="settings" style="width:16px;height:16px;vertical-align:middle"></i> 通知设置</h3><button class="notif-settings-close" data-notif-settings-close>✕</button></div>'+rows+'<p class="notif-settings-foot">关闭某一层级后，该层级的新通知将不再推送。可在设置中随时重新开启。</p></div>'
}
function renderNotifPreferences(){
  var p=state.notifPrefs;
  var chk=function(k,v){return v?' checked':''};
  var mailHtml='<div class="np-channel-mail"><label class="np-toggle-row"><span>重要级</span><label class="notif-toggle"><input type="checkbox" data-np-mail="urgent"'+(p.channelEmail.urgent?' checked':'')+'><span class="notif-toggle-slider"></span></label></label><label class="np-toggle-row"><span>普通互动级</span><label class="notif-toggle"><input type="checkbox" data-np-mail="normal"'+(p.channelEmail.normal?' checked':'')+'><span class="notif-toggle-slider"></span></label></label><label class="np-toggle-row"><span>可选阅读级</span><label class="notif-toggle"><input type="checkbox" data-np-mail="optional"'+(p.channelEmail.optional?' checked':'')+'><span class="notif-toggle-slider"></span></label></label></div>';
  var normalSectionsHtml='';
  var nsMap={topic:'话题互动',qa:'问答互动',like:'点赞互动',reminder:'活动提醒',update:'资料更新',deadline:'截止提醒'};
  for(var nsk in nsMap){var nsv=p.normalSections[nsk];normalSectionsHtml+='<label class="np-toggle-row"><span>'+nsMap[nsk]+'</span><label class="notif-toggle"><input type="checkbox" data-np-normal="'+nsk+'"'+(nsv?' checked':'')+'><span class="notif-toggle-slider"></span></label></label>'}
  var html='<div class="publish-overlay" id="notif-prefs-overlay"><div class="publish-modal" style="max-width:620px"><div class="publish-modal-header"><h2><i data-lucide="bell-off" style="width:18px;height:18px;vertical-align:middle"></i> 通知偏好</h2><button class="publish-close" data-np-close>✕</button></div><div class="publish-body"><div class="np-section"><h3 class="np-section-title"><i data-lucide="share" style="width:15px;height:15px;vertical-align:middle"></i> 推送渠道</h3><p class="np-section-desc">选择通知的推送方式，不同层级可设置不同渠道</p><label class="np-toggle-row is-disabled"><span><strong>站内信</strong><small>站内通知中心接收所有推送</small></span><label class="notif-toggle"><input type="checkbox" checked disabled><span class="notif-toggle-slider"></span></label></label><label class="np-toggle-row"><span><strong>邮件</strong><small>邮件同步发送，按层级分别设置</small></span><label class="notif-toggle"><input type="checkbox" data-np-channel="email"'+(p.channelEmail.urgent||p.channelEmail.normal||p.channelEmail.optional?' checked':'')+'><span class="notif-toggle-slider"></span></label></label>'+mailHtml+'<label class="np-toggle-row"><span><strong>浏览器推送</strong><small>桌面浏览器通知，需授权</small></span><label class="notif-toggle"><input type="checkbox" data-np-channel="browser"'+(p.channelBrowser?' checked':'')+'><span class="notif-toggle-slider"></span></label></label></div><div class="np-section"><h3 class="np-section-title"><i data-lucide="alert-triangle" style="width:15px;height:15px;vertical-align:middle"></i> 重要级通知</h3><p class="np-section-desc">重要事项不可关闭，可选择推送渠道</p><div class="np-info-card"><i data-lucide="info" style="width:14px;height:14px;flex-shrink:0;color:var(--blue)"></i><span>预约确认、RA申请结果、老师回复、系统重要公告等始终推送，以下渠道均可收到</span></div><div class="np-channel-tags"><span class="np-channel-tag is-active"><i data-lucide="message-circle" style="width:12px;height:12px"></i> 站内信</span><span class="np-channel-tag'+(p.channelEmail.urgent?' is-active':'')+'" data-np-tag="email_urgent"><i data-lucide="mail" style="width:12px;height:12px"></i> 邮件</span><span class="np-channel-tag'+(p.channelBrowser?' is-active':'')+'" data-np-tag="browser"><i data-lucide="globe" style="width:12px;height:12px"></i> 浏览器</span></div></div><div class="np-section"><h3 class="np-section-title"><i data-lucide="message-square" style="width:15px;height:15px;vertical-align:middle"></i> 普通互动级通知</h3><p class="np-section-desc">按板块单独控制，关闭后该板块不再推送</p>'+normalSectionsHtml+'</div><div class="np-section"><h3 class="np-section-title"><i data-lucide="sparkles" style="width:15px;height:15px;vertical-align:middle"></i> 可选阅读级通知</h3><p class="np-section-desc">一键关闭所有推荐类通知</p><label class="np-toggle-row"><span><strong>全局开关</strong><small>关闭后不再推送热门推荐、新资料提醒、活动预告、系统维护通知</small></span><label class="notif-toggle"><input type="checkbox" data-np-optional-global"'+(p.optionalEnabled?' checked':'')+'><span class="notif-toggle-slider"></span></label></label></div><div class="np-section"><h3 class="np-section-title"><i data-lucide="moon" style="width:15px;height:15px;vertical-align:middle"></i> 免打扰时段</h3><p class="np-section-desc">设定时间段内不推送通知，重要级仅推送至站内信</p><label class="np-toggle-row"><span><strong>开启免打扰</strong><small>指定时段内不触发邮件和浏览器推送</small></span><label class="notif-toggle"><input type="checkbox" data-np-dnd-toggle"'+(p.dndEnabled?' checked':'')+'><span class="notif-toggle-slider"></span></label></label><div class="np-dnd-time-row"><div class="np-dnd-field"><label>开始时间</label><input type="time" class="field" data-np-dnd-start value="'+p.dndStart+'"></div><div class="np-dnd-sep">至</div><div class="np-dnd-field"><label>结束时间</label><input type="time" class="field" data-np-dnd-end value="'+p.dndEnd+'"></div></div><div class="np-info-card"><i data-lucide="info" style="width:14px;height:14px;flex-shrink:0;color:var(--blue)"></i><span>免打扰期间，重要级通知仅推送至站内信，不触发邮件和浏览器推送</span></div></div></div><div class="publish-footer"><button class="btn" data-np-close>关闭</button><span class="np-saved-hint" style="font-size:12px;color:var(--green);margin-right:auto;display:none"><i data-lucide="check-circle" style="width:14px;height:14px;vertical-align:middle"></i> 设置已自动保存</span></div></div></div>';
  $('view-root').insertAdjacentHTML('beforeend',html);refreshIcons()
}
function renderNotifications(){
  var all=state.notifications;
  var tab=state.notifTab;
  var range=state.notifTimeRange;
  // Split by time: current = within time range, history = older than 3 days
  var currentNotifs=all.filter(function(n){return isWithinDays(n.time,2)});
  var historyNotifs=all.filter(function(n){return !isWithinDays(n.time,2)});
  // Further filter current zone by selected time range
  var rangeFiltered=tab==='current'?all.filter(function(n){return isInTimeRange(n.time,range,state.notifCustomStart,state.notifCustomEnd)}):[];
  var activeSet=tab==='current'?rangeFiltered:historyNotifs;
  // Red dot: only count unread urgent+normal in CURRENT zone (3-day default)
  var badgeCnt=currentNotifs.filter(function(n){return (n.level==='urgent'||n.level==='normal')&&!n.read}).length;
  // History gray dot
  var historyUnread=historyNotifs.filter(function(n){return !n.read}).length;
  var html=pageHeader('Notifications','通知中心','按时间分区，当前通知优先处理');
  // Tab bar
  html+='<div class="notif-tabs">';
  html+='<button class="notif-tab'+(tab==='current'?' is-active':'')+'" data-notif-tab="current">📌 当前通知'+(badgeCnt?'<span class="notif-tab-badge">'+badgeCnt+'</span>':'')+'</button>';
  html+='<button class="notif-tab'+(tab==='history'?' is-active':'')+'" data-notif-tab="history">📂 历史记录'+(historyUnread?'<span class="notif-tab-dot"></span>':'')+'</button>';
  html+='</div>';
  if(tab==='current'){
    // ── Time Range Filter ──
    var rangeLabels={'3days':'近3天',week:'本周',month:'本月',custom:'自定义...'};
    html+='<div class="notif-range-bar">';
    var rangeKeys=['3days','week','month','custom'];
    for(var ri=0;ri<rangeKeys.length;ri++){
      var rk=rangeKeys[ri];
      var isActive=rk===range;
      var label=rangeLabels[rk];
      var icon=rk==='3days'?'calendar-clock':rk==='week'?'calendar-days':rk==='month'?'calendar':'calendar-search';
      html+='<button class="notif-range-btn'+(isActive?' is-active':'')+'" data-notif-range="'+rk+'"><i data-lucide="'+icon+'" style="width:14px;height:14px;vertical-align:middle"></i> '+label+'</button>'
    }
    html+='</div>';
    // ── Custom Date Picker ──
    if(state.notifShowCustomPicker){
      html+='<div class="notif-custom-picker"><label>起始日 <input type="date" class="field" data-notif-custom-start value="'+h(state.notifCustomStart)+'"></label><label>结束日 <input type="date" class="field" data-notif-custom-end value="'+h(state.notifCustomEnd)+'"></label><button class="button small" data-notif-custom-apply>应用</button><button class="btn small" data-notif-custom-cancel>取消</button></div>'
    }
    // ── Settings bar ──
    html+='<div class="notif-top-bar">';
    html+='<button class="notif-settings-trigger" data-notif-settings><i data-lucide="sliders-horizontal" style="width:14px;height:14px;vertical-align:middle"></i> 通知设置</button>';
    html+='<button class="notif-settings-trigger" data-np-open style="margin-left:auto;margin-right:12px"><i data-lucide="bell-off" style="width:14px;height:14px;vertical-align:middle"></i> 通知偏好</button>';
    if(badgeCnt)html+='<span class="notif-unread-count">'+badgeCnt+'条未读</span>';
    html+='</div>';
    // ── Day-Grouped Content ──
    if(rangeFiltered.length){
      // Group by day
      var groups={};
      for(var gi=0;gi<rangeFiltered.length;gi++){
        var n=rangeFiltered[gi];
        var key=getDayGroupKey(n.time,range);
        if(!groups[key])groups[key]=[];
        groups[key].push(n)
      }
      var sortedKeys=Object.keys(groups).sort().reverse();
      for(var ski=0;ski<sortedKeys.length;ski++){
        var gKey=sortedKeys[ski];
        var items=groups[gKey];
        var firstDate=items[0].time;
        var dayLabel=getDayGroupLabel(gKey,firstDate,range);
        // Apply user settings
        var urgItems=items.filter(function(x){return x.level==='urgent'&&!x.processed});
        var norItems=items.filter(function(x){return x.level==='normal'&&!x.processed});
        var optItems=items.filter(function(x){return x.level==='optional'&&!x.processed});
        var proItems=items.filter(function(x){return x.processed});
        if(!state.notifSettings.urgent)urgItems=[];
        if(!state.notifSettings.normal)norItems=[];
        if(!state.notifSettings.optional)optItems=[];
        var allItems=[].concat(urgItems).concat(norItems).concat(optItems).concat(proItems);
        if(allItems.length){
          html+='<div class="notif-day-group"><div class="notif-day-header">'+dayLabel+' <span class="notif-day-count">'+allItems.length+'条</span></div>';
          for(var ai=0;ai<allItems.length;ai++){
            var item=allItems[ai];
            var timeStr=formatNotifTime(item.time,true,range);
            html+=renderNotifItem(item,timeStr)
          }
          html+='</div>'
        }
      }
    } else {
      html+=stateBlock('当前范围内没有通知','调整时间范围查看','calendar-x')
    }
    // ── Bottom History Bridge ──
    var historyUnreadCount=historyNotifs.filter(function(n){return !n.read}).length;
    var bridgeText='📂 查看 3 天前的历史通知';
    if(historyUnreadCount>0)bridgeText+='（'+historyUnreadCount+' 条未读）';
    html+='<div class="notif-history-bridge" data-notif-tab="history"><div class="notif-bridge-line"></div><button class="notif-bridge-btn"><span>'+bridgeText+'</span> <i data-lucide="arrow-right" style="width:14px;height:14px;vertical-align:middle"></i></button><div class="notif-bridge-line"></div></div>'
  } else {
    // ── History Tab ──
    html+='<div class="notif-top-bar"><span style="font-size:12px;color:var(--ink-3)">3天前的归档通知，仅用于回溯查阅</span></div>';
    // Group by level
    var urgent=activeSet.filter(function(n){return n.level==='urgent'&&!n.processed});
    var normal=activeSet.filter(function(n){return n.level==='normal'&&!n.processed});
    var optional=activeSet.filter(function(n){return n.level==='optional'&&!n.processed});
    var processed=activeSet.filter(function(n){return n.processed});
    if(!state.notifSettings.urgent)urgent=[];
    if(!state.notifSettings.normal)normal=[];
    if(!state.notifSettings.optional)optional=[];
    if(urgent.length){
      html+='<div class="notif-level-section"><div class="notif-level-header urgent"><span class="notif-level-badge urgent">🔴</span> 紧急重要 <span class="notif-level-count">'+urgent.length+'条</span></div>';
      for(var ui=0;ui<urgent.length;ui++)html+=renderNotifItem(urgent[ui],formatNotifTime(urgent[ui].time,false));
      html+='</div>'
    }
    if(normal.length){
      html+='<div class="notif-level-section"><div class="notif-level-header normal"><span class="notif-level-badge normal">🟡</span> 普通互动 <span class="notif-level-count">'+normal.length+'条</span></div>';
      for(var ni=0;ni<normal.length;ni++)html+=renderNotifItem(normal[ni],formatNotifTime(normal[ni].time,false));
      html+='</div>'
    }
    if(optional.length){
      html+='<div class="notif-level-section"><div class="notif-level-header optional"><span class="notif-level-badge optional">⚪</span> 可选阅读 <span class="notif-level-count">'+optional.length+'条</span></div>';
      for(var oi=0;oi<optional.length;oi++)html+=renderNotifItem(optional[oi],formatNotifTime(optional[oi].time,false));
      html+='</div>'
    }
    if(processed.length){
      html+='<div class="notif-level-section"><div class="notif-level-header processed" data-notif-toggle-processed><span class="notif-level-badge processed">✅</span> 已处理 <span class="notif-level-count">'+processed.length+'条</span><span class="notif-toggle-arrow">▼</span></div><div class="notif-processed-list" id="notif-processed-list">';
      for(var pi=0;pi<processed.length;pi++)html+=renderNotifItem(processed[pi],formatNotifTime(processed[pi].time,false));
      html+='</div></div>'
    }
    if(!urgent.length&&!normal.length&&!optional.length&&!processed.length){
      html+=stateBlock('暂无历史记录','3天前的归档通知会出现在这里','bell-off')
    }
  }
  // Settings panel
  if(state.notifShowSettings)html+=renderNotifSettings();
  $('view-root').innerHTML=html;refreshIcons()
}
function renderResources(){
  var tabs='';var tr=['public','courses','personal'],tl=['公共资料库','课程中心','个人空间'];
  for(var ti=0;ti<3;ti++)tabs+='<button class="feed-tab res-nav-tab'+(state.resourceTab===tr[ti]?' is-active':'')+'" data-res-tab="'+tr[ti]+'">'+tl[ti]+'</button>';
  var p=state.points||{};
  var ptsChip=(state.resourceTab==='public'&&p.loaded)?('<span class="res-points-chip" title="上传资料+'+p.uploadReward+'积分，解锁资料-'+p.unlockCost+'积分">🏅 积分 <b>'+p.balance+'</b><span class="pts-rule">上传 +'+p.uploadReward+' · 解锁 -'+p.unlockCost+'</span></span>'):'';
  var hdr=pageHeader('Course library','课程资料','汇集官方讲义、历年试卷与个人笔记，按课程与学期快速检索。')+(state.resourceTab==='public'?'<div class="page-toolbar">'+ptsChip+'<button class="button primary" style="margin-left:auto" data-res-upload-open>上传资料</button></div>':'');
  var tabBar='<div class="feed-tabs res-tab-row">'+tabs+'</div>';
  if(state.resourceTab==='courses'){renderCourseCenter(tabBar,hdr);return}
  if(state.resourceTab==='personal'){renderPersonalSpace(tabBar,hdr);return}
  var f=state.resourceFilters,c=state.resourceCatalog||{};
  var l=state.resources.filter(function(r){return(f.year==='all'||r.year===f.year)&&(f.term==='all'||r.term===f.term)&&(f.course==='all'||r.course===f.course)&&((f.types||[]).length===0||(f.types||[]).indexOf(r.type)>=0)&&(f.source==='all'||r.source===f.source)&&(!f.keyword||(r.name+' '+r.course+' '+r.courseName).toLowerCase().indexOf(f.keyword.toLowerCase())>=0)});
  var cOpts=c.courses.filter(function(co){return(f.year==='all'||co.year===f.year)&&(f.term==='all'||co.term===f.term)&&(f.major==='all'||co.major===f.major||co.major==='All')});
  var types=['笔记','PPT课件','课后讲义','作业','考试试卷','实验指导','复习提纲','资料'];
  var grades=['大一','大二','大三','大四','研究生'],gmap={'大一':'Year 1','大二':'Year 2','大三':'Year 3','大四':'Year 4'};
  var bc=[];if(f.major!=='all')bc.push(f.major);if(f.course!=='all')bc.push(f.course);if((f.types||[]).length)for(var bti=0;bti<f.types.length;bti++)bc.push(f.types[bti]);if(f.source!=='all')bc.push(f.source==='官方'?'官方':'个人');
  var bcHtml='';if(bc.length){bcHtml='<div style="display:flex;align-items:center;gap:6px;margin:-4px 0 10px;font-size:12px;color:var(--ink-3);flex-wrap:wrap"><span>筛选：</span>';for(var bi=0;bi<bc.length;bi++)bcHtml+='<span class="res-bc-chip">'+h(bc[bi])+'</span>';bcHtml+='<button class="btn small" data-res-clear-all style="margin-left:auto">清除全部</button></div>'}
  var html='';
  html+=hdr+tabBar+'<section class="search-panel"><form id="resource-filter-form">'+bcHtml;
  html+='<div class="res-filter-row"><span class="res-filter-label">专业</span><select class="field" id="res-major" style="flex:1"><option value="all">全部专业</option>';
  if(c.majors)for(var mi=0;mi<c.majors.length;mi++){var m=c.majors[mi];html+='<option value="'+h(m.value)+'"'+(f.major===m.value?' selected':'')+'>'+h(m.label)+'</option>'}
  html+='</select><span class="res-filter-label">来源</span><div class="segmented-control"><button type="button" class="'+(f.source==='all'?'is-active':'')+'" data-res-source="all">全部</button><button type="button" class="'+(f.source==='官方'?'is-active':'')+'" data-res-source="官方"> 官方</button><button type="button" class="'+(f.source==='个人'?'is-active':'')+'" data-res-source="个人">👤 个人</button></div></div>';
  html+='<div class="res-filter-row"><span class="res-filter-label">年级</span><div class="res-tag-group">';
  for(var gi=0;gi<grades.length;gi++){var g=grades[gi];html+='<button type="button" class="res-tag-btn'+((f.year===gmap[g])&&f.year!=='all'?' active':'')+'" data-res-grade="'+g+'">'+g+'</button>'}
  html+='</div></div>';
  html+='<div class="res-filter-row"><span class="res-filter-label">类型</span><div class="res-tag-group">';
  for(var tpi=0;tpi<types.length;tpi++){var tp=types[tpi];html+='<button type="button" class="res-type-btn'+((f.types||[]).indexOf(tp)>=0?' active':'')+'" data-res-types="'+tp+'">'+tp+'</button>'}
  html+='</div></div>';
  html+='<div class="res-filter-row"><span class="res-filter-label">搜索</span><input class="field" id="res-keyword" value="'+h(f.keyword)+'" placeholder="搜索课程名称或资料关键词…" style="flex:1"><select class="field" id="res-course" style="width:auto;min-width:120px"><option value="all">全部课程</option>';
  for(var coi=0;coi<cOpts.length;coi++){var co=cOpts[coi];html+='<option value="'+h(co.code)+'"'+(f.course===co.code?' selected':'')+'>'+h(co.code)+' '+h(co.name)+'</option>'}
  html+='</select><select class="field" id="res-time" style="width:auto;min-width:100px"><option value="all">全部时间</option><option value="week">近一周</option><option value="month">近一月</option><option value="term">近一学期</option></select><button class="button" type="submit">🔍 搜索</button></div>';
  html+='</form></section>';
  html+=renderResUploadForm();
  var off=l.filter(function(r){return r.source==='官方'}),per=l.filter(function(r){return r.source==='个人'});
  html+='<div class="res-section-header"><span class="res-section-badge official"> 官方资料</span><span style="color:var(--ink-3);font-size:12px;margin-left:8px">'+off.length+'项</span></div>';
  if(off.length){for(var oi=0;oi<off.length;oi++)html+=renderResItem(off[oi],true)}else html+='<p style="padding:0 24px;color:var(--ink-3);font-size:13px">暂无官方资料</p>';
  html+='<div class="res-section-header"><span class="res-section-badge personal">👤 个人分享</span><span style="color:var(--ink-3);font-size:12px;margin-left:8px">'+per.length+'项</span></div>';
  if(per.length){for(var pi=0;pi<per.length;pi++)html+=renderResItem(per[pi],false)}else html+='<p style="padding:0 24px;color:var(--ink-3);font-size:13px">暂无个人分享资料</p>';
  /* 首次使用课程资料弹窗提示 */
  if(p.loaded&&!p.seenIntro){
    html+='<div class="publish-overlay" id="points-intro-overlay"><div class="publish-modal" style="max-width:460px"><div class="publish-modal-header"><h2>🏅 资料库积分规则</h2></div><div class="publish-body" style="font-size:13px;line-height:1.9;color:var(--ink-2)"><p style="margin:0 0 10px">欢迎首次使用课程资料库！为了让资料库持续保持活力，我们采用积分制：</p><p style="margin:0 0 8px">📚 <strong>公共资料库前 '+p.freeCount+' 份资料</strong>可随意预览、下载</p><p style="margin:0 0 8px">📤 <strong>上传一份资料 +'+p.uploadReward+' 积分</strong>（你上传的资料自己永远免费）</p><p style="margin:0 0 10px">🔒 <strong>'+p.unlockCost+' 积分解锁一份新资料</strong>（第 '+(p.freeCount+1)+' 份起）</p><p style="margin:0;font-size:12px;color:var(--ink-3)">当前余额：<strong>'+p.balance+'</strong> 分 · 上传资料即可快速赚取积分</p></div><div class="publish-footer"><button class="btn primary" data-points-intro-ok>我知道了</button></div></div></div>';
  }
  $('view-root').innerHTML=html;refreshIcons()
}
function renderQa(){
  if(state.qaDetail){renderQaDetail();return}
  var q=state.questions||[],tab=state.qaTab||0,c=state.resourceCatalog||{},cos=c.courses||[];
  var tabs=['最新问题','最热回答','待解决','我的问题'];
  var filtered=[];
  if(tab===0){filtered=[].concat(q);filtered.sort(function(a,b){return new Date(b.time)-new Date(a.time)})}
  else if(tab===1){filtered=[].concat(q);filtered.sort(function(a,b){return(b.votes||0)-(a.votes||0)})}
  else if(tab===2)filtered=q.filter(function(x){return x.answers_count===0||x.tag==='待解决'});
  else filtered=q.filter(function(x){return state.qaBookmarked[x.id]});
  if(state.qaCourse!=='all')filtered=filtered.filter(function(x){return x.course===state.qaCourse});
  if(state.qaKeyword)filtered=filtered.filter(function(x){var kw=state.qaKeyword.toLowerCase();return(x.course||'').toLowerCase().indexOf(kw)>=0||(x.courseName||'').toLowerCase().indexOf(kw)>=0||(x.question||'').toLowerCase().indexOf(kw)>=0||(x.summary||'').toLowerCase().indexOf(kw)>=0});
  var cur=state.qaCourse!=='all'?cos.find(function(x){return x.code===state.qaCourse}):null;
  var topRes=state.resources.filter(function(r){return r.source==='官方'&&(state.qaCourse==='all'||r.course===state.qaCourse)});
  var qhtml='';
  for(var qi=0;qi<filtered.length;qi++){
    var x=filtered[qi],a=x.answers_detail?x.answers_detail[0]:null;
    qhtml+='<article class="qa-card" data-qa-id="'+x.id+'">';
    qhtml+='<div class="qa-card-body">';
    qhtml+='<div class="qa-card-top"><span class="qa-status '+(x.status||'unsolved')+'">'+(x.status==='solved'?'已解决':'待解决')+'</span><span class="qa-course-tag">'+h(x.course)+'</span>'+(x.pinned?'<span class="qa-pinned">置顶</span>':'')+'</div>';
    qhtml+='<h3 class="qa-title">'+h(x.question)+'</h3>';
    qhtml+='<p class="qa-summary">'+h(x.summary||'').slice(0,120)+(x.summary&&x.summary.length>120?'...':'')+'</p>';
    qhtml+='<div class="qa-meta"><span class="avatar post-avatar-small" style="width:22px;height:22px;font-size:10px;cursor:default">'+h((x.author||'匿').slice(0,1))+'</span><span class="qa-author">'+h(x.author||'匿名')+'</span><span>·</span><span class="qa-time">'+formatTime(x.time)+'</span><span>·</span><button class="action-button qa-like-btn'+(x.liked?' is-active':'')+'" data-like-qa="'+x.id+'"><i data-lucide="heart"></i><span class="label">'+(x.liked?'已赞':'赞')+'</span><span>'+(x.votes||0)+'</span></button><span>·</span><span class="qa-replies"><i data-lucide="message-circle" style="width:12px;height:12px;vertical-align:middle"></i> '+(x.answers_count||0)+'个回答</span><span>·</span><button class="action-button qa-bookmark-btn'+(state.qaBookmarked[x.id]?' is-active':'')+'" data-qa-bookmark="'+x.id+'"><i data-lucide="'+(state.qaBookmarked[x.id]?'bookmark-check':'bookmark')+'" style="width:13px;height:13px"></i><span class="label">'+(state.qaBookmarked[x.id]?'已收藏':'收藏')+'</span></button></div>';
    if(a){qhtml+='<div class="qa-best-answer"><span class="qa-answer-role">'+h(a.role)+'</span><span class="qa-answer-text">'+h(a.content).slice(0,80)+(a.content.length>80?'…':'')+'</span>'+(a.accepted?'<span class="qa-accepted">✓ 已采纳</span>':'')+'</div>'}
    qhtml+='</div>';
    if(topRes.length&&tab!==3){qhtml+='<div class="qa-res-widget"><span class="qa-res-widget-title"><i data-lucide="book-open" style="width:14px;height:14px;vertical-align:middle"></i> 相关资料</span>';for(var ti=0;ti<topRes.length;ti++)qhtml+='<div class="qa-res-item" data-res-open="'+topRes[ti].id+'"><i data-lucide="file-text"></i><span>'+h(topRes[ti].name.slice(0,18))+(topRes[ti].name.length>18?'…':'')+'</span></div>';qhtml+='</div>'}
    qhtml+='</article>'
  }
  if(!filtered.length)qhtml='<div class="state-block"><i data-lucide="'+(tab===3?'bookmark':'search')+'" style="font-size:48px"></i><strong>'+(tab===3?'还没有收藏的问题':state.qaKeyword?'没有找到匹配的问题':'暂无匹配的问题')+'</strong><p>'+(tab===3?'在问题卡片下方点击收藏按钮，问题会出现在这里':state.qaKeyword?'试试其他关键词或切换课程筛选':'切换分类或课程筛选试试')+'</p></div>';
  var html='<div class="qa-page">';
  html+=pageHeader('Course Q&A','课程问答','来自课程学习中的真实问题，教师与同学共同解答，优质答案会被采纳标记。');
  html+='<div class="page-toolbar">'+(cur?'<span class="qa-course-label">'+h(cur.code)+' '+h(cur.name)+'</span>':'')+'<select class="field" id="qa-course" style="width:auto;min-width:140px"><option value="all">全部课程</option>';
  for(var coi=0;coi<cos.length;coi++)html+='<option value="'+h(cos[coi].code)+'"'+(state.qaCourse===cos[coi].code?' selected':'')+'>'+h(cos[coi].code)+' '+h(cos[coi].name)+'</option>';
  html+='</select><div class="qa-search-wrap"><i data-lucide="search" class="qa-search-icon"></i><input class="field" id="qa-keyword" value="'+h(state.qaKeyword)+'" placeholder="搜索课程名称或问题…" style="padding-left:30px;width:180px"></div><button class="qa-ask-btn" data-qa-ask style="margin-left:auto">我要提问</button></div>';
  html+='<div class="qa-tabs">';
  for(var tni=0;tni<tabs.length;tni++)html+='<button class="qa-tab'+(tab===tni?' active':'')+'" data-qa-tab="'+tni+'">'+tabs[tni]+'</button>';
  html+='</div><div class="qa-content"><div class="qa-stream">'+qhtml+'</div></div>';
  html+='<div class="qa-footer"><span data-qa-load-more>— 加载更多 —</span></div></div>';
  $('view-root').innerHTML=html;refreshIcons()
}
/* ═══ QA ASK MODAL (发布提问) ═══ */
function updateQaAskTagsCurrent(){
  var container=document.getElementById('qa-ask-tags-current');
  if(!container)return;
  var html='';
  if(state.qaAskTags.length){
    html+='<span style="font-size:11px;color:var(--ink-3);margin-right:6px">已选标签：</span>';
    for(var ti=0;ti<state.qaAskTags.length;ti++)
      html+='<span class="qa-ask-tag-chip is-selected" data-ask-tag-remove="'+ti+'">'+h(state.qaAskTags[ti])+' <span style="cursor:pointer;font-size:12px;color:var(--red)">✕</span></span>';
  }else{
    html+='<span style="font-size:11px;color:var(--ink-3)">暂未选择标签</span>';
  }
  container.innerHTML=html;
}
function toggleQaAskTagChip(tag,isSelected){
  var chips=document.querySelectorAll('#qa-ask-overlay [data-ask-tag]');
  for(var i=0;i<chips.length;i++){
    if(chips[i].dataset.askTag===tag){
      chips[i].classList.toggle('is-selected',isSelected);
      chips[i].textContent=(isSelected?'✓ ':'')+tag;
      break;
    }
  }
}
function updateQaAskAnon(){
  var options=document.querySelectorAll('#qa-ask-overlay [data-ask-anon]');
  for(var i=0;i<options.length;i++){
    options[i].classList.toggle('is-active',options[i].dataset.askAnon===String(state.qaAskAnonymous));
  }
  var previewAnon=document.querySelector('#qa-ask-overlay .qa-ask-preview-anon');
  if(previewAnon)previewAnon.textContent=state.qaAskAnonymous?'🕊️ 匿名提问':'👤 实名提问';
}
function renderQaAskModal(){
  if(!state.qaAskForm)return;
  var oldQa=document.getElementById('qa-ask-overlay');if(oldQa)oldQa.remove();
  var c=state.resourceCatalog||{},cos=c.courses||[];
  var curCourse=state.qaAskCourse||state.qaCourse;
  var step=state.qaAskStep||1;
  var steps=[{num:1,label:'绑定课程'},{num:2,label:'撰写问题'}];
  var stepBar=steps.map(function(st){return'<span style="display:flex;align-items:center;gap:6px;font-size:'+(st.num===step?'13px':'11px')+';color:'+(st.num===step?'var(--ink)':'var(--ink-3)')+';font-weight:'+(st.num===step?'650':'400')+'"><span style="display:grid;place-items:center;width:'+(st.num===step?'26px':'22px')+';height:'+(st.num===step?'26px':'22px')+';border-radius:50%;background:'+(st.num===step?'var(--blue,#8EA5B6)':st.num<step?'var(--green-soft)':'var(--surface-soft)')+';color:'+(st.num===step?'#fff':st.num<step?'var(--green)':'var(--ink-3)')+';font-size:11px;font-weight:700">'+(st.num<step?'✓':st.num)+'</span>'+st.label+'</span>'}).join('<span style="color:var(--ink-3);margin:0 2px">→</span>');
  var body='';
  if(step===1){
    body='<div class="qa-ask-step"><p class="qa-ask-hint">选择你要提问的课程<span class="req">*</span></p><div class="form-group"><label>课程</label><select id="qa-ask-course" class="field"><option value="">请选择课程</option>';
    for(var coi=0;coi<cos.length;coi++)body+='<option value="'+h(cos[coi].code)+'"'+(curCourse===cos[coi].code?' selected':'')+'>'+h(cos[coi].code)+' '+h(cos[coi].name)+'</option>';
    body+='</select></div><div class="qa-ask-tip"><i data-lucide="info" style="width:14px;height:14px;vertical-align:middle"></i> 选择课程后，你的问题将展示在该课程问答区，方便老师和同学回答</div></div>'
  }else if(step===2){
    var suggestedTags=['作业求助','概念辨析','考研拓展','期末备考','项目实践','实验报告','文献阅读','代码调试','选课咨询','留学规划'];
    body='<div class="qa-ask-step"><p class="qa-ask-hint">详细描述你的问题</p><div class="form-group"><label>标题<span class="req">*</span></label><input id="qa-ask-title" class="field" value="'+h(state.qaAskTitle)+'" placeholder="简洁明确地概括你的问题…" maxlength="100"></div><div class="form-group"><label>详情</label><div class="qa-ask-editor"><textarea id="qa-ask-details" class="field" placeholder="支持Markdown格式，可插入代码块、图片等…" style="min-height:140px;resize:vertical;font-family:monospace;line-height:1.7;font-size:14px">'+h(state.qaAskDetails)+'</textarea></div><div class="qa-ask-editor-actions"><button class="qa-ask-editor-btn" data-ask-insert="code"><i data-lucide="brackets" style="width:14px;height:14px;vertical-align:middle"></i> 代码块</button><button class="qa-ask-editor-btn" data-ask-insert="image"><i data-lucide="image" style="width:14px;height:14px;vertical-align:middle"></i> 插入图片</button><button class="qa-ask-editor-btn" data-ask-insert="bold"><i data-lucide="bold" style="width:14px;height:14px;vertical-align:middle"></i> 加粗</button><button class="qa-ask-editor-btn" data-ask-insert="list"><i data-lucide="list" style="width:14px;height:14px;vertical-align:middle"></i> 列表</button></div></div><div class="form-group" style="margin-top:14px"><label>标签</label><div class="qa-ask-tags-suggest">';
    for(var sti=0;sti<suggestedTags.length;sti++){var tag=suggestedTags[sti];var isSelected=state.qaAskTags.indexOf(tag)>=0;body+='<span class="qa-ask-tag-chip'+(isSelected?' is-selected':'')+'" data-ask-tag="'+h(tag)+'">'+(isSelected?'✓ ':'')+h(tag)+'</span>'}
    body+='</div></div><div class="form-group"><div class="qa-ask-custom-tag-row"><input id="qa-ask-custom-tag" class="field" value="'+h(state.qaAskCustomTag)+'" placeholder="输入自定义标签后回车添加" maxlength="20" style="flex:1"><button class="button button-small" id="qa-ask-tag-add">添加</button></div></div><div class="qa-ask-tags-current" id="qa-ask-tags-current">';
    if(state.qaAskTags.length){body+='<span style="font-size:11px;color:var(--ink-3);margin-right:6px">已选标签：</span>';for(var ti=0;ti<state.qaAskTags.length;ti++)body+='<span class="qa-ask-tag-chip is-selected" data-ask-tag-remove="'+ti+'">'+h(state.qaAskTags[ti])+' <span style="cursor:pointer;font-size:12px;color:var(--red)">✕</span></span>'}else{body+='<span style="font-size:11px;color:var(--ink-3)">暂未选择标签</span>'}
    body+='</div><div class="qa-ask-anon-card" style="margin-top:14px"><div class="qa-ask-anon-option'+(state.qaAskAnonymous?'':' is-active')+'" data-ask-anon="false"><span class="qa-ask-anon-icon"><i data-lucide="user" style="width:22px;height:22px"></i></span><strong>实名提问</strong><p>你的姓名对所有用户可见，便于老师同学认识你</p></div><div class="qa-ask-anon-option'+(state.qaAskAnonymous?' is-active':'')+'" data-ask-anon="true"><span class="qa-ask-anon-icon"><i data-lucide="eye-off" style="width:22px;height:22px"></i></span><strong>匿名提问</strong><p>仅老师可见你的学号，同学之间不可见，提问更安心</p></div></div><div class="qa-ask-tip"><i data-lucide="shield" style="width:14px;height:14px;vertical-align:middle"></i> 匿名模式下，老师仍可查看你的身份信息以便后续联系，其他同学仅见"匿名"标识</div>';
    if(state.qaAskCourse&&state.qaAskTitle)body+='<div class="qa-ask-preview"><h4>提问预览</h4><div class="qa-ask-preview-card"><span class="qa-course-tag">'+h(state.qaAskCourse)+'</span><strong>'+h(state.qaAskTitle)+'</strong>'+(state.qaAskDetails?'<p>'+h(state.qaAskDetails.slice(0,120))+(state.qaAskDetails.length>120?'…':'')+'</p>':'')+'<div class="qa-ask-preview-tags">'+(state.qaAskTags||[]).map(function(t){return'<span class="qa-ask-tag-chip is-selected" style="cursor:default">'+h(t)+'</span>'}).join('')+'</div><span class="qa-ask-preview-anon">'+(state.qaAskAnonymous?'🕊️ 匿名提问':'👤 实名提问')+'</span></div></div>'
  }
  var html='<div class="publish-overlay" id="qa-ask-overlay"><div class="publish-modal" style="max-width:754px"><div class="publish-modal-header"><h2><i data-lucide="message-circle" style="width:18px;height:18px;vertical-align:middle"></i> 发布提问</h2><button class="publish-close" data-qa-ask-close>✕</button></div><div style="display:flex;align-items:center;gap:8px;padding:12px 24px;border-bottom:1px solid var(--line)">'+stepBar+'</div><div class="publish-body">'+body+'</div><div class="publish-footer"><button class="btn small" data-qa-ask-cancel>取消</button>'+(step>1?'<button class="btn small" data-qa-ask-prev>← 上一步</button>':'')+'<button class="btn qa-ask-submit-btn" data-qa-ask-next>'+(step<2?'下一步 →':'<i data-lucide="send" style="width:14px;height:14px;vertical-align:middle"></i> 提交问题')+'</button></div></div></div>';
  $('view-root').insertAdjacentHTML('beforeend',html);refreshIcons()
}
function submitQaAsk(){
  if(!state.qaAskCourse){toast('请选择课程','error');return}
  if(!state.qaAskTitle.trim()){toast('请输入问题标题','error');return}
  var newQ={
    id:'q_new_'+Date.now(),
    question:state.qaAskTitle.trim(),
    summary:state.qaAskDetails.trim()?state.qaAskDetails.trim().replace(/```[\s\S]*?```/g,'[代码]').replace(/!\[.*?\]\(.*?\)/g,'[图片]').slice(0,200):'',
    course:state.qaAskCourse,
    courseName:state.resourceCatalog.courses.find(function(x){return x.code===state.qaAskCourse})?.name||'',
    author:state.qaAskAnonymous?'匿名同学':'张三',
    major_class:state.qaAskAnonymous?'':'计算机2101',
    status:'unsolved',
    pinned:false,
    answers_count:0,
    views:0,
    votes:0,
    time:new Date().toISOString().slice(0,16).replace('T',' '),
    tag:state.qaAskTags.length?state.qaAskTags[0]:'最新',
    tags:state.qaAskTags.slice(),
    answers_detail:[]
  };
  state.questions.unshift(newQ);
  apiWrite('/api/courses/qa?course='+encodeURIComponent(state.qaAskCourse)+'&question='+encodeURIComponent(state.qaAskTitle.trim())+'&anonymous='+(state.qaAskAnonymous?'true':'false'));
  state.qaAskForm=false;state.qaAskStep=1;state.qaAskCourse='';state.qaAskTitle='';state.qaAskDetails='';state.qaAskTags=[];state.qaAskCustomTag='';state.qaAskAnonymous=false;state.qaAskMedia=[];
  var qao=document.getElementById('qa-ask-overlay');if(qao)qao.remove();
  toast('🎉 问题已发布！');
  if(state.route==='qa')render();else{state.route='qa';render()}
}
function renderQaDetail(){
  var q=state.questions.find(function(x){return x.id===state.qaDetail});if(!q){state.qaDetail='';render();return}
  var ans=q.answers_detail||[];
  var sorted=[];
  for(var ai=0;ai<ans.length;ai++){var a=ans[ai];a._sort=(a.role==='教师'?0:a.accepted?1:2)+'-'+(a.votes||0);sorted.push(a)}
  sorted.sort(function(a,b){if(a.role==='教师'&&b.role!=='教师')return-1;if(a.role!=='教师'&&b.role==='教师')return 1;if(a.accepted&&!b.accepted)return-1;if(!a.accepted&&b.accepted)return 1;return(b.votes||0)-(a.votes||0)});
  state.qaAnswerList=sorted;
  var ansHtml='';
  for(var si=0;si<sorted.length;si++){
    var s=sorted[si],isTeacher=s.role==='教师',isAccepted=s.accepted&&s.role!=='教师',hot=(s.votes||0)>=5;
    ansHtml+='<div class="qa-answer-item'+(isTeacher?' is-teacher':'')+'">';
    ansHtml+='<div class="qa-answer-header"><span class="qa-answer-avatar">'+h((s.name||s.role).slice(0,1))+'</span><div class="qa-answer-info"><strong>'+h(s.name||s.role)+'</strong>'+(isTeacher?'<span class="qa-teacher-badge"><i data-lucide="graduation-cap" style="width:13px;height:13px;vertical-align:middle"></i> 教师认证</span>':'')+'<span class="qa-answer-role-tag">'+h(s.role)+'</span></div><div class="qa-answer-meta-right">'+(isAccepted?'<span class="qa-accepted-tag"><i data-lucide="check-circle" style="width:13px;height:13px;vertical-align:middle"></i> 采纳</span>':'')+(hot&&!isTeacher?'<span class="qa-hot-tag"><i data-lucide="flame" style="width:13px;height:13px;vertical-align:middle"></i> 热门</span>':'')+'<span>'+formatTime(s.time||'')+'</span></div></div>';
    ansHtml+='<div class="qa-answer-content">'+h(s.content)+'</div>';
    if(s.replies&&s.replies.length){ansHtml+='<div class="qa-replies-thread">';for(var ri=0;ri<s.replies.length;ri++){var r=s.replies[ri];ansHtml+='<div class="qa-reply-item"><span class="qa-reply-arrow">↳</span><span class="qa-reply-author">'+h(r.author)+'</span><span class="qa-reply-text">'+h(r.content)+'</span><span class="qa-reply-time">'+formatTime(r.time)+'</span></div>'}ansHtml+='</div>'}
    ansHtml+='<div class="qa-answer-actions"><button class="qa-action-btn" data-qa-thank="'+si+'"><i data-lucide="hand-helping" style="width:14px;height:14px;vertical-align:middle"></i> 感谢</button><button class="qa-action-btn" data-qa-followup="'+si+'"><i data-lucide="message-circle" style="width:14px;height:14px;vertical-align:middle"></i> 追问</button><button class="qa-action-btn qa-vote-btn'+(s.voted?' is-active':'')+'" data-qa-vote-answer="'+si+'"><i data-lucide="thumbs-up" style="width:14px;height:14px;vertical-align:middle"></i> <span class="vote-count">'+((s.votes||0)+'')+'</span></button></div><div class="qa-followup-area" data-followup-area="'+si+'" style="display:none"><form class="qa-followup-form"><textarea class="qa-followup-input" placeholder="写下你的追问…" rows="2"></textarea><button type="submit" class="qa-followup-submit">发送追问</button></form></div></div>'
  }
  if(!ansHtml)ansHtml='<div class="state-block"><i data-lucide="message-circle" style="font-size:36px"></i><strong>还没有回答</strong><p>成为第一个回答的人吧</p></div>';
  var html='<div class="detail-overlay">';
  html+='<button class="detail-back" data-qa-back>'+(state.profileReturn?'← 返回个人主页':'← 返回问答列表')+'</button>';
  html+='<div class="qa-detail-hero"><div class="qa-detail-top-badges"><span class="qa-status '+(q.status||'unsolved')+'">'+(q.status==='solved'?'已解决':'待解决')+'</span><span class="qa-course-tag">'+h(q.course)+' '+h(q.courseName||'')+'</span></div><h1 class="qa-detail-title">'+h(q.question)+'</h1>'+(q.summary?'<p class="qa-detail-summary">'+h(q.summary)+'</p>':'')+'<div class="qa-detail-meta"><span class="avatar post-avatar-small" style="width:22px;height:22px;font-size:10px;cursor:default">'+h((q.author||'匿').slice(0,1))+'</span><span class="qa-author">'+h(q.author||'匿名')+'</span><span>·</span><span>'+formatTime(q.time)+'</span><span>·</span><button class="action-button qa-like-btn'+(q.liked?' is-active':'')+'" data-like-qa="'+q.id+'"><i data-lucide="heart"></i><span class="label">'+(q.liked?'已赞':'赞')+'</span><span>'+(q.votes||0)+'</span></button><span>·</span><span><i data-lucide="message-circle" style="width:13px;height:13px;vertical-align:middle"></i> '+(q.answers_count||0)+'个回答</span><span>·</span><button class="action-button qa-bookmark-btn'+(state.qaBookmarked[q.id]?' is-active':'')+'" data-qa-bookmark="'+q.id+'"><i data-lucide="'+(state.qaBookmarked[q.id]?'bookmark-check':'bookmark')+'" style="width:13px;height:13px"></i><span class="label">'+(state.qaBookmarked[q.id]?'已收藏':'收藏')+'</span></button></div></div>';
  // Related materials for this course - show all
  var topRes=state.resources.filter(function(r){return r.source==='官方'&&(q.course==='all'||r.course===q.course)});
  if(topRes.length){html+='<div class="qa-res-widget" style="margin:12px 0"><span class="qa-res-widget-title"><i data-lucide="book-open" style="width:14px;height:14px;vertical-align:middle"></i> 相关资料</span>';for(var ti=0;ti<topRes.length;ti++)html+='<div class="qa-res-item" data-res-open="'+topRes[ti].id+'"><i data-lucide="file-text"></i><span>'+h(topRes[ti].name.slice(0,18))+(topRes[ti].name.length>18?'…':'')+'</span></div>';html+='</div>'}
  html+='<div class="qa-answers-section"><h3><i data-lucide="message-circle" style="width:16px;height:16px;vertical-align:middle"></i> 回答 ('+ans.length+'条)</h3>'+ansHtml+'</div>';
  html+='</div>';
  html+='<div class="qa-reply-bar"><form id="qa-reply-form"><div class="qa-reply-input-wrap"><textarea id="qa-reply-input" placeholder="写下你的回答…" rows="1"></textarea><div class="qa-reply-actions"><button type="submit" class="qa-reply-submit-btn">发布回答</button></div></div></form></div>';
  $('view-root').innerHTML=html;refreshIcons()
}
function renderCollectionView(){
  if(state.collActiveFolder){renderFolderDetail();return}
  var saved=(state.resSaved&&Object.keys(state.resSaved).length)?Object.keys(state.resSaved).map(k=>state.resources.find(r=>r.id===k)).filter(Boolean):[];
  var folders=state.collFolders||[];var tab=state.collTab||0;
  var colors=['#c9b99a','#a8b5c8','#b8c9a8','#c8b5a8','#a8c4c8','#c8a8b8','#b8a8c8','#c8c8a8'];
  $('view-root').innerHTML=`<div class="detail-overlay">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0 12px">
      <button class="detail-back" data-coll-back>← 返回个人空间</button>
      <span style="font-size:17px;font-weight:700">我的收藏</span>
      <div style="display:flex;gap:6px">
        <button class="btn small" data-coll-new-folder>＋ 新建收藏夹</button>
        <button class="btn small" data-coll-batch>批量管理</button></div></div>
    <div style="display:flex;align-items:center;gap:12px;padding:8px 0 12px;border-bottom:1px solid var(--line);color:var(--ink-2);font-size:12px">
      <span>📦 共收藏 <strong>${saved.length}</strong> 份资料</span>
      <span style="opacity:.5">·</span>
      <span>📁 已建立 <strong>${folders.length}</strong> 个收藏夹</span></div>
    <div class="feed-tabs" style="margin-top:0;margin-bottom:14px"><button class="feed-tab${tab===0?' is-active':''}" data-coll-tab="0">📁 我的收藏夹</button><button class="feed-tab${tab===1?' is-active':''}" data-coll-tab="1">📋 全部资料</button></div>
    ${tab===0?'<div class="coll-folder-grid"><div class="coll-folder-card new" data-coll-new-folder><span class="coll-new-icon">＋</span><span style="font-size:12px;color:var(--ink-3)">新建收藏夹</span></div>'+folders.map(function(f){var i=folders.indexOf(f);var col=colors[i%colors.length];var itemCnt=f.items.length;return'<div class="coll-folder-card" data-coll-folder="'+f.id+'" style="border-left:4px solid '+col+'"><div class="coll-folder-cover" style="background:'+col+'22"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="'+col+'" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg><span style="font-size:12px;font-weight:700;color:'+col+'">'+itemCnt+'项</span></div><div style="padding:8px 12px 4px"><strong style="font-size:13px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+h(f.name)+'</strong><div style="font-size:11px;color:var(--ink-3);margin-top:4px;display:flex;align-items:center;gap:6px"><span>'+itemCnt+'项</span><span>·</span><span>'+h(f.updated)+'</span>'+(f.public?'<span class="status success" style="margin-left:auto;font-size:10px">公开</span>':'')+'</div></div><div style="padding:0 12px 8px;display:flex;gap:4px;justify-content:flex-end"><button class="btn small" data-coll-edit="'+f.id+'">编辑</button><button class="btn small" data-coll-share="'+f.id+'">分享</button><button class="btn small" style="border-color:var(--red);color:var(--red)" data-coll-delete="'+f.id+'">删除</button></div></div>'}).join('')+'</div>'
    :'<div>'+saved.map(function(r){return'<div class="simple-row"><span class="simple-icon"><i data-lucide="file-text"></i></span><div class="simple-content"><strong>'+h(r.name)+'</strong><p>'+h(r.course)+'·'+h(r.type)+'</p><div class="simple-meta"><span>'+h(r.size||'')+'</span><span>'+(r.downloads||0)+'次下载</span></div></div></div>'}).join('')+'</div>'}
    ${state.collShowNew?'<div class="publish-overlay" id="coll-modal-overlay"><div class="publish-modal" style="max-width:420px"><div class="publish-modal-header"><h2>📁 新建收藏夹</h2><button class="publish-close" data-coll-modal-close>✕</button></div><div class="publish-body"><div class="form-group"><label>收藏夹名称<span class="req">*</span></label><input id="coll-new-name" class="field" placeholder="如：大三上核心课" maxlength="30"></div><div class="form-group"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="coll-new-public"><span>公开此收藏夹</span></label></div></div><div class="publish-footer"><button class="btn small" data-coll-modal-close>取消</button><button class="btn primary" data-coll-create>确认创建</button></div></div></div>':''}
  </div>`;refreshIcons()
}
function renderFolderDetail(){
  var f=state.collFolders.find(x=>x.id===state.collActiveFolder);if(!f){state.collActiveFolder='';render();return}
  var items=f.items.map(id=>state.resources.find(r=>r.id===id)).filter(Boolean);
  var addModal=state.collAddOpen?'<div class="publish-overlay" id="coll-add-overlay"><div class="publish-modal"><div class="publish-modal-header"><h2>📥 添加资料到「'+h(f.name)+'」</h2><button class="publish-close" data-coll-add-close>✕</button></div><div class="publish-body"><div style="display:flex;gap:8px;margin-bottom:12px"><input class="field" id="coll-add-search" placeholder="搜索资料…" style="flex:1"><button class="button button-secondary">搜索</button></div><div style="max-height:360px;overflow-y:auto">'+state.resources.filter(function(r){return !f.items.includes(r.id)}).map(function(r){return '<div class="simple-row" style="cursor:pointer" data-coll-add-check="'+r.id+'"><input type="checkbox" style="margin-right:8px"><div class="simple-content"><strong>'+h(r.name)+'</strong><p>'+h(r.course)+'·'+h(r.type)+'</p></div></div>'}).join('')+'</div></div><div class="publish-footer"><button class="btn small" data-coll-add-close>取消</button><button class="btn primary" data-coll-add-confirm>确认添加</button></div></div></div>':'';
  $('view-root').innerHTML='<div class="detail-overlay">'+
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0 14px">'+
      '<button class="detail-back" data-coll-folder-back>← 返回收藏夹</button>'+
      '<div style="text-align:center"><span style="font-size:18px;font-weight:700">'+h(f.name)+'</span><p style="font-size:12px;color:var(--ink-3)">'+items.length+'份资料</p></div>'+
      '<button class="btn primary small" data-coll-add-open>＋ 添加资料</button></div>'+
    '<div>'+(items.length?items.map(function(r){return '<div class="simple-row res-item-row" style="cursor:move"><span class="simple-icon"><i data-lucide="file-text"></i></span><div class="simple-content"><strong>'+h(r.name)+'</strong><p>'+h(r.course)+'·'+h(r.type)+'</p><div class="simple-meta"><span>'+h(r.size||'')+'</span><span>'+(r.downloads||0)+'次下载</span></div></div><span style="color:var(--ink-3);margin-right:4px">☰</span><button class="btn small" style="border-color:var(--red);color:var(--red)" data-coll-remove="'+f.id+':'+r.id+'">移出</button></div>'}).join(''):'<div style="text-align:center;padding:32px;color:var(--ink-3)"><p style="font-size:48px;margin:0">📭</p><p>此收藏夹为空</p><button class="btn small primary" data-coll-add-open style="margin-top:8px">＋ 添加资料</button></div>')+'</div>'+
  '</div>'+addModal;refreshIcons()
}
function renderResUploadForm(){if(!state.resUploadForm)return'';var u=state.resUploadData,s=state.resUploadStep,c=state.resourceCatalog||{};var steps=[{num:1,label:'选择文件'},{num:2,label:'填写信息'},{num:3,label:'提交审核'}];
  var stepBar=steps.map(function(st){return'<span style="display:flex;align-items:center;gap:6px;font-size:'+(st.num===s?'13px':'11px')+';color:'+(st.num===s?'var(--ink)':'var(--ink-3)')+';font-weight:'+(st.num===s?'650':'400')+'"><span style="display:grid;place-items:center;width:'+(st.num===s?'26px':'22px')+';height:'+(st.num===s?'26px':'22px')+';border-radius:50%;background:'+(st.num===s?'var(--green)':st.num<s?'var(--green-soft)':'var(--surface-soft)')+';color:'+(st.num===s?'#fff':st.num<s?'var(--green)':'var(--ink-3)')+';font-size:11px;font-weight:700">'+(st.num<s?'✓':st.num)+'</span>'+st.label+'</span>'}).join('<span style="color:var(--ink-3);margin:0 2px">›</span>');
  var body='';if(s===1){body='<div class="upload-dropzone" id="upload-dropzone"><span style="font-size:40px">📁</span><p style="margin:8px 0 2px;font-weight:620">拖拽文件到此处或点击上传</p><p style="color:var(--ink-3);font-size:12px">支持 PDF / Word / PPT / 图片 / 视频</p><input type="file" id="ru-file" style="display:none" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.mp4"><button class="btn small" id="ru-file-btn" style="margin-top:8px">选择文件</button></div>';if(u.fileName)body+='<div class="res-file-preview"><div style="border:1px solid var(--line);border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:12px;margin-top:12px"><span style="font-size:24px">'+(u.fileType==='pdf'?'📕':u.fileType==='doc'?'📄':u.fileType==='ppt'?'📊':'📁')+'</span><div style="flex:1"><strong style="font-size:13px">'+h(u.fileName)+'</strong><p style="font-size:11px;color:var(--ink-3)">已检测文件类型：'+(u.fileType||'未知')+' · 可通过</p></div><span class="status success">✓ 已就绪</span></div></div>'}
  else if(s===2)body='<div class="form-group"><label>资料标题<span class="req">*</span></label><input id="ru-title" value="'+h(u.title)+'" maxlength="80" placeholder="例如：CSE101数据结构思维导图" class="field"></div><div class="form-row"><div class="form-group"><label>专业<span class="req">*</span></label><select id="ru-major" class="field"><option value="">选择专业</option>'+c.majors.map(function(m){return'<option value="'+h(m.value)+'"'+(u.major===m.value?' selected':'')+'>'+h(m.label)+'</option>'}).join('')+'</select></div><div class="form-group"><label>年级<span class="req">*</span></label><select id="ru-grade" class="field"><option value="">选择年级</option>'+['Year 1','Year 2','Year 3','Year 4'].map(function(y){return'<option value="'+y+'"'+(u.grade===y?' selected':'')+'>'+y+'</option>'}).join('')+'</select></div></div><div class="form-group"><label>关联课程<span class="req">*</span></label><select id="ru-course" class="field"><option value="">选择课程</option>'+c.courses.map(function(co){return'<option value="'+h(co.code)+'"'+(u.course===co.code?' selected':'')+'>'+h(co.code)+' '+h(co.name)+'</option>'}).join('')+'</select></div><div class="form-group"><label>资料类型</label><div class="res-tag-group" style="margin-top:4px">'+['笔记','PPT课件','课后讲义','作业','考试试卷','实验指导','复习提纲','资料'].map(function(t){return'<button type="button" class="res-type-btn'+(u.type===t?' active':'')+'" data-upload-type="'+t+'">'+t+'</button>'}).join('')+'</div></div><div class="form-group"><label>内容摘要</label><textarea id="ru-desc" class="field" maxlength="300" placeholder="简要描述资料内容和适用场景…" style="min-height:60px">'+h(u.desc)+'</textarea></div><div class="form-group"><label>关键词</label><input id="ru-keywords" class="field" value="'+h(u.keywords)+'" placeholder="用逗号分隔，如：算法、期末、二叉树" maxlength="100"></div><div class="form-group"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="ru-download" '+(u.allowDownload?'checked':'')+'><span style="font-size:13px">允许其他用户下载资料</span><span style="font-size:11px;color:var(--ink-3)">关闭后仅支持在线预览</span></label></div>';
  else body='<div class="form-group"><label style="display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:1.6"><input type="checkbox" id="ru-copyright" style="margin-top:2px"><span>我确认拥有该资料的所有权或已获得合法授权，同意在SURF Campus平台分享。如涉及第三方知识产权，本人已取得完整授权。</span></label></div><div style="padding:14px;background:var(--surface-soft);border-radius:10px;margin-top:12px;font-size:12px;color:var(--ink-2);line-height:1.6"><strong>🏅 积分说明：</strong><br>提交成功立即获得<strong>'+((state.points&&state.points.uploadReward)||5)+'积分</strong>，你上传的资料自己永远免费查看下载。10积分可解锁资料库中的一份新资料。</div>';
  return'<div class="publish-overlay" id="res-upload-overlay"><div class="publish-modal" style="max-width:560px"><div class="publish-modal-header"><h2>📤 上传资料</h2><button class="publish-close" data-res-upload-close>✕</button></div><div style="display:flex;align-items:center;gap:8px;padding:12px 24px;border-bottom:1px solid var(--line)">'+stepBar+'</div><div class="publish-body">'+body+'</div><div class="publish-footer"><button class="btn small" data-res-upload-cancel>取消</button>'+(s>1?'<button class="btn small" data-upload-prev>← 上一步</button>':'')+(s<3?'<button class="btn primary" data-upload-next>下一步</button>':'<button class="btn primary" data-res-upload-submit>提交审核</button>')+'</div></div></div>'
}
function renderResItem(r,official){var saved=state.resSaved[r.id],downed=state.resDownloaded[r.id],locked=resIsLocked(r),cost=(state.points&&state.points.unlockCost)||10;return'<div class="public-res-card'+(locked?' is-locked':'')+'" data-res-open="'+r.id+'"><span class="simple-icon" style="background:'+(r.type==='试卷'?'var(--red-soft)':r.type==='课件'?'var(--blue-soft)':r.type==='笔记'?'var(--amber-soft)':'var(--surface-soft)')+';color:'+(r.type==='试卷'?'var(--red)':r.type==='课件'?'var(--blue)':r.type==='笔记'?'var(--amber)':'var(--ink-3)')+'"><i data-lucide="'+(r.type==='试卷'?'file-check':r.type==='课件'?'presentation':r.type==='笔记'?'pen-tool':'file-text')+'"></i></span><div class="simple-content"><strong>'+h(r.name)+(locked?' <span class="res-lock-badge">🔒 需解锁</span>':'')+(official?' <span class="res-official-badge">官方认证</span>':'')+'</strong><p>'+h(r.course)+' '+(h(r.courseName)||'')+' · '+h(r.type)+'</p><div class="simple-meta"><span>'+h(r.year)+'</span><span>'+h(r.size||'')+'</span><span>'+(r.downloads||0)+'次下载</span></div></div><div class="res-item-actions"><button class="res-action-btn'+(saved?' saved':'')+'" data-res-save="'+r.id+'">'+(saved?'✓ 已收藏':'收藏')+'</button>'+(locked?'<button class="res-action-btn unlock" data-res-unlock="'+r.id+'">🔒 '+cost+'积分解锁</button>':'<button class="res-action-btn'+(downed?' downloaded':'')+'" data-res-download="'+r.id+'">'+(downed?'✓ 已下载':'下载')+'</button>')+'</div></div>'}
function renderResDetail(){
  var r=state.resources.find(x=>x.id===state.resDetail);if(!r){state.resDetail='';state.route='resources';render();return}
  if(resIsLocked(r)){renderResLockScreen(r);return}
  var saved=state.resSaved[r.id]||false,downed=state.resDownloaded[r.id]||false,rating=state.resRating[r.id]||0,comments=state.resComments[r.id]||[];
  var related=state.resources.filter(x=>x.id!==r.id&&(x.course===r.course||x.major===r.major)).slice(0,3);
  var stars='';for(var si=1;si<=5;si++)stars+='<button style="border:none;background:none;cursor:pointer;font-size:'+(si<=rating?'18px':'14px')+';opacity:'+(si<=rating?'1':'.3')+'" data-res-rate="'+r.id+'" data-rv="'+si+'">⭐</button>';
  var cmtHtml='';for(var ci=0;ci<comments.length;ci++){var c=comments[ci];cmtHtml+='<div class="comment-item"><span class="comment-avatar">'+h((c.author||'校').slice(0,1))+'</span><div class="comment-body"><div class="comment-head"><span class="comment-name">'+h(c.author)+'</span><span class="comment-time">'+h(formatTime(c.time))+'</span></div><p class="comment-text">'+h(c.content)+'</p></div></div>'}
  var relHtml='';for(var ri=0;ri<related.length;ri++){var rr=related[ri];relHtml+='<div class="simple-row" style="cursor:pointer" data-res-open="'+rr.id+'"><span class="simple-icon"><i data-lucide="file-text"></i></span><div class="simple-content"><strong>'+h(rr.name)+'</strong><p>'+h(rr.course)+' '+(h(rr.courseName)||'')+' · '+h(rr.type)+'</p></div></div>'}
  $('view-root').innerHTML='<div class="detail-overlay"><button class="detail-back" data-res-detail-back>← '+(state.profileReturn?'返回个人主页':state.qaFrom==='qa'?'返回问答列表':'返回资料库')+'</button>'+
    '<div class="detail-hero" style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px"><div style="flex:1;min-width:0"><div class="hero-badge-row"><span class="hero-badge cat">'+h(r.type)+'</span><span class="hero-badge role">'+h(r.course)+' '+(h(r.courseName)||'')+'</span>'+(r.source==='官方'?'<span class="hero-badge" style="background:var(--green-soft);color:var(--green)"> 官方认证</span>':'')+'</div><h2>'+h(r.name)+'</h2><div style="display:flex;align-items:center;gap:8px;margin:8px 0">'+stars+'<span style="font-size:12px;color:var(--ink-3);margin-left:4px">'+(rating||'评分')+'</span></div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px"><span class="inline-tag">'+h(r.course)+'</span><span class="inline-tag">'+h(r.type)+'</span><span class="inline-tag">'+(h(r.year)||'')+'</span><span class="inline-tag">'+h(r.source)+'</span><span class="inline-tag">复习</span></div></div><div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0"><button class="btn'+(saved?' primary':'')+'" data-res-save="'+r.id+'" style="'+(saved?'background:var(--green);color:#fff':'')+'">'+(saved?'✓ 已收藏':'收藏')+'</button><button class="btn'+(downed?' primary':'')+'" data-res-download="'+r.id+'" style="'+(downed?'background:var(--blue);color:#fff':'')+'">'+(downed?'✓ 已下载':'下载')+'</button><button class="btn" data-res-ai-toggle="'+r.id+'" style="'+(state.resAI.open===r.id?'background:#C2B2A4;color:#fff':'')+'"><i data-lucide="sparkles" style="width:12px;height:12px;vertical-align:middle"></i> '+(state.resAI.open===r.id?'收起提问':'问 AI')+'</button><button class="btn ai">分享</button></div></div>'+
    '<div class="detail-section"><h3>📋 资料信息</h3><div class="comp-info-grid"><div class="comp-info-item"><div class="ci-label">所属课程</div><div class="ci-value">'+h(r.course)+' '+(h(r.courseName)||'')+'</div></div><div class="comp-info-item"><div class="ci-label">专业/年级</div><div class="ci-value">'+(h(r.major)||'通用')+' · '+(h(r.year)||'')+' · '+(h(r.term)||'')+'</div></div><div class="comp-info-item"><div class="ci-label">上传者</div><div class="ci-value">'+(h(r.uploader)||'')+'</div></div><div class="comp-info-item"><div class="ci-label">上传时间</div><div class="ci-value">'+(h(r.time)||'2026-08')+'</div></div><div class="comp-info-item"><div class="ci-label">下载量</div><div class="ci-value highlight">'+(r.downloads||0)+'次</div></div><div class="comp-info-item"><div class="ci-label">文件大小</div><div class="ci-value">'+(h(r.size)||'未知')+'</div></div></div></div>'+
    '<div class="detail-section"><h3>📄 文件预览</h3><div style="background:var(--surface-soft);border-radius:12px;padding:32px;text-align:center;min-height:200px;display:grid;place-items:center"><div><span style="font-size:48px">'+(r.type==='试卷'?'📝':r.type==='课件'?'📊':r.type==='笔记'?'📒':'📄')+'</span><p style="color:var(--ink-2);margin:12px 0 4px">'+h(r.name)+'</p><p style="color:var(--ink-3);font-size:12px">'+(h(r.size)||'')+' · '+h(r.type)+' · 支持在线预览（Demo模式）</p><button class="btn small" style="margin-top:12px">👁 在线预览</button></div></div></div>'+
    '<div class="detail-section"><h3>📑 内容提要</h3><div style="font-size:13px;color:var(--ink-2);line-height:1.7">本资料为'+h(r.course)+'课程'+h(r.type)+'，由'+(h(r.uploader)||'')+'整理提供。内容涵盖课程核心知识点，适合'+(h(r.year)||'')+'同学复习参考。共'+(h(r.size)||'若干')+'，包含'+(r.type==='试卷'?'完整题目与详细答案解析':r.type==='课件'?'全学期14周PPT课件合集':r.type==='笔记'?'知识点梳理与典型例题':'课程相关参考材料')+'。</div></div>'+
    '<div class="detail-section" id="resource-ai"><h3>✨ AI 资料助手</h3>'+(state.resAI.open===r.id?('<div class="ai-inline-form"><input id="res-ai-q" placeholder="就这份资料提问，如：第3章重点是什么？" maxlength="200" autocomplete="off"><button class="btn small" data-res-ai-send="'+r.id+'"><i data-lucide="sparkles" style="width:12px;height:12px;vertical-align:middle"></i> 提问</button></div>'+(state.resAI.loading?'<div class="ai-answer is-loading"><span class="ai-answer-icon"><i data-lucide="sparkles"></i></span><div class="ai-answer-body"><strong>AI 正在阅读资料…</strong><p>基于《'+h(r.name)+'》的内容生成回答</p></div></div>':'')+(state.resAI.reply?'<div class="ai-answer"><span class="ai-answer-icon"><i data-lucide="sparkles"></i></span><div class="ai-answer-body"><strong>AI 回答</strong><p>'+h(state.resAI.reply)+'</p><small>参考当前资料元数据；重要学术问题请以教师或官方资料为准。</small></div></div>':'')):'<p style="color:var(--ink-3);font-size:13px">点击上方「问 AI」，基于这份资料的内容提问，快速定位重点、生成复习建议。</p>')+'</div>'+
    '<div class="detail-section"><h3>📚 相关推荐</h3>'+(related.length?relHtml:'<p style="color:var(--ink-3)">暂无相关推荐</p>')+'</div>'+
    '<div class="detail-section" style="margin-top:20px"><h3>💬 讨论（'+comments.length+'条）</h3>'+(comments.length?cmtHtml:'<p style="color:var(--ink-3);font-size:13px">暂无讨论，成为第一个评论的人</p>')+'<form class="comment-input-form" data-res-comment="'+r.id+'" style="margin-top:12px"><span class="comment-avatar">张</span><div class="comment-input-wrap"><input class="comment-input-field" name="comment" placeholder="写下你的问题或评论…" maxlength="500" autocomplete="off"><button type="submit" class="comment-submit-btn"><i data-lucide="send"></i></button></div></form></div>'+
  '</div>';refreshIcons()
}
/* 锁定资料的解锁页 */
function renderResLockScreen(r){
  var p=state.points||{},cost=p.unlockCost||10;
  var enough=(p.balance||0)>=cost;
  $('view-root').innerHTML='<div class="detail-overlay"><button class="detail-back" data-res-detail-back>← 返回资料库</button>'+
    '<div class="detail-hero"><div style="flex:1;min-width:0"><div class="hero-badge-row"><span class="hero-badge cat">'+h(r.type)+'</span><span class="hero-badge role">'+h(r.course)+' '+(h(r.courseName)||'')+'</span></div><h2>'+h(r.name)+'</h2><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px"><span class="inline-tag">'+h(r.course)+'</span><span class="inline-tag">'+h(r.type)+'</span><span class="inline-tag">'+(h(r.year)||'')+'</span><span class="inline-tag">'+h(r.source)+'</span></div></div></div>'+
    '<div class="detail-section"><div style="text-align:center;padding:32px 16px"><span style="font-size:56px">🔒</span><h3 style="margin:12px 0 6px">该资料需要积分解锁</h3><p style="color:var(--ink-3);font-size:13px;margin:0 0 4px">公共资料库前 '+p.freeCount+' 份免费，这份资料位于第 '+(state.resources.indexOf(r)+1)+' 份</p><p style="color:var(--ink-2);font-size:13px;margin:8px 0 16px">解锁消耗 <strong>'+cost+' 积分</strong> · 当前余额 <strong>'+(p.balance||0)+' 积分</strong></p>'+
    (enough?('<button class="btn primary" data-res-unlock="'+r.id+'">🔓 立即解锁（-'+cost+'积分）</button>'):'<p style="color:var(--red);font-size:13px;margin:0 0 12px">积分不足，上传一份资料即可获得 '+p.uploadReward+' 积分</p><button class="btn primary" data-res-upload-open>📤 上传资料赚积分</button>')+
    '</div></div></div>';refreshIcons()
}
function renderCourseCenter(tabs,hdr){
  var c=state.resourceCatalog||{},cos=c.courses||[];var cd=state.resCourseDetail;
  if(cd){var co=cos.find(x=>x.code===cd);if(co){var cres=state.resources.filter(r=>r.course===cd);var cdh='',cdl='';cdh+='<button class="detail-back" style="margin:10px 24px" data-res-back>← 返回课程中心</button>';cdh+='<div class="detail-hero"><div class="hero-badge-row"><span class="hero-badge cat">'+h(co.major)+'</span><span class="hero-badge role">'+h(co.year)+'·'+h(co.term)+'</span><span class="hero-badge mode">'+co.credits+'学分</span></div><h2>'+h(co.code)+' '+h(co.name)+'</h2><div class="hero-summary">'+h(co.desc)+'</div><div class="hero-stats"><span>👨‍🏫<strong>'+h(co.instructor)+'</strong></span></div></div>';cdh+='<div class="detail-section"><h3>📄 课程资料（'+cres.length+'项）</h3>';for(var cri=0;cri<cres.length;cri++){var cr=cres[cri];cdh+='<div class="simple-row"><span class="simple-icon"><i data-lucide="file-text"></i></span><div class="simple-content"><strong>'+h(cr.name)+'</strong><p>'+h(cr.type)+'·'+h(cr.size||'')+'·'+h(cr.source)+'</p></div><button class="button button-secondary button-small" data-res-download="'+cr.id+'">下载</button></div>'}if(!cres.length)cdh+='<p style="color:var(--ink-3)">暂无资料</p>';cdh+='</div><div class="detail-section"><h3>🔗 关联课程</h3>';var rel=cos.filter(x=>x.major===co.major&&x.code!==co.code).slice(0,3);cdh+=rel.length?rel.map(x=>'<button class="btn small" data-res-course-open="'+x.code+'">'+h(x.code)+' '+h(x.name)+'</button>').join(' '):'无关联课程';cdh+='</div>';$('view-root').innerHTML=hdr+tabs+cdh;refreshIcons();return}}
  var grp={};cos.forEach(co=>{var k=co.major||'其他';if(!grp[k])grp[k]=[];grp[k].push(co)});
  var body='';Object.entries(grp).forEach(function(e){var maj=e[0],list=e[1];body+='<div class="detail-section"><h3>'+h(maj)+'</h3>';list.forEach(function(co){var cnt=state.resources.filter(r=>r.course===co.code).length;body+='<div class="course-center-card" data-res-course-open="'+co.code+'"><span class="simple-icon"><i data-lucide="book-open"></i></span><div class="simple-content"><strong>'+h(co.code)+' '+h(co.name)+'</strong><p>'+h(co.desc)+'</p><div class="simple-meta"><span>'+h(co.year)+'·'+h(co.term)+'</span><span>'+co.credits+'学分</span><span>'+h(co.instructor)+'</span><span>'+cnt+'份资料</span></div></div></div>'});body+='</div>'});
  $('view-root').innerHTML=`${hdr}${tabs}<div class="course-center-wrapper">${body||'<p>暂无课程</p>'}</div>`;refreshIcons()
}
function renderPersonalSpace(tabs,hdr){
  if(state.collView){renderCollectionView();return}
  var saved=(state.resSaved&&Object.keys(state.resSaved).length)?Object.keys(state.resSaved).map(k=>state.resources.find(r=>r.id===k)).filter(Boolean):[];
  var down=(state.resDownloaded&&Object.keys(state.resDownloaded).length)?Object.keys(state.resDownloaded).map(k=>state.resources.find(r=>r.id===k)).filter(Boolean):[];
  var card=(title,icon,items,empty,click)=>{var s='<div class="detail-section"'+(click?' style="cursor:pointer" data-coll-open':'')+'><h3>'+icon+' '+title+'（'+items.length+'项）'+(click?' <span style="font-size:11px;color:var(--blue);font-weight:400">→</span>':'')+'</h3>';if(items.length)for(var ci=0;ci<Math.min(items.length,3);ci++){var rr=items[ci];s+='<div class="simple-row"><span class="simple-icon"><i data-lucide="file-text"></i></span><div class="simple-content"><strong>'+h(rr.name)+'</strong><p>'+h(rr.course)+'·'+h(rr.type)+'</p></div></div>'}else s+='<p style="color:var(--ink-3);font-size:13px">'+empty+'</p>';s+='</div>';return s};
  $('view-root').innerHTML=`${hdr}${tabs}<div class="personal-space-wrapper" style="padding:0 24px">
    ${card('我的收藏','<i data-lucide="star" style="width:18px;height:18px"></i>',saved,'还没有收藏资料',true)}
    ${card('我的下载','<i data-lucide="download" style="width:18px;height:18px"></i>',down,'还没有下载记录',false)}
    ${card('我的笔记','<i data-lucide="notebook" style="width:18px;height:18px"></i>',[],'功能开发中——在这里沉淀你的学习笔记',false)}
    <div class="detail-section"><h3><i data-lucide="upload" style="width:18px;height:18px"></i> 我的上传</h3><p style="color:var(--ink-3);font-size:13px">暂无上传记录。你上传的资料经审核后会在公共资料库中展示。</p></div>
  </div>`;refreshIcons()
}
function renderDirectory(){
  var dirTab=state.msgTab||0,tabs=['<i data-lucide="message-square" style="width:15px;height:15px"></i> 消息','<i data-lucide="clipboard-list" style="width:15px;height:15px"></i> 申请','<i data-lucide="calendar-days" style="width:15px;height:15px"></i> 预约','<i data-lucide="users" style="width:15px;height:15px"></i> 通讯录'];
  var ppl=state.directoryPeople;if(state.directoryKeyword)ppl=ppl.filter(function(p){return p.name.toLowerCase().indexOf(state.directoryKeyword.toLowerCase())>=0||(p['学院']||'').indexOf(state.directoryKeyword)>=0});
  var items=MOCK_MSGS;
  if(dirTab===1)items=MOCK_MSGS.filter(function(m){return m.tag==='recruit'});
  else if(dirTab===2)items=MOCK_MSGS.filter(function(m){return m.tag==='office_hour'});
  var active=state.activeMsg?MOCK_MSGS.find(function(m){return m.id===state.activeMsg}):(dirTab===3?null:items[0]);
  var sidebar='<div class="msg-tabs">'+tabs.map(function(tt,ti){return'<button class="msg-tab'+(dirTab===ti?' active':'')+'" data-dir-tab="'+ti+'">'+tt+'</button>'}).join('')+'</div>';
  if(dirTab===3){
    // Contact filter bar
    var filters=['all','teacher','student'];
    var filterLabels=['<i data-lucide="layout-grid" style="width:13px;height:13px"></i> 全部','<i data-lucide="graduation-cap" style="width:13px;height:13px"></i> 老师','<i data-lucide="user-round" style="width:13px;height:13px"></i> 同学'];
    sidebar+='<div class="contact-filter-bar">';
    for(var fi=0;fi<filters.length;fi++){
      sidebar+='<button class="contact-filter-btn'+(state.contactFilter===filters[fi]?' active':'')+'" data-contact-filter="'+filters[fi]+'">'+filterLabels[fi]+'</button>'
    }
    sidebar+='</div>';
    // Filter people by type
    var filteredPpl=ppl;
    if(state.contactFilter==='teacher')filteredPpl=ppl.filter(function(p){return p.role==='teacher'});
    else if(state.contactFilter==='student')filteredPpl=ppl.filter(function(p){return p.role==='student'});
    // Contact cards
    sidebar+='<div class="contact-card-list">';
    for(var di=0;di<filteredPpl.length;di++){
      var p=filteredPpl[di];
      var isTeacher=p.role==='teacher';
      var sel=state.directoryChatContact&&state.directoryChatContact.id===p.id?' selected':'';
      sidebar+='<div class="contact-card'+sel+'" data-msg-contact="'+p.id+'">';
      // Avatar + badge + status row
      sidebar+='<div class="contact-card-avatar-row">';
      sidebar+='<span class="contact-card-avatar">'+h((p.name||'?').slice(0,1))+'</span>';
      if(isTeacher)sidebar+='<span class="contact-verified-badge"></span>';
      var sColor=p.status==='online'?'#5cb85c':(p.status==='busy'?'#f0ad4e':'#ccc');
      sidebar+='<span class="contact-status-dot" style="background:'+sColor+'"></span></div>';
      // Name
      sidebar+='<div class="contact-card-name'+(isTeacher?' teacher-name':'')+'">'+h(p.name)+'</div>';
      // Identity label
      if(isTeacher){
        sidebar+='<div class="contact-card-identity">'+h(p.title||p['学院']||'教师')+'</div>';
      }else{
        sidebar+='<div class="contact-card-identity">'+h(p['年级'])+'级 · '+h(p.major||p['学院']||'')+'</div>';
      }
      // Quick info
      if(isTeacher){
        sidebar+='<div class="contact-card-info"><span class="contact-card-info-icon"><i data-lucide="clock" style="width:12px;height:12px"></i></span> '+h(p.availableTime||'暂无可约时段')+'</div>';
      }else{
        sidebar+='<div class="contact-card-info"><span class="contact-card-info-icon"><i data-lucide="book-open" style="width:12px;height:12px"></i></span> 共同课程：'+h(p.sharedCourses||'暂无')+'</div>';
      }
      // Action button
      if(isTeacher){
        sidebar+='<button class="contact-card-action oh-btn" data-contact-action="oh" data-contact-id="'+p.id+'"><i data-lucide="calendar" style="width:13px;height:13px"></i> 预约 Office Hour</button>';
      }else{
        sidebar+='<button class="contact-card-action coffee-btn" data-contact-action="coffee" data-contact-id="'+p.id+'"><i data-lucide="coffee" style="width:13px;height:13px"></i> 约 Coffee Chat</button>';
      }
      sidebar+='</div>'
    }
    sidebar+='</div>'
  }else{
    if(dirTab===1&&state.myApplications.length){
      sidebar+='<div class="apply-section"><div class="apply-section-head"><i data-lucide="send" style="width:12px;height:12px;vertical-align:middle"></i> 我的申请</div>';
      for(var ai=0;ai<state.myApplications.length;ai++){var ap=state.myApplications[ai];sidebar+='<div class="apply-card" data-apply-card="'+ap.id+'"><div class="apply-card-top"><strong>'+h(ap.posName)+'</strong><span class="apply-card-status"><i data-lucide="circle" style="width:8px;height:8px;fill:#C2B2A4;stroke:#C2B2A4;vertical-align:middle"></i> '+h(ap.status)+'</span></div><div class="apply-card-meta">'+h(ap.teacher)+' · '+h(ap.resumeName)+'</div><div class="apply-card-time"><i data-lucide="clock" style="width:11px;height:11px;vertical-align:middle"></i> '+formatTime(ap.time)+'</div></div>'}
      sidebar+='</div>'
    }
    sidebar+='<div class="msg-list">';
    for(var mi=0;mi<items.length;mi++){var m=items[mi],sel=m.id===(active?active.id:'')?' selected':'';sidebar+='<div class="msg-item'+sel+'" data-msg-id="'+m.id+'"><span class="msg-item-avatar">'+h(m.avatar)+'</span><div class="msg-item-info"><div class="msg-item-top"><strong>'+h(m.contact)+'</strong>'+(m.tagLabel?'<span class="msg-item-tag">'+m.tagLabel+'</span>':'')+'</div><p class="msg-item-preview">'+h(m.lastMsg).slice(0,35)+'</p></div><span class="msg-item-time">'+formatTime(m.time)+'</span></div>'}
    sidebar+='</div>'
  }
  var chat='<div class="msg-empty"><i data-lucide="messages-square" style="width:34px;height:34px;opacity:.4"></i><span>点击左侧会话开始交流</span></div>';
  if(active&&dirTab!==3){
    chat='<div class="msg-chat-header"><span class="msg-chat-avatar">'+h(active.avatar)+'</span><div><strong>'+h(active.contact)+'</strong><p>'+h(active.role)+(active.status?' · <span class="msg-status">'+active.status+'</span>':'')+'</p></div></div>';
    chat+='<div class="msg-chat-body">';
    for(var mgi=0;mgi<active.msgs.length;mgi++){var mg=active.msgs[mgi],isSelf=mg.from==='self',isSys=mg.from==='system';chat+='<div class="msg-bubble'+(isSelf?' self':'')+(isSys?' system':'')+'"><span>'+(isSys?'<i data-lucide="bell" style="width:12px;height:12px;vertical-align:middle"></i> ':'')+h(mg.text)+'</span><span class="msg-bubble-time">'+formatTime(mg.time)+'</span></div>'}
    chat+='</div>';
    chat+='<div class="msg-chat-input"><form id="msg-form"><input id="msg-input" placeholder="输入消息…"><button class="msg-send-btn" type="submit">发送</button></form><div class="msg-quick-actions"><button class="msg-quick-btn" data-dir-quick="resume"><i data-lucide="paperclip" style="width:12px;height:12px"></i> 发送简历</button><button class="msg-quick-btn" data-dir-quick="appointment"><i data-lucide="calendar-plus" style="width:12px;height:12px"></i> 创建预约</button></div></div>'
  }else if(dirTab===3&&state.directoryChatContact){
    var dc=state.directoryChatContact;
    var dmsgs=state.directoryChatMsgs[dc.id]||[];
    var isTeacher=dc.role==='teacher';
    var sColor=dc.status==='online'?'#5cb85c':(dc.status==='busy'?'#f0ad4e':'#ccc');
    var statusLabel=dc.status==='online'?'在线':(dc.status==='busy'?'忙碌':'离线');
    chat='<div class="msg-chat-header"><span class="msg-chat-avatar" style="position:relative">'+h((dc.name||'校').slice(0,1))+'</span><div><strong>'+h(dc.name)+'</strong><p><span class="contact-status-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+sColor+';margin-right:4px;vertical-align:middle"></span>'+h(isTeacher?dc.title:dc['年级']+'级 · '+dc.major)+' <span class="msg-status">'+statusLabel+'</span></p></div></div>';
    chat+='<div class="msg-chat-body">';
    if(dmsgs.length===0){
      chat+='<div class="msg-bubble system"><span>你已与 '+h(dc.name)+' 建立联系，可以开始交流了</span><span class="msg-bubble-time">'+formatTime(new Date().toISOString())+'</span></div>'
    }else{
      for(var dgi=0;dgi<dmsgs.length;dgi++){var dg=dmsgs[dgi];chat+='<div class="msg-bubble'+(dg.from==='self'?' self':'')+'"><span>'+h(dg.text)+'</span><span class="msg-bubble-time">'+formatTime(dg.time)+'</span></div>'}
    }
    chat+='</div>';
    chat+='<div class="msg-chat-input"><form id="dir-msg-form"><input id="dir-msg-input" placeholder="输入消息…"><button class="msg-send-btn" type="submit">发送</button></form><div class="msg-quick-actions"><button class="msg-quick-btn" data-dir-quick="resume"><i data-lucide="paperclip" style="width:12px;height:12px"></i> 发送简历</button><button class="msg-quick-btn" data-dir-quick="appointment"><i data-lucide="calendar-plus" style="width:12px;height:12px"></i> 创建预约</button></div></div>'
  }
  $('view-root').innerHTML='<div class="msg-page"><div class="msg-sidebar">'+sidebar+'</div><div class="msg-main">'+chat+'</div></div>';if(state.dirResumePick)renderResumePickModal();refreshIcons()
}
/* ── 通讯录 · 发送简历选择弹窗 ── */
function renderResumePickModal(){
  var rs=state.resumes||[];var sel=state.dirResumeSelected;var tgtName='';
  if(state.dirResumeTarget.indexOf('msg:')===0){var m=MOCK_MSGS.find(function(x){return x.id===state.dirResumeTarget.slice(4)});tgtName=m?m.contact:''}
  else if(state.dirResumeTarget.indexOf('contact:')===0){var c=state.directoryPeople.find(function(x){return x.id===state.dirResumeTarget.slice(8)});tgtName=c?c.name:''}
  var stMap={accepted:['已录用','#A6B8A2'],pending:['审核中','#C2B2A4'],draft:['草稿','#9A9693']};
  var cards=rs.map(function(r){
    var isSel=r.id===sel,isDef=r.id===state.resumeDefaultId;var st=stMap[r.status]||stMap.draft;
    return'<div class="drp-card'+(isSel?' is-selected':'')+'" data-dir-resume-select="'+r.id+'">'
      +'<span class="drp-check"><i data-lucide="check-circle-2" style="width:18px;height:18px"></i></span>'
      +'<span class="drp-icon"><i data-lucide="file-badge" style="width:20px;height:20px"></i></span>'
      +'<div class="drp-info"><strong>'+h(r.name)+(isDef?' <em class="drp-default">默认</em>':'')+'</strong><p>'+h(r.target)+'</p>'
      +'<div class="drp-meta"><span class="drp-status" style="color:'+st[1]+'">● '+st[0]+'</span><span><i data-lucide="clock" style="width:11px;height:11px;vertical-align:middle"></i> '+h(r.updated)+'</span></div></div></div>'
  }).join('');
  var html='<div class="publish-overlay" id="drp-overlay"><div class="publish-modal drp-modal"><div class="publish-modal-header"><h2><i data-lucide="send" style="width:17px;height:17px;vertical-align:middle"></i> 发送简历</h2><button class="publish-close" data-dir-resume-close>✕</button></div><div class="publish-body">'
    +'<p class="drp-hint">将选择一份简历发送给 <strong>'+h(tgtName||'对方')+'</strong>，发送后可在聊天中查看。</p>'
    +(rs.length?'<div class="drp-list">'+cards+'</div>':'<div class="drp-empty"><i data-lucide="file-x" style="width:30px;height:30px;opacity:.4"></i><span>还没有简历，先去上传一份吧</span></div>')
    +'<div class="drp-actions"><button class="drp-manage-btn" data-dir-resume-manage><i data-lucide="settings-2" style="width:13px;height:13px;vertical-align:middle"></i> 管理简历</button><div style="flex:1"></div><button class="recruit-cancel-btn" data-dir-resume-close>取消</button><button class="recruit-submit-btn" data-dir-resume-send'+(rs.length?'':' disabled')+'><i data-lucide="send" style="width:14px;height:14px"></i> 发送</button></div>'
    +'</div></div></div>';
  var old=document.getElementById('drp-overlay');if(old)old.remove();
  document.body.insertAdjacentHTML('beforeend',html);refreshIcons()
}
function closeResumePick(){state.dirResumePick=false;state.dirResumeTarget='';state.dirResumeSelected='';var el=document.getElementById('drp-overlay');if(el)el.remove();render()}
function sendResumeToChat(){
  var r=state.resumes.find(function(x){return x.id===state.dirResumeSelected});
  if(!r)return toast('请先选择一份简历','error');
  var now=new Date().toISOString();var txt='已发送简历「'+r.name+'」';
  if(state.dirResumeTarget.indexOf('msg:')===0){var m=MOCK_MSGS.find(function(x){return x.id===state.dirResumeTarget.slice(4)});if(m){m.msgs.push({from:'self',text:txt,time:now});m.lastMsg=txt;m.time=now}}
  else if(state.dirResumeTarget.indexOf('contact:')===0){var cid=state.dirResumeTarget.slice(8);if(!state.directoryChatMsgs[cid])state.directoryChatMsgs[cid]=[];state.directoryChatMsgs[cid].push({from:'self',text:txt,time:now})}
  state.dirResumePick=false;state.dirResumeTarget='';state.dirResumeSelected='';render();toast('简历「'+r.name+'」已发送')
}
/* ═══ RIGHT RAIL · 实时热点 + 今日日历速览 ═══ */
function hotTimeAgo(ts){
  var diff=Date.now()-ts;
  if(diff<60*1000)return'刚刚';
  var min=Math.floor(diff/60000);
  if(min<60)return min+'分钟前';
  var hr=Math.floor(min/60);
  if(hr<24)return hr+'小时前';
  var day=Math.floor(hr/24);
  if(day===1)return'昨天';
  if(day<7)return day+'天前';
  var dd=new Date(ts);
  return String(dd.getMonth()+1)+'月'+String(dd.getDate())+'日'
}
function hotFeedKey(){
  var p=state.posts,pc=0,pt='';
  for(var i=0;i<p.length;i++){pc+=p.likes+(p.comments_count||0);if(p[i].time>pt)pt=p[i].time}
  var qn=0;state.questions.forEach(function(q){if(q.tag==='精华'||q.status==='solved')qn++});
  var rn=0;MOCK_TEACHERS.forEach(function(t){if(t.projects)t.projects.forEach(function(pr){if(pr.positions)pr.positions.forEach(function(pos){if(pos.status==='open')rn++})})});
  return DEMO_EVENTS.length+':'+pc+':'+pt+':'+qn+':'+rn+':'+MOCK_NOTIFICATIONS.length
}
function buildHotFeed(){
  var items=[];
  var td=new Date(),todayStr=td.getFullYear()+'-'+String(td.getMonth()+1).padStart(2,'0')+'-'+String(td.getDate()).padStart(2,'0');
  // 1. 活动：今天起 10 天内按开始时间近→远，取前 4
  var evts=DEMO_EVENTS.filter(function(e){var m=e.time.match(/^(\d{4}-\d{2}-\d{2})/);return m&&m[1]>=todayStr}).sort(function(a,b){return a.time<b.time?-1:1}).slice(0,4);
  var evtAgo=[40,150,420,1300];
  evts.forEach(function(e,i){items.push({kind:'evt',type:'活动',title:e.title,id:e.id,agoTs:Date.now()-evtAgo[i%evtAgo.length]*60000})});
  // 2. 招募：open 岗位按截止日期近→远，取前 3
  var recs=[];
  MOCK_TEACHERS.forEach(function(t){if(t.projects)t.projects.forEach(function(pr){if(pr.positions)pr.positions.forEach(function(pos){if(pos.status==='open')recs.push({pos:pos,t:t})})})});
  recs.sort(function(a,b){return (a.pos.deadline||'9999')<(b.pos.deadline||'9999')?-1:1});
  var recAgo=[90,240,900];
  recs.slice(0,3).forEach(function(r,i){items.push({kind:'recruit',type:'招募',title:r.pos.name+' · '+r.t.name,id:r.pos.id,agoTs:Date.now()-recAgo[i%recAgo.length]*60000})});
  // 3. 热议：点赞≥12 按热度降序，取前 3
  var hots=state.posts.filter(function(p){return(p.likes||0)>=12}).sort(function(a,b){return(b.likes||0)-(a.likes||0)}).slice(0,3);
  var hotAgo=[180,300,1600];
  hots.forEach(function(p,i){items.push({kind:'post',type:'热议',title:p.title,id:p.id,agoTs:Date.now()-hotAgo[i%hotAgo.length]*60000})});
  // 4. 精选：tag 精华 或 solved 且有 accepted 答案，取前 2
  var qas=state.questions.filter(function(q){return q.tag==='精华'||(q.status==='solved'&&q.answers_detail&&q.answers_detail.some(function(a){return a.accepted}))}).slice(0,2);
  var qaAgo=[320,1100];
  qas.forEach(function(q,i){items.push({kind:'qa',type:'精选',title:q.question,id:q.id,agoTs:Date.now()-qaAgo[i%qaAgo.length]*60000})});
  // 5. 公告：urgent + system，取前 1
  var notifs=MOCK_NOTIFICATIONS.filter(function(n){return n.type==='system'&&n.level==='urgent'}).slice(0,1);
  var notifAgo=[420];
  notifs.forEach(function(n,i){items.push({kind:'notif',type:'公告',title:n.content.replace(/^【[^】]*】/,''),id:n.id,agoTs:Date.now()-notifAgo[i%notifAgo.length]*60000})});
  // 排序：时间降序为主，类型权重（活动>招募>热议>精选>公告）作 tie-breaker
  var w={'活动':0,'招募':1,'热议':2,'精选':3,'公告':4};
  items.sort(function(a,b){if(b.agoTs!==a.agoTs)return b.agoTs-a.agoTs;return w[a.type]-w[b.type]});
  return items
}
function hotSkeletonHtml(){
  var blocks='';for(var i=0;i<5;i++)blocks+='<div class="hot-skeleton-block"></div>';
  return'<div class="hot-module"><div class="hot-head"><span class="hot-head-title"><i data-lucide="sparkles" style="width:16px;height:16px"></i>实时热点</span><span class="hot-head-more"><i data-lucide="chevron-right" style="width:14px;height:14px"></i></span></div><div class="hot-filter"><span class="hot-filter-btn active">全部</span><span class="hot-filter-btn">活动</span><span class="hot-filter-btn">招募</span></div><div class="hot-skeleton">'+blocks+'</div></div><div class="cal-module"><div class="cal-head"><i data-lucide="calendar-days" style="width:16px;height:16px"></i><span>…</span></div><div class="cal-skeleton-block"></div></div><div class="poster-module"><div class="poster-head"><span class="poster-head-title"><i data-lucide="images" style="width:15px;height:15px"></i>全站精选</span></div><div class="poster-skeleton"></div></div>'
}
function calModuleHtml(){
  var td=new Date(),y=td.getFullYear(),m=td.getMonth()+1,d=td.getDate();
  var todayStr=y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
  var wd=['周日','周一','周二','周三','周四','周五','周六'][td.getDay()];
  var evts=DEMO_EVENTS.filter(function(e){return e.time.startsWith(todayStr)}).slice(0,2);
  var body;
  if(evts.length){
    body=evts.map(function(e){
      var t=(e.time.match(/\d{2}:\d{2}/)||[''])[0];
      return'<div class="cal-evt" data-hot-open="evt" data-hot-id="'+e.id+'"><span class="cal-evt-time">'+t+'</span><span class="cal-evt-title">'+h(e.title)+'</span></div>'
    }).join('')
  }else{
    body='<div class="cal-empty" data-hot-cal-more>今日暂无安排，去逛逛活动广场吧 →</div>'
  }
  return'<div class="cal-module"><div class="cal-head"><i data-lucide="calendar-days" style="width:16px;height:16px"></i><span>'+m+'月'+d+'日 '+wd+'</span></div><div class="cal-divider"></div><div class="cal-evts">'+body+'</div><button class="cal-more" data-hot-cal-more>查看完整日程 <i data-lucide="chevron-right" style="width:13px;height:13px"></i></button></div>'
}
function hotModuleHtml(items){
  var tab=state.hotTab;
  var list=tab==='all'?items:items.filter(function(x){return x.type===tab});
  var track;
  if(!list.length){
    track='<div class="hot-empty">暂无相关内容</div>'
  }else{
    var tcls={evt:'t-evt',recruit:'t-recruit',post:'t-hot',qa:'t-qa',notif:'t-notif'};
    var rows=list.map(function(x){
      return'<div class="hot-item" data-hot-open="'+x.kind+'" data-hot-id="'+x.id+'">'+
        '<div class="hot-item-top"><span class="hot-type '+tcls[x.kind]+'">'+h(x.type)+'</span><span class="hot-title">'+h(x.title)+'</span></div>'+
        '<span class="hot-item-time">'+hotTimeAgo(x.agoTs)+'</span></div>'
    });
    if(list.length>=6){for(var i=0;i<5;i++)rows.push(rows[i])}
    track='<div class="hot-list-track" id="hot-list-track">'+rows.join('')+'</div>'
  }
  var html='<div class="hot-module">'+
    '<div class="hot-head"><span class="hot-head-title"><i data-lucide="sparkles" style="width:16px;height:16px"></i>实时热点</span>'+
    '<span class="hot-head-more" data-hot-more title="更多活动"><i data-lucide="chevron-right" style="width:14px;height:14px"></i></span></div>'+
    '<div class="hot-filter">'+['all','活动','招募'].map(function(t){return'<button class="hot-filter-btn'+(tab===t?' active':'')+'" data-hot-tab="'+t+'">'+(t==='all'?'全部':t)+'</button>'}).join('')+'</div>'+
    '<div class="hot-list-container" id="hot-list-container">'+track+'</div></div>'+
    calModuleHtml();
  return html
}
var hotTimer=null;
function hotStopScroll(){if(hotTimer){clearInterval(hotTimer);hotTimer=null}}
function hotStartScroll(){
  hotStopScroll();
  var c=document.getElementById('hot-list-container');
  var t=document.getElementById('hot-list-track');
  if(!c||!t)return;
  var n=t.children.length-5;
  if(n<5){t.style.transform='translateY(0)';return}
  state.hotTick=0;t.style.transform='translateY(0)';
  c.addEventListener('mouseenter',function(){state.hotPaused=true});
  c.addEventListener('mouseleave',function(){state.hotPaused=false});
  hotTimer=setInterval(function(){
    if(state.hotPaused)return;
    state.hotTick++;
    if(state.hotTick>n){state.hotTick=0;t.style.transition='none';t.style.transform='translateY(0)';void t.offsetHeight;t.style.transition='';return}
    t.style.transform='translateY('+(-56*state.hotTick)+'px)'
  },4000)
}
/* ═══ POSTER CAROUSEL (right rail bottom) ═══ */
function posterImgForEvt(e){
  // placehold.co 莫兰迪色调真实图，200x148
  var bg='D4C5A9',fg='3D3A38';
  var txt=(e.title||'').slice(0,10);
  return'https://placehold.co/200x148/'+bg+'/'+fg+'?text='+encodeURIComponent(txt)+'&font=raleway'
}
function buildPosterPool(){
  var pool=[];
  var td=new Date(),y=td.getFullYear(),tm=String(td.getMonth()+1).padStart(2,'0'),dd=String(td.getDate()).padStart(2,'0');
  var todayStr=y+'-'+tm+'-'+dd;
  var today=new Date(y,td.getMonth(),td.getDate());
  // 1. 活动预热：距开始 ≤3 天（含今天），按报名数降序
  var evts=DEMO_EVENTS.filter(function(e){var mt=e.time.match(/^(\d{4})-(\d{2})-(\d{2})/);if(!mt)return false;var ed=new Date(+mt[1],+mt[2]-1,+mt[3]);var diff=(ed-today)/86400000;return diff>=0&&diff<=3}).sort(function(a,b){return(b.registered||0)-(a.registered||0)});
  evts.forEach(function(e){
    var dm=(e.time.match(/-(\d{2})\s/)||['',''])[1];
    pool.push({kind:'evt',label:'活动预热',labelColor:'#D4C5A9',img:posterImgForEvt(e),title:e.title,sub:tm+'月'+dm+'日 · 报名 '+e.registered+'/'+e.capacity+'人',openKind:'evt',openId:e.id,icon:'calendar-days'})
  });
  // 2. 热门话题：likes 降序，排除匿名帖，前 2
  var posts=state.posts.filter(function(p){return!p.anonymous}).sort(function(a,b){return(b.likes||0)-(a.likes||0)}).slice(0,2);
  posts.forEach(function(p){
    var img=(p.media&&p.media[0]&&p.media[0].url)||'';
    pool.push({kind:'post',label:'热门话题',labelColor:'#9A8FA8',img:img,title:p.title,sub:(p.likes||0)+' 点赞 · '+(p.comments_count||0)+' 评论',openKind:'post',openId:p.id,icon:'message-square'})
  });
  // 3. 热门资料：downloads 降序前 2
  var res=state.resources.slice().sort(function(a,b){return(b.downloads||0)-(a.downloads||0)}).slice(0,2);
  res.forEach(function(r){pool.push({kind:'res',label:'热门资料',labelColor:'#8EA5B6',img:'',title:r.name,sub:'下载 '+r.downloads+' 次 · '+r.type,openKind:'res',openId:r.id,icon:'library'})});
  // 4. 精华问答：tag 精华 或 solved+accepted 前 2
  var qas=state.questions.filter(function(q){return q.tag==='精华'||(q.status==='solved'&&q.answers_detail&&q.answers_detail.some(function(a){return a.accepted}))}).slice(0,2);
  qas.forEach(function(q){pool.push({kind:'qa',label:'精华问答',labelColor:'#A6B8A2',img:'',title:q.question,sub:(q.votes||0)+' 赞 · '+(q.answers_count||0)+' 回答',openKind:'qa',openId:q.id,icon:'graduation-cap'})});
  // 5. RA 招募：open 岗位按截止近→远前 2
  var recs=[];
  MOCK_TEACHERS.forEach(function(t){if(t.projects)t.projects.forEach(function(pr){if(pr.positions)pr.positions.forEach(function(pos){if(pos.status==='open')recs.push({pos:pos,t:t})})})});
  recs.sort(function(a,b){return(a.pos.deadline||'')<(b.pos.deadline||'')?-1:1});
  recs.slice(0,2).forEach(function(r){pool.push({kind:'recruit',label:'招募机会',labelColor:'#D4B5A7',img:'',title:r.pos.name,sub:'截止 '+r.pos.deadline+' · 剩 '+(r.pos.slots||1)+' 名',openKind:'recruit',openId:r.pos.id,icon:'hand-helping'})});
  // 6. 系统精选：urgent+system 前 1
  var notifs=MOCK_NOTIFICATIONS.filter(function(n){return n.type==='system'&&n.level==='urgent'}).slice(0,1);
  notifs.forEach(function(n){pool.push({kind:'notif',label:'系统精选',labelColor:'#C9BAA5',img:'',title:n.content.replace(/^【[^】]*】/,''),sub:'系统通知',openKind:'notif',openId:n.id,icon:'megaphone'})});
  // 兜底：不足 3 张补引导海报
  if(pool.length<3){
    pool.push({kind:'guide',label:'探索发现',labelColor:'#8EA5B6',img:'',title:'探索课程资料库',sub:'期末复习、历年真题、学霸笔记',openKind:'guide-res',openId:'',icon:'library'});
    pool.push({kind:'guide',label:'探索发现',labelColor:'#9A8FA8',img:'',title:'参与校园话题讨论',sub:'学术、生活、组队全覆盖',openKind:'guide-feed',openId:'',icon:'messages-square'});
    pool.push({kind:'guide',label:'探索发现',labelColor:'#D4C5A9',img:'',title:'查看近期校园活动',sub:'讲座、社团、工作坊',openKind:'guide-evt',openId:'',icon:'calendar-days'});
  }
  // 随机洗牌，取 5-8 张
  for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=pool[i];pool[i]=pool[j];pool[j]=tmp}
  var show=5+Math.floor(Math.random()*4);
  if(show>pool.length)show=pool.length;
  if(show<3)show=pool.length<3?pool.length:3;
  return pool.slice(0,show)
}
function posterCardHtml(p){
  var fbCls='poster-fb-'+p.kind;
  var imgHtml;
  if(p.img){
    imgHtml='<div class="poster-img-fallback '+fbCls+'"><i data-lucide="'+p.icon+'" style="width:26px;height:26px"></i></div><img class="poster-img" src="'+h(p.img)+'" alt="'+h(p.title)+'" onerror="this.style.display=\'none\'" loading="lazy">'
  }else{
    imgHtml='<div class="poster-img-fallback '+fbCls+'"><i data-lucide="'+p.icon+'" style="width:26px;height:26px"></i></div>'
  }
  return'<div class="poster-card" data-poster-open="'+p.openKind+'" data-poster-id="'+h(p.openId)+'"><div class="poster-img-wrap">'+imgHtml+'</div><div class="poster-text"><div class="poster-label" style="color:'+p.labelColor+'">── '+h(p.label)+' ──</div><div class="poster-title">'+h(p.title)+'</div><div class="poster-sub">'+h(p.sub)+'</div></div></div>'
}
function posterModuleHtml(){
  var pool=state.posterPool;
  if(!pool||!pool.length)return'';
  var cards=pool.map(posterCardHtml);
  cards.push(cards[0]); // 克隆首张实现无缝循环
  var dots=pool.map(function(p,i){return'<span class="poster-dot'+(i===state.posterIdx?' active':'')+'" data-poster-dot="'+i+'"></span>'}).join('');
  return'<div class="poster-module"><div class="poster-head"><span class="poster-head-title"><i data-lucide="images" style="width:15px;height:15px"></i>全站精选</span></div><div class="poster-viewport" id="poster-viewport"><div class="poster-track" id="poster-track">'+cards.join('')+'</div><button class="poster-arrow poster-arrow-l" data-poster-arrow="prev" aria-label="上一张"><i data-lucide="chevron-left" style="width:14px;height:14px"></i></button><button class="poster-arrow poster-arrow-r" data-poster-arrow="next" aria-label="下一张"><i data-lucide="chevron-right" style="width:14px;height:14px"></i></button><div class="poster-dots">'+dots+'</div></div></div>'
}
var posterTimer=null,posterResumeTimer=null,posterLock=false,posterTouchX=0;
function posterStopAuto(){if(posterTimer){clearInterval(posterTimer);posterTimer=null}if(posterResumeTimer){clearTimeout(posterResumeTimer);posterResumeTimer=null}}
function posterStartAuto(){
  posterStopAuto();
  if(!state.posterPool||state.posterPool.length<2)return;
  posterTimer=setInterval(function(){if(state.posterPaused)return;posterNext()},5000)
}
function posterResumeAuto(){if(posterResumeTimer)clearTimeout(posterResumeTimer);posterResumeTimer=setTimeout(posterStartAuto,2000)}
function posterGoTo(i){
  var pool=state.posterPool;if(!pool||!pool.length)return;
  var n=pool.length,t=document.getElementById('poster-track');if(!t)return;
  if(i>n)i=i%n; if(i<0)i=n+i;
  state.posterIdx=i;
  t.style.transform='translateX('+(-i*100)+'%)';
  var dots=document.querySelectorAll('.poster-dot');
  dots.forEach(function(d,di){d.classList.toggle('active',di===(i%n))});
  var card=t.children[i];if(card){var label=card.querySelector('.poster-label');if(label){label.style.transition='none';label.style.transform='translateX(-6px)';void label.offsetWidth;label.style.transition='transform .3s ease-out';label.style.transform='translateX(0)'}}
  // 到达克隆位(n)，过渡后无过渡回卷到 0
  if(i===n&&!posterLock){
    posterLock=true;
    setTimeout(function(){t.style.transition='none';t.style.transform='translateX(0)';void t.offsetWidth;t.style.transition='';state.posterIdx=0;posterLock=false},620)
  }
}
function posterNext(){if(posterLock)return;posterGoTo(state.posterIdx+1)}
function posterPrev(){
  if(posterLock)return;
  var pool=state.posterPool;if(!pool||!pool.length)return;var n=pool.length,t=document.getElementById('poster-track');if(!t)return;
  if(state.posterIdx===0){t.style.transition='none';t.style.transform='translateX('+(-n*100)+'%)';void t.offsetWidth;t.style.transition='';posterGoTo(n-1)}
  else posterGoTo(state.posterIdx-1)
}
function posterInit(){
  var vp=document.getElementById('poster-viewport');if(!vp)return;
  // 悬停暂停，移出 2s 恢复
  vp.addEventListener('mouseenter',function(){state.posterPaused=true;posterStopAuto()});
  vp.addEventListener('mouseleave',function(){state.posterPaused=false;posterResumeAuto()});
  // 触摸滑动
  vp.addEventListener('touchstart',function(e){posterTouchX=e.touches[0].clientX},{passive:true});
  vp.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-posterTouchX;if(Math.abs(dx)>30){if(dx<0)posterNext();else posterPrev()}},{passive:true});
  // 初始位移恢复
  posterGoTo(state.posterIdx)
}
function renderHotRail(){
  var rail=$('hot-rail');if(!rail)return;
  if(!state._hotRendered){
    state._hotRendered=true;
    rail.innerHTML=hotSkeletonHtml();
    setTimeout(renderHotRail,90);
    return
  }
  var items=buildHotFeed();
  state._lastHotKey=hotFeedKey();
  if(!state.posterPool||!state.posterPool.length)state.posterPool=buildPosterPool();
  rail.innerHTML=hotModuleHtml(items)+posterModuleHtml();
  refreshIcons();
  hotStartScroll();
  posterInit();
  posterStartAuto()
}
function renderTreehole(){if(state.danmuWall){renderDanmuWall();return}if(state.treeholeComposing){renderTreeholeCompose();return}if(state.treeholeDetail){var td=state.treeholes.find(function(x){return x.id===state.treeholeDetail});if(!td){state.treeholeDetail='';render();return}$('view-root').innerHTML='<div class="detail-overlay"><button class="detail-back" data-th-back>← 返回树洞</button>'+renderPost(td,true)+'</div>';refreshIcons();return}var c=renderComposerTreehole();var l=state.treeholes.length?'<div class="th-feed">'+state.treeholes.map(function(t){return renderPost(t,false)}).join('')+'</div>':stateBlock('树洞还是空的','匿名投稿后出现在这里','lock-keyhole');$('view-root').innerHTML=pageHeader('Anonymous space','匿名树洞','树洞不混入实名公共话题流。')+danmuEntry()+c+l;refreshIcons()}
function danmuEntry(){var n=state.danmuList.length||DANMU_PRESET.length;return'<button class="danmu-entry" data-danmu-open><span class="danmu-entry-icon"><i data-lucide="message-circle"></i></span><span class="danmu-entry-text"><strong>树洞弹幕墙</strong><small>此刻 '+n+' 条心声正在飘过 · 匿名即时上幕，无需审核</small></span><i data-lucide="chevron-right"></i></button>'}
function renderDanmuWall(){$('view-root').innerHTML='<div class="danmu-page">'+
  '<div class="danmu-topbar">'+
    '<button class="danmu-back" data-danmu-back><i data-lucide="arrow-left"></i> 返回树洞</button>'+
    '<span class="danmu-title">树洞弹幕墙</span>'+
  '</div>'+
  '<div class="danmu-stage" id="danmu-stage"></div>'+
  '<div class="danmu-inputbar">'+
    '<form class="danmu-form" id="danmu-form">'+
      '<input id="danmu-input" maxlength="50" placeholder="输入你想说的话…（≤50字）" autocomplete="off" value="'+h(state.danmuText||'')+'">'+
      '<button type="submit" class="danmu-send" id="danmu-send"><i data-lucide="send"></i> 发送</button>'+
    '</form>'+
    '<div class="danmu-anon-hint"><i data-lucide="ghost"></i> 匿名发布（默认开启，不可关闭）</div>'+
  '</div></div>';
  refreshIcons();
  if(!state.danmuSpawned){state.danmuSpawned=true;spawnInitialDanmu()}}
function renderTreeholeCompose(){
  var cc=state.treeholeText||'';
  $('view-root').innerHTML='<div class="detail-overlay th-compose-page">'+
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0 12px">'+
      '<button class="detail-back" data-close-treehole-compose>← 取消</button>'+
      '<span style="font-size:16px;font-weight:680;color:var(--th-accent,#b8a88a)">匿名树洞</span>'+
      '<button class="button" id="submit-treehole-compose"'+(cc.trim()?'':' disabled')+'>投进树洞</button></div>'+
    '<div style="display:flex;gap:12px;padding:14px 0"><span class="avatar" style="width:40px;height:40px;font-size:14px;background:var(--th-muted,#c9b99a);color:#fff">匿</span><div style="flex:1"><div style="font-size:13px;font-weight:650">匿名同学</div><div style="font-size:11px;color:var(--ink-3)">树洞·身份保密</div></div></div>'+
    '<textarea class="field" id="th-compose-text" placeholder="匿名写下一个只属于树洞的校园处境…" style="min-height:200px;resize:vertical;border:none;border-radius:0;padding:10px 0;font-size:15px;line-height:1.7">'+h(cc)+'</textarea>'+
    '<div class="compose-media-section">'+
      '<div class="compose-media-previews" id="th-compose-media-previews">'+((state.composeMedia||[]).map((m,i)=>'<div class="compose-media-thumb" data-media-idx="'+i+'"><div class="compose-media-img" style="background:'+(m.type==='video'?'#2a2a2a':'#e8e4df')+';display:grid;place-items:center;color:#fff;font-size:24px">'+(m.type==='video'?'▶':'🖼')+'</div><span class="compose-media-clear" data-th-media-remove="'+i+'">✕</span></div>').join(''))+'</div>'+
      '<div class="compose-media-zone" id="th-media-zone">'+
        '<div class="compose-media-zone-inner">'+
          '<span class="compose-media-plus">＋</span>'+
          '<span class="compose-media-text">添加照片或视频</span>'+
          '<span class="compose-media-hint">JPG/PNG/GIF/WebP · 最多9个</span></div>'+
        '<input type="file" id="th-media-input" accept="image/*,video/*" multiple style="display:none"></div></div>'+
    '<div style="margin-top:8px;padding:8px 0;font-size:12px;color:var(--ink-3);border-top:1px solid var(--th-line,#ede6db)"><span style="color:var(--th-muted,#c9b99a)">●</span> 匿名树洞·前台匿名，违规可追溯</div>'+
  '</div>';refreshIcons()}
/* ═══ 树洞弹幕墙 ═══ */
function spawnInitialDanmu(){var texts=DANMU_PRESET.slice();for(var i=texts.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=texts[i];texts[i]=texts[j];texts[j]=t}for(var k=0;k<texts.length;k++){spawnDanmu(texts[k],{initial:true})}}
function spawnDanmu(text,opts){
  var stage=document.getElementById('danmu-stage');if(!stage)return;
  var items=stage.querySelectorAll('.danmu-item');if(items.length>=24)items[0].remove();
  var el=document.createElement('span');el.className='danmu-item';el.setAttribute('data-text',text);el.title='某位同学 · 匿名弹幕 · 点击戳一下';
  var cnt=state.danmuPokes[text]||0;
  el.innerHTML='<span class="danmu-inner">'+h(text)+'</span>'+(cnt>0?'<span class="danmu-pokes">◈ '+cnt+'</span>':'');
  if(cnt>10)el.classList.add('hot');
  var top=(opts&&opts.top!=null)?opts.top:(10+Math.random()*70);el.style.top=top+'%';
  el.style.visibility='hidden';stage.appendChild(el);
  var w=el.offsetWidth||120;var sw=stage.offsetWidth||800;var dist=sw+w;var dur=dist/80;
  el.style.setProperty('--dw-distance',(-dist)+'px');
  el.style.setProperty('--dw-duration',dur+'s');
  var dl=(opts&&opts.initial)?(-Math.random()*dur*0.9)+'s':((opts&&opts.send)?(-((w+60)/80))+'s':'0s');
  el.style.animationDelay=dl;
  void el.offsetWidth;
  el.style.animationName='danmu-fly';
  el.style.visibility='';
  el.addEventListener('animationend',function(){if(el.parentNode)el.remove()});
}
function sendDanmu(){
  var inp=document.getElementById('danmu-input');var txt=inp?inp.value.trim():'';
  if(!txt){return}
  if(DANMU_BANNED.some(function(w){return txt.toLowerCase().indexOf(w.toLowerCase())>=0})){toast('内容包含不合适词汇，请修改','error');return}
  spawnDanmu(txt,{send:true});
  state.danmuList.push(txt);
  if(inp){inp.value='';inp.focus()}
}
function renderTeachers(){
  if(state.teacherDetail){renderTeacherDetail();return}
  var tf=state.teacherFilter||{},items=[];
  // Use XJTLU faculty-course mapping for dept list
  var depts=Object.keys(FACULTY_COURSES_MAP);
  // Build courses based on selected faculty
  var courses=[],cseen={};
  var coursePool=[];if(tf.dept&&tf.dept!=='all'&&FACULTY_COURSES_MAP[tf.dept]){coursePool=FACULTY_COURSES_MAP[tf.dept].courses}else{Object.values(FACULTY_COURSES_MAP).forEach(function(fm){fm.courses.forEach(function(c){if(coursePool.indexOf(c)<0)coursePool.push(c)})})}
  // Also add courses from MOCK_TEACHERS that might not be in mapping
  MOCK_TEACHERS.forEach(function(ti){if(coursePool.indexOf(ti.courseCode)<0)coursePool.push(ti.courseCode)});
  for(var di=0;di<MOCK_TEACHERS.length;di++){var cc=MOCK_TEACHERS[di].courseCode+':'+MOCK_TEACHERS[di].course;if(!cseen[cc]&&coursePool.indexOf(MOCK_TEACHERS[di].courseCode)>=0){cseen[cc]=true;courses.push({code:MOCK_TEACHERS[di].courseCode,name:MOCK_TEACHERS[di].course})}}
  for(var fi=0;fi<MOCK_TEACHERS.length;fi++){var t=MOCK_TEACHERS[fi];if(tf.dept&&tf.dept!=='all'&&t.faculty!==tf.dept)continue;if(tf.course&&tf.course!=='all'&&t.courseCode!==tf.course)continue;if(tf.title&&tf.title!=='all'&&t.title!==tf.title)continue;if(tf.search&&t.name.toLowerCase().indexOf(tf.search.toLowerCase())<0)continue;items.push(t)}
  var titles=['教授','副教授','讲师','助教'],statusMap={online:'green',busy:'amber',offline:'ink-3'};
  var html='<div class="teachers-page">';
  html+=pageHeader('Faculty Consultation','教师咨询','预约办公室时间、发起私聊，获取课程学习与科研指导。');
  html+='<div class="page-toolbar"><select class="field" id="teacher-dept" style="width:auto"><option value="all">全部学院</option>'+depts.map(function(d){return'<option value="'+d+'"'+(tf.dept===d?' selected':'')+'>'+d+'</option>'}).join('')+'</select><select class="field" id="teacher-title" style="width:auto"><option value="all">全部职称</option>'+titles.map(function(t){return'<option value="'+t+'"'+(tf.title===t?' selected':'')+'>'+t+'</option>'}).join('')+'</select><select class="field" id="teacher-course" style="width:auto"><option value="all">全部课程</option>'+courses.map(function(co){return'<option value="'+co.code+'"'+(tf.course===co.code?' selected':'')+'>'+co.code+' '+co.name+'</option>'}).join('')+'</select><input class="field" id="teacher-search" value="'+h(tf.search||'')+'" placeholder="搜索姓名…" style="width:140px"><span style="margin-left:auto;color:var(--ink-3);font-size:12px;white-space:nowrap">共 '+items.length+' 位老师/助教可预约</span></div>';
  html+='<div class="teachers-grid">';
  for(var ti=0;ti<items.length;ti++){
    var t=items[ti],st=t.status||'offline';
    html+='<article class="teacher-card" data-teacher-id="'+t.id+'" style="border-top:3px solid '+t.color+'">';
    html+='<div class="teacher-card-top"><div class="teacher-avatar-wrap" style="border-color:#C2B2A4"><span class="teacher-avatar" style="background:'+t.color+'">'+h(t.name.slice(0,1))+'</span><span class="teacher-status-dot '+st+'"></span></div></div>';
    html+='<h3 class="teacher-name">'+h(t.name)+'</h3>';
    html+='<p class="teacher-title-line">'+h(t.faculty)+' · '+h(t.titleLabel)+'</p>';
    html+='<p class="teacher-course-line"><i data-lucide="book-open" style="width:13px;height:13px;vertical-align:middle"></i> '+h(t.course)+' ('+h(t.courseCode)+')</p>';
    if(t.tags.length)html+='<div class="teacher-tags">'+t.tags.map(function(tg){return'<span class="teacher-tag">'+tg+'</span>'}).join('')+'</div>';
    html+='<p class="teacher-oh"><i data-lucide="clock" style="width:12px;height:12px;vertical-align:middle"></i> '+h(t.officeHour)+'</p><p class="teacher-location"><i data-lucide="map-pin" style="width:12px;height:12px;vertical-align:middle"></i> '+h(t.location||'')+'</p>';
    html+='<div class="teacher-card-actions"><button class="teacher-btn chat" data-teacher-chat="'+t.id+'"><i data-lucide="mail" style="width:14px;height:14px;vertical-align:middle"></i> 私聊</button><button class="teacher-btn book" data-teacher-book="'+t.id+'"><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle"></i> 预约</button></div>';
    html+='</article>'
  }
  if(!items.length)html+='<div class="state-block" style="grid-column:1/-1"><i data-lucide="search-x" style="width:48px;height:48px;color:var(--ink-3)"></i><strong>未找到匹配的老师</strong><p>尝试调整筛选条件</p></div>';
  html+='</div></div>';$('view-root').innerHTML=html;refreshIcons()
}
function renderTeacherDetail(){
  var t=MOCK_TEACHERS.find(function(x){return x.id===state.teacherDetail});if(!t){state.teacherDetail='';render();return}
  var stars='';for(var si=1;si<=5;si++)stars+='<i data-lucide="star" style="width:16px;height:16px;fill:var(--amber);stroke:var(--amber);vertical-align:middle"></i>';
  var ed='';if(t.education){var edKeys=Object.keys(t.education);for(var eki=0;eki<edKeys.length;eki++)ed+='<div class="td-timeline-item"><span class="td-timeline-year">'+edKeys[eki]+'</span><span class="td-timeline-content">'+h(t.education[edKeys[eki]])+'</span></div>'}
  var ct='';if(t.courses_taught)for(var cti=0;cti<t.courses_taught.length;cti++)ct+='<span class="td-course-chip"><i data-lucide="book-open" style="width:12px;height:12px;vertical-align:middle"></i> '+h(t.courses_taught[cti])+'</span>';
  var pp='';if(t.papers&&t.papers.length)for(var ppi=0;ppi<t.papers.length;ppi++)pp+='<div class="td-paper"><span class="td-paper-title">'+h(t.papers[ppi].title)+'</span><span class="td-paper-venue">'+h(t.papers[ppi].venue)+'</span></div>';
  var rv='';if(t.reviews)for(var rvi=0;rvi<t.reviews.length;rvi++)rv+='<div class="td-review"><span class="td-review-author">'+h(t.reviews[rvi].author)+'</span><span class="td-review-stars">'+Array(t.reviews[rvi].rating||5).fill('<i data-lucide="star" style="width:12px;height:12px;fill:var(--amber);stroke:var(--amber);vertical-align:middle"></i>').join('')+'</span><p class="td-review-text">'+h(t.reviews[rvi].text)+'</p></div>';
  var html='<div class="td-page">';
  html+='<button class="detail-back" data-teacher-back>'+(state.profileReturn?'← 返回个人主页':state.teacherFrom==='opportunities'?'返回':'← 返回教师列表')+'</button>';
  html+='<div class="td-hero"><div class="td-hero-avatar" style="background:'+t.color+'">'+h(t.name.slice(0,1))+'</div><h1 class="td-hero-name">'+h(t.name)+'</h1><p class="td-hero-title">'+h(t.faculty)+' · '+h(t.titleLabel)+'</p><p class="td-hero-rating">'+stars+' '+t.rating+'分（'+t.reviews_total+'人评价）</p></div>';
  html+='<div class="td-sticky-bar"><button class="td-bar-btn" data-teacher-chat="'+t.id+'"><i data-lucide="mail" style="width:14px;height:14px;vertical-align:middle"></i> 私聊老师</button><button class="td-bar-btn" data-teacher-book="'+t.id+'"><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle"></i> 预约Office Hour</button><button class="td-bar-btn" data-teacher-materials="'+t.id+'"><i data-lucide="book-open" style="width:14px;height:14px;vertical-align:middle"></i> 查看课程资料</button></div>';
  html+='<div class="td-section"><h3><i data-lucide="graduation-cap" style="width:16px;height:16px"></i> 教育背景</h3><div class="td-timeline">'+ed+'</div></div>';
  if(t.research)html+='<div class="td-section"><h3><i data-lucide="microscope" style="width:16px;height:16px"></i> 研究方向</h3><p style="font-size:14px;line-height:1.7;color:var(--ink-2)">'+h(t.research)+'</p></div>';
  html+='<div class="td-section"><h3><i data-lucide="book-open" style="width:16px;height:16px"></i> 主讲课程</h3><div style="display:flex;flex-wrap:wrap;gap:6px">'+ct+'</div></div>';
  if(pp)html+='<div class="td-section"><h3><i data-lucide="file-text" style="width:16px;height:16px"></i> 代表性论文</h3>'+pp+'</div>';
  if(t.projects&&t.projects.length){html+='<div class="td-section td-projects-section">';for(var pj=0;pj<t.projects.length;pj++){var proj=t.projects[pj];html+='<div class="td-project-card"><h4 class="td-project-title">'+h(proj.title)+'</h4><p class="td-project-desc">'+h(proj.desc)+'</p>';if(proj.positions)for(var pj2=0;pj2<proj.positions.length;pj2++){var pos=proj.positions[pj2],isOpen=pos.status==='open';html+='<div class="td-pos-card"><div class="td-pos-header"><span class="td-pos-name">'+h(pos.name)+'</span><span class="td-pos-type">'+h(pos.type)+'</span><span class="td-pos-status '+(isOpen?'open':'closed')+'">'+(isOpen?'<i data-lucide="circle" style="width:10px;height:10px;fill:var(--green);stroke:var(--green);vertical-align:middle"></i> 招募中':'<i data-lucide="circle" style="width:10px;height:10px;fill:var(--red);stroke:var(--red);vertical-align:middle"></i> 已截止')+'</span></div><div class="td-pos-meta"><span><i data-lucide="users" style="width:12px;height:12px;vertical-align:middle"></i> '+pos.slots+'人</span><span><i data-lucide="clock" style="width:12px;height:12px;vertical-align:middle"></i> '+h(pos.hours)+'</span><span><i data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle"></i> '+h(pos.deadline)+'</span></div>'+'<button class="td-pos-btn" data-recruit-open="'+pos.id+'">查看详情与申请</button></div>'}html+='</div>'}html+='</div>'}
  html+='<div class="td-section td-oh-section"><h3><i data-lucide="clock" style="width:16px;height:16px"></i> Office Hour</h3><div class="td-oh-card"><p class="td-oh-regular"><i data-lucide="calendar" style="width:13px;height:13px;vertical-align:middle"></i> 常规：'+h(t.officeHour)+'</p>'+(t.extraOfficeHour?'<p class="td-oh-extra">'+h(t.extraOfficeHour)+'</p>':'')+'<p class="td-oh-location"><i data-lucide="map-pin" style="width:13px;height:13px;vertical-align:middle"></i> '+h(t.location||'待定')+'</p>'+(t.phone?'<p class="td-oh-phone"><i data-lucide="phone" style="width:13px;height:13px;vertical-align:middle"></i> '+h(t.phone)+'</p>':'')+'</div></div>';
  if(rv)html+='<div class="td-section"><h3><i data-lucide="star" style="width:16px;height:16px"></i> 学生评价</h3><div class="td-reviews">'+rv+'</div></div>';
  html+='</div>';$('view-root').innerHTML=html;refreshIcons()
}
function findRecruitPos(id){
  var pos=null;
  for(var ti=0;ti<MOCK_TEACHERS.length&&!pos;ti++){var t=MOCK_TEACHERS[ti];if(t.projects)for(var pi=0;pi<t.projects.length&&!pos;pi++){var proj=t.projects[pi];if(proj.positions)for(var psi=0;psi<proj.positions.length;psi++){if(proj.positions[psi].id===id){pos=proj.positions[psi];pos._teacher=t;pos._project=proj;break}}}}
  return pos;
}
/* ═══ RECRUIT DETAIL MODAL · 上览下申 ═══ */
function renderRecruitModal(){
  var pos=findRecruitPos(state.recruitDetail);
  if(!pos){state.recruitDetail='';return}
  var t=pos._teacher,isOpen=pos.status==='open';
  var todayStr=new Date().toISOString().slice(0,10);
  var expired=!isOpen||(pos.deadline&&pos.deadline<todayStr);
  var full=pos.max_applicants>0&&(pos.current_applicants||0)>=pos.max_applicants;
  var verified=ME_PROFILE.verifyState==='verified';
  var alreadyApplied=state.myApplications.some(function(a){return a.posId===pos.id});
  var rs=state.resumes||[];
  var info='<div class="recruit-modal-header"><h2><i data-lucide="briefcase" style="width:20px;height:20px;vertical-align:middle;color:#C2B2A4"></i> '+h(pos.name)+'<span class="recruit-header-teacher"> · '+h(t.name)+'</span></h2><button class="publish-close" data-recruit-close>✕</button></div>';
  if(expired)info+='<div class="recruit-alert-bar"><i data-lucide="alert-triangle" style="width:14px;height:14px;vertical-align:middle"></i> 该岗位申请已截止</div>';
  info+='<div class="recruit-info">';
  info+='<div class="recruit-basic-grid">';
  info+='<div class="recruit-basic-cell"><span class="recruit-basic-icon"><i data-lucide="user-plus" style="width:13px;height:13px"></i></span><div><em>招募类型</em><strong>'+h(pos.type)+'</strong></div></div>';
  info+='<div class="recruit-basic-cell"><span class="recruit-basic-icon"><i data-lucide="users" style="width:13px;height:13px"></i></span><div><em>招募人数</em><strong>'+(pos.slots||'-')+' 人</strong></div></div>';
  info+='<div class="recruit-basic-cell"><span class="recruit-basic-icon"><i data-lucide="clock" style="width:13px;height:13px"></i></span><div><em>工作时长</em><strong>'+h(pos.hours||'-')+'</strong></div></div>';
  info+='<div class="recruit-basic-cell"><span class="recruit-basic-icon"><i data-lucide="calendar" style="width:13px;height:13px"></i></span><div><em>预期起止</em><strong>'+h(pos.period||pos.deadline||'-')+'</strong></div></div>';
  info+='</div>';
  var duties=pos.responsibilities||(pos.desc?[pos.desc]:[]);
  info+='<div class="recruit-section"><h4><i data-lucide="list-checks" style="width:15px;height:15px;vertical-align:middle"></i> 工作职责</h4><ol class="recruit-duties">'+duties.map(function(d){return'<li>'+h(d)+'</li>'}).join('')+'</ol></div>';
  var hard=pos.reqs_hard||pos.reqs||[],plus=pos.reqs_plus||[];
  info+='<div class="recruit-section"><h4><i data-lucide="target" style="width:15px;height:15px;vertical-align:middle"></i> 能力要求</h4>';
  if(hard.length)info+='<div class="recruit-req-group"><span class="recruit-req-group-tag hard">硬性要求</span><div class="recruit-req-tags">'+hard.map(function(r){return'<span class="recruit-req-tag hard">'+h(r)+'</span>'}).join('')+'</div></div>';
  if(plus.length)info+='<div class="recruit-req-group"><span class="recruit-req-group-tag plus">加分项</span><div class="recruit-req-tags">'+plus.map(function(r){return'<span class="recruit-req-tag plus">'+h(r)+'</span>'}).join('')+'</div></div>';
  info+='</div>';
  info+='<div class="recruit-section"><h4><i data-lucide="clock" style="width:15px;height:15px;vertical-align:middle"></i> 工作时间 <i data-lucide="coins" style="width:15px;height:15px;vertical-align:middle;margin-left:8px"></i> 薪资</h4><div class="recruit-time-salary"><p><i data-lucide="clock" style="width:13px;height:13px;vertical-align:middle"></i> '+h(pos.work_hours||pos.hours||'时间可协商')+'</p><p><i data-lucide="coins" style="width:13px;height:13px;vertical-align:middle"></i> 薪资：'+h(pos.salary||'面议')+'</p></div></div>';
  info+='<div class="recruit-section"><h4><i data-lucide="trending-up" style="width:15px;height:15px;vertical-align:middle"></i> 你将获得</h4><ul class="recruit-benefits">'+pos.benefits.map(function(b){return'<li><i data-lucide="check" style="width:13px;height:13px;flex-shrink:0"></i><span>'+h(b)+'</span></li>'}).join('')+'</ul></div>';
  info+='</div>';
  var form='';
  if(!expired){
    form+='<div class="recruit-form">';
    form+='<div class="recruit-form-title"><i data-lucide="chevron-down" style="width:13px;height:13px;vertical-align:middle"></i> 申请表单</div>';
    if(!verified)form+='<div class="recruit-verify-hint"><i data-lucide="shield-alert" style="width:14px;height:14px;vertical-align:middle"></i> 请先完成学校信息认证后再申请<span class="recruit-hint-link" data-recruit-goto-verify>去认证 →</span></div>';
    if(full)form+='<div class="recruit-full-hint"><i data-lucide="user-x" style="width:14px;height:14px;vertical-align:middle"></i> 该岗位已招满，期待下次机会</div>';
    form+='<label class="recruit-form-label">选择简历</label>';
    form+='<div class="recruit-select-row">';
    if(rs.length){
      form+='<select id="recruit-resume-select" class="recruit-select'+(state.recruitForm.errors.resume?' has-error':'')+'"><option value="">请选择简历版本</option>'+rs.map(function(r){return'<option value="'+r.id+'"'+(r.id===state.recruitForm.resume?' selected':'')+'>'+h(r.name)+'（更新于 '+h(r.updated)+'）</option>'}).join('')+'</select>';
    }else{
      form+='<div class="recruit-select-empty">暂未上传简历</div>';
    }
    form+='<button class="recruit-upload-btn" data-recruit-upload><i data-lucide="upload" style="width:13px;height:13px;vertical-align:middle"></i> 上传新简历</button>';
    form+='</div>';
    if(!rs.length)form+='<p class="recruit-no-resume"><i data-lucide="file-warning" style="width:12px;height:12px;vertical-align:middle"></i> 请先上传简历后再申请<span class="recruit-hint-link" data-recruit-goto-resume>去上传 →</span></p>';
    if(state.recruitForm.errors.resume)form+='<p class="recruit-error-text">'+h(state.recruitForm.errors.resume)+'</p>';
    form+='<label class="recruit-form-label">个人能力阐述 <span class="recruit-counter'+(state.recruitForm.statement.length>480?' warn':'')+'">'+state.recruitForm.statement.length+'/500</span></label>';
    form+='<textarea id="recruit-statement" class="recruit-textarea'+(state.recruitForm.errors.statement?' has-error':'')+'" maxlength="500" placeholder="请简述你与岗位相关的项目经历、技能掌握情况，以及你对该研究方向的兴趣来源……">'+h(state.recruitForm.statement)+'</textarea>';
    if(state.recruitForm.errors.statement)form+='<p class="recruit-error-text">'+h(state.recruitForm.errors.statement)+'</p>';
    form+='<label class="recruit-form-label">附加留言（选填）</label>';
    form+='<input id="recruit-note" class="recruit-note-input" placeholder="有什么想对老师说？可补充说明时间安排等" value="'+h(state.recruitForm.note)+'">';
    form+='<div class="recruit-actions">';
    form+='<button class="recruit-cancel-btn" data-recruit-close>取消</button>';
    if(alreadyApplied){
      form+='<button class="recruit-submit-btn is-applied" disabled><i data-lucide="check" style="width:14px;height:14px;vertical-align:middle"></i> 已申请，等待老师查看</button>';
    }else if(full){
      form+='<button class="recruit-submit-btn" disabled>该岗位已招满</button>';
    }else{
      form+='<button class="recruit-submit-btn" data-recruit-submit'+(state.recruitSubmitting?' disabled':'')+'>'+(state.recruitSubmitting?'<span class="recruit-spinner"></span> 提交中…':'<i data-lucide="send" style="width:14px;height:14px;vertical-align:middle"></i> 提交申请')+'</button>';
    }
    form+='</div>';
    form+='</div>';
  }
  var html='<div class="recruit-modal-overlay" id="recruit-modal-overlay"><div class="recruit-modal">'+info+form+'</div></div>';
  var old=document.getElementById('recruit-modal-overlay');if(old)old.remove();
  $('view-root').insertAdjacentHTML('beforeend',html);refreshIcons()
}
/* ═══ UNIFIED OFFICE HOUR MODAL ═══ */
/* Shared by: 通讯录→预约OH, 教师咨询列表→预约, 教师详情→预约OH */
function renderOfficeHourModal(){
  var t=state.ohModal.teacher;
  if(!t){state.ohModal.teacher=null;state.ohModal.step=1;state.ohModal.date='';state.ohModal.slot='';state.ohModal.topic='';return}
  var today=new Date(),dates=[];
  for(var di=0;di<14;di++){
    var d=new Date(today);d.setDate(d.getDate()+di);
    var dy=d.getDay(),wds=['日','一','二','三','四','五','六'];
    dates.push({date:d,label:(d.getMonth()+1)+'/'+d.getDate(),weekday:wds[dy],available:dy>=1&&dy<=5,dateStr:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})
  }
  // Auto-select nearest available date if none selected
  if(!state.ohModal.date){for(var adi=0;adi<dates.length;adi++){if(dates[adi].available){state.ohModal.date=dates[adi].dateStr;break}}}
  var slots=[],slotCapacity=3;
  for(var hi=9;hi<17;hi++){for(var mi=0;mi<60;mi+=30){var ts=String(hi).padStart(2,'0')+':'+String(mi).padStart(2,'0');var bkCount=state.bookings.filter(function(b){return b.teacherId===t.id&&b.date===state.ohModal.date&&b.slot===ts}).length;slots.push({time:ts,booked:bkCount>=slotCapacity,remaining:slotCapacity-bkCount})}}
  var stepHtml='';
  if(state.ohModal.step===1){
    stepHtml='<div class="oh-step-content"><p class="oh-step-hint">选择预约日期（默认选中最近可约日）</p><div class="oh-date-grid">'+
      dates.map(function(d){var cls='oh-date-cell'+(d.available?' is-available':' is-disabled')+(state.ohModal.date===d.dateStr?' is-selected':'');return'<div class="'+cls+'" data-oh-date="'+d.dateStr+'"><span class="oh-date-weekday">周'+d.weekday+'</span><span class="oh-date-num">'+d.label+'</span></div>'}).join('')+
      '</div></div>'
  }else if(state.ohModal.step===2){
    stepHtml='<div class="oh-step-content"><p class="oh-step-hint">已选 '+state.ohModal.date+'，择一时段（30分钟/节）</p><div class="oh-slot-grid">'+
      slots.map(function(s){var cls='oh-slot-cell'+(s.booked?' is-booked':'')+(state.ohModal.slot===s.time?' is-selected':'');return'<div class="'+cls+'"'+(s.booked?'':' data-oh-slot="'+s.time+'"')+'><span class="oh-slot-time">'+s.time+'</span><span class="oh-slot-status">'+(s.booked?'已满':'余'+s.remaining+'席')+'</span></div>'}).join('')+
      '</div></div>'
  }else if(state.ohModal.step===3){
    stepHtml='<div class="oh-step-content"><p class="oh-step-hint">补充信息（选填）</p><div class="oh-topic-area"><div class="oh-summary-card"><div class="oh-summary-item"><span class="oh-summary-label">日期</span><span>'+state.ohModal.date+'</span></div><div class="oh-summary-item"><span class="oh-summary-label">时段</span><span>'+state.ohModal.slot+'</span></div><div class="oh-summary-item"><span class="oh-summary-label">教师</span><span>'+h(t.name)+'</span></div>'+(t.titleLabel||t.title?'<div class="oh-summary-item"><span class="oh-summary-label">职称</span><span>'+h(t.titleLabel||t.title)+'</span></div>':'')+'</div><textarea class="field oh-topic-input" id="oh-topic" placeholder="简单描述你想讨论的内容" rows="3">'+h(state.ohModal.topic)+'</textarea></div></div>'
  }
  var sColor=t.status==='online'?'#5cb85c':(t.status==='busy'?'#f0ad4e':'#ccc');
  var statusLabel=t.status==='online'?'在线':(t.status==='busy'?'忙碌':'离线');
  var bodyHtml=
    '<div class="oh-teacher-summary" style="padding:4px 0 8px;margin-bottom:8px"><span class="oh-teacher-avatar" style="width:32px;height:32px;font-size:13px">'+h((t.name||'?').slice(0,1))+'</span><div class="oh-teacher-info"><strong style="font-size:14px">'+h(t.name)+'</strong><p>'+h(t.faculty||t.title||'教师')+' · <span class="contact-status-dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:'+sColor+';margin-right:2px;vertical-align:middle"></span>'+statusLabel+'</p></div></div>'+
    '<div class="oh-steps-bar"><div class="oh-step-dot'+(state.ohModal.step>=1?' is-active':'')+'">1</div><div class="oh-step-line'+(state.ohModal.step>=2?' is-active':'')+'"></div><div class="oh-step-dot'+(state.ohModal.step>=2?' is-active':'')+'">2</div><div class="oh-step-line'+(state.ohModal.step>=3?' is-active':'')+'"></div><div class="oh-step-dot'+(state.ohModal.step>=3?' is-active':'')+'">3</div></div><div class="oh-step-labels"><span>选日期</span><span>选时段</span><span>确认</span></div>'+
    stepHtml+
    '<div class="oh-footer">'+
      (state.ohModal.step===1||state.ohModal.step===2?'<button class="button button-ghost" data-oh-close>取消</button>':'<button class="button button-secondary" data-oh-step="'+(state.ohModal.step-1)+'">← 上一步</button>')+
      (state.ohModal.step<3?'<button class="button" data-oh-step="'+(state.ohModal.step+1)+'"'+(state.ohModal.step===1&&!state.ohModal.date?' disabled':'')+(state.ohModal.step===2&&!state.ohModal.slot?' disabled':'')+'>下一步 →</button>':'<button class="button oh-submit-btn" data-oh-submit style="background:#C2B2A4;border-color:#C2B2A4;color:#fff"><i data-lucide="check-circle" style="width:16px;height:16px;vertical-align:middle"></i> 确认预约</button>')+
    '</div>';
  var existing=document.getElementById('oh-modal-overlay');
  if(existing){
    var body=existing.querySelector('.publish-body');
    if(body){body.innerHTML=bodyHtml;refreshIcons()}
    return
  }
  var html='<div class="publish-overlay" id="oh-modal-overlay"><div class="publish-modal" style="max-width:640px"><div class="publish-modal-header"><h2><i data-lucide="calendar" style="width:18px;height:18px;vertical-align:middle"></i> 预约 Office Hour - '+h(t.name)+'</h2><button class="publish-close" data-oh-close>✕</button></div><div class="publish-body">'+bodyHtml+'</div></div></div>';
  $('view-root').insertAdjacentHTML('beforeend',html);refreshIcons()
}
function submitBooking(){
  var t=state.ohModal.teacher;
  if(!t)return;
  state.bookings.push({teacherId:t.id,date:state.ohModal.date,slot:state.ohModal.slot,topic:state.ohModal.topic||''});
  state.notifications.push({id:'b'+(state.notifications.length+1),content:'【预约确认】您已成功预约 '+t.name+' 的Office Hour：'+state.ohModal.date+' '+state.ohModal.slot+'。',time:new Date().toISOString().slice(0,16).replace('T',' '),level:'urgent',read:false,processed:false,saved_for_later:false,pinned:false});
  state.notifications.push({id:'b'+(state.notifications.length+2),content:'【新预约】学生预约了您的Office Hour：'+state.ohModal.date+' '+state.ohModal.slot+'。',time:new Date().toISOString().slice(0,16).replace('T',' '),level:'normal',read:false,processed:false,saved_for_later:false,pinned:false});
  generateICS(t,state.ohModal.date,state.ohModal.slot);
  var bo=document.getElementById('oh-modal-overlay');if(bo)bo.remove();
  toast('预约成功！已发送至 '+t.name+' 并同步至你的日程。');
  state.ohModal.teacher=null;state.ohModal.step=1;state.ohModal.date='';state.ohModal.slot='';state.ohModal.topic=''
}
function generateICS(t,date,slot){
  var startTime=date+'T'+slot+':00',endH=parseInt(slot.split(':')[0]),endM=parseInt(slot.split(':')[1])+30;
  if(endM>=60){endH+=1;endM-=60}
  var endTime=date+'T'+String(endH).padStart(2,'0')+':'+String(endM).padStart(2,'0')+':00';
  var ics='BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SurfCampus//Booking//EN\nBEGIN:VEVENT\nDTSTART:'+startTime.replace(/[-:]/g,'')+'\nDTEND:'+endTime.replace(/[-:]/g,'')+'\nSUMMARY:Office Hour - '+t.name+'\nDESCRIPTION:咨询主题：'+(state.ohModal.topic||'（未填写）')+'\nLOCATION:'+t.location+'\nEND:VEVENT\nEND:VCALENDAR';
  var blob=new Blob([ics],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='office_hour_'+t.name+'_'+date+'.ics';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)
}
/* ═══ COFFEE CHAT MODAL ═══ */
function renderCoffeeChatModal(){
  var p=state.ccModal.person;if(!p)return;
  var step=state.ccModal.step,stepHtml='';
  if(step===1){
    stepHtml='<div class="cc-step-hint">📅 选择你方便的时间（首选必填，备选选填）</div>'+
      '<div class="cc-time-group"><div class="cc-time-field"><label>首选时间 <span style="color:#A6B8A2">*</span></label><input type="date" id="cc-date1" value="'+h(state.ccModal.date1)+'" min="'+new Date().toISOString().slice(0,10)+'" /><input type="time" id="cc-time1" value="'+h(state.ccModal.time1)+'" style="margin-top:6px" /></div>'+
      '<div class="cc-time-field"><label>备选时间 <span class="cc-optional">（选填）</span></label><input type="date" id="cc-date2" value="'+h(state.ccModal.date2)+'" min="'+new Date().toISOString().slice(0,10)+'" /><input type="time" id="cc-time2" value="'+h(state.ccModal.time2)+'" style="margin-top:6px" /></div></div>'
  }else if(step===2){
    var LOCATIONS=['图书馆讨论区','校园咖啡厅','线上(腾讯会议)','其他（请注明）'];
    stepHtml='<div class="cc-step-hint">📍 提议见面地点</div>'+
      '<div class="cc-location-group"><select id="cc-location-select"><option value="">请选择地点…</option>'+LOCATIONS.map(function(l){return'<option value="'+h(l)+'"'+(state.ccModal.location===l?' selected':'')+'>'+h(l)+'</option>'}).join('')+'</select>'+
      '<input type="text" id="cc-location-other" placeholder="或输入自定义地点…" value="'+(LOCATIONS.indexOf(state.ccModal.location)<0?h(state.ccModal.location):'')+'" /></div>'
  }else if(step===3){
    stepHtml='<div class="cc-step-hint">💬 留言（选填）</div>'+
      '<textarea class="cc-topic-input" id="cc-topic" placeholder="想和你聊聊关于... 或者随便认识一下！">'+h(state.ccModal.topic)+'</textarea>'+
      '<div class="cc-summary-card" style="margin-top:16px"><div class="cc-summary-item"><span class="cc-summary-label">📅 首选</span><span>'+(state.ccModal.date1||'—')+' '+h(state.ccModal.time1||'')+'</span></div>'+
      (state.ccModal.date2?'<div class="cc-summary-item"><span class="cc-summary-label">📅 备选</span><span>'+h(state.ccModal.date2)+' '+h(state.ccModal.time2)+'</span></div>':'')+
      '<div class="cc-summary-item"><span class="cc-summary-label">📍 地点</span><span>'+h(state.ccModal.location||'待定')+'</span></div></div>'
  }
  var personSummary='<div class="cc-person-summary"><span class="cc-person-avatar">'+h((p.name||'?').slice(0,1))+'</span>'+
    '<div class="cc-person-info"><strong>'+h(p.name)+'</strong><p>'+h(p['年级']||'')+' · '+h(p.major||'')+(p.sharedCourses?' · <span style="color:#A6B8A2">📚 '+h(p.sharedCourses)+'</span>':'')+'</p></div></div>';
  var bodyHtml=personSummary+
    '<div class="cc-steps-bar"><div class="cc-step-dot'+(step>=1?' is-active':'')+'">1</div><div class="cc-step-line'+(step>=2?' is-active':'')+'"></div><div class="cc-step-dot'+(step>=2?' is-active':'')+'">2</div><div class="cc-step-line'+(step>=3?' is-active':'')+'"></div><div class="cc-step-dot'+(step>=3?' is-active':'')+'">3</div></div><div class="cc-step-labels"><span>提议时间</span><span>提议地点</span><span>确认</span></div>'+
    '<div class="cc-step-content">'+stepHtml+'</div>'+
    '<div class="cc-footer">'+
      (step===1||step===2?'<button class="button button-ghost" data-cc-close>取消</button>':'<button class="button button-secondary" data-cc-step="'+(step-1)+'">← 上一步</button>')+
      (step<3?'<button class="button" data-cc-step="'+(step+1)+'">下一步 →</button>':'<button class="button cc-submit-btn" data-cc-submit><i data-lucide="send" style="width:16px;height:16px;vertical-align:middle"></i> 发送邀约</button>')+
    '</div>';
  var existing=document.getElementById('cc-modal-overlay');
  if(existing){
    var body=existing.querySelector('.publish-body');
    if(body){body.innerHTML=bodyHtml;refreshIcons()}
    return
  }
  var html='<div class="publish-overlay cc-modal" id="cc-modal-overlay"><div class="publish-modal" style="max-width:560px"><div class="publish-modal-header"><h2 style="color:#6a7c66"><i data-lucide="coffee" style="width:18px;height:18px;vertical-align:middle;color:#A6B8A2"></i> 约 Coffee Chat - '+h(p.name)+'</h2><button class="publish-close" data-cc-close>✕</button></div><div class="publish-body">'+bodyHtml+'</div></div></div>';
  $('view-root').insertAdjacentHTML('beforeend',html);refreshIcons()
}
function submitCoffeeChat(){
  var p=state.ccModal.person;
  if(!p||!state.ccModal.date1||!state.ccModal.time1)return;
  var chatId='cc_'+p.id;
  if(!CHAT_MESSAGES[chatId])CHAT_MESSAGES[chatId]=[];
  var cardText='☕ Coffee Chat 邀约\n📅 首选：'+state.ccModal.date1+' '+state.ccModal.time1+
    (state.ccModal.date2?'\n📅 备选：'+state.ccModal.date2+' '+state.ccModal.time2:'')+
    '\n📍 地点：'+state.ccModal.location+
    (state.ccModal.topic?'\n💬 留言：'+state.ccModal.topic:'');
  CHAT_MESSAGES[chatId].push({from:'system',text:'☕ Coffee Chat 邀约卡片\n'+cardText,time:new Date().toISOString()});
  // Add to MOCK_MSGS for message list
  MOCK_MSGS.unshift({id:'cc_'+Date.now(),contact:p.name||'同学',avatar:(p.name||'?').slice(0,1),role:(p['年级']||'')+' · '+(p.major||''),tag:'coffee_chat',tagLabel:'☕ 邀约待回复',lastMsg:'☕ 已发送 Coffee Chat 邀约，等待对方回复',time:new Date().toISOString(),msgs:[{from:'system',text:'☕ Coffee Chat 邀约卡片\n'+cardText,time:new Date().toISOString()}],status:'待回复'});
  // Notification
  state.notifications.push({id:'cc_'+(state.notifications.length+1),content:'☕ ['+p.name+'] 邀请你喝咖啡！点击查看详情',time:new Date().toISOString().slice(0,16).replace('T',' '),level:'normal',read:false,processed:false,saved_for_later:false,pinned:false});
  // Close modal
  var el=document.getElementById('cc-modal-overlay');
  if(el)el.remove();
  toast('☕ 已向 '+p.name+' 发送 Coffee Chat 邀约！对方收到后将尽快回复。');
  state.ccModal={person:null,step:1,date1:'',time1:'',date2:'',time2:'',location:'',topic:''};
  // Switch to message tab
  state.msgTab=0;render()
}
/* ═══ TEACHER MATERIALS MODAL ═══ */
function renderTeacherMaterials(tId){
  var t=MOCK_TEACHERS.find(function(x){return x.id===tId});if(!t)return;
  // Get teacher's course codes from courses_taught
  var courseCodes=[];if(t.courses_taught)for(var cti=0;cti<t.courses_taught.length;cti++){var parts=t.courses_taught[cti].match(/^(\w+)/);if(parts)courseCodes.push(parts[1])}
  // Find matching resources
  var materials=state.resources.filter(function(r){return courseCodes.indexOf(r.course)>=0});
  var relatedByMajor=state.resources.filter(function(r){return r.major===t.faculty.replace('学院','').replace('智能工程','ICS').replace('数学物理','MTH').replace('语言','All')&&courseCodes.indexOf(r.course)<0}).slice(0,4);
  var matHtml='';if(materials.length){matHtml='<div class="tm-section"><h3>课程资料（'+materials.length+'项）</h3>';for(var mi=0;mi<materials.length;mi++){var mr=materials[mi];matHtml+='<div class="tm-item" data-res-open="'+mr.id+'"><span class="tm-icon" style="background:'+(mr.type==='试卷'?'var(--red-soft)':mr.type==='课件'?'var(--blue-soft)':mr.type==='笔记'?'var(--amber-soft)':'var(--surface-soft)')+';color:'+(mr.type==='试卷'?'var(--red)':mr.type==='课件'?'var(--blue)':mr.type==='笔记'?'var(--amber)':'var(--ink-3)')+'"><i data-lucide="'+(mr.type==='试卷'?'file-check':mr.type==='课件'?'presentation':mr.type==='笔记'?'pen-tool':'file-text')+'" style="width:16px;height:16px"></i></span><div class="tm-content"><strong>'+h(mr.name)+'</strong><p>'+h(mr.course)+' · '+h(mr.type)+' · '+h(mr.size||'')+'</p></div><span class="tm-downloads">'+(mr.downloads||0)+'次下载</span></div>'}matHtml+='</div>'}else{matHtml='<div class="tm-section"><p style="color:var(--ink-3);font-size:13px">该老师暂无公开课程资料</p></div>'}
  if(relatedByMajor.length){matHtml+='<div class="tm-section"><h3>推荐相关</h3>';for(var ri=0;ri<relatedByMajor.length;ri++){var rr=relatedByMajor[ri];matHtml+='<div class="tm-item" data-res-open="'+rr.id+'"><span class="tm-icon" style="background:'+(rr.type==='试卷'?'var(--red-soft)':rr.type==='课件'?'var(--blue-soft)':rr.type==='笔记'?'var(--amber-soft)':'var(--surface-soft)')+';color:'+(rr.type==='试卷'?'var(--red)':rr.type==='课件'?'var(--blue)':rr.type==='笔记'?'var(--amber)':'var(--ink-3)')+'"><i data-lucide="file-text" style="width:16px;height:16px"></i></span><div class="tm-content"><strong>'+h(rr.name)+'</strong><p>'+h(rr.course)+' · '+h(rr.type)+'</p></div></div>'}matHtml+='</div>'}
  var html='<div class="publish-overlay" id="tm-overlay"><div class="publish-modal" style="max-width:560px"><div class="publish-modal-header"><h2><i data-lucide="book-open" style="width:18px;height:18px;vertical-align:middle"></i> '+h(t.name)+' 的课程资料</h2><button class="publish-close" data-tm-close>✕</button></div><div class="publish-body">'+matHtml+'</div></div></div>';
  $('view-root').insertAdjacentHTML('beforeend',html);refreshIcons()
}
/* ═══ TEACHER CHAT MODAL ═══ */
function renderTeacherChatModal(tId){
  var t=MOCK_TEACHERS.find(function(x){return x.id===tId});if(!t)return;
  var chatId='tc_'+tId;
  if(!CHAT_MESSAGES[chatId])CHAT_MESSAGES[chatId]=[
    {from:'teacher',text:'你好！我是'+t.name+'，'+t.titleLabel+'。有什么学术或课程相关的问题可以帮你解答？',time:new Date().toISOString(),image:''}
  ];
  var msgs=CHAT_MESSAGES[chatId],isOnline=t.status==='online';
  var msgHtml=msgs.map(function(m){
    var isSelf=m.from==='self',cls=isSelf?'tchat-bubble self':'tchat-bubble';
    var imgHtml=m.image?'<img src="'+h(m.image)+'" class="tchat-img" alt="" />':'';
    return'<div class="'+cls+'">'+imgHtml+'<div class="tchat-text">'+h(m.text)+'</div><span class="tchat-time">'+formatTime(m.time)+'</span></div>'
  }).join('');
  var pendingImg=state.tchatPendingImage?'<div class="tchat-pending-img" id="tchat-pending-img"><img src="'+h(state.tchatPendingImage)+'" alt="" /><button type="button" class="tchat-pending-clear" data-tchat-clear-img>✕</button></div>':'';
  var html='<div class="tchat-overlay" id="tchat-overlay" data-tchat-id="'+tId+'"><div class="tchat-modal"><div class="tchat-header"><span class="tchat-avatar" style="background:'+t.color+'">'+h(t.name.slice(0,1))+'</span><div class="tchat-header-info"><strong>'+h(t.name)+'</strong><span class="tchat-status '+(isOnline?'online':'offline')+'"><i data-lucide="circle" style="width:8px;height:8px;fill:currentColor;vertical-align:middle"></i> '+(isOnline?'在线':'离线，老师上线后会回复')+'</span></div><button class="publish-close" data-tchat-close>✕</button></div><div class="tchat-messages" id="tchat-messages">'+msgHtml+'</div><div class="tchat-input-area">'+pendingImg+'<form id="tchat-form" class="tchat-form"><input type="file" accept="image/*" id="tchat-img-input" style="display:none" /><button type="button" class="tchat-img-btn" data-tchat-img><i data-lucide="image" style="width:18px;height:18px"></i></button><textarea id="tchat-input" placeholder="输入消息…" rows="1" class="tchat-input-field"></textarea><button type="submit" class="tchat-send-btn" disabled><i data-lucide="send" style="width:16px;height:16px"></i></button></form><p class="tchat-prompt">文明交流，教学相长 <i data-lucide="heart" style="width:11px;height:11px;vertical-align:middle"></i></p></div></div></div>';
  $('view-root').insertAdjacentHTML('beforeend',html);refreshIcons();
  setTimeout(function(){var el=document.getElementById('tchat-messages');if(el)el.scrollTop=el.scrollHeight},50)
}
function sendTeacherChat(){
  var inp=document.getElementById('tchat-input');if(!inp)return;
  var txt=inp.value.trim();if(!txt&&!state.tchatPendingImage)return;
  var overlay=document.getElementById('tchat-overlay');if(!overlay)return;
  var tId=overlay.dataset.tchatId;if(!tId)return;
  var chatId='tc_'+tId;
  if(!CHAT_MESSAGES[chatId])return;
  var msg={from:'self',text:txt||'[图片]',time:new Date().toISOString(),image:state.tchatPendingImage||''};
  CHAT_MESSAGES[chatId].push(msg);
  state.tchatPendingImage='';inp.value='';
  // Re-render messages
  var msgs=CHAT_MESSAGES[chatId],t=MOCK_TEACHERS.find(function(x){return x.id===tId});
  var isOnline=t?t.status==='online':true;
  var msgHtml=msgs.map(function(m){
    var isSelf=m.from==='self',cls=isSelf?'tchat-bubble self':'tchat-bubble';
    var imgHtml=m.image?'<img src="'+h(m.image)+'" class="tchat-img" alt="" />':'';
    return'<div class="'+cls+'">'+imgHtml+'<div class="tchat-text">'+h(m.text)+'</div><span class="tchat-time">'+formatTime(m.time)+'</span></div>'
  }).join('');
  var msgContainer=overlay.querySelector('.tchat-messages');
  if(msgContainer){msgContainer.innerHTML=msgHtml;msgContainer.scrollTop=msgContainer.scrollHeight}
  // Update send button state
  var sb=overlay.querySelector('.tchat-send-btn');if(sb)sb.disabled=true;
  refreshIcons();
  // Simulate teacher reply after delay
  if(txt||state.tchatPendingImage){
    setTimeout(function(){
      var replyText='';
      if(txt&&txt.includes('exam')||txt&&txt.includes('考试')||txt&&txt.includes('期末'))replyText='期末复习建议先过一遍教材例题，再刷历年试卷。如果还有不懂的，可以在Office Hour来找我。';
      else if(txt&&txt.includes('作业')||txt&&txt.includes('assignment'))replyText='关于作业的问题，建议先自己思考一下，或者和同学讨论。如果实在卡住了，周三Office Hour可以来问我。';
      else if(txt&&txt.includes('research')||txt&&txt.includes('科研')||txt&&txt.includes('研究'))replyText='对科研感兴趣的话，可以来看我的研究方向，我目前有RA岗位开放。';
      else if(state.tchatPendingImage)replyText='图片收到了，我看看。有疑问的话随时留言。';
      else replyText='收到你的消息了。还有其他学术问题需要帮助的吗？';
      CHAT_MESSAGES[chatId].push({from:'teacher',text:replyText,time:new Date().toISOString(),image:''});
      var msgs2=CHAT_MESSAGES[chatId];
      var msgHtml2=msgs2.map(function(m){
        var isSelf=m.from==='self',cls2=isSelf?'tchat-bubble self':'tchat-bubble';
        var imgHtml2=m.image?'<img src="'+h(m.image)+'" class="tchat-img" alt="" />':'';
        return'<div class="'+cls2+'">'+imgHtml2+'<div class="tchat-text">'+h(m.text)+'</div><span class="tchat-time">'+formatTime(m.time)+'</span></div>'
      }).join('');
      var msgContainer2=document.getElementById('tchat-overlay')?.querySelector('.tchat-messages');
      if(msgContainer2){msgContainer2.innerHTML=msgHtml2;msgContainer2.scrollTop=msgContainer2.scrollHeight}
      refreshIcons()
    },800)
  }
}
function renderCalendar(){var y=state.evtCalendarYear,m=state.evtCalendarMonth;var today=new Date(),ts=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;var ed=new Set();DEMO_EVENTS.forEach(e=>{var a=e.time.match(/^(\d{4}-\d{2}-\d{2})/);if(a)ed.add(a[1])});var fd=new Date(y,m-1,1),ld=new Date(y,m,0),sd=fd.getDay(),dim=ld.getDate();var cal='';['日','一','二','三','四','五','六'].forEach(d=>{cal+=`<span class="cal-dow">${d}</span>`});for(var i=0;i<sd;i++)cal+='<span class="cal-day other-month"></span>';for(var d=1;d<=dim;d++){var ds=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;var cls='cal-day';if(ds===ts)cls+=' today';if(ed.has(ds))cls+=' has-event';if(state.evtSelectedDay===ds)cls+=' selected';cal+=`<span class="${cls}" data-cal-day="${ds}">${d}</span>`}var info='';if(state.evtSelectedDay){var de=DEMO_EVENTS.filter(e=>e.time.startsWith(state.evtSelectedDay));info=`<div class="cal-selected-info">${de.length?de.length+'个活动·'+de.map(e=>e.title).join('、'):'当天暂无活动'}<button data-cal-clear>清除</button></div>`}return`<div class="calendar-panel"><div class="cal-header"><button data-cal-prev>◀</button><strong>${y}年${m}月</strong><button data-cal-next>▶</button></div><div class="cal-grid">${cal}</div>${info}</div>`}
function renderEvents(){
  if(state.evtDetail){renderEvtDetail();return}
  var today=new Date(),ts=today.toISOString().slice(0,10);
  var weekEnd=new Date(today);weekEnd.setDate(today.getDate()+(7-today.getDay()));
  var tf=state.evtTimeFilter||"month",types=state.evtTypes||[],ds=state.evtDateSearch;
  var typeColors={讲座:"#8EA5B6",Workshop:"#A6B8A2","兴趣活动":"#D4C5A9","校外导师":"#C9BAA5","社团活动":"#D0B6B5","职业发展":"#C2B2A4","留学":"#B7AEC6","体育赛事":"#9DAAB9","志愿公益":"#A0B5A5"};
  var items=DEMO_EVENTS.filter(function(e){
    var ed=e.time.match(/^\d{4}-\d{2}-\d{2}/);if(!ed)return false;
    var d=new Date(ed[0]);
    if(ds)return ed[0]===ds;
    if(tf==="today")return d.toISOString().slice(0,10)===ts;
    if(tf==="week"){var we=new Date(weekEnd);return d>=today&&d<=we}
    if(tf==="month")return d.getMonth()===today.getMonth()&&d.getFullYear()===today.getFullYear();
    return true
  });
  if(state.evtCat!=="全部")items=items.filter(function(e){return e.category===state.evtCat});
  if(types.length)items=items.filter(function(e){return types.indexOf(e.category)>=0});
  items.sort(function(a,b){return a.time.localeCompare(b.time)});
  var timeTabs=["本日","本周","本月"];
  var timeVals=["today","week","month"];
  var timeHtml="<div class=\"evt-time-bar\"><div class=\"evt-time-tabs\">";
  for(var tti=0;tti<timeTabs.length;tti++)timeHtml+="<button class=\"evt-time-tab"+(tf===timeVals[tti]&&!ds?" active":"")+"\" data-evt-time=\""+timeVals[tti]+"\">"+timeTabs[tti]+"</button>";
  timeHtml+="</div><div class=\"evt-date-search\"><input class=\"field\" id=\"evt-date-input\" type=\"date\" value=\""+h(ds)+"\" placeholder=\"选择日期\" style=\"font-size:12px;padding:6px 10px;width:140px\"><button class=\"evt-date-clear\""+(ds?"":" style=\"display:none\"")+" data-evt-clear-date>✕ 清除</button></div></div>";
  var allTypes=["讲座","Workshop","兴趣活动","校外导师","社团活动","职业发展","留学","体育赛事","志愿公益"];
  var typeHtml="<div class=\"evt-type-tags\">";
  for(var tpi=0;tpi<allTypes.length;tpi++)typeHtml+="<button class=\"evt-type-tag"+(types.indexOf(allTypes[tpi])>=0?" active":"")+"\" data-evt-type=\""+allTypes[tpi]+"\" style=\""+(types.indexOf(allTypes[tpi])>=0?"background:"+typeColors[allTypes[tpi]]+"33;border-color:"+typeColors[allTypes[tpi]]+";color:"+typeColors[allTypes[tpi]]:"")+"\">"+allTypes[tpi]+"</button>";
  typeHtml+="</div>";
  var myEvents=DEMO_EVENTS.filter(function(e){return e.registered_by_me});
  var myHtml=myEvents.length?"<div class=\"my-evt-toggle\" id=\"my-events-toggle\"><span class=\"my-evt-toggle-icon\">✅</span><span class=\"my-evt-toggle-label\">我报名的活动 · "+myEvents.length+"个</span><span class=\"my-evt-toggle-arrow\">"+(state.evtShowMy?"▲":"▼")+"</span></div>"+(state.evtShowMy?"<div class=\"my-evt-cards\">"+myEvents.map(function(e){var mec=typeColors[e.category]||"#8EA5B6";var dlMatch=e.time.match(/^\d{4}-\d{2}-\d{2}/);var dlDate=dlMatch?new Date(dlMatch[0]):null;var nowMs=Date.now(),diffH=dlDate?Math.ceil((dlDate.getTime()-nowMs)/3600000):0;var status="";if(diffH<0)status="<span class=\"my-evt-status ended\">已结束</span>";else if(diffH<48)status="<span class=\"my-evt-status soon\">即将开始</span>";else status="<span class=\"my-evt-status active\">已报名</span>";return"<div class=\"my-evt-card\" style=\"border-left:3px solid "+mec+"\"><span class=\"my-evt-card-cat\" style=\"background:"+mec+"18;color:"+mec+"\">"+h(e.category)+"</span><strong class=\"my-evt-card-title\">"+h(e.title)+"</strong><p class=\"my-evt-card-time\">"+h(e.time)+"</p>"+status+"</div>"}).join("")+"</div>":""):"";
  var cardHtml="";
  for(var ei=0;ei<items.length;ei++){
    var e=items[ei],reg=e.registered_by_me,ec=typeColors[e.category]||"var(--ink-2)",cat=e.category;
    var regNum=e.registered||0,cap=e.capacity||100,remaining=cap-regNum,pct=Math.min(Math.round(regNum/cap*100),100);
    var dlMatch=e.time.match(/^\d{4}-\d{2}-\d{2}/);var dlDate=dlMatch?new Date(dlMatch[0]):null,nowMs=Date.now(),dlMs=dlDate?dlDate.getTime():0,diffH=Math.ceil((dlMs-nowMs)/3600000);
    var deadlineText="";if(diffH>0&&diffH<168)deadlineText="⏳ "+Math.floor(diffH/24)+"天"+diffH%24+"小时后截止";else if(diffH>=168)deadlineText="📅 "+Math.floor(diffH/24)+"天后开始";
    var statusBadge="";if(diffH<0)statusBadge="<span class=\"evt-status-badge ended\">已结束</span>";else if(diffH<48)statusBadge="<span class=\"evt-status-badge soon\">即将开始</span>";else statusBadge="<span class=\"evt-status-badge open\">报名中</span>";
    var remainLabel="";if(remaining<=5)remainLabel="<span class=\"evt-remain urgent\">⚠️ 仅剩"+remaining+"个名额</span>";else if(remaining<=15)remainLabel="<span class=\"evt-remain warn\">剩余"+remaining+"个名额</span>";else remainLabel="<span class=\"evt-remain\">剩余"+remaining+"个名额</span>";
    var extra="";
    if(cat==="讲座"&&e.speaker)extra="<div class=\"evt-card-extra\"><span class=\"evt-extra-item\">"+h(e.speaker)+"</span></div>";
    else if(cat==="Workshop")extra="<div class=\"evt-card-extra\"><span class=\"evt-extra-item\">👥 限额"+e.capacity+"人</span>"+(e.speaker?"<span class=\"evt-extra-item\">🧑‍🏫 "+h(e.speaker)+"</span>":"")+"</div>";
    else if(cat==="兴趣活动")extra="<div class=\"evt-card-extra\"><span class=\"evt-extra-item\">"+h(e.organizer)+"</span></div>";
    else if(cat==="校外导师")extra="<div class=\"evt-card-extra\"><span class=\"evt-extra-item\">👤 "+h(e.speaker||"")+"</span></div>";
    else if(cat==="社团活动")extra="<div class=\"evt-card-extra\"><span class=\"evt-extra-item\">"+h(e.organizer)+"</span></div>";
    else if(cat==="职业发展")extra="<div class=\"evt-card-extra\"><span class=\"evt-extra-item\">面试/简历指导</span></div>";
    else if(cat==="留学")extra="<div class=\"evt-card-extra\"><span class=\"evt-extra-item\">校友分享·申请攻略</span></div>";
    else if(cat==="体育赛事")extra="<div class=\"evt-card-extra\"><span class=\"evt-extra-item\">竞技·组队参赛</span></div>";
    else if(cat==="志愿公益")extra="<div class=\"evt-card-extra\"><span class=\"evt-extra-item\">志愿服务·工时认证</span></div>";
    cardHtml+="<article class=\"evt-card\" data-evt-id=\""+e.id+"\">"+statusBadge+"<div class=\"evt-card-top\"><span class=\"evt-card-cat\" style=\"background:"+ec+"22;color:"+ec+"\">"+h(e.category)+"</span>"+(e.speaker&&cat==="讲座"?"<span class=\"evt-card-speaker\">"+h(e.speaker)+"</span>":"")+"</div><h3 class=\"evt-card-title\">"+h(e.title)+"</h3><p class=\"evt-card-desc\">"+h(e.description)+"</p>"+extra+"<div class=\"evt-card-meta\"><span>"+h(e.time)+"</span><span>📍 "+h(e.location)+"</span></div><div class=\"evt-card-progress\"><div class=\"evt-progress-bar\"><div class=\"evt-progress-fill\" style=\"width:"+pct+"%\"></div></div><span class=\"evt-progress-text\">"+regNum+"/"+cap+"人</span></div><div class=\"evt-card-bottom\"><div class=\"evt-card-stats\">"+remainLabel+(deadlineText?"<span class=\"evt-deadline\">"+deadlineText+"</span>":"")+"</div><div class=\"evt-card-actions\">"+(reg?"<span class=\"evt-registered\">✅ 已报名</span>":"<button class=\"evt-reg-btn\" data-evt-reg=\""+e.id+"\">报名</button>")+"</div></div></article>"
  }
  if(!items.length)cardHtml="<div class=\"state-block\" style=\"grid-column:1/-1\"><span style=\"font-size:48px\">📅</span><strong>当前筛选暂无活动</strong><p>试试切换时间或类型</p></div>";
  $("view-root").innerHTML="<div class=\"evt-page\">"+pageHeader("Campus Events","校园活动","发现并参与校园精彩活动。")+"<div class=\"evt-top\">"+timeHtml+typeHtml+myHtml+"</div><div class=\"evt-grid\">"+cardHtml+"</div></div>";refreshIcons()
}
function renderEvtDetail(){
  var e=DEMO_EVENTS.find(function(x){return x.id===state.evtDetail});if(!e){state.evtDetail="";render();return}
  var typeColors={讲座:"#8EA5B6",Workshop:"#A6B8A2","兴趣活动":"#D4C5A9","校外导师":"#C9BAA5","社团活动":"#D0B6B5","职业发展":"#C2B2A4","留学":"#B7AEC6","体育赛事":"#9DAAB9","志愿公益":"#A0B5A5"};
  var ec=typeColors[e.category]||"#8EA5B6",reg=e.registered_by_me;
  var related=DEMO_EVENTS.filter(function(r){return r.id!==e.id&&r.category===e.category}).slice(0,3);
  var relatedHtml="";if(related.length){relatedHtml="<div class=\"ed-related\"><h3>相关活动推荐</h3><div class=\"ed-related-scroll\">"+related.map(function(r){return"<div class=\"ed-related-card\" data-evt-id=\""+r.id+"\"><span class=\"evt-card-cat\" style=\"background:"+(typeColors[r.category]||"#8EA5B6")+"22;color:"+(typeColors[r.category]||"#8EA5B6")+"\">"+h(r.category)+"</span><strong>"+h(r.title)+"</strong><p>"+h(r.time)+"</p></div>"}).join("")+"</div></div>"}
  var speakerHtml="";if(e.speaker){speakerHtml="<div class=\"ed-section\"><h3>主讲人</h3><div class=\"ed-speaker\"><span class=\"ed-speaker-avatar\" style=\"background:"+ec+"\">"+h(e.speaker.slice(0,1))+"</span><div><strong>"+h(e.speaker)+"</strong><p>"+h(e.organizer)+"</p></div></div></div>"}
  var pct=Math.round((e.registered||0)/(e.capacity||100)*100);
  var html="<div class=\"ed-page\">";
  html+="<button class=\"detail-back\" data-evt-back>← "+(state.profileReturn?'返回个人主页':'返回活动列表')+"</button>";
  html+="<div class=\"ed-hero\" style=\"background:linear-gradient(180deg,"+ec+"26 0%,"+ec+"08 100%)\"><span class=\"ed-hero-cat\" style=\"background:"+ec+";color:#fff\">"+h(e.category)+"</span><h1>"+h(e.title)+"</h1><p class=\"ed-hero-org\"> "+h(e.organizer)+"</p></div>";
  html+="<div class=\"ed-sticky\"><span>⏰ "+h(e.time)+"</span><span>📍 "+h(e.location)+"</span><span>👥 "+(e.registered||0)+"/"+(e.capacity||0)+"人</span>"+(reg?"<span class=\"evt-registered\">✅ 已报名</span>":"<button class=\"evt-reg-btn\" data-evt-reg=\""+e.id+"\">立即报名</button>")+"</div>";
  html+="<div class=\"ed-body\">";
  html+="<div class=\"ed-section\"><h3>活动详情</h3><p>"+h(e.description)+"</p></div>";
  var catExtra="";
  if(e.category==="讲座"&&e.speaker)catExtra="<div class=\"ed-section\"><h3>主讲人简介</h3><p>"+h(e.speaker)+" · "+h(e.organizer)+"</p></div>";
  else if(e.category==="Workshop")catExtra="<div class=\"ed-section\"><h3>工作坊信息</h3><div class=\"ed-info-cards\"><div class=\"ed-info-card\"><span>引导师</span><strong>"+h(e.speaker||"待定")+"</strong></div><div class=\"ed-info-card\"><span>人数上限</span><strong>"+e.capacity+"人（小班制）</strong></div><div class=\"ed-info-card\"><span>适合人群</span><strong>零基础可参加</strong></div></div></div>";
  else if(e.category==="兴趣活动")catExtra="<div class=\"ed-section\"><h3>活动亮点</h3><p>✨ 现场指导 · 自由创作 · 作品展示 · 结识同好</p></div>";
  else if(e.category==="校外导师")catExtra="<div class=\"ed-section\"><h3>导师信息</h3><div class=\"ed-info-cards\"><div class=\"ed-info-card\"><span>导师姓名</span><strong>"+h(e.speaker||"多位导师")+"</strong></div><div class=\"ed-info-card\"><span>来自企业</span><strong>微软/德勤/字节等</strong></div><div class=\"ed-info-card\"><span>学生名额</span><strong>每位导师限8人</strong></div></div></div>";
  else if(e.category==="社团活动")catExtra="<div class=\"ed-section\"><h3>社团信息</h3><p>主办："+h(e.organizer)+" · 西浦130+注册社团之一</p></div>";
  else if(e.category==="职业发展")catExtra="<div class=\"ed-section\"><h3>参会须知</h3><div class=\"ed-info-cards\"><div class=\"ed-info-card\"><span>着装要求</span><strong>正装出席</strong></div><div class=\"ed-info-card\"><span>携带材料</span><strong>纸质简历×5</strong></div><div class=\"ed-info-card\"><span>企业名单</span><strong>30+名企</strong></div></div></div>";
  else if(e.category==="留学")catExtra="<div class=\"ed-section\"><h3>项目信息</h3><div class=\"ed-info-cards\"><div class=\"ed-info-card\"><span>合作院校</span><strong>G5+常春藤名校</strong></div><div class=\"ed-info-card\"><span>申请要求</span><strong>GPA 3.0+ · 雅思7.0</strong></div><div class=\"ed-info-card\"><span>经验分享</span><strong>5位校友到场</strong></div></div></div>";
  else if(e.category==="体育赛事")catExtra="<div class=\"ed-section\"><h3>赛制说明</h3><div class=\"ed-info-cards\"><div class=\"ed-info-card\"><span>赛制</span><strong>5v5淘汰赛</strong></div><div class=\"ed-info-card\"><span>组队</span><strong>专业/年级为单位</strong></div><div class=\"ed-info-card\"><span>晋级</span><strong>冠军晋级市赛</strong></div></div></div>";
  else if(e.category==="志愿公益")catExtra="<div class=\"ed-section\"><h3>公益认证</h3><div class=\"ed-info-cards\"><div class=\"ed-info-card\"><span>服务时长</span><strong>4-6小时</strong></div><div class=\"ed-info-card\"><span>工时认证</span><strong>官方认证志愿工时</strong></div><div class=\"ed-info-card\"><span>公益组织</span><strong>西浦青协/志工委</strong></div></div></div>";
  html+=catExtra;
  if(e.tags&&e.tags.length)html+="<div class=\"ed-section\"><h3>标签</h3><div class=\"ed-tags\">"+e.tags.map(function(t){return"<span class=\"ed-tag\">"+h(t)+"</span>"}).join("")+"</div></div>";
  html+=speakerHtml;
  html+="<div class=\"ed-section\"><h3>报名情况</h3><div class=\"ed-progress\"><div class=\"ed-progress-bar\"><div class=\"ed-progress-fill\" style=\"width:"+pct+"%;background:"+ec+"\"></div></div><span>"+pct+"% 已报满</span></div></div>";
  html+=relatedHtml;
  html+="</div></div>";
  $("view-root").innerHTML=html;refreshIcons()
}

/* ═══ ENHANCED OPPORTUNITIES ═══ */
function countdownDays(d){if(!d||d==='待定')return null;var m=d.match(/^(\d{4}-\d{2}-\d{2})/);if(!m)return null;return Math.ceil((new Date(m[1]+'T23:59:59+08:00')-new Date())/(86400000))}
function cdClass(d){if(d===null)return'safe';if(d<0)return'safe';if(d<=7)return'countdown';if(d<=21)return'warn';return'safe'}
function cdLabel(d){if(d===null)return'日期待定';if(d<0)return'已截止';if(d===0)return'今天截止';if(d===1)return'明天截止';return`剩余${d}天`}

function renderCompetitionBanner(items){var comps=UPCOMING_COMPETITIONS.filter(c=>{var d=countdownDays(c.deadline);return d!==null&&d>=0}).sort((a,b)=>(countdownDays(a.deadline)??999)-(countdownDays(b.deadline)??999));if(!comps.length)return'';return`<div class="comp-banner-section" id="comp-banner-section"><div class="banner-heading"><span class="live-dot"></span><h3><i data-lucide="trophy" style="width:14px;height:14px;vertical-align:middle;margin-right:3px"></i>近期比赛信息公示</h3><span style="font-size:11px;color:var(--ink-3);margin-left:auto">${comps.length}个赛事</span></div><div class="comp-banner-wrap"><button class="comp-scroll-arrow left" id="comp-scroll-left">◂</button><div class="comp-banner-scroll" id="comp-banner-scroll">${comps.map(c=>{var d=countdownDays(c.deadline),cls=cdClass(d),lbl=cdLabel(d),urg=d!==null&&d<=7;return`<div class="comp-banner-card" data-comp-id="${c.id}">${urg?'<div class="comp-ribbon urgent">即将截止</div>':''}<div class="comp-type">${h(c.type)}</div><div class="comp-title">${h(c.name)}</div><div class="comp-meta"><span>${h(c.org)}</span><span><i data-lucide="medal" style="width:12px;height:12px;vertical-align:middle"></i>${h(c.reward)}</span></div><div class="comp-deadline"><span><i data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle"></i>${h(c.deadline)}</span><span class="${cls}">${lbl}</span></div><div class="comp-tags">${(c.tags||[]).map(t=>`<span class="comp-tag">${h(t)}</span>`).join('')}</div></div>`}).join('')}</div><button class="comp-scroll-arrow right" id="comp-scroll-right">▸</button></div><div class="comp-scroll-dots" id="comp-scroll-dots">${comps.map((_,i)=>`<span class="comp-scroll-dot${i===0?' active':''}" data-dot="${i}"></span>`).join('')}</div></div>`}
function setupCompBannerScroll(){var scroll=$('comp-banner-scroll'),lb=$('comp-scroll-left'),rb=$('comp-scroll-right'),dots=document.querySelectorAll('.comp-scroll-dot');if(!scroll)return;var cards=scroll.querySelectorAll('.comp-banner-card'),cw=cards[0]?cards[0].offsetWidth+10:290;function ua(){if(!lb||!rb)return;var s=scroll.scrollLeft<=2,e=scroll.scrollLeft+scroll.clientWidth>=scroll.scrollWidth-2;lb.classList.toggle('visible',!s);rb.classList.toggle('visible',!e)}function ud(){if(!dots.length)return;var i=Math.round(scroll.scrollLeft/cw);dots.forEach((d,j)=>d.classList.toggle('active',j===i))}if(lb)lb.addEventListener('click',()=>{scroll.scrollBy({left:-cw*2,behavior:'smooth'})});if(rb)rb.addEventListener('click',()=>{scroll.scrollBy({left:cw*2,behavior:'smooth'})});dots.forEach(d=>d.addEventListener('click',()=>{scroll.scrollTo({left:parseInt(d.dataset.dot)*cw,behavior:'smooth'})}));var st;scroll.addEventListener('scroll',()=>{clearTimeout(st);st=setTimeout(()=>{ua();ud()},50)});var down=false,sx,ss,hm=false;scroll.addEventListener('mousedown',e=>{down=true;hm=false;sx=e.pageX-scroll.offsetLeft;ss=scroll.scrollLeft});scroll.addEventListener('mouseleave',()=>{down=false;scroll.classList.remove('dragging')});scroll.addEventListener('mouseup',()=>{down=false;scroll.classList.remove('dragging')});scroll.addEventListener('mousemove',e=>{if(!down)return;var x=e.pageX-scroll.offsetLeft,w=(x-sx)*1.5;if(!hm&&Math.abs(w)>4){hm=true;scroll.classList.add('dragging')}if(hm){e.preventDefault();scroll.scrollLeft=ss-w}});ua();ud();setTimeout(()=>{if(scroll.scrollLeft===0){scroll.scrollBy({left:60,behavior:'smooth'});setTimeout(()=>{scroll.scrollTo({left:0,behavior:'smooth'})},800)}},400)}

function renderCompDetail(){var c=UPCOMING_COMPETITIONS.find(x=>x.id===state.oppCompDetail);if(!c){state.oppCompDetail='';render();return}var d=countdownDays(c.deadline),cs=cdClass(d),cl=cdLabel(d);var htm=`<div class="detail-overlay"><button class="detail-back" data-comp-back>← 返回招募列表</button><div class="detail-hero"><div class="hero-badge-row"><span class="hero-badge cat"><i data-lucide="trophy" style="width:12px;height:12px;vertical-align:middle"></i>${h(c.type)}</span>${d!==null&&d<=7?'<span class="hero-badge mode" style="background:var(--red-soft);color:var(--red);font-weight:700">即将截止</span>':''}${c.tags?c.tags.map(t=>`<span class="hero-badge role">${h(t)}</span>`).join(''):''}</div><h2>${h(c.name)}</h2><div class="hero-stats"><span><strong>${h(c.org)}</strong></span><span><i data-lucide="calendar" style="width:13px;height:13px;vertical-align:middle"></i><strong>${h(c.deadline)}</strong><span class="${cs}" style="font-weight:700">${cl}</span></span></div></div><div class="detail-section"><h3><i data-lucide="book-open" style="width:16px;height:16px;vertical-align:middle"></i>赛事简介</h3><div style="font-size:13px;line-height:1.8;color:var(--ink-2)">${h(c.description)}</div></div>${c.topic?`<div class="detail-section"><h3><i data-lucide="target" style="width:16px;height:16px;vertical-align:middle"></i>赛事题目</h3><div style="font-size:13px;line-height:1.8;color:var(--ink-2)">${h(c.topic)}</div></div>`:''}<div class="detail-section"><h3><i data-lucide="calendar" style="width:16px;height:16px;vertical-align:middle"></i>时间安排与奖励</h3><div class="comp-info-grid">${c.schedule?`<div class="comp-info-item"><div class="ci-label">赛程安排</div><div class="ci-value">${h(c.schedule)}</div></div>`:''}<div class="comp-info-item"><div class="ci-label">奖励</div><div class="ci-value highlight">${h(c.reward)}</div></div>${c.fee?`<div class="comp-info-item"><div class="ci-label">费用</div><div class="ci-value">${h(c.fee)}</div></div>`:''}<div class="comp-info-item"><div class="ci-label"><i data-lucide="link" style="width:12px;height:12px;vertical-align:middle"></i>报名截止</div><div class="ci-value">${h(c.deadline)}<span class="${cs}" style="font-weight:700">${cl}</span></div></div></div></div>${c.req_cards?`<div class="detail-section"><h3><i data-lucide="check-circle" style="width:16px;height:16px;vertical-align:middle"></i>报名与参赛要求</h3><div class="req-cards">${c.req_cards.map(r=>`<div class="req-card"><span class="req-icon">${r.icon}</span><div class="req-body"><div class="req-label">${h(r.label)}</div><div class="req-text">${h(r.text)}</div></div></div>`).join('')}</div></div>`:''}${c.contact?`<div class="detail-section"><h3><i data-lucide="phone" style="width:16px;height:16px;vertical-align:middle"></i>校内联系方式</h3><div style="font-size:13px;color:var(--ink-2)">${h(c.contact)}</div></div>`:''}<div class="detail-actions"><a href="${h(c.registration_link)}" target="_blank" rel="noopener" class="btn primary"><i data-lucide="external-link" style="width:13px;height:13px;vertical-align:middle"></i>去官网报名</a><button class="btn ai" data-comp-publish="${c.id}"><i data-lucide="rocket" style="width:13px;height:13px;vertical-align:middle"></i>为此赛事发布组队招募</button></div></div>`;$('view-root').innerHTML=htm}

function renderProfProfile(){var p=PROFESSORS.find(x=>x.id===state.oppProfView);if(!p){state.oppProfView='';render();return}var htm=`<div class="detail-overlay"><button class="detail-back" data-prof-back>← ${state.oppProfFromDetail?'返回项目介绍':'返回招募列表'}</button><div class="detail-hero"><div class="hero-badge-row"><span class="hero-badge cat">${h(p.faculty)}</span><span class="hero-badge role">${h(p.title)}</span></div><div style="display:flex;align-items:center;gap:14px;margin-bottom:16px"><span style="display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--ink);color:var(--surface);font-size:20px;font-weight:700">${h(p.avatar)}</span><div><h2 style="margin:0">${h(p.name)}</h2><p style="color:var(--ink-3);font-size:12px">${h(p.education)}</p></div></div><div class="hero-summary">${h(p.statement)}</div></div><div class="detail-section"><h3><i data-lucide="microscope" style="width:16px;height:16px;vertical-align:middle"></i>研究方向</h3><div style="font-size:13px;line-height:1.7">${h(p.research)}</div></div><div class="detail-section"><h3><i data-lucide="file-text" style="width:16px;height:16px;vertical-align:middle"></i>近期论文</h3>${(p.papers||[]).map(pp=>`<div style="padding:10px 14px;background:var(--surface-soft);border-radius:8px;font-size:12px;margin-bottom:6px;border-left:3px solid var(--blue)">${h(pp)}</div>`).join('')}</div><div class="detail-section"><h3><i data-lucide="tags" style="width:16px;height:16px;vertical-align:middle"></i>研究标签</h3><div style="display:flex;flex-wrap:wrap;gap:6px">${(p.tags||[]).map(t=>`<span class="r-tag">${h(t)}</span>`).join('')}</div></div><div class="detail-actions"><a href="${h(p.xjtlu_url)}" target="_blank" rel="noopener" class="btn">西浦教师主页</a><button class="btn primary" data-prof-chat="${p.id}">与导师交流</button></div></div>`;$('view-root').innerHTML=htm}

function renderProfChat(){var p=PROFESSORS.find(x=>x.id===state.oppChatProf);if(!p){state.oppChatProf='';render();return}var k=state.oppChatProf;if(!CHAT_MESSAGES[k])CHAT_MESSAGES[k]=[{from:'prof',text:`你好！我是${p.name}，${p.title}。很高兴你对我的研究项目感兴趣。有什么问题想了解吗？`}];var msgs=CHAT_MESSAGES[k];var htm=`<div class="detail-overlay"><div class="chat-header"><button class="detail-back" data-chat-back>← ${state.oppChatFromDetail?'返回项目介绍':'返回导师主页'}</button><div style="display:flex;align-items:center;gap:10px"><span style="display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--ink);color:var(--surface);font-size:14px;font-weight:700">${h(p.avatar)}</span><div><strong style="font-size:14px">${h(p.name)}</strong><br><small style="font-size:11px;color:var(--ink-3)">${h(p.title)}·在线</small></div></div></div><div class="chat-messages" id="chat-messages">${msgs.map(m=>m.from==='prof'?`<div class="chat-bubble prof"><div class="bubble-text">${h(m.text)}</div></div>`:`<div class="chat-bubble self"><div class="bubble-text">${h(m.text)}</div></div>`).join('')}</div><form class="chat-form" id="chat-form"><textarea id="chat-input" placeholder="输入你的问题…" rows="1"></textarea><button type="submit" class="btn primary small">发送</button></form></div>`;$('view-root').innerHTML=htm;setTimeout(()=>{var el=$('chat-messages');if(el)el.scrollTop=el.scrollHeight},50)}
function sendChatMessage(){var inp=$('chat-input');if(!inp||!inp.value.trim())return;var txt=inp.value.trim(),k=state.oppChatProf;if(!CHAT_MESSAGES[k])return;CHAT_MESSAGES[k].push({from:'self',text:txt});setTimeout(()=>{var reply;if(txt.includes('加入')||txt.includes('参加'))reply='欢迎加入！可以把你的简历发送到我的邮箱。每周我会安排一次1对1交流。';else if(txt.includes('时间')||txt.includes('投入'))reply='研究项目的时间投入比较灵活，通常每周10-15小时。学期中和假期都可安排。';else if(txt.includes('基础')||txt.includes('要求'))reply='不要求你已经有很深的科研经验。课题组注重培养——只要你有基本的学习能力和好奇心。';else if(txt.includes('论文')||txt.includes('发表'))reply='参与研究的同学通常经过1-2个学期的积累就可以开始合作写论文。';else reply='这是个好问题！更具体的我们可以私下交流。你可以先来我办公室面聊，或发送邮件预约线上交流。';CHAT_MESSAGES[k].push({from:'prof',text:reply});render();setTimeout(()=>{var el=$('chat-messages');if(el)el.scrollTop=el.scrollHeight},50)},600);render();setTimeout(()=>{var el=$('chat-messages');if(el)el.scrollTop=el.scrollHeight},50)}

function renderAICComposer(){if(state.oppAI){var htm=`<div class="ai-composer-modal"><textarea id="ai-input" placeholder="描述你想要的队友或项目…">${h(state.oppAIText)}</textarea><div class="ai-composer-actions"><button class="btn small" id="ai-generate"${state.oppAIGenerating?' disabled':''}>${state.oppAIGenerating?'生成中…':'AI 智能解析'}</button><button class="btn small" id="ai-cancel">取消</button>${state.oppAIPreview?'<button class="btn primary small" id="ai-publish" style="margin-left:auto">立即发布</button>':''}</div>`;if(state.oppAIPreview){var p=state.oppAIPreview;htm+=`<div class="ai-preview-card"><div class="row"><span class="label">标题</span>${h(p.title)}</div><div class="row"><span class="label">分类</span>${h(p.category_label)}·${h(p.sub_category)}</div><div class="row"><span class="label">角色</span>${h(p.role_type)}·${h(p.collab_mode)}</div><div class="row"><span class="label">技能</span>${(p.skills||[]).map(s=>`<span class="pill">${h(s)}</span>`).join('')}</div></div>`}htm+='</div>';return htm}return`<div class="ai-composer-trigger" id="ai-open"><span class="ai-icon"><i data-lucide="bot" style="width:21px;height:21px"></i></span><div class="ai-text"><strong>AI智能发布</strong><span>口述需求，AI自动补全分类、标签和能力画像</span></div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></div>`}

function renderFlashCard(item){var app=item.my_application,prof=item.initiator_profile||{},tgs=prof.collab_tags||[],sc=item.match_score||0,ao=state.oppActiveApply===item.id,go=state.oppActiveGreet===item.id;return`<article class="flash-card cat-${item.category||'project'}"><div class="flash-card-header" data-opp-detail="${item.id}"><div class="flash-category-badge"><span class="cat-icon"><i data-lucide="${CAT_ICONS[item.category]||'rocket'}" style="width:20px;height:20px"></i></span><span class="cat-label">${h(item.sub_category||'')}</span></div><div class="flash-body"><h3 class="flash-title">${h(item.title)}</h3>${item.ai_summary?`<p class="flash-ai-summary"><i data-lucide="sparkles" style="width:13px;height:13px;vertical-align:middle"></i>${h(item.ai_summary)}</p>`:''}<div class="flash-tags"><span class="flash-tag role">${h(item.role_type||'')}</span><span class="flash-tag mode">${h(item.collab_mode||'')}</span>${(item.skills||[]).slice(0,4).map(s=>`<span class="flash-tag">${h(s)}</span>`).join('')}</div><div class="flash-stats"><span><i data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle"></i>截止${h(item.deadline||'待定')}</span><span><i data-lucide="users" style="width:12px;height:12px;vertical-align:middle"></i>${item.applications_count||0}/${item.capacity||0}人</span>${item.match_reason?`<span><i data-lucide="bar-chart" style="width:12px;height:12px;vertical-align:middle"></i>${h(item.match_reason)}</span>`:''}</div></div></div><div class="flash-initiator" data-opp-detail="${item.id}"><span class="initiator-avatar">${h((item.owner||'').slice(0,2))}</span><div class="initiator-info"><div class="initiator-name">${h(item.owner||'')}</div>${tgs.length?`<div class="initiator-tags">${tgs.map(t=>`<span class="initiator-tag">${h(t)}</span>`).join('')}</div>`:''}</div><div class="match-inline"><div class="match-ring-sm" data-score="${sc}"><div class="ring-bg"></div><div class="ring-fill" style="--pct:${sc}"></div></div><span class="match-label">匹配度</span></div></div><div class="flash-actions">${app?`<span class="status-badge ${app.status||'pending'}">${app.status==='accepted'?'<i data-lucide="check-circle" style="width:13px;height:13px;vertical-align:middle"></i>已通过':app.status==='rejected'?'<i data-lucide="x-circle" style="width:13px;height:13px;vertical-align:middle"></i>未通过':'<i data-lucide="hourglass" style="width:13px;height:13px;vertical-align:middle"></i>申请中'}</span>`:`<div class="flash-buttons"><button class="btn ai" data-opp-greet="${item.id}"><i data-lucide="handshake" style="width:13px;height:13px;vertical-align:middle"></i>AI打招呼</button><button class="btn primary" data-opp-apply="${item.id}">立即组队</button></div>`}</div>${go?`<div class="ai-greet-panel"><div class="greet-text"><strong><i data-lucide="bot" style="width:13px;height:13px;vertical-align:middle"></i>AI自动生成招呼语：</strong><br>你好！我对「${h(item.title?.slice(0,25)||'')}」非常感兴趣。希望有机会进一步沟通！</div><div class="greet-actions"><button class="btn small" data-opp-greet-close="${item.id}">修改</button><button class="btn primary small" data-opp-greet-send="${item.id}"><i data-lucide="send" style="width:13px;height:13px;vertical-align:middle"></i>一键发送</button></div></div>`:''}${ao?`<div class="flash-apply-form"><form data-opp-apply-form="${item.id}"><textarea maxlength="600" rows="2" placeholder="简要说明你的相关经验或可投入时间…"></textarea><div class="apply-actions"><button class="btn small" type="button" data-opp-cancel="${item.id}">取消</button><button class="btn primary small" type="submit"><i data-lucide="send" style="width:13px;height:13px;vertical-align:middle"></i>提交申请</button></div></form></div>`:''}</article>`}

function renderOppDetail(){var item=DEMO_OPPORTUNITIES.find(i=>i.id===state.oppActiveDetail);if(!item){state.oppActiveDetail='';render();return}var prof=item.initiator_profile||{},mems=item.team_members||[],rec=item.recruit_profile||{},sc=item.match_score||0,ci=CAT_ICONS[item.category]||'rocket',go=state.oppActiveGreet===item.id;var lp=item.category==='research'?PROFESSORS.find(p=>item.owner&&item.owner.includes(p.name.slice(0,2))||(item.owner||'').includes(p.name)):null;var htm=`<div class="detail-overlay"><button class="detail-back" data-opp-back>← ${state.profileReturn?'返回个人主页':'返回招募列表'}</button><div class="detail-hero"><div class="hero-badge-row"><span class="hero-badge cat"><i data-lucide="${ci}" style="width:12px;height:12px;vertical-align:middle"></i>${h(item.sub_category||'')}</span><span class="hero-badge role">${h(item.role_type||'')}</span><span class="hero-badge mode">${h(item.collab_mode||'')}</span>${lp?'<span class="hero-badge" style="background:var(--amber-soft);color:var(--amber);font-weight:600">导师项目</span>':''}</div><h2>${h(item.title)}</h2><div class="hero-summary">${h(item.detail_description||item.ai_summary||'')}</div>${item.category==='research'?`<div class="hero-summary" style="border-left-color:var(--green);margin-top:8px"><strong>研究方向：</strong>${h(item.sub_category==='AI/机器学习'?'大语言模型/NLP/计算机视觉':item.sub_category||'待确认')}<br><strong><i data-lucide="target" style="width:13px;height:13px;vertical-align:middle"></i>研究目标：</strong>${h(item.sub_category==='AI/机器学习'?'发表顶会论文/建立复现基准/培养独立科研能力':'完成研究课题/撰写学术论文')}</div>`:''}<div class="hero-stats"><span><i data-lucide="calendar" style="width:13px;height:13px;vertical-align:middle"></i>截止<strong>${h(item.deadline||'待定')}</strong></span><span><i data-lucide="users" style="width:13px;height:13px;vertical-align:middle"></i>已申请<strong>${item.applications_count||0}/${item.capacity||0}</strong>人</span><span><i data-lucide="link" style="width:13px;height:13px;vertical-align:middle"></i>发起者<strong>${h(item.owner||'')}</strong>${lp?`<button data-prof-view="${lp.id}" style="margin-left:6px;padding:2px 8px;border:1px solid var(--blue);border-radius:5px;background:var(--blue-soft);color:var(--blue);font-size:10px;cursor:pointer;font-weight:600">查看导师简介→</button>`:''}</span>${item.match_reason?`<span><i data-lucide="bar-chart" style="width:13px;height:13px;vertical-align:middle"></i>${h(item.match_reason)}</span>`:''}</div></div>${lp?`<div class="detail-section" style="border:1.5px solid var(--amber);background:var(--amber-soft)"><h3><i data-lucide="graduation-cap" style="width:16px;height:16px;vertical-align:middle"></i>项目导师—${h(lp.name)}</h3><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><span style="display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--ink);color:var(--surface);font-size:17px;font-weight:700">${h(lp.avatar)}</span><div><strong style="font-size:14px">${h(lp.title)}</strong><br><span style="font-size:12px;color:var(--ink-2)">${h(lp.research)}</span></div></div><div style="display:flex;gap:8px;margin-top:8px"><button class="btn small" data-prof-view="${lp.id}"><i data-lucide="clipboard-list" style="width:13px;height:13px;vertical-align:middle"></i>完整导师简介</button><button class="btn primary small" data-prof-chat="${lp.id}"><i data-lucide="message-circle" style="width:13px;height:13px;vertical-align:middle"></i>与导师私聊</button></div></div>`:''}<div class="detail-section"><h3><i data-lucide="users" style="width:16px;height:16px;vertical-align:middle"></i>现有队员（${mems.length}人）</h3><div class="member-grid">${mems.map(m=>`<div class="member-card"><span class="member-avatar">${h(m.avatar||'')}</span><div class="member-info"><div class="m-name">${h(m.name||'')}</div><div class="m-role">${h(m.role||'')}</div><div class="m-skills">${(m.skills||[]).map(s=>`<span class="m-skill">${h(s)}</span>`).join('')}</div></div><span class="member-style-tag">${h(m.style||'')}</span></div>`).join('')}</div></div><div class="detail-section"><h3><i data-lucide="target" style="width:16px;height:16px;vertical-align:middle"></i>希望招募的队员</h3><div class="recruit-grid"><div class="recruit-item"><label>所需技能</label><div>${(rec.required_skills||[]).map(s=>`<span class="r-tag">${h(s)}</span>`).join('')}</div></div><div class="recruit-item"><label>优先条件</label><div style="font-size:13px">${h(rec.preferred_experience||'不限')}</div></div><div class="recruit-item"><label>时间投入</label><div style="font-size:13px">${h(rec.weekly_commitment||'灵活安排')}</div></div><div class="recruit-item"><label>匹配期望</label><div style="font-size:13px">${h(rec.team_fit||'希望找到志同道合的伙伴')}</div></div></div></div><div class="detail-section"><h3><i data-lucide="handshake" style="width:16px;height:16px;vertical-align:middle"></i>团队氛围</h3><div class="culture-banner"><span class="culture-emoji">${(item.team_culture||'').slice(0,2)||'<i data-lucide="handshake" style="width:26px;height:26px;vertical-align:middle"></i>'}</span><span class="culture-text">${h(item.team_culture||'期待与你相识')}</span></div></div><div class="detail-actions"><div class="match-inline" style="margin-right:auto"><div class="match-ring-sm" data-score="${sc}"><div class="ring-bg"></div><div class="ring-fill" style="--pct:${sc}"></div></div><span class="match-label">匹配度</span></div>${item.my_application?`<span class="status-badge ${item.my_application.status||'pending'}">${item.my_application.status==='accepted'?'<i data-lucide="check-circle" style="width:13px;height:13px;vertical-align:middle"></i>已通过':'<i data-lucide="hourglass" style="width:13px;height:13px;vertical-align:middle"></i>申请中'}</span>`:`<button class="btn ai" data-opp-greet="${item.id}"><i data-lucide="handshake" style="width:13px;height:13px;vertical-align:middle"></i>AI打招呼</button><button class="btn primary" data-opp-apply="${item.id}">立即组队</button>`}</div>${go?`<div class="detail-section ai-greet-panel" style="margin-top:14px"><div class="greet-text"><strong><i data-lucide="bot" style="width:13px;height:13px;vertical-align:middle"></i>AI自动生成招呼语：</strong><br>你好！我对「${h(item.title?.slice(0,25)||'')}」非常感兴趣。希望加入你们的团队！</div><div class="greet-actions"><button class="btn small" data-opp-greet-close-detail>关闭</button><button class="btn primary small" data-opp-greet-send-detail="${item.id}"><i data-lucide="send" style="width:13px;height:13px;vertical-align:middle"></i>一键发送</button></div></div>`:''}</div>`;$('view-root').innerHTML=htm}

function renderPublishModal(){var f=state.publishForm;var htm=`<div class="publish-overlay" id="publish-overlay"><div class="publish-modal"><div class="publish-modal-header"><h2>发布组队招募</h2><button class="publish-close" data-opp-publish-close>✕</button></div><div class="publish-body"><div class="form-group"><label>招募标题<span class="req">*</span></label><input id="pf-title" value="${h(f.title)}" maxlength="80"></div><div class="form-row"><div class="form-group"><label>一级分类<span class="req">*</span></label><select id="pf-category">${OPP_CATEGORIES.filter(c=>c.id!=='all').map(c=>`<option value="${c.id}"${f.category===c.id?' selected':''}>${c.label}</option>`).join('')}</select></div><div class="form-group"><label>二级分类</label><select id="pf-subcat">${(SUB_CATEGORIES[f.category]||[]).map(s=>`<option value="${s}"${f.sub_category===s?' selected':''}>${s}</option>`).join('')}</select></div></div><div class="form-row"><div class="form-group"><label>招募角色<span class="req">*</span></label><select id="pf-role">${ROLE_TYPES.map(r=>`<option value="${r}"${f.role_type===r?' selected':''}>${r}</option>`).join('')}</select></div><div class="form-group"><label>协作模式<span class="req">*</span></label><select id="pf-mode">${COLLAB_MODES.map(m=>`<option value="${m}"${f.collab_mode===m?' selected':''}>${m}</option>`).join('')}</select></div></div><div class="form-group"><label>项目介绍<span class="req">*</span></label><textarea id="pf-desc" maxlength="500">${h(f.description)}</textarea></div><div class="form-group"><label>所需技能</label><div class="tag-input-wrap" id="pf-skills-wrap">${f.skills.map((s,i)=>`<span class="chip">${h(s)}<button data-pf="skill-remove" data-idx="${i}">✕</button></span>`).join('')}<input id="pf-skills-input" placeholder="输入技能后回车添加" maxlength="20"></div></div><div class="form-row"><div class="form-group"><label>截止日期</label><input type="date" id="pf-deadline" value="${h(f.deadline)}"></div><div class="form-group"><label>招募人数<span class="req">*</span></label><input type="number" id="pf-capacity" value="${f.capacity}" min="1" max="50"></div></div><div class="form-group"><label>优先条件</label><input id="pf-preferred" value="${h(f.preferred)}" maxlength="80"></div><div class="form-group"><label>时间投入</label><input id="pf-commitment" value="${h(f.commitment)}" maxlength="80"></div><div class="form-group"><label>团队氛围</label><textarea id="pf-teamfit" maxlength="200">${h(f.team_fit)}</textarea></div></div><div class="publish-footer"><button class="btn small" data-opp-publish-cancel>取消</button><button class="btn primary" data-opp-publish-submit>🚀发布招募</button></div></div></div>`;$('publish-modal').innerHTML=htm;$('publish-modal').style.display='block'}
function syncPF(){var f=state.publishForm,el;el=$('pf-title');if(el)f.title=el.value;el=$('pf-category');if(el)f.category=el.value;el=$('pf-subcat');if(el)f.sub_category=el.value;el=$('pf-role');if(el)f.role_type=el.value;el=$('pf-mode');if(el)f.collab_mode=el.value;el=$('pf-desc');if(el)f.description=el.value;el=$('pf-deadline');if(el)f.deadline=el.value;el=$('pf-capacity');if(el)f.capacity=parseInt(el.value)||3;el=$('pf-preferred');if(el)f.preferred=el.value;el=$('pf-commitment');if(el)f.commitment=el.value;el=$('pf-teamfit');if(el)f.team_fit=el.value}
function submitPublish(){syncPF();var f=state.publishForm;if(!f.title.trim())return toast('请填写标题','error');if(!f.description.trim())return toast('请填写介绍','error');if(!f.skills.length)return toast('请添加技能','error');DEMO_OPPORTUNITIES.unshift({id:'opp_new_'+Date.now(),title:f.title,kind:'项目招募',category:f.category,sub_category:f.sub_category||(SUB_CATEGORIES[f.category]||[])[0]||'',role_type:f.role_type,collab_mode:f.collab_mode,ai_summary:'用户自主发布。',detail_description:f.description,skills:f.skills,tags:[f.sub_category||''].filter(Boolean),deadline:f.deadline||'待定',capacity:f.capacity,applications_count:0,owner:'你',initiator_profile:{collab_tags:[],bio:''},match_score:0,match_reason:'新发布招募',my_application:null,team_members:f.members.filter(m=>m.name.trim()).map(m=>({name:m.name,role:m.role||'队员',skills:(m.skills||'').split(/[,，]/).map(s=>s.trim()).filter(Boolean),style:m.style||'团队成员',avatar:m.name.slice(0,1)})),recruit_profile:{required_skills:f.skills,preferred_experience:f.preferred||'不限',weekly_commitment:f.commitment||'灵活安排',team_fit:f.team_fit||'希望找到志同道合的伙伴'},team_culture:f.team_fit||'期待你的加入'});state.publishForm={title:'',category:'competition',sub_category:'',role_type:'核心成员',collab_mode:'冲刺型',description:'',skills:[],deadline:'',capacity:3,members:[{name:'',role:'',skills:'',style:''}],preferred:'',commitment:'',team_fit:''};state.oppShowPublish=false;render();toast('招募已发布！')}

function renderOpportunities(){
  if(state.oppCompDetail){renderCompDetail();return}if(state.oppProfView){renderProfProfile();return}if(state.oppChatProf){renderProfChat();return}if(state.oppActiveDetail){renderOppDetail();return}
  var items=filteredOpps(),htm='';
  htm+=pageHeader('Teams & Projects','组队招募','极致分类+AI预筛选，找到最契合的队友。支持赛事经纬、学术共研、项目实战、体育联盟四大场景。');
  htm+=`<div class="page-toolbar"><button class="publish-btn-top" style="margin-left:auto" data-opp-publish-btn>＋ 发布招募</button></div>`;
  htm+=`<div class="opp-search-bar"><span class="search-icon-wrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span><input id="opp-search-input" type="search" placeholder="搜索招募：标题、技能、标签…例：互联网+、Python" value="${h(state.oppSearch)}"><button class="search-clear${state.oppSearch?' visible':''}" id="opp-search-clear">✕</button></div>`;
  if(state.oppSearch)htm+=`<div class="opp-search-hint">搜索"${h(state.oppSearch)}"—找到${items.length}条<span data-opp-search-clear>清除</span></div>`;
  htm+=renderCompetitionBanner(items);
  htm+=`<div class="category-tabs">${OPP_CATEGORIES.map(c=>`<button class="category-tab${state.oppCat===c.id?' active':''}" data-opp-cat="${c.id}">${c.label}</button>`).join('')}</div>`;
  if(state.oppCat!=='all'&&SUB_CATEGORIES[state.oppCat])htm+=`<div class="sub-tag-cloud"><button class="sub-tag${state.oppSub==='all'?' active':''}" data-opp-sub="all">全部</button>${SUB_CATEGORIES[state.oppCat].map(s=>`<button class="sub-tag${state.oppSub===s?' active':''}" data-opp-sub="${s}">${s}</button>`).join('')}</div>`;
  htm+=`<div class="filter-bar-enhanced"><span class="filter-label">角色</span><div class="filter-pills"><button class="filter-pill${state.oppRole==='all'?' active':''}" data-opp-role="all">不限</button>${ROLE_TYPES.map(r=>`<button class="filter-pill${state.oppRole===r?' active':''}" data-opp-role="${r}">${r}</button>`).join('')}</div><span class="filter-divider"></span><span class="filter-label">协作</span><div class="filter-pills"><button class="filter-pill${state.oppMode==='all'?' active':''}" data-opp-mode="all">不限</button>${COLLAB_MODES.map(m=>`<button class="filter-pill${state.oppMode===m?' active':''}" data-opp-mode="${m}">${m}</button>`).join('')}</div><span class="filter-count">${items.length}个招募</span></div>`;
  htm+=renderAICComposer();
  htm+='<div class="flash-list">';
  if(!items.length)htm+=`<div class="flash-empty"><div class="empty-icon"><i data-lucide="search" style="width:28px;height:28px"></i></div><strong>当前条件下暂无招募</strong><span>试试调整分类、角色或协作模式</span></div>`;
  else htm+=items.map(item=>renderFlashCard(item)).join('');
  htm+='</div>';
  $('view-root').innerHTML=htm;setupCompBannerScroll();if(state.oppShowPublish)renderPublishModal();refreshIcons()
}

/* ═══ EVENT HANDLERS ═══ */
document.addEventListener('click',e=>{
  if(e.target.closest('#theme-toggle')){var r=document.documentElement,d=r.dataset.theme==='dark';r.dataset.theme=d?'light':'dark';var ic=document.querySelector('#theme-toggle i');if(ic)ic.setAttribute('data-lucide',d?'moon':'sun');refreshIcons();return}
  // ── Language Toggle ──
  if(e.target.closest('#lang-toggle')){toggleLang();return}
  // ── Profile 下拉菜单 ──
  if(e.target.closest('#top-avatar-btn')){state.profileMenuOpen=!state.profileMenuOpen;if(state.profileMenuOpen)renderProfileMenu();else closeProfileMenu();return}
  if(e.target.closest('.top-avatar-wrap')&&e.target.closest('[data-profile-menu-item]')){var pmi=e.target.closest('[data-profile-menu-item]');var pr=pmi.dataset.menuRoute,pt=parseInt(pmi.dataset.menuTab);closeProfileMenu();if(pr){state.profileTab=pt>=0?pt:0;routeTo(pr)}else{toast('已退出登录（Demo）')}return}
  if(state.profileMenuOpen&&!e.target.closest('.top-avatar-wrap')){closeProfileMenu();return}
  // ── Profile 页内交互 ──
  if(e.target.closest('[data-profile-tab]')){state.profileTab=parseInt(e.target.closest('[data-profile-tab]').dataset.profileTab);render();return}
  if(e.target.closest('[data-my-posts-filter]')){state.myPostsFilter=e.target.closest('[data-my-posts-filter]').dataset.myPostsFilter;render();return}
  if(e.target.closest('[data-fav-type-filter]')){state.favTypeFilter=e.target.closest('[data-fav-type-filter]').dataset.favTypeFilter;render();return}
  if(e.target.closest('[data-edit-profile]')){state.editProfileModal=true;renderEditProfileModal();return}
  if(e.target.closest('[data-edit-close]')||e.target.id==='edit-profile-overlay'){var epo=document.getElementById('edit-profile-overlay');if(epo)epo.remove();state.editProfileModal=false;return}
  if(e.target.closest('[data-edit-save]')){saveEditProfile();return}
  if(e.target.closest('[data-verify-open]')){state.verifyModal=true;state.verifyStep=1;renderVerifyModal();return}
  if(e.target.closest('[data-verify-close]')||e.target.id==='verify-modal-overlay'){var vmo=document.getElementById('verify-modal-overlay');if(vmo)vmo.remove();state.verifyModal=false;return}
  if(e.target.closest('[data-verify-role]')){var vr=e.target.closest('[data-verify-role]');var role=vr.dataset.verifyRole;state.verifyForm.role=role;document.querySelectorAll('[data-verify-role]').forEach(function(x){x.classList.toggle('is-active',x.dataset.verifyRole===role)});refreshIcons();return}
  if(e.target.closest('[data-verify-submit]')){submitVerify();return}
  if(e.target.closest('[data-verify-simulate]')){ME_PROFILE.verifyState='verified';state.verifyStep=1;state.verifyModal=false;var vmo2=document.getElementById('verify-modal-overlay');if(vmo2)vmo2.remove();toast('✅ 认证已通过！你的主页将展示校内身份标识');render();return}
  if(e.target.closest('[data-resume-default]')){var rd=e.target.closest('[data-resume-default]').dataset.resumeDefault;state.resumeDefaultId=rd;toast('已设为默认简历');render();return}
  if(e.target.closest('[data-resume-del]')){var rdel=e.target.closest('[data-resume-del]').dataset.resumeDel;if(state.resumes.length<=1)return toast('至少保留一份简历','error');state.resumes=state.resumes.filter(function(x){return x.id!==rdel});if(state.resumeDefaultId===rdel)state.resumeDefaultId=state.resumes[0].id;toast('简历已删除');render();return}
  if(e.target.closest('[data-resume-add]')){var nid='rv'+(state.resumes.length+1)+'_'+Date.now();state.resumes.push({id:nid,name:'新建简历 · 版本 '+(state.resumes.length+1),target:'未关联目标',updated:new Date().toISOString().slice(0,10),status:'draft',highlights:[]});state.resumeDefaultId=state.resumes[0].id;toast('已新建简历草稿');render();return}
  if(e.target.closest('[data-home-default]')){state.homeDefault=e.target.closest('[data-home-default]').dataset.homeDefault;toast('默认主页已更新');render();return}
  if(e.target.closest('[data-privacy-toggle]')){var pto=e.target.closest('[data-privacy-toggle]');state.privacyPrefs[pto.dataset.privacyToggle]=pto.checked;toast(pto.checked?'已公开':'已设为私密');return}
  // Profile → 详情跳转（记录返回）
  if(e.target.closest('[data-profile-open-post]')){var poid=e.target.closest('[data-profile-open-post]').dataset.profileOpenPost;var po=state.posts.find(x=>x.id===poid);if(po){state.selectedPost=po;state.route='detail';state.profileReturn=true;state.feedScrollY=window.scrollY;render();window.scrollTo({top:0})}return}
  if(e.target.closest('[data-profile-open-qa]')){var pqid=e.target.closest('[data-profile-open-qa]').dataset.profileOpenQa;state.qaDetail=pqid;state.route='qa';state.profileReturn=true;render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-profile-open-res]')){var prid=e.target.closest('[data-profile-open-res]').dataset.profileOpenRes;state.resDetail=prid;state.route='resource-detail';state.qaFrom='profile';state.profileReturn=true;render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-profile-open-evt]')){var peid=e.target.closest('[data-profile-open-evt]').dataset.profileOpenEvt;state.route='events';state.evtDetail=peid;state.profileReturn=true;render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-profile-open-opp]')){var popp=e.target.closest('[data-profile-open-opp]').dataset.profileOpenOpp;state.route='opportunities';state.oppActiveDetail=popp;state.profileReturn=true;render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-profile-open-teacher]')){var ptid=e.target.closest('[data-profile-open-teacher]').dataset.profileOpenTeacher;state.route='teachers';state.teacherDetail=ptid;state.teacherFrom='';state.profileReturn=true;render();window.scrollTo({top:0});return}
  // Right rail hot module
  var hotEl=e.target.closest('[data-hot-open]');if(hotEl){var hk=hotEl.dataset.hotOpen,hi=hotEl.dataset.hotId;
    if(hk==='evt'){state.route='events';state.evtDetail=hi;render();window.scrollTo({top:0})}
    else if(hk==='post'){var hp=state.posts.find(function(x){return x.id===hi});if(hp){state.selectedPost=hp;state.route='detail';state.feedScrollY=window.scrollY;render();requestAnimationFrame(function(){var el=$('view-root');if(el)el.scrollIntoView({behavior:'instant',block:'start'})})}}
    else if(hk==='qa'){state.qaDetail=hi;state.route='qa';render();window.scrollTo({top:0})}
    else if(hk==='recruit'){state.route='teachers';state.recruitDetail=hi;render();renderRecruitModal()}
    else if(hk==='notif'){state.route='notifications';render()}
    return}
  if(e.target.closest('[data-hot-tab]')){state.hotTab=e.target.closest('[data-hot-tab]').dataset.hotTab;state.hotTick=0;renderHotRail();return}
  if(e.target.closest('[data-hot-more]')||e.target.closest('[data-hot-cal-more]')){routeTo('events');return}
  // Poster carousel
  if(e.target.closest('[data-poster-arrow]')){var pa=e.target.closest('[data-poster-arrow]').dataset.posterArrow;if(pa==='prev')posterPrev();else posterNext();posterStopAuto();posterResumeAuto();return}
  if(e.target.closest('[data-poster-dot]')){var pi=parseInt(e.target.closest('[data-poster-dot]').dataset.posterDot);posterGoTo(pi);posterStopAuto();posterResumeAuto();return}
  var pEl=e.target.closest('[data-poster-open]');if(pEl){var pk=pEl.dataset.posterOpen,pid=pEl.dataset.posterId;
    if(pk==='evt'){state.route='events';state.evtDetail=pid;render();window.scrollTo({top:0})}
    else if(pk==='post'){var pp=state.posts.find(function(x){return x.id===pid});if(pp){state.selectedPost=pp;state.route='detail';state.feedScrollY=window.scrollY;render();requestAnimationFrame(function(){var el=$('view-root');if(el)el.scrollIntoView({behavior:'instant',block:'start'})})}}
    else if(pk==='res'){state.resDetail=pid;state.route='resource-detail';state.qaFrom='';render();window.scrollTo({top:0})}
    else if(pk==='qa'){state.qaDetail=pid;state.route='qa';render();window.scrollTo({top:0})}
    else if(pk==='recruit'){state.route='teachers';state.recruitDetail=pid;render();renderRecruitModal()}
    else if(pk==='notif'){state.route='notifications';render()}
    else if(pk==='guide-res'){state.route='resources';render()}
    else if(pk==='guide-feed'){state.route='feed';render()}
    else if(pk==='guide-evt'){state.route='events';render()}
    return}
  var rt=e.target.closest('[data-route]');if(rt&&!e.target.closest('button[data-opp-greet],button[data-opp-apply],button[data-evt-reg],button[data-evt-cancel]')){routeTo(rt.dataset.route);return}
  // Sidebar self profile
  if(e.target.closest('#sidebar-profile-btn')){state.profileUser={id:'me',name:'张三',bio:'计算机科学·大三 | 喜欢AI和开源 | 竞赛选手'};state.feedScrollY=window.scrollY;render();return}
  // Feed
  if(e.target.closest('#sidebar-compose')){state.route='feed';state.profileUser=null;state.selectedPost=null;state.composing=true;state.composerText='';state.composerTitle='';state.composerTags='';state.composerAnonymous=false;state.composeMedia=[];render();window.scrollTo({top:0});return}
  if(e.target.closest('#sidebar-ai-chat')){openAiChat();return}
  if(e.target.closest('#expand-composer')){state.composing=true;state.composerText='';state.composerTitle='';state.composerTags='';state.composerAnonymous=false;render();return}
  if(e.target.closest('#expand-treehole-composer')){state.treeholeComposing=true;state.treeholeText='';render();return}
  if(e.target.closest('[data-add-tag]')){var tg=e.target.closest('[data-add-tag]').dataset.addTag;var cur=state.composerTags||'';state.composerTags=cur?cur+', '+tg:tg;render();setTimeout(()=>{var inp=$('compose-tags');if(inp){inp.focus();inp.selectionStart=inp.value.length}},50);return}
  if(e.target.closest('[data-close-compose]')){state.composing=false;render();return}
  if(e.target.closest('[data-close-treehole-compose]')){state.treeholeComposing=false;state.treeholeText='';state.composeMedia=[];render();return}
  if(e.target.closest('#submit-compose')){var tt=state.composerTitle||'',ct=state.composerText.trim();if(!ct)return;var tags=(state.composerTags||'').split(/[,，\s]+/).filter(Boolean);var newMedia=(state.composeMedia||[]).map(function(m){return{name:m.name,type:m.type,url:m.preview}});state.posts.unshift({id:'new_'+Date.now(),title:tt,content:ct,section:state.composerSection,anonymous:state.composerAnonymous,time:new Date().toISOString().slice(0,16).replace('T',' '),likes:0,comments_count:0,tags:tags,media:newMedia,liked:false,collected:false});state.composing=false;state.composerText='';state.composerTitle='';state.composerTags='';state.composerAnonymous=false;state.composeMedia=[];apiWrite('/api/community/posts',{title:tt,content:ct,section:state.composerSection,anonymous:state.composerAnonymous,tags:tags,media:newMedia});toast('话题已发布');render();return}
  if(e.target.closest('#submit-treehole-compose')){var thc=state.treeholeText.trim();if(!thc)return;var thMedia=(state.composeMedia||[]).map(function(m){return{name:m.name,type:m.type,url:m.preview}});state.treeholes.unshift({id:'newt_'+Date.now(),content:thc,time:new Date().toISOString().slice(0,16).replace('T',' '),author:'匿名同学',anonymous:true,likes:0,liked:false,comments:[],comments_count:0,tags:[],media:thMedia});state.treeholeText='';state.treeholeComposing=false;state.composeMedia=[];apiWrite('/api/treehole/posts?content='+encodeURIComponent(thc));toast('已投进树洞');render();return}
  if(e.target.closest('#compose-media-zone')){var inp=$('compose-media-input');if(inp)inp.click();return}
  if(e.target.closest('#compose-media-input')){var files=e.target.files;if(files&&files.length){for(var fi=0;fi<files.length&&(state.composeMedia||[]).length<9;fi++){var file=files[fi];state.composeMedia.push({name:file.name,size:file.size,type:file.type.startsWith('video')?'video':'image',preview:URL.createObjectURL(file)})}render()}return}
  if(e.target.closest('[data-media-remove]')){var idx=parseInt(e.target.closest('[data-media-remove]').dataset.mediaRemove);state.composeMedia.splice(idx,1);render();return}
  // Treehole media upload
  if(e.target.closest('#th-media-zone')){var thi=$('th-media-input');if(thi)thi.click();return}
  if(e.target.closest('#th-media-input')){var thfiles=e.target.files;if(thfiles&&thfiles.length){for(var tfi=0;tfi<thfiles.length&&(state.composeMedia||[]).length<9;tfi++){var tfile=thfiles[tfi];state.composeMedia.push({name:tfile.name,size:tfile.size,type:tfile.type.startsWith('video')?'video':'image',preview:URL.createObjectURL(tfile)})}render()}return}
  if(e.target.closest('[data-th-media-remove]')){var tidx=parseInt(e.target.closest('[data-th-media-remove]').dataset.thMediaRemove);state.composeMedia.splice(tidx,1);render();return}
  if(e.target.closest('[data-section]')){state.section=e.target.closest('[data-section]').dataset.section;routeTo('feed');return}
  if(e.target.closest('[data-like-post]')){var btn=e.target.closest('[data-like-post]');var pid=btn.dataset.likePost;var p=state.posts.find(x=>x.id===pid);if(!p)p=state.treeholes.find(x=>x.id===pid);if(p){p.liked=!p.liked;p.likes+=p.liked?1:-1;if(p.liked)apiWrite('/api/community/like?post_id='+pid);btn.classList.toggle('is-active',p.liked);var sp=btn.querySelector('span.label');if(sp)sp.textContent=p.liked?'已赞':'赞';var sc=btn.querySelector('span:last-child');if(sc)sc.textContent=p.likes||'';refreshIcons()}return}
  if(e.target.closest('[data-like-qa]')){var qabtn=e.target.closest('[data-like-qa]');var qid=qabtn.dataset.likeQa;var qp=state.questions.find(x=>x.id===qid);if(qp){qp.liked=!qp.liked;qp.votes+=qp.liked?1:-1;qabtn.classList.toggle('is-active',qp.liked);var qsp=qabtn.querySelector('span.label');if(qsp)qsp.textContent=qp.liked?'已赞':'赞';var qsc=qabtn.querySelector('span:last-child');if(qsc)qsc.textContent=qp.votes||'';refreshIcons()}return}
  // QA bookmark
  if(e.target.closest('[data-qa-bookmark]')){var qbBtn=e.target.closest('[data-qa-bookmark]');var qbId=qbBtn.dataset.qaBookmark;var qbP=state.questions.find(x=>x.id===qbId);if(qbP){state.qaBookmarked[qbId]=!state.qaBookmarked[qbId];var isBookmarked=state.qaBookmarked[qbId];qbBtn.classList.toggle('is-active',isBookmarked);var qbLabel=qbBtn.querySelector('span.label');if(qbLabel)qbLabel.textContent=isBookmarked?'已收藏':'收藏';var qbIcon=qbBtn.querySelector('i');if(qbIcon)qbIcon.setAttribute('data-lucide',isBookmarked?'bookmark-check':'bookmark');toast(isBookmarked?'已收藏到我的问题':'已取消收藏');refreshIcons()}return}
  if(e.target.closest('[data-collect-post]')){var btn=e.target.closest('[data-collect-post]');var cid=btn.dataset.collectPost;var cp=state.posts.find(x=>x.id===cid);if(!cp)cp=state.treeholes.find(x=>x.id===cid);if(cp){cp.collected=!cp.collected;if(cp.collected)apiWrite('/api/community/collect?post_id='+cid);btn.classList.toggle('collect-active',cp.collected);var sp=btn.querySelector('span.label');if(sp)sp.textContent=cp.collected?'已收藏':'收藏';var ic=btn.querySelector('i');if(ic)ic.setAttribute('data-lucide',cp.collected?'bookmark-check':'bookmark-plus');toast(cp.collected?'已收藏':'已取消收藏');refreshIcons()}return}
  if(e.target.closest('[data-report-post]')){var rpid=e.target.closest('[data-report-post]').dataset.reportPost||'';apiWrite('/api/community/report?post_id='+rpid+'&reason='+encodeURIComponent('用户举报'));toast('举报已提交','error');return}
  // Profile - must be before data-open-post
  var prof=e.target.closest('[data-profile]');if(prof){var nm=prof.dataset.profile,pid=prof.dataset.profilePid;var up=state.posts.find(x=>x.id===pid);var bio=up?(up.anonymous?'匿名用户':up.author+(up.author.length>2?'':'··'))+('·学生'):'';state.profileUser={id:nm.slice(0,6)+'_'+Date.now(),name:nm,bio:bio};state.feedScrollY=window.scrollY;render();return}
  if(e.target.closest('[data-open-post]')&&state.route==='feed'&&!e.target.closest('button')&&!e.target.closest('.post-actions')&&!e.target.closest('.ai-answer')){var oid=e.target.closest('[data-open-post]').dataset.openPost;state.selectedPost=state.posts.find(x=>x.id===oid)||null;state.route='detail';state.feedScrollY=window.scrollY;render();requestAnimationFrame(()=>{var el=$('view-root');if(el)el.scrollIntoView({behavior:'instant',block:'start'})});return}
  if(e.target.closest('[data-feed-back]')){if(state.profileReturn){state.profileReturn=false;state.route='profile';render();window.scrollTo({top:0});return}routeTo('feed');setTimeout(()=>window.scrollTo({top:state.feedScrollY||0}),20);return}
  // Profile actions (already handled above)
  if(e.target.closest('[data-profile-back]')){state.profileUser=null;render();setTimeout(()=>window.scrollTo({top:state.feedScrollY||0}),20);return}
  if(e.target.closest('[data-profile-toggle]')){var pu=state.profileUser;if(pu){var key=pu.id==='me'?'me':pu.id;state.profileHidden[key]=!state.profileHidden[key];toast(state.profileHidden[key]?'主页已设为私密':'主页已公开');render()}return}
  if(e.target.closest('[data-profile-contact]')){var pc=state.profileUser;if(pc){var isC=state.contacts.includes(pc.id);if(isC)state.contacts=state.contacts.filter(x=>x!==pc.id);else state.contacts.push(pc.id);toast(isC?'已移除联系人':pc.name+'已添加到通讯录！');render()}return}
  if(e.target.closest('[data-profile-chat]')){toast('已打开与'+((state.profileUser||{}).name||'对方')+'的聊天（Demo模式）');return}
  if(e.target.closest('[data-comment-post]')){var cmid=e.target.closest('[data-comment-post]').dataset.commentPost;var cmp=state.posts.find(x=>x.id===cmid);if(cmp){state.selectedPost=cmp;state.route='detail';state.feedScrollY=window.scrollY}else{var ctp=state.treeholes.find(x=>x.id===cmid);if(ctp){state.treeholeDetail=cmid}}render();return}
  // Comment like
  if(e.target.closest('[data-comment-like]')){var clk=e.target.closest('[data-comment-like]');var parts=clk.dataset.commentLike.split(':');var pid=parts[0],cidx=parseInt(parts[1]);var p=state.posts.find(x=>x.id===pid);if(!p)p=state.treeholes.find(x=>x.id===pid);if(p&&p.comments&&p.comments[cidx]){var c=p.comments[cidx];c.liked=!c.liked;c.likes=(c.likes||0)+(c.liked?1:-1);if(state.selectedPost&&state.selectedPost.id===pid)state.selectedPost=p;clk.classList.toggle('is-liked',c.liked);var sp=clk.querySelector('span');if(sp)sp.textContent=c.likes||0}return}
  // Comment reply toggle
  if(e.target.closest('[data-comment-reply]')){var cr=e.target.closest('[data-comment-reply]');var rkey=cr.dataset.commentReply;state.activeReply=state.activeReply===rkey?'':rkey;render();return}
  // Reply submit
  var rsf=e.target.closest('[data-reply-submit]');if(rsf){var rparts=rsf.dataset.replySubmit.split(':');var rpid=rparts[0],rcidx=parseInt(rparts[1]);var rp=state.posts.find(x=>x.id===rpid);if(!rp)rp=state.treeholes.find(x=>x.id===rpid);if(rp&&rp.comments&&rp.comments[rcidx]){var inp=document.querySelector('[data-reply-input="'+rsf.dataset.replySubmit+'"]');if(inp&&inp.value.trim()){rp.comments[rcidx].replies=rp.comments[rcidx].replies||[];rp.comments[rcidx].replies.push({author:'匿名同学',content:inp.value.trim()});if(state.selectedPost&&state.selectedPost.id===rpid)state.selectedPost=rp;state.activeReply='';toast('回复已发布');render()}}return}
  // Search tag
  if(e.target.closest('[data-search-mode]')){state.search.mode=e.target.closest('[data-search-mode]').dataset.searchMode;state.search.aiReply='';state.search.aiLoading=false;render();return}
  if(e.target.closest('[data-ai-post]')){var apid=e.target.closest('[data-ai-post]').dataset.aiPost;state.aiActivePost=state.aiActivePost===apid?'':apid;render();setTimeout(function(){var qi=$('ai-q-input');if(qi)qi.focus()},60);return}
  if(e.target.closest('[data-ai-send]')){var spid=e.target.closest('[data-ai-send]').dataset.aiSend;var qi2=$('ai-q-input');var q=(qi2&&qi2.value.trim())||'请概括这条校园话题。';var sp=state.posts.find(function(x){return x.id===spid});if(!sp)sp=state.treeholes.find(function(x){return x.id===spid});if(!sp)return;state.aiBusy[spid]=true;state.aiReplies[spid]='';render();mockAIChat({session_id:'post_'+spid,message:q,context:{type:'post',label:sp.title||'校园话题',text:sp.content||''}}).then(function(ans){state.aiBusy[spid]=false;state.aiReplies[spid]=ans.reply;render()});return}
  if(e.target.closest('[data-ai-insert]')){var cform=e.target.closest('form');if(!cform)return;var cinp=cform.querySelector('input[name="comment"]');if(!cinp)return;cinp.focus();var cv=cinp.value;if(!/@ai/i.test(cv))cinp.value='@AI '+(cv?cv:'');return}
  if(e.target.closest('[data-res-ai-toggle]')){var rtid=e.target.closest('[data-res-ai-toggle]').dataset.resAiToggle;state.resAI.open=state.resAI.open===rtid?'':rtid;state.resAI.reply='';state.resAI.loading=false;render();setTimeout(function(){var rq=$('res-ai-q');if(rq)rq.focus()},60);return}
  if(e.target.closest('[data-res-ai-send]')){var rsid=e.target.closest('[data-res-ai-send]').dataset.resAiSend;var rr=state.resources.find(function(x){return x.id===rsid});if(!rr)return;var rq2=$('res-ai-q');var q2=(rq2&&rq2.value.trim())||'这份资料的重点是什么？';if(rq2)rq2.value='';state.resAI.loading=true;state.resAI.reply='';render();mockAIChat({session_id:'resource_'+Date.now(),message:q2,context:{type:'resource',label:rr.name+'（'+rr.course+'）',text:rr.course+' '+rr.type+' '+(rr.description||'')}}).then(function(ans){state.resAI.loading=false;state.resAI.reply=ans.reply;render()});return}
  // AI Chat modal
  if(e.target.closest('[data-ai-chat-close]')){closeAiChat();return}
  if(e.target.id==='ai-chat-overlay'&&!e.target.closest('.ai-chat-modal')){closeAiChat();return}
  if(e.target.closest('[data-ai-chat-chip]')){var chip=e.target.closest('[data-ai-chat-chip]').dataset.aiChatChip;sendAiChat(chip);return}
  if(e.target.closest('#ai-chat-form')){e.preventDefault();var ci=$('ai-chat-input');if(ci&&ci.value.trim()){sendAiChat(ci.value);ci.value=''}return}
  if(e.target.closest('[data-tag]')){var tg=e.target.closest('[data-tag]').dataset.tag;state.search.keyword=tg;state.search.loading=true;render();setTimeout(()=>{state.search.result={keyword:tg,total:state.posts.filter(p=>(p.title+p.content+(p.tags||[]).join(' ')).toLowerCase().includes(tg.toLowerCase())).length,posts:state.posts.filter(p=>(p.title+p.content+(p.tags||[]).join(' ')).toLowerCase().includes(tg.toLowerCase()))};state.search.loading=false;render()},300);return}
  // Notifications
  // Resources
  if(e.target.closest('[data-res-tab]')){state.resourceTab=e.target.closest('[data-res-tab]').dataset.resTab;state.resCourseDetail='';render();return}
  if(e.target.closest('[data-res-course-open]')){state.resCourseDetail=e.target.closest('[data-res-course-open]').dataset.resCourseOpen;render();return}
  if(e.target.closest('[data-res-back]')){state.resCourseDetail='';render();return}
  if(e.target.closest('[data-res-save]')){var rid=e.target.closest('[data-res-save]').dataset.resSave;state.resSaved[rid]=!state.resSaved[rid];toast(state.resSaved[rid]?'已收藏到个人空间':'已取消收藏');e.stopPropagation();render();return}
  if(e.target.closest('[data-res-download]')){var did=e.target.closest('[data-res-download]').dataset.resDownload;var dr=state.resources.find(function(x){return x.id===did});if(dr&&resIsLocked(dr)){unlockAttempt(did)}else{state.resDownloaded[did]=true;toast('下载已记录（Demo模式）')}e.stopPropagation();render();return}
  if(e.target.closest('[data-res-unlock]')){var uid=e.target.closest('[data-res-unlock]').dataset.resUnlock;e.stopPropagation();unlockAttempt(uid);return}
  if(e.target.closest('[data-points-intro-ok]')){state.points.seenIntro=true;render();apiFetch('/api/points/intro-seen',{method:'POST',body:{}}).catch(function(){});return}
  // Resource detail
  if(e.target.closest('[data-res-open]')){var rid=e.target.closest('[data-res-open]').dataset.resOpen;state.resDetail=rid;state.route='resource-detail';state.qaFrom=state.qaDetail?'qa':'';render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-res-detail-back]')){state.resDetail='';state.qaFrom='';if(state.profileReturn){state.profileReturn=false;state.route='profile';render();return}if(state.qaDetail){state.route='qa';render();return}state.route='resources';render();return}
  // Resource rating
  if(e.target.closest('[data-res-rate]')){var el=e.target.closest('[data-res-rate]');var rid=el.dataset.resRate,rv=parseInt(el.dataset.rv);state.resRating[rid]=rv;render();return}
  // Resource comment
  var rcf=e.target.closest('[data-res-comment]');if(rcf){e.preventDefault();var rid=rcf.dataset.resComment;var inp=rcf.querySelector('input[name="comment"]');if(!inp||!inp.value.trim())return;state.resComments[rid]=state.resComments[rid]||[];state.resComments[rid].push({author:'张三',content:inp.value.trim(),time:new Date().toISOString().slice(0,16).replace('T',' ')});render();return}
  // Resource filter quick actions
  if(e.target.closest('[data-res-grade]')){var g=e.target.closest('[data-res-grade]').dataset.resGrade;var gmap={'大一':'Year 1','大二':'Year 2','大三':'Year 3','大四':'Year 4','研究生':'Year 4'};state.resourceFilters.year=state.resourceFilters.year===gmap[g]?'all':gmap[g];render();return}
  if(e.target.closest('[data-res-types]')){var tg=e.target.closest('[data-res-types]').dataset.resTypes;var ts=state.resourceFilters.types||[];if(ts.includes(tg))ts=ts.filter(x=>x!==tg);else ts.push(tg);state.resourceFilters.types=ts;render();return}
  if(e.target.closest('[data-res-source]')){var src=e.target.closest('[data-res-source]').dataset.resSource;state.resourceFilters.source=src;render();return}
  if(e.target.closest('[data-res-clear-all]')){state.resourceFilters={keyword:'',year:'all',term:'all',major:'all',course:'all',type:'all',source:'all',time:'all',types:[]};render();return}
  // Upload form
  if(e.target.closest('[data-res-upload-open]')){state.resUploadForm=true;state.resUploadStep=1;render();return}
  if(e.target.closest('[data-res-upload-close],[data-res-upload-cancel]')){state.resUploadForm=false;state.resUploadStep=1;render();return}
  if(e.target.closest('[data-upload-next]')){if(state.resUploadStep===1&&!state.resUploadData.fileName)return toast('请先选择文件','error');state.resUploadStep++;render();return}
  if(e.target.closest('[data-upload-prev]')){state.resUploadStep--;render();return}
  if(e.target.closest('[data-upload-type]')){var t=e.target.closest('[data-upload-type]').dataset.uploadType;state.resUploadData.type=t;render();return}
  if(e.target.closest('#ru-file-btn')||e.target.closest('#upload-dropzone')){var fe=$('ru-file');if(fe)fe.click();return}
  if(e.target.closest('[data-res-upload-submit]')){var tit=$('ru-title')?.value||'';if(!tit)return toast('请填写标题','error');if(!($('ru-copyright')?.checked))return toast('请确认版权声明','error');
    var ud=state.resUploadData||{};var uco=(state.resourceCatalog&&state.resourceCatalog.courses||[]).find(function(x){return x.code===ud.course});
    apiFetch('/api/resources/upload',{method:'POST',body:{title:tit,course:ud.course||'',course_name:uco?uco.name:'',type:ud.type||'资料',major:ud.major||'',year:ud.grade||'',size:'1.5MB'}}).then(function(d){
      toast('📤 上传成功，积分 +'+(d.points_awarded||5)+'！（你上传的资料自己永远免费）');
      if(d.resource)state.resources.push(d.resource);
      if(d.points!=null)state.points.balance=d.points;
      state.resUploadForm=false;state.resUploadStep=1;state.resUploadData={title:'',course:'',type:'',desc:'',fileName:'',fileType:'',keywords:'',major:'',grade:'',allowDownload:true};render();
    }).catch(function(err){toast(err.message||'上传失败，稍后再试','error')});
    return}
  // Q&A
  if(e.target.closest('#qa-course')){state.qaCourse=$('qa-course')?.value||'all';render();return}
  if(e.target.closest('[data-qa-tab]')){state.qaTab=parseInt(e.target.closest('[data-qa-tab]').dataset.qaTab);render();return}
  if(e.target.closest('[data-qa-ask]')){state.qaAskForm=true;state.qaAskStep=1;state.qaAskCourse=state.qaCourse!=='all'?state.qaCourse:'';state.qaAskTitle='';state.qaAskDetails='';state.qaAskTags=[];state.qaAskCustomTag='';state.qaAskAnonymous=false;state.qaAskMedia=[];renderQaAskModal();return}
  if(e.target.closest('[data-qa-load-more]')){toast('暂无更多问题（Demo模式）');return}
  // QA Ask Modal
  if(e.target.closest('[data-qa-ask-close]')||e.target.closest('[data-qa-ask-cancel]')){state.qaAskForm=false;var qao=document.getElementById('qa-ask-overlay');if(qao)qao.remove();return}
  if(e.target.id==='qa-ask-overlay'){state.qaAskForm=false;var qao2=document.getElementById('qa-ask-overlay');if(qao2)qao2.remove();return}
  if(e.target.closest('[data-qa-ask-prev]')){state.qaAskStep--;renderQaAskModal();return}
  if(e.target.closest('[data-qa-ask-next]')){
    if(state.qaAskStep===1){var cs=$('qa-ask-course')?.value;if(!cs){toast('请先选择课程','error');return}state.qaAskCourse=cs;state.qaAskStep=2;renderQaAskModal();return}
    if(state.qaAskStep===2){var ti=$('qa-ask-title')?.value.trim();if(!ti){toast('请输入问题标题','error');return}state.qaAskTitle=ti;state.qaAskDetails=$('qa-ask-details')?.value||'';submitQaAsk();return}
  }
  // QA Ask tag selection (in-place updates, no full re-render)
  if(e.target.closest('[data-ask-tag]')){var tagEl=e.target.closest('[data-ask-tag]');var tag=tagEl.dataset.askTag;var idx=state.qaAskTags.indexOf(tag);var isSelected;if(idx>=0){state.qaAskTags.splice(idx,1);isSelected=false}else{state.qaAskTags.push(tag);isSelected=true}toggleQaAskTagChip(tag,isSelected);updateQaAskTagsCurrent();return}
  if(e.target.closest('[data-ask-tag-remove]')){var ri=parseInt(e.target.closest('[data-ask-tag-remove]').dataset.askTagRemove);var removedTag=state.qaAskTags[ri];state.qaAskTags.splice(ri,1);toggleQaAskTagChip(removedTag,false);updateQaAskTagsCurrent();return}
  if(e.target.closest('#qa-ask-tag-add')){var ct=$('qa-ask-custom-tag')?.value.trim();if(ct&&!state.qaAskTags.includes(ct)){state.qaAskTags.push(ct);$('qa-ask-custom-tag').value=''}updateQaAskTagsCurrent();return}
  if(e.target.closest('[data-ask-anon]')){state.qaAskAnonymous=e.target.closest('[data-ask-anon]').dataset.askAnon==='true';updateQaAskAnon();return}
  // QA Ask editor insert
  if(e.target.closest('[data-ask-insert]')){var insType=e.target.closest('[data-ask-insert]').dataset.askInsert;var ta=$('qa-ask-details');if(!ta)return;var selStart=ta.selectionStart,selEnd=ta.selectionEnd,selText=ta.value.substring(selStart,selEnd);var insert='';if(insType==='code')insert='\n```\n'+(selText||'// 在此输入代码')+'\n```\n';else if(insType==='image')insert='\n![图片描述](粘贴图片链接)\n';else if(insType==='bold')insert='**'+(selText||'加粗文字')+'**';else if(insType==='list')insert='\n- 项目1\n- 项目2\n- 项目3\n';var newVal=ta.value.substring(0,selStart)+insert+ta.value.substring(selEnd);ta.value=newVal;ta.focus();var newPos=selStart+insert.length;ta.setSelectionRange(newPos,newPos);state.qaAskDetails=newVal;return}
  if(e.target.closest('.qa-card')&&state.route==='qa'&&!state.qaDetail){var el=e.target.closest('.qa-card');if(!e.target.closest('button')){var qid=el.dataset.qaId;if(qid){state.qaDetail=qid;render();window.scrollTo({top:0})}}return}
  if(e.target.closest('[data-qa-back]')){state.qaDetail='';if(state.profileReturn){state.profileReturn=false;state.route='profile';render();return}render();return}
  if(e.target.closest('#qa-reply-form')){e.preventDefault();toast('回答已发布（Demo模式），感谢你的参与！');return}
  // Answer interactive effects
  if(e.target.closest('[data-qa-thank]')){var thanksBtn=e.target.closest('[data-qa-thank]');var tIdx=parseInt(thanksBtn.dataset.qaThank);var tAnswer=state.qaAnswerList&&state.qaAnswerList[tIdx];if(tAnswer&&!tAnswer._thanked){tAnswer._thanked=true;thanksBtn.classList.add('is-active');thanksBtn.innerHTML='<i data-lucide="hand-helping" style="width:14px;height:14px;vertical-align:middle"></i> 已感谢';refreshIcons();toast('🙏 感谢了 '+h(tAnswer.name||'该回答')+'！')}return}
  if(e.target.closest('[data-qa-followup]')){var fBtn=e.target.closest('[data-qa-followup]');var fIdx=parseInt(fBtn.dataset.qaFollowup);var fArea=document.querySelector('[data-followup-area="'+fIdx+'"]');if(fArea){var isVisible=fArea.style.display!=='none';fArea.style.display=isVisible?'none':'block';if(!isVisible)fArea.querySelector('.qa-followup-input').focus()}return}
  if(e.target.closest('[data-qa-vote-answer]')){var voteBtn=e.target.closest('[data-qa-vote-answer]');var vIdx=parseInt(voteBtn.dataset.qaVoteAnswer);var vAnswer=state.qaAnswerList&&state.qaAnswerList[vIdx];if(vAnswer){vAnswer.voted=!vAnswer.voted;vAnswer.votes+=vAnswer.voted?1:-1;voteBtn.classList.toggle('is-active',vAnswer.voted);var vc=voteBtn.querySelector('.vote-count');if(vc)vc.textContent=vAnswer.votes||'';if(vAnswer.voted){var heart=document.createElement('span');heart.className='pop-heart';heart.textContent='👍';heart.style.cssText='position:absolute;font-size:20px;pointer-events:none;animation:popHeart .5s ease forwards';voteBtn.style.position='relative';voteBtn.appendChild(heart);setTimeout(function(){heart.remove()},600)}refreshIcons()}return}
  if(e.target.closest('.qa-followup-form')){e.preventDefault();var ff=e.target.closest('.qa-followup-form');var fi=ff.querySelector('.qa-followup-input');if(fi&&fi.value.trim()){toast('追问已发送（Demo模式）');fi.value='';ff.closest('[data-followup-area]').style.display='none'}return}
  // Teachers
  if(e.target.closest('#teacher-dept')){state.teacherFilter.dept=$('teacher-dept')?.value||'all';state.teacherFilter.course='all';render();return}
  if(e.target.closest('#teacher-title')){state.teacherFilter.title=$('teacher-title')?.value||'all';render();return}
  if(e.target.closest('#teacher-course')){state.teacherFilter.course=$('teacher-course')?.value||'all';render();return}
  if(e.target.closest('#teacher-search')){var tv=$('teacher-search')?.value||'';state.teacherFilter.search=tv;render();return}
  if(e.target.closest('[data-teacher-chat]')){var chatId=e.target.closest('[data-teacher-chat]').dataset.teacherChat;renderTeacherChatModal(chatId);return}
  if(e.target.closest('[data-teacher-book]')){var tId=e.target.closest('[data-teacher-book]').dataset.teacherBook;var tObj=MOCK_TEACHERS.find(function(x){return x.id===tId});if(tObj){state.ohModal.teacher=tObj;state.ohModal.step=1;state.ohModal.date='';state.ohModal.slot='';state.ohModal.topic='';renderOfficeHourModal()}return}
  if(e.target.closest('[data-teacher-materials]')){var tmId=e.target.closest('[data-teacher-materials]').dataset.teacherMaterials;renderTeacherMaterials(tmId);return}
  if(e.target.closest('.teacher-card')&&state.route==='teachers'&&!state.teacherDetail){var el=e.target.closest('.teacher-card');if(!e.target.closest('button')){var tid=el.dataset.teacherId;if(tid){state.teacherDetail=tid;state.teacherFrom='';render();window.scrollTo({top:0})}}return}
  if(e.target.closest('[data-teacher-back]')){state.teacherDetail='';if(state.profileReturn){state.profileReturn=false;state.route='profile';render();return}if(state.teacherFrom==='opportunities'){state.route='opportunities'}else{state.route='teachers';state.teacherFrom=''}render();return}
  if(e.target.closest('[data-recruit-open]')){state.recruitDetail=e.target.closest('[data-recruit-open]').dataset.recruitOpen;var defR=state.resumeDefaultId||(state.resumes[0]&&state.resumes[0].id)||'';state.recruitForm={resume:defR,statement:'',note:'',errors:{}};state.recruitSubmitting=false;renderRecruitModal();return}
  if(e.target.closest('[data-recruit-close]')){var mo=document.getElementById('recruit-modal-overlay');if(mo)mo.remove();state.recruitDetail='';return}
  if(e.target.closest('[data-tm-close]')){var tm=document.getElementById('tm-overlay');if(tm)tm.remove();return}
  if(e.target.id==='tm-overlay'){var tm2=document.getElementById('tm-overlay');if(tm2)tm2.remove();return}
  // Teacher chat modal
  if(e.target.closest('[data-tchat-close]')){var tco=document.getElementById('tchat-overlay');if(tco)tco.remove();state.tchatPendingImage='';return}
  if(e.target.id==='tchat-overlay'){var tco2=document.getElementById('tchat-overlay');if(tco2)tco2.remove();state.tchatPendingImage='';return}
  if(e.target.closest('[data-tchat-img]')){var tfi=document.getElementById('tchat-img-input');if(tfi)tfi.click();return}
  if(e.target.closest('[data-tchat-clear-img]')){state.tchatPendingImage='';var tpi=document.getElementById('tchat-pending-img');if(tpi)tpi.remove();return}
  if(e.target.closest('#tchat-form')){e.preventDefault();sendTeacherChat();return}
  if(e.target.closest('#recruit-modal-overlay')&&!e.target.closest('.recruit-modal')){var mv=document.getElementById('recruit-modal-overlay');if(mv)mv.remove();state.recruitDetail='';return}
  if(e.target.closest('[data-recruit-upload]')){var ub=e.target.closest('[data-recruit-upload]');ub.disabled=true;ub.innerHTML='<span class="recruit-spinner"></span> 上传中…';setTimeout(function(){var nid='rv_up_'+Date.now();var rname='新上传简历 · '+new Date().toISOString().slice(0,10);state.resumes.push({id:nid,name:rname,target:'未关联目标',updated:new Date().toISOString().slice(0,10),status:'draft',highlights:[]});state.recruitForm.resume=nid;state.recruitForm.errors.resume='';renderRecruitModal();toast('简历已上传，并同步至「我的简历」')},900);return}
  if(e.target.closest('[data-recruit-goto-verify]')){var mvo=document.getElementById('recruit-modal-overlay');if(mvo)mvo.remove();state.recruitDetail='';state.route='profile';state.profileTab=0;state.verifyModal=true;render();renderVerifyModal();return}
  if(e.target.closest('[data-recruit-goto-resume]')){var mro=document.getElementById('recruit-modal-overlay');if(mro)mro.remove();state.recruitDetail='';state.route='profile';state.profileTab=3;render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-recruit-submit]')){
    if(state.recruitSubmitting)return;
    var sel=document.getElementById('recruit-resume-select')?.value||'';
    var stmt=state.recruitForm.statement.trim();
    var errs={};
    if(!sel)errs.resume='请选择或上传一份简历';
    if(!stmt)errs.statement='请至少填写 10 字的能力阐述';
    else if(stmt.length<10)errs.statement='请至少填写 10 字的能力阐述';
    else if(stmt.length>500)errs.statement='内容超过 500 字限制';
    if(ME_PROFILE.verifyState!=='verified')errs.verify='请先完成学校信息认证后再申请';
    state.recruitForm.errors=errs;
    if(Object.keys(errs).length){renderRecruitModal();toast('请完善申请信息','error');return}
    var rp=findRecruitPos(state.recruitDetail);
    var rv=state.resumes.find(function(r){return r.id===sel})||state.resumes[0]||{name:'我的简历'};
    state.recruitSubmitting=true;renderRecruitModal();
    setTimeout(function(){
      state.myApplications.unshift({id:'app_'+(state.myApplications.length+1),posId:rp.id,posName:rp.name,teacher:rp._teacher.name,teacherTitle:rp._teacher.title||'',resumeName:rv.name,statement:stmt,note:state.recruitForm.note.trim(),time:new Date().toISOString(),status:'已投递'});
      state.notifications.push({id:'ra_'+(state.notifications.length+1)+'_'+Date.now(),content:'张三 申请了你的岗位：'+rp.name+'，点击查看详情',time:new Date().toISOString().slice(0,16).replace('T',' '),level:'urgent',type:'result',read:false,processed:false,saved_for_later:false,pinned:false});
      state.recruitSubmitting=false;state.recruitDetail='';state.recruitForm={resume:'',statement:'',note:'',errors:{}};
      var mf=document.getElementById('recruit-modal-overlay');if(mf)mf.remove();
      state.msgTab=1;state.route='directory';render();
      toast('申请已提交！等待老师查看');
    },800);
    return
  }
  if(e.target.closest('[data-apply-card]')){toast('申请已提交，等待老师查看');return}
  // OH modal
  if(e.target.closest('[data-oh-close]')||e.target.id==='oh-modal-overlay'){var om=document.getElementById('oh-modal-overlay');if(om)om.remove();state.ohModal.teacher=null;state.ohModal.step=1;state.ohModal.date='';state.ohModal.slot='';state.ohModal.topic='';return}
  if(e.target.closest('[data-oh-step]')){state.ohModal.step=parseInt(e.target.closest('[data-oh-step]').dataset.ohStep);renderOfficeHourModal();return}
  if(e.target.closest('[data-oh-date]')){state.ohModal.date=e.target.closest('[data-oh-date]').dataset.ohDate;state.ohModal.step=2;renderOfficeHourModal();return}
  if(e.target.closest('[data-oh-slot]')){state.ohModal.slot=e.target.closest('[data-oh-slot]').dataset.ohSlot;state.ohModal.step=3;renderOfficeHourModal();return}
  if(e.target.closest('[data-oh-submit]')){submitBooking();return}
  // Coffee Chat modal
  if(e.target.closest('[data-cc-close]')||e.target.id==='cc-modal-overlay'){var cm=document.getElementById('cc-modal-overlay');if(cm)cm.remove();state.ccModal={person:null,step:1,date1:'',time1:'',date2:'',time2:'',location:'',topic:''};return}
  if(e.target.closest('[data-cc-step]')){var ccStep=parseInt(e.target.closest('[data-cc-step]').dataset.ccStep);if(ccStep===2&&!state.ccModal.date1){var dd=document.getElementById('cc-date1');if(dd&&dd.value){state.ccModal.date1=dd.value;state.ccModal.time1=document.getElementById('cc-time1')?.value||''}}if(ccStep===2&&!state.ccModal.date1)return;state.ccModal.step=ccStep;renderCoffeeChatModal();return}
  if(e.target.closest('[data-cc-submit]')){submitCoffeeChat();return}
  // Directory hub
  if(e.target.closest('[data-dir-tab]')){state.msgTab=parseInt(e.target.closest('[data-dir-tab]').dataset.dirTab);state.activeMsg='';render();return}
  if(e.target.closest('[data-msg-id]')){state.activeMsg=e.target.closest('[data-msg-id]').dataset.msgId;render();return}
  if(e.target.closest('[data-msg-contact]')&&!e.target.closest('[data-contact-action]')){var cid=e.target.closest('[data-msg-contact]').dataset.msgContact;var cp=state.directoryPeople.find(function(p){return p.id===cid});if(cp){state.directoryChatContact=cp;if(!state.directoryChatMsgs[cid])state.directoryChatMsgs[cid]=[];render()}return}
  if(e.target.closest('#msg-form')){e.preventDefault();toast('消息已发送（Demo模式）');return}
  if(e.target.closest('#dir-form')){e.preventDefault();state.directoryKeyword=$('dir-keyword')?.value||'';render();return}
  if(e.target.closest('[data-dir-quick]')){var q=e.target.closest('[data-dir-quick]').dataset.dirQuick;if(q==='resume'){var dTab=state.msgTab||0;var tgt='';if(dTab===3&&state.directoryChatContact){tgt='contact:'+state.directoryChatContact.id}else{var dItems=MOCK_MSGS;if(dTab===1)dItems=MOCK_MSGS.filter(function(m){return m.tag==='recruit'});else if(dTab===2)dItems=MOCK_MSGS.filter(function(m){return m.tag==='office_hour'});var dAct=state.activeMsg?MOCK_MSGS.find(function(m){return m.id===state.activeMsg}):dItems[0];if(dAct)tgt='msg:'+dAct.id}if(!tgt)return toast('请先选择一个会话','error');state.dirResumeTarget=tgt;state.dirResumeSelected=state.resumeDefaultId||(state.resumes[0]&&state.resumes[0].id)||'';state.dirResumePick=true;renderResumePickModal()}else if(q==='appointment')toast('📅 预约请求已发送（Demo模式）');return}
  if(e.target.closest('[data-dir-resume-select]')){state.dirResumeSelected=e.target.closest('[data-dir-resume-select]').dataset.dirResumeSelect;var drpList=document.querySelectorAll('.drp-card');drpList.forEach(function(c){c.classList.toggle('is-selected',c.dataset.dirResumeSelect===state.dirResumeSelected)});return}
  if(e.target.closest('[data-dir-resume-close]')){closeResumePick();return}
  if(e.target.id==='drp-overlay'){closeResumePick();return}
  if(e.target.closest('[data-dir-resume-manage]')){state.dirResumePick=false;state.dirResumeTarget='';state.dirResumeSelected='';state.route='profile';state.profileTab=3;render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-dir-resume-send]')){sendResumeToChat();return}
  // Contact filter & action
  if(e.target.closest('[data-contact-filter]')){state.contactFilter=e.target.closest('[data-contact-filter]').dataset.contactFilter;state.directoryChatContact=null;render();return}
  if(e.target.closest('[data-contact-action]')){var aBtn=e.target.closest('[data-contact-action]');var aType=aBtn.dataset.contactAction;if(aType==='oh'){var aPerson=state.directoryPeople.find(function(p){return p.id===aBtn.dataset.contactId});if(aPerson){var tId=CONTACT_TEACHER_MAP[aPerson.id]||'';var tObj=tId?MOCK_TEACHERS.find(function(x){return x.id===tId}):null;if(!tObj){toast('该联系人暂未开放 Office Hour 预约','error');return}state.ohModal.teacher=tObj;state.ohModal.step=1;state.ohModal.date='';state.ohModal.slot='';state.ohModal.topic='';renderOfficeHourModal()}}else if(aType==='coffee'){var aPerson2=state.directoryPeople.find(function(p){return p.id===aBtn.dataset.contactId});if(aPerson2){state.ccModal.person=aPerson2;state.ccModal.step=1;state.ccModal.date1='';state.ccModal.time1='';state.ccModal.date2='';state.ccModal.time2='';state.ccModal.location='';state.ccModal.topic='';renderCoffeeChatModal()}}return}
  // Collections
  if(e.target.closest('[data-coll-open]')){state.collView=true;state.collTab=0;render();return}
  if(e.target.closest('[data-coll-back]')){state.collView=false;state.collShowNew=false;state.collActiveFolder='';render();return}
  if(e.target.closest('[data-coll-tab]')){state.collTab=parseInt(e.target.closest('[data-coll-tab]').dataset.collTab);render();return}
  if(e.target.closest('[data-coll-folder]')){state.collActiveFolder=e.target.closest('[data-coll-folder]').dataset.collFolder;render();return}
  if(e.target.closest('[data-coll-folder-back]')){state.collActiveFolder='';render();return}
  if(e.target.closest('[data-coll-add-open]')){state.collAddOpen=true;render();return}
  if(e.target.closest('[data-coll-add-close]')||(e.target.id==='coll-add-overlay')){state.collAddOpen=false;render();return}
  if(e.target.closest('[data-coll-add-confirm]')){var f=state.collFolders.find(x=>x.id===state.collActiveFolder);var checks=document.querySelectorAll('#coll-add-overlay input[type="checkbox"]:checked');checks.forEach(cb=>{var pid=cb.closest('[data-coll-add-check]')?.dataset?.collAddCheck;if(pid&&f&&!f.items.includes(pid))f.items.push(pid)});f.updated=new Date().toISOString().slice(0,10);state.collAddOpen=false;toast('资料已添加');render();return}
  if(e.target.closest('[data-coll-add-check]')){var cb=e.target.closest('[data-coll-add-check]').querySelector('input[type="checkbox"]');if(cb)cb.checked=!cb.checked;return}
  if(e.target.closest('[data-coll-remove]')){var parts=e.target.closest('[data-coll-remove]').dataset.collRemove.split(':');var ff=state.collFolders.find(x=>x.id===parts[0]);if(ff){ff.items=ff.items.filter(i=>i!==parts[1]);ff.updated=new Date().toISOString().slice(0,10);render()}return}
  if(e.target.closest('[data-coll-new-folder]')){state.collShowNew=true;render();return}
  if(e.target.closest('[data-coll-modal-close]')){state.collShowNew=false;render();return}
  if(e.target.closest('#coll-modal-overlay')&&e.target.id==='coll-modal-overlay'){state.collShowNew=false;render();return}
  if(e.target.closest('[data-coll-create]')){var nm=$('coll-new-name')?.value.trim();if(!nm)return toast('请输入收藏夹名称','error');var pub=$('coll-new-public')?.checked||false;var colors=['#c9b99a','#a8b5c8','#b8c9a8','#c8b5a8','#a8c4c8','#c8a8b8','#b8a8c8','#c8c8a8'];state.collFolders.unshift({id:'f'+(state.collFolders.length+1)+'_'+Date.now(),name:nm,color:colors[state.collFolders.length%colors.length],items:[],updated:new Date().toISOString().slice(0,10),public:pub});state.collShowNew=false;toast('收藏夹已创建，快去添加资料吧！');render();return}
  if(e.target.closest('[data-coll-delete]')){var fid=e.target.closest('[data-coll-delete]').dataset.collDelete;if(confirm('确定删除此收藏夹？')){state.collFolders=state.collFolders.filter(f=>f.id!==fid);toast('已删除');render()}return}
  if(e.target.closest('[data-coll-edit]')){toast('编辑功能（Demo模式）');return}
  if(e.target.closest('[data-coll-share]')){toast('分享功能（Demo模式）');return}
  if(e.target.closest('[data-coll-batch]')){toast('批量管理模式（Demo模式）');return}
  if(e.target.id==='res-upload-overlay'){state.resUploadForm=false;state.resUploadStep=1;render();return}
  // Notifications
  if(e.target.closest('[data-notif-tab]')){state.notifTab=e.target.closest('[data-notif-tab]').dataset.notifTab;render();return}
  if(e.target.closest('[data-notif-settings]')){state.notifShowSettings=!state.notifShowSettings;render();return}
  if(e.target.closest('[data-notif-settings-close]')){state.notifShowSettings=false;render();return}
  if(e.target.closest('[data-notif-toggle]')){var nt=e.target.closest('[data-notif-toggle]');var lk=nt.dataset.notifToggle;state.notifSettings[lk]=nt.checked;render();return}
  if(e.target.closest('[data-notif-toggle-processed]')){var pl=$('notif-processed-list');if(pl)pl.style.display=pl.style.display==='none'?'':'none';var arrow=e.target.closest('[data-notif-toggle-processed]').querySelector('.notif-toggle-arrow');if(arrow)arrow.textContent=pl.style.display==='none'?'▶':'▼';return}
  if(e.target.closest('[data-notify-action]')){var na=e.target.closest('[data-notify-action]'),ni=state.notifications.find(x=>x.id===na.dataset.notifyId);if(ni){if(na.dataset.notifyAction==='later'){ni.saved_for_later=!ni.saved_for_later;render()}else{ni.processed=true;ni.read=true;toast('已标记处理');render()}}return}
  // Notif time range
  if(e.target.closest('[data-notif-range]')){var rk=e.target.closest('[data-notif-range]').dataset.notifRange;if(rk==='custom'){state.notifShowCustomPicker=!state.notifShowCustomPicker;render();return}state.notifTimeRange=rk;state.notifShowCustomPicker=false;render();return}
  if(e.target.closest('[data-notif-custom-start]')){state.notifCustomStart=e.target.closest('[data-notif-custom-start]').value;return}
  if(e.target.closest('[data-notif-custom-end]')){state.notifCustomEnd=e.target.closest('[data-notif-custom-end]').value;return}
  if(e.target.closest('[data-notif-custom-apply]')){state.notifShowCustomPicker=false;state.notifTimeRange='custom';render();return}
  if(e.target.closest('[data-notif-custom-cancel]')){state.notifShowCustomPicker=false;state.notifTimeRange='3days';render();return}
  // Notification Preferences
  if(e.target.closest('[data-np-open]')||e.target.closest('[data-np-close]')||e.target.closest('#notif-prefs-overlay')&&e.target.id==='notif-prefs-overlay'){state.notifPrefsShow=!state.notifPrefsShow;render();return}
  if(e.target.closest('[data-np-channel]')){var npc=e.target.closest('[data-np-channel]');var npcKey=npc.dataset.npChannel;if(npcKey==='email'){var ce=state.notifPrefs.channelEmail;var hasAny=ce.urgent||ce.normal||ce.optional;if(hasAny){state.notifPrefs.channelEmail={urgent:false,normal:false,optional:false}}else{state.notifPrefs.channelEmail={urgent:true,normal:true,optional:true}};render();return}if(npcKey==='browser'){state.notifPrefs.channelBrowser=!state.notifPrefs.channelBrowser;render();return}}
  if(e.target.closest('[data-np-mail]')){var npm=e.target.closest('[data-np-mail]');var npmLv=npm.dataset.npMail;state.notifPrefs.channelEmail[npmLv]=npm.checked;render();return}
  if(e.target.closest('[data-np-normal]')){var npn=e.target.closest('[data-np-normal]');var npnKey=npn.dataset.npNormal;state.notifPrefs.normalSections[npnKey]=npn.checked;render();return}
  if(e.target.closest('[data-np-optional-global]')){state.notifPrefs.optionalEnabled=e.target.closest('[data-np-optional-global]').checked;render();return}
  if(e.target.closest('[data-np-dnd-toggle]')){state.notifPrefs.dndEnabled=e.target.closest('[data-np-dnd-toggle]').checked;render();return}
  if(e.target.closest('[data-np-dnd-start]')){state.notifPrefs.dndStart=e.target.closest('[data-np-dnd-start]').value;return}
  if(e.target.closest('[data-np-dnd-end]')){state.notifPrefs.dndEnd=e.target.closest('[data-np-dnd-end]').value;return}
  if(e.target.closest('[data-np-tag]')){var npt=e.target.closest('[data-np-tag]');var nptKey=npt.dataset.npTag;if(nptKey==='email_urgent'){state.notifPrefs.channelEmail.urgent=!state.notifPrefs.channelEmail.urgent;render();return}if(nptKey==='browser'){state.notifPrefs.channelBrowser=!state.notifPrefs.channelBrowser;render();return}}
  // Directory
  if(e.target.closest('[data-start-chat]')){var sc=e.target.closest('[data-start-chat]');toast('私聊（Demo模式）');return}
  // Treehole - uses same handlers as feed (data-comment-post, data-report-post, data-like-post)
  if(e.target.closest('.post[data-open-post]')&&state.route==='treehole'&&!e.target.closest('button')&&!e.target.closest('.post-actions')){var tid=e.target.closest('[data-open-post]').dataset.openPost;var tp=state.treeholes.find(function(x){return x.id===tid});if(tp){state.treeholeDetail=tid;render()}return}
  if(e.target.closest('[data-th-back]')){state.treeholeDetail='';render();return}
  // Danmu wall
  var pokedDanmu=e.target.closest('.danmu-item');
  if(pokedDanmu&&state.danmuWall){
    var ptext=pokedDanmu.getAttribute('data-text');if(!ptext)return;
    state.danmuPokes[ptext]=(state.danmuPokes[ptext]||0)+1;
    var pokeBadge=pokedDanmu.querySelector('.danmu-pokes');
    if(pokeBadge){pokeBadge.textContent='◈ '+state.danmuPokes[ptext]}
    else{pokeBadge=document.createElement('span');pokeBadge.className='danmu-pokes';pokeBadge.textContent='◈ '+state.danmuPokes[ptext];pokedDanmu.appendChild(pokeBadge)}
    if(state.danmuPokes[ptext]>10)pokedDanmu.classList.add('hot');
    pokedDanmu.classList.remove('poked');void pokedDanmu.offsetWidth;pokedDanmu.classList.add('poked');
    return;
  }
  if(e.target.closest('[data-danmu-open]')){state.danmuWall=true;state.danmuSpawned=false;state.danmuText='';render();return}
  if(e.target.closest('[data-danmu-back]')){state.danmuWall=false;state.danmuSpawned=false;render();window.scrollTo({top:0,behavior:'smooth'});return}
  if(e.target.closest('[data-danmu-focus]')){var dmi=document.getElementById('danmu-input');if(dmi)dmi.focus();return}
  // OPPORTUNITIES
  var oppCat=e.target.closest('[data-opp-cat]');if(oppCat){state.oppCat=oppCat.dataset.oppCat;state.oppSub='all';state.oppActiveDetail='';render();return}
  var oppSub=e.target.closest('[data-opp-sub]');if(oppSub){state.oppSub=oppSub.dataset.oppSub;state.oppActiveDetail='';render();return}
  var oppRole=e.target.closest('[data-opp-role]');if(oppRole){state.oppRole=oppRole.dataset.oppRole;state.oppActiveDetail='';render();return}
  var oppMode=e.target.closest('[data-opp-mode]');if(oppMode){state.oppMode=oppMode.dataset.oppMode;state.oppActiveDetail='';render();return}
  if(e.target.closest('#opp-search-clear')||e.target.closest('[data-opp-search-clear]')){state.oppSearch='';state.oppActiveDetail='';render();return}
  if(e.target.closest('[data-opp-publish-btn]')){state.oppShowPublish=true;render();return}
  // AI composer
  if(e.target.closest('#ai-open')){state.oppAI=true;state.oppAIText='';state.oppAIPreview=null;render();setTimeout(()=>{var ai=$('ai-input');if(ai)ai.focus()},50);return}
  if(e.target.closest('#ai-cancel')){state.oppAI=false;state.oppAIText='';state.oppAIPreview=null;render();return}
  if(e.target.closest('#ai-generate')){var inp=$('ai-input');if(!inp||!inp.value.trim()){toast('请先输入描述','error');return}state.oppAIText=inp.value;state.oppAIGenerating=true;render();setTimeout(()=>{var txt=state.oppAIText.toLowerCase();var cat='competition',sub='创新创业大赛',role='核心成员',mode='冲刺型';if(txt.includes('科研')||txt.includes('研究')){cat='research';sub='AI/机器学习';role='学徒求带';mode='稳健型'}else if(txt.includes('创业')||txt.includes('平台')){cat='project';sub='创业孵化';role='灵感合伙人';mode='灵感碰撞型'}else if(txt.includes('体育')||txt.includes('球')){cat='sports';sub='足球';role='散人组局';mode='稳健型'}var sk=[];if(txt.includes('python'))sk.push('Python');if(txt.includes('设计'))sk.push('UI/UX');if(txt.includes('前端'))sk.push('前端');if(txt.includes('竞赛'))sk.push('竞赛经验');var labels={competition:'赛事经纬',research:'学术共研',project:'项目实战',sports:'体育联盟'};state.oppAIPreview={title:txt.length>60?txt.slice(0,57)+'…':txt,category:cat,category_label:labels[cat],sub_category:sub,role_type:role,collab_mode:mode,skills:sk.length?sk:['相关技能']};state.oppAIGenerating=false;render()},800);return}
  if(e.target.closest('#ai-publish')&&state.oppAIPreview){var pp=state.oppAIPreview;state.publishForm.title=pp.title;state.publishForm.category=pp.category;state.publishForm.sub_category=pp.sub_category;state.publishForm.role_type=pp.role_type;state.publishForm.collab_mode=pp.collab_mode;state.publishForm.skills=[...pp.skills];state.oppAI=false;state.oppAIText='';state.oppAIPreview=null;state.oppShowPublish=true;render();return}
  // Comp card
  var cc=e.target.closest('[data-comp-id]');if(cc){state.oppCompDetail=cc.dataset.compId;state.oppActiveDetail='';state.oppProfView='';state.oppChatProf='';render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-comp-back]')){state.oppCompDetail='';render();return}
  var cp=e.target.closest('[data-comp-publish]');if(cp){var comp=UPCOMING_COMPETITIONS.find(c=>c.id===cp.dataset.compPublish);if(comp){state.publishForm.title=`【${comp.name}】招募队友`;state.publishForm.category='competition';state.publishForm.sub_category=comp.tags[0]||'';state.publishForm.description=`为参加${comp.name}招募队友。`;state.publishForm.skills=[...comp.tags];state.publishForm.deadline=comp.deadline}state.oppShowPublish=true;state.oppCompDetail='';render();return}
  // Prof view
  var pv=e.target.closest('[data-prof-view]');if(pv&&!e.target.closest('button[data-opp-apply],button[data-opp-greet]')){var pid=pv.dataset.profView;var tidMap={prof_1:'t2',prof_2:'t7'};state.teacherDetail=tidMap[pid]||'';state.teacherFrom='opportunities';state.route='teachers';render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-prof-back]')){state.oppProfView='';state.route='opportunities';render();return}
  // Prof chat
  var pc=e.target.closest('[data-prof-chat]');if(pc){var pcid=pc.dataset.profChat;var ptidMap={prof_1:'t2',prof_2:'t7'};state.teacherDetail=ptidMap[pcid]||'';state.teacherFrom='opportunities';state.route='teachers';render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-chat-back]')){state.oppChatProf='';if(state.oppChatFromDetail){state.oppActiveDetail=state.oppChatFromDetail;state.oppChatFromDetail=''}else state.oppProfView='';state.oppProfFromDetail='';render();return}
  // Opp detail
  var od=e.target.closest('[data-opp-detail]');if(od&&!e.target.closest('button')&&!e.target.closest('textarea')&&!e.target.closest('input')){state.oppActiveDetail=od.dataset.oppDetail;state.oppActiveApply='';state.oppActiveGreet='';render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-opp-back]')){state.oppActiveDetail='';if(state.profileReturn){state.profileReturn=false;state.route='profile';render();return}render();return}
  // Greet
  var og=e.target.closest('[data-opp-greet]');if(og){e.stopPropagation();state.oppActiveGreet=state.oppActiveGreet===og.dataset.oppGreet?'':og.dataset.oppGreet;state.oppActiveApply='';render();return}
  if(e.target.closest('[data-opp-greet-close],[data-opp-greet-close-detail]')){state.oppActiveGreet='';render();return}
  if(e.target.closest('[data-opp-greet-send],[data-opp-greet-send-detail]')){toast('🤝AI打招呼已发送（Demo）');state.oppActiveGreet='';render();return}
  // Apply
  var oa=e.target.closest('[data-opp-apply]');if(oa){e.stopPropagation();state.oppActiveApply=state.oppActiveApply===oa.dataset.oppApply?'':oa.dataset.oppApply;state.oppActiveGreet='';render();return}
  if(e.target.closest('[data-opp-cancel]')){state.oppActiveApply='';render();return}
  // Publish modal
  if(e.target.closest('[data-opp-publish-close],[data-opp-publish-cancel]')){state.oppShowPublish=false;$('publish-modal').style.display='none';$('publish-modal').innerHTML='';render();return}
  if(e.target.closest('[data-opp-publish-submit]')){submitPublish();return}
  if(e.target.id==='publish-overlay'){state.oppShowPublish=false;$('publish-modal').style.display='none';$('publish-modal').innerHTML='';render();return}
  if(e.target.closest('[data-pf="skill-remove"]')){var i=parseInt(e.target.closest('[data-pf="skill-remove"]').dataset.idx);state.publishForm.skills.splice(i,1);state.oppShowPublish=true;render();return}
  if(e.target.id==='pf-category'){state.publishForm.category=e.target.value;state.publishForm.sub_category='';state.oppShowPublish=true;render();return}
  // EVENTS
  if(e.target.closest('[data-evt-time]')){state.evtTimeFilter=e.target.closest('[data-evt-time]').dataset.evtTime;state.evtDateSearch='';render();return}
  if(e.target.closest('[data-evt-type]')){var ty=e.target.closest('[data-evt-type]').dataset.evtType;var idx=state.evtTypes.indexOf(ty);if(idx>=0)state.evtTypes.splice(idx,1);else state.evtTypes.push(ty);render();return}
  if(e.target.closest('.evt-card')&&state.route==='events'&&!state.evtDetail&&!e.target.closest('button')){state.evtDetail=e.target.closest('.evt-card').dataset.evtId;render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-evt-back]')){state.evtDetail='';if(state.profileReturn){state.profileReturn=false;state.route='profile';render();return}render();return}
  if(e.target.closest('[data-evt-clear-date]')){state.evtDateSearch='';state.evtTimeFilter='month';render();return}
  var ec=e.target.closest('[data-evt-cat]');if(ec){state.evtCat=ec.dataset.evtCat;state.evtDetail='';render();return}
  var ed=e.target.closest('[data-evt-detail]');if(ed&&!e.target.closest('button')){state.evtDetail=ed.dataset.evtDetail;render();window.scrollTo({top:0});return}
  if(e.target.closest('[data-evt-reg]')){var ei=e.target.closest('[data-evt-reg]');var ev=DEMO_EVENTS.find(v=>v.id===ei.dataset.evtReg);if(ev){ev.registered_by_me=true;toast('✅报名成功！')}render();return}
  if(e.target.closest('[data-evt-cancel]')){var ej=e.target.closest('[data-evt-cancel]');var ex=DEMO_EVENTS.find(v=>v.id===ej.dataset.evtCancel);if(ex){ex.registered_by_me=false;toast('已取消报名')}render();return}
  if(e.target.closest('[data-evt-reminder]')){var ek=e.target.closest('[data-evt-reminder]');var er=DEMO_EVENTS.find(v=>v.id===ek.dataset.evtReminder);if(er){er.reminder_enabled=!er.reminder_enabled;toast(er.reminder_enabled?'🔔提醒已开启':'提醒已关闭')}render();return}
  // Calendar
  if(e.target.closest('[data-cal-prev]')){if(state.evtCalendarMonth===1){state.evtCalendarMonth=12;state.evtCalendarYear--}else state.evtCalendarMonth--;state.evtSelectedDay='';render();return}
  if(e.target.closest('[data-cal-next]')){if(state.evtCalendarMonth===12){state.evtCalendarMonth=1;state.evtCalendarYear++}else state.evtCalendarMonth++;state.evtSelectedDay='';render();return}
  if(e.target.closest('[data-cal-day]')&&!e.target.closest('.other-month')){var cd=e.target.closest('[data-cal-day]');state.evtSelectedDay=state.evtSelectedDay===cd.dataset.calDay?'':cd.dataset.calDay;render();return}
  if(e.target.closest('[data-cal-clear]')){state.evtSelectedDay='';render();return}
  if(e.target.closest('#my-events-toggle')){state.evtShowMy=!state.evtShowMy;render();return}
});

document.addEventListener('submit',e=>{
  if(e.target.closest('#composer-form')){e.preventDefault();var t=state.composerText.trim();if(!t)return;state.posts.unshift({id:'new_'+Date.now(),title:'',content:t,section:state.composerSection,anonymous:state.composerAnonymous,time:new Date().toISOString().slice(0,16).replace('T',' '),likes:0,comments_count:0,tags:[],media:[],liked:false,collected:false});apiWrite('/api/community/posts',{title:'',content:t,section:state.composerSection,anonymous:state.composerAnonymous,tags:[],media:[]});state.composerText='';state.composerExpanded=false;state.composerAnonymous=false;toast('话题已发布');render();return}
  if(e.target.closest('#search-page-form')){e.preventDefault();var kw=$('search-keyword')?.value.trim();if(!kw)return;state.search.keyword=kw;state.search.type=$('search-type')?.value||'all';state.search.aiReply='';state.search.aiLoading=false;state.search.loading=true;state.route='search';render();setTimeout(()=>{var r={keyword:kw,total:0,posts:[],resources:[],events:[]};r.posts=state.posts.filter(p=>(p.title+p.content+(p.tags||[]).join(' ')).toLowerCase().includes(kw.toLowerCase()));r.resources=MOCK_RESOURCES.filter(i=>(i.name+i.course+i.type).toLowerCase().includes(kw.toLowerCase()));r.events=DEMO_EVENTS.filter(ev=>(ev.title+ev.description+ev.tags.join(' ')).toLowerCase().includes(kw.toLowerCase()));if(state.search.type!=='all'){if(state.search.type!=='post')r.posts=[];if(state.search.type!=='resource')r.resources=[];if(state.search.type!=='event')r.events=[]}r.total=r.posts.length+r.resources.length+r.events.length;state.search.result=r;state.search.loading=false;if(state.search.mode==='ai'){state.search.aiLoading=true;render();mockAIChat({session_id:'search_'+Date.now(),message:kw,context:{type:'search',label:kw,text:'关键词检索结果'}}).then(ans=>{state.search.aiReply=ans.reply||'暂时没有足够依据回答。';state.search.aiLoading=false;if(state.route==='search')render()})}else render()},400);return}
  if(e.target.closest('#resource-filter-form')){e.preventDefault();var f=state.resourceFilters;f.year=$('res-year')?.value||'all';f.term=$('res-term')?.value||'all';f.course=$('res-course')?.value||'all';f.type=$('res-type')?.value||'all';f.source=$('res-source')?.value||'all';f.keyword=$('res-keyword')?.value||'';render();return}
  if(e.target.closest('#dir-msg-form')){e.preventDefault();var inp=$('dir-msg-input');if(!inp||!inp.value.trim())return;var txt=inp.value.trim();var dc=state.directoryChatContact;if(dc){if(!state.directoryChatMsgs[dc.id])state.directoryChatMsgs[dc.id]=[];state.directoryChatMsgs[dc.id].push({from:'self',text:txt,time:new Date().toISOString()});inp.value='';render()}return}
  if(e.target.closest('#dir-form')){e.preventDefault();state.directoryKeyword=$('dir-keyword')?.value||'';render();return}
  var af=e.target.closest('[data-opp-apply-form]');if(af){e.preventDefault();var btn=af.querySelector('button[type="submit"]');btn.disabled=true;btn.innerHTML='<span class="button-spinner"></span>提交中';setTimeout(()=>{toast('✅申请已提交（Demo）');state.oppActiveApply='';render()},600);return}
  var cf=e.target.closest('[data-comment-form]');if(cf){e.preventDefault();var pid=cf.dataset.commentForm;var inp=cf.querySelector('input[name="comment"]');if(!inp||!inp.value.trim())return;var p=state.posts.find(function(x){return x.id===pid});if(!p)p=state.treeholes.find(function(x){return x.id===pid});if(p){p.comments=p.comments||[];p.comments.push({author:'匿名同学',content:inp.value.trim(),time:new Date().toISOString().slice(0,16).replace('T',' '),likes:0,anonymous:true});apiWrite('/api/community/comments?post_id='+pid+'&content='+encodeURIComponent(inp.value.trim())+'&anonymous=true');p.comments_count=p.comments.length;if(state.selectedPost&&state.selectedPost.id===pid)state.selectedPost=p;var hasAI=/@ai/i.test(inp.value.trim());var cIdx=p.comments.length-1;inp.value='';toast(hasAI?'评论已发布，AI 正在生成回应…':'评论已发布');render();if(hasAI){var cKey=pid+':'+cIdx;mockAIChat({session_id:'comment_'+Date.now(),message:p.comments[cIdx].content.replace(/(^|[^\w@])@ai\b/i,'$1').trim()||'请基于这条评论给出建议。',context:{type:'comment',label:'话题评论',text:p.comments[cIdx].content}}).then(function(ans){state.commentAIReplies[cKey]=ans.reply;render()})}}else render();return}
  if(e.target.closest('#chat-form')){e.preventDefault();sendChatMessage();return}
  if(e.target.closest('#danmu-form')){e.preventDefault();sendDanmu();return}
});

document.addEventListener('input',e=>{
  if(e.target.id==='composer-text'||e.target.id==='compose-text')state.composerText=e.target.value;
  if(e.target.id==='compose-title')state.composerTitle=e.target.value;
  if(e.target.id==='compose-tags')state.composerTags=e.target.value;
  if(e.target.id==='compose-section')state.composerSection=e.target.value;
  if(e.target.id==='compose-anon')state.composerAnonymous=e.target.checked;
  if(e.target.id==='treehole-text')state.treeholeText=e.target.value;
  if(e.target.id==='danmu-input')state.danmuText=e.target.value;
  if(e.target.id==='th-compose-text'){state.treeholeText=e.target.value;var thBtn=document.getElementById('submit-treehole-compose');if(thBtn)thBtn.disabled=!state.treeholeText.trim()}
  if(e.target.id==='ai-input')state.oppAIText=e.target.value;
  if(e.target.id==='evt-date-input'){state.evtDateSearch=e.target.value;if(state.evtDateSearch)state.evtTimeFilter='';render()}
  if(e.target.id==='oh-topic')state.ohModal.topic=e.target.value;
  if(e.target.id==='cc-date1')state.ccModal.date1=e.target.value;
  if(e.target.id==='cc-time1')state.ccModal.time1=e.target.value;
  if(e.target.id==='cc-date2')state.ccModal.date2=e.target.value;
  if(e.target.id==='cc-time2')state.ccModal.time2=e.target.value;
  if(e.target.id==='cc-topic')state.ccModal.topic=e.target.value;
  if(e.target.id==='opp-search-input'){state.oppSearch=e.target.value;state.oppActiveDetail='';render();setTimeout(()=>{var si=$('opp-search-input');if(si){si.focus();si.selectionStart=si.selectionEnd=si.value.length}},10)}
  if(e.target.id==='tchat-input'){var sb=document.querySelector('.tchat-send-btn');if(sb)sb.disabled=!e.target.value.trim()&&!state.tchatPendingImage}
  if(e.target.id==='tchat-img-input'&&e.target.files&&e.target.files[0]){var fr=new FileReader();fr.onload=function(ev){state.tchatPendingImage=ev.target.result;var pp=document.getElementById('tchat-pending-img');if(!pp){var ia=document.querySelector('.tchat-input-area');if(ia){var pi=document.createElement('div');pi.className='tchat-pending-img';pi.id='tchat-pending-img';pi.innerHTML='<img src="'+h(state.tchatPendingImage)+'" alt="" /><button type="button" class="tchat-pending-clear" data-tchat-clear-img>✕</button>';ia.insertBefore(pi,ia.querySelector('.tchat-form'))}}else{var img=pp.querySelector('img');if(img)img.src=state.tchatPendingImage}var sb2=document.querySelector('.tchat-send-btn');if(sb2)sb2.disabled=false};fr.readAsDataURL(e.target.files[0])}
  // QA Ask live input updates
  if(e.target.id==='qa-ask-title')state.qaAskTitle=e.target.value;
  if(e.target.id==='qa-ask-details')state.qaAskDetails=e.target.value;
  if(e.target.id==='qa-ask-custom-tag')state.qaAskCustomTag=e.target.value;
  // Recruit apply form live updates
  if(e.target.id==='recruit-statement'){state.recruitForm.statement=e.target.value;var rc=document.querySelector('.recruit-counter');if(rc){rc.textContent=e.target.value.length+'/500';rc.classList.toggle('warn',e.target.value.length>480)}if(state.recruitForm.errors.statement){state.recruitForm.errors.statement='';var rta=document.getElementById('recruit-statement');if(rta)rta.classList.remove('has-error');var rte=rta&&rta.parentNode.querySelector('.recruit-error-text');if(rte)rte.remove()}return}
  if(e.target.id==='recruit-note')state.recruitForm.note=e.target.value;
});
document.addEventListener('change',e=>{
  if(e.target.id==='qa-keyword'){state.qaKeyword=e.target.value||'';render();return}
  if(e.target.id==='qa-ask-course'){state.qaAskCourse=e.target.value||'';return}
  if(e.target.id==='recruit-resume-select'){state.recruitForm.resume=e.target.value||'';if(state.recruitForm.errors.resume){state.recruitForm.errors.resume='';var rrs=document.getElementById('recruit-resume-select');if(rrs)rrs.classList.remove('has-error');var rre=rrs&&rrs.parentNode.querySelector('.recruit-error-text');if(rre)rre.remove()}return}
  if(e.target.id==='cc-location-select'){var selVal=e.target.value;state.ccModal.location=selVal;if(selVal!=='其他（请注明）'){var otherInput=document.getElementById('cc-location-other');if(otherInput)otherInput.value=''}}
  if(e.target.id==='cc-location-other'){state.ccModal.location=e.target.value||'';var sel=document.getElementById('cc-location-select');if(sel)sel.value=''}
});

document.addEventListener('keydown',e=>{
  if(e.target.id==='opp-search-input'&&e.key==='Escape'){state.oppSearch='';render();return}
  if(e.target.id==='chat-input'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChatMessage();return}
  if(e.target.id==='pf-skills-input'&&e.key==='Enter'){e.preventDefault();var v=e.target.value.trim();if(v&&!state.publishForm.skills.includes(v)){state.publishForm.skills.push(v);e.target.value='';state.oppShowPublish=true;render()}}
  if(e.target.id==='qa-keyword'&&e.key==='Enter'){e.preventDefault();state.qaKeyword=e.target.value||'';render();return}
  if(e.target.id==='qa-ask-custom-tag'&&e.key==='Enter'){e.preventDefault();var ctv=e.target.value.trim();if(ctv&&!state.qaAskTags.includes(ctv)){state.qaAskTags.push(ctv);state.qaAskCustomTag='';renderQaAskModal()}return}
  if(e.target.id==='danmu-input'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendDanmu();return}
  if(e.target.id==='ai-chat-input'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();var ci2=$('ai-chat-input');if(ci2&&ci2.value.trim()){sendAiChat(ci2.value);ci2.value=''}return}
});

// Init
document.addEventListener('DOMContentLoaded',function(){
  if(location.search.indexOf('danmu=1')>=0){state.route='treehole';state.danmuWall=true;state.danmuSpawned=false}
  else if(location.search.indexOf('treehole=1')>=0){state.route='treehole'}
  else if(location.search.indexOf('profile=1')>=0){state.route='profile';var pm=location.search.match(/[?&]ptab=(\d)/);if(pm)state.profileTab=parseInt(pm[1],10)}
  else if(location.search.indexOf('recruit=')>=0){
    state.route='teachers';state.teacherDetail='t1';
    var rp=location.search.match(/[?&]recruit=(pos\d)/);state.recruitDetail=rp?rp[1]:'pos2';
    var fullMode=location.search.indexOf('full=1')>=0,errMode=location.search.indexOf('err=1')>=0;
    var rpos=findRecruitPos(state.recruitDetail);
    if(rpos&&fullMode)rpos.current_applicants=rpos.max_applicants;
    var defR=state.resumeDefaultId||(state.resumes[0]&&state.resumes[0].id)||'';
    state.recruitForm={resume:defR,statement:'',note:'',errors:errMode?{statement:'请填写能力陈述（至少 30 字），说明你为何适合这个岗位'}:{}};state.recruitSubmitting=false;
    state._autoRecruit=true;
  }
  else if(location.search.indexOf('compose=1')>=0){state.route='feed';state.composing=true}
  else if(location.search.indexOf('ai=chat')>=0){openAiChat()}
  else if(location.search.indexOf('ai=search')>=0){state.route='search';state.search.mode='ai';state.search.keyword='CSE101';state.search.type='all';var ar1=state.posts.filter(p=>((p.title||'')+(p.content||'')+(p.tags||[]).join(' ')).toLowerCase().includes('cse101'));var ar2=MOCK_RESOURCES.filter(i=>(i.name+i.course+i.type).toLowerCase().includes('cse101'));state.search.result={keyword:'CSE101',total:ar1.length+ar2.length,posts:ar1,resources:ar2,events:[]};state.search.aiReply='关于「CSE101」，我为你检索到'+ar1.length+'条相关话题、'+ar2.length+'份课程资料。建议优先查看资料《'+(ar2[0]?ar2[0].name:'CSE101 复习提纲')+'》（CSE101），与你的关键词相关度最高。如需进一步筛选，可以在左侧切换内容类型，或换用课程代码重新检索。'}
  else if(location.search.indexOf('ai=post')>=0){var ap=state.posts[0];if(ap){state.route='detail';state.selectedPost=ap;state.aiActivePost=ap.id;state.aiReplies[ap.id]='这条话题的核心信息是：'+(ap.content||'').replace(/\s+/g,'').slice(0,40)+'…。从讨论角度看，建议补充：1) 具体场景与时间；2) 你已尝试的解决办法；3) 希望获得的帮助类型。这样其他同学或课程团队能更快给出有效回应。'}}
  else if(location.search.indexOf('ai=comment')>=0){var cp=state.posts[0];if(cp){cp.comments=cp.comments||[];if(!cp.comments.some(function(c){return/@ai/i.test(c.content||'')}))cp.comments.push({author:'匿名同学',content:'@AI 这门课的期末复习有什么建议？',time:new Date().toISOString().slice(0,16).replace('T',' '),likes:2,anonymous:true});state.route='detail';state.selectedPost=cp;state.commentAIReplies[cp.id+':'+(cp.comments.length-1)]='这条评论我理解的重点是「这门课的期末复习…」。我的建议：1) 如果是提问，补充课程代码与具体章节能让回答更精准；2) 如果是经验分享，可以举一个具体例子增强说服力。此回答由 AI 生成，可能存在不准确之处，请自行判断。'}}
  else if(location.search.indexOf('ai=res')>=0){var ridm=location.search.match(/[?&]rid=(r\d+)/);var rid=ridm?ridm[1]:(state.resources[0]&&state.resources[0].id)||'r1';if(state.resources.some(function(x){return x.id===rid})){state.route='resource-detail';state.resDetail=rid;state.resAI={open:rid,loading:false,reply:'基于这份资料的元数据（课程资料），它适合用于课程复习与考前梳理。建议：1) 先看目录结构定位薄弱章节；2) 配合课件交叉验证重点；3) 若有配套试卷，先限时模拟再对答案。重要学术问题请以教师讲解或官方资料为准。',question:''}}}
  else if(location.search.indexOf('msg=1')>=0){state.route='directory';var mm=location.search.match(/[?&]mtab=(\d)/);if(mm)state.msgTab=parseInt(mm[1],10);else state.msgTab=1;if(location.search.indexOf('chat=1')>=0){state.msgTab=3;var p0=state.directoryPeople&&state.directoryPeople[0];if(p0){state.directoryChatContact=p0;if(!state.directoryChatMsgs[p0.id])state.directoryChatMsgs[p0.id]=[]}}if(location.search.indexOf('drp=1')>=0){state.dirResumeTarget=state.msgTab===3&&state.directoryChatContact?'contact:'+state.directoryChatContact.id:'msg:'+((state.activeMsg||MOCK_MSGS[0]||{}).id||'');state.dirResumeSelected=state.resumeDefaultId||(state.resumes[0]&&state.resumes[0].id)||'';state.dirResumePick=true}}
  if(location.search.indexOf('pm=1')>=0){state.profileMenuOpen=true;setTimeout(function(){renderProfileMenu()},120)}
  render();setTimeout(refreshIcons,100);
  // Apply i18n on initial load
  if(typeof applyI18N==='function')setTimeout(applyI18N,50);
  loadFromApi();
  loadPoints();
  initLoginExperience();
  initProfileOnboardingGuard();
  syncLoginGate();
  if(state._autoRecruit){state._autoRecruit=false;setTimeout(renderRecruitModal,120)}
  renderHotRail();
  setInterval(function(){if(hotFeedKey()!==state._lastHotKey)renderHotRail()},30000)
});


/* ═══ 登录模块（移植自原仓库，适配本前端） ═══ */
const LOGIN_STORAGE_KEY = 'surf-login-complete';
const LOGIN_ACCOUNT_KEY = 'surf-login-account';
const AVATAR_META = {
  sun: { icon: 'sun', label: '晴日' },
  wave: { icon: 'waves', label: '海风' },
  leaf: { icon: 'leaf', label: '新芽' },
  star: { icon: 'star', label: '星光' },
  spark: { icon: 'sparkles', label: '灵感' },
  moon: { icon: 'moon', label: '月亮' },
};
const mascotPhysics = new WeakMap();
let loginPointer = { x: window.innerWidth * .28, y: window.innerHeight * .58 };
let loginFocusTarget = null;
let loginAnimationFrame = 0;
let loginMoodTimer = 0;
let passwordIsVisible = false;
let emailEntryMode = 'login';
const loginCodeTimers = new Map();

/* 补齐 state 登录相关字段 */
state.authSession = { phone_authenticated: false, email_authenticated: false, campus_verified: false, can_publish: false, name: '', phone_masked: '', campus_account: '', needs_onboarding: false, dev_bypass: false, user_id: '' };
state.profile = { username: '', bio: '', birthday: '', avatar: 'sun', profile_complete: false };

/* api / toast 别名（复用现有 apiFetch / toast） */
function api(path, options) { return apiFetch(path, options); }
function showToast(message, type) { toast(message, type === 'error' ? 'error' : undefined); }
function clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); }

function hasStoredLogin() {
  return localStorage.getItem(LOGIN_STORAGE_KEY) === 'true' || sessionStorage.getItem(LOGIN_STORAGE_KEY) === 'true';
}
function rememberLogin(persistent) {
  localStorage.removeItem(LOGIN_STORAGE_KEY);
  sessionStorage.removeItem(LOGIN_STORAGE_KEY);
  (persistent ? localStorage : sessionStorage).setItem(LOGIN_STORAGE_KEY, 'true');
}
function rememberAccount(result, persistent) {
  if (!persistent) return;
  localStorage.setItem(LOGIN_ACCOUNT_KEY, JSON.stringify({ email: (result && result.email) || '', phone: (result && result.phone_masked) || '', name: (result && result.name) || '' }));
}

function setLoginMood(mood) {
  const experience = $('login-experience');
  if (experience) experience.dataset.mood = mood;
}
function activeLoginMood() {
  const active = document.activeElement;
  if (active && active.id === 'login-password') return passwordIsVisible ? 'peek' : 'password';
  if (active && active.closest && active.closest('.login-form')) return 'email';
  return 'idle';
}
function pulseLoginMood(mood, duration) {
  window.clearTimeout(loginMoodTimer);
  setLoginMood('idle');
  requestAnimationFrame(function () { setLoginMood(mood); });
  loginMoodTimer = window.setTimeout(function () { setLoginMood(activeLoginMood()); }, duration || 760);
}

function animateMascots() {
  const experience = $('login-experience');
  if (!experience || experience.hidden) { loginAnimationFrame = 0; return; }
  const focusRect = loginFocusTarget && loginFocusTarget.isConnected ? loginFocusTarget.getBoundingClientRect() : null;
  const target = focusRect ? { x: focusRect.left + focusRect.width / 2, y: focusRect.top + focusRect.height / 2 } : loginPointer;
  experience.querySelectorAll('.mascot').forEach(function (mascot, index) {
    const body = mascot.querySelector('.mascot-body');
    const rect = mascot.getBoundingClientRect();
    const desiredX = clamp((target.x - (rect.left + rect.width / 2)) / Math.max(180, rect.width * 1.6), -1, 1);
    const desiredY = clamp((target.y - (rect.top + rect.height * .32)) / Math.max(180, rect.height), -1, 1);
    const physics = mascotPhysics.get(mascot) || { x: 0, y: 0 };
    const response = .105 + index * .012;
    physics.x += (desiredX - physics.x) * response;
    physics.y += (desiredY - physics.y) * response;
    mascotPhysics.set(mascot, physics);
    const personality = [1.05, .72, .48, 1.18][index];
    body.style.transform = 'translate3d(' + (physics.x * 5 * personality).toFixed(2) + 'px, ' + (physics.y * 3).toFixed(2) + 'px, 0) rotate(' + (physics.x * 3.2 * personality).toFixed(2) + 'deg)';
    mascot.querySelectorAll('.pupil').forEach(function (pupil) {
      const limit = mascot.matches('.mascot-orange, .mascot-yellow') ? 3.2 : 6.4;
      pupil.style.transform = 'translate(calc(-50% + ' + (physics.x * limit).toFixed(2) + 'px), calc(-50% + ' + (physics.y * limit).toFixed(2) + 'px))';
    });
  });
  loginAnimationFrame = requestAnimationFrame(animateMascots);
}
function startMascotMotion() {
  if (!loginAnimationFrame) loginAnimationFrame = requestAnimationFrame(animateMascots);
}

function showLoginGate() {
  const experience = $('login-experience');
  const shell = $('app-shell');
  if (!experience || !shell) return;
  experience.hidden = false;
  shell.inert = true;
  shell.setAttribute('aria-hidden', 'true');
  document.body.classList.add('auth-pending');
  document.body.classList.remove('auth-complete');
  startMascotMotion();
  refreshIcons();
}
function updateIdentityChrome() {
  const name = state.authSession.name || state.profile.username || '张三';
  const initial = (name || '校').slice(0, 1);
  const sbName = document.querySelector('#sidebar-profile-btn strong');
  if (sbName) sbName.textContent = name;
  const sbAvatar = document.querySelector('#sidebar-profile-btn .avatar');
  if (sbAvatar) sbAvatar.textContent = initial;
  const taAvatar = document.querySelector('#top-avatar-btn .avatar-circle');
  if (taAvatar) taAvatar.textContent = initial;
}
function unlockApp() {
  const experience = $('login-experience');
  const shell = $('app-shell');
  if (!experience || !shell) return;
  experience.hidden = true;
  shell.inert = false;
  shell.removeAttribute('aria-hidden');
  document.body.classList.remove('auth-pending');
  document.body.classList.add('auth-complete');
  updateIdentityChrome();
  render();
  maybeShowProfileOnboarding();
}
async function syncLoginGate() {
  try {
    const session = await apiFetch('/api/auth/session');
    state.authSession = session || state.authSession;
    if (session && session.profile) state.profile = Object.assign({}, state.profile, session.profile);
  } catch (e) {}
  if (state.authSession.dev_bypass || ((state.authSession.phone_authenticated || state.authSession.email_authenticated) && hasStoredLogin())) {
    unlockApp();
  } else {
    showLoginGate();
  }
}
function maybeShowProfileOnboarding() {
  const dialog = $('profile-onboarding-dialog');
  if (!dialog || dialog.open || !state.authSession.user_id) return;
  if (!state.authSession.needs_onboarding && state.profile.profile_complete) return;
  const form = $('profile-onboarding-form');
  if (form && !form.dataset.hydrated) {
    $('onboarding-username').value = state.profile.username || state.authSession.name || '';
    form.dataset.hydrated = 'true';
  }
  dialog.showModal();
  refreshIcons();
  requestAnimationFrame(function () { const u = $('onboarding-username'); if (u) u.focus(); });
}

function setLoginMessage(element, message, success) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle('is-success', !!success);
}
function setLoginBusy(form, busy) {
  const button = form && form.querySelector('.login-submit');
  if (!button) return;
  if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
  button.disabled = busy;
  button.innerHTML = busy ? '<span class="login-button-spinner" aria-hidden="true"></span><span>Signing in...</span>' : button.dataset.originalHtml;
  refreshIcons();
}
function failLogin(form, message) {
  setLoginBusy(form, false);
  setLoginMessage(form && form.querySelector('.login-message'), message);
  pulseLoginMood('error');
}
function completeLogin(result, persistent, form) {
  state.authSession = result;
  state.profile = result.profile || state.profile;
  rememberLogin(persistent);
  rememberAccount(result, persistent);
  setLoginBusy(form, false);
  setLoginMessage(form && form.querySelector('.login-message'), 'Welcome to SURF Campus.', true);
  pulseLoginMood('success', 620);
  loadPoints();
  window.setTimeout(function () {
    unlockApp();
    showToast('登录成功，欢迎回到 SURF Campus');
    maybeShowProfileOnboarding();
  }, 620);
}

function switchLoginMode(mode, focus) {
  const emailForm = $('email-login-form');
  const registerForm = $('email-register-form');
  const phoneForm = $('login-phone-form');
  const showPhone = mode === 'phone';
  emailEntryMode = 'login';
  emailForm.hidden = emailEntryMode !== 'login';
  emailForm.classList.toggle('is-secondary', showPhone && emailEntryMode === 'login');
  registerForm.hidden = showPhone || emailEntryMode !== 'register';
  phoneForm.hidden = !showPhone;
  document.querySelectorAll('[role="tab"][data-login-mode]').forEach(function (tab) {
    const active = tab.dataset.loginMode === mode;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  loginFocusTarget = null;
  setLoginMood('idle');
  if (focus !== false) requestAnimationFrame(function () { const el = $(showPhone ? 'login-phone' : 'login-email'); if (el) el.focus(); });
}
function switchEmailEntry(mode, focus) {
  emailEntryMode = mode;
  $('email-login-form').hidden = mode !== 'login';
  $('email-register-form').hidden = mode !== 'register';
  $('login-heading').querySelector('h2').textContent = mode === 'register' ? 'Create your account' : 'Welcome back!';
  $('login-heading').querySelector('p').textContent = mode === 'register' ? 'Verify your email to get started' : 'Please enter your details';
  $('create-account').parentElement.hidden = mode === 'register';
  document.querySelectorAll('[role="tab"][data-login-mode]').forEach(function (tab) {
    const active = tab.dataset.loginMode === 'email';
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  loginFocusTarget = null;
  setLoginMood('idle');
  if (focus !== false) requestAnimationFrame(function () { const el = $(mode === 'register' ? 'register-email' : 'login-email'); if (el) el.focus(); });
}

function startCodeCountdown(button, seconds) {
  const oldTimer = loginCodeTimers.get(button.id);
  if (oldTimer) window.clearInterval(oldTimer);
  let remaining = seconds || 30;
  button.disabled = true;
  button.textContent = remaining + 's';
  const timer = window.setInterval(function () {
    remaining -= 1;
    button.textContent = remaining > 0 ? remaining + 's' : '重新发送';
    if (remaining <= 0) {
      window.clearInterval(timer);
      loginCodeTimers.delete(button.id);
      button.disabled = false;
    }
  }, 1000);
  loginCodeTimers.set(button.id, timer);
}
function showCodeSentMessage(element, response, label) {
  const debug = response.debug_code ? ' 本地演示验证码：' + response.debug_code : '';
  setLoginMessage(element, label + '已发送，有效期 10 分钟。' + debug, true);
}

function initLoginExperience() {
  const experience = $('login-experience');
  if (!experience) return;
  startMascotMotion();
  switchLoginMode('phone', false);
  $('remember-login').checked = hasStoredLogin() || $('remember-login').checked;
  $('remember-phone').checked = hasStoredLogin() || $('remember-phone').checked;

  window.addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch' || loginFocusTarget) return;
    loginPointer = { x: event.clientX, y: event.clientY };
  }, { passive: true });

  experience.addEventListener('focusin', function (event) {
    if (!event.target.matches('input')) return;
    if (event.target.closest('#email-login-form') && emailEntryMode === 'login') switchLoginMode('email', false);
    loginFocusTarget = event.target;
    setLoginMood(event.target.id === 'login-password' ? (passwordIsVisible ? 'peek' : 'password') : 'email');
  });
  experience.addEventListener('focusout', function () {
    window.setTimeout(function () {
      if (!experience.contains(document.activeElement) || !document.activeElement.matches('input')) {
        loginFocusTarget = null;
        setLoginMood('idle');
      }
    }, 0);
  });
  experience.addEventListener('input', function (event) {
    const form = event.target.closest('.login-form');
    if (form) form.querySelector('.login-message').replaceChildren();
  });

  experience.addEventListener('click', function (event) {
    const modeButton = event.target.closest('[data-login-mode]');
    if (modeButton) { switchLoginMode(modeButton.dataset.loginMode); return; }
    if (event.target.closest('#password-toggle')) {
      const input = $('login-password');
      passwordIsVisible = input.type === 'password';
      input.type = passwordIsVisible ? 'text' : 'password';
      const toggle = $('password-toggle');
      toggle.setAttribute('aria-pressed', String(passwordIsVisible));
      toggle.setAttribute('aria-label', passwordIsVisible ? '隐藏密码' : '显示密码');
      toggle.innerHTML = '<i data-lucide="' + (passwordIsVisible ? 'eye-off' : 'eye') + '"></i>';
      loginFocusTarget = input;
      setLoginMood(passwordIsVisible ? 'peek' : 'password');
      refreshIcons();
      requestAnimationFrame(function () { input.focus({ preventScroll: true }); });
      return;
    }
    if (event.target.closest('#forgot-password')) { const d = $('password-reset-dialog'); if (d) d.showModal(); refreshIcons(); return; }
    const policy = event.target.closest('[data-login-policy]');
    if (policy) {
      const content = policy.dataset.loginPolicy === 'privacy'
        ? '我们只保存完成登录、找回密码和校园身份绑定所需的数据。密码使用带随机盐的 PBKDF2 哈希保存，手机号以掩码形式展示；数据仅用于 SURF Campus 的账号与社区功能。'
        : '你可以使用手机号验证码登录，也可以使用邮箱和密码登录。发布公开内容前需要绑定 XJTLU 校园身份；匿名树洞与实名话题分开处理。';
      $('login-policy-title').textContent = policy.dataset.loginPolicy === 'privacy' ? 'Privacy' : 'Terms';
      $('login-policy-content').textContent = content;
      const d = $('login-policy-dialog'); if (d) d.showModal();
      refreshIcons();
      return;
    }
    if (event.target.closest('#create-account')) { switchLoginMode('email', false); switchEmailEntry('register'); return; }
    if (event.target.closest('#send-code')) {
      const phone = $('login-phone').value.replace(/\D/g, '');
      if (phone.length !== 11) { failLogin($('login-phone-form'), '请先输入 11 位手机号。'); $('login-phone').focus(); return; }
      const button = $('send-code');
      api('/api/auth/phone/code', { method: 'POST', body: JSON.stringify({ phone: phone }) })
        .then(function (response) { startCodeCountdown(button, response.cooldown || 30); showCodeSentMessage($('phone-login-message'), response, '短信验证码'); })
        .catch(function (error) { setLoginMessage($('phone-login-message'), error.message); });
      return;
    }
    if (event.target.closest('#send-email-code')) {
      const email = $('register-email').value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) { setLoginMessage($('email-register-message'), '请输入有效的邮箱地址。'); $('register-email').focus(); return; }
      const button = $('send-email-code');
      api('/api/auth/email/code', { method: 'POST', body: JSON.stringify({ email: email }) })
        .then(function (response) { startCodeCountdown(button, response.cooldown || 30); showCodeSentMessage($('email-register-message'), response, '邮箱验证码'); })
        .catch(function (error) { setLoginMessage($('email-register-message'), error.message); });
      return;
    }
    if (event.target.closest('#send-reset-code')) {
      const email = $('reset-email').value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) { setLoginMessage($('reset-password-message'), '请输入有效的邮箱地址。'); return; }
      const button = $('send-reset-code');
      api('/api/auth/email/code', { method: 'POST', body: JSON.stringify({ email: email }) })
        .then(function (response) { startCodeCountdown(button, response.cooldown || 30); showCodeSentMessage($('reset-password-message'), response, '邮箱验证码'); })
        .catch(function (error) { setLoginMessage($('reset-password-message'), error.message); });
      return;
    }
    if (event.target.closest('[data-email-view]')) { switchEmailEntry(event.target.closest('[data-email-view]').dataset.emailView); }
  });

  $('email-login-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = $('login-email').value.trim();
    const password = $('login-password').value;
    if (!/^\S+@\S+\.\S+$/.test(email)) { failLogin(form, 'Please enter a valid email address.'); $('login-email').focus(); return; }
    if (password.length < 6) { failLogin(form, 'Password must be at least 6 characters.'); $('login-password').focus(); return; }
    setLoginBusy(form, true);
    try {
      const result = await api('/api/auth/email', { method: 'POST', body: JSON.stringify({ email: email, password: password }) });
      completeLogin(result, $('remember-login').checked, form);
    } catch (error) { failLogin(form, error.message); }
  });

  $('login-phone-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    const phone = $('login-phone').value.replace(/\D/g, '');
    const code = $('login-code').value.trim();
    if (phone.length !== 11) { failLogin(form, '请输入 11 位手机号。'); $('login-phone').focus(); return; }
    if (code.length !== 6) { failLogin(form, '请输入 6 位短信验证码。'); $('login-code').focus(); return; }
    setLoginBusy(form, true);
    try {
      const result = await api('/api/auth/phone', { method: 'POST', body: JSON.stringify({ phone: phone, code: code }) });
      completeLogin(result, $('remember-phone').checked, form);
    } catch (error) { failLogin(form, error.message); }
  });

  $('email-register-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = $('register-email').value.trim();
    const code = $('register-email-code').value.trim();
    const password = $('register-password').value;
    const confirmation = $('register-password-confirm').value;
    if (!/^\S+@\S+\.\S+$/.test(email)) { failLogin(form, '请输入有效的邮箱地址。'); $('register-email').focus(); return; }
    if (code.length !== 6) { failLogin(form, '请输入 6 位邮箱验证码。'); $('register-email-code').focus(); return; }
    if (password.length < 6) { failLogin(form, '密码至少需要 6 位。'); $('register-password').focus(); return; }
    if (password !== confirmation) { failLogin(form, '两次输入的密码不一致。'); $('register-password-confirm').focus(); return; }
    setLoginBusy(form, true);
    try {
      const result = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: email, code: code, password: password }) });
      completeLogin(result, true, form);
    } catch (error) { failLogin(form, error.message); }
  });

  const resetForm = $('password-reset-form');
  if (resetForm) resetForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const email = $('reset-email').value.trim();
    const code = $('reset-code').value.trim();
    const password = $('reset-password').value;
    if (!/^\S+@\S+\.\S+$/.test(email) || code.length !== 6 || password.length < 6) {
      setLoginMessage($('reset-password-message'), '请填写有效邮箱、6 位验证码和至少 6 位新密码。');
      return;
    }
    try {
      const result = await api('/api/auth/password/reset', { method: 'POST', body: JSON.stringify({ email: email, code: code, password: password }) });
      setLoginMessage($('reset-password-message'), result.message || '密码已更新，请登录。', true);
      window.setTimeout(function () { const d = $('password-reset-dialog'); if (d) d.close(); }, 650);
    } catch (error) { setLoginMessage($('reset-password-message'), error.message); }
  });

  document.querySelectorAll('[data-close-login-dialog]').forEach(function (button) { button.addEventListener('click', function () { button.closest('dialog').close(); }); });
}

function initProfileOnboardingGuard() {
  const dialog = $('profile-onboarding-dialog');
  if (dialog) dialog.addEventListener('cancel', function (event) { event.preventDefault(); });
  const mediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mediaQuery && mediaQuery.addEventListener) mediaQuery.addEventListener('change', function () {
    if (!state.theme || state.theme === 'system') document.documentElement.dataset.theme = '';
  });
  // 首次引导提交（本地更新 + 关闭）
  const form = $('profile-onboarding-form');
  if (form) form.addEventListener('submit', function (event) {
    event.preventDefault();
    const username = $('onboarding-username').value.trim();
    if (username.length < 2) { setLoginMessage($('profile-onboarding-message'), '用户名至少 2 个字符。'); return; }
    state.profile.username = username;
    state.profile.bio = $('onboarding-bio').value.trim();
    state.profile.birthday = $('onboarding-birthday').value;
    const avatarEl = form.querySelector('input[name="avatar"]:checked');
    if (avatarEl) state.profile.avatar = avatarEl.value;
    state.profile.profile_complete = true;
    state.authSession.name = username;
    state.authSession.needs_onboarding = false;
    updateIdentityChrome();
    if (dialog) dialog.close();
    showToast('资料已保存，欢迎进入校园');
  });
}
