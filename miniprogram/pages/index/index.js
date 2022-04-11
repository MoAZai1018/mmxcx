// index.js
// const app = getApp()
const { envList } = require('../../envList.js');
import regeneratorRuntime from '../../lib/runtime/runtime';
import { getDayAfterDatediff, getDaysBetween, getDateDiff, average } from "../../utils/dateFunc.js";

Page({
  data: {
    //用户信息
    openid:'',

    //验证
    hiddenmodalput:true,
    myhiddenmodalput:true,
    password:'',
    //打卡日历
    year: 0,
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0,
    startWeek:0,
    //切换按钮
    currentSelectTripType: 'daka',
    //例假日历
    periodList: [],
    ovulationPeriod: [],
    predictPeriod: [],
    isTodayFormatted: 0,

    //例假记录
    dateList: [],
    isInPeriod: true,
    today: '',
    totalDay: 0,
    periodCount: 0,
    nextPeriodCount: 0,
    avgPeriodTime: 29,
    periodIntervalList: [],
    //打卡内容
    powerList: [{
      title: '数据库',
      tip: '安全稳定的文档型数据库',
      showItem: true,
      item: [{
        title: '🐰 完成任务',
        page: 'toCompleteMission'
      }, {
        title: '🐻 兑换奖励',
        page: 'toExchangeRewards'
      }, {
        title: '🐼 查询记录',
        page: 'selectRecord'
      },
      {
        title: '🍓 任务管理',
        page: 'updateMission'
      },
      {
        title: '🍑 奖励管理',
        page: 'updateRewards'
      }
    ]
    }],
    envList,
    selectedEnv: envList[0],
    haveCreateCollection: false,
    userIntegral: 0,
    userName: '',
    anniversary:0,
    operatorType: {
      COMPLETE_MISSION: 'complete mission',
      EXCHANGE_REWARDS: 'exchange rewards'
    }
  }, 
  /*移除 
  onLoad(){
    this.resetMission()
  },
*/
  onShow(){
    
    const dateList = wx.getStorageSync("dateList") || [];
    console.log(dateList)
    const isInPeriod = dateList.length % 2 - 1;
    // console.log(isInPeriod


    this.getCurrentDate();
    this.getPeriodCount();

    this.setData({ isInPeriod, dateList })

    this.selectUser()

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
  },

  selectUser() {
    wx.cloud.callFunction({
     name: 'quickstartFunctions',
     config: {
       env: this.data.envId
     },
     data: {
       type: 'selectUser',
     }
   }).then((resp) => {
     this.setData({
      userIntegral: resp.result.data[0].user_integral,
      userName: resp.result.data[0].user_name
     })
   }).catch((e) => {
  });
 },

 // 日历数据
 onLoad: function () {
   this.getOpenid();
   //this.lovepassword()
   /*每天重置任务 */
  this.resetMission()
     /*每天重置任务 */
   this.selectedDaka()
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let monthFom = (now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) :
  
  (now.getMonth() + 1);
  let dateFom = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
  let anniversary_year = "2021-12-02";
  let anniversary = getDateDiff(anniversary_year, year+"-"+monthFom+"-"+dateFom);
  console.log("asda "+anniversary_year),


  this.dateInit();
  this.setData({
    anniversary:anniversary+1,
    year: year,
    month: month,
    isToday: '' + year + month + now.getDate(),
    isTodayFormatted: '' + year + '-' + monthFom + '-' + dateFom
  })
},

lovepassword:function(){
  const lovepassword= wx.getStorageSync("lovepassword");
  let hiddenmodalput=false;
  if(lovepassword!=undefined&&lovepassword=="20211202"){
     hiddenmodalput=true;
  }
  this.setData({ hiddenmodalput })
},


dateInit: function (setYear, setMonth) {
  this.getPeriodList()
  let periodList = this.data.periodList
  let ovulationPeriod = this.data.ovulationPeriod
  let predictPeriod = this.data.predictPeriod


  //全部时间的月份都是按0~11基准，显示月份才+1
  let dateArr = [];                        //需要遍历的日历数组数据
  let arrLen = 0;                            //dateArr的数组长度
  let now = setYear ? new Date(setYear, setMonth) : new Date();
  let year = setYear || now.getFullYear();
  let nextYear = 0;
  let month = setMonth || now.getMonth();                    //没有+1方便后面计算当月总天数
  let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
  let startWeek = new Date(year + '/' + (month + 1) + '/' + 1).getDay();                            //目标月1号对应的星期
  let dayNums = new Date(year, nextMonth, 0).getDate();                //获取目标月有多少天
  let obj = {};
  let num = 0;

  if (month + 1 > 11) {
    nextYear = year + 1;
    dayNums = new Date(nextYear, nextMonth, 0).getDate();
  }
  arrLen = startWeek + dayNums;
  for (let i = 0; i < arrLen; i++) {
    if (i >= startWeek) {
      num = i - startWeek + 1;
      let monthFom = parseInt(month)
      monthFom = (monthFom + 1) < 10 ? '0' + (monthFom + 1) : (monthFom + 1)
      let dateFom = parseInt(num)
      dateFom = dateFom < 10 ? '0' + dateFom : dateFom
      let isTodayFormatted = '' + year + '-' + monthFom + '-' + dateFom
      obj = {
        isTodayFormatted: isTodayFormatted,
        isInPeriodList: periodList.indexOf(isTodayFormatted) != -1,
        isInOvulationPeriod: ovulationPeriod.indexOf(isTodayFormatted) != -1,
        isInPredictPeriod: predictPeriod.indexOf(isTodayFormatted) != -1,
        isToday: '' + year + (month + 1) + num,
        dateNum: num,
        weight: 5
      }
    } else {
      obj = {}
    }
    dateArr[i] = obj;
  }
  this.setData({
    dateArr: dateArr
  })

  let nowDate = new Date();
  let nowYear = nowDate.getFullYear();
  let nowMonth = nowDate.getMonth() + 1;
  let nowWeek = nowDate.getDay();
  let getYear = setYear || nowYear;
  let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;

  if (nowYear == getYear && nowMonth == getMonth) {
    this.setData({
      isTodayWeek: true,
      todayIndex: nowWeek
    })
  } else {
    this.setData({
      isTodayWeek: false,
      todayIndex: -1
    })
  }
},
lastMonth: function () {
  //全部时间的月份都是按0~11基准，显示月份才+1
  let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
  let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
  this.setData({
    year: year,
    month: (month + 1)
  })
  this.dateInit(year, month);
},
nextMonth: function () {
  //全部时间的月份都是按0~11基准，显示月份才+1
  let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
  let month = this.data.month > 11 ? 0 : this.data.month;
  this.setData({
    year: year,
    month: (month + 1)
  })
  this.dateInit(year, month);
},




  resetMission() {
    wx.cloud.callFunction({
        name: 'quickstartFunctions',
        config: {
          env: this.data.envId
        },
        data: {
          type: 'selectOperator'
        }
      }).then((resp) => {
        const operatorData = resp.result.data.reverse();
        let lastMissionDate;
        operatorData.some(item => {
          if(item.operator_type === this.data.operatorType.COMPLETE_MISSION){
            lastMissionDate = new Date(item.operator_time).getDate();
            return true
          }
          return false
        })
        const currentDate = new Date().getDate();
        console.log('lastMissionDate', lastMissionDate)
        console.log('currentDate', currentDate)
        if (lastMissionDate !== currentDate){
          console.log('resetMission')
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            config: {
              env: this.data.envId
            },
            data: {
              type: 'resetMission'
            }
          }).then((resp) => {

          })
        }
        
    }).catch((e) => {
    });
  },

//切换按钮
selectedDaka: function () {
 
  this.setData({
    currentSelectTripType: "daka",
    displayLijia:"none",
    displayDaka:"block"
  })
},
selectedLijia: function(e) {
  this.setData({
    currentSelectTripType: "lijia",
    displayDaka:"none",
    displayLijia:"block"
  })
},

//例假
getPeriodList() {
  let dateList = wx.getStorageSync('dateList') || [];
  let today = this.data.isTodayFormatted;
  console.log('Today is ' + today)
  const l = dateList.length
  if (l % 2 !== 0) {
      dateList.unshift(today)
  }
  let length, start, end, ovuStart, ovuEnd, predictStart, predictEnd = 0
  length = dateList.length;
  if (length != 0) {
      let daysBetween = []
      let daysBetweenOvu = []
      let daysBetweenPredict = []
      let periodList = []
      let ovulationPeriod = []
      let predictPeriod = []
      const avgPeriodTime = wx.getStorageSync("avgPeriodTime")
      for (var i = 0; i < length; i += 2) {
          start = dateList[i + 1]
          end = dateList[i]

          ovuStart = getDayAfterDatediff(start, avgPeriodTime - 19)
          ovuEnd = getDayAfterDatediff(start, avgPeriodTime - 10)

          predictStart = getDayAfterDatediff(start, avgPeriodTime)
          predictEnd = getDayAfterDatediff(start, avgPeriodTime + 4)

          daysBetween = getDaysBetween(start, end)
          daysBetween.forEach(v => periodList.push(v))

          daysBetweenOvu = getDaysBetween(ovuStart, ovuEnd)
          daysBetweenOvu.forEach(v => ovulationPeriod.push(v))

          daysBetweenPredict = getDaysBetween(predictStart, predictEnd)
          daysBetweenPredict.forEach(v => predictPeriod.push(v))
      }
      this.setData({ periodList, ovulationPeriod, predictPeriod })
  }

},
 //记录例假
 /**
     * 生命周期函数--监听页面加载
     */
    /*
      onShow() {
      const dateList = wx.getStorageSync("dateList") || [];
      const isInPeriod = dateList.length % 2 - 1;
      // console.log(isInPeriod)
      this.getCurrentDate();
      this.getPeriodCount();

      this.setData({ isInPeriod, dateList })
  },
    
    
    */


  //绑定点击事件，判断输入的时间是否合理
  bindDateChange(e) {
       console.log('picker发送选择改变，携带值为', e.detail.value)
      // this.getCurrentDate();

      let dateList = wx.getStorageSync("dateList") || [];
      let val = e.detail.value
      console.log(dateList.length)
      if(!dateList.length) { // 无数据直接记录
          dateList.unshift(e.detail.value);
      }else if (dateList.length % 2 === 0) { // 记录开始日期，校验开始日期是否正确
          if(this.isStartValid(e.detail.value)){
              dateList.unshift(e.detail.value);
          }else{
              wx.showToast({
                  title: '该记录不符合规则，历史记录请到"我的"页面查看',
                  icon: 'none',
                  duration: 2000
              })
          }
      } else { // 记录开始日期，校验开始日期是否正确
          const start = dateList[0];
          console.log(start+"--"+val)
          let diff = getDateDiff(start, val);
          console.log("diff"+diff)
          if (diff < 8 && diff > 0 && this.isEndValid(val)) {
              dateList.unshift(e.detail.value);
              dateList.sort().reverse()
          } else {
              wx.showToast({
                  title: '该记录不符合规则，历史记录请到"我的"页面查看',
                  icon: 'none',
                  duration: 2000
              })
          }
      }

      wx.setStorageSync("dateList", dateList);
      this.setData({ dateList })
      this.onShow();
  },

  // 检查月经开始日期是否与其他经期记录有交叉
  isStartValid(value){
      const dateList = wx.getStorageSync("dateList")
      for(let i=0;i<dateList.length;i+=2){
          if(value>dateList[i]){
              return true
          }else if(value>=dateList[i+1]){
              return false
          }
      }
      return true
  },

  // 检查月经结束日期是否与其他经期记录有交叉
  isEndValid(value){
      const dateList = wx.getStorageSync("dateList")
      if(dateList.length===1){ // 无历史记录，直接返回true
          return true
      }
      if(dateList[0]>dateList[2]){ // 记录最新的，直接返回true
          return true
      }

      for(let i=2;i<dateList.length;i+=2){
          // 插入历史记录时，开始时间，结束时间都应小于过去某个开始时间
          if(dateList[i]>dateList[0] && dateList[i]<=value){ 
              return false
          }
          if(i+2<dateList.length && dateList[i+2]<dateList[0]){
              return true
          }
      }
      return true
  },

  //得到当前时间相关的数据
  getCurrentDate() {
      let now = new Date();
      let year = now.getFullYear();
      // year = year >= 10 ? year : '0' + year;
      let monthzore = now.getMonth() + 1;
      let month = now.getMonth() + 1;
      monthzore = month;
      month = month >= 10 ? month : '0' + month;
      let date = now.getDate();
      date = date >= 10 ? date : '0' + date;
      //totalDay 表示该月有多少天
      let totalDay = new Date(year, month, 0).getDate();
      let today = year + '-' + month + '-' + date
      this.setData({
          today,
          year,
          monthzore,
          totalDay,
      })
  },

  //新的记录产生时，需要刷新平均周期时间
  getPeriodCount() {
      this.getAvgPeriodTime();
      const dateList = wx.getStorageSync("dateList") || [];
      let avgPeriodTime = wx.getStorageSync("avgPeriodTime") || 29;
      let today = this.data.today;
      let nextPeriodCount, periodCount = 0;
      if (dateList.length === 0) {
          nextPeriodCount = avgPeriodTime;
      } else if (dateList.length % 2 === 0) {
          nextPeriodCount = avgPeriodTime - getDateDiff(dateList[1], today);
          this.setData({ nextPeriodCount })
      } else if (dateList.length % 2 !== 0) {
          periodCount = getDateDiff(dateList[0], today) + 1;
          this.setData({ periodCount })
      }

  },

  //新的记录产生时，需要刷新平均周期时间
  getAvgPeriodTime() {
      const list = wx.getStorageSync("dateList") || [];
      const length = list.length;

      if (length != 0 && length % 2 === 0) {
          for (var i = 0; i < length; i += 2) {
              let start = list[i + 1];
              // 如果没有前一个记录，则将preStart设置成和start一样，这样使得间隔时间为0，后面0将不显示
              let preStart = list[i + 3] || list[i + 1];
              let dateDiff2 = length >= 3 ? getDateDiff(preStart, start) : 0;
              let periodIntervalList = this.data.periodIntervalList;
              // 间隔期间太短或者太长都应该舍去，不属于正常范围的月经周期
              if (dateDiff2 >= 25 && dateDiff2 <= 40) { periodIntervalList.push(dateDiff2) }
              this.setData({ periodIntervalList })
          }
          let avgPeriodTime = parseInt(average(this.data.periodIntervalList)) || 29;
          this.setData({ avgPeriodTime })
          console.log(avgPeriodTime)
          wx.setStorageSync("avgPeriodTime", avgPeriodTime)
      }
  },

  //验证口令
  cancelM:function(e){
    wx.showLoading({
      title: '请验证或退出',
     })
     setTimeout(function () {
      wx.hideLoading()
     }, 2000)
 },

 confirmM: function (e) {
    if(this.data.password != undefined && this.data.password=="0327"){
      wx.setStorageSync('lovepassword', "0327")
      wx.showToast({
        title: '成功',
        icon: 'success',
        duration: 2000
       })
      this.setData({
        hiddenmodalput: true,
     })
    }else{
      wx.showToast({
        title: '口令错误',
        icon: 'error',
        duration: 2000
       })
    }

 },


 myConfirmM: function (e) {
    this.setData({
      myhiddenmodalput: true,
   })
},

 iPSW: function (e) {
    this.setData({
      password:e.detail.value
    })
 },

 getOpenid() {
  wx.cloud.callFunction({
   name: 'quickstartFunctions',
   config: {
     env: this.data.envId
   },
   data: {
     type: 'getOpenid',
   }
 }).then((resp) => {
  console.log('云函数获取到的openid: ', resp)
 }).catch((e) => {
});
},
getOpenid() {
  let openid='';
  wx.cloud.callFunction({
   name: 'quickstartFunctions',
   config: {
     env: this.data.envId
   },
   data: {
     type: 'getOpenid',
   }
 }).then((resp) => {
  console.log('云函数获取到的openid: ', resp)

  openid = resp.result.openid;
  //情侣openid
  if(openid=="oM34W5GDqyhUFLEH527XdVGghRGg"||openid=="oM34W5MzmmQhG4aR_TagtWM_cqKk"){
    this.setData({
      openid:openid,
      hiddenmodalput:true,
      myhiddenmodalput:false
    })
  }else{
    this.setData({
      openid:openid,
      hiddenmodalput:false,
      myhiddenmodalput:true
    })
  } 
 }).catch((e) => {
});
},

    

});
