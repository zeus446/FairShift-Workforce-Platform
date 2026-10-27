# FairShift — QA Checklist for Hackathon Review

**Review Target**: `C:\Users\sasha\Desktop\pomptwars`  
**Reviewer**: Independent QA (this session)  
**Date**: 2026-10-27  
**Status**: 🟡 Awaiting implementation completion

---

## 📋 MANDATORY DELIVERABLES CHECKLIST

### 1. Three Genuinely Working Features
- [ ] **FairPay** — Transparent wage calculations (base, overtime, deductions, net)
- [ ] **ShiftCheck** — Functional check-in/out with recorded hours
- [ ] **SafeVoice** — Confidential hazard reports with status tracking
- [ ] **FatigueGuard** — Explainable rule-based warnings (excessive hours, insufficient rest)
- [ ] **SkillPassport** — Recorded skills, training, experience with export
- [ ] **Fairness Pulse** — Employer dashboard with workforce metrics

**PASS CRITERIA**: ≥3 features fully functional (not stubbed), data flows between them.

---

### 2. Two Distinct Interfaces
- [ ] **Worker Interface** — Check-in, pay view, hazard reporting, skills, fatigue alerts
- [ ] **Employer/Admin Interface** — Dashboard, hazard queue, workforce metrics, actions

**PASS CRITERIA**: Separate view/routes, role-appropriate actions, no shared "god mode".

---

### 3. Two Industry Scenarios
- [ ] **Construction** — Site workers, heavy OT, fall hazards, outdoor conditions
- [ ] **College Facilities** — Custodial/maintenance, night shifts, ergonomic hazards

**PASS CRITERIA**: Scenario toggle changes seeded data, labels, hazard types, pay rates.

---

### 4. Inclusive UX
- [ ] **Language Switching** — EN / HI / TA (at minimum) with full string coverage
- [ ] **Readable Visual Cues** — High contrast, focus states, status icons, color-blind safe
- [ ] **Responsive Mobile Layout** — Works at 375px width, touch targets ≥44px

**PASS CRITERIA**: No hardcoded English strings in UI; mobile-first CSS; WCAG AA contrast.

---

### 5. Clear SDG 8 Demo
- [ ] **2-minute demo script** in README.md
- [ ] **Reset Demo** button restores clean seeded state
- [ ] **Demo data labeled** "DEMO" visibly (not confused with real data)
- [ ] **Connected workflow visible**: attendance → hours → pay/fatigue → hazards → dashboard

---

## 🔄 END-TO-END FLOW TESTS

### Flow 1: Worker Attendance → Hours → Pay
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1.1 | Open worker view, select Construction scenario | Worker list loads with construction roles | |
| 1.2 | Tap "Check In" for a worker | Timestamp recorded, status shows "On Shift" | |
| 1.3 | Wait / advance time (or mock) | Session timer runs | |
| 1.4 | Tap "Check Out" | Shift recorded with start/end/duration | |
| 1.5 | View FairPay panel | Base pay + OT (1.5× after 8h) + deductions (12%) = net | |
| 1.6 | Add second shift same day >8h total | OT calculates correctly on cumulative hours | |
| 1.7 | Verify localStorage persistence | Refresh page → data intact | |

**Calculation Rules**:
- Base rate: ₹180/hr (construction), ₹150/hr (college)
- Overtime: 1.5× after 8 hours/day
- Deductions: 12% (PF/ESI/tax placeholder)
- Net = (regular_hours × rate) + (ot_hours × rate × 1.5) - 12%

---

### Flow 2: SafeVoice Hazard Report → Employer Resolution → Worker Status Update
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 2.1 | Worker submits hazard (type, location, description, anonymous toggle) | Report appears in worker's "My Reports" with status "Submitted" | |
| 2.2 | Switch to Employer view | Hazard appears in "Incident Queue" with worker ID (or "Anonymous") | |
| 2.3 | Employer clicks "Investigate" → "Resolved" | Status updates, resolution notes saved | |
| 2.4 | Switch back to Worker view | Worker's report status shows "Resolved" with notes | |
| 2.5 | Employer dashboard metrics update | Unresolved count decrements, resolved count increments | |
| 2.6 | Anonymous report hides worker identity from employer | Employer sees "Anonymous" not worker name | |

---

### Flow 3: FatigueGuard Thresholds
| Threshold | Configuration | Test Case | Expected Alert | Pass/Fail |
|-----------|---------------|-----------|----------------|-----------|
| Daily hours | > 12 hours | Worker logs 13h shift | "Excessive daily hours" warning | |
| Rest period | < 11 hours between shifts | Check-out 22:00, check-in 06:00 next day | "Insufficient rest" warning | |
| Weekly hours | > 60 hours/week | 6×10h shifts | "Weekly limit exceeded" warning | |
| Consecutive days | > 6 days | 7 days straight | "Extended work period" warning | |

**PASS CRITERIA**: Alerts appear in worker view AND employer dashboard; explainable (shows which rule triggered).

---

### Flow 4: Scenario Toggle (Construction ↔ College Facilities)
| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 4.1 | Select "Construction" from dropdown | Workers: "Site Supervisor", "Crane Operator", "Laborer"; Hazards: "Fall", "Equipment", "Weather"; Rate: ₹180 | |
| 4.2 | Select "College Facilities" | Workers: "Custodian", "Electrician", "Groundskeeper"; Hazards: "Ergonomic", "Chemical", "Electrical"; Rate: ₹150 | |
| 4.3 | Switch scenarios mid-session | Data resets to scenario-appropriate seed; no cross-contamination | |
| 4.4 | Verify scenario persists in localStorage | Refresh → same scenario active | |

---

### Flow 5: Language Switching (EN / HI / TA)
| Check | Detail | Pass/Fail |
|-------|--------|-----------|
| 5.1 | All UI strings externalized (no hardcoded English in HTML/JS) | |
| 5.2 | EN → HI switch updates all visible text immediately | |
| 5.3 | EN → TA switch updates all visible text immediately | |
| 5.4 | Hindi/Devanagari renders correctly (font loaded) | |
| 5.5 | Tamil renders correctly (font loaded) | |
| 5.6 | Language preference persists in localStorage | |
| 5.7 | RTL not required (LTR languages only) but layout doesn't break | |

---

### Flow 6: Mobile Layout & Demo Reset
| Check | Detail | Pass/Fail |
|-------|--------|-----------|
| 6.1 | Viewport meta tag present (`width=device-width, initial-scale=1`) | |
| 6.2 | Touch targets ≥ 44×44px (buttons, inputs, toggles) | |
| 6.3 | No horizontal scroll at 375px width | |
| 6.4 | Text readable without zoom (base ≥ 16px) | |
| 6.5 | "Reset Demo" button clears all localStorage, reseeds current scenario | |
| 6.6 | Reset confirms via modal/toast (prevents accidental wipe) | |
| 6.7 | After reset, all flows (1-4) work identically | |

---

## 🧮 CALCULATION VERIFICATION TABLE

| Scenario | Worker | Shift Hours | Expected Regular | Expected OT | Gross | Deductions (12%) | Net |
|----------|--------|-------------|------------------|-------------|-------|------------------|-----|
| Construction | Laborer | 8h | 8 × 180 = 1,440 | 0 | 1,440 | 172.80 | 1,267.20 |
| Construction | Laborer | 10h | 8 × 180 = 1,440 | 2 × 270 = 540 | 1,980 | 237.60 | 1,742.40 |
| Construction | Laborer | 13h | 8 × 180 = 1,440 | 5 × 270 = 1,350 | 2,790 | 334.80 | 2,455.20 |
| College | Custodian | 8h | 8 × 150 = 1,200 | 0 | 1,200 | 144.00 | 1,056.00 |
| College | Custodian | 12h (night) | 8 × 150 = 1,200 | 4 × 225 = 900 | 2,100 | 252.00 | 1,848.00 |

**Verify in app**: FairPay panel matches these numbers exactly.

---

## 🐛 BUG CLASSIFICATION (for post-review)

| Severity | Definition | Action |
|----------|------------|--------|
| **CRITICAL** | Data loss, calculation wrong, flow broken, demo fails | Fix immediately |
| **HIGH** | Major feature incomplete, confusing UX, mobile broken | Fix before demo |
| **MEDIUM** | Visual polish, minor i18n gaps, non-blocking console errors | Note for v2 |
| **LOW** | Nice-to-have, enhancement, code style | Ignore for hackathon |

---

## ✅ REVIEW COMPLETION

- [ ] All Flow 1–6 tests executed and documented
- [ ] Calculation verification table matched
- [ ] Bug list compiled with severity
- [ ] Critical/High bugs fixed (if any)
- [ ] Demo script validated against actual build
- [ ] Final sign-off: **READY FOR HACKATHON** / **NEEDS WORK**

---

**Notes Section** (fill during review):
```
[Observations, bugs found, fixes applied, demo risks]
```