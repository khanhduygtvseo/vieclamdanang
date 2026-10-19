(function () {
  'use strict';
  var C = window.OvertimeCalc;
  var form = document.getElementById('ot-form');
  if (!C || !form) return;

  var salary = document.getElementById('salary');
  var daysBtns = form.querySelectorAll('.seg button');
  var daysCustom = document.getElementById('days-custom');
  var out = document.getElementById('ot-out');
  var days = 26;

  function num(v) {
    if (v === null || v === undefined) return NaN;
    v = String(v).trim().replace(/\s/g, '');
    if (v === '') return 0;
    if (/^\d{1,3}(\.\d{3})+$/.test(v)) v = v.replace(/\./g, '');
    v = v.replace(',', '.');
    return /^\d*\.?\d*$/.test(v) ? parseFloat(v) : NaN;
  }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function pct(r) { return String(Math.round(r * 100)).replace('.', ',') + '%'; }
  function hrs(h) { return String(h).replace('.', ','); }

  function render() {
    var s = num(salary.value.replace(/\./g, ''));
    var hours = {};
    var invalid = false;
    form.querySelectorAll('.hrs').forEach(function (i) {
      var v = num(i.value);
      if (isNaN(v)) invalid = true;
      hours[i.getAttribute('data-k')] = v;
    });
    var res;
    if (invalid) res = { ok: false, error: 'Số giờ làm thêm chỉ nhập số, ví dụ 2 hoặc 1,5.' };
    else if (!salary.value.trim()) res = { ok: false, error: 'Nhập mức lương tháng để xem kết quả.' };
    else res = C.calculate({ monthlySalary: s, workingDays: days, hours: hours });

    if (!res.ok) {
      out.innerHTML = '<div class="total">0<small>đ</small></div><p class="hourly err">' + res.error + '</p>';
      return;
    }
    var html = '<div class="total" id="ot-total">' + money(res.total) + '<small>đ</small></div>' +
      '<p class="hourly">Lương một giờ làm việc bình thường: <b>' + money(res.hourlyWage) + ' đ</b> (' + money(s) + ' ÷ ' + days + ' ngày ÷ 8 giờ)</p><div class="lines">';
    res.lines.forEach(function (l) {
      html += '<div class="line-row' + (l.hours ? '' : ' zero') + '"><span class="nm">' + l.label + '</span>' +
        '<span class="calc">' + hrs(l.hours) + ' giờ × ' + pct(l.rate) + ' × ' + money(res.hourlyWage) + ' đ</span>' +
        '<span class="amt">' + money(l.amount) + ' đ</span></div>';
    });
    html += '</div>';
    if (res.overMonthLimit) {
      html += '<div class="warn">Tổng số giờ làm thêm là ' + hrs(res.totalHours) + ' giờ, vượt mức 40 giờ trong 01 tháng quy định tại khoản 2 Điều 107 Bộ luật Lao động 2019. Hãy kiểm tra lại số giờ đã nhập.</div>';
    }
    out.innerHTML = html;
    var t = document.getElementById('ot-total');
    if (t) { t.classList.add('pop'); setTimeout(function () { t.classList.remove('pop'); }, 220); }
  }

  salary.addEventListener('input', function () {
    var digits = salary.value.replace(/\D/g, '');
    salary.value = digits ? money(parseInt(digits, 10)) : '';
    render();
  });
  daysBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      daysBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      days = parseInt(b.getAttribute('data-days'), 10);
      daysCustom.value = '';
      render();
    });
  });
  daysCustom.addEventListener('input', function () {
    var v = parseInt(daysCustom.value, 10);
    if (v >= 1 && v <= 31) {
      days = v;
      daysBtns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      render();
    }
  });
  form.querySelectorAll('.hrs').forEach(function (i) { i.addEventListener('input', render); });
  form.addEventListener('submit', function (e) { e.preventDefault(); render(); });
  document.getElementById('ot-reset').addEventListener('click', function () {
    salary.value = '';
    form.querySelectorAll('.hrs').forEach(function (i) { i.value = ''; });
    daysCustom.value = '';
    days = 26;
    daysBtns.forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-days') === '26' ? 'true' : 'false'); });
    render();
  });
  render();
})();
