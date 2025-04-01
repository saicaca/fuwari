---
title: 前端笔记-Vue组件库
description: Vue组件库
image: https://s21.ax1x.com/2025/03/27/pEDxjnP.png 
published: 2025-03-27
tags: [组件库]
category: 学习笔记
draft: false
 
---



## Vue组件库

### keep alive

```vue
<router-view v-slot="{ Component }">
     <keep-alive :include="state.keepaliveNameList">
                       <component :is="Component" :key="state.componentKey" />
     </keep-alive>
</router-view>
```

注意：被包裹的组件或页面需要 name 属性;不是路由的name;

```js
<script>
  export default {
    name: 'Test',
  };
</script>


```

如果是setup语法糖
使用 vite-plugin-vue-setup-extend 插件

`npm i vite-plugin-vue-setup-extend --save`

vite.config.js

```js
import VueSetupExtend from "vite-plugin-vue-setup-extend";

plugins: [
          //  ...
            VueSetupExtend(), 
        ],



```

x.vue

```vue
<script setup name="HotDealOrder">
</script>
```

### searchLine

```vue
<template>
    <div class="bg">
        <div class="box" :class="state.expanded ? 'is-open' : ''" ref="changElement">
            <el-form ref="formRef" :inline="props.FormConfig.inline || false" :model="props.modelValue" :label-width="props.FormConfig.labelWidth || '140'" class="SearchLineformBox">
                <template v-for="item in props.FormConfig.FormList">
                    <p class="title" v-if="item.title && state.expanded">{{ item.title }}</p>
                    <el-form-item :label="item.label" :style="{ width: item.width ? item.width : '' }" v-if="!item.title" :prop="item.value">
                        <template v-if="item.type == 'slot'">
                            <slot :name="item.slot"></slot>
                        </template>
                        <template v-if="item.type == 'input'">
                            <el-input v-model="props.modelValue[item.value]" :placeholder="item.placeholder || ''" :clearable="item.clearable || false" />
                        </template>
                        <template v-if="item.type == 'datePicker'">
                            <datePicker :key="state.key" :clearable="item.clearable || false" v-model:startTime="props.modelValue[item.startTimeValue]" v-model:endTime="props.modelValue[item.endTimeValue]" :disabled-date="item['disabled-date']" />
                        </template>
                        <template v-if="item.type == 'timePicker'">
                            <timePicker :key="state.key" :clearable="item.clearable || false" v-model:startTime="props.modelValue[item.startTimeValue]" v-model:endTime="props.modelValue[item.endTimeValue]" :isRange="item.isRange" :format="item.format" :disabled-date="item['disabled-date']" />
                        </template>

                        <template v-if="item.type == 'select'">
                            <el-select v-model="props.modelValue[item.value]" @change="(v) => (item.onChange ? item.onChange(v) : '')" :collapse-tags="item.multiple" :clearable="item.clearable || false" :filterable="item.filterable || false" :multiple="item.multiple || false" :placeholder="item.placeholder || ''" :size="item.size || ''" :disabled="item.disabled">
                                <el-option v-for="option in item.options" :key="option[item.optionValue]" :label="option[item.optionLabel]" :value="option[item.optionValue]" />
                            </el-select>
                        </template>

                        <template v-if="item.type == 'NumberRange'">
                            <NumberRange v-model:start="props.modelValue[item.startValue]" v-model:end="props.modelValue[item.endValue]" :isInt="true">
                                <template #preUnit>{{ item.preUnit }}</template>
                                <template #nextUnit>{{ item.nextUnit }}</template>
                            </NumberRange>
                        </template> 
                        <template v-if="item.type == 'priceRange'">
                            <PriceRange v-model:start="props.modelValue[item.startValue]" v-model:end="props.modelValue[item.endValue]" />
                        </template>
                        <template v-if="item.type == 'checkbox'">
                            <el-checkbox v-model="props.modelValue[item.value]" :label="item.showLabel"></el-checkbox>
                        </template>
                    </el-form-item>
                </template>
            </el-form>

            <div class="btnBox">
                <el-button type="primary" :disabled="props.searchDisabled" @click="emits('searchClick')">查询</el-button>
                <el-button @click="reset">重置</el-button>
            </div>
        </div>

        <div v-if="state.showExpandButton" style="width: 100%; text-align: center;  background: var(--el-bg-color); padding-bottom: 10px">
            <el-link type="primary" @click="showAndHidden">
                <el-icon style="margin-right: 5px"><CaretTop v-if="state.expanded" /><CaretBottom v-if="!state.expanded" /></el-icon>
                {{ state.expanded ? "收起" : "展开" }}
            </el-link>
        </div>
    </div>
</template>
<script setup>
    import { CaretBottom, CaretTop } from "@element-plus/icons-vue"; 
    import datePicker from "@/components/Form/datePicker.vue";
    import timePicker from "@/components/Form/timePicker.vue"; 
    import NumberRange from "@/components/Form/NumberRange.vue";
    import PriceRange from "@/components/Form/PriceRange.vue"; 
    import { nextTick } from "vue";
    const emits = defineEmits(["searchClick"]);
    const props = defineProps({
        modelValue: {
            type: Object,
            default() {
                return {};
            },
        },
        FormConfig: {
            type: Object,
            default() {
                return {
                    inline: false,
                };
            },
        },
        searchDisabled: {
            type: Boolean,
            default: false,
        },
    });

    const changElement = ref(null);
    const formRef = ref(null);

    const state = reactive({
        expanded: true,
        showExpandButton: false,
        allHeight: 0,
        key: "1",
    });

    const showAndHidden = () => {
        const con = changElement.value;

        if (state.expanded) {
            con.style.height = 40 + "px";
            state.expanded = false;
        } else {
            state.expanded = true;

            con.style.height = state.allHeight;
        }
    };
    const reset = () => {
        formRef.value.resetFields();

        props.FormConfig.FormList.forEach((element) => {
            if (element.type == "timePicker" || element.type == "datePicker") {
                props.modelValue[element.startTimeValue] = "";
                props.modelValue[element.endTimeValue] = "";
                state.key = state.key + 1;
            }
        });
    };
    document.addEventListener("keyup", (e) => {
        if (e.key == "Enter") {
            emits("searchClick");
        }
    });

    onMounted(() => {
        // 计算高度
        const con = changElement.value;
        state.allHeight = con.offsetHeight + "px";
        if (con.offsetHeight > 70) {
            state.showExpandButton = true;
            con.style.height = 40 + "px";
            con.style.overflow = "hidden";

            nextTick(() => {
                state.expanded = false;
            });
        }
    });
</script>
<style lang="scss" scoped>
    .bg {
        // padding: 10px 10px;
        box-sizing: border-box;
    }
    .box {
        display: flex;
        transition: height ease 0.3s;
        overflow-y: hidden;
        background: var(--el-bg-color);
        padding-top: 10px;

        .btnBox {
            margin-left: 10px;
            margin-right: 10px;
        }
    }
    .is-open {
        height: auto;
    }
    .SearchLineformBox {
        box-sizing: border-box;
        flex: 1;
        .title {
            line-height: 20px;
            color: #333333;
            // font-weight: 400;
            font-size: 14px;
            margin-bottom: 10px;
            padding-left: 20px;
            font-weight: bold;
        }
        .el-form-item {
            width: 33%;
            margin: 0 0 10px 0;
        }
    }
</style>

```

datePicker.vue

```vue

<template>
    <el-date-picker v-model="state.timeArry" :clearable="props.clearable || false" type="daterange" range-separator="-" start-placeholder="请选择开始时间" end-placeholder="请选择结束时间" @change="changeTime" />
</template>

<script setup>
    import dayjs from "dayjs";
    const props = defineProps(["startTime", "endTime", "clearable"]);
    const emits = defineEmits(["update:startTime", "update:endTime"]);

    const state = reactive({
        timeArry: [props.startTime, props.endTime],
    });


    watch(
        () => props.startTime,
        (newValue, oldValue) => {
            state.timeArry = [props.startTime, props.endTime];

            changeTime(state.timeArry)

        }
    );

    const changeTime = (v) => {
        if (v&&v[0]) {
            emits("update:startTime", dayjs(v[0]).format("YYYY-MM-DD 00:00:00"));
            emits("update:endTime", dayjs(v[1]).format("YYYY-MM-DD 23:59:59"));
        } else {
            emits("update:startTime", "");
            emits("update:endTime", "");
        }
    };

    changeTime(state.timeArry)

</script>

```

### el-table二次封装

```vue
<template>
    <el-table id="ElTable" :data="props.tableList" style="width: 100%" border :size="props.size" :height="props.height || state.calcHeight || 'auto'" :row-class-name="props.rowClassName">
        <template v-for="colConfig in props.columns">
            <slot v-if="colConfig.slot" :name="colConfig.slot"></slot>
            <el-table-column v-else :show-overflow-tooltip="colConfig['show-overflow-tooltip']" :sortable="colConfig.sort" :align="colConfig.align" v-bind="colConfig">
                <template #header>
                    <YzlTableCell v-if="colConfig.headerRenderer" :renderer="(h) => colConfig.headerRenderer(h)"></YzlTableCell>
                    <span v-else-if="colConfig.headerFormatter" v-html="colConfig.headerFormatter()"></span>
                    <span v-else-if="colConfig.isMoney">{{ colConfig.label.indexOf("元") > -1 ? colConfig.label : colConfig.label + "(元)" }}</span>
                    <span v-else>{{ colConfig.label }}</span>
                </template>
                <template v-slot="scope">
                    <template v-if="colConfig.formatter">
                        <span v-html="colConfig.formatter(scope.row[colConfig.prop], scope.row, colConfig.prop, scope)"></span>
                    </template>

                    <template v-else-if="colConfig.link">
                        <el-link v-if="scope.row[colConfig.prop]" type="primary" @click="linkTo(colConfig.link, scope.row[colConfig.linkBy])">{{ scope.row[colConfig.prop] }}</el-link>
                        <span v-else>-</span>
                    </template>
                    <YzlTableCell v-else-if="colConfig.renderer" :renderer="(h) => colConfig.renderer(h, scope)"></YzlTableCell>
                    <template v-else-if="colConfig.rowSlot">
                        <div>
                            <slot :scope="scope"></slot>
                        </div>
                    </template>
                    <template v-else-if="colConfig.isMoney">
                        <span>￥{{ colConfig.isBranch ? ((scope.row[colConfig.prop] || 0) / 100).toFixed(2) : (scope.row[colConfig.prop] * 1 || 0).toFixed(2) }}</span>
                    </template>

                    <template v-else-if="colConfig.rowspan">
                        <span v-if="!scope.row[colConfig.prop]">-</span>

                        <span v-else-if="scope.row[colConfig.prop] instanceof Array ? scope.row[colConfig.prop].length == 0 : scope.row[colConfig.prop].split(',').length == 0">-</span>
                        <template v-else v-for="(item, index) in scope.row[colConfig.prop] instanceof Array ? scope.row[colConfig.prop] : scope.row[colConfig.prop].split(',')" :key="index">
                            <p>{{ colConfig.rowspanMoney ? colConfig.rowspanMoney : "" }}{{ colConfig.field ? item[colConfig.field] : item }}</p>
                        </template>
                    </template>
                    <template v-else>{{ scope.row[colConfig.prop] === undefined || scope.row[colConfig.prop] === null || scope.row[colConfig.prop] === "" ? "-" : scope.row[colConfig.prop] }} </template>
                </template>
            </el-table-column>
        </template>
    </el-table>
</template>
<script setup>
    import { nextTick, onMounted } from "vue";
    import YzlTableCell from "./YzlTableCell.vue";

    const router = useRouter();

    const props = defineProps({
        tableList: {
            type: Array,
            default() {
                return [];
            },
        },
        columns: {
            type: Array,
            default() {
                return [];
            },
        },
        size: {
            type: String,
            default: "",
        },
        width: {
            type: String,
            default: "",
        },
        height: {
            type: String,
            default: "",
        },
        rowClassName: {
            type: Function,
            default: null,
        },
    });
    const state = reactive({
        calcHeight: "",
        tempObj: {},
    });

    const linkTo = (type, link) => {
        console.log(type, link);
        if (type == "CustomerDetail") {
            router.push({
                name: "CustomerDetail",
                state: {
                    memberCard: link,
                },
            });
        }
    };

    const getHeight = () => {
        nextTick(() => {
            let windowHeight = window.innerHeight;

            let offtop = document.getElementById("ElTable").getBoundingClientRect().top;

            state.calcHeight = windowHeight - offtop - 70;
        });
    };
    getHeight();
</script>


```

YzlTableCell.vue
为了render函数

```vue

<script type="text/jsx" >
    import { defineComponent } from "vue";

    export default defineComponent({
        name: "YzlTableCell",
        props: {
            renderer: { type: Function, required: true },
        },
        render(h) {
            const me = this;
            return me.renderer(h);
        },
    });
</script>

```

### tagViews

> tagViews.vue

```vue
<template>
  <el-scrollbar>
    <VueDraggableNext
      :list="state.routeList"
      animation="300"
      class="tagBG"
      scroll
      :sort="true"
    >
      <el-tag
        size="large"
        class="tag"
        v-for="(item, index) in state.routeList"
        :key="item.path"
        :closable="true"
        :type="item.path == state.activeRoutePath ? 'primary' : 'info'"
        @click="routerGO(item)"
        @close="handleClose(index)"
      >
        {{ item.title }}
      </el-tag>
    </VueDraggableNext>
  </el-scrollbar>
</template>
<script setup>
// VueDraggableNext为了拖拽动画
import { VueDraggableNext } from "vue-draggable-next";

const props = defineProps({
  modelValue: {
    type: Array,
    default() {
      return [];
    },
  },
});
const emits = defineEmits(["update:modelValue"]);

const router = useRouter();
const route = useRoute();

const state = reactive({
  routeList: [],
  activeRoutePath: route.path,
  cathList: [],
});

const init = () => {
  // 本地做的缓存
  if (localStorage.getItem("saveRouteList")) {
    state.routeList = JSON.parse(localStorage.getItem("saveRouteList"));
    state.cathList = state.routeList.map((element) => element.name);
  } else {
    state.routeList.push({
      path: route.path,
      name: route.name,
      title: route.meta.title,
    });

    state.cathList.push(route.name);
  }
  emits("update:modelValue", state.cathList);
};
init();

router.afterEach((to, from) => {
  state.activeRoutePath = to.path;
  // 有些页面不需要缓存
  if (!["/login"].includes(to.path)) {
    state.routeList.push({
      path: to.path,
      name: to.name,
      title: to.meta.title,
    });
    state.routeList = removeDuplicates(state.routeList);
    state.cathList = state.routeList.map((element) => element.name);
    localStorage.setItem("saveRouteList", JSON.stringify(state.routeList));
    emits("update:modelValue", state.cathList);
  }
});

// 使用 Map 来实现去重
function removeDuplicates(routeList) {
  const map = new Map();

  routeList.forEach((route) => {
    if (!map.has(route.path)) {
      map.set(route.path, route);
    }
  });

  return Array.from(map.values());
}

const routerGO = (item) => {
  router.push(item.path);
};
const handleClose = (index) => {
  let item = state.routeList[index];

  if (item.path == state.activeRoutePath) {
    if (state.routeList.length == 1) {
      router.push("/");
    } else {
      router.push(state.routeList.at(index == 0 ? index + 1 : index - 1).path);
    }
  }

  state.routeList.splice(index, 1);
  state.cathList = state.routeList.map((element) => element.name);
  emits("update:modelValue", state.cathList);
};

const getIndex = (name) => {
  return state.routeList.findIndex((item) => item.name == name);
};

defineExpose({ handleClose, getIndex });
</script>
<style scoped lang="scss">
.tagBG {
  display: flex;
  width: 100%;
}
.tag {
  margin-right: 5px;
  position: relative;
  cursor: pointer;
  &:hover {
    color: black;
  }
}
</style>
```

> layout.vue

```vue
<template>
  <el-main>
    <div class="tag-view-bg">
      <el-icon
        @click="state.isCollapse = !state.isCollapse"
        :size="26"
        
        class="cp"
      >
        <Fold v-show="!state.isCollapse" />
        <Expand v-show="state.isCollapse" />
      </el-icon>
      <tagViews ref="tagViewsRef" v-model="state.keepAliveIncludeList" />
    </div>
    <el-divider />

    <div
      v-loading="loadingNumber"
     
    >
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="[...state.keepAliveIncludeList]">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </router-view>
    </div>
  </el-main>
</template>
```

### vite.config

```js
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
import VueSetupExtend from "vite-plugin-vue-setup-extend";
import VueDevTools from "vite-plugin-vue-devtools";
export default ({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    return defineConfig({
        plugins: [
            vue(),
            VueSetupExtend(),
            VueDevTools(),
            AutoImport({
                resolvers: [ElementPlusResolver()],
                imports: ["vue", "vue-router"],
            }),
            Components({
                resolvers: [ElementPlusResolver()],
            }),
        ],
        resolve: {
            alias: [
                {
                    find: "@",
                    replacement: resolve(__dirname, "src"),
                },
            ],
        },

        server: {
            hmr: true,
            proxy: {
                // 登录代理
                "/yunqucti": {
                    target: env.VITE_APP_YZL_CTI_YQ, 
                    rewrite: (path) => path.replace(/^\/yunqucti/, ""),
                    changeOrigin: true,
                    ws: true,
                },
                // 登录代理
                "/oauth": {
                    target: env.VITE_APP_YZL_URL,
                    changeOrigin: true,
                },
                
            },
        },
        build: {
            assetsInlineLimit: 4096,
            sourcemap: false,
        },
    });
};

```
