'use strict';
/* ═══════════════════════════════════════════════════════════════
   SURF Campus i18n Engine
   实时中英文翻译系统 — DOM-based post-render translation
   ═══════════════════════════════════════════════════════════════ */

var SURF_LANG = 'zh'; // 'zh' or 'en'

/* ── Translation Dictionary ── */
var SURF_I18N = {
  /* ═══ Navigation ═══ */
  '校园话题':'Campus Topics','匿名树洞':'Anonymous Wall','活动':'Events',
  '组队招募':'Team Up','课程资料':'Resources','课程问答':'Q&A',
  '教师咨询':'Teachers','通讯录':'Directory','通知':'Notifications',
  '发布话题':'New Post','问问AI':'Ask AI',
  '话题':'Topics','组队':'Teams',

  /* ═══ Login Page ═══ */
  'Welcome back!':'Welcome back!','Please enter your details':'Please enter your details',
  '手机号':'Phone','在此设备保持登录':'Keep me signed in',
  '使用手机号登录':'Sign in with phone','使用邮箱登录':'Sign in with email',
  'Log in':'Log in','Sign up':'Sign up',
  "Don't have an account?":"Don't have an account?",
  'Forgot password?':'Forgot password?','显示密码':'Show password',
  '邮箱地址':'Email','邮箱验证码':'Email Code','设置密码':'Set Password',
  '确认密码':'Confirm Password','创建账号':'Create Account',
  '已有账号？返回登录':'Already have an account? Back to login',
  '获取验证码':'Send Code','手机号登录':'Phone Sign In',
  '提示：演示环境验证码为':'Hint: demo verification code is','可直接输入登录。':'Just enter it to log in.',
  'Protected campus access':'Protected campus access',
  'Account recovery':'Account Recovery','找回邮箱密码':'Recover Password',
  '验证码会发送到你的邮箱；本地演示环境会直接显示验证码。':'Code will be sent to your email. Demo mode shows it directly.',
  '新密码':'New Password','更新密码':'Update Password',
  '先认识一下你':'Let\'s get to know you',
  '设置一次公开资料，之后可以在设置中随时修改。生日只用于你的个人资料，不会出现在公共话题流。':'Set up your profile once. Birthday is private and won\'t appear in public feed.',
  '选择头像':'Choose Avatar','晴日':'Sunny','海风':'Sea Breeze','新芽':'Sprout',
  '星光':'Star','灵感':'Spark','月亮':'Moon',
  '用户名':'Username','别人会这样称呼你':'How others will address you',
  '简介':'Bio','可选':'Optional','一句话介绍你的兴趣或正在做的事':'One line about your interests',
  '生日':'Birthday','保存资料并进入校园':'Save & Enter Campus',
  '校内身份已验证':'Campus identity verified',
  '公开内容默认实名':'Public content is real-name by default',

  /* ═══ Search ═══ */
  '搜索话题、Tag、资料、问答或活动':'Search topics, tags, resources, Q&A or events',

  /* ═══ Feed ═══ */
  '从学术问题到校园生活，按分区连续阅读。':'From academic questions to campus life, browse by section.',
  '全部':'All','学术':'Academic','校园生活':'Campus Life','组队':'Teams',
  '还没有话题':'No topics yet','发布第一个发现或问题':'Be the first to post',
  '重要通知':'Important Notice','返回话题流':'Back to Feed',
  '返回':'Back','该用户设置了主页隐私':'This user\'s profile is private',
  '选择不公开主页。':'chose to keep their profile private.',
  '已添加联系人':'Contact Added','添加联系人':'Add Contact',
  '发消息':'Message','发布的话题':'Posted Topics','篇':'posts',
  '还没有发布过话题':'No posts yet','这个人很懒，什么都没有写':'No bio yet',
  '开启':'Enable','关闭':'Disable','我的主页公开':'My Profile Public',

  /* ═══ Profile ═══ */
  '我的资料':'My Profile','我的帖子':'My Posts','我的收藏':'My Bookmarks',
  '我的简历':'My Resumes','偏好设置':'Preferences',
  '校内身份已验证':'Verified','认证审核中':'Pending Review','未认证':'Unverified',
  '已退出登录（Demo）':'Logged out (Demo)',

  /* ═══ Post Actions ═══ */
  '收藏':'Bookmark','取消收藏':'Unbookmark','评论':'Comment','分享':'Share',
  '点赞':'Like','已赞':'Liked','举报':'Report',
  '条评论':'comments','看过':'views','人赞':'likes',

  /* ═══ Composer ═══ */
  '说点什么...':'Say something...','标题':'Title','标签':'Tags',
  '用逗号分隔':'comma separated','发布':'Post','取消':'Cancel',
  '匿名发布':'Post Anonymously','添加图片':'Add Image',

  /* ═══ Notifications ═══ */
  '全部':'All','紧急':'Urgent','普通':'Normal','可选':'Optional',
  '未读':'Unread','已读':'Read','全部已读':'Mark all read',
  '待处理':'Pending','已处理':'Processed','稍后看':'Later',
  '今天':'Today','昨天':'Yesterday','前天':'Day before yesterday',
  '周日':'Sun','周一':'Mon','周二':'Tue','周三':'Wed','周四':'Thu','周五':'Fri','周六':'Sat',
  '没有更多通知了':'No more notifications','暂无通知':'No notifications',
  '收起':'Collapse','筛选':'Filter','时间范围':'Time Range',
  '最近3天':'Last 3 days','本周':'This week','本月':'This month','自定义':'Custom',
  '通知设置':'Notification Settings','清空所有通知':'Clear all notifications',

  /* ═══ Resources ═══ */
  '课程资料中心':'Resource Center','搜索资料标题、课程代码':'Search by title or course code',
  '上传资料':'Upload','下载':'Download','下载次数':'downloads',
  '收藏成功':'Bookmarked','已收藏':'Bookmarked',
  '课程':'Course','类型':'Type','上传者':'Uploader','来源':'Source',
  '试卷':'Exam','讲义':'Notes','课件':'Slides','笔记':'Notes','资料':'Material',
  '官方':'Official','个人':'Personal','相关资料':'Related Resources',

  /* ═══ Points System 积分制 ═══ */
  '积分':'Points','积分解锁':'Points to Unlock','需解锁':'Locked',
  '资料库积分规则':'Resource Library Points Rules',
  '该资料需要积分解锁':'This resource requires points to unlock',
  '立即解锁':'Unlock Now','解锁成功':'Unlocked successfully',
  '积分不足':'Not enough points','解锁':'Unlock',
  '上传资料赚积分':'Upload to earn points',
  '我知道了':'Got it',
  '上传成功':'Uploaded successfully',
  '已下载':'Downloaded',
  '返回资料库':'Back to Library',
  '次下载':' downloads',
  '实验指导':'Lab Guide','复习提纲':'Review Outline','作业':'Assignment',

  /* ═══ Q&A ═══ */
  '课程问答':'Course Q&A','提问':'Ask','待解决':'Unsolved','已解决':'Solved',
  '精华':'Featured','热门':'Hot','最新':'Latest','全部':'All',
  '浏览':'views','赞':'votes','回答':'answers','最佳答案':'Best Answer',
  '采纳':'Accept','回复':'Reply','写回复':'Write reply',
  '我要提问':'Ask a Question','问题标题':'Question title',
  '问题详情':'Question details','选择课程':'Select course',
  '返回问答列表':'Back to Q&A','暂无回答':'No answers yet',

  /* ═══ Directory ═══ */
  '通讯录':'Directory','搜索姓名、学院或标签':'Search name, school or tags',
  '教师':'Teachers','学生':'Students','在线':'Online','离线':'Offline','忙碌':'Busy',
  '可预约时间':'Available time','发消息':'Message','查看主页':'View Profile',
  '教授':'Professor','副教授':'Associate Prof','助教':'TA','博士':'PhD',
  '硕士':'Master','大三':'Year 3','大二':'Year 2','大一':'Year 1','大四':'Year 4',

  /* ═══ Teachers ═══ */
  '教师咨询':'Teacher Consultation','预约':'Book','咨询':'Consult',
  '可预约':'Available','已预约':'Booked','办公室':'Office',
  '研究方向':'Research Areas','简介':'Bio',

  /* ═══ Events ═══ */
  '活动':'Events','活动详情':'Event Details','报名':'Register',
  '已报名':'Registered','取消报名':'Cancel Registration',
  '活动时间':'Time','活动地点':'Location','主办方':'Organizer',
  '报名人数':'Registered','剩余名额':'Spots left','免费':'Free',
  '已结束':'Ended','进行中':'Ongoing','即将开始':'Starting soon',
  '返回活动列表':'Back to Events',

  /* ═══ Opportunities ═══ */
  '组队招募':'Team Up','发布招募':'Post Opportunity',
  '竞赛组队':'Competition','科研组队':'Research','项目组队':'Project',
  '全部':'All','角色':'Role','模式':'Mode','技能':'Skills',
  '查看详情':'View Details','申请':'Apply','打招呼':'Say Hi',
  '返回列表':'Back to List',

  /* ═══ Treehole ═══ */
  '匿名树洞':'Anonymous Wall','发树洞':'Post Anonymously',
  '匿名':'Anon','树洞详情':'Post Detail',

  /* ═══ AI Assistant ═══ */
  'AI 助手':'AI Assistant','问问AI':'Ask AI',
  '有什么可以帮你的？':'How can I help?','发送':'Send',
  '正在思考...':'Thinking...','清空对话':'Clear chat',

  /* ═══ Toast Messages ═══ */
  '已设为默认简历':'Set as default resume','简历已删除':'Resume deleted',
  '已新建简历草稿':'New resume draft created','默认主页已更新':'Default page updated',
  '已公开':'Made public','已设为私密':'Set to private',
  '收藏成功':'Bookmarked successfully','已取消收藏':'Unbookmarked',
  '报名成功':'Registered successfully','已取消报名':'Registration cancelled',
  '发布成功':'Posted successfully','回复成功':'Reply posted',
  '提问成功':'Question posted','点赞成功':'Liked',
  '同步失败':'Sync failed','操作失败':'Operation failed',

  /* ═══ Misc ═══ */
  '加载中...':'Loading...','暂无数据':'No data yet','查看全部':'View all',
  '展开':'Expand','收起':'Collapse','确认':'Confirm','删除':'Delete',
  '编辑':'Edit','保存':'Save','下一步':'Next','上一步':'Back','完成':'Done',
  '是':'Yes','否':'No','同意':'Agree','不同意':'Disagree',

  /* ═══ Mock Data: Posts ═══ */
  '求 CSE101 期末复习资料和往年试题':'Looking for CSE101 final review materials and past papers',
  '马上期末了，有没有学长学姐分享下CSE101的复习资料和往年试卷？万分感谢！🙏':'Finals are coming, can any seniors share CSE101 review materials and past papers? Thanks! 🙏',
  '图书馆B2自习区wifi信号太差了':'Library B2 study area WiFi signal is terrible',
  '最近在图书馆B2层自习，发现靠窗户那排座位的校园网信号非常不稳定。有没有遇到同样情况的同学？':'Recently studying in Library B2, found the campus WiFi near the window seats very unstable. Anyone else experiencing this?',
  '2026 RoboMaster战队补强招募':'2026 RoboMaster Team Reinforcement Recruitment',
  '交换到南洋理工的体验 — AMA':'Exchange at NTU Experience — AMA',

  /* ═══ Mock Data: Notifications ═══ */
  '【预约确认】':'[Booking Confirmed] ','【教务通知】':'[Academic Affairs] ',
  '【RA申请结果】':'[RA Application Result] ','【老师回复】':'[Teacher Reply] ',
  '【报名成功】':'[Registration Success] ','【新评论】':'[New Comment] ',
  '【点赞】':'[Like] ','【活动提醒】':'[Event Reminder] ',
  '【资料更新】':'[Resource Update] ','【报名提醒】':'[Registration Reminder] ',
  '【热门推荐】':'[Trending] ','【新资料】':'[New Resource] ',
  '【活动预告】':'[Event Preview] ','【系统维护】':'[System Maintenance] ',
  '【图书馆】':'[Library] ','【就业指导中心】':'[Career Center] ',

  /* ═══ Section Meta ═══ */
  '学术':'Academic','校园生活':'Campus Life',

  /* ═══ Profile Detail ═══ */
  '计算机科学 · 大三':'Computer Science · Year 3',
  '编辑资料':'Edit Profile','身份认证':'Verify Identity',
  '我的发布':'My Posts','我的收藏':'My Bookmarks',
  '我的活动':'My Events','我的招募':'My Opportunities',

  /* ═══ Time ═══ */
  '刚刚':'just now','分钟前':'min ago','小时前':'hr ago','天前':'days ago',
  '月':'/','日':'',

  /* ═══ Status ═══ */
  '在线':'Online','离线':'Offline','忙碌':'Busy',
};

/* ── Reverse dictionary for en→zh (not needed but available) ── */

/* ── Core translation function ── */
function T(zh) {
  if (SURF_LANG === 'zh') return zh;
  return translateString(zh);
}

/* ═══════════════════════════════════════════════════════════
   Dynamic translation layer
   For content NOT in the static dictionary (new posts, new
   teachers, new team posts, chat messages, AI replies...),
   strings are queued and batch-translated by the backend
   (/api/translate, DeepSeek-backed). Results are cached in
   localStorage so each unique string is only translated once.
   ═══════════════════════════════════════════════════════════ */
var SURF_DYN = {};
try { SURF_DYN = JSON.parse(localStorage.getItem('surf-i18n-cache') || '{}') || {}; } catch(e) { SURF_DYN = {}; }

var I18N_PENDING = {};   // queued, waiting to be sent
var I18N_FAILED = {};    // failed this session — don't retry (avoids loops)
var I18N_TIMER = null;
var I18N_AVAILABLE = true; // false after all backends fail (e.g. static-only deploy)

/* Translate API bases, tried in order:
   1. same-origin  (frontend served by the backend, e.g. localhost:8080)
   2. local backend (frontend opened from a static server, e.g. localhost:3456)
   Override before loading this file: window.SURF_TRANSLATE_BASES = ['https://your-api'] */
var I18N_API_BASES = (typeof window !== 'undefined' && window.SURF_TRANSLATE_BASES) || ['', 'http://localhost:8080'];
var I18N_BASE_IDX = 0;

function i18nSaveCache() {
  try {
    var keys = Object.keys(SURF_DYN);
    if (keys.length > 4000) {
      // drop oldest half to stay under localStorage quota
      keys.slice(0, Math.floor(keys.length / 2)).forEach(function(k) { delete SURF_DYN[k]; });
    }
    localStorage.setItem('surf-i18n-cache', JSON.stringify(SURF_DYN));
  } catch(e) {
    try { localStorage.removeItem('surf-i18n-cache'); } catch(e2) {}
  }
}

function i18nQueueDynamic(text) {
  if (!text || I18N_FAILED[text] || I18N_PENDING[text]) return;
  I18N_PENDING[text] = true;
  if (I18N_TIMER) return;
  I18N_TIMER = setTimeout(i18nFlushQueue, 400);
}

function i18nFlushQueue() {
  I18N_TIMER = null;
  if (!I18N_AVAILABLE || SURF_LANG !== 'en') { I18N_PENDING = {}; return; }
  var texts = Object.keys(I18N_PENDING);
  I18N_PENDING = {};
  if (!texts.length) return;
  // keep at most 50 per request
  if (texts.length > 50) {
    var rest = texts.slice(50);
    rest.forEach(function(t) { I18N_PENDING[t] = true; });
    texts = texts.slice(0, 50);
    if (!I18N_TIMER) I18N_TIMER = setTimeout(i18nFlushQueue, 600);
  }
  fetch(I18N_API_BASES[I18N_BASE_IDX] + '/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts: texts, target: 'en' })
  }).then(function(r) {
    if (r.status === 404) throw new Error('no-backend');
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  }).then(function(d) {
    var got = (d && d.translations) || {};
    var changed = false;
    texts.forEach(function(t) {
      var v = got[t];
      if (typeof v === 'string' && v && v !== t && !SURF_DYN[t]) {
        SURF_DYN[t] = v;
        changed = true;
      } else if (!v || v === t) {
        I18N_FAILED[t] = true; // untranslated: never re-queue this session
      }
    });
    if (changed) {
      i18nSaveCache();
      applyI18N(); // re-run: cached runs now get replaced
    }
  }).catch(function() {
    // this base failed — try the next one (e.g. static server → local backend)
    if (I18N_BASE_IDX < I18N_API_BASES.length - 1) {
      I18N_BASE_IDX++;
      texts.forEach(function(t) { I18N_PENDING[t] = true; });
      if (!I18N_TIMER) I18N_TIMER = setTimeout(i18nFlushQueue, 300);
      return;
    }
    // all backends missing/unreachable — disable dynamic layer for this session
    I18N_AVAILABLE = false;
    I18N_PENDING = {};
  });
}

/* ── Run-based translation: split a string into Chinese runs and translate each.
   A run is translated only if it exactly matches a dict key, OR can be fully
   segmented into dict keys (longest-prefix greedy). This avoids corrupting
   untranslated user content. ── */
var I18N_RUN_RE = /[\u4e00-\u9fff\u3400-\u4dbf，。、；：？！「」『』（）《》·—…～￥]+/g;
var I18N_KEYS_SORTED = null;

function i18nSortedKeys() {
  if (I18N_KEYS_SORTED) return I18N_KEYS_SORTED;
  var keys = [];
  for (var k in SURF_I18N) {
    if (Object.prototype.hasOwnProperty.call(SURF_I18N, k) && k) keys.push(k);
  }
  // longest first so greedy prefix segmentation prefers long keys
  keys.sort(function(a, b) { return b.length - a.length; });
  I18N_KEYS_SORTED = keys;
  return keys;
}
// invalidate cache when data dicts merge in
var _origAssign = Object.assign;
SURF_I18N.__flush = function() { I18N_KEYS_SORTED = null; };

function translateRun(run) {
  if (Object.prototype.hasOwnProperty.call(SURF_I18N, run)) return SURF_I18N[run];
  // dynamic cache (LLM-translated content: new posts, teachers, teams...)
  if (Object.prototype.hasOwnProperty.call(SURF_DYN, run)) return SURF_DYN[run];
  // try greedy full segmentation (UI phrases composed of dict keys)
  var keys = i18nSortedKeys();
  var out = [];
  var rest = run;
  var progressed = true;
  while (rest.length > 0 && progressed) {
    progressed = false;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.length <= rest.length && rest.slice(0, k.length) === k) {
        out.push(SURF_I18N[k]);
        rest = rest.slice(k.length);
        progressed = true;
        break;
      }
    }
  }
  if (rest.length === 0) return out.join('');
  // unknown content → queue for backend dynamic translation
  i18nQueueDynamic(run);
  return run; // shows original Chinese until translation arrives
}

function translateString(text) {
  if (!text) return text;
  I18N_RUN_RE.lastIndex = 0;
  var m, result = '', last = 0;
  while ((m = I18N_RUN_RE.exec(text)) !== null) {
    result += text.slice(last, m.index);
    result += translateRun(m[0]);
    last = m.index + m[0].length;
  }
  result += text.slice(last);
  return result;
}

/* ── Toggle language ── */
function toggleLang() {
  SURF_LANG = SURF_LANG === 'zh' ? 'en' : 'zh';
  document.documentElement.lang = SURF_LANG === 'zh' ? 'zh-CN' : 'en';

  // Update toggle button icon/label
  var btn = document.getElementById('lang-toggle');
  if (btn) {
    var label = btn.querySelector('.lang-label');
    if (label) label.textContent = SURF_LANG === 'zh' ? 'EN' : '中';
  }

  // Save preference
  try { localStorage.setItem('surf-lang', SURF_LANG); } catch(e) {}

  // Re-render the current view
  if (typeof render === 'function') {
    render();
  }

  // Apply translations to static HTML
  applyI18N();

  // Show toast
  if (typeof toast === 'function') {
    toast(SURF_LANG === 'zh' ? '已切换为中文' : 'Switched to English');
  }
}

/* ── Apply translations to DOM (static + dynamic) ── */
function applyI18N() {
  if (SURF_LANG === 'zh') {
    // Restore Chinese: reload to original state is complex, so we re-render
    // The render functions output Chinese by default, so just re-render
    return;
  }

  // 1. Translate [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (SURF_I18N[key]) {
      el.textContent = SURF_I18N[key];
    }
  });

  // 2. Translate [data-i18n-placeholder] elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (SURF_I18N[key]) {
      el.setAttribute('placeholder', SURF_I18N[key]);
    }
  });

  // 3. Translate [data-i18n-aria] elements
  document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-aria');
    if (SURF_I18N[key]) {
      el.setAttribute('aria-label', SURF_I18N[key]);
    }
  });

  // 4. Walk text nodes and translate known phrases
  translateTextNodes(document.body);
}

/* ── Walk text nodes and replace Chinese with English ── */

/* Username-bearing elements — user-chosen names are NOT translated */
var I18N_NAME_CLASS_RE = /(profile-name-btn|profile-hero-name|qa-author|comment-name|reply-author|qa-reply-author|td-review-author|initiator-name|m-name|nickname|username|chat-name|msg-author|sender-name)/;

function i18nIsNameNode(node) {
  var p = node.parentElement;
  if (!p) return false;
  var c = p.className;
  return typeof c === 'string' && I18N_NAME_CLASS_RE.test(c);
}

function translateTextNodes(root) {
  if (SURF_LANG !== 'en') return;

  var walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        var p = node.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        // Skip script/style nodes
        var tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
        // Skip empty nodes
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        // Skip user-chosen usernames
        if (i18nIsNameNode(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  var nodes = [];
  var node;
  while (node = walker.nextNode()) {
    nodes.push(node);
  }

  nodes.forEach(function(n) {
    var text = n.nodeValue;
    var translated = translateString(text);
    if (translated !== text) n.nodeValue = translated;
  });

  // 5. Translate placeholders
  document.querySelectorAll('[placeholder]').forEach(function(el) {
    var ph = el.getAttribute('placeholder');
    if (ph && /[\u4e00-\u9fff]/.test(ph)) {
      var t = translateString(ph);
      if (t !== ph) el.setAttribute('placeholder', t);
    }
  });

  // 6. Translate aria-labels
  document.querySelectorAll('[aria-label]').forEach(function(el) {
    var al = el.getAttribute('aria-label');
    if (al && /[\u4e00-\u9fff]/.test(al)) {
      var t = translateString(al);
      if (t !== al) el.setAttribute('aria-label', t);
    }
  });

  // 7. Translate title attributes
  document.querySelectorAll('[title]').forEach(function(el) {
    var t0 = el.getAttribute('title');
    if (t0 && /[\u4e00-\u9fff]/.test(t0)) {
      var t = translateString(t0);
      if (t !== t0) el.setAttribute('title', t);
    }
  });
}

/* ── Init: load saved language preference ── */
(function() {
  try {
    var saved = localStorage.getItem('surf-lang');
    if (saved === 'en') {
      SURF_LANG = 'en';
      document.documentElement.lang = 'en';
    }
  } catch(e) {}
})();

/* ── MutationObserver: auto-translate dynamically added content ── */
var i18nObserverTimer = null;
function scheduleI18NCheck() {
  if (i18nObserverTimer) return;
  i18nObserverTimer = setTimeout(function() {
    i18nObserverTimer = null;
    if (SURF_LANG === 'en') applyI18N();
  }, 80);
}

if (typeof MutationObserver !== 'undefined') {
  var i18nObserver = new MutationObserver(function(mutations) {
    if (SURF_LANG !== 'en') return;
    var hasChanges = false;
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length > 0) { hasChanges = true; break; }
    }
    if (hasChanges) scheduleI18NCheck();
  });
  // Start observing after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      i18nObserver.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    i18nObserver.observe(document.body, { childList: true, subtree: true });
  }
}
