/* XJTLU Virtual Campus — Demo JavaScript */

// ==================== 页面导航 ====================

function $(id) { return document.getElementById(id); }

// ==================== API 配置 ====================
// 后端地址：同源部署留空；用 file:// 直接打开时自动指向本地后端
// ⚠️ 8000 端口若被旧版后端占用，临时改用 8001；旧进程停掉后可改回 8000
const API_BASE = localStorage.getItem('campus_api_base') ||
  (location.protocol === 'file:' ? 'http://127.0.0.1:8000' : '');

function getToken() { return localStorage.getItem('campus_token'); }
function setToken(t) { localStorage.setItem('campus_token', t); }
function clearToken() { localStorage.removeItem('campus_token'); localStorage.removeItem('campus_user'); }
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('campus_user')); } catch (e) { return null; }
}

async function api(path, options = {}) {
  const headers = options.headers || {};
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (e) { /* 非 JSON 响应 */ }
  if (!res.ok) {
    throw new Error((data && data.detail) || ('请求失败 (' + res.status + ')'));
  }
  return data;
}

function switchTab(page) {
  // 隐藏所有页面
  document.querySelectorAll('.page-content:not(.sub-page)').forEach(p => p.style.display = 'none');
  // 显示选中页面
  $('page-' + page).style.display = 'block';
  // 更新 Tab 状态（手机底栏 + 桌面侧边栏）
  document.querySelectorAll('.tab-item, .nav-item').forEach(t => {
    t.classList.toggle('active', t.dataset.page === page);
  });
  // 更新标题
  $('header-title').textContent = {
    'feed': '动态广场',
    'academic': '学术中心',
    'events': '活动',
    'treehole': '匿名树洞',
    'profile': '我的'
  }[page] || 'XJTLU Campus';
  $('header-back').style.display = 'none';
  $('header-action').textContent = '';

  // 切换到动态/树洞/学术时刷新真实数据
  if (page === 'feed') renderPosts();
  if (page === 'treehole') renderTreehole();
  if (page === 'academic') renderMaterials();

  // 关闭所有 sub-page
  document.querySelectorAll('.sub-page').forEach(p => p.style.display = 'none');
}

function navigateTo(page) {
  $('header-back').style.display = 'inline';
  $('header-title').textContent = {
    'login': '登录',
    'register': '注册',
    'post-detail': '帖子详情',
    'treehole-detail': '树洞详情',
    'event-detail': '活动详情',
    'messages': '站内消息',
    'notifications': '通知中心',
    'settings': '设置',
    'post-create': '发布动态',
    'change-password': '修改密码',
    'edit-profile': '编辑资料',
    'search': '搜索'
  }[page] || 'XJTLU Campus';

  $('page-' + page).style.display = 'block';
}

function goBack() {
  document.querySelectorAll('.sub-page').forEach(p => p.style.display = 'none');
  $('header-back').style.display = 'none';
  // 恢复当前 tab 的标题
  const activeTab = document.querySelector('.tab-item.active');
  if (activeTab) switchTab(activeTab.dataset.page);
}

// ==================== Toast ====================

function showToast(msg, type) {
  const t = $('toast');
  t.textContent = msg;
  t.style.background = type === 'error' ? '#A32D2D' : '#333';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ==================== 初始化数据 ====================

const mockData = {
  posts: [
    { id: 1, title: '今天图书馆好多人', content: '今天图书馆从早上就满人了，期末氛围拉满！大家加油复习💪', anon: false, likes: 15, comments: 3, time: '2小时前' },
    { id: 2, title: '求组队参加黑客松', content: '下个月有个AI黑客松比赛，找2-3个队友，会Python/ML的优先！', anon: false, likes: 8, comments: 5, time: '昨天' },
    { id: 3, title: '吐槽一下食堂', content: '食堂今天中午的菜真的好咸...有没有同感的', anon: true, likes: 22, comments: 8, time: '昨天' },
    { id: 4, title: 'CSE101 期中考试回忆', content: '刚考完CSE101期中，分享一下题目类型供参考', anon: false, likes: 35, comments: 12, time: '2天前' },
    { id: 5, title: '周末羽毛球约球', content: '周六下午2点体育馆，2缺2，欢迎来玩~', anon: false, likes: 12, comments: 6, time: '3天前' }
  ],
  treehole: [
    { id: 1, content: '其实我挺害怕期末的，但不敢跟别人说...希望大家都能过🙏', likes: 45, comments: 7, time: '今天 08:00' },
    { id: 2, content: '今天终于鼓起勇气跟喜欢的人说了话，虽然只是借了支笔😊', likes: 68, comments: 15, time: '昨天 22:00' },
    { id: 3, content: '出国留学真的好焦虑，语言成绩还没考出来...', likes: 32, comments: 10, time: '昨天 19:30' }
  ],
  events: [
    { id: 1, title: 'AI 学术讲座：大语言模型前沿', date: '28', month: '7月', time: '14:00-16:00', loc: 'EB Hall', org: '计算机学院', registered: 45 },
    { id: 2, title: '社团招新嘉年华', date: '02', month: '8月', time: '10:00-17:00', loc: '中心广场', org: '社团联合会', registered: 120 },
    { id: 3, title: '英语角：Cross-Cultural Communication', date: '26', month: '7月', time: '15:00-17:00', loc: 'CB G12', org: '语言中心', registered: 18 },
    { id: 4, title: '大学生职业规划工作坊', date: '30', month: '7月', time: '13:00-15:00', loc: 'BS G02', org: '就业指导中心', registered: 32 }
  ],
  materials: [
    { name: 'CSE101 Week 3 课件', course: 'CSE101', type: '课件', uploader: '张明' },
    { name: 'Python 编程入门指南', course: 'CSE101', type: '参考资料', uploader: '王小明' },
    { name: '线性代数公式汇总', course: 'MTH201', type: '笔记', uploader: '李华' },
    { name: '学术英语写作模板', course: 'ENG103', type: '模板', uploader: 'Sarah Chen' }
  ],
  questions: [
    { q: 'Python 列表和元组的区别？', course: 'CSE101', answers: 3 },
    { q: '矩阵的秩怎么计算？', course: 'MTH201', answers: 2 },
    { q: '期末实验报告格式要求？', course: 'PHY102', answers: 1 }
  ],
  professors: [
    { name: '张明', dept: '计算机', research: '机器学习、NLP', office: '周二 15:00-17:00 EB210' },
    { name: '李华', dept: '数学', research: '代数拓扑', office: '周四 14:00-16:00 FB330' },
    { name: 'Sarah Chen', dept: '语言中心', research: '学术写作', office: '周三 14:00-16:00 CB347' }
  ],
  messages: [
    { from: '李四', content: '周末的英语角你去吗？', time: '昨天', unread: false },
    { from: '王小明', content: '作业写完了吗？', time: '前天', unread: true }
  ],
  notifications: [
    { content: '张三 赞了你的帖子', time: '2小时前', read: false },
    { content: '李四 评论了你的帖子', time: '今天 10:00', read: false },
    { content: 'AI讲座即将开始', time: '昨天', read: true }
  ]
};

// ==================== 渲染函数 ====================

function likePost(postId, el) {
  if (!getToken()) { showToast('请先登录', 'error'); navigateTo('login'); return; }
  api('/api/community/like?post_id=' + encodeURIComponent(postId), { method: 'POST' }).then(data => {
    if (data.likes !== undefined) {
      const count = el.querySelector('.like-count');
      if (count) count.textContent = data.likes;
    }
    showToast('已点赞 ❤️');
  }).catch(e => showToast(e.message, 'error'));
}

function collectPost(postId, el) {
  if (!getToken()) { showToast('请先登录', 'error'); navigateTo('login'); return; }
  api('/api/community/collect?post_id=' + encodeURIComponent(postId), { method: 'POST' }).then(data => {
    el.textContent = data.collected ? '🔖 已收藏' : '🔖 收藏';
    showToast(data.message || (data.collected ? '已收藏' : '已取消收藏'));
  }).catch(e => showToast(e.message, 'error'));
}

async function renderPosts() {
  const list = $('post-list');
  try {
    const data = await api('/api/community/feed');
    const posts = data.posts || [];
    if (!posts.length) {
      list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">还没有动态，快来发第一条吧 ✨</div>';
      return;
    }
    list.innerHTML = posts.map(p => {
      const imgs = (p['图片'] || []).map(u =>
        `<img class="post-card-img" src="${API_BASE}${u}" alt="图片" onclick="event.stopPropagation()">`
      ).join('');
      return `
    <div class="post-card" onclick="showToast('查看详情')">
      <div class="post-card-title">${p['匿名'] ? '🕊️ ' : ''}${p['标题'] || '分享'}</div>
      <div class="post-card-content">${p['内容']}</div>
      ${imgs ? `<div class="post-card-images">${imgs}</div>` : ''}
      <div class="post-card-meta">
        <span>${p['匿名'] ? '匿名' : (p['作者'] || '同学')}</span>
        <span>${p['时间']}</span>
      </div>
      <div class="post-card-actions">
        <span class="post-action" onclick="event.stopPropagation(); likePost('${p.id}', this)">❤️ <span class="like-count">${p['点赞']}</span></span>
        <span class="post-action">💬 ${p['评论']}</span>
        <span class="post-action" onclick="event.stopPropagation(); collectPost('${p.id}', this)">🔖 收藏</span>
      </div>
    </div>
  `;
    }).join('');
  } catch (e) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载失败：${e.message}</div>`;
  }
}

async function renderTreehole() {
  const list = $('treehole-list');
  try {
    const data = await api('/api/treehole/hot');
    const posts = data.hot_posts || [];
    if (!posts.length) {
      list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">树洞还空着，来说说话吧 🕊️</div>';
      return;
    }
    list.innerHTML = posts.map(p => `
    <div class="treehole-post" onclick="showToast('查看详情')">
      <div class="treehole-post-content">${p['内容']}</div>
      <div class="treehole-post-meta">
        <span>🕊️ 匿名</span>
        <span>${p['时间']}</span>
        <span>❤️ ${p['点赞']}</span>
        <span>💬 ${p['评论'] || 0}</span>
      </div>
    </div>
  `).join('');
  } catch (e) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载失败：${e.message}</div>`;
  }
}

function renderEvents() {
  const list = $('event-list');
  list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载中...</div>';
  api('/api/events').then(data => {
    const events = data.events || [];
    if (!events.length) {
      list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">暂无活动</div>';
      return;
    }
    list.innerHTML = events.map(e => {
      // 从完整时间串解析出日期和月份展示
      const t = e['时间'] || '';
      const day = (t.match(/\d{2}(?= )/) || [t.slice(8, 10)])[0] || '--';
      const month = (t.match(/\d{4}-(\d{2})/) || [])[1] ? (t.match(/\d{4}-(\d{2})/)[1] + '月') : '';
      const registered = e['报名'] || 0;
      const capacity = e['人数上限'] || 0;
      return `
    <div class="event-card" onclick="showEventDetail('${e.id}')">
      <div class="event-date-badge">
        <span class="event-date-day">${day}</span>
        <span class="event-date-month">${month}</span>
      </div>
      <div class="event-info">
        <div class="event-title">${escapeHtml(e['标题'] || '')}</div>
        <div class="event-detail">🕐 ${escapeHtml(t)} · 📍 ${escapeHtml(e['地点'] || '')}</div>
        <div class="event-detail">👤 ${escapeHtml(e['组织'] || '')} · 已报名 ${registered}${capacity ? '/' + capacity : ''}人</div>
        <button class="event-register-btn" data-id="${e.id}" onclick="event.stopPropagation(); registerEvent('${e.id}', this)">立即报名</button>
      </div>
    </div>
  `;
    }).join('');
  }).catch(e => {
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载失败：${e.message}</div>`;
  });
}

function registerEvent(eventId, btn) {
  if (!getToken()) { showToast('请先登录', 'error'); navigateTo('login'); return; }
  api('/api/events/register?event_id=' + encodeURIComponent(eventId), { method: 'POST' }).then(data => {
    showToast(data.message || (data.registered ? '报名成功！' : '已取消报名'));
    // 更新按钮状态
    if (data.registered) {
      btn.textContent = '✓ 已报名';
      btn.style.background = '#4CAF50';
    } else {
      btn.textContent = '立即报名';
      btn.style.background = '';
    }
    renderEvents(); // 刷新报名人数
  }).catch(e => showToast(e.message, 'error'));
}

function showEventDetail(eventId) {
  // 跳转活动详情页
  navigateTo('event-detail');
  const el = $('event-detail-content');
  el.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载中...</div>';
  api('/api/events/' + encodeURIComponent(eventId)).then(e => {
    if (e.message) { el.innerHTML = '<div style="text-align:center;padding:40px;">' + e.message + '</div>'; return; }
    el.innerHTML = `
      <div style="padding:20px;">
        <div style="font-size:20px;font-weight:700;margin-bottom:12px;">${escapeHtml(e['标题'] || '')}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">🕐 ${escapeHtml(e['时间'] || '')}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">📍 ${escapeHtml(e['地点'] || '')}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">👤 ${escapeHtml(e['组织'] || '')}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">已报名 ${e['报名'] || 0}${e['人数上限'] ? '/' + e['人数上限'] : ''} 人</div>
        <div style="font-size:14px;line-height:1.6;margin-bottom:20px;">${escapeHtml(e['描述'] || '')}</div>
        <button class="event-register-btn" style="width:100%;padding:12px;font-size:15px;" onclick="registerEvent('${e.id}', this)">立即报名</button>
      </div>
    `;
  }).catch(err => {
    el.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载失败：${err.message}</div>`;
  });
}

// ==================== 课程资料（以一换一） ====================

let materialQuota = null;

function renderMaterials() {
  const kw = $('material-search') ? $('material-search').value.trim() : '';
  api('/api/courses/resources' + (kw ? '?keyword=' + encodeURIComponent(kw) : ''))
    .then(d => {
      materialQuota = d.quota || null;
      renderQuotaBanner();
      renderMaterialList(d.resources || []);
    })
    .catch(e => {
      $('material-list').innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载失败：${escapeHtml(e.message)}</div>`;
    });
}

function filterMaterials() {
  renderMaterials();
}

function renderQuotaBanner() {
  const el = $('material-quota-banner');
  if (!el) return;
  if (!materialQuota) {
    el.innerHTML = `<span>📥 登录后查看每日下载额度</span><span class="quota-link" onclick="event.stopPropagation();navigateTo('login')">去登录 ›</span>`;
    return;
  }
  const limit = materialQuota['今日额度'];
  const remaining = materialQuota['剩余'];
  const bonus = materialQuota['分享奖励'];
  el.innerHTML = `<span>📥 今日剩余下载 <b>${remaining}</b>/${limit} 次</span><span class="quota-link">分享 +${bonus} · 规则 ›</span>`;
}

function renderMaterialList(resources) {
  const list = $('material-list');
  if (!resources.length) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 0;">
      还没有资料，点击下方「分享资料」成为第一个贡献者吧～<br>
      <span style="font-size:12px;">分享 1 份即可解锁 +2 次下载额度</span>
    </div>`;
    return;
  }
  list.innerHTML = resources.map(r => `
    <div class="material-item">
      <div class="material-name">📄 ${escapeHtml(r['名称'])}</div>
      <div class="material-meta">${escapeHtml(r['课程'])} · ${escapeHtml(r['类型'])} · ${escapeHtml(r['上传者'])} · 📥 ${r['下载次数']} 次</div>
      <button class="material-dl-btn" ${r['可下载'] ? '' : 'disabled'} onclick="event.stopPropagation();downloadResource('${r.id}')">${r['可下载'] ? '下载' : '暂无文件'}</button>
    </div>
  `).join('');
}

function downloadResource(id) {
  if (!getToken()) { showToast('请先登录', 'error'); navigateTo('login'); return; }
  fetch(API_BASE + '/api/resources/file/' + encodeURIComponent(id), {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  }).then(async res => {
    if (res.status === 402) {
      const d = await res.json().catch(() => null);
      if (d && d.detail && Array.isArray(d.detail.rules)) materialQuota = { ...(materialQuota || {}), rules: d.detail.rules };
      openRulesModal(true);
      return;
    }
    if (res.status === 401) { showToast('登录已过期，请重新登录', 'error'); navigateTo('login'); return; }
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      const msg = d && d.detail ? (typeof d.detail === 'string' ? d.detail : (d.detail.message || '下载失败')) : '下载失败';
      throw new Error(msg);
    }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'surf-' + id + '.download';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    showToast('下载成功，额度 -1');
    renderMaterials();
  }).catch(e => showToast(e.message, 'error'));
}

function openRulesModal(showUnlockTip) {
  const list = $('rules-list');
  const rules = (materialQuota && materialQuota.rules) || [
    '每位同学每天可免费下载 3 份课程资料',
    '分享 1 份资料，当日下载额度 +2 次',
    '下载额度每天 0 点重置，多分享多解锁',
    '资料仅限校内课程学习使用，请尊重原作者版权'
  ];
  list.innerHTML = rules.map(r => `<div class="rule-item">${escapeHtml(r)}</div>`).join('');
  $('rules-unlock-tip').style.display = showUnlockTip ? 'block' : 'none';
  $('rules-modal').style.display = 'flex';
}

function closeModal(id) {
  $(id).style.display = 'none';
}

let shareFile = null;

function openShareModal() {
  if (!getToken()) { showToast('请先登录', 'error'); navigateTo('login'); return; }
  $('share-modal').style.display = 'flex';
}

function pickShareFile(input) {
  shareFile = input.files && input.files[0] || null;
  $('share-file-name').textContent = shareFile ? `📎 ${shareFile.name}（${(shareFile.size / 1024 / 1024).toFixed(1)} MB）` : '';
}

function submitShare() {
  const title = $('share-title').value.trim();
  const course = $('share-course').value.trim();
  const type = $('share-type').value;
  if (!title) { showToast('请填写资料标题', 'error'); return; }
  if (!shareFile) { showToast('请选择要分享的文件', 'error'); return; }
  if (shareFile.size > 50 * 1024 * 1024) { showToast('文件不能超过 50MB', 'error'); return; }
  const fd = new FormData();
  fd.append('file', shareFile);
  showToast('资料上传中...');
  api('/api/upload/resource', { method: 'POST', body: fd })
    .then(d => {
      const params = new URLSearchParams({ title, filename: d.filename });
      if (course) params.set('course', course);
      if (type) params.set('type', type);
      return api('/api/courses/resources?' + params.toString(), { method: 'POST' });
    })
    .then(d => {
      showToast(d.message || '分享成功！今日额度 +2 ✨');
      closeModal('share-modal');
      $('share-title').value = '';
      $('share-course').value = '';
      $('share-type').selectedIndex = 0;
      $('share-file').value = '';
      $('share-file-name').textContent = '';
      shareFile = null;
      renderMaterials();
    })
    .catch(e => showToast(e.message, 'error'));
}

function renderQuestions() {
  const list = $('question-list');
  list.innerHTML = mockData.questions.map(q => `
    <div class="question-item" onclick="showToast('查看问答详情')">
      <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${q.q}</div>
      <div style="font-size:12px;color:var(--text-muted);">${q.course} · ${q.answers} 个回答</div>
    </div>
  `).join('');
}

function renderProfessors() {
  const list = $('professor-list');
  list.innerHTML = mockData.professors.map(p => `
    <div class="professor-card" onclick="showToast('查看教授详情')">
      <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${p.name}</div>
      <div style="font-size:12px;color:var(--text-muted);">${p.dept} · ${p.research}</div>
      <div style="font-size:12px;color:var(--text-muted);">🕐 ${p.office}</div>
    </div>
  `).join('');
}

function renderMessages() {
  const list = $('message-list');
  if (!getToken()) {
    list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">登录后查看站内消息</div>';
    return;
  }
  list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载中...</div>';
  api('/api/messages').then(data => {
    const convs = data.conversations || [];
    if (!convs.length) {
      list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">暂无消息</div>';
      return;
    }
    list.innerHTML = convs.map(m => `
    <div class="profile-menu-item" onclick="showToast('查看对话')">
      <span class="menu-icon">💬</span>
      <div style="flex:1;">
        <div style="font-weight:600;font-size:14px;">${escapeHtml(m['对方'] || '')}</div>
        <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(m['最后消息'] || '')}</div>
      </div>
      <span style="font-size:11px;color:var(--text-muted);">${escapeHtml(m['时间'] || '')}</span>
    </div>
  `).join('');
  }).catch(e => {
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载失败：${e.message}</div>`;
  });
}

function renderNotifications() {
  const list = $('notification-list');
  if (!getToken()) {
    list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">登录后查看通知</div>';
    return;
  }
  list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载中...</div>';
  api('/api/notifications').then(data => {
    const notifs = data.notifications || [];
    if (!notifs.length) {
      list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px 0;">暂无通知</div>';
      return;
    }
    list.innerHTML = notifs.map(n => `
    <div class="profile-menu-item" onclick="markNotificationRead('${n.id}')">
      <span class="menu-icon">🔔</span>
      <div style="flex:1;">
        <div style="font-size:14px;">${escapeHtml(n['内容'] || '')}</div>
        <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(n['时间'] || '')}</div>
      </div>
      ${!n['已读'] ? '<span class="menu-badge">新</span>' : ''}
    </div>
  `).join('');
  }).catch(e => {
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px 0;">加载失败：${e.message}</div>`;
  });
}

function markNotificationRead(id) {
  api('/api/notifications/read?notification_id=' + encodeURIComponent(id), { method: 'POST' })
    .then(() => renderNotifications())
    .catch(e => showToast(e.message, 'error'));
}

// ==================== 交互函数 ====================

function switchAcademicTab(tab, el) {
  document.querySelectorAll('.academic-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['materials', 'questions', 'professors'].forEach(p => {
    $('academic-' + p).style.display = p === tab ? 'block' : 'none';
  });
}

function toggleLanguage(el, lang) {
  document.querySelectorAll('.toggle-option').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  showToast(lang === 'zh' ? '已切换为中文' : 'Switched to English');
}

var loginMode = 'password';
function toggleLoginMode() {
  loginMode = loginMode === 'password' ? 'code' : 'password';
  $('login-password-group').style.display = loginMode === 'password' ? 'block' : 'none';
  $('login-code-group').style.display = loginMode === 'code' ? 'block' : 'none';
  $('login-mode-text').textContent = loginMode === 'password' ? '验证码登录' : '密码登录';
}

function handleLogin() {
  const identifier = $('login-identifier').value.trim();
  // 验证码登录模式：邮箱 + 验证码
  if (loginMode === 'code') {
    const code = $('login-code').value.trim();
    if (!identifier || !code) { showToast('请输入邮箱和验证码', 'error'); return; }
    api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, code })
    }).then(data => {
      setToken(data.token);
      localStorage.setItem('campus_user', JSON.stringify(data.user));
      showToast('登录成功！欢迎回来 👋');
      updateProfileUI();
      goBack();
      renderPosts();
    }).catch(e => showToast(e.message, 'error'));
    return;
  }
  // 密码登录模式
  const password = $('login-password').value;
  if (!identifier || !password) { showToast('请输入邮箱/用户名和密码', 'error'); return; }
  api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  }).then(data => {
    setToken(data.token);
    localStorage.setItem('campus_user', JSON.stringify(data.user));
    showToast('登录成功！欢迎回来 👋');
    updateProfileUI();
    goBack();
    renderPosts();
  }).catch(e => showToast(e.message, 'error'));
}

function handleRegister() {
  const name = $('reg-name').value.trim();
  const email = $('reg-email').value.trim();
  const code = $('reg-code').value.trim();
  const password = $('reg-password').value;
  if (!name || !email || !password || !code) { showToast('请填写完整信息（含验证码）', 'error'); return; }
  // 用邮箱前缀作为用户名（前端暂无用户名输入框）
  const username = (email.split('@')[0] || '').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';
  api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, name, code })
  }).then(data => {
    setToken(data.token);
    localStorage.setItem('campus_user', JSON.stringify(data.user));
    showToast('注册成功！已自动登录 🎉');
    updateProfileUI();
    switchTab('feed');
    renderPosts();
  }).catch(e => showToast(e.message, 'error'));
}

function handleLogout() {
  clearToken();
  showToast('已退出登录');
  updateProfileUI();
  switchTab('feed');
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function updateProfileUI() {
  const user = getCurrentUser();
  const name = user ? user.name : '未登录';
  const email = user ? (user.email || '') : '登录后开启校园之旅';
  const meta = user ? ((user.department || '') + (user.role === 'professor' ? ' · 教授' : ' · 同学')) : '—';
  if ($('profile-name')) $('profile-name').textContent = name;
  if ($('profile-email')) $('profile-email').textContent = email;
  if ($('profile-meta')) $('profile-meta').textContent = meta;
  const btn = $('profile-edit-btn');
  if (btn) {
    if (user) {
      btn.textContent = '编辑';
      btn.setAttribute('onclick', "openEditProfile()");
    } else {
      btn.textContent = '登录 / 注册';
      btn.setAttribute('onclick', "navigateTo('login')");
    }
  }
  if ($('post-user-name')) $('post-user-name').textContent = user ? user.name : '未登录';
  // 网页版顶栏用户区
  const dtUser = $('dt-user');
  if (dtUser) {
    if (user) {
      dtUser.innerHTML =
        '<div class="dt-user-avatar">' + escapeHtml((user.name || 'U').charAt(0)) + '</div>' +
        '<div class="dt-user-info">' +
        '<div class="dt-user-name">' + escapeHtml(user.name) + '</div>' +
        '<div class="dt-user-mail">' + escapeHtml(user.email || '') + '</div>' +
        '</div>';
    } else {
      dtUser.innerHTML = '<button class="dt-login-btn" onclick="navigateTo(\'login\')">登录 / 注册</button>';
    }
  }
}

function initAuth() {
  if (getToken()) {
    // 验证 token 是否还有效，无效则清理
    api('/api/auth/me').then(data => {
      localStorage.setItem('campus_user', JSON.stringify(data.user));
      updateProfileUI();
    }).catch(() => { clearToken(); updateProfileUI(); });
  }
  updateProfileUI();
}

// ==================== 编辑资料 ====================

function openEditProfile() {
  const user = getCurrentUser();
  if (!user) { navigateTo('login'); return; }
  $('ep-name').value = user.name || '';
  $('ep-department').value = user.department || '';
  navigateTo('edit-profile');
}

function saveProfile() {
  const name = $('ep-name').value.trim();
  const department = $('ep-department').value.trim();
  if (!name) { showToast('昵称不能为空', 'error'); return; }
  api('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, department })
  }).then(data => {
    localStorage.setItem('campus_user', JSON.stringify(data.user));
    showToast('资料已更新 ✨');
    updateProfileUI();
    goBack();
  }).catch(e => showToast(e.message, 'error'));
}

// ==================== 全局搜索 ====================

function openSearch() {
  navigateTo('search');
  $('search-results').innerHTML = '输入关键词搜索校园内容';
  setTimeout(() => { const inp = $('search-input'); if (inp) inp.focus(); }, 100);
}

function doSearch() {
  const keyword = $('search-input').value.trim();
  const resultsEl = $('search-results');
  if (!keyword) { resultsEl.innerHTML = '输入关键词搜索校园内容'; return; }
  resultsEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px 0;">搜索中...</div>';
  api('/api/search?keyword=' + encodeURIComponent(keyword)).then(data => {
    let html = '';
    let total = 0;
    // 帖子
    if (data.post && data.post.length) {
      total += data.post.length;
      html += '<div style="font-weight:700;margin:14px 0 8px;">📄 动态 (' + data.post.length + ')</div>';
      html += data.post.map(p => `
        <div style="padding:10px;background:var(--card-bg,#fff);border-radius:10px;margin-bottom:8px;">
          <div style="font-weight:600;">${escapeHtml(p['标题'] || '分享')}</div>
          <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(p['内容'] || '')}</div>
        </div>`).join('');
    }
    // 课程
    if (data.course && data.course.length) {
      total += data.course.length;
      html += '<div style="font-weight:700;margin:14px 0 8px;">📚 课程 (' + data.course.length + ')</div>';
      html += data.course.map(c => `
        <div style="padding:10px;background:var(--card-bg,#fff);border-radius:10px;margin-bottom:8px;">
          <div style="font-weight:600;">${escapeHtml(c['课程'] || c['名称'] || '')}</div>
          <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(c['描述'] || c['简介'] || '')}</div>
        </div>`).join('');
    }
    // 活动
    if (data.event && data.event.length) {
      total += data.event.length;
      html += '<div style="font-weight:700;margin:14px 0 8px;">📅 活动 (' + data.event.length + ')</div>';
      html += data.event.map(e => `
        <div style="padding:10px;background:var(--card-bg,#fff);border-radius:10px;margin-bottom:8px;">
          <div style="font-weight:600;">${escapeHtml(e['活动'] || e['标题'] || '')}</div>
          <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(e['时间'] || '')} · ${escapeHtml(e['地点'] || '')}</div>
        </div>`).join('');
    }
    // 教授
    if (data.professor && data.professor.length) {
      total += data.professor.length;
      html += '<div style="font-weight:700;margin:14px 0 8px;">👩‍🏫 教授 (' + data.professor.length + ')</div>';
      html += data.professor.map(p => `
        <div style="padding:10px;background:var(--card-bg,#fff);border-radius:10px;margin-bottom:8px;">
          <div style="font-weight:600;">${escapeHtml(p['姓名'] || p['名称'] || '')}</div>
          <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(p['学院'] || p['院系'] || '')}</div>
        </div>`).join('');
    }
    if (!total) {
      resultsEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:30px 0;">没有找到相关内容 😢</div>';
    } else {
      resultsEl.innerHTML = html;
    }
  }).catch(e => {
    resultsEl.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:30px 0;">搜索失败：${e.message}</div>`;
  });
}

// ==================== 修改密码 ====================

function changePassword() {
  const oldPwd = $('cp-old').value;
  const newPwd = $('cp-new').value;
  const confirm = $('cp-confirm').value;
  if (!oldPwd || !newPwd || !confirm) { showToast('请填写完整', 'error'); return; }
  if (newPwd.length < 6) { showToast('新密码至少 6 位', 'error'); return; }
  if (newPwd !== confirm) { showToast('两次输入的新密码不一致', 'error'); return; }
  api('/api/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ old_password: oldPwd, new_password: newPwd })
  }).then(() => {
    showToast('密码修改成功 🔒');
    $('cp-old').value = ''; $('cp-new').value = ''; $('cp-confirm').value = '';
    goBack();
  }).catch(e => showToast(e.message, 'error'));
}

// ==================== 邮箱验证码 ====================

function sendCode(emailInputId, btnId) {
  const email = $(emailInputId).value.trim();
  if (!email) { showToast('请先填写邮箱', 'error'); return; }
  const btn = $(btnId);
  btn.disabled = true;
  api('/api/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ email })
  }).then(data => {
    showToast(data.sent ? '验证码已发送，请查收邮件 📧' : '验证码已生成（开发模式，见服务日志）');
    // 60 秒倒计时
    let left = 60;
    btn.textContent = left + 's';
    const timer = setInterval(() => {
      left--;
      if (left <= 0) {
        clearInterval(timer);
        btn.textContent = '重新发送';
        btn.disabled = false;
      } else {
        btn.textContent = left + 's';
      }
    }, 1000);
  }).catch(e => {
    btn.disabled = false;
    showToast(e.message, 'error');
  });
}

// ==================== 发帖（真实） ====================

let pendingImages = [];

function pickImage() {
  $('image-input').value = '';
  $('image-input').click();
}

function doUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('图片不能超过 5MB', 'error'); return; }
  const fd = new FormData();
  fd.append('file', file);
  showToast('图片上传中...');
  api('/api/upload/image', { method: 'POST', body: fd }).then(data => {
    pendingImages.push(data.url);
    const preview = $('post-image-preview');
    const img = document.createElement('img');
    img.src = API_BASE + data.url;
    img.className = 'post-image-thumb';
    img.title = '点击移除';
    img.onclick = function () {
      pendingImages = pendingImages.filter(u => u !== data.url);
      this.remove();
    };
    preview.appendChild(img);
    showToast('图片已添加，点缩略图可移除');
  }).catch(e => showToast(e.message, 'error'));
}

function submitPost() {
  if (!getToken()) { showToast('请先登录', 'error'); navigateTo('login'); return; }
  const content = $('post-content-input').value.trim();
  if (!content) { showToast('说点什么吧～', 'error'); return; }
  const title = $('post-title-input').value.trim();
  const anonymous = $('anon-toggle').checked;
  const params = new URLSearchParams({ content, section: 'general', anonymous: String(anonymous) });
  if (title) params.set('title', title);
  if (pendingImages.length) params.set('images', pendingImages.join(','));
  api('/api/community/posts?' + params.toString(), { method: 'POST' }).then(() => {
    showToast('发布成功！');
    pendingImages = [];
    $('post-content-input').value = '';
    $('post-title-input').value = '';
    $('post-image-preview').innerHTML = '';
    $('anon-toggle').checked = false;
    goBack();
    renderPosts();
  }).catch(e => showToast(e.message, 'error'));
}

// ==================== 初始化 ====================

// 渲染所有数据
initAuth();
renderPosts();
renderTreehole();
renderEvents();
renderMaterials();
renderQuestions();
renderProfessors();
renderMessages();
renderNotifications();

// 深链支持：#academic / #feed / #treehole / #events / #profile 直接打开对应页
if (location.hash && ['feed', 'academic', 'events', 'treehole', 'profile'].includes(location.hash.slice(1))) {
  switchTab(location.hash.slice(1));
}
