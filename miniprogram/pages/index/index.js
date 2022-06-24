// index.js
// const app = getApp()
const { envList } = require('../../envList.js');

Page({
  data: {
    showUploadTip: false,
    powerList: [{
      title: '云函数',
      tip: '安全、免鉴权运行业务代码',
      showItem: false,
      item: [{
        title: '获取OpenId',
        page: 'getOpenId'
      },
      //  {
      //   title: '微信支付'
      // },
       {
        title: '生成小程序码',
        page: 'getMiniProgramCode'
      },
      // {
      //   title: '发送订阅消息',
      // }
    ]
    }, {
      title: '数据库',
      tip: '安全稳定的文档型数据库',
      showItem: false,
      item: [{
        title: '创建集合',
        page: 'createCollection'
      }, {
        title: '更新记录',
        page: 'updateRecord'
      }, {
        title: '查询记录',
        page: 'selectRecord'
      }, {
        title: '聚合操作',
        page: 'sumRecord'
      }]
    }, {
      title: '云存储',
      tip: '自带CDN加速文件存储',
      showItem: false,
      item: [{
        title: '上传文件',
        page: 'uploadFile'
      }]
    }, {
      title: '云托管',
      tip: '不限语言的全托管容器服务',
      showItem: false,
      item: [{
        title: '部署服务',
        page: 'deployService'
      }]
    }],
    envList,
    selectedEnv: envList[0],
    haveCreateCollection: false,
    availableAuthMethod:[],
    
    verifiedMethodName : {
      fingerPrint : "指纹验证",
      facial : "人脸识别",
      speech : "语音识别"
    },
    openId : "",
    

  },

  onLoad(e) {
    wx.checkIsSupportSoterAuthentication({
      success: (result) => {
        this.setData({
          availableAuthMethod: result.supportMode
        });
        console.log(result)
      },
      fail: (e) => {
        console.log(e)
      }
    })
    
    this.onClickLogin()
  },

  onClickVirefied(e) {
    const verifiedMethod = e.currentTarget.dataset.type;
    wx.startSoterAuthentication({
      challenge: '12345',
      requestAuthModes: [verifiedMethod],
       success : (e)=>{
        console.log(e)
       },
       fail: (e) => {
        console.log(e)
      }
    })
  },
  onClickLogin(p) {
    

    wx.login({
      timeout: 2000,
      success : (e)=>{
        
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
            console.log(result)
           },
           fail: (result) => {
            console.log(result)
          }
        })
        console.log(e)
       },
       fail: (e) => {
        console.log(e)
      }
    })
  },

  onClickPowerInfo(e) {
    const index = e.currentTarget.dataset.index;
    const powerList = this.data.powerList;
    powerList[index].showItem = !powerList[index].showItem;
    if (powerList[index].title === '数据库' && !this.data.haveCreateCollection) {
      this.onClickDatabase(powerList);
    } else {
      this.setData({
        powerList
      });
    }
  },

  onChangeShowEnvChoose() {
    wx.showActionSheet({
      itemList: this.data.envList.map(i => i.alias),
      success: (res) => {
        this.onChangeSelectedEnv(res.tapIndex);
      },
      fail (res) {
        console.log(res.errMsg);
      }
    });
  },

  onChangeSelectedEnv(index) {
    if (this.data.selectedEnv.envId === this.data.envList[index].envId) {
      return;
    }
    const powerList = this.data.powerList;
    powerList.forEach(i => {
      i.showItem = false;
    });
    this.setData({
      selectedEnv: this.data.envList[index],
      powerList,
      haveCreateCollection: false
    });
  },

  jumpPage(e) {
    wx.navigateTo({
      url: `/pages/${e.currentTarget.dataset.page}/index?envId=${this.data.selectedEnv.envId}`,
    });
  },

  onClickDatabase(powerList) {
    wx.showLoading({
      title: '',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        env: this.data.selectedEnv.envId
      },
      data: {
        type: 'createCollection'
      }
    }).then((resp) => {
      if (resp.result.success) {
        this.setData({
          haveCreateCollection: true
        });
      }
      this.setData({
        powerList
      });
      wx.hideLoading();
    }).catch((e) => {
      console.log(e);
      this.setData({
        showUploadTip: true
      });
      wx.hideLoading();
    });
  }
});
