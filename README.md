# 智能锁便签

由微信官方文档editor的事例和微信云开发官方事例改编而来

## 主页面
### 初始化
初始化时用wx.login和jscode2session来获取用户的openid，openid用于标识每个人的便签存档。
```
        wx.request({
          url: 'https://api.weixin.qq.com/sns/jscode2session',
          data :{
            appid : "wx8e53f7cc6ebcabb6",
            secret : "2212418288605765e145de72d7ffa3b3",
            js_code : e.code,
            grant_type : "authorization_code"
          },
          success : (result)=>{
            this.setData({
              openId : result.data.openid
            })
            ...
```
之后利用checkIsSupportSoterAuthentication来获取手机支持的生物验证方式
```
wx.checkIsSupportSoterAuthentication({
      success: (result) => {
        this.setData({
          availableAuthMethod: result.supportMode
        });
        ...
```
利用wx:for 和 availableAuthMethod变量使支持的方式在主页显示，不支持的方式不显示
```
<view class="power" wx:key="title" wx:for="{{availableAuthMethod}}" wx:for-item="power">
    <view class="power_info" data-type="{{power}}" bindtap="onClickVirefied">
    ...
```
### 生物验证进入编辑器
通过点击按键触发onClickVirefied函数，验证成功则跳转至编辑器，跳转时传递获取的openId
```
wx.startSoterAuthentication({
      challenge: '12345',
      requestAuthModes: [verifiedMethod],
       success : (e)=>{
        wx.navigateTo({
          url: `/pages/editor/editor?openId=${this.data.openId}`,
        });
       },
```

## 编辑器页面
编辑器页面由微信小程序editor官方文档改编而来，增加了保存和重置按键，删除了添加图片按键
### 保存按键
利用云函数，在云端调用数据库的添加函数，将获取到的已编辑的文本保存到数据库
```
this.editorCtx.getContents().then((e)=>{
      console.log(e)
      wx.cloud.callFunction({
        name: 'saveData',
        config: {
          env: this.data.envId
        },
        data: {
          openId: this.data.openId,
          html: e.html
        }
```
```
myCollection.doc(res.data[0]._id).update({
          data: {
            html: event.html
          }
        }).then(res => {
          console.log(res)
        })
      } else {
        myCollection.add({
          data: {
            openId: event.openId,
            html: event.html
          }
```
### 重置按键
直接从数据库通过openId作为标识获取之前保存的文本
```
resetInput(e){
    wx.showLoading({
      title: '正在重置',
    });
    db.collection("editorData").where({
      "openId" : this.data.openId
    }).get().then(res =>{
      if(res.data.length!=0){
        this.editorCtx.setContents({
          html: res.data[0].html
        })
      }
```
## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [微信小程序editor官方文档](https://developers.weixin.qq.com/miniprogram/dev/component/editor.html)

