// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()

// 云函数入口函数
// 获取轮播图数据，传入 type
exports.main = async (event, context) => {
  return await db.collection('SwiperList').where({
    type: event.type
  })
    .get();
}