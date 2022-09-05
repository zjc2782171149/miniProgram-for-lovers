/* Main page of the app */
import Toast from '@vant/weapp/toast/toast';
import { time } from '../../utils/time.js';

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
        isSign: false,
    },

    async onLoad() {
        this.initUser(); //初始化用户数据
        this.getSwiperList(); // 初始化首页轮播图数据
        console.log(time("'YYYY-MM-DD'"));
    },

    async onShow() {
        // this.dailyLovePusher();
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
                            console.log(res.data[0]);
                            // 查询今日是否签到
                            const recentSign = res.data[0].recentSign.split('-');
                            const nowTime = time("'YYYY-MM-DD'").split('-');
                            let isSign = false;
                            // 如果年份上就小于，比如上次签到是去年，那就可以签到
                            if (recentSign[0] < nowTime[0]) {
                                // 不做操作
                            } else {
                                if (recentSign[1] < nowTime[1]) {
                                    // 同一年，但如果月份上就小于，比如上次签到是上个月，那也可以签到
                                    // 不做操作
                                } else {
                                    if (recentSign[2] < nowTime[2]) {
                                        // 同一年同一月，但如果天数上小于，比如上次签到是几天前，那也可以签到
                                        // 不做操作
                                    } else {
                                        isSign = true;
                                    }
                                }
                            }
                            console.log("今日是否已签到", isSign);
                            that.setData({
                                nowUser: res.data[0],
                                isSign,
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

    async dailySign() {
        wx.showLoading({
            title: '正在签到中',
        })

        const that = this;
        db.collection('UserList').doc(this.data.nowUser._id).update({
            // data 传入需要局部更新的数据
            data: {
                // 表示将 done 字段置为 true
                recentSign: time("'YYYY-MM-DD'"),
                credit: that.data.nowUser.credit + 5
            },
            success: function (res) {
                that.setData({
                    isSign: true,
                    creditA: that.data.nowUser.nickname === '库洛米' ? that.data.creditA + 5 : that.data.creditA,
                    creditB: that.data.nowUser.nickname === '巴库' ? that.data.creditB + 5 : that.data.creditB,
                });
                wx.hideLoading();
                wx.showToast({
                    title: '签到成功！积分+5',
                    icon: 'none',
                    duration: 3000
                })
            },
            error: function (err) {
                wx.hideLoading()
                wx.showToast({
                    title: '签到失败',
                    icon: 'error',
                    duration: 2000
                })
            },
        })

    },
})