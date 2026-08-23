const state = {
  view: 'overview',
  role: localStorage.getItem('surf-admin-role') || 'platform_admin',
  loading: true,
  error: '',
  session: null,
  overview: null,
  posts: [],
  reports: [],
  audit: [],
  tags: [],
  notifications: [],
  resources: [],
  questions: [],
  events: [],
  opportunities: [],
  systemMetrics: null,
};

const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const asArray = (value, key) => Array.isArray(value) ? value : Array.isArray(value?.[key]) ? value[key] : [];
const icons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 1.8 } });

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('资料文件读取失败'));
    reader.readAsDataURL(file);
  });
}

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { Accept: 'application/json', 'X-Admin-Role': state.role, ...(options.body ? { 'Content-Type': 'application/json' } : {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `HTTP ${response.status}`);
  return data;
}

function toast(message, type = '') {
  $('toast-region').innerHTML = `<div class="toast ${type}">${escapeHTML(message)}</div>`;
  setTimeout(() => { $('toast-region').innerHTML = ''; }, 2800);
}

function heading(eyebrow, title, description, action = '') {
  return `<div class="page-heading"><div><span class="eyebrow">${escapeHTML(eyebrow)}</span><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p></div>${action}</div>`;
}

function status(value) {
  const labels = { pending: '待审核', published: '已发布', withdrawn: '已撤回', hidden: '已隐藏', rejected: '已拒绝', resolved: '已处理' };
  return `<span class="status ${escapeHTML(value)}">${labels[value] || escapeHTML(value || '未知')}</span>`;
}

function canWrite() { return state.session?.permissions?.includes('moderate'); }
function canManageLearning() { return ['platform_admin', 'teacher'].includes(state.role); }
function canManageEvents() { return ['platform_admin', 'organizer'].includes(state.role); }
function canManageOpportunities() { return ['platform_admin', 'organizer', 'teacher'].includes(state.role); }
function permissionBanner() { return canWrite() || (state.view === 'opportunities' && canManageOpportunities()) ? '' : '<div class="permission-banner"><i data-lucide="lock-keyhole"></i>当前 Mock 角色只有查看权限。切换到有权角色后可执行写操作。</div>'; }

function renderOverview() {
  const item = state.overview || {};
  $('admin-content').innerHTML = `${heading('Operations', '管理概览', '审核、通知、资料、活动和举报统一通过受权限保护的后端接口处理。')}${permissionBanner()}<div class="metrics">
    <div class="metric"><span>待审核帖子</span><strong>${item.pending_posts || 0}</strong><em>含图片与视频附件</em></div>
    <div class="metric"><span>已发布帖子</span><strong>${item.published_posts || 0}</strong><em>学生端当前可见</em></div>
    <div class="metric"><span>待处理举报</span><strong>${item.open_reports || 0}</strong><em>需要记录处理理由</em></div>
    <div class="metric"><span>审计记录</span><strong>${item.audit_records || 0}</strong><em>所有管理写操作留痕</em></div>
  </div><section class="panel"><div class="panel-head"><div><h2>P0 管理闭环</h2><p>发布 -> 审核 -> 学生端展示 -> 举报 -> 处理</p></div><button class="button" data-view="moderation">打开审核队列</button></div><div class="tag-grid"><span class="tag">帖子和媒体审核</span><span class="tag">受控分区与 Tag</span><span class="tag">通知发布</span><span class="tag">资料与问答</span><span class="tag">活动管理</span><span class="tag">举报与审计</span></div></section>`;
}

function mediaPreview(post) {
  return (post.media || []).length ? `<div class="media-preview">${post.media.map(item => item.type === 'video' ? `<video src="${escapeHTML(item.url)}" poster="${escapeHTML(item.poster || '')}" muted></video>` : `<img src="${escapeHTML(item.url)}" alt="媒体预览">`).join('')}</div>` : '';
}

function renderModeration() {
  const rows = state.posts.map(post => `<tr><td>${status(post.status || 'published')}</td><td><strong>${escapeHTML(post.title || post.content)}</strong><p>${escapeHTML(post.content)}</p>${mediaPreview(post)}</td><td>${escapeHTML(post.section)}<p>${(post.tags || []).map(tag => `#${escapeHTML(tag)}`).join(' ') || '无 Tag'}</p></td><td>${escapeHTML(post.anonymous ? '匿名' : post.author || '校园成员')}<p>${escapeHTML(post.time)}</p></td><td><div class="actions"><button class="button" data-moderate="published" data-post-id="${post.id}" ${!canWrite() ? 'disabled' : ''}>通过</button><button class="button secondary" data-moderate="hidden" data-post-id="${post.id}" ${!canWrite() ? 'disabled' : ''}>隐藏</button><button class="button danger" data-moderate="rejected" data-post-id="${post.id}" ${!canWrite() ? 'disabled' : ''}>拒绝</button></div></td></tr>`).join('');
  $('admin-content').innerHTML = `${heading('Moderation', '帖子与媒体审核', '预览文字、图片和视频，审核结果会立即改变学生端可见状态。', '<select class="field" id="post-status-filter"><option value="all">全部状态</option><option value="pending">待审核</option><option value="published">已发布</option><option value="hidden">已隐藏</option><option value="rejected">已拒绝</option></select>')}${permissionBanner()}<section class="panel"><div class="panel-head"><div><h2>审核队列</h2><p>${state.posts.length} 条内容</p></div></div><div class="table-wrap"><table><thead><tr><th>状态</th><th>内容与媒体</th><th>分区 / Tag</th><th>发布者</th><th>操作</th></tr></thead><tbody>${rows || '<tr><td colspan="5"><div class="empty">当前筛选下没有内容</div></td></tr>'}</tbody></table></div></section>`;
}

function renderTaxonomy() {
  $('admin-content').innerHTML = `${heading('Taxonomy', '分区与 Tag', '公共话题使用四个受控分区；树洞独立处理。自定义 Tag 规范化后进入审核视野。')}${permissionBanner()}<section class="panel"><div class="panel-head"><div><h2>受控分区</h2><p>学生端不可创建新分区</p></div></div><div class="tag-grid"><span class="tag">学术</span><span class="tag">校园生活</span><span class="tag">活动与机会</span><span class="tag">组队与项目</span><span class="tag">匿名树洞 <b>独立</b></span></div></section><section class="panel"><div class="panel-head"><div><h2>Tag 清单</h2><p>推荐、自定义和内容使用次数</p></div></div><div class="tag-grid">${state.tags.map(item => `<span class="tag">#${escapeHTML(item.name)} <b>${escapeHTML(item.category)} · ${item.count || 0}</b></span>`).join('')}</div></section>`;
}

function renderNotifications() {
  const rows = state.notifications.map(item => `<tr><td>${item.priority === 'important' ? '<span class="status hidden">重要</span>' : '<span class="status">普通</span>'}${item.pinned ? ' <span class="status pending">置顶</span>' : ''}</td><td><strong>${escapeHTML(item.content)}</strong></td><td>${escapeHTML(item.time)}</td><td>${status(item.status || (item.published === false ? 'withdrawn' : 'published'))}</td><td><div class="actions"><button class="button secondary" data-notification-admin-action="${item.pinned ? 'unpin' : 'pin'}" data-notification-id="${item.id}" ${!canWrite() ? 'disabled' : ''}>${item.pinned ? '取消置顶' : '置顶'}</button><button class="button ${item.status === 'withdrawn' || item.published === false ? '' : 'danger'}" data-notification-admin-action="${item.status === 'withdrawn' || item.published === false ? 'publish' : 'withdraw'}" data-notification-id="${item.id}" ${!canWrite() ? 'disabled' : ''}>${item.status === 'withdrawn' || item.published === false ? '重新发布' : '撤回'}</button></div></td></tr>`).join('');
  $('admin-content').innerHTML = `${heading('Publishing', '通知管理', '发布、置顶或撤回通知，后端保存并记录审计，学生端只读取当前已发布内容。')}${permissionBanner()}<section class="panel"><div class="panel-head"><div><h2>发布通知</h2><p>重要和置顶通知会在学生端优先显示</p></div></div><form class="form-grid notification-grid" id="notification-form"><input class="field" name="content" maxlength="300" placeholder="通知内容" required><select class="field" name="priority"><option value="normal">普通</option><option value="important">重要</option></select><select class="field" name="pinned"><option value="false">不置顶</option><option value="true">发布并置顶</option></select><button class="button" type="submit" ${!canWrite() ? 'disabled' : ''}>发布</button></form></section><section class="panel"><div class="table-wrap"><table><thead><tr><th>级别</th><th>内容</th><th>时间</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function renderLearning() {
  const resources = state.resources.map(item => `<tr><td><strong>${escapeHTML(item.name || item['名称'])}</strong><p>${escapeHTML(item.description || '')}</p></td><td>${escapeHTML(item.course || item['课程'])}</td><td>${escapeHTML(item.type || item['类型'])}</td><td>${escapeHTML(item.uploader || item['上传者'])}</td><td>${status(item.status || 'published')}</td><td><button class="button ${item.status === 'hidden' ? '' : 'danger'}" data-resource-status="${item.status === 'hidden' ? 'published' : 'hidden'}" data-resource-id="${item.id}" ${!canManageLearning() ? 'disabled' : ''}>${item.status === 'hidden' ? '发布' : '隐藏'}</button></td></tr>`).join('');
  const questions = state.questions.map(item => `<tr><td><strong>${escapeHTML(item.question || item['问题'])}</strong><form class="inline-form" data-answer-form="${item.id}"><input class="field" name="content" placeholder="以课程团队身份回答" required><button class="button" type="submit" ${!canManageLearning() ? 'disabled' : ''}>回答</button></form></td><td>${escapeHTML(item.course || item['课程'])}</td><td>${Number(item.answers ?? item['回答数'] ?? 0)}</td><td>${status(item.status || 'published')}</td></tr>`).join('');
  $('admin-content').innerHTML = `${heading('Learning content', '资料与问答', '教师/助教维护课程资料与人工回答；学生端只展示已发布内容。')}<section class="panel"><div class="panel-head"><div><h2>发布课程资料</h2><p>资料必须归入年级、学期、专业和课程路径</p></div></div><form class="form-grid resource-grid" id="resource-form"><input class="field" name="name" placeholder="资料名称" required><select class="field" name="year" required><option value="year1">大一</option><option value="year2">大二</option><option value="year3">大三</option><option value="year4">大四</option></select><select class="field" name="term" required><option value="autumn">上学期</option><option value="spring">下学期</option></select><select class="field" name="major" required><option value="common">大一共同课程</option><option value="computer-science">计算机科学与技术</option><option value="data-science">数据科学</option><option value="mathematics">数学科学</option><option value="all-majors">跨专业 / 通识</option></select><input class="field" name="course" placeholder="课程代码" required><input class="field" name="type" placeholder="类型" value="参考资料" required><input class="field" name="semester" placeholder="学期标记" value="2026 Autumn"><input class="field" name="file" type="file" accept="application/pdf,text/plain,text/markdown,.docx,.pptx"><button class="button" type="submit" ${!canManageLearning() ? 'disabled' : ''}>发布</button></form></section><section class="panel"><div class="panel-head"><h2>课程资料</h2></div><div class="table-wrap"><table><thead><tr><th>资料</th><th>课程</th><th>类型</th><th>上传者</th><th>状态</th><th>操作</th></tr></thead><tbody>${resources}</tbody></table></div></section><section class="panel"><div class="panel-head"><h2>课程问答</h2></div><div class="table-wrap"><table><thead><tr><th>问题 / 人工回答</th><th>课程</th><th>回答</th><th>状态</th></tr></thead><tbody>${questions}</tbody></table></div></section>`;
}

function renderEvents() {
  const rows = state.events.map(item => `<tr><td><strong>${escapeHTML(item.title || item['活动'])}</strong><p>${escapeHTML(item.description || '')}</p></td><td>${escapeHTML(item.time || item['时间'])}</td><td>${escapeHTML(item.location || item['地点'])}</td><td>${escapeHTML(item.organizer || item['组织'])}</td><td>${Number(item.registered || 0)} / ${Number(item.capacity || 0)}<div class="registration-list">${(item.registrations || []).map(value => `<span>${escapeHTML(value.name)}<button type="button" data-remove-registration="${escapeHTML(value.user_id)}" data-event-id="${escapeHTML(item.id)}" ${!canManageEvents() ? 'disabled' : ''} aria-label="移除 ${escapeHTML(value.name)} 的报名"><i data-lucide="x"></i></button></span>`).join('') || '暂无本地报名明细'}</div></td><td>${status(item.status || 'published')}</td><td><button class="button ${item.status === 'hidden' ? '' : 'danger'}" data-event-status="${item.status === 'hidden' ? 'published' : 'hidden'}" data-event-id="${item.id}" ${!canManageEvents() ? 'disabled' : ''}>${item.status === 'hidden' ? '发布' : '下线'}</button></td></tr>`).join('');
  $('admin-content').innerHTML = `${heading('Events', '活动管理', '活动组织者发布或下线活动并查看报名人数与本地报名明细。')}<section class="panel"><div class="panel-head"><div><h2>发布活动</h2><p>平台管理员与活动组织者可操作</p></div></div><form class="form-grid event-grid" id="event-form"><input class="field" name="title" placeholder="活动名称" required><input class="field" name="time" placeholder="2026-08-20 14:00-16:00" required><input class="field" name="location" placeholder="地点" required><input class="field" name="organizer" placeholder="组织方" required><input class="field" name="capacity" type="number" min="0" placeholder="名额"><button class="button" type="submit" ${!canManageEvents() ? 'disabled' : ''}>发布</button></form></section><section class="panel"><div class="table-wrap"><table><thead><tr><th>活动</th><th>时间</th><th>地点</th><th>组织方</th><th>报名</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function renderOpportunities() {
  const rows = state.opportunities.map(item => {
    const applications = (item.applications || []).map(application => `<div class="application-row"><span><strong>${escapeHTML(application.name || application.user_id)}</strong><small>${escapeHTML(application.message || '未留言')} · ${escapeHTML((application.skills || []).join('、'))}</small></span><span>${status(application.status || 'pending')}</span><button class="button secondary" data-opportunity-application="accepted" data-opportunity-id="${item.id}" data-application-id="${application.id}" ${!canManageOpportunities() ? 'disabled' : ''}>通过</button><button class="button danger" data-opportunity-application="rejected" data-opportunity-id="${item.id}" data-application-id="${application.id}" ${!canManageOpportunities() ? 'disabled' : ''}>拒绝</button></div>`).join('') || '<span class="empty">暂无申请</span>';
    return `<tr><td><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.kind)} · ${escapeHTML(item.description || '')}</p><p>${(item.skills || []).map(skill => `#${escapeHTML(skill)}`).join(' ')}</p></td><td>${escapeHTML(item.deadline || '待定')}</td><td>${Number(item.applications?.length || 0)} / ${Number(item.capacity || 0)}</td><td>${status(item.status || 'published')}<p>${escapeHTML(item.owner || '')}</p></td><td>${applications}</td><td><button class="button ${item.status === 'hidden' ? '' : 'danger'}" data-opportunity-status="${item.status === 'hidden' ? 'published' : 'hidden'}" data-opportunity-id="${item.id}" ${!canManageOpportunities() ? 'disabled' : ''}>${item.status === 'hidden' ? '重新发布' : '下线'}</button></td></tr>`;
  }).join('');
  $('admin-content').innerHTML = `${heading('Teams & projects', '组队招募', '发布比赛、科研和课程项目，查看申请并反馈状态。')} ${permissionBanner()}<section class="panel"><div class="panel-head"><div><h2>发布招募</h2><p>技能用逗号分隔，学生端会返回匹配理由</p></div></div><form class="form-grid event-grid" id="opportunity-form"><input class="field" name="title" placeholder="招募标题" required><input class="field" name="kind" value="项目招募" placeholder="类型"><input class="field" name="skills" placeholder="技能：Python, 前端" required><input class="field" name="tags" placeholder="Tag：AI, 黑客松"><input class="field" name="deadline" placeholder="截止日期"><input class="field" name="capacity" type="number" min="1" value="3" placeholder="人数"><textarea class="field" name="description" placeholder="项目简介"></textarea><button class="button" type="submit" ${!canManageOpportunities() ? 'disabled' : ''}>发布招募</button></form></section><section class="panel"><div class="table-wrap"><table><thead><tr><th>招募</th><th>截止</th><th>申请</th><th>状态</th><th>申请人</th><th>操作</th></tr></thead><tbody>${rows || '<tr><td colspan="6"><div class="empty">暂无招募</div></td></tr>'}</tbody></table></div></section>`;
}

function renderReports() {
  const rows = state.reports.map(item => `<tr><td>${status(item.status)}</td><td><strong>${escapeHTML(item.reason)}</strong><p>帖子：${escapeHTML(item.post_id)}</p></td><td>${escapeHTML(item.created_at)}</td><td>${escapeHTML(item.resolution || '—')}</td><td><button class="button" data-resolve-report="${item.id}" ${item.status === 'resolved' || !canWrite() ? 'disabled' : ''}>处理</button></td></tr>`).join('');
  $('admin-content').innerHTML = `${heading('Trust & safety', '举报处理', '处理举报时必须记录理由；结果与操作人角色进入审计记录。')}${permissionBanner()}<section class="panel"><div class="table-wrap"><table><thead><tr><th>状态</th><th>原因</th><th>提交时间</th><th>处理结果</th><th>操作</th></tr></thead><tbody>${rows || '<tr><td colspan="5"><div class="empty">暂无举报</div></td></tr>'}</tbody></table></div></section>`;
}

function renderAudit() {
  const rows = state.audit.map(item => `<tr><td>${escapeHTML(item.time)}</td><td><span class="status">${escapeHTML(item.actor_role)}</span></td><td><strong>${escapeHTML(item.action)}</strong></td><td>${escapeHTML(item.target_type)} · ${escapeHTML(item.target_id)}</td><td>${escapeHTML(item.detail || '—')}</td></tr>`).join('');
  $('admin-content').innerHTML = `${heading('Audit', '审计记录', '管理端写操作不可静默发生：角色、动作、对象、时间和理由均被保存。')}<section class="panel"><div class="table-wrap"><table><thead><tr><th>时间</th><th>角色</th><th>动作</th><th>对象</th><th>说明</th></tr></thead><tbody>${rows || '<tr><td colspan="5"><div class="empty">暂无管理写操作</div></td></tr>'}</tbody></table></div></section>`;
}

function renderSystem() {
  const item = state.systemMetrics || {};
  const rows = asArray(item, 'recent').map(event => `<tr><td><code>${escapeHTML(event.request_id)}</code></td><td>${escapeHTML(event.time)}</td><td><span class="status">${escapeHTML(event.method)}</span></td><td><code>${escapeHTML(event.path)}</code></td><td>${event.status >= 400 ? `<span class="status rejected">${Number(event.status)}</span>` : `<span class="status published">${Number(event.status)}</span>`}</td><td>${Number(event.duration_ms).toFixed(2)} ms</td></tr>`).join('');
  const errorRate = `${(Number(item.error_rate || 0) * 100).toFixed(1)}%`;
  $('admin-content').innerHTML = `${heading('Operations health', '系统状态', '查看本地服务的有界运行指标；不记录正文、查询参数或请求体。', '<button class="button secondary" type="button" id="refresh-system"><i data-lucide="refresh-cw"></i>刷新</button>')}<div class="metrics"><div class="metric"><span>累计请求</span><strong>${Number(item.requests || 0)}</strong><em>进程启动于 ${escapeHTML(item.started_at || '未知')}</em></div><div class="metric"><span>错误率</span><strong>${errorRate}</strong><em>${Number(item.errors || 0)} 个 4xx / 5xx 响应</em></div><div class="metric"><span>平均耗时</span><strong>${Number(item.avg_ms || 0).toFixed(1)}<small> ms</small></strong><em>应用处理耗时</em></div><div class="metric"><span>最大耗时</span><strong>${Number(item.max_ms || 0).toFixed(1)}<small> ms</small></strong><em>最近 P95 ${Number(item.recent_p95_ms || 0).toFixed(1)} ms</em></div></div><section class="panel"><div class="panel-head"><div><h2>最近请求</h2><p>最多保留 ${Number(item.buffer_limit || 0)} 条，仅显示方法、路径、状态和耗时</p></div></div><div class="table-wrap"><table><thead><tr><th>Request ID</th><th>时间</th><th>方法</th><th>路径</th><th>状态</th><th>耗时</th></tr></thead><tbody>${rows || '<tr><td colspan="6"><div class="empty">进程启动后还没有请求记录</div></td></tr>'}</tbody></table></div></section>`;
}

function render() {
  document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('is-active', button.dataset.view === state.view));
  const titles = { overview: '管理概览', moderation: '帖子与媒体', taxonomy: '分区与 Tag', notifications: '通知管理', learning: '资料与问答', events: '活动管理', opportunities: '组队招募', reports: '举报处理', audit: '审计记录', system: '系统状态' };
  $('view-title').textContent = titles[state.view];
  if (state.loading) { $('admin-content').innerHTML = '<div class="panel"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>'; return; }
  if (state.error) { $('admin-content').innerHTML = `<div class="error"><i data-lucide="shield-alert"></i><strong>管理端访问失败</strong><span>${escapeHTML(state.error)}</span><button class="button secondary" id="retry-load">重试</button></div>`; icons(); return; }
  if (state.view === 'overview') renderOverview();
  if (state.view === 'moderation') renderModeration();
  if (state.view === 'taxonomy') renderTaxonomy();
  if (state.view === 'notifications') renderNotifications();
  if (state.view === 'learning') renderLearning();
  if (state.view === 'events') renderEvents();
  if (state.view === 'opportunities') renderOpportunities();
  if (state.view === 'reports') renderReports();
  if (state.view === 'audit') renderAudit();
  if (state.view === 'system') renderSystem();
  icons();
}

async function load() {
  state.loading = true; state.error = ''; render();
  try {
    const [session, overview, posts, reports, audit, tags, notifications, learning, events, opportunities, systemMetrics] = await Promise.all([
      api('/api/admin/session'), api('/api/admin/overview'), api('/api/admin/posts'), api('/api/admin/reports'), api('/api/admin/audit'), api('/api/admin/tags'), api('/api/admin/notifications'),
      api('/api/admin/learning'), api('/api/admin/events'), api('/api/admin/opportunities'), api('/api/admin/system/metrics'),
    ]);
    state.session = session; state.overview = overview; state.posts = asArray(posts, 'posts'); state.reports = asArray(reports, 'reports'); state.audit = asArray(audit, 'records'); state.tags = asArray(tags, 'tags'); state.notifications = asArray(notifications, 'notifications'); state.resources = asArray(learning, 'resources'); state.questions = asArray(learning, 'questions'); state.events = asArray(events, 'events'); state.opportunities = asArray(opportunities, 'opportunities'); state.systemMetrics = systemMetrics;
  } catch (error) { state.error = error.message; }
  state.loading = false; render();
}

async function moderate(id, nextStatus) {
  const reason = nextStatus === 'published' ? '符合分区、Tag 与社区规范' : '内容不符合当前社区规范';
  try { await api(`/api/admin/posts/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus, reason }) }); toast(nextStatus === 'published' ? '已通过，学生端刷新后可见' : '状态已更新'); await load(); state.view = 'moderation'; render(); } catch (error) { toast(error.message, 'error'); }
}

document.addEventListener('click', event => {
  const view = event.target.closest('[data-view]'); if (view) { state.view = view.dataset.view; render(); return; }
  const moderation = event.target.closest('[data-moderate]'); if (moderation) { moderate(moderation.dataset.postId, moderation.dataset.moderate); return; }
  const report = event.target.closest('[data-resolve-report]'); if (report) { api(`/api/admin/reports/${encodeURIComponent(report.dataset.resolveReport)}`, { method: 'PATCH', body: JSON.stringify({ status: 'resolved', reason: '已人工复核并记录处理结果' }) }).then(async () => { toast('举报已处理并写入审计'); await load(); state.view = 'reports'; render(); }).catch(error => toast(error.message, 'error')); return; }
  const notification = event.target.closest('[data-notification-admin-action]'); if (notification) { api(`/api/admin/notifications/${encodeURIComponent(notification.dataset.notificationId)}`, { method: 'PATCH', body: JSON.stringify({ action: notification.dataset.notificationAdminAction, reason: '管理端通知状态调整' }) }).then(async () => { toast('通知状态已更新并写入审计'); await load(); state.view = 'notifications'; render(); }).catch(error => toast(error.message, 'error')); return; }
  const resource = event.target.closest('[data-resource-status]'); if (resource) { api(`/api/admin/resources/${encodeURIComponent(resource.dataset.resourceId)}`, { method: 'PATCH', body: JSON.stringify({ status: resource.dataset.resourceStatus, reason: '管理端资料状态调整' }) }).then(async () => { toast('资料状态已更新'); await load(); state.view = 'learning'; render(); }).catch(error => toast(error.message, 'error')); return; }
  const eventStatus = event.target.closest('[data-event-status]'); if (eventStatus) { api(`/api/admin/events/${encodeURIComponent(eventStatus.dataset.eventId)}`, { method: 'PATCH', body: JSON.stringify({ status: eventStatus.dataset.eventStatus, reason: '管理端活动状态调整' }) }).then(async () => { toast('活动状态已更新'); await load(); state.view = 'events'; render(); }).catch(error => toast(error.message, 'error')); return; }
  const registration = event.target.closest('[data-remove-registration]'); if (registration) { api(`/api/admin/events/${encodeURIComponent(registration.dataset.eventId)}/registrations/${encodeURIComponent(registration.dataset.removeRegistration)}`, { method: 'DELETE' }).then(async () => { toast('报名记录已移除并写入审计'); await load(); state.view = 'events'; render(); }).catch(error => toast(error.message, 'error')); return; }
  const opportunityStatus = event.target.closest('[data-opportunity-status]'); if (opportunityStatus) { api(`/api/admin/opportunities/${encodeURIComponent(opportunityStatus.dataset.opportunityId)}`, { method: 'PATCH', body: JSON.stringify({ status: opportunityStatus.dataset.opportunityStatus, reason: '管理端招募状态调整' }) }).then(async () => { toast('招募状态已更新'); await load(); state.view = 'opportunities'; render(); }).catch(error => toast(error.message, 'error')); return; }
  const applicationStatus = event.target.closest('[data-opportunity-application]'); if (applicationStatus) { api(`/api/admin/opportunities/${encodeURIComponent(applicationStatus.dataset.opportunityId)}/applications/${encodeURIComponent(applicationStatus.dataset.applicationId)}`, { method: 'PATCH', body: JSON.stringify({ status: applicationStatus.dataset.opportunityApplication, reason: '管理端处理申请' }) }).then(async () => { toast('申请状态已更新'); await load(); state.view = 'opportunities'; render(); }).catch(error => toast(error.message, 'error')); return; }
  if (event.target.closest('#refresh-system')) { load(); return; }
  if (event.target.closest('#retry-load')) load();
});

document.addEventListener('change', event => {
  if (event.target.id === 'role-select') { state.role = event.target.value; localStorage.setItem('surf-admin-role', state.role); load(); }
  if (event.target.id === 'post-status-filter') { api(`/api/admin/posts?status=${encodeURIComponent(event.target.value)}`).then(data => { state.posts = asArray(data, 'posts'); render(); }).catch(error => toast(error.message, 'error')); }
});

document.addEventListener('submit', event => {
  if (event.target.id === 'notification-form') {
    event.preventDefault(); const form = new FormData(event.target);
    api('/api/admin/notifications', { method: 'POST', body: JSON.stringify({ content: form.get('content'), priority: form.get('priority'), pinned: form.get('pinned') === 'true', published: true }) }).then(async () => { toast('通知已发布并写入审计'); await load(); state.view = 'notifications'; render(); }).catch(error => toast(error.message, 'error'));
  }
  if (event.target.id === 'resource-form') {
    event.preventDefault(); const form = new FormData(event.target);
    (async () => {
      try {
        const file = form.get('file');
        let uploaded = {};
        if (file?.size) {
          uploaded = await api('/api/admin/resource-files', { method: 'POST', body: JSON.stringify({ name: file.name, mime: file.type, data: await fileToDataURL(file) }) });
        }
        await api('/api/admin/resources', { method: 'POST', body: JSON.stringify({ name: form.get('name'), year: form.get('year'), term: form.get('term'), major: form.get('major'), course: form.get('course'), type: form.get('type'), semester: form.get('semester'), uploader: '课程团队', description: '', file_url: uploaded.url || null, file_name: uploaded.name || null, mime: uploaded.mime || null, size: uploaded.size || 0 }) });
        toast(file?.size ? '资料文件已上传并发布' : '资料元数据已发布'); await load(); state.view = 'learning'; render();
      } catch (error) { toast(error.message, 'error'); }
    })();
  }
  if (event.target.matches('[data-answer-form]')) {
    event.preventDefault(); const form = new FormData(event.target); const id = event.target.dataset.answerForm;
    api(`/api/admin/questions/${encodeURIComponent(id)}/answers`, { method: 'POST', body: JSON.stringify({ content: form.get('content'), role_label: state.role === 'teacher' ? '教师' : '课程团队' }) }).then(async () => { toast('人工回答已发布'); await load(); state.view = 'learning'; render(); }).catch(error => toast(error.message, 'error'));
  }
  if (event.target.id === 'event-form') {
    event.preventDefault(); const form = new FormData(event.target);
    api('/api/admin/events', { method: 'POST', body: JSON.stringify({ title: form.get('title'), time: form.get('time'), location: form.get('location'), organizer: form.get('organizer'), capacity: Number(form.get('capacity') || 0), description: '' }) }).then(async () => { toast('活动已发布'); await load(); state.view = 'events'; render(); }).catch(error => toast(error.message, 'error'));
  }
  if (event.target.id === 'opportunity-form') {
    event.preventDefault(); const form = new FormData(event.target);
    api('/api/admin/opportunities', { method: 'POST', body: JSON.stringify({ title: form.get('title'), kind: form.get('kind'), description: form.get('description'), skills: String(form.get('skills') || '').split(',').map(value => value.trim()).filter(Boolean), tags: String(form.get('tags') || '').split(',').map(value => value.trim()).filter(Boolean), deadline: form.get('deadline'), capacity: Number(form.get('capacity') || 1) }) }).then(async () => { toast('招募已发布并写入审计'); await load(); state.view = 'opportunities'; render(); }).catch(error => toast(error.message, 'error'));
  }
});

$('role-select').value = state.role;
icons();
load();
