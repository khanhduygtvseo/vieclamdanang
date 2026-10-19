/*
 * Tính tiền làm thêm giờ cho người hưởng lương theo thời gian.
 * Căn cứ: Điều 98, 106, 107 Bộ luật Lao động 2019; Điều 55, 57 Nghị định 145/2020/NĐ-CP.
 *   Lương giờ = lương tháng / (số ngày công chuẩn x 8 giờ)
 *   Ban ngày : ngày thường 150% | ngày nghỉ hằng tuần 200% | ngày lễ, tết 300% (chưa gồm lương ngày lễ)
 *   Ban đêm  : hệ số ban ngày + 30% + 20% x hệ số ban ngày
 *              => 150%+30%+20%x150% = 210% | 200%+30%+20%x200% = 270% | 300%+30%+20%x300% = 390%
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OvertimeCalc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var BASE = { weekday: 1.5, rest: 2.0, holiday: 3.0 };
  var NIGHT_ADD = 0.3; // trả thêm khi làm việc ban đêm
  var NIGHT_OT_ADD = 0.2; // trả thêm khi làm thêm giờ ban đêm, nhân với hệ số ban ngày

  function r(n) { return Math.round(n * 1000) / 1000; }

  var RATES = {
    weekdayDay: BASE.weekday,
    weekdayNight: r(BASE.weekday + NIGHT_ADD + NIGHT_OT_ADD * BASE.weekday),
    restDay: BASE.rest,
    restNight: r(BASE.rest + NIGHT_ADD + NIGHT_OT_ADD * BASE.rest),
    holidayDay: BASE.holiday,
    holidayNight: r(BASE.holiday + NIGHT_ADD + NIGHT_OT_ADD * BASE.holiday)
  };

  var LABELS = {
    weekdayDay: 'Ngày thường, ban ngày',
    weekdayNight: 'Ngày thường, ban đêm',
    restDay: 'Ngày nghỉ hằng tuần, ban ngày',
    restNight: 'Ngày nghỉ hằng tuần, ban đêm',
    holidayDay: 'Ngày lễ, tết, ban ngày',
    holidayNight: 'Ngày lễ, tết, ban đêm'
  };

  var HOURS_PER_DAY = 8;
  var MONTH_LIMIT = 40; // Điều 107 khoản 2: không quá 40 giờ trong 01 tháng

  function isNum(n) { return typeof n === 'number' && isFinite(n); }

  function calculate(input) {
    var salary = input && input.monthlySalary;
    var days = input && input.workingDays;
    var hours = (input && input.hours) || {};

    if (!isNum(salary) || salary <= 0) return { ok: false, error: 'Mức lương phải lớn hơn 0.' };
    if (!isNum(days) || days <= 0 || days > 31) return { ok: false, error: 'Số ngày công chuẩn phải từ 1 đến 31.' };

    var hourly = salary / (days * HOURS_PER_DAY);
    var lines = [];
    var total = 0;
    var totalHours = 0;

    for (var key in RATES) {
      if (!Object.prototype.hasOwnProperty.call(RATES, key)) continue;
      var h = hours[key] === undefined || hours[key] === '' ? 0 : hours[key];
      if (!isNum(h) || h < 0) return { ok: false, error: 'Số giờ làm thêm không được âm: ' + LABELS[key] + '.' };
      var amount = hourly * RATES[key] * h;
      total += amount;
      totalHours += h;
      lines.push({ key: key, label: LABELS[key], hours: h, rate: RATES[key], amount: Math.round(amount) });
    }

    return {
      ok: true,
      hourlyWage: Math.round(hourly),
      lines: lines,
      total: Math.round(total),
      totalHours: totalHours,
      overMonthLimit: totalHours > MONTH_LIMIT
    };
  }

  return { calculate: calculate, RATES: RATES, LABELS: LABELS, HOURS_PER_DAY: HOURS_PER_DAY, MONTH_LIMIT: MONTH_LIMIT };
});
