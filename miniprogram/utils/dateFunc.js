//计算某天之后多少天，是哪一天
export const getDayAfterDatediff = (date, dateDiff) => {
    var dd = new Date(date);
    dd.setDate(dd.getDate() + dateDiff);
    var y = dd.getFullYear();
    var m = (dd.getMonth() + 1) < 10 ? '0' + (dd.getMonth() + 1) : (dd.getMonth() + 1);
    var d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate();
    return y + '-' + m + '-' + d;
}

//计算两个日期之间间隔多少天
export const getDateDiff = (dateString1, dateString2) => {
    var startDate = Date.parse(dateString1);
    var endDate = Date.parse(dateString2);
    var days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000);
    return days;
}

//计算数组平均数
export const average = (...arr) => {
    const nums = [].concat(...arr);
    return nums.reduce((acc, val) => acc + val, 0) / nums.length;
};

//计算两个日期之间所有日期
export const getDaysBetween = (stime, etime) => {
    //初始化日期列表，数组
    var diffdate = new Array();
    var i = 0;
    //开始日期小于等于结束日期,并循环
    for (var j = 0; j <= 12; j++) {
        if (stime <= etime) {
            diffdate[i] = stime;

            //获取开始日期时间戳
            var stime_ts = new Date(stime).getTime();
            // console.log('当前日期：' + stime + '当前时间戳：' + stime_ts);

            //增加一天时间戳后的日期
            var next_date = stime_ts + (24 * 60 * 60 * 1000);

            //拼接年月日，这里的月份会返回（0-11），所以要+1
            var next_dates_y = new Date(next_date).getFullYear() + '-';
            var next_dates_m = (new Date(next_date).getMonth() + 1 < 10) ? '0' + (new Date(next_date).getMonth() + 1) + '-' : (new Date(next_date).getMonth() + 1) + '-';
            var next_dates_d = (new Date(next_date).getDate() < 10) ? '0' + new Date(next_date).getDate() : new Date(next_date).getDate();

            stime = next_dates_y + next_dates_m + next_dates_d;

            //增加数组key
            i++;
        }
    }
    return diffdate;

};