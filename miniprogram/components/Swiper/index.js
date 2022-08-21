// Components/Swiper/Swiper.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    swiperList: {
      type: Array,
      value: [],
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  onLoad() {
    console.log(this.properties.swiperList)
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },
})
