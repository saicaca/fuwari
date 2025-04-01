---
title: 前端笔记-组件库
description: JS组件库
image: https://s21.ax1x.com/2025/03/27/pEDxjnP.png 
published: 2025-03-27
tags: [组件库]
category: 学习笔记
draft: false
 
---

## js组件库

### 解决 js 下载 txt/图片直接打开

```js
downloadFile(url) {

     const link = document.createElement("a");
     fetch(url)
       .then((res) => res.blob())
       .then((blob) => {
         link.href = URL.createObjectURL(blob);
         link.download = file_name;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
       });
   }
```

### iframe 获取摄像头设备失败

iframe 引入一个 webRTC 获取摄像头设备的时候，getUserMedia 获取设备失败，需要在 iframe 标签中加入 allow;

```html
<iframe
  src="src" frameborder="0"  allow="microphone;camera;midi;encrypted-media;" ></iframe>
```

### indexDB

```js
const dealOrderStoreList = ["HealthRecords", "ApplyUp"];

const optionsStoreList = ["CustomerManage", "dealOrder"];

const colConfigList = ["CustomerManage"];

const ASRList = ["chatData"];

/* 打开数据库
 */
export function openDB(dbName, storeName, version = 1) {
    return new Promise((resolve, reject) => {
        let indexedDB = window.indexedDB;
        let db;
        const request = indexedDB.open(dbName, version);
        request.onsuccess = function (event) {
            db = event.target.result; // 数据库对象
            resolve(db);
        };

        request.onerror = function (event) {
            reject(event);
        };

        request.onupgradeneeded = function (event) {
            // 数据库创建或升级的时候会触发
            console.log("onupgradeneeded");
            db = event.target.result; // 数据库对象
            if (dbName == "dealOrder") {
                for (let index = 0; index < dealOrderStoreList.length; index++) {
                    db.createObjectStore(dealOrderStoreList[index], { keyPath: "id" }); // 创建表
                }
            } else if (dbName == "Options") {
                for (let index = 0; index < optionsStoreList.length; index++) {
                    db.createObjectStore(optionsStoreList[index], { keyPath: "id" }); // 创建表
                }
            } else if (dbName == "ColConfig") {
                for (let index = 0; index < colConfigList.length; index++) {
                    db.createObjectStore(colConfigList[index], { keyPath: "id" }); // 创建表
                }
            } else if (dbName == "ASR") {
                for (let index = 0; index < ASRList.length; index++) {
                    if (ASRList[index] == "chatData") {
                        let objectStore = db.createObjectStore(ASRList[index], { keyPath: "index" }); // 创建表
                        objectStore.createIndex("callId", "callId", { unique: false });
                    }
                }
            }
        };
    });
}

/**
 * 新增数据
 */
export function addData(db, storeName, data) {
    return new Promise((resolve, reject) => {
        let request = db
            .transaction([storeName], "readwrite") // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
            .objectStore(storeName) // 仓库对象
            .add(data);

        request.onsuccess = function (event) {
            resolve(event);
        };

        request.onerror = function (event) {
            throw new Error(event.target.error);
            reject(event);
        };
    });
}

/**
 * 通过主键读取数据
 */
export function getDataByKey(db, storeName, key) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction([storeName]); // 事务
        let objectStore = transaction.objectStore(storeName); // 仓库对象
        let request = objectStore.get(key);

        request.onerror = function (event) {
            reject(event);
        };

        request.onsuccess = function (event) {
            resolve(request.result);
        };
    });
}

/**
 * 通过游标读取数据
 */
export function cursorGetData(db, storeName) {
    let list = [];
    let store = db
        .transaction(storeName, "readwrite") // 事务
        .objectStore(storeName); // 仓库对象
    let request = store.openCursor(); // 指针对象
    return new Promise((resolve, reject) => {
        request.onsuccess = function (e) {
            let cursor = e.target.result;
            if (cursor) {
                // 必须要检查
                list.push(cursor.value);
                cursor.continue(); // 遍历了存储对象中的所有内容
            } else {
                resolve(list);
            }
        };
        request.onerror = function (e) {
            reject(e);
        };
    });
}

/**
 * 通过索引读取数据
 */
export function getDataByIndex(db, storeName, indexName, indexValue) {
    let store = db.transaction(storeName, "readwrite").objectStore(storeName);
    let request = store.index(indexName).get(indexValue);
    return new Promise((resolve, reject) => {
        request.onerror = function (e) {
            reject(e);
        };
        request.onsuccess = function (e) {
            resolve(e.target.result);
        };
    });
}

/**
 * 通过索引和游标查询记录
 */
export function cursorGetDataByIndex(db, storeName, indexName, indexValue) {
    let list = [];
    let store = db.transaction(storeName, "readwrite").objectStore(storeName); // 仓库对象
    let request = store
        .index(indexName) // 索引对象
        .openCursor(IDBKeyRange.only(indexValue)); // 指针对象
    return new Promise((resolve, reject) => {
        request.onsuccess = function (e) {
            let cursor = e.target.result;
            if (cursor) {
                list.push(cursor.value);
                cursor.continue(); // 遍历了存储对象中的所有内容
            } else {
                resolve(list);
            }
        };
        request.onerror = function (ev) {
            reject(ev);
        };
    });
}

/**
 * 更新数据
 */
export function updateDB(db, storeName, data) {
    let request = db
        .transaction([storeName], "readwrite") // 事务对象
        .objectStore(storeName) // 仓库对象
        .put(data);

    return new Promise((resolve, reject) => {
        request.onsuccess = function (ev) {
            resolve(ev);
        };

        request.onerror = function (ev) {
            resolve(ev);
        };
    });
}

/**
 * 删除数据
 */
export function deleteDB(db, storeName) {
    let request = db.transaction([storeName], "readwrite").objectStore(storeName).clear();

    return new Promise((resolve, reject) => {
        request.onsuccess = function (ev) {
            resolve(10000);
        };

        request.onerror = function (ev) {
            resolve(ev);
        };
    });
}

 
/**
 * 删除数据库
 */
export function deleteDBAll(dbName) {
    console.log(dbName);
    let deleteRequest = window.indexedDB.deleteDatabase(dbName);
    return new Promise((resolve, reject) => {
        deleteRequest.onerror = function (event) {
            console.log("删除失败");
        };
        deleteRequest.onsuccess = function (event) {
            console.log("删除成功");
        };
    });
}

/**
 * 关闭数据库
 */
export function closeDB(db) {
    db.close();
    console.log("数据库已关闭");
}

export const IndexDB_GetOrAdd = (IndexDB_Name, id, key) => {
    return new Promise((resolve, reject) => {
        const DB_List = IndexDB_Name.find((item) => item.id === id);
        if (DB_List && DB_List.key == key) {
            resolve(DB_List.list);
        } else {
            resolve(false);
        }
    });
};

export default {
    openDB,
    addData,
    getDataByKey,
    cursorGetData,
    getDataByIndex,
    cursorGetDataByIndex,
    updateDB,
    deleteDB,
    deleteDBAll,
    closeDB,
    IndexDB_GetOrAdd,
};

```

```js
import { IndexDB_GetOrAdd, cursorGetData, openDB, updateDB } from "../index";
 
let db;

const Hashkey = {
    LaunchList: "k1",
    MediaList: "k1",
    MemberLevel: "k1",
};

export const IndexDB_GetCustomerManageList = async (id) => {
    db = await openDB("Options", "CustomerManage", 1);

    return new Promise(async (resolve, reject) => {
        let IndexDB_CustomerManage = await cursorGetData(db, "CustomerManage");
        const item = IndexDB_CustomerManage.find((item) => item.id === id);
        if (item && item.key == Hashkey[id]) {
            resolve(item.list);
        } else {
            if (id == "LaunchList") {
                API_Launch_GetList().then((res) => {
                    resolve(res.data);
                    updateDB(db, "CustomerManage", {
                        id: id,
                        key: Hashkey[id],
                        list: res.data,
                    });
                });
            }  
        }
    });
};

```

使用  `MemberLevel.value = await IndexDB_GetCustomerManageList("MemberLevel");`

### 禁止浏览器打开文件或下载

```js
// 禁止浏览器打开文件或下载
document.addEventListener(
  "drop",
  function (e) {
    e.preventDefault();
  },
  false
);
document.addEventListener(
  "dragover",
  function (e) {
    e.preventDefault();
  },
  false
);
```

### 订阅模式

```js
const AudioPlayListeners = [];

export function AudioPlaySubscribe(listener) {
    AudioPlayListeners.push(listener);
}

export function AudioPlaySubscribeSet(type, data = null) {
    AudioPlayListeners.forEach((listener) => listener(type, data));
}

```
