/* Main page of the app */
// 云函数入口文件
const db = wx.cloud.database()

Page({
    data: {
        creditA: 0,
        creditB: 0,

        userA: '',
        userB: '',

        SwiperList: [],
        nowUser: '',
    },

    async onLoad() {
        this.initUser(); //初始化用户数据
        this.getSwiperList(); // 初始化首页轮播图数据
    },

    async onShow() {
        this.getCreditA(); // 初始化用户A 即库洛米的数据
        this.getCreditB() //  初始化用户B 即巴库的数据
        this.setData({
            userA: getApp().globalData.userA,
            userB: getApp().globalData.userB,
        })
    },

    async initUser() {
        const that = this;
        await wx.cloud.callFunction({ name: 'getOpenId' }).then(async resOpenId => {
            // 先在 UserList 表中查询有没有该条记录，即是不是新用户，是新用户才插入，否则不做动作
            db.collection('UserList').where({
                _openid: resOpenId.result
            })
                .get({
                    success: function (res) {
                        // 数据为空，才插入新用户
                        if (!res.data.length) {
                            db.collection('UserList').add({
                                // data 字段表示需新增的 JSON 数据
                                data: {
                                    date: new Date(),
                                    credit: 0
                                },
                                success: function (success) {
                                    console.log("成功插入一条新用户数据", success)
                                }
                            })
                        } else {
                            console.log(res.data[0])
                            that.setData({
                                nowUser: res.data[0]
                            })
                        }
                    }
                })
        })
    },

    getCreditA() {
        wx.cloud.callFunction({ name: 'getElementByOpenId', data: { list: getApp().globalData.collectionUserList, _openid: getApp().globalData._openidA } })
            .then(res => {
                this.setData({ creditA: res.result.data[0].credit })
            })
    },

    getCreditB() {
        wx.cloud.callFunction({ name: 'getElementByOpenId', data: { list: getApp().globalData.collectionUserList, _openid: getApp().globalData._openidB } })
            .then(res => {
                this.setData({ creditB: res.result.data[0].credit })
            })
    },

    async getSwiperList() {
        const that = this;
        wx.cloud.callFunction({ name: 'getSwiperData', data: { type: "MainPage" } })
            .then(res => {
                that.setData({
                    SwiperList: res.result.data
                })
            })
    },
})