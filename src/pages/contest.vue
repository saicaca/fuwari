<template>
<!-- 一整个页面的布局都是用flex和手动position调的 可以稍加修改 -->
<div id="contest">
        <div id="bigcontainer">
            <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32" style="width: 30%;">
                <div class="card-base z-10 px-9 py-6 relative w-full" style="font-size: 25px;;">
                    <div  style="display: flex;flex-direction: row;justify-content: space-around;width: 100%;height: 30%;">
                        <div>
                            <div>2层巴别塔:<input type="checkbox" v-model="BaBieTa"></div>
                            <div>前3层片瓣<input type="checkbox" v-model="PianBan"></div>
                            <div>鸭/熊/狗: <input type="number" v-model="Ya_Gou_Xiong" class="smallinput"></div>
                            <div>不听指挥: <input type="number" v-model="Not_Seeing" class="smallinput"></div>
                        </div>
                        <div>
                            <div>4星临招: <input type="number" v-model="Four_Free" class="smallinput"></div>
                            <div>5星临招: <input type="number" v-model="Five_Free" class="smallinput"></div>
                            <div>6星临招: <input type="number" v-model="Six_Free" class="smallinput"></div>
                            <div>取钱数 : <input type="number" v-model="money" class="smallinput" style="position: relative;right: -8px;"></div>
                        </div>
                    </div>
                    <div style="height: 70%;width: 100%;display: flex;justify-content: center;align-items: center;flex-direction: column;font-size: 20px;">
                        <div style="height: 25%;position: static" class="selected">
                            <img src="https://tomimi.dev/_app/immutable/assets/icon_enemy_2080_skzlwy.84c12ce8.webp" alt="一结局" style="height: 100%;">
                            <!-- 这里直接偷偷使用特米米的图床 https://tomimi.dev/ -->
                            <form style="position: relative;right: 0;">
                                无<input type="radio" name="一结局" v-model="ending1" value="0">
                                普通<input type="radio" name="一结局"v-model="ending1" value="normal">
                                混乱<input type="radio" name="一结局"v-model="ending1" value="normal+">
                                sp<input type="radio" name="一结局"v-model="ending1" value="sp">
                                sp混乱<input type="radio" name="一结局"v-model="ending1" value="sp+">
                            </form>
                        </div>
                        <div style="height: 25%;" class="selected">
                            <img src="https://tomimi.dev/_app/immutable/assets/icon_enemy_2081_skztxs.76a40b9f.webp" alt="二结局" style="height: 100%;">
                            <form style="position: relative;right: 0;" >
                                无<input type="radio" name="二结局" v-model="ending2" value="0">
                                普通<input type="radio" name="二结局" v-model="ending2" value="normal">
                                混乱<input type="radio" name="二结局" v-model="ending2" value="normal+">
                                sp<input type="radio" name="二结局" v-model="ending2" value="sp">
                                sp混乱<input type="radio" name="二结局" v-model="ending2" value="sp+">
                            </form>
                        </div>
                        <div style="height: 25%;"class="selected">
                            <img src="https://tomimi.dev/_app/immutable/assets/icon_enemy_2082_skzdd.ebbdc858.webp" alt="三结局" style="height: 100%">
                            <!-- 这里直接偷偷使用特米米的图床 https://tomimi.dev/ -->
                            <form style="position: relative;left: -133px;">
                                无<input type="radio" name="三结局" v-model="ending3" value="0">
                                普通<input type="radio" name="三结局" v-model="ending3" value="normal">
                                混乱<input type="radio" name="三结局" v-model="ending3" value="normal+">
                            </form>
                        </div>
                        <div style="height: 25%;" class="selected">
                            <img src="https://tomimi.dev/_app/immutable/assets/icon_enemy_2089_skzjkl.8d71b494.webp" alt="四结局" style="height: 100%;">
                            <!-- 这里直接偷偷使用特米米的图床 https://tomimi.dev/ -->
                            <form style="position: relative;left: -133px;">
                                无<input type="radio" name="四结局" v-model="ending4" value="0">
                                普通<input type="radio" name="四结局"v-model="ending4" value="normal">
                                混乱<input type="radio" name="四结局"v-model="ending4" value="normal+">
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32" style="width: 60%;">
                <div id="ext" class="card-base z-10 px-9 py-6 relative w-full ">
                    <div id="selection">
                        <div style="display: flex;justify-content: center;flex-direction: row;align-items:center;width: 100%;">
                            <div><p class="note">层数:</p></div>
                            <div>
                            <select name="层数" class="note" v-model="floor" >
                                <option value="0">其他</option>
                                <option value="2">第二层</option>
                                <option value="3">第三层</option>
                                <option value="4">第四层</option>
                                <option value="5">第五层</option>
                                <option value="6">第六层</option>
                            </select>
                            </div>
                            <div style="display: flex;flex-direction: column;align-items: end;">
                                <div style="position:relative;right: -6%;display: flex;">
                                    <p style="font-size: 2vh;font-weight: bold;" >阿萨纳羯磨</p>
                                    <input type="checkbox" v-model="AsaNa"style="position: relative;top: 5px;">
                                </div>
                                <div style="position:relative;right: -6%;display: flex;">
                                    <p style="font-size: 2vh;font-weight: bold;" >滚动先祖</p>
                                    <input type="checkbox" v-model="GunDongXianZu" style="position: relative;top: 5px;">
                                </div>
                            </div>
                        </div>
                        <div class="floors">
                            <div v-if="floor==5" style="position:relative;right: -6%;display: flex;justify-content: space-evenly;">
                                <p style="font-size: 3vh;">无漏</p><input type="checkbox" v-model="spe.JianZhi.WuLou" style="position: relative;top: 9px;left: 0px;">
                                <p style="font-size: 3vh;">双碎骨</p><input type="checkbox" v-model="spe.JianZhi.SuiGu"style="position: relative;top: 9px;left: 0px;">
                                <p style="font-size: 3vh;">弑君者</p><input type="checkbox" v-model="spe.JianZhi.ShiJun"style="position: relative;top: 9px;left: 0px;">
                            </div>
                            <div v-if="floor==0" style="position:relative;right: -6%;display: flex;justify-content: space-evenly;">
                                <p style="font-size: 3vh;">紧急</p><input type="checkbox" v-model="spe.Other.JinJi" style="position: relative;top: 9px;left: 0px;">
                            </div>
                            <div class="selected" v-for="item in Allext.filter(item=>item.floor==floor)" :key="item.id" style="position: static;"> 
                                <!-- 用v-for 根据floor 在Allext中判定 渲染每一层的额外加分关 -->
                                <div>
                                    <p>{{item.name}}</p>
                                </div>
                                <div>
                                    <button @click="addext(item)" style="position: sticky;right: 1%;">+</button>
                                </div>       
                            </div>
                        </div>
                    </div>
                    <div id="extlist"class="overflow-y-scroll">
                        <div v-for="item in extlist">
                            <div class="flex" id="extitem">
                                <div class="">{{item.name}}</div>
                                <div style="position: static;">
                                    {{item.point+SpecialPoint}}
                                    <button style="position: relative;top: -15%;" @click="delext(item.id)">-</button>
                                </div>
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
function test() {
    console.log(money.value)
    console.log(Math.min(50*(50-money.value),0))
}
//下面是 QiTa分对应的一些变量 比如取钱数(money)什么的
const AsaNa = ref(false);//有没有阿萨纳
const GunDongXianZu = ref(false);//有没有滚动先祖
const BaBieTa = ref(false);//有没有2层巴别塔
const PianBan = ref(false);//有没有前3层片瓣
const Ya_Gou_Xiong = ref();//鸭子 狗 熊 的击杀数
const Four_Free = ref();//四星临招数
const Five_Free = ref();
const Six_Free = ref();
const money = ref();//取钱数
const Not_Seeing = ref();//不听指挥次数
const SpecialPoint = ref((AsaNa.value? 20:0)+(GunDongXianZu.value? 10:0));//在addext中调用的变量 用来计算关卡加分的通用额外加分
//下面是几个得分类型
const ExtScore = computed(() => {//关卡加分
  return extlist.value.reduce((sum, item) => sum + (item.point+SpecialPoint.value || 0), 0);
});
const basscore = ref();//游戏结算分
const enjscore = ref();//观赏分
//结局
const ending1 = ref("0");
const ending2 = ref("0");
const ending3 = ref("0");
const ending4 = ref("0");
const ResScore = computed(() =>//结局分
    ((ending1.value=="0") ? 0:(ending1.value=="normal"? 0:ending1.value=="normal+"?50:ending1.value=="sp"?200:ending1.value=="sp+"?300:0))+
    ((ending2.value=="0") ? 0:(ending2.value=="normal"? 50:ending2.value=="normal+"?100:ending2.value=="sp"?250:ending2.value=="sp+"?350:0))+
    ((ending3.value=="0") ? 0:(ending3.value=="normal"? 100:ending3.value=="normal+"?200:0))+
    ((ending4.value=="0") ? 0:(ending4.value=="normal"? 400:ending4.value=="normal+"?500:0))+
    ((ending1.value != "0" || ending2.value != "0") && AsaNa.value ? 100 : 0) + 
    ((ending4.value != "0" && GunDongXianZu.value) ? 50 : 0) 
)
const QiTa = computed(() =>//其他加分/扣分 比如取钱量(money)什么的
  ((BaBieTa.value) ? 50 : 0) + 
  ((PianBan.value) ? 50 : 0) + 
  ((typeof (Ya_Gou_Xiong.value) === "number") ? 20 : 0) + 
  ((typeof (Four_Free.value) === "number") ? 10 * Four_Free.value : 0) + 
  ((typeof (Five_Free.value) === "number") ? 20 * Five_Free.value : 0) + 
  ((typeof (Six_Free.value) === "number") ? 50 * Six_Free.value : 0)+
  ((typeof (money.value) === "number") ? Math.min(50*(50-money.value),0) : 0)+
  ((typeof (Not_Seeing.value) === "number") ? -5*Not_Seeing.value : 0)
);

const FinalScore = computed(() =>//总分
  ((typeof(ExtScore.value) === "number") ? ExtScore.value : 0) + 
  ((typeof(basscore.value) === "number") ? basscore.value : 0)  + 
  ((typeof(enjscore.value) === "number") ? enjscore.value : 0) +
  ((typeof(QiTa.value) === "number") ? QiTa.value : 0)+
  ((typeof(ResScore.value) === "number") ? ResScore.value : 0)
);

const extlist = ref(//通过的有加分的关卡的列表
    [],
);
//ALLext是所有关卡 会自动在中间那里渲染 必须要填 name point floor属性 special是用来判断是否要判定如(关卡是紧急 还有额外加分)等的判定 在函数addext中有相关判定
const Allext =[{name:"战场侧面",point:10,floor:0,special:true,Jinji:false},{name:"鸭速公路",point:50,floor:0,special:true,Jinji:false},
{name:"卡兹瀑布",point:30,floor:2},{name:"大棋一盘",point:20,floor:3},{name:"神出鬼没",point:80,floor:4},{name:"混沌",point:50,floor:4},{name:"猩红甬道",point:20,floor:4},{name:"计划耕种",point:40,floor:4},
{name:"建制",point:100,floor:5,special:true,SuiGu:false,ShiJun:false,WuLou:false},{name:"神圣渴求",point:80,floor:6},{name:"谋求共识",point:80,floor:6},{name:"外道",point:100,floor:6},{name:"洞天福地",point:120,floor:6}];

const spe = ref({//用来特判加分的变量 与中间那一框的input type=checkbox 对应
    JianZhi:{WuLou:false,SuiGu:false,ShiJun:false},Other:{JinJi:false},
});

function addext(ite) {//加分函数
    if(ite.special){//有特判的关卡
        let extra=0;
        if(ite.name=="鸭速公路") {
            if(spe.value.Other.JinJi)extra+=20;
        }
        else if(ite.name=="战场侧面") {
            if(spe.value.Other.JinJi)extra+=20;
        }
        else if(ite.name=="建制"){//要写其他特判关卡就类似我这么写就行
            console.log(spe.value);
            if(spe.value.JianZhi.SuiGu)extra+=30;
            if(spe.value.JianZhi.ShiJun)extra+=10;
            if(spe.value.JianZhi.WuLou)extra+=10;
        }
        extlist.value.push({id:Math.random(),name:ite.name,point:Allext.filter(item=>item.name==ite.name)[0].point+extra+(AsaNa.value? 20:0)+(GunDongXianZu.value? 10:0)});
    }//下面是没特判的关卡
    else extlist.value.push({id:Math.random(),name:ite.name,point:Allext.filter(item=>item.name==ite.name)[0].point+(AsaNa.value? 20:0)+(GunDongXianZu.value? 10:0)});
}
function delext(id) {
    extlist.value=extlist.value.filter(item=>item.id!=id);
}
//选择加分处代码
const floor = ref();
</script>

<style>
/* CSS没有规范的排序 自己加油找哪个在哪 */
.smallinput {
    width: 50px;
    height: 45px;
    position: relative;
    font-size: large;
    border-radius: 50%; 
}
input[type="checkbox"] {
    background-color: transparent;
    border: 1px solid #ccc;
    width: 20px;
    height: 20px;
    cursor: pointer;
    position: relative;
    left: 5px;
}
input[type="radio"] {
    background-color: transparent;
    border: 1px solid #ccc;
    width: 20px;
    height: 20px;
    cursor: pointer;
    position: relative;
    left: 0px;
}
.selected {
    display:flex;
    flex-direction: row;
    align-items:center;
    width: 100%;
    justify-content: space-between;
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
    border: solid rgb(72, 110, 114);
    border-radius: 20px;
}
#extlist {
    display: flex;
    flex-direction: column;
    width: 45%;
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
button {
  padding: 10px 20px;               /* 上下 10px，左右 20px 的内边距 */
  font-size: 20px;                  /* 字体大小 */
  font-family: 'Arial', sans-serif; 
  border: 2px solid #609796;    
  border-radius: 4px;               /* 边角圆润化 */
  background-color: transparent;    /* 背景透明 */
  color: #609796;                   /* 字体颜色为蓝色 */
  cursor: pointer;                  /* 鼠标悬停时显示为可点击手形 */
  transition: all 0.3s ease;         /* 平滑过渡效果 */
}

/* 按钮悬浮效果 */
button:hover {
  background-color: #8ccec5;       
  color: white;                   
  border-color: #0056b3;            
}

/* 按钮点击效果 */
button:active {
  background-color: #71979d;        /* 背景变为深蓝色 */
  border-color: #003f7f;            /* 边框颜色变为更深的蓝色 */
  transform: scale(0.98);            /* 按钮点击时稍微缩小 */
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