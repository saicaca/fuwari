---
title: 前端笔记-cesium
description: cesium组件库
image: https://s21.ax1x.com/2025/03/27/pEDxjnP.png 
published: 2025-03-27
tags: [组件库]
category: 学习笔记
draft: false
 
---

## cesium

### 初始化

package.json

```json

"vite-plugin-cesium": "^1.2.23",
"cesium": "^1.120.0"
```

vite.config.js

```js
import cesium from "vite-plugin-cesium";

...
  plugins: [
    ...
    cesium(),
  ],


```

app.vue

```vue
<template>
  <div id="cesiumContainer"></div>
</template>
<script setup>
import * as Cesium from "cesium";

    onMounted(() => {
         Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(90, -20, 110, 90);

    const terrain = Cesium.Terrain.fromWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true,
    });

    viewer = new Cesium.Viewer("cesiumContainer", {
        geocoder: false, //是否显示地名查找工具
        homeButton: false, //是否显示首页位置工具
        sceneModePicker: false, //是否显示视角模式切换工具
        baseLayerPicker: false, //是否显示默认图层选择工具
        navigationHelpButton: false, //是否显示导航帮助工具
        animation: false, //是否显示动画工具
        timeline: false, //是否显示时间轴工具
        fullscreenButton: false, //是否显示全屏按钮工具
        infoBox: false,
        selectionIndicator: false,
        shadows: true,
        shouldAnimate: true,

        terrainProvider: await Cesium.createWorldTerrainAsync(),
    });

    // 去掉logo
    viewer.cesiumWidget.creditContainer.style.display = "none";
    });
    
</script>
```

### 加载 3DTileset

````js
    const tileset = await Cesium.Cesium3DTileset.fromUrl(config.url);

    let model = await viewer.scene.primitives.add(tileset, {
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;

    // 将3d tiles离地高度抬升20米
    let cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);

    let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);

    let offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, -1.0);

    let translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());

    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

    ```
````

### 导出 KML

```js
// 导出KML

var entity = viewer.entities.add({
  name: "My Point",
  position: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
  point: {
    pixelSize: 10,
    color: Cesium.Color.RED,
  },
});

Cesium.exportKml({
  entities: viewer.entities,
}).then(function (res) {
  console.log(res);
  var blob = new Blob([res.kml], {
    type: "application/vnd.google-earth.kml+xml;charset=utf-8",
  });
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url;
  link.download = "export.kml";
  // 触发下载
  link.click();
});
```

### imageryLayer 图层

### 叠加图层

```js
export const initImageryLayer = () => {
    var token = TDT;
    // 服务域名
    var tdtUrl = "https://t{s}.tianditu.gov.cn/";
    var subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];

    // 抗锯齿
    viewer.scene.fxaa = true;
    viewer.scene.postProcessStages.fxaa.enabled = false;
    // 水雾特效
    viewer.scene.globe.showGroundAtmosphere = true;
    // 设置最大俯仰角，[-90,0]区间内，默认为-30，单位弧度
    viewer.scene.screenSpaceCameraController.constrainedPitch = Cesium.Math.toRadians(-20);
    viewer.scene.screenSpaceCameraController.autoResetHeadingPitch = false;
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0.5;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 50;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;
    viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.RIGHT_DRAG, Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];
    viewer.scene.screenSpaceCameraController.tiltEventTypes = [
        Cesium.CameraEventType.MIDDLE_DRAG,
        Cesium.CameraEventType.PINCH,
        {
            eventType: Cesium.CameraEventType.LEFT_DRAG,
            modifier: Cesium.KeyboardEventModifier.CTRL,
        },
        {
            eventType: Cesium.CameraEventType.RIGHT_DRAG,
            modifier: Cesium.KeyboardEventModifier.CTRL,
        },
    ];

    // 取消默认的双击事件
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    // 叠加影像服务
    var imgMap = new Cesium.UrlTemplateImageryProvider({
        url: tdtUrl + "DataServer?T=img_w&x={x}&y={y}&l={z}&tk=" + token,
        subdomains: subdomains,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 18,
    });

    // 叠加国界服务
    var iboMap = new Cesium.UrlTemplateImageryProvider({
        url: tdtUrl + "DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=" + token,
        subdomains: subdomains,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 10,
    });

    //天地图矢量
    let TDT_SL = new Cesium.WebMapTileServiceImageryProvider({
        url: `http://{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${TDT}`,
        layer: "vec",
        style: "default",
        format: "tiles",
        tileMatrixSetID: "w",
        subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        credit: new Cesium.Credit("天地图矢量"),
        maximumLevel: 18,
    });
    const ARCGIS = new Cesium.WebMapTileServiceImageryProvider({
        url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS",
        layer: "World_Imagery",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
        maximumLevel: 19,
        credit: new Cesium.Credit("ARCGIS"),
    });
    // 加载影像注记
    let TDT_ZJ = new Cesium.WebMapTileServiceImageryProvider({
        url: `http://t0.tianditu.gov.cn/cia_w/wmts?tk=${TDT}`,
        layer: "cia",
        style: "default",
        tileMatrixSetID: "w",
        format: "tiles",
        credit: new Cesium.Credit("天地注记"),
        maximumLevel: 18,
    });
    // viewer.imageryLayers.addImageryProvider(imgMap);
    viewer.imageryLayers.addImageryProvider(iboMap);

    viewer.imageryLayers.addImageryProvider(TDT_SL);
    viewer.imageryLayers.addImageryProvider(ARCGIS);
    viewer.imageryLayers.addImageryProvider(TDT_ZJ);
};




```

#### 更改图层

```js
export const changeImageryLayer = (val) => { 
    switch (val) {
        case "TDT_SL":
            viewer.imageryLayers.get(1).show = true;
            viewer.imageryLayers.get(2).show = false;
            viewer.imageryLayers.get(3).show = false;
            break;
        case "ARCGIS":
            viewer.imageryLayers.get(1).show = false;
            viewer.imageryLayers.get(2).show = true;
            viewer.imageryLayers.get(3).show = false;
            break;
        case "TDT_ZJ":
            viewer.imageryLayers.get(1).show = false;
            viewer.imageryLayers.get(2).show = false;
            viewer.imageryLayers.get(3).show = true;
            break;
        default:
            break;
    }
};

```

### 鼠标移动获取经纬度

```js
// 注册鼠标移动事件
viewer.canvas.addEventListener("mousemove", function (e) {
  var cartesian = viewer.scene.camera.pickEllipsoid(e);
  if (cartesian) {
    // 转换为地理坐标系
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    MouseInfo.longitude = Cesium.Math.toDegrees(cartographic.longitude);
    MouseInfo.latitude = Cesium.Math.toDegrees(cartographic.latitude);
    MouseInfo.height = Math.ceil(
      viewer.scene.camera.positionCartographic.height
    ); 
  }
});
```
