// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const db = cloud.database();
  var myCollection = db.collection("editorData")
  await myCollection.where({
      "openId": event.openId
    }).get().then(res => {
      console.log(res)
      if (res.data.length != 0) {
        // myCollection.doc(res.data[0]._id).get().then(res => {
        //   console.log(res)
        // })
        // myCollection.doc(res.data[0]._id).remove().then(console.log)

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
        }).then(console.log)
      }
    })
    .catch(error => {
      console.log(error)
    })

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}