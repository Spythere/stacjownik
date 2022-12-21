import{d as ue,i as de,S as d,a as V,L as ce,b as fe,c as ie,u as A,e as he,D as pe,_ as R,f as i,g as o,h as f,F as w,r as k,j as le,t as l,k as M,o as a,n as $,w as se,l as D,m as N,p as re,q as me,s as ge,A as Ie,v as ye,x as ve,y as Se,z as F,B as E,C as W,E as _e,T as be,G as $e,H as Ce}from"./index-a65056c2.js";import{r as we}from"./returnBtnMixin-ddf8068c.js";import{s as ke,a as Te}from"./styleMixin-6b80ecca.js";const Le=(e,n,r)=>{var g,y,v,h,t,s,p,m,S,_,c,u,C,T,L,I,b,O,z,P,U,K,B,q,j,G,Y,Z,J,Q,X,x,ee,ne,te,oe;switch(r.index){case 0:return r.dir==1?e.name.localeCompare(n.name):n.name.localeCompare(e.name);case 1:if((((g=e.generalInfo)==null?void 0:g.reqLevel)||0)>(((y=n.generalInfo)==null?void 0:y.reqLevel)||0))return r.dir;if((((v=e.generalInfo)==null?void 0:v.reqLevel)||0)<(((h=n.generalInfo)==null?void 0:h.reqLevel)||0))return-r.dir;break;case 2:if((((t=e.onlineInfo)==null?void 0:t.statusTimestamp)||0)>(((s=n.onlineInfo)==null?void 0:s.statusTimestamp)||0))return r.dir;if((((p=e.onlineInfo)==null?void 0:p.statusTimestamp)||0)<(((m=n.onlineInfo)==null?void 0:m.statusTimestamp)||0))return-r.dir;break;case 3:if((((S=e.onlineInfo)==null?void 0:S.dispatcherName.toLowerCase())||"")>(((_=n.onlineInfo)==null?void 0:_.dispatcherName.toLowerCase())||""))return r.dir;if((((c=e.onlineInfo)==null?void 0:c.dispatcherName.toLowerCase())||"")<(((u=n.onlineInfo)==null?void 0:u.dispatcherName.toLowerCase())||""))return-r.dir;break;case 4:if((((C=e.onlineInfo)==null?void 0:C.dispatcherExp)||0)>(((T=n.onlineInfo)==null?void 0:T.dispatcherExp)||0))return r.dir;if((((L=e.onlineInfo)==null?void 0:L.dispatcherExp)||0)<(((I=n.onlineInfo)==null?void 0:I.dispatcherExp)||0))return-r.dir;break;case 7:if((((b=e.onlineInfo)==null?void 0:b.currentUsers)||0)>(((O=n.onlineInfo)==null?void 0:O.currentUsers)||0))return r.dir;if((((z=e.onlineInfo)==null?void 0:z.currentUsers)||0)<(((P=n.onlineInfo)==null?void 0:P.currentUsers)||0))return-r.dir;if((((U=e.onlineInfo)==null?void 0:U.maxUsers)||0)>(((K=n.onlineInfo)==null?void 0:K.maxUsers)||0))return r.dir;if((((B=e.onlineInfo)==null?void 0:B.maxUsers)||0)<(((q=n.onlineInfo)==null?void 0:q.maxUsers)||0))return-r.dir;break;case 8:if((((j=e.onlineInfo)==null?void 0:j.spawns.length)||0)>(((G=n.onlineInfo)==null?void 0:G.spawns.length)||0))return r.dir;if((((Y=e.onlineInfo)==null?void 0:Y.spawns.length)||0)<(((Z=n.onlineInfo)==null?void 0:Z.spawns.length)||0))return-r.dir;break;case 9:if((((Q=(J=e.onlineInfo)==null?void 0:J.scheduledTrains)==null?void 0:Q.length)||0)>(((x=(X=n.onlineInfo)==null?void 0:X.scheduledTrains)==null?void 0:x.length)||0))return r.dir;if((((ne=(ee=e.onlineInfo)==null?void 0:ee.scheduledTrains)==null?void 0:ne.length)||0)<(((oe=(te=n.onlineInfo)==null?void 0:te.scheduledTrains)==null?void 0:oe.length)||0))return-r.dir}return e.name.localeCompare(n.name)},Fe=(e,n)=>{var g,y,v,h,t,s,p,m,S,_;if((((g=e.generalInfo)==null?void 0:g.availability)=="nonPublic"||!e.generalInfo)&&n.nonPublic||((y=e.onlineInfo)==null?void 0:y.statusID)=="ending"&&n.ending||e.onlineInfo&&e.onlineInfo.statusTimestamp>0&&n.onlineFromHours<8&&e.onlineInfo.statusTimestamp<=Date.now()+n.onlineFromHours*36e5||n.onlineFromHours>0&&e.onlineInfo&&e.onlineInfo.statusTimestamp<=0||n.onlineFromHours==8&&((v=e.onlineInfo)==null?void 0:v.statusID)!="no-limit"||((h=e.onlineInfo)==null?void 0:h.statusID)=="ending"&&n.endingStatus||(((t=e.onlineInfo)==null?void 0:t.statusID)=="not-signed"||((s=e.onlineInfo)==null?void 0:s.statusID)=="unavailable")&&n.unavailableStatus||((p=e.onlineInfo)==null?void 0:p.statusID)=="brb"&&n.afkStatus||((m=e.onlineInfo)==null?void 0:m.statusID)=="no-space"&&n.noSpaceStatus||e.onlineInfo&&n.occupied||!e.onlineInfo&&n.free||((S=e.generalInfo)==null?void 0:S.availability)=="unavailable"&&n.unavailable&&!e.onlineInfo)return!1;if(e.generalInfo){const c=e.generalInfo.routes,u=e.generalInfo.availability;if(n.abandoned&&u=="abandoned"&&!e.onlineInfo||u=="default"&&n.default||u!="default"&&n.notDefault&&!(u=="abandoned"||u=="unavailable")||n.real&&e.generalInfo.lines!=""||n.fictional&&e.generalInfo.lines==""&&u!="abandoned"&&u!="unavailable"||e.generalInfo.reqLevel+(u=="nonPublic"||u=="unavailable"||u=="abandoned"?1:0)<n.minLevel||e.generalInfo.reqLevel+(u=="nonPublic"||u=="unavailable"||u=="abandoned"?1:0)>n.maxLevel||n["no-1track"]&&(c.oneWayCatenaryRouteNames.length!=0||c.oneWayNoCatenaryRouteNames.length!=0)||n["no-2track"]&&(c.twoWayCatenaryRouteNames.length!=0||c.twoWayNoCatenaryRouteNames.length!=0)||c.oneWayCatenaryRouteNames.length<n.minOneWayCatenary||c.oneWayNoCatenaryRouteNames.length<n.minOneWay||c.twoWayCatenaryRouteNames.length<n.minTwoWayCatenary||c.twoWayNoCatenaryRouteNames.length<n.minTwoWay||n[e.generalInfo.controlType]||n[e.generalInfo.signalType]||n.SPK&&(e.generalInfo.controlType==="SPK"||e.generalInfo.controlType.includes("+SPK"))||n.SCS&&(e.generalInfo.controlType==="SCS"||e.generalInfo.controlType.includes("+SCS"))||n.SPE&&(e.generalInfo.controlType==="SPE"||e.generalInfo.controlType.includes("+SPE"))||n.SUP&&e.generalInfo.SUP||n.SCS&&n.SPK&&(e.generalInfo.controlType.includes("SPK")||e.generalInfo.controlType.includes("SCS"))||n.mechaniczne&&e.generalInfo.controlType.includes("mechaniczne")||n.ręczne&&e.generalInfo.controlType.includes("ręczne")||n.SBL&&c.sblRouteNames.length>0||n.authors.length>3&&!((_=e.generalInfo.authors)!=null&&_.map(C=>C.toLocaleLowerCase()).includes(n.authors.toLocaleLowerCase())))return!1}return!0},ae={default:!1,notDefault:!1,real:!1,fictional:!1,SPK:!1,SCS:!1,SPE:!1,SUP:!1,ręczne:!1,mechaniczne:!1,współczesna:!1,kształtowa:!1,historyczna:!1,mieszana:!1,SBL:!1,minLevel:0,maxLevel:20,minOneWayCatenary:0,minOneWay:0,minTwoWayCatenary:0,minTwoWay:0,"include-selected":!1,"no-1track":!1,"no-2track":!1,free:!0,occupied:!1,ending:!1,nonPublic:!1,unavailable:!0,abandoned:!0,afkStatus:!1,endingStatus:!1,noSpaceStatus:!1,unavailableStatus:!1,unsignedStatus:!1,authors:"",onlineFromHours:0},H=ue("stationFiltersStore",{state(){return{inputs:de,filters:{...ae},sorterActive:{index:0,dir:1}}},actions:{getFilteredStationList(e,n){return e.map(r=>(r.onlineInfo&&r.onlineInfo.region!=n&&delete r.onlineInfo,r)).filter(r=>Fe(r,this.filters)).sort((r,g)=>Le(r,g,this.sorterActive))},setupFilters(){d.isRegistered("options_saved")&&(this.inputs.options.forEach(e=>{if(!d.isRegistered(e.id))return;const n=d.getBooleanValue(e.id);this.filters[e.id]=n,e.value=!n}),this.inputs.sliders.forEach(e=>{if(!d.isRegistered(e.name))return;const n=d.getNumericValue(e.name);this.filters[e.name]=n,e.value=n}))},changeFilterValue(e){this.filters[e.name]=e.value,d.isRegistered("options_saved")&&d.setValue(e.name,e.value)},resetFilters(){this.filters={...ae},this.inputs.options.forEach(e=>{e.value=e.defaultValue,d.setBooleanValue(e.name,!e.defaultValue)}),this.inputs.sliders.forEach(e=>{e.value=e.defaultValue,d.setNumericValue(e.name,e.defaultValue)})},changeSorter(e){e>4&&e<7||(e==this.sorterActive.index?this.sorterActive.dir=-1*this.sorterActive.dir:this.sorterActive.dir=1,this.sorterActive.index=e)}}}),Ne=V({props:{stations:{type:Array,required:!0}},components:{Loading:ce},mixins:[ke,fe,Te,we,ie],data:()=>({headIds:["station","min-lvl","status","dispatcher","dispatcher-lvl","routes","general"],headIconsIds:["user","spawn","timetable"],lastSelectedStationName:""}),computed:{sorterActive(){return this.stationFiltersStore.sorterActive}},setup(){const e=A(),n=H();return{isDataLoaded:he(()=>e.dataStatuses.sceneries!=pe.Loading),stationFiltersStore:n}},methods:{setScenery(e){const n=this.stations.find(r=>r.name===e);n&&(this.lastSelectedStationName=n.name,this.$router.push({name:"SceneryView",query:{station:n.name.replaceAll(" ","_")}}))},openForumSite(e,n){n&&(e.preventDefault(),window.open(n,"_blank"))},changeSorter(e){this.stationFiltersStore.changeSorter(e)}}});const Me=e=>(me("data-v-947d9fb2"),e=e(),ge(),e),Ve={class:"station_table"},Re=["src"],He={class:"table_wrapper"},Ee=["onClick"],De={class:"header_wrapper"},We=["innerHTML"],Ae=["src"],Oe=["onClick"],ze={class:"header_wrapper"},Pe=["src","alt","title"],Ue=["src"],Ke=["onClick","onContextmenu","onKeydown"],Be={key:0,style:{color:"salmon"}},qe={class:"station_level"},je={key:0},Ge={key:1},Ye=["src","title"],Ze={key:2},Je=["src","title"],Qe={key:3},Xe=["src","title"],xe={key:1},en={class:"station_status"},nn={key:1,class:"status-badge free"},tn={class:"station_dispatcher-name"},on={class:"station_dispatcher-exp"},sn={class:"station_tracks twoway"},rn=["title"],an=["title"],ln=Me(()=>o("span",{class:"separator"},null,-1)),un=["title"],dn=["title"],cn={key:0,class:"station_info"},fn=["title","innerHTML"],hn=["src","title"],pn=["src","alt","title"],mn=["src","title"],gn={key:1,class:"station_info"},In=["src","title"],yn={class:"highlight"},vn={class:"highlight"},Sn={class:"highlight"},_n={style:{color:"#bbb"}},bn={key:2,class:"no-stations"};function $n(e,n,r,g,y,v){const h=M("Loading");return a(),i("section",Ve,[e.showReturnButton?(a(),i("button",{key:0,class:"return-btn",onClick:n[0]||(n[0]=(...t)=>e.scrollToTop&&e.scrollToTop(...t))},[o("img",{src:e.icons.arrow,alt:"return arrow"},null,8,Re)])):f("",!0),o("div",He,[o("table",null,[o("thead",null,[o("tr",null,[(a(!0),i(w,null,k(e.headIds,(t,s)=>(a(),i("th",{key:t,onClick:()=>e.changeSorter(s)},[o("span",De,[o("div",{innerHTML:e.$t(`sceneries.${t}`)},null,8,We),e.sorterActive.index==s?(a(),i("img",{key:0,class:"sort-icon",src:e.sorterActive.dir==1?e.getIcon("arrow-asc"):e.getIcon("arrow-desc"),alt:"sort icon"},null,8,Ae)):f("",!0)])],8,Ee))),128)),(a(!0),i(w,null,k(e.headIconsIds,(t,s)=>(a(),i("th",{key:t,onClick:()=>e.changeSorter(s+7)},[o("span",ze,[o("img",{src:e.getIcon(t),alt:t,title:e.$t(`sceneries.${t}s`)},null,8,Pe),e.sorterActive.index==s+7?(a(),i("img",{key:0,class:"sort-icon",src:e.sorterActive.dir==1?e.getIcon("arrow-asc"):e.getIcon("arrow-desc"),alt:"sort icon"},null,8,Ue)):f("",!0)])],8,Oe))),128))])]),o("tbody",null,[(a(!0),i(w,null,k(e.stations,(t,s)=>{var p,m,S,_,c,u,C,T,L;return a(),i("tr",{class:$(["station",{"last-selected":e.lastSelectedStationName==t.name}]),key:s+t.name,onClick:se(I=>e.setScenery(t.name),["left"]),onContextmenu:se(I=>{var b;return e.openForumSite(I,(b=t.generalInfo)==null?void 0:b.url)},["right"]),onKeydown:[D(I=>e.setScenery(t.name),["enter"]),D(I=>{var b;return e.openForumSite(I,(b=t.generalInfo)==null?void 0:b.url)},["space"])],tabindex:"0"},[o("td",{class:$(["station_name",(p=t.generalInfo)==null?void 0:p.availability])},[(m=t.generalInfo)!=null&&m.project?(a(),i("b",Be,l(t.generalInfo.project),1)):f("",!0),N(" "+l(t.name),1)],2),o("td",qe,[t.generalInfo?(a(),i("span",je,[t.generalInfo.reqLevel>-1&&t.generalInfo.availability!="nonPublic"&&t.generalInfo.availability!="unavailable"?(a(),i("span",{key:0,style:re(e.calculateExpStyle(t.generalInfo.reqLevel))},l(t.generalInfo.reqLevel>=2?t.generalInfo.reqLevel:"L"),5)):t.generalInfo.availability=="abandoned"?(a(),i("span",Ge,[o("img",{src:e.getIcon("abandoned"),alt:"non-public",title:e.$t("desc.abandoned")},null,8,Ye)])):t.generalInfo.availability=="nonPublic"?(a(),i("span",Ze,[o("img",{src:e.getIcon("lock"),alt:"non-public",title:e.$t("desc.non-public")},null,8,Je)])):(a(),i("span",Qe,[o("img",{src:e.getIcon("unavailable"),alt:"unavailable",title:e.$t("desc.unavailable")},null,8,Xe)]))])):(a(),i("span",xe," ? "))]),o("td",en,[t.onlineInfo?(a(),i("span",{key:0,class:$(["status-badge",t.onlineInfo.statusID])},l(e.$t(`status.${t.onlineInfo.statusID}`))+" "+l(t.onlineInfo.statusID=="online"?e.timestampToString(t.onlineInfo.statusTimestamp):""),3)):(a(),i("span",nn,l(e.$t("status.free")),1))]),o("td",tn,l(t.onlineInfo?t.onlineInfo.dispatcherName:""),1),o("td",on,[t.onlineInfo?(a(),i("span",{key:0,style:re(e.calculateExpStyle(t.onlineInfo.dispatcherExp,t.onlineInfo.dispatcherIsSupporter))},l(2>t.onlineInfo.dispatcherExp?"L":t.onlineInfo.dispatcherExp),5)):f("",!0)]),o("td",sn,[t.generalInfo&&t.generalInfo.routes.twoWayCatenaryRouteNames.length>0?(a(),i("span",{key:0,class:"track catenary",title:`Liczba zelektryfikowanych szlaków dwutorowych: ${t.generalInfo.routes.twoWayCatenaryRouteNames.length}`},l(t.generalInfo.routes.twoWayCatenaryRouteNames.length),9,rn)):f("",!0),t.generalInfo&&t.generalInfo.routes.twoWayNoCatenaryRouteNames.length>0?(a(),i("span",{key:1,class:"track no-catenary",title:`Liczba niezelektryfikowanych szlaków dwutorowych: ${t.generalInfo.routes.twoWayNoCatenaryRouteNames.length}`},l(t.generalInfo.routes.twoWayNoCatenaryRouteNames.length),9,an)):f("",!0),ln,t.generalInfo&&t.generalInfo.routes.oneWayCatenaryRouteNames.length>0?(a(),i("span",{key:2,class:"track catenary",title:`Liczba zelektryfikowanych szlaków jednotorowych: ${t.generalInfo.routes.oneWayCatenaryRouteNames.length}`},l(t.generalInfo.routes.oneWayCatenaryRouteNames.length),9,un)):f("",!0),t.generalInfo&&t.generalInfo.routes.oneWayNoCatenaryRouteNames.length>0?(a(),i("span",{key:3,class:"track no-catenary",title:`Liczba niezelektryfikowanych szlaków jednotorowych: ${t.generalInfo.routes.oneWayNoCatenaryRouteNames.length}`},l(t.generalInfo.routes.oneWayNoCatenaryRouteNames.length),9,dn)):f("",!0)]),t.generalInfo?(a(),i("td",cn,[o("span",{class:$(["scenery-icon icon-info",t.generalInfo.controlType.replace("+","-")]),title:e.$t("desc.control-type")+e.$t(`controls.${t.generalInfo.controlType}`),innerHTML:e.getControlTypeAbbrev(t.generalInfo.controlType)},null,10,fn),o("span",null,[t.generalInfo.SUP?(a(),i("img",{key:0,class:"icon-info",src:e.getIcon("SUP"),alt:"SUP (RASP-UZK)",title:e.$t("desc.SUP")},null,8,hn)):f("",!0)]),o("span",null,[t.generalInfo.signalType?(a(),i("img",{key:0,class:"icon-info",src:e.getIcon(t.generalInfo.signalType),alt:t.generalInfo.signalType,title:e.$t("desc.signals-type")+e.$t(`signals.${t.generalInfo.signalType}`)},null,8,pn)):f("",!0)]),o("span",null,[t.generalInfo&&t.generalInfo.routes.sblRouteNames.length>0?(a(),i("img",{key:0,class:"icon-info",src:e.getIcon("SBL"),alt:"SBL",title:e.$t("desc.SBL")+`${t.generalInfo.routes.sblRouteNames.join(",")}`},null,8,mn)):f("",!0)])])):(a(),i("td",gn,[o("img",{class:"icon-info",src:e.getIcon("unknown"),alt:"icon-unknown",title:e.$t("desc.unknown")},null,8,In)])),o("td",{class:$(["station_users",{inactive:!t.onlineInfo}])},[o("span",null,[o("span",yn,l(((S=t.onlineInfo)==null?void 0:S.currentUsers)||"0"),1),N(" / "),o("span",null,l(((_=t.onlineInfo)==null?void 0:_.maxUsers)||"0"),1)])],2),o("td",{class:$(["station_spawns",{inactive:!t.onlineInfo}])},[o("span",vn,l(((c=t.onlineInfo)==null?void 0:c.spawns.length)||"0"),1)],2),o("td",{class:$(["station_schedules",{inactive:!t.onlineInfo}])},[o("span",null,[o("span",Sn,l(((C=(u=t.onlineInfo)==null?void 0:u.scheduledTrains)==null?void 0:C.length)||"0"),1),N(" / "),o("span",_n,l(((L=(T=t.onlineInfo)==null?void 0:T.scheduledTrains)==null?void 0:L.filter(I=>I.stopInfo.confirmed).length)||"0"),1)])],2)],42,Ke)}),128))])])]),!e.isDataLoaded&&e.stations.length==0?(a(),le(h,{key:1})):e.stations.length==0?(a(),i("div",bn,l(e.$t("sceneries.no-stations")),1)):f("",!0)])}const Cn=R(Ne,[["render",$n],["__scopeId","data-v-947d9fb2"]]),wn=V({props:{option:{type:Object,required:!0}},setup(){return{filterStore:H()}},methods:{handleChange(){this.option.value=!this.option.value,this.filterStore.changeFilterValue({name:this.option.name,value:!this.option.value})}}});const kn=["data-selected"];function Tn(e,n,r,g,y,v){return a(),i("button",{class:$(["btn--action",e.option.section]),"data-selected":e.option.value,onClick:n[0]||(n[0]=(...h)=>e.handleChange&&e.handleChange(...h))},l(e.$t(`filters.${e.option.id}`)),11,kn)}const Ln=R(wn,[["render",Tn],["__scopeId","data-v-8a731f66"]]),Fn=V({components:{ActionButton:Ie,FilterOption:Ln},mixins:[ie,ye,ve],data:()=>({saveOptions:!1,STORAGE_KEY:"options_saved",authorsInputValue:"",minimumHours:0,currentRegion:{id:"",value:""},delayInputTimer:-1,chosenSearchScenery:""}),setup(){const e=Se("isFilterCardVisible"),n=A(),r=H();return{isVisible:e,store:n,filterStore:r}},mounted(){this.saveOptions=d.isRegistered(this.STORAGE_KEY),d.isRegistered("onlineFromHours")&&this.saveOptions&&(this.minimumHours=d.getNumericValue("onlineFromHours"),this.changeNumericFilterValue("onlineFromHours",this.minimumHours)),this.currentRegion=this.store.region},computed:{sortedStationList(){return this.store.stationList.filter(e=>e.name.toLocaleLowerCase().includes(this.chosenSearchScenery.toLocaleLowerCase())).sort((e,n)=>e.name>n.name?1:-1)}},watch:{chosenSearchScenery(e){const n=this.store.stationList.find(({name:r})=>r==e);n&&(this.$router.push(`/scenery?station=${n.name.replace(/ /g,"_")}`),this.chosenSearchScenery="")},isVisible(e){this.$nextTick(()=>{e&&this.$refs.cardEl.focus()})}},methods:{onKeyDownFunction(){this.isVisible=!this.isVisible},handleChange(e){this.filterStore.changeFilterValue({name:e.name,value:!e.value}),this.saveOptions&&d.setBooleanValue(e.name,e.value)},handleInput(e){const n=e.target;this.filterStore.changeFilterValue({name:n.name,value:n.value}),this.saveOptions&&d.setStringValue(n.name,n.value)},handleAuthorsInput(e){clearTimeout(this.delayInputTimer),this.delayInputTimer=window.setTimeout(()=>{this.handleInput(e)},400)},changeNumericFilterValue(e,n,r=!1){this.filterStore.changeFilterValue({name:e,value:n}),this.saveOptions&&r&&d.setNumericValue(e,n)},subHour(){this.minimumHours=this.minimumHours<1?8:this.minimumHours-1,this.changeNumericFilterValue("onlineFromHours",this.minimumHours,!0)},addHour(){this.minimumHours=this.minimumHours>7?0:this.minimumHours+1,this.changeNumericFilterValue("onlineFromHours",this.minimumHours,!0)},saveFilters(){if(this.saveOptions=!this.saveOptions,!this.saveOptions){d.unregisterStorage(this.STORAGE_KEY);return}d.registerStorage(this.STORAGE_KEY),this.filterStore.inputs.options.forEach(e=>d.setBooleanValue(e.name,!e.value)),this.filterStore.inputs.sliders.forEach(e=>d.setNumericValue(e.name,e.value))},resetFilters(){this.authorsInputValue="",this.minimumHours=0,this.changeNumericFilterValue("onlineFromHours",this.minimumHours,!0),this.filterStore.resetFilters()},closeCard(){this.isVisible=!1},toggleCard(){this.isVisible=!this.isVisible}}});const Nn={class:"card_controls"},Mn=["src"],Vn={for:"scenery-search"},Rn=["placeholder"],Hn={id:"sceneries"},En=["value"],Dn={key:0,class:"card",tabindex:"0",ref:"cardEl"},Wn={class:"card_content"},An={class:"card_title flex"},On={class:"card_options"},zn={class:"card_timestamp",style:{"text-align":"center"}},Pn={class:"clock"},Un={class:"card_authors-search"},Kn=["placeholder"],Bn={class:"card_sliders"},qn=["name","id","min","max","onUpdate:modelValue"],jn={class:"slider-value"},Gn={class:"slider-content"},Yn={class:"card_actions"},Zn={class:"action-buttons"},Jn=["data-selected"];function Qn(e,n,r,g,y,v){const h=M("filter-option"),t=$e("click-outside");return F((a(),i("section",{class:"filter-card",onKeydown:n[14]||(n[14]=D((...s)=>e.closeCard&&e.closeCard(...s),["esc"]))},[o("div",Nn,[o("button",{class:"btn--filled btn--image",onClick:n[0]||(n[0]=(...s)=>e.toggleCard&&e.toggleCard(...s))},[o("img",{class:"button_icon",src:e.getIcon("filter2"),alt:"filter icon"},null,8,Mn),N(" "+l(e.$t("options.filters"))+" [F] ",1)]),o("label",Vn,[F(o("input",{id:"scenery-search",list:"sceneries",placeholder:e.$t("sceneries.scenery-search"),onFocus:n[1]||(n[1]=s=>e.preventKeyDown=!0),onBlur:n[2]||(n[2]=s=>e.preventKeyDown=!1),"onUpdate:modelValue":n[3]||(n[3]=s=>e.chosenSearchScenery=s)},null,40,Rn),[[E,e.chosenSearchScenery]]),o("datalist",Hn,[(a(!0),i(w,null,k(e.sortedStationList,s=>(a(),i("option",{value:s.name},null,8,En))),256))])])]),W(be,{name:"card-anim"},{default:_e(()=>[e.isVisible?(a(),i("div",Dn,[o("div",Wn,[o("div",An,l(e.$t("filters.title")),1),o("section",On,[(a(!0),i(w,null,k(e.filterStore.inputs.options,(s,p)=>(a(),le(h,{option:s,key:p,onOptionChange:e.handleChange},null,8,["option","onOptionChange"]))),128))]),o("section",zn,[o("div",null,l(e.$t("filters.minimum-hours-title")),1),o("span",Pn,[o("button",{class:"btn--action",onClick:n[4]||(n[4]=(...s)=>e.subHour&&e.subHour(...s))},"-"),o("span",null,l(e.minimumHours==0?e.$t("filters.now"):e.minimumHours<8?e.minimumHours+e.$t("filters.hour"):e.$t("filters.no-limit")),1),o("button",{class:"btn--action",onClick:n[5]||(n[5]=(...s)=>e.addHour&&e.addHour(...s))},"+")])]),o("section",Un,[F(o("input",{type:"text",placeholder:e.$t("filters.authors-search"),name:"authors","onUpdate:modelValue":n[6]||(n[6]=s=>e.authorsInputValue=s),onInput:n[7]||(n[7]=(...s)=>e.handleAuthorsInput&&e.handleAuthorsInput(...s)),onFocus:n[8]||(n[8]=s=>e.preventKeyDown=!0),onBlur:n[9]||(n[9]=s=>e.preventKeyDown=!1)},null,40,Kn),[[E,e.authorsInputValue]])]),o("section",Bn,[(a(!0),i(w,null,k(e.filterStore.inputs.sliders,(s,p)=>(a(),i("div",{class:"slider",key:p},[F(o("input",{class:"slider-input",type:"range",name:s.name,id:s.id,min:s.minRange,max:s.maxRange,"onUpdate:modelValue":m=>s.value=m,onChange:n[10]||(n[10]=(...m)=>e.handleInput&&e.handleInput(...m))},null,40,qn),[[E,s.value]]),o("span",jn,l(s.value),1),o("div",Gn,l(e.$t(`filters.sliders.${s.id}`)),1)]))),128))]),o("section",Yn,[o("div",Zn,[o("button",{class:"btn--action",style:{width:"100%"},onClick:n[11]||(n[11]=(...s)=>e.saveFilters&&e.saveFilters(...s)),"data-selected":e.saveOptions},l(e.$t("filters.save")),9,Jn),o("button",{class:"btn--action",onClick:n[12]||(n[12]=(...s)=>e.resetFilters&&e.resetFilters(...s))},l(e.$t("filters.reset")),1),o("button",{class:"btn--action",onClick:n[13]||(n[13]=(...s)=>e.closeCard&&e.closeCard(...s))},l(e.$t("filters.close")),1)])])])],512)):f("",!0)]),_:1})],32)),[[t,e.closeCard]])}const Xn=R(Fn,[["render",Qn],["__scopeId","data-v-be819deb"]]),xn=V({components:{StationTable:Cn,StationFilterCard:Xn,SelectBox:Ce},data:()=>({filterCardOpen:!1,modalHidden:!0,STORAGE_KEY:"options_saved",focusedStationName:""}),setup(){return{filterStore:H(),store:A()}},computed:{computedStationList(){return this.filterStore.getFilteredStationList(this.store.stationList,this.store.region.id)}},mounted(){this.filterStore.setupFilters()}});const et={class:"stations-view"},nt={class:"wrapper"},tt={class:"body"},ot={class:"options-bar"};function st(e,n,r,g,y,v){const h=M("StationFilterCard"),t=M("StationTable");return a(),i("section",et,[o("div",nt,[o("div",tt,[o("div",ot,[W(h,{showCard:e.filterCardOpen,exit:e.filterCardOpen=!1,ref:"filterCardRef"},null,8,["showCard","exit"])]),W(t,{stations:e.computedStationList},null,8,["stations"])])])])}const lt=R(xn,[["render",st],["__scopeId","data-v-de343171"]]);export{lt as default};