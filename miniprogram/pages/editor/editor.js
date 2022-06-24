
const db = wx.cloud.database()

Page({
  data: {
    formats: {},
    readOnly: false,
    placeholder: '开始输入...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    openId: ""
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  onLoad(options) {
    console.log(options)
    this.setData({ openId: "test"})
    console.log(options)
    if(options.openId!=null){
      this.setData({ openId: options.openId})
    }

    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({ isIOS})
    const that = this
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)

    })


  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const { windowHeight, platform } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    this.setData({ editorHeight, keyboardHeight })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const { statusBarHeight, platform } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
      that.resetInput()
    }).exec()
  },
  blur() {
    this.editorCtx.blur()
  },
  format(e) {
    let { name, value } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)

  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({ formats })
  },


  saveInput(i){
    wx.showLoading({
      title: '正在保存',
    });
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
      }).then((resp) => {
        console.log(resp)
        wx.hideLoading();
      }).catch((e) => {
        console.log(e);
        wx.hideLoading();
      });
      // var myCollection=db.collection("editorData")
      // myCollection.where({
      //   "openId" : this.data.openId
      // }).get().then(res => {
      //   console.log(res.data[0]._id)
      //   if(res.data!=[]){
      //     // myCollection.doc(res.data[0]._id).get().then(res => {
      //     //   console.log(res)
      //     // })
      //     myCollection.doc(res.data[0]._id).remove().then(console.log)
          
      //     // myCollection.doc(res.data[0]._id).update({
      //     //   data: {
      //     //     data : e.html
      //     //   }
      //     // }).then(res => {
      //     //   console.log(res)
      //     // })
      //   }
      //   myCollection.add({
      //     data :{
      //       openId: this.data.openId,
      //       html : e.html
      //     }
      //   }).then(console.log)
      // })
      // .catch(error => {
      //   console.log(error)
      // })
    })
  },

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
      wx.hideLoading();
    }).catch(err =>{
      console.log(err)
      wx.hideLoading();
    })
  },

  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    })
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
      }
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })

  },
  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      success: function (res) {
        that.editorCtx.insertImage({
          src: res.tempFilePaths[0],
          data: {
            id: 'abcd',
            role: 'god'
          },
          width: '80%',
          success: function () {
            console.log('insert image success')
          }
        })
      }
    })
  }
})
