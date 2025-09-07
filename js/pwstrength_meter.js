(function() {
  function rcReady(cb) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') return cb();
    document.addEventListener('DOMContentLoaded', cb, { once: true });
  }
  function mk(el, cls) { var d = document.createElement(el); if (cls) d.className = cls; return d; }
  function pickNewPasswordInput() {
    var inputs = Array.from(document.querySelectorAll('input[type="password"]'));
    if (!inputs.length) return null;
    function score(el) {
      var name = (el.getAttribute('name') || '').toLowerCase();
      var id   = (el.id || '').toLowerCase();
      var s = 0;
      if (name.includes('new')) s += 3;
      if (id.includes('new'))   s += 3;
      if (name.includes('pass')) s += 2;
      if (id.includes('pass'))   s += 2;
      if (name.includes('conf') || name.includes('confirm') || id.includes('conf')) s -= 4;
      if (name.includes('cur') || name.includes('old') || id.includes('cur') || id.includes('old')) s -= 4;
      return s;
    }
    inputs.sort(function(a,b){ return score(b) - score(a); });
    return inputs[0];
  }
  function computeScore(pw) {
    if (!pw) return {score:0,label:'veryweak'};
    var common = ['password','123456','qwerty','111111','letmein','abc123','iloveyou','admin'];
    if (common.indexOf(pw.toLowerCase()) >= 0) return {score:1,label:'veryweak'};
    var score = 0;
    if (pw.length >= 16) score += 3;
    else if (pw.length >= 12) score += 2;
    else if (pw.length >= 8) score += 1;
    var hasLower = /[a-z]/.test(pw);
    var hasUpper = /[A-Z]/.test(pw);
    var hasDigit = /\d/.test(pw);
    var hasSymbol= /[^A-Za-z0-9]/.test(pw);
    var variety = [hasLower,hasUpper,hasDigit,hasSymbol].filter(Boolean).length;
    score += Math.max(0, variety - 1);
    if (/([A-Za-z0-9])\1\1/.test(pw)) score -= 1;
    if (/([a-z]{4,}|[A-Z]{4,}|\d{4,})/.test(pw)) score -= 1;
    if (/1234|abcd|qwer|pass/i.test(pw)) score -= 1;
    score = Math.max(0, Math.min(5, score));
    var label = (score <= 1) ? 'veryweak' : (score === 2) ? 'weak' : (score === 3) ? 'fair' : (score === 4) ? 'strong' : 'verystrong';
    return {score:score, label:label};
  }
  function renderMeter(target, labels, profile) {
    function dbg(obj){ try{ if((profile&&profile.debug) || (window&&window.pwstrength_debug)) console.log('[pwstrength]', obj); }catch(_){}}
    var wrap = mk('div', 'pwstrength-meter');
    var head = mk('div', 'pwstrength-head');
    var title= mk('span', 'pwstrength-title'); title.textContent = (labels && labels.title) || 'Password strength';
    var value= mk('span', 'pwstrength-value'); value.textContent = '';
value.setAttribute('role','status');
value.setAttribute('aria-live','polite');
value.setAttribute('aria-atomic','true');
head.appendChild(title); head.appendChild(value);
var bar  = mk('div', 'pwstrength-bar');
bar.setAttribute('role','progressbar');
    var fill = mk('div', 'pwstrength-fill');
    bar.appendChild(fill);
    wrap.appendChild(head);
    wrap.appendChild(bar);
    wrap.style.display = 'block';
    wrap.style.clear   = 'both';
    wrap.style.maxWidth= '100%';
    wrap.style.marginTop = '4px';
    var parent = target.parentElement;
    if (target.nextSibling) parent.insertBefore(wrap, target.nextSibling);
    else parent.appendChild(wrap);
    function cellOf(el) {
      var n = el;
      while (n && n !== document.body) {
        if (n.tagName === 'TD' || n.classList.contains('prop') || n.classList.contains('row') || n.classList.contains('settings')) return n;
        n = n.parentElement;
      }
      return parent || document.body;
    }
    var cell = cellOf(target);
    function setWidth() {
      if ((profile.mode || '').toLowerCase() === 'css') { wrap.style.width = ''; return; }
      var iw = Math.max(120, target.getBoundingClientRect().width || target.offsetWidth || 240);
      var cw = Math.max(iw, (cell.getBoundingClientRect().width || iw)) - 12;
      var factor = (typeof profile.factor === 'number') ? profile.factor : 1.8;
      var maxpx  = (typeof profile.maxpx  === 'number') ? profile.maxpx  : 560;
      var desired = Math.round(iw * factor);
      desired = Math.min(desired, cw, maxpx);
      desired = Math.max(desired, iw);
      wrap.style.width = desired + 'px';
    }
    setWidth();
    window.addEventListener('resize', setWidth, { passive: true });
    function update(pw) {
      var r = computeScore(pw);
      var lmap = { veryweak:(labels&&labels.veryweak)||'Very weak', weak:(labels&&labels.weak)||'Weak', fair:(labels&&labels.fair)||'Fair', strong:(labels&&labels.strong)||'Strong', verystrong:(labels&&labels.verystrong)||'Very strong' };
      value.textContent = lmap[r.label];
      var pct = Math.round((r.score / 5) * 100);
      bar.style.setProperty('--fill', pct + '%');
      if (typeof fill !== 'undefined' && fill && fill.style) fill.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', String(r.score));
      bar.setAttribute('aria-valuemin','0');
      bar.setAttribute('aria-valuemax','5');
      bar.setAttribute('aria-label', (labels && labels.title) || 'Password strength');
      var hasLower = /[a-z]/.test(pw);
      var hasUpper = /[A-Z]/.test(pw);
      var hasDigit = /\d/.test(pw);
      var hasSymbol= /[^A-Za-z0-9]/.test(pw);
      dbg({score:r.score,label:r.label,len:pw.length,classes:{lower:hasLower,upper:hasUpper,digit:hasDigit,symbol:hasSymbol}});
    }
    return { update: update };
  }
  rcReady(function() {
    try {
      var env = (window.rcmail && rcmail.env) || {};
      var enabled = env.pwstrength_meter_enabled;
      var taskOk  = env.task === 'settings';
      var action  = env.action || (new URLSearchParams(window.location.search)).get('_action') || '';
      var onPwd   = action.indexOf('plugin.password') === 0 || action === 'password';
      if (!enabled || !taskOk || !onPwd) return;
      var profile = (window.pwstrength_profile || {});
      var input = pickNewPasswordInput();
      if (!input) return;
      input.setAttribute('autocomplete','new-password');
      input.setAttribute('data-lpignore','true');
      input.setAttribute('data-1p-ignore','true');
      input.setAttribute('data-bwignore','true');
      input.setAttribute('autocorrect','off');
      input.setAttribute('autocapitalize','off');
      input.setAttribute('spellcheck','false');
      var labels = (env.pwstrength_meter_labels) || null;
      var meter  = renderMeter(input, labels, profile);
      meter.update(input.value || '');
      input.addEventListener('input', function(e){ meter.update(e.target.value || ''); }, { passive: true });
      input.addEventListener('keyup',  function(e){ meter.update(e.target.value || ''); });
      input.addEventListener('change', function(e){ meter.update(e.target.value || ''); });
      input.addEventListener('paste',  function(e){ setTimeout(function(){ meter.update(input.value || ''); }, 0); });
    } catch (e) {}
  });
})();
