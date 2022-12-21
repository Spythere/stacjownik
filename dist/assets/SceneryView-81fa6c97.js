import{a as I,b as M,x as P,c as N,_ as b,f as o,g as t,t as n,p as U,C as g,E as D,h as l,n as w,k as $,o as s,m as c,J as V,u as q,e as C,F as k,r as S,l as K,H as Q,L as B,O as X,P as Y,K as Z,Q as x,w as F,q as ee,s as ne,D as j,U as W,R as z,j as E,A as te,V as se,W as oe}from"./index-a65056c2.js";import{s as G,a as ae}from"./styleMixin-6b80ecca.js";const ie=I({mixins:[G,M,P,N],props:{station:{type:Object,default:{}},onlineFrom:{type:Number,default:-1}}});const re={class:"info-dispatcher"},le={key:0,class:"dispatcher"},ce={class:"dispatcher_likes text--primary"},de=["src"],pe={key:1,class:"status-badge"},ue={key:3,class:"status-badge free"};function he(e,p,u,h,_,m){var d;const i=$("router-link");return s(),o("section",re,[e.station.onlineInfo?(s(),o("div",le,[t("span",{class:"dispatcher_level",style:U(e.calculateExpStyle(e.station.onlineInfo.dispatcherExp,e.station.onlineInfo.dispatcherIsSupporter))},n(e.station.onlineInfo.dispatcherExp>1?e.station.onlineInfo.dispatcherExp:"L"),5),g(i,{class:"dispatcher_name",to:`/journal/dispatchers?dispatcherName=${e.station.onlineInfo.dispatcherName}`},{default:D(()=>[c(n(e.station.onlineInfo.dispatcherName),1)]),_:1},8,["to"]),t("span",ce,[t("img",{src:e.getIcon("like"),alt:"icon-like"},null,8,de),t("span",null,n(((d=e.station.onlineInfo)==null?void 0:d.dispatcherRate)||"0"),1)])])):l("",!0),e.station.onlineInfo&&e.onlineFrom>0?(s(),o("span",pe," OD "+n(new Date(e.onlineFrom).toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})),1)):l("",!0),e.station.onlineInfo?(s(),o("span",{key:2,class:w(["status-badge",e.station.onlineInfo.statusID])},n(e.$t(`status.${e.station.onlineInfo.statusID}`))+" "+n(e.station.onlineInfo.statusID=="online"?e.timestampToString(e.station.onlineInfo.statusTimestamp):""),3)):(s(),o("span",ue,n(e.$t("status.free")),1))])}const _e=b(ie,[["render",he],["__scopeId","data-v-dd62eb36"]]),me=I({mixins:[ae,G,N],props:{station:{type:Object,default:{}}}});const ye={class:"info-icons"},fe=["title","innerHTML"],$e=["src","title"],ge=["src","alt","title"],Ie=["src","title"],be=["src","title"],ve=["src","title"],ke=["src","title"],Se=["src","title"];function Te(e,p,u,h,_,m){var i,d,a,f,y,v;return s(),o("section",ye,[e.station.generalInfo&&e.station.generalInfo.reqLevel>=0?(s(),o("span",{key:0,class:"scenery-icon icon-info level",style:U(e.calculateExpStyle(e.station.generalInfo.reqLevel))},n(e.station.generalInfo.reqLevel>=2?e.station.generalInfo.reqLevel:"L"),5)):l("",!0),e.station.generalInfo?(s(),o("span",{key:1,class:w(["scenery-icon icon-info",e.station.generalInfo.controlType.replace("+","-")]),title:e.$t("desc.control-type")+e.$t(`controls.${e.station.generalInfo.controlType}`),innerHTML:e.getControlTypeAbbrev(e.station.generalInfo.controlType)},null,10,fe)):l("",!0),(i=e.station.generalInfo)!=null&&i.SUP?(s(),o("img",{key:2,class:"icon-info",src:e.getIcon("SUP"),alt:"SUP (RASP-UZK)",title:e.$t("desc.SUP")},null,8,$e)):l("",!0),(d=e.station.generalInfo)!=null&&d.signalType?(s(),o("img",{key:3,class:"icon-info",src:e.getIcon(e.station.generalInfo.signalType),alt:e.station.generalInfo.signalType,title:e.$t("desc.signals-type")+e.$t(`signals.${e.station.generalInfo.signalType}`)},null,8,ge)):l("",!0),((a=e.station.generalInfo)==null?void 0:a.availability)=="nonPublic"?(s(),o("img",{key:4,class:"icon-info",src:e.getIcon("lock"),alt:"Non-public scenery",title:e.$t("desc.non-public")},null,8,Ie)):l("",!0),((f=e.station.generalInfo)==null?void 0:f.availability)=="unavailable"?(s(),o("img",{key:5,class:"icon-info",src:e.getIcon("unavailable"),alt:"Unavailable scenery",title:e.$t("desc.unavailable")},null,8,be)):l("",!0),((y=e.station.generalInfo)==null?void 0:y.availability)=="abandoned"?(s(),o("img",{key:6,class:"icon-info",src:e.getIcon("abandoned"),alt:"Abandoned scenery",title:e.$t("desc.abandoned")},null,8,ve)):l("",!0),(v=e.station.generalInfo)!=null&&v.lines?(s(),o("img",{key:7,class:"icon-info",src:e.getIcon("real"),alt:"real scenery",title:`${e.$t("desc.real")} ${e.station.generalInfo.lines}`},null,8,ke)):l("",!0),e.station.generalInfo?l("",!0):(s(),o("img",{key:8,class:"icon-info",src:e.getIcon("unknown"),alt:"icon-unknown",title:e.$t("desc.unknown")},null,8,Se))])}const Le=b(me,[["render",Te],["__scopeId","data-v-4abf0bfd"]]),we=I({mixins:[N],props:{station:{type:Object,default:{}}}});const Ae={class:"likes"},Ne=["src"],Ce={class:"users"},De=["src"],Oe={class:"spawns"},He=["src"],je={class:"schedules"},Ee=["src"],Me={style:{color:"#eee"}},Pe={style:{color:"#bbb"}};function qe(e,p,u,h,_,m){var i,d,a,f,y,v,T,r;return s(),o("section",{class:w(["info-stats",e.station.onlineInfo?"":"no-stats"])},[t("span",Ae,[t("img",{src:e.getIcon("like"),alt:"icon-like"},null,8,Ne),t("span",null,n(((i=e.station.onlineInfo)==null?void 0:i.dispatcherRate)||"0"),1)]),t("span",Ce,[t("img",{src:e.getIcon("user"),alt:"icon-user"},null,8,De),t("span",null,n(((d=e.station.onlineInfo)==null?void 0:d.currentUsers)||"0"),1),c(" / "),t("span",null,n(((a=e.station.onlineInfo)==null?void 0:a.maxUsers)||"0"),1)]),t("span",Oe,[t("img",{src:e.getIcon("spawn"),alt:"icon-spawn"},null,8,He),t("span",null,n(((f=e.station.onlineInfo)==null?void 0:f.spawns.length)||"0"),1)]),t("span",je,[t("img",{src:e.getIcon("timetable"),alt:"icon-timetable"},null,8,Ee),t("span",null,[t("span",Me,n(((v=(y=e.station.onlineInfo)==null?void 0:y.scheduledTrains)==null?void 0:v.length)||"0"),1),c(" / "),t("span",Pe,n(((r=(T=e.station.onlineInfo)==null?void 0:T.scheduledTrains)==null?void 0:r.filter(L=>L.stopInfo.confirmed).length)||"0"),1)])])],2)}const Be=b(we,[["render",qe],["__scopeId","data-v-58c83895"]]),Re=I({mixins:[P,N,V],props:{station:{type:Object,default:{}}},setup(e){const p=q();return{computedStationTrains:C(()=>{if(!e.station)return[];const h=e.station;return h.onlineInfo?h.onlineInfo.stationTrains?h.onlineInfo.stationTrains.map(_=>{var i,d;const m=(d=(i=h.onlineInfo)==null?void 0:i.scheduledTrains)==null?void 0:d.find(a=>a.trainNo===_.trainNo);return{..._,stopStatus:(m==null?void 0:m.stopStatus)||"no-timetable"}}):[]:[]}),store:p}}});const Fe={class:"info-user-list"},Ue={class:"user-header section-header"},Ve=["src"],Ke={class:"text--primary"},Ye={class:"text--primary"},We=["onClick","onKeydown"],ze={class:"user_train"},Ge={class:"user_name"},Je={key:0,class:"badge user badge-none"};function Qe(e,p,u,h,_,m){var i,d;return s(),o("section",Fe,[t("h3",Ue,[t("img",{src:e.getIcon("user"),alt:"icon-user"},null,8,Ve),c("  "+n(e.$t("scenery.users"))+"   ",1),t("span",Ke,n(((i=e.station.onlineInfo)==null?void 0:i.currentUsers)||"0"),1),c(" / "),t("span",Ye,n(((d=e.station.onlineInfo)==null?void 0:d.maxUsers)||"0"),1)]),(s(!0),o(k,null,S(e.computedStationTrains,(a,f)=>(s(),o("div",{class:w(["badge user",a.stopStatus]),key:a.trainId,tabindex:"0",onClick:y=>e.selectModalTrain(a.trainId),onKeydown:K(y=>e.selectModalTrain(a.trainId),["enter"])},[t("span",ze,n(a.trainNo),1),t("span",Ge,n(a.driverName),1)],42,We))),128)),!e.computedStationTrains||e.computedStationTrains.length==0?(s(),o("div",Je,n(e.$t("scenery.no-users")),1)):l("",!0)])}const Xe=b(Re,[["render",Qe],["__scopeId","data-v-3f29a180"]]),Ze=I({mixins:[N],props:{station:{type:Object,default:{}}}});const xe={class:"info-spawn-list"},en={class:"spawn-header section-header"},nn=["src"],tn={class:"text--primary"},sn={key:0},on={class:"spawn_name"},an={class:"spawn_length"},rn={key:1,class:"badge spawn badge-none"};function ln(e,p,u,h,_,m){var i;return s(),o("section",xe,[t("h3",en,[t("img",{src:e.getIcon("spawn"),alt:"icon-spawn"},null,8,nn),c("  "+n(e.$t("scenery.spawns"))+"   ",1),t("span",tn,n(((i=e.station.onlineInfo)==null?void 0:i.spawns.length)||"0"),1)]),e.station.onlineInfo?(s(),o("span",sn,[(s(!0),o(k,null,S(e.station.onlineInfo.spawns,(d,a)=>{var f;return s(),o("span",{class:"badge spawn",key:d.spawnName+((f=e.station.onlineInfo)==null?void 0:f.dispatcherName)+a},[t("span",on,n(d.spawnName),1),t("span",an,n(d.spawnLength)+"m",1)])}),128))])):l("",!0),!e.station.onlineInfo||e.station.onlineInfo.spawns.length==0?(s(),o("span",rn,n(e.$t("scenery.no-spawns")),1)):l("",!0)])}const cn=b(Ze,[["render",ln],["__scopeId","data-v-1d073143"]]),dn=I({props:{station:{type:Object,default:{}}}});const pn={key:0,class:"info-routes"},un={key:0,class:"routes one-way"},hn={class:"routes-list"},_n={key:0},mn={key:1,class:"routes two-way"},yn={class:"routes-list"},fn={key:0};function $n(e,p,u,h,_,m){return e.station.generalInfo?(s(),o("section",pn,[e.station.generalInfo.routes.oneWay.length>0?(s(),o("div",un,[t("b",null,n(e.$t("scenery.one-way-routes")),1),t("ul",hn,[(s(!0),o(k,null,S(e.station.generalInfo.routes.oneWay,i=>(s(),o("li",{class:w({"no-catenary":!i.catenary,internal:i.isInternal})},[c(n(i.name)+" ",1),i.SBL?(s(),o("b",_n,"SBL")):l("",!0)],2))),256))])])):l("",!0),e.station.generalInfo.routes.twoWay.length>0?(s(),o("div",mn,[t("b",null,n(e.$t("scenery.two-way-routes")),1),t("ul",yn,[(s(!0),o(k,null,S(e.station.generalInfo.routes.twoWay,i=>(s(),o("li",{class:w({"no-catenary":!i.catenary,internal:i.isInternal})},[c(n(i.name)+" ",1),i.SBL?(s(),o("b",fn,"SBL")):l("",!0)],2))),256))])])):l("",!0)])):l("",!0)}const gn=b(dn,[["render",$n],["__scopeId","data-v-40c3c1c2"]]),In=I({components:{SceneryInfoDispatcher:_e,SceneryInfoIcons:Le,SceneryInfoStats:Be,SceneryInfoUserList:Xe,SceneryInfoSpawnList:cn,SceneryInfoRoutes:gn},props:{station:{type:Object,default:{}},timetableOnly:Boolean},data:()=>({onlineFrom:-1})});const bn={class:"scenery-info"},vn={key:0},kn={key:0,class:"info-general"},Sn={class:"general-list"},Tn={key:0},Ln={key:0},wn={key:1},An={style:{color:"salmon"}},Nn={key:0,class:"scenery-authors"},Cn=t("br",null,null,-1),Dn={key:1,class:"scenery-topic"},On=["href"],Hn=t("div",{style:{margin:"2em 0",height:"2px","background-color":"white"}},null,-1),jn={class:"info-lists"};function En(e,p,u,h,_,m){const i=$("scenery-info-icons"),d=$("scenery-info-routes"),a=$("scenery-info-dispatcher"),f=$("scenery-info-user-list"),y=$("scenery-info-spawn-list");return s(),o("div",bn,[e.timetableOnly?l("",!0):(s(),o("section",vn,[e.station.generalInfo?(s(),o("div",kn,[g(i,{station:e.station},null,8,["station"]),t("div",Sn,[t("span",null,[t("b",null,n(e.$t("availability.title"))+":",1),c(" "+n(e.$t(`availability.${e.station.generalInfo.availability}`))+" ",1),e.station.generalInfo.reqLevel>-1?(s(),o("span",Tn," - "+n(e.$t("scenery.req-level",{lvl:e.station.generalInfo.reqLevel},e.station.generalInfo.reqLevel)),1)):l("",!0)]),t("span",null,[c(" • "),t("b",null,n(e.$t("controls.title"))+":",1),c(" "+n(e.$t(`controls.${e.station.generalInfo.controlType}`)),1)]),t("span",null,[c(" • "),t("b",null,n(e.$t("signals.title"))+":",1),c(" "+n(e.$t(`signals.${e.station.generalInfo.signalType}`)),1)]),e.station.generalInfo.lines?(s(),o("span",Ln,[c(" • "),t("b",null,n(e.$t("scenery.lines-title"))+":",1),c(" "+n(e.station.generalInfo.lines),1)])):l("",!0),e.station.generalInfo.project?(s(),o("span",wn,[c(" • "),t("b",null,n(e.$t("scenery.project-title"))+": ",1),t("b",An,n(e.station.generalInfo.project),1)])):l("",!0)]),g(d,{station:e.station},null,8,["station"]),e.station.generalInfo.authors&&e.station.generalInfo.authors.length>0?(s(),o("div",Nn,[t("b",null,n(e.$t("scenery.authors-title",{authors:e.station.generalInfo.authors.length},e.station.generalInfo.authors.length))+": ",1),c(" "+n(e.station.generalInfo.authors.join(", ")),1)])):l("",!0),Cn,e.station.generalInfo.url?(s(),o("div",Dn,[t("a",{href:e.station.generalInfo.url,target:"_blank"}," > "+n(e.$t("scenery.forum-topic",{name:e.station.name}))+" < ",9,On)])):l("",!0)])):l("",!0),Hn,g(a,{station:e.station,onlineFrom:e.onlineFrom},null,8,["station","onlineFrom"]),t("div",jn,[g(f,{station:e.station},null,8,["station"]),g(y,{station:e.station},null,8,["station"])])]))])}const Mn=b(In,[["render",En]]),Pn=I({props:{station:{type:Object,default:{}}}});const qn={class:"info-header"},Bn=["href"],Rn={key:0,class:"scenery-hash"};function Fn(e,p,u,h,_,m){var i,d;return s(),o("section",qn,[t("a",{class:"scenery-name",href:(i=e.station.generalInfo)==null?void 0:i.url},n(e.station.name),9,Bn),(d=e.station.onlineInfo)!=null&&d.hash?(s(),o("div",Rn,"#"+n(e.station.onlineInfo.hash),1)):l("",!0)])}const Un=b(Pn,[["render",Fn],["__scopeId","data-v-cb812d53"]]),Vn=I({props:{scheduledTrain:{type:Object,required:!0}}});const Kn={class:"general-status"},Yn={key:0},Wn={key:0},zn={key:1},Gn={key:1},Jn={key:0},Qn={key:2},Xn={key:0},Zn={key:3},xn={key:0},et={key:1},nt={key:2},tt={key:4},st={key:0},ot={key:5};function at(e,p,u,h,_,m){return s(),o("div",Kn,[t("span",{class:w(e.scheduledTrain.stopStatus)},[e.scheduledTrain.stopStatus=="arriving"?(s(),o("span",Yn,[e.scheduledTrain.prevDepartureLine?(s(),o("span",Wn,"("+n(e.scheduledTrain.prevDepartureLine)+")",1)):l("",!0),c(" "+n(e.scheduledTrain.prevStationName)+" >",1),e.scheduledTrain.nextArrivalLine?(s(),o("span",zn," ("+n(e.scheduledTrain.nextArrivalLine)+") ",1)):l("",!0),c(" "+n(e.scheduledTrain.nextStationName||"---"),1)])):e.scheduledTrain.stopStatus=="departed"?(s(),o("span",Gn,[c(" >> "),e.scheduledTrain.nextArrivalLine?(s(),o("span",Jn," ("+n(e.scheduledTrain.nextArrivalLine)+") ",1)):l("",!0),c(" "+n(e.scheduledTrain.nextStationName),1)])):e.scheduledTrain.stopStatus=="departed-away"?(s(),o("span",Qn,[c(" >>> "),e.scheduledTrain.nextArrivalLine?(s(),o("span",Xn," ("+n(e.scheduledTrain.nextArrivalLine)+") ",1)):l("",!0),c(" "+n(e.scheduledTrain.nextStationName),1)])):e.scheduledTrain.stopStatus=="online"?(s(),o("span",Zn,[c(" > "),e.scheduledTrain.nextArrivalLine?(s(),o("span",xn," ("+n(e.scheduledTrain.nextArrivalLine)+") "+n(e.scheduledTrain.nextStationName),1)):e.scheduledTrain.nextStationName?(s(),o("span",nt,n(e.scheduledTrain.nextStationName),1)):(s(),o("span",et,n(e.$t("timetables.end")),1))])):e.scheduledTrain.stopStatus=="stopped"?(s(),o("span",tt,[c(" > "),e.scheduledTrain.nextArrivalLine?(s(),o("span",st," ("+n(e.scheduledTrain.nextArrivalLine)+") ",1)):l("",!0),c(" "+n(e.scheduledTrain.nextStationName),1)])):e.scheduledTrain.stopStatus=="terminated"?(s(),o("span",ot,"X "+n(e.$t("timetables.terminated")),1)):l("",!0)],2)])}const it=b(Vn,[["render",at],["__scopeId","data-v-8ae274fe"]]),rt=I({name:"SceneryTimetable",components:{SelectBox:Q,Loading:B,TrainModal:X,ScheduledTrainStatus:it},mixins:[M,P,N,V],props:{station:{type:Object,required:!0},timetableOnly:{type:Boolean}},data:()=>({listOpen:!1}),setup(e){var i,d,a,f,y;const p=Y(),u=C(()=>`${location.origin}${p.fullPath}`),h=q(),_=Z(((a=(d=(i=e.station)==null?void 0:i.generalInfo)==null?void 0:d.checkpoints)==null?void 0:a.length)==0?"":((y=(f=e.station)==null?void 0:f.generalInfo)==null?void 0:y.checkpoints[0].checkpointName)||""),m=C(()=>{var r,L,O;if(!e.station)return[];const v=e.station;let T=((L=(r=v.generalInfo)==null?void 0:r.checkpoints.find(A=>A.checkpointName===_.value))==null?void 0:L.scheduledTrains)||((O=v.onlineInfo)==null?void 0:O.scheduledTrains)||[];return T?T.sort((A,H)=>A.stopStatusID>H.stopStatusID?1:A.stopStatusID<H.stopStatusID?-1:A.stopInfo.arrivalTimestamp>H.stopInfo.arrivalTimestamp?1:A.stopInfo.arrivalTimestamp<H.stopInfo.arrivalTimestamp?-1:A.stopInfo.departureTimestamp>H.stopInfo.departureTimestamp?1:-1)||[]:[]});return{currentURL:u,selectedCheckpoint:_,computedScheduledTrains:m,store:h}},methods:{loadSelectedOption(){this.station&&this.station.generalInfo&&this.station.generalInfo.checkpoints&&this.station.generalInfo.checkpoints.length!=0&&this.selectedCheckpoint==""&&(this.selectedCheckpoint=this.station.generalInfo.checkpoints[0].checkpointName)},selectCheckpoint(e){this.selectedCheckpoint=e.checkpointName},showTimetableOnlyView(){this.$router.push(`${this.$route.fullPath}&timetableOnly=1`)}},mounted(){this.loadSelectedOption()},activated(){this.loadSelectedOption()}});const R=e=>(ee("data-v-2babfe2a"),e=e(),ne(),e),lt={class:"scenery-timetable"},ct={class:"timetable-header"},dt=["src"],pt={class:"text--primary"},ut=R(()=>t("span",null," / ",-1)),ht={class:"text--grayed"},_t={key:0,class:"timetable-checkpoints"},mt=["onClick"],yt={class:"timetable-list"},ft={key:0,style:{"padding-bottom":"5em"}},$t={key:1,class:"timetable-item empty"},gt={key:2,class:"timetable-item empty"},It=["onClick","onKeydown"],bt={class:"timetable-general"},vt={class:"general-info"},kt={class:"info-number"},St={key:0,class:"g-tooltip"},Tt=["src"],Lt=["innerHTML"],wt={class:"info-route"},At={class:"timetable-schedule"},Nt={class:"schedule-arrival"},Ct={key:0,class:"arrival-time begins"},Dt={key:1,class:"arrival-time"},Ot={key:0},Ht={key:1},jt={style:{"margin-right":"0.2em"},class:"text--grayed"},Et={class:"schedule-stop"},Mt={class:"stop-time"},Pt={key:0},qt={key:1},Bt=R(()=>t("span",{class:"arrow"},null,-1)),Rt={class:"stop-line"},Ft=R(()=>t("span",null,null,-1)),Ut={class:"schedule-departure"},Vt={key:0,class:"departure-time terminates"},Kt={key:1,class:"departure-time"},Yt={key:0},Wt={key:1},zt={style:{"margin-right":"0.2em"},class:"text--grayed"};function Gt(e,p,u,h,_,m){var a,f,y,v,T;const i=$("Loading"),d=$("ScheduledTrainStatus");return s(),o("section",lt,[t("div",ct,[t("h3",null,[t("img",{src:e.getIcon("timetable"),alt:"icon-timetable"},null,8,dt),c("  "),t("span",null,n(e.$t("scenery.timetables")),1),c("   "),t("span",pt,n(((f=(a=e.station.onlineInfo)==null?void 0:a.scheduledTrains)==null?void 0:f.length)||"0"),1),ut,t("span",ht,n(((v=(y=e.station.onlineInfo)==null?void 0:y.scheduledTrains)==null?void 0:v.filter(r=>r.stopInfo.confirmed).length)||"0"),1)]),e.station&&((T=e.station.generalInfo)!=null&&T.checkpoints)?(s(),o("div",_t,[(s(!0),o(k,null,S(e.station.generalInfo.checkpoints,(r,L)=>(s(),o("span",{key:L},[c(n(L>0&&"•"||"")+" ",1),(s(),o("button",{key:r.checkpointName,class:w(["checkpoint_item",{current:e.selectedCheckpoint===r.checkpointName}]),onClick:O=>e.selectCheckpoint(r)},n(r.checkpointName),11,mt))]))),128))])):l("",!0)]),t("div",yt,[e.store.dataStatuses.trains==0&&e.computedScheduledTrains.length==0?(s(),o("div",ft,[g(i)])):e.computedScheduledTrains.length==0&&!e.station.onlineInfo?(s(),o("span",$t,n(e.$t("scenery.offline")),1)):e.computedScheduledTrains.length==0?(s(),o("span",gt,n(e.$t("scenery.no-timetables")),1)):l("",!0),g(x,{name:"timetables-anim"},{default:D(()=>[(s(!0),o(k,null,S(e.computedScheduledTrains,(r,L)=>(s(),o("div",{class:"timetable-item",key:r.trainId,tabindex:"0",onClick:F(O=>e.selectModalTrain(r.trainId),["prevent","stop"]),onKeydown:K(F(O=>e.selectModalTrain(r.trainId),["prevent"]),["enter"])},[t("span",bt,[t("span",vt,[t("span",kt,[t("strong",null,n(r.category),1),c(" "+n(r.trainNo)+" ",1),r.stopInfo.comments?(s(),o("span",St,[t("img",{src:e.getIcon("warning")},null,8,Tt),t("span",{class:"content",innerHTML:r.stopInfo.comments},null,8,Lt)])):l("",!0)]),c("  |  "),t("span",null,n(r.driverName),1),t("div",wt,[t("strong",null,n(r.beginsAt)+" - "+n(r.terminatesAt),1)]),g(d,{scheduledTrain:r},null,8,["scheduledTrain"])])]),t("span",At,[t("span",Nt,[r.stopInfo.beginsHere?(s(),o("span",Ct,n(e.$t("timetables.begins")),1)):(s(),o("span",Dt,[r.stopInfo.arrivalDelay==0?(s(),o("div",Ot,[t("span",null,n(e.timestampToString(r.stopInfo.arrivalTimestamp)),1)])):(s(),o("div",Ht,[t("div",null,[t("s",jt,n(e.timestampToString(r.stopInfo.arrivalTimestamp)),1)]),t("span",null,n(e.timestampToString(r.stopInfo.arrivalRealTimestamp))+" ("+n(r.stopInfo.arrivalDelay>0?"+":"")+n(r.stopInfo.arrivalDelay)+") ",1)]))]))]),t("span",Et,[t("span",Mt,[r.stopInfo.stopTime?(s(),o("span",Pt,n(r.stopInfo.stopTime)+" "+n(r.stopInfo.stopType||"pt"),1)):(s(),o("span",qt," "))]),Bt,t("span",Rt,[t("span",null,n(r.arrivingLine),1),Ft,t("span",null,n(r.departureLine),1)])]),t("span",Ut,[r.stopInfo.terminatesHere?(s(),o("span",Vt,n(e.$t("timetables.terminates")),1)):(s(),o("span",Kt,[r.stopInfo.departureDelay==0?(s(),o("div",Yt,[t("span",null,n(e.timestampToString(r.stopInfo.departureTimestamp)),1)])):(s(),o("div",Wt,[t("div",null,[t("s",zt,n(e.timestampToString(r.stopInfo.departureTimestamp)),1)]),t("span",null,n(e.timestampToString(r.stopInfo.departureRealTimestamp))+" ("+n(r.stopInfo.departureDelay>0?"+":"")+n(r.stopInfo.departureDelay)+") ",1)]))]))])])],40,It))),128))]),_:1})])])}const Jt=b(rt,[["render",Gt],["__scopeId","data-v-2babfe2a"]]),Qt=I({name:"SceneryTimetablesHistory",mixins:[M],props:{station:{type:Object,required:!0}},data(){return{sceneryHistoryList:[],dataStatus:j.Loading}},mounted(){this.fetchAPIData()},methods:{async fetchAPIData(e=0,p=15){try{const u=`${W.stacjownikAPI}/api/getSceneryTimetables?name=${this.station.name}&countFrom=${e}&countLimit=${p}`,h=await(await z.get(u)).data;this.sceneryHistoryList=h.sceneryTimetables,this.dataStatus=j.Loaded}catch(u){console.error(u)}}},components:{Loading:B}});const Xt={class:"scenery-timetables-history scenery-section"},Zt={key:1,class:"list-warning"},xt={key:2,class:"history-list"},es={class:"list-item"},ns={class:"text--grayed"},ts={class:"text--primary"},ss={key:0},os={key:1};function as(e,p,u,h,_,m){const i=$("Loading"),d=$("router-link");return s(),o("section",Xt,[e.dataStatus!=2?(s(),E(i,{key:0})):e.sceneryHistoryList.length==0?(s(),o("div",Zt,n(e.$t("scenery.history-list-empty")),1)):(s(),o("ul",xt,[(s(!0),o(k,null,S(e.sceneryHistoryList,a=>(s(),o("li",es,[t("div",null,[t("b",null,n(e.localeDay(a.beginDate,e.$i18n.locale)),1),c(" "+n(e.localeTime(a.beginDate,e.$i18n.locale)),1)]),t("div",null,[g(d,{to:`/journal/timetables?timetableId=${a.timetableId}`},{default:D(()=>[t("span",ns," #"+n(a.timetableId),1),t("b",ts," "+n(a.trainCategoryCode)+" "+n(a.trainNo),1),t("div",null,n(a.driverName),1)]),_:2},1032,["to"])]),t("div",null,n(a.route.replace("|"," -> ")),1),t("div",null,[c(n(e.$t("scenery.timetable-author-title"))+": ",1),a.authorName?(s(),o("b",ss,n(a.authorName),1)):(s(),o("i",os,n(e.$t("scenery.timetable-author-unknown")),1))])]))),256))]))])}const is=b(Qt,[["render",as],["__scopeId","data-v-544bc4da"]]),rs=I({name:"SceneryDispatchersHistory",mixins:[M],props:{station:{type:Object,required:!0}},data(){return{dispatcherHistoryList:[],dataStatus:j.Loading}},mounted(){this.fetchAPIData()},methods:{async fetchAPIData(e=0,p=30){try{const u=`${W.stacjownikAPI}/api/getDispatchers?stationName=${this.station.name}&countFrom=${e}&countLimit=${p}`,h=await(await z.get(u)).data;this.dispatcherHistoryList=h,this.dataStatus=j.Loaded}catch(u){console.error(u)}}},components:{Loading:B}});const ls={class:"scenery-dispatchers-history scenery-section"},cs={key:1,class:"list-warning"},ds={key:2,class:"history-list"},ps={class:"list-item"},us={class:"text--grayed"},hs={key:0},_s={key:1,class:"dispatcher-online"};function ms(e,p,u,h,_,m){const i=$("Loading"),d=$("router-link");return s(),o("section",ls,[e.dataStatus!=2?(s(),E(i,{key:0})):e.dispatcherHistoryList.length==0?(s(),o("div",cs,n(e.$t("scenery.history-list-empty")),1)):(s(),o("ul",ds,[(s(!0),o(k,null,S(e.dispatcherHistoryList,a=>(s(),o("li",ps,[t("div",null,[g(d,{to:`/journal/dispatchers?dispatcherName=${a.dispatcherName}`},{default:D(()=>[t("span",us,"#"+n(a.stationHash)+" ",1),t("b",null,n(a.dispatcherName),1)]),_:2},1032,["to"])]),a.timestampTo?(s(),o("div",hs,[t("b",null,n(e.$d(a.timestampFrom)),1),c(" "+n(e.timestampToString(a.timestampFrom))+" - "+n(e.timestampToString(a.timestampTo))+" ("+n(e.calculateDuration(a.currentDuration))+") ",1)])):(s(),o("div",_s,[c(n(e.$t("journal.online-since"))+" ",1),t("b",null,n(e.timestampToString(a.timestampFrom)),1),c(" ("+n(e.calculateDuration(a.currentDuration))+") ",1)]))]))),256))]))])}const ys=b(rs,[["render",ms],["__scopeId","data-v-bf5bb4e7"]]);var J=(e=>(e[e.TIMETABLES_ACTIVE=0]="TIMETABLES_ACTIVE",e[e.TIMETABLES_HISTORY=1]="TIMETABLES_HISTORY",e[e.SCENERY_HISTORY=2]="SCENERY_HISTORY",e))(J||{});const fs=I({components:{SceneryInfo:Mn,SceneryTimetable:Jt,ActionButton:te,SceneryHeader:Un,SceneryTimetablesHistory:is,SceneryDispatchersHistory:ys},mixins:[P,N],data:()=>({viewModes:[{id:"scenery.option-active-timetables",component:"SceneryTimetable"},{id:"scenery.option-timetables-history",component:"SceneryTimetablesHistory"},{id:"scenery.option-dispatchers-history",component:"SceneryDispatchersHistory"}],sceneryViewMode:J,selectedCheckpoint:"",currentViewCompontent:"SceneryTimetable",onlineFrom:-1}),activated(){this.loadSelectedCheckpoint()},setup(){const e=Y(),p=q(),u=C(()=>e.query.timetableOnly=="1"),h=C(()=>e.path==="/scenery"),_=C(()=>p.stationList.find(m=>{var i;return m.name===((i=e.query.station)==null?void 0:i.toString().replace(/_/g," "))}));return{timetableOnly:u,isComponentVisible:h,stationInfo:_,store:p}},methods:{setViewMode(e){this.currentViewCompontent=e},loadSelectedCheckpoint(){var e,p;(p=(e=this.stationInfo)==null?void 0:e.generalInfo)!=null&&p.checkpoints&&this.stationInfo.generalInfo.checkpoints.length!=0&&(this.selectedCheckpoint=this.stationInfo.generalInfo.checkpoints[0].checkpointName)},selectCheckpoint(e){this.selectedCheckpoint=e.checkpointName}}});const $s={class:"scenery-view"},gs={key:0,class:"scenery-offline"},Is=["data-timetable-only"],bs={key:0,class:"scenery-left"},vs={class:"scenery-actions"},ks=["title"],Ss=["src"],Ts={class:"scenery-right"},Ls={class:"info-actions"},ws=["onClick","data-checked"];function As(e,p,u,h,_,m){const i=$("router-link"),d=$("action-button"),a=$("SceneryHeader"),f=$("SceneryInfo");return s(),o("div",$s,[!e.stationInfo&&e.isComponentVisible&&e.store.dataStatuses.sceneries==2?(s(),o("div",gs,[t("div",null,n(e.$t("scenery.no-scenery")),1),g(d,null,{default:D(()=>[g(i,{to:"/"},{default:D(()=>[c(n(e.$t("scenery.return-btn")),1)]),_:1})]),_:1})])):l("",!0),e.stationInfo?(s(),o("div",{key:1,class:"scenery-wrapper",ref:"card-wrapper","data-timetable-only":e.timetableOnly},[e.timetableOnly?l("",!0):(s(),o("div",bs,[t("div",vs,[t("button",{class:"back-btn btn",title:e.$t("scenery.return-btn"),onClick:p[0]||(p[0]=y=>e.navigateTo("/"))},[t("img",{src:e.getIcon("back"),alt:"Back to scenery"},null,8,Ss)],8,ks)]),g(a,{station:e.stationInfo},null,8,["station"]),g(f,{station:e.stationInfo},null,8,["station"])])),t("div",Ts,[t("div",Ls,[(s(!0),o(k,null,S(e.viewModes,y=>(s(),o("button",{class:"btn btn--option",onClick:v=>e.setViewMode(y.component),"data-checked":e.currentViewCompontent==y.component},n(e.$t(y.id)),9,ws))),256))]),(s(),E(oe,null,[(s(),E(se(e.currentViewCompontent),{station:e.stationInfo,timetableOnly:e.timetableOnly,key:e.currentViewCompontent},null,8,["station","timetableOnly"]))],1024))])],8,Is)):l("",!0)])}const Ds=b(fs,[["render",As],["__scopeId","data-v-818c917d"]]);export{Ds as default};