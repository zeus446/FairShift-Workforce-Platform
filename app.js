(() => {
  "use strict";

  const STORE_KEY = "fairshift-demo-state-v1";
  const POLICY = Object.freeze({ hourlyRate: 180, overtimeAfter: 8, overtimeMultiplier: 1.5, deductionRate: 0.12, allowancePerPayEstimate: 200, maxShift: 12, minimumRest: 11, weeklyLimit: 60 });
  const $ = (selector, root = document) => root.querySelector(selector);
  const money = value => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const roundMoney = value => Math.round((value + Number.EPSILON) * 100) / 100;
  const nowIso = () => new Date().toISOString();
  const ago = (days, hours = 0) => new Date(Date.now() - ((days * 24 + hours) * 3_600_000)).toISOString();
  const shift = (daysAgo, hours) => {
    const end = Date.now() - daysAgo * 86_400_000;
    return { start: new Date(end - hours * 3_600_000).toISOString(), end: new Date(end).toISOString() };
  };
  const duration = (start, end = nowIso()) => {
    const a = new Date(start).getTime(), b = new Date(end).getTime();
    return Number.isFinite(a) && Number.isFinite(b) && b >= a ? (b - a) / 3_600_000 : 0;
  };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
  const hoursText = value => `${(Math.round(value * 10) / 10).toFixed(1)}h`;
  const fmtTime = date => Number.isFinite(new Date(date).getTime()) ? new Intl.DateTimeFormat("en-IN", { hour:"numeric", minute:"2-digit" }).format(new Date(date)) : "—";
  const fmtDate = date => Number.isFinite(new Date(date).getTime()) ? new Intl.DateTimeFormat("en-IN", { day:"numeric", month:"short" }).format(new Date(date)) : "—";

  const SEED = {
    construction: {
      label:"Construction", rate:180, workers:[
        {id:"c-anjali",name:"Anjali Kumar",role:"Site safety assistant",site:"Riverside Tower",shiftPattern:"Day · 07:00–16:00",checkedIn:true,checkInAt:ago(0,3.7),skills:[{name:"Scaffold safety",level:"advanced",detail:"Site experience · 2 years"},{name:"First aid",level:"intermediate",detail:"Safety training · 2025"},{name:"PPE inspection",level:"intermediate",detail:"On-the-job training"}],shifts:[shift(1,9.5),shift(2,9),shift(3,9),shift(4,9),shift(5,9),shift(6,9)]},
        {id:"c-rajesh",name:"Rajesh Patel",role:"Crane operator",site:"Riverside Tower",shiftPattern:"Day · 06:00–19:12",checkedIn:true,checkInAt:ago(0,4),skills:[{name:"Crane operation",level:"expert",detail:"Site experience · 5 years"},{name:"Rigging & signals",level:"advanced",detail:"Safety training · 2024"}],shifts:[shift(1,13.2),shift(2,10.5),shift(3,10.5),shift(4,10.5),shift(5,10.5),shift(6,10.5)]},
        {id:"c-meena",name:"Meena Das",role:"Electrical technician",site:"East Market Works",shiftPattern:"Day · 08:00–16:00",checkedIn:true,checkInAt:ago(0,2.5),skills:[{name:"Electrical safety",level:"advanced",detail:"Safety training · 2025"},{name:"Panel maintenance",level:"intermediate",detail:"Site experience · 3 years"}],shifts:[shift(1,8),shift(2,8.5),shift(3,8),shift(4,8),shift(5,8)]},
        {id:"c-imran",name:"Imran Sheikh",role:"Mason",site:"Riverside Tower",shiftPattern:"Day · 07:30–15:30",checkedIn:false,checkInAt:null,skills:[{name:"Brickwork",level:"advanced",detail:"Site experience · 4 years"}],shifts:[shift(1,8),shift(2,8),shift(3,8),shift(4,8),shift(5,8),shift(6,7)]},
        {id:"c-lakshmi",name:"Lakshmi Nair",role:"General worker",site:"East Market Works",shiftPattern:"Day · 08:00–16:30",checkedIn:false,checkInAt:null,skills:[{name:"First aid",level:"intermediate",detail:"Community course · 2025"}],shifts:[shift(1,8.5),shift(2,8),shift(3,8),shift(4,8),shift(5,8)]},
        {id:"c-vikram",name:"Vikram Joshi",role:"Scaffolding lead",site:"Riverside Tower",shiftPattern:"Day · 07:00–15:00",checkedIn:false,checkInAt:null,skills:[{name:"Scaffold inspection",level:"expert",detail:"Site experience · 6 years"}],shifts:[shift(1,8),shift(2,8),shift(3,8),shift(4,8),shift(5,8)]}
      ],
      reports:[
        {id:"FS-2408",workerId:"c-rajesh",submittedBy:"c-rajesh",category:"Fall risk",severity:"High",site:"Riverside Tower · Level 6",description:"The guardrail at the north edge is loose on the sixth floor. The work area has been marked off.",anonymous:false,status:"Open",createdAt:ago(0,2)},
        {id:"FS-2406",workerId:"c-meena",submittedBy:"c-meena",category:"Electrical",severity:"High",site:"East Market Works · Panel B",description:"Exposed wiring beside the temporary distribution panel.",anonymous:false,status:"Investigating",createdAt:ago(1,5)},
        {id:"FS-2402",workerId:null,submittedBy:"c-imran",category:"PPE",severity:"Medium",site:"Riverside Tower · Loading area",description:"Replacement safety harnesses needed for the west crew.",anonymous:true,status:"Acknowledged",createdAt:ago(2,4)},
        {id:"FS-2397",workerId:"c-anjali",submittedBy:"c-anjali",category:"Welfare",severity:"Low",site:"Riverside Tower · Site office",description:"Drinking water station is empty during the afternoon shift.",anonymous:false,status:"Resolved",resolution:"Water station refilled; daily refill check assigned to the site lead.",createdAt:ago(5,3)}
      ]
    },
    college: {
      label:"College Facilities", rate:180, workers:[
        {id:"f-divya",name:"Divya Menon",role:"Facilities coordinator",site:"North Campus",shiftPattern:"Morning · 06:00–14:00",checkedIn:true,checkInAt:ago(0,4.2),skills:[{name:"Chemical handling",level:"advanced",detail:"Facilities training · 2025"},{name:"First aid",level:"intermediate",detail:"Safety training · 2025"},{name:"Team supervision",level:"intermediate",detail:"Experience · 3 years"}],shifts:[shift(1,8),shift(2,8),shift(3,8),shift(4,8),shift(5,8)]},
        {id:"f-murugan",name:"Murugan Selvam",role:"Night-shift custodian",site:"Library & Arts Block",shiftPattern:"Night · 22:00–06:30",checkedIn:true,checkInAt:ago(0,6),skills:[{name:"Floor care",level:"advanced",detail:"Facilities experience · 4 years"},{name:"Waste sorting",level:"intermediate",detail:"Campus training · 2024"}],shifts:[shift(1,8.5),shift(2,8.5),shift(3,8.5),shift(4,8.5),shift(5,8.5)]},
        {id:"f-priya",name:"Priya Thomas",role:"Maintenance technician",site:"Science Building",shiftPattern:"Evening · 14:00–22:30",checkedIn:true,checkInAt:ago(0,3.3),skills:[{name:"Ergonomic lifting",level:"intermediate",detail:"Safety training · 2025"},{name:"Plumbing",level:"advanced",detail:"Experience · 5 years"}],shifts:[shift(1,8.5),shift(2,8.5),shift(3,8),shift(4,8),shift(5,8)]},
        {id:"f-karthik",name:"Karthik Rao",role:"Groundskeeper",site:"North Campus",shiftPattern:"Day · 07:00–15:00",checkedIn:true,checkInAt:ago(0,2),skills:[{name:"Equipment safety",level:"intermediate",detail:"Facilities training · 2024"}],shifts:[shift(1,8),shift(2,8),shift(3,8),shift(4,8),shift(5,8)]},
        {id:"f-saira",name:"Saira Khan",role:"Custodial team lead",site:"Library & Arts Block",shiftPattern:"Night · 21:30–05:30",checkedIn:false,checkInAt:null,skills:[{name:"Chemical handling",level:"advanced",detail:"Facilities training · 2025"}],shifts:[shift(1,8),shift(2,8),shift(3,8),shift(4,8)]},
        {id:"f-joseph",name:"Joseph Peter",role:"HVAC technician",site:"Science Building",shiftPattern:"Day · 08:00–16:00",checkedIn:false,checkInAt:null,skills:[{name:"HVAC maintenance",level:"expert",detail:"Experience · 7 years"}],shifts:[shift(1,8),shift(2,8),shift(3,8),shift(4,8),shift(5,8)]}
      ],
      reports:[
        {id:"FS-2512",workerId:"f-murugan",submittedBy:"f-murugan",category:"Ergonomics",severity:"Medium",site:"Library & Arts Block · Level 2",description:"Moving the book return bins alone requires repeated heavy lifting. A trolley would help.",anonymous:false,status:"Open",createdAt:ago(0,1.7)},
        {id:"FS-2508",workerId:null,submittedBy:"f-saira",category:"Chemical",severity:"High",site:"Science Building · Cleaning store",description:"Unlabelled cleaning containers were left by the south storage sink.",anonymous:true,status:"Investigating",createdAt:ago(1,7)},
        {id:"FS-2504",workerId:"f-priya",submittedBy:"f-priya",category:"Equipment",severity:"Low",site:"North Campus · Workshop",description:"One of the wheeled maintenance carts has an unstable handle.",anonymous:false,status:"Acknowledged",createdAt:ago(3,1)},
        {id:"FS-2501",workerId:"f-divya",submittedBy:"f-divya",category:"Chemical",severity:"Medium",site:"Science Building · Room 114",description:"Storage cabinet needs updated handling instructions.",anonymous:false,status:"Resolved",resolution:"Handling instructions posted and the cabinet checklist updated.",createdAt:ago(6,3)}
      ]
    }
  };

  const I18N = {
    en:{
      "appTitle":"fairshift","sdg8":"SDG 8","resetDemo":"Reset Demo","switchToEmployer":"Employer View","switchToWorker":"Worker View","scenario.construction":"Construction","scenario.college":"College Facilities","nav.worker":"Worker portal","nav.employer":"Employer command center","nav.demo":"2-minute demo","highContrast":"High contrast","selectWorker":"Select a worker","worker.select":"Demo worker","todayHours":"Today:","weekHours":"Week:","shiftCheck.title":"ShiftCheck · Attendance","shiftCheck.offShift":"Not checked in","shiftCheck.checkIn":"Check in","shiftCheck.checkOut":"Check out","shiftCheck.recent":"Recorded shifts","fairPay.title":"FairPay · Estimated earnings","fairPay.baseHours":"Regular hours","fairPay.otHours":"Overtime hours","fairPay.baseRate":"Base rate","fairPay.gross":"Gross pay","fairPay.allowances":"Allowances","fairPay.deductions":"Estimated deductions · 12%","fairPay.net":"Estimated take-home pay","fairPay.note":"Estimate from recorded shifts · ₹180/hour · 1.5× after 8 hours per shift. Demo allowance ₹200 and 12% deductions. Not a payslip or legal advice.","fatigue.title":"FatigueGuard · Clear reasons, useful actions","fatigue.rules":"Configurable demo rules: shift >12h · rest <11h between completed shifts · >60h in 7 days. These are not universal legal standards.","safeVoice.title":"SafeVoice · Report a workplace hazard","safeVoice.type":"Category","safeVoice.severity":"Severity","safeVoice.location":"Worksite or location","safeVoice.description":"What happened or could cause harm?","safeVoice.anonymous":"Submit as an anonymous demo report","safeVoice.privacy":"Local demo only. A privileged device user can inspect stored reports; anonymity is not guaranteed.","safeVoice.submit":"Submit report","safeVoice.myReports":"Your submitted reports","skillPassport.title":"SkillPassport · Experience worth recognizing","skillPassport.addSkill":"Add a skill or training","skillPassport.export":"Export skills as JSON","skillPassport.skillName":"Skill or training","skillPassport.skillDetail":"Experience or training details","skillPassport.skillLevel":"Proficiency","skillPassport.beginner":"Beginner","skillPassport.intermediate":"Intermediate","skillPassport.advanced":"Advanced","skillPassport.expert":"Expert","skillPassport.certified":"Training completed","save":"Save skill","cancel":"Cancel","status.open":"Open","status.submitted":"Submitted","status.acknowledged":"Acknowledged","status.investigating":"Investigating","status.resolved":"Resolved","pulse.present":"On shift now","pulse.totalWorkers":"Demo workers","pulse.unresolvedHazards":"Unresolved safety reports","pulse.avgOvertime":"Overtime hours · 7 days","pulse.fatigueAlerts":"Fatigue rule alerts","pulse.incidentQueue":"Safety inbox · status updates sync to workers","pulse.workforce":"Workforce attendance & hours · sample data","pulse.colWorker":"Worker","pulse.colRole":"Role / shift","pulse.colHoursWeek":"Hours · 7 days","pulse.colOvertime":"OT hours","pulse.colFatigue":"Alerts","pulse.colStatus":"Attendance","pulse.filterReports":"Filter safety reports","pulse.allReports":"All reports","pulse.searchWorkers":"Search workers or worksites","pulse.acknowledge":"Acknowledge","pulse.investigate":"Investigate","pulse.resolve":"Resolve","pulse.resolveTitle":"Resolve this report","pulse.resolutionNotes":"Resolution action taken","pulse.recommendations":"Fairness Pulse · recommended actions","pulse.noOpenReports":"No unresolved safety reports. Keep checking in with workers.","pulse.recommendOvertime":"Review overtime coverage","pulse.recommendOvertimeText":"Recorded hours are over a configurable demo threshold. Talk with the worker about coverage and recovery time.","pulse.recommendRest":"Protect between-shift rest","pulse.recommendRestText":"A recorded interval fell below the demo minimum. Adjust the next shift and check in with the worker.","pulse.recommendHazards":"Follow up on safety reports","pulse.recommendHazardsText":"Give open reports an owner and timely worker-visible resolution.","confirm.resetTitle":"Reset the sample workspace?","confirm.resetMsg":"This removes saved demo changes and restores the original sample records on this device.","confirm.reset":"Reset demo data","demo.title":"FairShift · a two-minute SDG 8 demo","demo.step1.title":"Compare industries:","demo.step1.desc":"Switch between Construction and College Facilities. See distinct roles, shifts, sites, and reports.","demo.step2.title":"Record a shift:","demo.step2.desc":"Select a worker, check in, then check out. Real timestamps feed the saved shift history.","demo.step3.title":"See fair pay:","demo.step3.desc":"Review regular hours, overtime after 8 hours per shift, sample allowances, deductions, and estimated take-home pay.","demo.step4.title":"Make safety rules visible:","demo.step4.desc":"See an explainable alert for a shift over 12h, rest under 11h, or over 60h in 7 days.","demo.step5.title":"Speak up:","demo.step5.desc":"Submit a hazard with category, severity, location, and optional anonymous display.","demo.step6.title":"Close the loop:","demo.step6.desc":"Switch to the employer view, acknowledge or investigate a report, then resolve it. Check the worker status.","demo.step7.title":"Act on signals:","demo.step7.desc":"Fairness Pulse metrics and recommendations are derived from the same records.","demo.step8.title":"Include more people:","demo.step8.desc":"Switch the interface between English, Hindi, and Tamil; try high contrast and the mobile layout.","demo.step9.title":"Start fresh:","demo.step9.desc":"Use Reset Demo to restore the seeded sample workspace.","demo.note":"Local browser demo · no API, identity verification, location tracking, secure anonymity, or payroll integration. Aligned with SDG 8: Decent Work and Economic Growth.","generic.actions":"Recommended action","generic.estimate":"Illustrative estimate","generic.sample":"SAMPLE DATA","generic.thisDevice":"Saved on this device","generic.hours":"hours","generic.reportedBy":"Reported by","generic.anonymous":"Anonymous reporter","generic.open":"Open","generic.noReports":"No safety reports to show.","generic.noShifts":"No completed shifts yet.","generic.noSkills":"No skills added yet.","generic.noAlerts":"No active fatigue alerts for this worker.","generic.risk":"Rule triggered","generic.ruleShift":"Shift over 12 hours","generic.ruleRest":"Rest under 11 hours","generic.ruleWeek":"Over 60 hours in seven days","generic.actionShift":"Arrange safe cover, stop excess hours, and check that the worker is okay.","generic.actionRest":"Review the next shift and allow recovery before scheduling more hours.","generic.actionWeek":"Review this week's schedule with the worker and adjust coverage.","generic.allClear":"No active concerns from these demo rules.","generic.demo":"DEMO","generic.status":"Status","generic.notSaved":"Browser storage is unavailable; changes last only while this page stays open.","generic.saveError":"Could not save this update in browser storage.","generic.resetSuccess":"Demo workspace restored.","generic.submitted":"Report submitted · ID ","generic.checkedIn":"Check-in recorded at ","generic.checkedOut":"Check-out recorded · ","generic.skillSaved":"Skill added to your passport.","generic.reportUpdated":"Report status updated.","generic.workerRequired":"Select a worker before recording attendance.","generic.formError":"Please complete each field. Descriptions must be at least 10 characters.","generic.fatiguePolicy":"Configurable demo safety policies · not legal standards.","generic.disclosure":"Estimate only · not payroll or legal advice."
    },
    hi:{
      "appTitle":"फेयरशिफ्ट","sdg8":"SDG 8","resetDemo":"डेमो रीसेट","switchToEmployer":"नियोक्ता दृश्य","switchToWorker":"कर्मचारी दृश्य","scenario.construction":"निर्माण","scenario.college":"कॉलेज सुविधाएँ","nav.worker":"कर्मचारी पोर्टल","nav.employer":"नियोक्ता केंद्र","nav.demo":"2 मिनट का डेमो","highContrast":"हाई कॉन्ट्रास्ट","selectWorker":"कर्मचारी चुनें","worker.select":"डेमो कर्मचारी","todayHours":"आज:","weekHours":"सप्ताह:","shiftCheck.title":"शिफ्ट चेक · उपस्थिति","shiftCheck.offShift":"चेक इन नहीं","shiftCheck.checkIn":"चेक इन","shiftCheck.checkOut":"चेक आउट","shiftCheck.recent":"दर्ज शिफ्टें","fairPay.title":"उचित वेतन · अनुमानित आय","fairPay.baseHours":"नियमित घंटे","fairPay.otHours":"ओवरटाइम घंटे","fairPay.baseRate":"मूल दर","fairPay.gross":"सकल वेतन","fairPay.allowances":"भत्ते","fairPay.deductions":"अनुमानित कटौती · 12%","fairPay.net":"अनुमानित हाथ में वेतन","fairPay.note":"दर्ज शिफ्ट का अनुमान · ₹180/घंटा · प्रति शिफ्ट 8 घंटे बाद 1.5×। ₹200 नमूना भत्ता और 12% कटौती। वेतन पर्ची या कानूनी सलाह नहीं।","fatigue.title":"थकान सुरक्षा · स्पष्ट कारण, काम के कदम","fatigue.rules":"डेमो नियम: शिफ्ट >12 घंटे · पूरी शिफ्टों के बीच आराम <11 घंटे · 7 दिनों में >60 घंटे। ये सार्वभौमिक कानूनी मानक नहीं हैं।","safeVoice.title":"सुरक्षा आवाज़ · कार्यस्थल का खतरा बताएँ","safeVoice.type":"श्रेणी","safeVoice.severity":"गंभीरता","safeVoice.location":"कार्यस्थल या स्थान","safeVoice.description":"क्या हुआ या किससे नुकसान हो सकता है?","safeVoice.anonymous":"गुमनाम डेमो रिपोर्ट के रूप में भेजें","safeVoice.privacy":"केवल स्थानीय डेमो। डिवाइस का विशेष उपयोगकर्ता रिपोर्ट देख सकता है; गुमनामी की गारंटी नहीं।","safeVoice.submit":"रिपोर्ट भेजें","safeVoice.myReports":"आपकी रिपोर्टें","skillPassport.title":"कौशल पासपोर्ट · अनुभव की पहचान","skillPassport.addSkill":"कौशल या प्रशिक्षण जोड़ें","skillPassport.export":"कौशल JSON निर्यात करें","skillPassport.skillName":"कौशल या प्रशिक्षण","skillPassport.skillDetail":"अनुभव या प्रशिक्षण विवरण","skillPassport.skillLevel":"दक्षता","skillPassport.beginner":"शुरुआती","skillPassport.intermediate":"मध्यम","skillPassport.advanced":"उन्नत","skillPassport.expert":"विशेषज्ञ","skillPassport.certified":"प्रशिक्षण पूरा","save":"कौशल सहेजें","cancel":"रद्द करें","status.open":"खुली","status.submitted":"भेजी गई","status.acknowledged":"स्वीकृत","status.investigating":"जाँच जारी","status.resolved":"समाधान हुआ","pulse.present":"अभी काम पर","pulse.totalWorkers":"डेमो कर्मचारी","pulse.unresolvedHazards":"खुली सुरक्षा रिपोर्टें","pulse.avgOvertime":"ओवरटाइम घंटे · 7 दिन","pulse.fatigueAlerts":"थकान नियम चेतावनी","pulse.incidentQueue":"सुरक्षा इनबॉक्स · स्थिति कर्मचारी को दिखेगी","pulse.workforce":"उपस्थिति और घंटे · नमूना डेटा","pulse.colWorker":"कर्मचारी","pulse.colRole":"भूमिका / शिफ्ट","pulse.colHoursWeek":"घंटे · 7 दिन","pulse.colOvertime":"ओवरटाइम घंटे","pulse.colFatigue":"चेतावनी","pulse.colStatus":"उपस्थिति","pulse.filterReports":"रिपोर्ट छाँटें","pulse.allReports":"सभी रिपोर्टें","pulse.searchWorkers":"कर्मचारी या स्थान खोजें","pulse.acknowledge":"स्वीकार करें","pulse.investigate":"जाँच करें","pulse.resolve":"समाधान करें","pulse.resolveTitle":"रिपोर्ट का समाधान करें","pulse.resolutionNotes":"की गई कार्रवाई","pulse.recommendations":"निष्पक्षता संकेत · कार्रवाई","pulse.noOpenReports":"कोई खुली रिपोर्ट नहीं। कर्मचारियों से बातचीत जारी रखें।","pulse.recommendOvertime":"ओवरटाइम कवरेज देखें","pulse.recommendOvertimeText":"दर्ज घंटे डेमो सीमा से ऊपर हैं। काम और आराम के बारे में कर्मचारी से चर्चा करें।","pulse.recommendRest":"शिफ्टों के बीच आराम दें","pulse.recommendRestText":"आराम का समय डेमो न्यूनतम से कम है। अगली शिफ्ट बदलें और कर्मचारी से बात करें।","pulse.recommendHazards":"सुरक्षा रिपोर्ट पर कार्रवाई करें","pulse.recommendHazardsText":"खुली रिपोर्टों के लिए संपर्क और कर्मचारी को दिखने वाला समाधान सुनिश्चित करें।","confirm.resetTitle":"डेमो डेटा रीसेट करें?","confirm.resetMsg":"यह सहेजे गए डेमो बदलाव हटाकर मूल नमूना रिकॉर्ड लौटाएगा।","confirm.reset":"डेमो रीसेट करें","demo.title":"फेयरशिफ्ट · SDG 8 डेमो","demo.step1.title":"उद्योग देखें:","demo.step1.desc":"निर्माण और कॉलेज सुविधाओं की अलग भूमिकाएँ, शिफ्ट और रिपोर्ट देखें।","demo.step2.title":"शिफ्ट दर्ज करें:","demo.step2.desc":"कर्मचारी चुनें, चेक इन और चेक आउट करें। समय शिफ्ट इतिहास में जुड़ेगा।","demo.step3.title":"वेतन देखें:","demo.step3.desc":"नियमित घंटे, ओवरटाइम, नमूना भत्ते, कटौती और अनुमानित शुद्ध आय देखें।","demo.step4.title":"सुरक्षा नियम देखें:","demo.step4.desc":"12 घंटे से लंबी शिफ्ट, 11 घंटे से कम आराम या सप्ताह में 60 घंटे से अधिक पर चेतावनी।","demo.step5.title":"समस्या बताएँ:","demo.step5.desc":"श्रेणी, गंभीरता और स्थान के साथ खतरा बताएँ; नाम छिपाने का विकल्प चुनें।","demo.step6.title":"समाधान तक जाएँ:","demo.step6.desc":"नियोक्ता दृश्य में रिपोर्ट स्वीकारें, जाँचें या हल करें। कर्मचारी की स्थिति देखें।","demo.step7.title":"संकेत पर कार्रवाई करें:","demo.step7.desc":"डैशबोर्ड के आँकड़े और सुझाव उन्हीं डेमो रिकॉर्ड पर आधारित हैं।","demo.step8.title":"भाषा बदलें:","demo.step8.desc":"अंग्रेज़ी, हिंदी या तमिल चुनें। हाई कॉन्ट्रास्ट और मोबाइल दृश्य आज़माएँ।","demo.step9.title":"फिर से शुरू करें:","demo.step9.desc":"रीसेट बटन से मूल डेमो डेटा लौटाएँ।","demo.note":"स्थानीय ब्राउज़र डेमो · कोई API, पहचान या स्थान सत्यापन, सुरक्षित गुमनामी या पेरोल कनेक्शन नहीं। SDG 8: सभ्य काम और आर्थिक विकास।","generic.actions":"सुझाया गया कदम","generic.estimate":"अनुमान","generic.sample":"नमूना डेटा","generic.thisDevice":"इस डिवाइस पर सहेजा","generic.hours":"घंटे","generic.reportedBy":"रिपोर्टर","generic.anonymous":"गुमनाम रिपोर्टर","generic.open":"खुला","generic.noReports":"दिखाने के लिए रिपोर्ट नहीं।","generic.noShifts":"अभी पूरी शिफ्टें दर्ज नहीं।","generic.noSkills":"कौशल नहीं जोड़े।","generic.noAlerts":"थकान की सक्रिय चेतावनी नहीं।","generic.risk":"नियम सक्रिय","generic.ruleShift":"12 घंटे से लंबी शिफ्ट","generic.ruleRest":"11 घंटे से कम आराम","generic.ruleWeek":"सात दिनों में 60 घंटे से अधिक","generic.actionShift":"सुरक्षित सहायता लें और कर्मचारी की कुशलता सुनिश्चित करें।","generic.actionRest":"अगली शिफ्ट से पहले आराम का समय दें।","generic.actionWeek":"इस सप्ताह के घंटे कर्मचारी के साथ देखें और काम बदलें।","generic.allClear":"इन डेमो नियमों से कोई सक्रिय चिंता नहीं।","generic.demo":"डेमो","generic.status":"स्थिति","generic.notSaved":"ब्राउज़र स्टोरेज उपलब्ध नहीं; पेज खुला रहने तक बदलाव रहेंगे।","generic.saveError":"ब्राउज़र में बदलाव सहेजा नहीं जा सका।","generic.resetSuccess":"डेमो कार्यस्थल बहाल हुआ।","generic.submitted":"रिपोर्ट भेजी · आईडी ","generic.checkedIn":"चेक इन दर्ज · ","generic.checkedOut":"चेक आउट दर्ज · ","generic.skillSaved":"कौशल पासपोर्ट में जुड़ा।","generic.reportUpdated":"रिपोर्ट की स्थिति बदली।","generic.workerRequired":"उपस्थिति दर्ज करने से पहले कर्मचारी चुनें।","generic.formError":"सभी फ़ील्ड भरें। विवरण कम से कम 10 अक्षरों का हो।","generic.fatiguePolicy":"डेमो सुरक्षा नियम · कानूनी मानक नहीं।","generic.disclosure":"केवल अनुमान · पेरोल या कानूनी सलाह नहीं।"
    },
    ta:{
      "appTitle":"ஃபேர்ஷிப்ட்","sdg8":"SDG 8","resetDemo":"மாதிரி மீட்டமை","switchToEmployer":"முதலாளி பார்வை","switchToWorker":"பணியாளர் பார்வை","scenario.construction":"கட்டுமானம்","scenario.college":"கல்லூரி வசதிகள்","nav.worker":"பணியாளர் தளம்","nav.employer":"முதலாளி மையம்","nav.demo":"2 நிமிட விளக்கம்","highContrast":"உயர் மாறுபாடு","selectWorker":"பணியாளரைத் தேர்ந்தெடு","worker.select":"மாதிரி பணியாளர்","todayHours":"இன்று:","weekHours":"வாரம்:","shiftCheck.title":"ஷிப்ட் வருகைப் பதிவு","shiftCheck.offShift":"வருகைப் பதிவு இல்லை","shiftCheck.checkIn":"வருகை பதிவு","shiftCheck.checkOut":"வெளியேறும் பதிவு","shiftCheck.recent":"பதிவான ஷிப்டுகள்","fairPay.title":"நியாய ஊதியம் · மதிப்பீடு","fairPay.baseHours":"வழக்கமான நேரம்","fairPay.otHours":"கூடுதல் நேரம்","fairPay.baseRate":"அடிப்படை ஊதியம்","fairPay.gross":"மொத்த ஊதியம்","fairPay.allowances":"படிகள்","fairPay.deductions":"மதிப்பிட்ட பிடித்தம் · 12%","fairPay.net":"மதிப்பிடப்பட்ட நிகர ஊதியம்","fairPay.note":"பதிவான ஷிப்டுகளின் மதிப்பீடு · ₹180/மணி · ஷிப்டில் 8 மணி கழித்து 1.5×. ₹200 மாதிரி படி மற்றும் 12% பிடித்தம். ஊதியச்சீட்டோ சட்ட ஆலோசனையோ அல்ல.","fatigue.title":"சோர்வு பாதுகாப்பு · தெளிவான காரணம், அடுத்த செயல்","fatigue.rules":"மாதிரி விதிகள்: ஷிப்ட் >12 மணி · முடிந்த ஷிப்டுகளுக்கு இடையில் ஓய்வு <11 மணி · 7 நாட்களில் >60 மணி. இவை பொதுவான சட்ட வரம்புகள் அல்ல.","safeVoice.title":"பாதுகாப்பு குரல் · ஆபத்தை அறிவி","safeVoice.type":"வகை","safeVoice.severity":"தீவிரம்","safeVoice.location":"பணியிடம் அல்லது இடம்","safeVoice.description":"என்ன நடந்தது அல்லது ஆபத்தை ஏற்படுத்துவது எது?","safeVoice.anonymous":"அநாமதேய மாதிரி அறிக்கையாக அனுப்பு","safeVoice.privacy":"உள்ளூர் மாதிரி மட்டும். சாதனப் பயனர் அறிக்கைகளைப் பார்க்கலாம்; அநாமதேயத்திற்கு உத்தரவாதம் இல்லை.","safeVoice.submit":"அறிக்கையைச் சமர்ப்பி","safeVoice.myReports":"உங்கள் அறிக்கைகள்","skillPassport.title":"திறன் பாஸ்போர்ட் · அனுபவத்திற்கு அங்கீகாரம்","skillPassport.addSkill":"திறன் அல்லது பயிற்சியைச் சேர்","skillPassport.export":"திறன்களை JSON ஆகப் பதிவிறக்கு","skillPassport.skillName":"திறன் அல்லது பயிற்சி","skillPassport.skillDetail":"அனுபவம் அல்லது பயிற்சி விவரம்","skillPassport.skillLevel":"திறன் நிலை","skillPassport.beginner":"தொடக்கம்","skillPassport.intermediate":"இடைநிலை","skillPassport.advanced":"மேம்பட்ட","skillPassport.expert":"நிபுணர்","skillPassport.certified":"பயிற்சி முடிந்தது","save":"சேமி","cancel":"ரத்து","status.open":"திறந்தது","status.submitted":"அனுப்பப்பட்டது","status.acknowledged":"ஏற்றுக்கொண்டது","status.investigating":"விசாரணை","status.resolved":"தீர்க்கப்பட்டது","pulse.present":"இப்போது பணியில்","pulse.totalWorkers":"மாதிரி பணியாளர்கள்","pulse.unresolvedHazards":"தீர்க்கப்படாத பாதுகாப்பு அறிக்கைகள்","pulse.avgOvertime":"கூடுதல் மணி · 7 நாட்கள்","pulse.fatigueAlerts":"சோர்வு விதி எச்சரிக்கைகள்","pulse.incidentQueue":"பாதுகாப்புப் பெட்டி · நிலை பணியாளருக்கும் தெரியும்","pulse.workforce":"வருகை மற்றும் நேரம் · மாதிரி தரவு","pulse.colWorker":"பணியாளர்","pulse.colRole":"பொறுப்பு / ஷிப்ட்","pulse.colHoursWeek":"நேரம் · 7 நாட்கள்","pulse.colOvertime":"கூடுதல் மணி","pulse.colFatigue":"எச்சரிக்கைகள்","pulse.colStatus":"வருகை","pulse.filterReports":"அறிக்கைகளை வடிகட்டு","pulse.allReports":"அனைத்து அறிக்கைகள்","pulse.searchWorkers":"பணியாளர் அல்லது இடத்தைத் தேடு","pulse.acknowledge":"ஏற்றுக்கொள்","pulse.investigate":"விசாரி","pulse.resolve":"தீர்வு","pulse.resolveTitle":"அறிக்கையைத் தீர்க்கவும்","pulse.resolutionNotes":"எடுத்த நடவடிக்கை","pulse.recommendations":"நியாயச் சுட்டி · நடவடிக்கைகள்","pulse.noOpenReports":"தீர்க்கப்படாத பாதுகாப்பு அறிக்கைகள் இல்லை. பணியாளர்களுடன் பேசுங்கள்.","pulse.recommendOvertime":"கூடுதல் நேரத்தைப் பரிசீலிக்கவும்","pulse.recommendOvertimeText":"பதிவான நேரம் மாதிரி வரம்பைத் தாண்டியது. பணிப்பகிர்வு மற்றும் ஓய்வு பற்றி பேசுங்கள்.","pulse.recommendRest":"ஷிப்டுகளுக்கு இடையில் ஓய்வளிக்கவும்","pulse.recommendRestText":"பதிவான ஓய்வு மாதிரி குறைந்தபட்சத்தைவிடக் குறைவு. அடுத்த ஷிப்டை மாற்றிப் பேசுங்கள்.","pulse.recommendHazards":"பாதுகாப்பு அறிக்கைகளைத் தொடரவும்","pulse.recommendHazardsText":"திறந்த அறிக்கைகளுக்கு பொறுப்பான நபரையும் பணியாளருக்குத் தெரியும் தீர்வையும் ஏற்பாடு செய்யவும்.","confirm.resetTitle":"மாதிரி தரவை மீட்டமைக்கவா?","confirm.resetMsg":"சேமித்த மாற்றங்களை நீக்கி அசல் மாதிரிப் பதிவுகளை மீட்டமைக்கும்.","confirm.reset":"மாதிரி தரவை மீட்டமை","demo.title":"ஃபேர்ஷிப்ட் · SDG 8 விளக்கம்","demo.step1.title":"தொழிலை ஒப்பிடு:","demo.step1.desc":"கட்டுமானம், கல்லூரி வசதிகளின் வேறுபட்ட பணிகள், ஷிப்டுகள், இடங்கள், அறிக்கைகளைப் பார்.","demo.step2.title":"ஷிப்டைப் பதிவு செய்:","demo.step2.desc":"பணியாளரைத் தேர்ந்தெடுத்து வருகை/வெளியேறும் பதிவு செய். நேரம் வரலாற்றில் சேரும்.","demo.step3.title":"ஊதியத்தைப் பார்:","demo.step3.desc":"வழக்கமான நேரம், கூடுதல் நேரம், படிகள், பிடித்தம், மதிப்பிடப்பட்ட நிகர ஊதியத்தைப் பார்.","demo.step4.title":"பாதுகாப்பு விதிகளைப் புரிந்துகொள்:","demo.step4.desc":"12 மணி ஷிப்ட், 11 மணி குறைவு ஓய்வு அல்லது வாரம் 60 மணி கடந்தால் தெளிவான எச்சரிக்கை.","demo.step5.title":"பாதுகாப்பைப் பற்றிப் பேசு:","demo.step5.desc":"வகை, தீவிரம், இடத்துடன் ஆபத்தை அறிவி; பெயரை மறைக்கும் விருப்பம் உள்ளது.","demo.step6.title":"சுழற்சியை முடி:","demo.step6.desc":"முதலாளி பார்வையில் அறிக்கையை ஏற்று, விசாரித்து, தீர்வு செய். பணியாளர் நிலையைச் சரிபார்.","demo.step7.title":"செயல்படு:","demo.step7.desc":"நியாயப் பணிச் சுட்டியின் அளவீடுகளும் பரிந்துரைகளும் அதே பதிவுகளைப் பயன்படுத்தும்.","demo.step8.title":"அனைவரையும் உள்ளடக்கு:","demo.step8.desc":"ஆங்கிலம், இந்தி, தமிழ்; உயர் மாறுபாடு, கைபேசி வடிவத்தையும் முயற்சி செய்.","demo.step9.title":"மீண்டும் தொடங்கு:","demo.step9.desc":"மாதிரி மீட்டமை பொத்தானால் அசல் பணியிடத்திற்குத் திரும்பு.","demo.note":"உள்ளூர் உலாவி மாதிரி · API, அடையாளச் சரிபார்ப்பு, இடம் கண்காணிப்பு, பாதுகாப்பான அநாமதேயம், ஊதிய இணைப்பு இல்லை. SDG 8: கண்ணியமான வேலை மற்றும் பொருளாதார வளர்ச்சி.","generic.actions":"பரிந்துரைக்கப்படும் செயல்","generic.estimate":"மதிப்பீடு","generic.sample":"மாதிரி தரவு","generic.thisDevice":"இந்தச் சாதனத்தில் சேமிக்கப்பட்டது","generic.hours":"மணி","generic.reportedBy":"அறிவித்தவர்","generic.anonymous":"அநாமதேயப் புகாராளர்","generic.open":"திறந்தது","generic.noReports":"காட்ட அறிக்கைகள் இல்லை.","generic.noShifts":"முடித்த ஷிப்டுகள் இல்லை.","generic.noSkills":"திறன்கள் சேர்க்கப்படவில்லை.","generic.noAlerts":"சோர்வு எச்சரிக்கைகள் இல்லை.","generic.risk":"விதி தூண்டப்பட்டது","generic.ruleShift":"12 மணிக்கு மேல் ஷிப்ட்","generic.ruleRest":"11 மணிக்குக் குறைந்த ஓய்வு","generic.ruleWeek":"7 நாட்களில் 60 மணிக்கு மேல்","generic.actionShift":"பாதுகாப்பான மாற்று ஏற்பாடு செய்து பணியாளரின் நலனைச் சரிபார்க்கவும்.","generic.actionRest":"அடுத்த ஷிப்டுக்கு முன் ஓய்வு நேரம் விடவும்.","generic.actionWeek":"வார நேரத்தைப் பணியாளருடன் மதிப்பிட்டு வேலையை மாற்றவும்.","generic.allClear":"இந்த மாதிரி விதிகளால் செயலில் உள்ள கவலை இல்லை.","generic.demo":"மாதிரி","generic.status":"நிலை","generic.notSaved":"உலாவி சேமிப்பிடம் இல்லை; இந்தப் பக்கம் திறந்திருக்கும் வரை மாற்றங்கள் இருக்கும்.","generic.saveError":"உலாவியில் மாற்றத்தைச் சேமிக்க முடியவில்லை.","generic.resetSuccess":"மாதிரி பணியிடம் மீட்டமைக்கப்பட்டது.","generic.submitted":"அறிக்கை சமர்ப்பிக்கப்பட்டது · எண் ","generic.checkedIn":"வருகை பதிவு · ","generic.checkedOut":"வெளியேறும் பதிவு · ","generic.skillSaved":"உங்கள் பாஸ்போர்ட்டில் திறன் சேர்க்கப்பட்டது.","generic.reportUpdated":"அறிக்கை நிலை மாற்றப்பட்டது.","generic.workerRequired":"வருகையைப் பதிவு செய்ய முன் பணியாளரைத் தேர்ந்தெடுக்கவும்.","generic.formError":"எல்லா புலங்களையும் நிரப்பவும். விவரம் குறைந்தது 10 எழுத்துகள் இருக்க வேண்டும்.","generic.fatiguePolicy":"மாதிரி பாதுகாப்பு விதிகள் · சட்ட வரம்புகள் அல்ல.","generic.disclosure":"மதிப்பீடு மட்டும் · ஊதிய அல்லது சட்ட ஆலோசனை அல்ல."
    }
  };

  I18N.en["pulse.overviewTitle"]="Today's Fairness Pulse";
  I18N.hi["pulse.overviewTitle"]="आज का निष्पक्षता संकेत";
  I18N.ta["pulse.overviewTitle"]="இன்றைய நியாயப் பணிச் சுட்டி";
  I18N.en["shiftCheck.onShift"]="On shift";
  I18N.hi["shiftCheck.onShift"]="ड्यूटी पर";
  I18N.ta["shiftCheck.onShift"]="பணியில்";
  I18N.en["fairPay.regularPay"]="Regular wages";
  I18N.hi["fairPay.regularPay"]="नियमित वेतन";
  I18N.ta["fairPay.regularPay"]="வழக்கமான ஊதியம்";
  I18N.en["fairPay.overtimeRate"]="Overtime rate";
  I18N.hi["fairPay.overtimeRate"]="ओवरटाइम दर";
  I18N.ta["fairPay.overtimeRate"]="கூடுதல் நேர விகிதம்";
  I18N.en["fairPay.overtimePay"]="Overtime wages";
  I18N.hi["fairPay.overtimePay"]="ओवरटाइम वेतन";
  I18N.ta["fairPay.overtimePay"]="கூடுதல் நேர ஊதியம்";

  let state;
  let selectedView="worker";
  let pendingResolveId=null;
  let searchText="";
  let reportFilter="all";
  let toastTimer;
  let storageAvailable=true;

  const tr = key => I18N[state.language]?.[key] || I18N.en[key] || key;
  const currentSector = () => state.sectors[state.sector];
  const workerById = id => currentSector().workers.find(worker=>worker.id===id);
  const selectedWorker = () => workerById(state.workerId) || currentSector().workers[0] || null;

  function cloneSeed() {
    return typeof structuredClone==="function" ? structuredClone(SEED) : JSON.parse(JSON.stringify(SEED));
  }
  function makeState() {
    const sectors=cloneSeed();
    return { version:1, role:"worker", sector:"construction", workerId:sectors.construction.workers[0].id, language:"en", highContrast:false, sectors };
  }
  function validState(value) {
    return Boolean(value && value.version===1 && ["construction","college"].includes(value.sector) && ["worker","employer"].includes(value.role) && ["en","hi","ta"].includes(value.language) && value.sectors && ["construction","college"].every(key=>value.sectors[key] && Array.isArray(value.sectors[key].workers) && Array.isArray(value.sectors[key].reports) && value.sectors[key].workers.every(worker=>worker && typeof worker.id==="string" && Array.isArray(worker.shifts) && Array.isArray(worker.skills)) && value.sectors[key].reports.every(report=>report && typeof report.id==="string" && ["Open","Acknowledged","Investigating","Resolved"].includes(report.status))));
  }
  function loadState() {
    try {
      const saved=localStorage.getItem(STORE_KEY);
      if (!saved) return makeState();
      const parsed=JSON.parse(saved);
      if (!validState(parsed)) {
        console.warn("FairShift: invalid or outdated saved demo data was discarded.");
        localStorage.removeItem(STORE_KEY);
        return makeState();
      }
      return parsed;
    } catch (error) {
      storageAvailable=false;
      console.warn("FairShift: browser storage could not be read; using a fresh in-memory demo.",error);
      return makeState();
    }
  }
  function persist() {
    try { localStorage.setItem(STORE_KEY,JSON.stringify(state)); }
    catch(error) {
      storageAvailable=false;
      console.warn("FairShift: browser storage could not save the demo state.",error);
      toast(tr("generic.saveError"),"error");
    }
  }
  function toast(message,type="success") {
    const host=$("#toastContainer");
    if (!host) return;
    host.innerHTML=`<div class="toast ${type}" role="status">${escapeHtml(message)}</div>`;
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>{host.replaceChildren();},3800);
  }
  function setText(element,value) { if (element) element.textContent=value; }
  function localizePage() {
    document.documentElement.lang=state.language;
    document.documentElement.classList.toggle("high-contrast",Boolean(state.highContrast));
    document.querySelectorAll("[data-i18n]").forEach(element=>{
      const key=element.dataset.i18n;
      if(key==="appTitle") {
        const caption=element.querySelector(".brand-caption");
        element.firstChild.nodeValue=tr(key);
        if(caption) caption.textContent=state.language==="en"?"DECENT WORK, EVERY DAY":state.language==="hi"?"सम्मानजनक काम, हर दिन":"கண்ணியமான வேலை, ஒவ்வொரு நாளும்";
      } else if(key==="highContrast") {
        element.lastChild.nodeValue=` ${tr(key)}`;
      } else setText(element,tr(key));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element=>element.placeholder=tr(element.dataset.i18nPlaceholder));
    $("#langSelect").value=state.language;
    $("#scenarioSelect").value=state.sector;
    $("#resetDemo").textContent=tr("resetDemo");
    $("#highContrastToggle").checked=state.highContrast;
    $("#contrastButton").setAttribute("aria-label",tr("highContrast"));
    $("#viewToggle").textContent=state.role==="worker"?tr("switchToEmployer"):tr("switchToWorker");
    const selected=$("#workerSelect");
    if(selected) selected.setAttribute("aria-label",tr("worker.select"));
  }

  function completed(worker) { return worker.shifts.filter(item=>item&&item.end&&Number.isFinite(new Date(item.start).getTime())&&Number.isFinite(new Date(item.end).getTime())); }
  function weekShifts(worker) {
    const cutoff=Date.now()-7*86_400_000;
    return worker.shifts.filter(item=>item&&item.start&&item.end&&Number.isFinite(new Date(item.start).getTime())&&Number.isFinite(new Date(item.end).getTime())&&new Date(item.end).getTime()>=cutoff);
  }
  function weekHours(worker) {
    return weekShifts(worker).reduce((sum,item)=>sum+duration(item.start,item.end),0)+(worker.checkedIn&&Number.isFinite(new Date(worker.checkInAt).getTime())?duration(worker.checkInAt):0);
  }
  function overtimeHours(worker) {
    return weekShifts(worker).reduce((sum,item)=>sum+Math.max(0,duration(item.start,item.end)-POLICY.overtimeAfter),0)+(worker.checkedIn?Math.max(0,duration(worker.checkInAt)-POLICY.overtimeAfter):0);
  }
  function pay(worker) {
    const records=[...completed(worker)];
    if(worker.checkedIn&&Number.isFinite(new Date(worker.checkInAt).getTime())) records.push({start:worker.checkInAt,end:nowIso()});
    const hours=records.reduce((sum,item)=>sum+duration(item.start,item.end),0);
    const regular=records.reduce((sum,item)=>sum+Math.min(duration(item.start,item.end),POLICY.overtimeAfter),0);
    const overtime=records.reduce((sum,item)=>sum+Math.max(0,duration(item.start,item.end)-POLICY.overtimeAfter),0);
    const base=roundMoney(regular*POLICY.hourlyRate);
    const overtimePay=roundMoney(overtime*POLICY.hourlyRate*POLICY.overtimeMultiplier);
    const allowance=hours>0?roundMoney(POLICY.allowancePerPayEstimate):0;
    const gross=roundMoney(base+overtimePay+allowance);
    const deductions=roundMoney(gross*POLICY.deductionRate);
    return {hours,regular,overtime,base,overtimePay,allowance,gross,deductions,net:roundMoney(gross-deductions)};
  }
  function fatigue(worker) {
    if(!worker) return [];
    const alerts=[];
    const activeHours=worker.checkedIn&&Number.isFinite(new Date(worker.checkInAt).getTime())?duration(worker.checkInAt):0;
    if(worker.checkedIn&&activeHours>POLICY.maxShift) alerts.push({key:"generic.ruleShift",reason:`${tr("shiftCheck.title")}: ${hoursText(activeHours)} · ${tr("generic.hours")}. ${tr("shiftCheck.offShift")}.`,action:"generic.actionShift",high:true});
    const shifts=completed(worker).sort((a,b)=>new Date(a.end)-new Date(b.end));
    shifts.forEach(item=>{const elapsed=duration(item.start,item.end);if(elapsed>POLICY.maxShift) alerts.push({key:"generic.ruleShift",reason:`${tr("pulse.colHoursWeek")}: ${hoursText(elapsed)} · ${fmtDate(item.end)}.`,action:"generic.actionShift",high:true});});
    for(let i=1;i<shifts.length;i++){
      const rest=duration(shifts[i-1].end,shifts[i].start);
      if(rest>=0&&rest<POLICY.minimumRest) alerts.push({key:"generic.ruleRest",reason:`${hoursText(rest)} ${tr("generic.hours")} between completed shifts · ${fmtDate(shifts[i].start)}.`,action:"generic.actionRest",high:false});
    }
    const week=weekHours(worker);
    if(week>POLICY.weeklyLimit) alerts.push({key:"generic.ruleWeek",reason:`${tr("weekHours")} ${hoursText(week)}.`,action:"generic.actionWeek",high:false});
    return alerts;
  }
  function allAlerts() { return currentSector().workers.flatMap(worker=>fatigue(worker).map(alert=>({...alert,worker}))); }
  function fmtStatus(status) { return tr(`status.${String(status).toLowerCase()}`); }

  function renderWorkerSelector() {
    const select=$("#workerSelect");
    if(!select) return;
    select.innerHTML=currentSector().workers.map(worker=>`<option value="${escapeHtml(worker.id)}">${escapeHtml(worker.name)} · ${escapeHtml(worker.role)}</option>`).join("");
    select.value=selectedWorker()?.id||"";
  }
  function renderProfile(worker) {
    setText($("#workerName"),worker?.name||tr("selectWorker"));
    setText($("#workerRole"),worker?`${worker.role} · ${worker.site} · ${worker.shiftPattern}`:"");
    $("#workerAvatar").textContent=state.sector==="construction"?"👷":"🏫";
    const todayTotal=worker?worker.shifts.filter(item=>Number.isFinite(new Date(item.end).getTime())&&new Date(item.end).toDateString()===new Date().toDateString()).reduce((sum,item)=>sum+duration(item.start,item.end),0)+(worker.checkedIn?duration(worker.checkInAt):0):0;
    setText($("#todayHours"),hoursText(todayTotal));
    setText($("#weekHours"),hoursText(worker?weekHours(worker):0));
    renderWorkerSelector();
  }
  function renderAttendance(worker) {
    const badge=$("#statusBadge");
    badge.className=`status-badge ${worker.checkedIn?"on-shift":"off-shift"}`;
    setText(badge,tr(worker.checkedIn?"shiftCheck.onShift":"shiftCheck.offShift"));
    $("#checkInBtn").style.display=worker.checkedIn?"none":"inline-flex";
    $("#checkOutBtn").style.display=worker.checkedIn?"inline-flex":"none";
    $("#shiftTimer").style.display=worker.checkedIn?"inline-block":"none";
    setText($("#shiftTimer"),worker.checkedIn?`${hoursText(duration(worker.checkInAt))} · ${tr("generic.thisDevice")}`:"");
    const records=[...completed(worker)].sort((a,b)=>new Date(b.end)-new Date(a.end)).slice(0,6);
    $("#shiftsList").innerHTML=records.length?records.map(item=>`<li><span>${fmtDate(item.end)} · ${fmtTime(item.start)}–${fmtTime(item.end)}</span><strong>${hoursText(duration(item.start,item.end))}</strong></li>`).join(""):`<li class="empty-row">${tr("generic.noShifts")}</li>`;
  }
  function renderPay(worker) {
    const result=pay(worker);
    setText($("#payBaseHours"),hoursText(result.regular));
    setText($("#payOtHours"),hoursText(result.overtime));
    setText($("#payBaseRate"),`${money(POLICY.hourlyRate)}/hr · 1.5× OT`);
    setText($("#payBaseWages"),money(result.base));
    setText($("#payOtRate"),`${money(POLICY.hourlyRate*POLICY.overtimeMultiplier)}/hr`);
    setText($("#payOvertimePay"),money(result.overtimePay));
    setText($("#payAllowances"),money(result.allowance));
    setText($("#payGross"),money(result.gross));
    setText($("#payDeductions"),`−${money(result.deductions)}`);
    setText($("#payNet"),money(result.net));
  }
  function renderFatigue(worker) {
    const alerts=fatigue(worker);
    $("#fatigueAlerts").innerHTML=alerts.length?alerts.map(alert=>`<article class="alert ${alert.high?"danger":"warning"}"><span aria-hidden="true">${alert.high?"!":"◷"}</span><div><strong>${tr(alert.key)}</strong><p>${escapeHtml(alert.reason)}</p><small>${tr("generic.actions")}: ${tr(alert.action)}</small></div></article>`).join(""):`<div class="alert success"><span aria-hidden="true">✓</span><div>${tr("generic.noAlerts")}</div></div>`;
  }
  function renderSkills(worker) {
    $("#skillsList").innerHTML=worker.skills.length?worker.skills.map((skill,index)=>`<span class="skill-chip"><span><strong>${escapeHtml(skill.name)}</strong><small>${escapeHtml(skill.detail||"")}</small></span><span class="level">${tr(`skillPassport.${skill.level}`)||escapeHtml(skill.level)}</span><button type="button" class="skill-remove" data-action="remove-skill" data-index="${index}" aria-label="Remove ${escapeHtml(skill.name)}">×</button></span>`).join(""):`<p class="empty-row">${tr("generic.noSkills")}</p>`;
  }
  function renderWorkerReports(worker) {
    const reports=currentSector().reports.filter(report=>report.submittedBy===worker.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    $("#reportsList").innerHTML=reports.length?reports.map(report=>`<li class="worker-report"><div class="report-header"><span class="report-type">${escapeHtml(report.category)} · ${escapeHtml(report.severity)}</span><span class="report-status status-${escapeHtml(report.status.toLowerCase())}">${fmtStatus(report.status)}</span></div><div class="report-location">${escapeHtml(report.site)} · ${fmtDate(report.createdAt)}</div><p class="report-desc">${escapeHtml(report.description)}</p><div class="report-meta">ID ${escapeHtml(report.id)}${report.resolution?` · ${escapeHtml(report.resolution)}`:""}</div></li>`).join(""):`<li class="empty-row">${tr("generic.noReports")}</li>`;
  }
  function renderWorker(worker) {
    renderProfile(worker);
    renderAttendance(worker);
    renderPay(worker);
    renderFatigue(worker);
    renderSkills(worker);
    renderWorkerReports(worker);
  }
  function author(report) {
    if(report.anonymous) return tr("generic.anonymous");
    return workerById(report.workerId)?.name||tr("generic.reportedBy");
  }
  function reportItem(report) {
    const statusClass=report.status.toLowerCase();
    const actions=report.status==="Resolved"?"":`<div class="incident-actions">${report.status==="Open"?`<button class="btn btn-secondary btn-small" type="button" data-action="report-status" data-status="Acknowledged" data-report="${escapeHtml(report.id)}">${tr("pulse.acknowledge")}</button>`:""}${report.status!=="Investigating"?`<button class="btn btn-secondary btn-small" type="button" data-action="report-status" data-status="Investigating" data-report="${escapeHtml(report.id)}">${tr("pulse.investigate")}</button>`:""}<button class="btn btn-primary btn-small" type="button" data-action="resolve-report" data-report="${escapeHtml(report.id)}">${tr("pulse.resolve")}</button></div>`;
    return `<li class="incident-item ${statusClass}"><div class="incident-header"><div><span class="incident-worker">${escapeHtml(report.category)} · ${escapeHtml(report.severity)}</span><span class="incident-type">${escapeHtml(report.site)}</span></div><span class="report-status status-${statusClass}">${fmtStatus(report.status)}</span></div><p class="incident-desc">${escapeHtml(report.description)}</p><div class="incident-meta"><span>${escapeHtml(author(report))}</span><span>${fmtDate(report.createdAt)} · ${fmtTime(report.createdAt)}</span><span>ID ${escapeHtml(report.id)}</span></div>${report.resolution?`<p class="report-meta"><strong>${tr("status.resolved")}:</strong> ${escapeHtml(report.resolution)}</p>`:""}${actions}</li>`;
  }
  function recommendations() {
    const alerts=allAlerts(), openReports=currentSector().reports.filter(report=>report.status!=="Resolved");
    const cards=[];
    if(alerts.some(alert=>alert.key==="generic.ruleShift"||alert.key==="generic.ruleWeek")) cards.push(["generic.ruleShift","pulse.recommendOvertime","pulse.recommendOvertimeText","risk"]);
    if(alerts.some(alert=>alert.key==="generic.ruleRest")) cards.push(["generic.ruleRest","pulse.recommendRest","pulse.recommendRestText","warning"]);
    if(openReports.length) cards.push(["safeVoice.title","pulse.recommendHazards","pulse.recommendHazardsText","warning"]);
    if(!cards.length) return `<li class="empty-row">${tr("pulse.noOpenReports")}</li>`;
    return cards.map(([rule,title,description,kind])=>`<li class="pulse-recommendation ${kind}"><span class="recommend-dot" aria-hidden="true"></span><span><strong>${tr(title)}</strong><small>${tr(description)}</small></span></li>`).join("");
  }
  function renderEmployer() {
    const sector=currentSector(), workers=sector.workers, reports=sector.reports;
    const alerts=allAlerts();
    setText($("#scenarioSummary"),`${tr(`scenario.${state.sector}`)} · ${tr("generic.sample")}`);
    $("#metricWorkers").textContent=workers.length;
    $("#metricPresent").textContent=workers.filter(worker=>worker.checkedIn).length;
    $("#metricUnresolved").textContent=reports.filter(report=>report.status!=="Resolved").length;
    $("#metricOvertime").textContent=hoursText(workers.reduce((sum,worker)=>sum+overtimeHours(worker),0));
    $("#metricFatigue").textContent=alerts.length;
    const visibleReports=reports.filter(report=>(reportFilter==="all"||report.status===reportFilter)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    $("#incidentList").innerHTML=visibleReports.length?visibleReports.map(reportItem).join(""):`<li class="empty-row">${tr("generic.noReports")}</li>`;
    $("#workforceBody").innerHTML=workers.filter(worker=>`${worker.name} ${worker.role} ${worker.site} ${worker.shiftPattern}`.toLowerCase().includes(searchText)).map(worker=>{
      const hours=weekHours(worker),ot=overtimeHours(worker),warnings=fatigue(worker);
      const presence=worker.checkedIn?`<span class="table-status on">${tr("shiftCheck.checkIn")}</span>`:`<span class="table-status off">${tr("shiftCheck.offShift")}</span>`;
      const fatigueStatus=warnings.length?`<span class="fatigue-badge ${warnings.some(alert=>alert.high)?"fatigue-danger":"fatigue-warn"}">${warnings.length} ${tr("pulse.fatigueAlerts").toLowerCase()}</span>`:`<span class="fatigue-badge fatigue-ok">✓ ${tr("generic.noAlerts")}</span>`;
      return `<tr><td><strong>${escapeHtml(worker.name)}</strong><small class="table-sub">${escapeHtml(worker.site)}</small></td><td>${escapeHtml(worker.role)}<small class="table-sub">${escapeHtml(worker.shiftPattern)}</small></td><td>${hoursText(hours)}</td><td>${hoursText(ot)} <small>(${hours>0?Math.round(ot/hours*100):0}%)</small></td><td>${fatigueStatus}</td><td>${presence}</td></tr>`;
    }).join("")||`<tr><td colspan="6" class="empty-row">${tr("generic.noReports")}</td></tr>`;
    $("#pulseRecommendations").innerHTML=recommendations();
    $("#workerSearch").value=searchText;
    $("#reportFilter").value=reportFilter;
  }
  function updateViews() {
    document.querySelectorAll(".view").forEach(section=>section.classList.toggle("active",section.id===`view-${selectedView}`));
    document.querySelectorAll(".nav-link").forEach(link=>link.classList.toggle("active",link.dataset.view===selectedView));
    $("#viewToggle").textContent=state.role==="worker"?tr("switchToEmployer"):tr("switchToWorker");
    $("#viewToggle").setAttribute("aria-label",state.role==="worker"?tr("switchToEmployer"):tr("switchToWorker"));
  }
  function render() {
    localizePage();
    updateViews();
    const worker=selectedWorker();
    if(worker) renderWorker(worker);
    renderEmployer();
    if(!storageAvailable&&!document.querySelector(".storage-warning")) {
      const note=document.createElement("p");
      note.className="storage-warning";
      note.textContent=tr("generic.notSaved");
      $("#main").prepend(note);
    }
  }
  function selectView(view) {
    if(!["worker","employer","demo"].includes(view)) return;
    selectedView=view;
    state.role=view==="employer"?"employer":"worker";
    updateViews();
    if(view==="employer") renderEmployer();
    if(view==="worker") renderWorker(selectedWorker());
    if(view==="demo") localizePage();
    persist();
    closeMenu();
    $("#main").focus?.({preventScroll:true});
  }
  function closeMenu() {
    $("#sideNav").classList.remove("open");
    $("#overlay").classList.remove("visible");
    $("#menuToggle").setAttribute("aria-expanded","false");
  }
  function switchSector(value) {
    if(!["construction","college"].includes(value)||value===state.sector) return;
    state.sector=value;
    state.workerId=currentSector().workers[0]?.id||null;
    searchText="";
    reportFilter="all";
    hazardCategoryOptions();
    $("#workerSearch").value="";
    persist();
    render();
  }
  function changeAttendance(checkingIn) {
    const worker=selectedWorker();
    if(!worker) { toast(tr("generic.workerRequired"),"error"); return; }
    if(checkingIn) {
      if(worker.checkedIn) return;
      worker.checkedIn=true;
      worker.checkInAt=nowIso();
      persist();
      render();
      toast(tr("generic.checkedIn")+fmtTime(worker.checkInAt));
      return;
    }
    if(!worker.checkedIn||!Number.isFinite(new Date(worker.checkInAt).getTime())) {
      toast(tr("generic.workerRequired"),"error");
      return;
    }
    const end=nowIso(), elapsed=duration(worker.checkInAt,end);
    if(!elapsed) { toast(tr("generic.formError"),"error"); return; }
    worker.shifts.push({start:worker.checkInAt,end});
    worker.checkedIn=false;
    worker.checkInAt=null;
    persist();
    render();
    toast(tr("generic.checkedOut")+hoursText(elapsed));
  }
  function hazardCategoryOptions() {
    const categories=state.sector==="construction"?["Fall risk","Electrical","Equipment","PPE","Welfare","Other"]:["Ergonomics","Chemical","Electrical","Equipment","Welfare","Other"];
    $("#hazardType").innerHTML=categories.map(item=>`<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("");
  }
  function submitHazard(event) {
    event.preventDefault();
    const worker=selectedWorker(), site=$("#hazardLocation").value.trim(), description=$("#hazardDescription").value.trim();
    const category=$("#hazardType").value,severity=$("#hazardSeverity").value;
    if(!worker||!category||!["Low","Medium","High","Critical"].includes(severity)||site.length<3||site.length>100||description.length<10||description.length>500) {
      $("#hazardForm").reportValidity();
      toast(tr("generic.formError"),"error");
      return;
    }
    const nextNumber=currentSector().reports.reduce((highest,report)=>Math.max(highest,Number(String(report.id).replace(/\D/g,""))||0),0)+1;
    const id=`FS-${nextNumber}`;
    const anonymous=$("#hazardAnonymous").checked;
    currentSector().reports.unshift({id,workerId:anonymous?null:worker.id,submittedBy:worker.id,category,severity,site,description,anonymous,status:"Open",createdAt:nowIso()});
    $("#hazardForm").reset();
    persist();
    render();
    toast(tr("generic.submitted")+id);
  }
  function openResolve(reportId) {
    const report=currentSector().reports.find(item=>item.id===reportId);
    if(!report||report.status==="Resolved") return;
    pendingResolveId=reportId;
    $("#resolutionNotes").value="";
    $("#resolveModal").showModal();
  }
  function updateReport(reportId,nextStatus,resolution="") {
    const report=currentSector().reports.find(item=>item.id===reportId);
    if(!report||!["Acknowledged","Investigating","Resolved"].includes(nextStatus)) return;
    report.status=nextStatus;
    if(nextStatus==="Resolved") report.resolution=resolution;
    report.updatedAt=nowIso();
    pendingResolveId=null;
    persist();
    render();
    toast(tr("generic.reportUpdated"));
  }
  function addSkill(event) {
    event.preventDefault();
    const worker=selectedWorker(),name=$("#skillNameInput").value.trim(),detail=$("#skillDetailInput").value.trim(),level=$("#skillLevelInput").value;
    if(!worker||name.length<2||name.length>60||detail.length>100||!["beginner","intermediate","advanced","expert"].includes(level)) {
      $("#skillNameInput").reportValidity();
      return;
    }
    worker.skills.unshift({name,level,detail:detail||tr("generic.sample"),certified:$("#skillCertifiedInput").checked});
    persist();
    render();
    $("#skillModal").close();
    $("#skillNameInput").value="";
    $("#skillDetailInput").value="";
    $("#skillCertifiedInput").checked=false;
    toast(tr("generic.skillSaved"));
  }
  function exportSkills() {
    const worker=selectedWorker();
    if(!worker) return;
    const blob=new Blob([JSON.stringify({demo:true,worker:worker.name,skills:worker.skills},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=`fairshift-skills-${worker.id}.json`;link.click();URL.revokeObjectURL(url);
    toast(tr("skillPassport.export"));
  }
  function resetDemo() {
    state=makeState();
    selectedView="worker";
    reportFilter="all";
    searchText="";
    persist();
    $("#confirmModal").close();
    render();
    toast(tr("generic.resetSuccess"));
  }

  document.addEventListener("click",event=>{
    const action=event.target.closest("[data-action]");
    const nav=event.target.closest("[data-view]");
    if(nav) { event.preventDefault();selectView(nav.dataset.view);return; }
    if(!action) return;
    switch(action.dataset.action) {
      case "report-status":updateReport(action.dataset.report,action.dataset.status);break;
      case "resolve-report":openResolve(action.dataset.report);break;
      case "remove-skill": {
        const index=Number(action.dataset.index),worker=selectedWorker();
        if(worker&&Number.isInteger(index)&&worker.skills[index]) { worker.skills.splice(index,1);persist();render(); }
        break;
      }
    }
  });
  $("#viewToggle").addEventListener("click",()=>selectView(state.role==="worker"?"employer":"worker"));
  $("#scenarioSelect").addEventListener("change",event=>switchSector(event.target.value));
  $("#workerSelect").addEventListener("change",event=>{
    if(currentSector().workers.some(worker=>worker.id===event.target.value)) { state.workerId=event.target.value;persist();render(); }
  });
  $("#langSelect").addEventListener("change",event=>{
    if(I18N[event.target.value]) { state.language=event.target.value;persist();render(); }
  });
  $("#checkInBtn").addEventListener("click",()=>changeAttendance(true));
  $("#checkOutBtn").addEventListener("click",()=>changeAttendance(false));
  $("#hazardForm").addEventListener("submit",submitHazard);
  $("#skillModal form").addEventListener("submit",addSkill);
  $("#addSkillBtn").addEventListener("click",()=>$("#skillModal").showModal());
  $("#exportSkillsBtn").addEventListener("click",exportSkills);
  $("#resetDemo").addEventListener("click",()=>$("#confirmModal").showModal());
  $("#confirmCancel").addEventListener("click",()=>$("#confirmModal").close());
  $("#confirmOk").addEventListener("click",resetDemo);
  $("#saveResolutionBtn").addEventListener("click",event=>{
    event.preventDefault();
    const notes=$("#resolutionNotes").value.trim();
    if(notes.length<5||notes.length>300) { $("#resolutionNotes").reportValidity();return; }
    $("#resolveModal").close();
    if(pendingResolveId) updateReport(pendingResolveId,"Resolved",notes);
  });
  $("#highContrastToggle").addEventListener("change",event=>{state.highContrast=event.target.checked;persist();render();});
  $("#contrastButton").addEventListener("click",()=>{state.highContrast=!state.highContrast;persist();render();});
  $("#reportFilter").addEventListener("change",event=>{reportFilter=event.target.value;renderEmployer();});
  $("#workerSearch").addEventListener("input",event=>{searchText=event.target.value.trim().toLowerCase();renderEmployer();const input=$("#workerSearch");input.focus();input.setSelectionRange(input.value.length,input.value.length);});
  $("#menuToggle").addEventListener("click",()=>{
    const open=!$("#sideNav").classList.contains("open");
    $("#sideNav").classList.toggle("open",open);$("#overlay").classList.toggle("visible",open);
    $("#menuToggle").setAttribute("aria-expanded",String(open));
  });
  $("#closeNav").addEventListener("click",closeMenu);
  $("#overlay").addEventListener("click",closeMenu);
  $(".app-title").addEventListener("click",event=>event.preventDefault());

  state=loadState();
  if(!state.sectors[state.sector].workers.some(worker=>worker.id===state.workerId)) state.workerId=state.sectors[state.sector].workers[0]?.id||null;
  if(state.role==="employer") selectedView="employer";
  $("#pulseRecommendations").innerHTML="";
  hazardCategoryOptions();
  render();
  setInterval(()=>{
    if(selectedWorker()?.checkedIn) {
      setText($("#shiftTimer"),`${hoursText(duration(selectedWorker().checkInAt))} · ${tr("generic.thisDevice")}`);
      setText($("#todayHours"),hoursText(duration(selectedWorker().checkInAt)));
      renderFatigue(selectedWorker());
      renderPay(selectedWorker());
      renderEmployer();
    }
  },60_000);
})();
