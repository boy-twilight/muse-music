---
## 项目描述

1. 本项目是基于网易云开源 api 实现的一个在线播放网站，涵盖在线部分与用户个人数据部分，主要技术栈是 vue3.2+ts+pinia+vue-router+elementui-plus,主要实现了首页音乐推荐，音乐馆，音视频播放，歌词同步，二维码登录，歌手详情查看，综合搜索，歌单，深色模式与浅色模式等等
2. 生产环境下部署api过后无法登陆，属于网易云api的问题
---

## 更新

1. 此版本重写了 video 控件实现了更多功能
2. 预览:
3. ![预览](https://chart-twilight.gitee.io/image/%E9%A2%84%E8%A7%88.png)

---

## 项目说明

1. 本项目仅供学习，请不要用于其它任何用途
2. 本项目不提供后端服务，要使用后端请去https://binaryify.github.io/NeteaseCloudMusicApi下载后端
3. 项目的后端接口为 http://localhoust 3000，要修改可以去 request.ts 修改

---

## 项目启动

1. 安装后端，然后 Node app.js 启动后端
2. npm install 下载依赖
3. npm run dev 运行项目

---

## 项目截图

1. 首页
   ![首页](https://chart-twilight.gitee.io/image/%E9%A6%96%E9%A1%B5.png)
2. 歌单页
   ![歌单详情页](https://chart-twilight.gitee.io/image/%E6%AD%8C%E5%8D%95%E9%A1%B5.png)
3. 视频推荐页
   ![视频推荐页](https://chart-twilight.gitee.io/image/%E8%A7%86%E9%A2%91%E6%8E%A8%E8%8D%90%E9%A1%B5.png)
4. 视频播放页
   ![视频播放页](https://chart-twilight.gitee.io/image/%E8%A7%86%E9%A2%91%E6%92%AD%E6%94%BE%E9%A1%B5.png)
5. 歌手页
   ![歌手页](https://chart-twilight.gitee.io/image/%E6%AD%8C%E6%89%8B%E9%A1%B5.png)
6. 歌手详情页，在此页面可用查看歌手的专辑，视频，详情，热门歌曲
   ![歌手详情页](https://chart-twilight.gitee.io/image/%E6%AD%8C%E6%89%8B%E8%AF%A6%E6%83%85%E9%A1%B5.png)
7. 专辑页，在此页面可用查看专辑歌曲和其它专辑
   ![专辑](https://chart-twilight.gitee.io/image/%E4%B8%93%E8%BE%91%E9%A1%B5.png)
8. 搜索页，可根据关键词搜索歌曲，歌单，歌手，视频，专辑
   ![搜索页](https://chart-twilight.gitee.io/image/%E6%90%9C%E7%B4%A2%E9%A1%B5.png)
9. 歌曲详情页
   ![歌曲详情页](https://chart-twilight.gitee.io/image/%E6%AD%8C%E6%9B%B2%E8%AF%A6%E6%83%85%E9%A1%B5.png)
10. 音乐馆页
    ![音乐馆页](https://chart-twilight.gitee.io/image/%E9%9F%B3%E4%B9%90%E9%A6%86.png)
11. 黑夜模式
    ![黑夜模式](https://chart-twilight.gitee.io/image/%E9%BB%91%E5%A4%9C%E6%A8%A1%E5%BC%8F.png)
12. 用户喜欢的音乐页
    ![喜欢音乐页](https://chart-twilight.gitee.io/image/%E7%94%A8%E6%88%B7%E5%96%9C%E6%AC%A2%E9%A1%B5.png)
13. 用户最近播放页，在此页面可查看用户最近播放的音乐视频
    ![最近播放页](https://chart-twilight.gitee.io/image/%E6%9C%80%E8%BF%91%E6%92%AD%E6%94%BE%E9%A1%B5.png)
14. 下载记录页，在此页面用户可以查看自己下载的记录  
    ![下载页](https://chart-twilight.gitee.io/image/%E4%B8%8B%E8%BD%BD%E9%A1%B5.png)
