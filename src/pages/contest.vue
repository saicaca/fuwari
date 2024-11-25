<template>
<div id="contest">
        <div id="bigcontainer">
            <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32" style="width: 30%;">
                <div class="card-base z-10 px-9 py-6 relative w-full ">

                </div>
            </div>
            <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32" style="width: 60%;">
                <div id="ext" class="card-base z-10 px-9 py-6 relative w-full ">
                    <div id="selection">
                        <div style="display: flex;justify-content: center;flex-direction: row;align-items:center;width: 100%;">
                            <div><p class="note">层数:</p></div>
                            <div>
                                <select name="层数" class="note" v-model="floor" >
                                <option value="2">第二层</option>
                                <option value="3">第三层</option>
                                <option value="4">第四层</option>
                                <option value="5">第五层</option>
                                <option value="6">第六层</option>
                            </select>
                            </div>
                            <div style="display: flex;flex-direction: column;align-items: end;">
                                <div style="position:relative;right: -6%;display: flex;">
                                    <p style="font-size: 2vh;" >阿萨纳羯磨</p>
                                    <input type="checkbox" v-model="AsaNa">
                                </div>
                                <div style="position:relative;right: -6%;display: flex;">
                                    <p style="font-size: 2vh;" >滚动先祖</p>
                                    <input type="checkbox" v-model="GunDongXianZu">
                                </div>
                            </div>
                        </div>
                        <div class="floors">
                            <div v-if="floor==5" style="position:relative;right: -6%;display: flex;justify-content: space-evenly;width: 80%;">
                                <p style="font-size: 2vh;">无漏</p><input type="checkbox">
                                <p style="font-size: 2vh;">双碎骨</p><input type="checkbox">
                                <p style="font-size: 2vh;">弑君者</p><input type="checkbox">
                            </div>
                            <div class="selected" v-for="item in Allext.filter(item=>item.floor==floor)" :key="item.id">
                                <p>{{item.name}}</p>
                                <div class="buttons">
                                    <button @click="addext(item.name,extra)">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="extlist"class="overflow-y-scroll">
                        <div v-for="item in extlist">
                            <div class="flex" id="extitem">
                                <div class="">{{item.name}}</div>
                                <div class="stastic">{{item.point+SpecialPoint}}</div>
                                <button style="width: 4%;" @click="delext(item.id)">-</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="bottom">
            <div id="img" style="width: 300px; ">
                <img src="/src/assets/images/头像喵.jpg" alt="加载不出来喵" style="height: 200px;">
            </div>
            <div class="block flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32">
                <div class="content card-base z-10 px-9 py-6 relative w-full ">
                    <h1>结算分:</h1>
                    <input type="number" v-model="basscore" id="input-box1"class="h-1/2 centered-input">
                </div>
            </div>
            <div class="block flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32">
                <div class="content card-base z-10 px-9 py-6 relative w-full ">
                    <h1>观赏分:</h1>
                    <input type="number"  v-model="enjscore" id="input-box2"class="h-1/2 centered-input">
                </div>
            </div>
            <div class="block flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32">
                <div class="content card-base z-10 px-9 py-6 relative w-full ">
                    <h1 class="absolute" style="left: 10%;">总分:</h1>
                    <h1 class="absolute right-1/3"v-show="FinalScore!=0" >{{FinalScore}}</h1>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed } from 'vue';
const AsaNa = ref(false);
const GunDongXianZu = ref(false);
const SpecialPoint = ref((AsaNa.value? 20:0)+(GunDongXianZu.value? 10:0));
const ExtScore = computed(() => {
  return extlist.value.reduce((sum, item) => sum + (item.point+SpecialPoint.value || 0), 0);
});
const basscore = ref();
const enjscore = ref();
const FinalScore = computed(() =>
((typeof(ExtScore.value)=="number")? ExtScore.value : 0) + 
((typeof(basscore.value)=="number")? basscore.value : 0)  + 
((typeof(enjscore.value)=="number")? enjscore.value : 0));

const extlist = ref(
    [],
);

const Allext =[{name:"卡兹瀑布",point:30,floor:2},{name:"大棋一盘",point:20,floor:3},{name:"神出鬼没",point:80,floor:4},{name:"混沌",point:50,floor:4},{name:"猩红甬道",point:20,floor:4},{name:"计划耕种",point:40,floor:4},
{name:"建制",point:100,floor:5,special:true,SuiGu:false,ShiJun:false,WuLou:false},{name:"神圣渴求",point:80,floor:6},{name:"谋求共识",point:80,floor:6},{name:"外道",point:100,floor:6},{name:"洞天福地",point:120,floor:6}];

function addext(name) {
    if(Allext.find(item=>item.name).special){
        let item=Allext.find(item=>item.name==name);
        let extra=0;
        if(name=="建制"){
            if(item.SuiGu)extra+=30;
            if(item.ShiJun)extra+=10;
            if(item.WuLou)extra+=10;
        }
        extlist.value.push({id:Math.random(),name:name,point:Allext.filter(item=>item.name==name)[0].point+extra+(AsaNa.value? 20:0)+(GunDongXianZu.value? 10:0)});
    }
    else extlist.value.push({id:Math.random(),name:name,point:Allext.filter(item=>item.name==name)[0].point+(AsaNa.value? 20:0)+(GunDongXianZu.value? 10:0)});
}
function delext(id) {
    extlist.value=extlist.value.filter(item=>item.id!=id);
}
//选择加分处代码
const floor = ref();
</script>

<style>
.selected {
    display:flex;
    flex-direction: row;
    align-items:center;
}
.floors {
    display:flex;
    flex-direction: column;
    align-items:baseline;
    align-items: start;
    width: 80%;
}
#extitem {
    justify-content:space-between;
}
#ext {
    display: flex;
    justify-content: space-around;
}
#selection {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
    border: solid;
    font-weight: bold;
    font-size:5vh;
    border: solid rgb(84, 128, 133);
    border-radius: 20px;
}
#extlist {
    display: flex;
    flex-direction: column;
    width: 40%;
    border: solid;
    font-weight: bold;
    font-size:5vh;
    border: solid rgb(171, 202, 209);
    border-radius: 30px;
}

.centered-input {
  outline: none; /* 去掉默认聚焦效果 */
  width: 50%;
}

.centered-input:focus {
  border-color: #111214; /* 聚焦时的边框颜色 */
  box-shadow: 0 0 5px rgba(141, 80, 80, 0.5); /* 聚焦时的阴影效果 */
}
h1 {
    font-weight: bold;
    font-size:5vh;
}
input {
    font-weight: bold;
    font-size:5vh;
    border: inset rgb(131, 160, 180);
    border-radius: 30px;
    text-align: center;
    caret-color: transparent;
}
input[type="number"] {
  -moz-appearance: textfield; /* 针对 Firefox */
  -webkit-appearance: none;  /* 针对 WebKit 核心的浏览器，如 Chrome 和 Safari */
  appearance: none; /* 标准属性 */
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none; /* 隐藏微调按钮 */
  margin: 0; /* 避免额外的边距 */
}
#contest {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 90vh;
    justify-content: space-evenly;
}
#bigcontainer {
    width: 100%;
    height: 75%;
    display: flex;
    justify-content:space-evenly;
    font-size: 100px;
}
#bottom {
    display: flex;
    justify-content:space-evenly;
    width: 100%;
    height: 20%;
}
.block {
    width: 23%;
    display: flex;
}
.content {
    display: flex;
    justify-content: center;
    align-items: center;
}
#img {
    display: flex;
    justify-content: center;
}
.note {
    font-size: 4vh;
    font-weight:normal;
}
p {
    font-size: 4vh;
    font-weight:normal;
}
</style>