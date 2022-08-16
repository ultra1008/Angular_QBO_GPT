var projectSchema = require('./../../../../../model/project');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');
var config = require('./../../../../../config/config');
var timecardSchema = require('../../../../../model/timecard');
var settingsSchema = require('../../../../../model/settings');
var userSchema = require('../../../../../model/user');
var payrollSchema = require('./../../../../../model/payroll');
let activityController = require("./../todaysActivity/todaysActivityController");
var moment = require('moment');

module.exports.getHoursOfTheMonth = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let top_number = config.TOP_TOTAL_WORK_HOURS;
            let timecardCollection = connection_db_api.model(collectionConstant.TIMECARDS, timecardSchema);
            let weekOTHHour = 40;
            let sort = { timecard_clock_in: -1 };
            let dayWork = {
                $cond: [
                    {
                        $ne: ["$timecard_clock_out", 0]
                    },
                    {
                        $floor: {
                            $divide: [{
                                $subtract:
                                    [{ $subtract: ["$timecard_clock_out", "$timecard_clock_in"] }, { $subtract: ["$timecard_break_out", "$timecard_break_in"] }]
                            }, 60]
                        }
                    },
                    0
                ],
            };
            let dayRTH = {
                $cond: [
                    {
                        $eq: [dayWork, 0]
                    },
                    0,
                    {
                        $cond: [
                            {
                                $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }]
                            },
                            { $multiply: ["$project_rth_oth_dth.project_rth", 60] },
                            dayWork
                        ]
                    }
                ]
            };
            let dayDTH = {
                $cond: [
                    {
                        $eq: [dayWork, 0]
                    },
                    0,
                    {
                        $cond: [
                            {
                                $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_dth", 60] }]
                            },
                            {
                                $subtract: [dayWork, { $multiply: ["$project_rth_oth_dth.project_dth", 60] }]
                            },
                            0
                        ]
                    }
                ]
            };
            let dayOTH = {
                $cond: [
                    {
                        $eq: [dayWork, 0]
                    },
                    0,
                    {
                        $cond: [
                            {
                                $and: [
                                    { $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }] },
                                    { $lt: [{ $multiply: ["$project_rth_oth_dth.project_dth", 60] }, dayWork] },
                                ]
                            },
                            {
                                $subtract: [dayWork,
                                    {
                                        $add: [{ $multiply: ["$project_rth_oth_dth.project_rth", 60] }, dayDTH]
                                    }
                                ]
                            },
                            {
                                $cond: [
                                    {
                                        $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }]
                                    },
                                    {
                                        $subtract: [dayWork,
                                            {
                                                $multiply: ["$project_rth_oth_dth.project_rth", 60]
                                            }
                                        ]
                                    },
                                    0
                                ]
                            }
                        ]
                    }
                ]
            };
            let query = [];
            let get_project_TimeCard = await timecardCollection.aggregate([
                {
                    $match: { is_delete: 0 }
                },
                {
                    $lookup: {
                        from: collectionConstant.PROJECT,
                        // localField: "timecard_project_id",
                        // foreignField: "_id",
                        let: { id: "$timecard_project_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$id"] },
                                    is_delete: 0
                                }
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.PROJECT_SETTINGS,
                                    localField: "_id",
                                    foreignField: "project_id",
                                    as: "project_setting",
                                },

                            },
                            {
                                $unwind: "$project_setting"
                            },
                            {
                                $project: {
                                    project_rth: "$project_setting.settings.timecard.rth_oth_dth.regular_time",
                                    project_dth: "$project_setting.settings.timecard.rth_oth_dth.double_time",
                                    project_oth: "$project_setting.settings.timecard.rth_oth_dth.weekly_over_time",
                                    project_name: 1,
                                }
                            }
                        ],
                        as: "project_rth_oth_dth"
                    },
                },
                {
                    $unwind: "$project_rth_oth_dth"
                },
                {
                    $project: {
                        _id: 1,
                        total_work_time: dayWork,
                        rth: dayRTH,
                        oth: dayOTH,
                        dth: dayDTH,


                    }
                }
            ]);
            res.send(get_project_TimeCard);
        } catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }

};

module.exports.gettimecardusingemployeepayrollgroup = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let top_number = config.TOP_TOTAL_WORK_HOURS;
            let timecardCollection = connection_db_api.model(collectionConstant.TIMECARDS, timecardSchema);
            let settingCollection = connection_db_api.model(collectionConstant.SETTINGS, settingsSchema);
            let one_setting = await settingCollection.findOne({});

            let start_date, end_date;
            let date_start = new Date();
            //console.log("date_start", date_start)
            requestObject.user_payroll_rules.toString();
            if (requestObject.user_payroll_rules == "1") {

                let day_index = config.WEEK_ARRAY.indexOf(one_setting.settings.payroll_weekely.setting_value);
                let currant_day = date_start.getDay();
                last_week_date = new Date(date_start.setDate(date_start.getDate() - 7));

                let sun = new Date(last_week_date.setDate(last_week_date.getDate() - last_week_date.getDay()));
                let sat = new Date(last_week_date.setDate(last_week_date.getDate() - last_week_date.getDay() + 6));

                start_date = Math.round(sun.setHours(0, 0, 0, 0) / 1000);
                end_date = Math.round(sat.setHours(23, 59, 59, 999) / 1000);

                /* if (currant_day == day_index) {
                    let tmp_date = new Date(date_start.setDate(date_start.getDate() - 7));
                    end_date_tmp = new Date(tmp_date);
                    start_date_tmp = new Date(new Date().setDate((end_date_tmp.getDate() - 7)));
                    //console.log("1", end_date_tmp, start_date_tmp)
                    start_date = Math.round(start_date_tmp.setHours(0, 0, 0, 0) / 1000);
                    end_date = Math.round(end_date_tmp.setHours(23, 59, 59, 999) / 1000);
                }
                else if (currant_day > day_index) {
                    let diff_date = currant_day - day_index
                    let tmp_date = new Date(date_start.setDate(date_start.getDate() - diff_date));
                    end_date_tmp = new Date(tmp_date);
                    let last_day_date = end_date_tmp.getDate()
                    start_date_tmp = new Date(new Date().setDate((end_date_tmp.getDate() - 7)));
                    //console.log("2", end_date_tmp, start_date_tmp)
                    start_date = Math.round(start_date_tmp.setHours(0, 0, 0, 0) / 1000);
                    end_date = Math.round(end_date_tmp.setHours(23, 59, 59, 999) / 1000);
                } else if (currant_day < day_index) {
                    let diff_date = day_index - currant_day
                    //console.log("day_index", day_index);
                    let tmp_date = new Date(date_start.setDate(date_start.getDate() - (7 - diff_date)));
                    //console.log(day_index)
                    end_date_tmp = new Date(tmp_date);
                    start_date_tmp = new Date(new Date().setDate((end_date_tmp.getDate() - 7)));
                    //console.log("3", end_date_tmp, start_date_tmp, tmp_date, date_start)
                    start_date = Math.round(start_date_tmp.setHours(0, 0, 0, 0) / 1000);
                    end_date = Math.round(end_date_tmp.setHours(23, 59, 59, 999) / 1000);
                } */
            } else if (requestObject.user_payroll_rules == "2") {

                //console.log("one_setting", one_setting.settings.payroll_semiweekely)
                let selectDayCount = config.WEEK_ARRAY.indexOf(one_setting.settings.payroll_semiweekely.setting_value);
                //console.log("one_setting.settings.payroll_semiweekely_value2", typeof one_setting.settings.payroll_semiweekely.setting_value2)
                let yearsData = await dayforothernectday(new Date(one_setting.settings.payroll_semiweekely.setting_value2).getMonth(),
                    selectDayCount, new Date(one_setting.settings.payroll_semiweekely.setting_value2).getDate());
                dateObjectSkip = await arrayfortime(yearsData);

                let todays_date = new Date().setHours(0, 0, 0, 0) / 1000;
                for (let m = 0; m < dateObjectSkip.length; m++) {
                    if (todays_date == new Date(dateObjectSkip[m]).setHours(0, 0, 0, 0) / 1000) {
                        end_date_tmp = new Date(dateObjectSkip[m - 1]);
                        console.log("end_date_tmp", end_date_tmp);
                        last_week_date = new Date(end_date_tmp.setDate(end_date_tmp.getDate() - 7));
                        let sun = new Date(last_week_date.setDate(last_week_date.getDate() - last_week_date.getDay() + 1));
                        let sat = new Date(last_week_date.setDate(last_week_date.getDate() - last_week_date.getDay() + 14));
                        start_date = Math.round(sun.setHours(0, 0, 0, 0) / 1000);
                        end_date = Math.round(sat.setHours(23, 59, 59, 999) / 1000);
                        break;
                    } else if (todays_date < new Date(dateObjectSkip[m]).setHours(0, 0, 0, 0) / 1000) {
                        end_date_tmp = new Date(dateObjectSkip[m - 2]);
                        console.log("end_date_tmp", end_date_tmp);
                        last_week_date = new Date(end_date_tmp.setDate(end_date_tmp.getDate() - 7));
                        let sun = new Date(last_week_date.setDate(last_week_date.getDate() - last_week_date.getDay() + 1));
                        let sat = new Date(last_week_date.setDate(last_week_date.getDate() - last_week_date.getDay() + 14));
                        start_date = Math.round(sun.setHours(0, 0, 0, 0) / 1000);
                        end_date = Math.round(sat.setHours(23, 59, 59, 999) / 1000);
                        break;
                    }
                    /* if (todays_date == new Date(dateObjectSkip[m]).setHours(0, 0, 0, 0) / 1000) {
                        //console.log(new Date(todays_date * 1000),new Date(dateObjectSkip[m-1]))
                        end_date_tmp = new Date(dateObjectSkip[m - 1]).setHours(0, 0, 0, 0) / 1000
                        start_date_tmp = new Date(dateObjectSkip[m - 2]).setHours(0, 0, 0, 0) / 1000
                        start_date = start_date_tmp;
                        end_date = end_date_tmp;
                        console.log("start_date,end_date if",new Date(start_date * 1000),new  Date(end_date * 1000))
                        break;
                    } else if (todays_date < new Date(dateObjectSkip[m]).setHours(0, 0, 0, 0) / 1000) {
                        //console.log(new Date(dateObjectSkip[m-1]),new Date(dateObjectSkip[m-2]))
                        end_date_tmp = new Date(dateObjectSkip[m - 1]).setHours(0, 0, 0, 0) / 1000
                        start_date_tmp = new Date(dateObjectSkip[m - 2]).setHours(0, 0, 0, 0) / 1000
                        start_date = start_date_tmp;
                        end_date = end_date_tmp
                        console.log("start_date,end_date else",new Date(start_date * 1000),new  Date(end_date * 1000))
                        break;

                    } */
                }
            }
            else if (requestObject.user_payroll_rules == "3" || requestObject.user_payroll_rules == "4") {
                // console.log("one_setting", one_setting.settings.payroll_monthly_date)
                // console.log("one_setting.settings.payroll_monthly_date",  one_setting.settings.payroll_monthly_date.setting_value)
                // let currant_date = new Date().getDate();
                // let currant_month = new Date().getMonth();
                const startOfMonth = moment().date(0).startOf('month').format('YYYY-MM-DD');
                const endOfMonth = moment().date(0).endOf('month').format('YYYY-MM-DD');
                start_date = Math.round(new Date(startOfMonth).setHours(0, 0, 0, 0) / 1000);
                end_date = Math.round(new Date(endOfMonth).setHours(23, 59, 59, 999) / 1000);

                // let payment_date = Number(one_setting.settings.payroll_monthly_date.setting_value)
                // if (payment_date == currant_date) {
                //     end_date_tmp = new Date(new Date().setMonth(currant_month - 1, payment_date))
                //     start_date_tmp = new Date(new Date().setMonth(currant_month - 2, payment_date))
                //     start_date = Math.round(start_date_tmp.setHours(0, 0, 0, 0) / 1000);
                //     end_date = Math.round(end_date_tmp.setHours(23, 59, 59, 999) / 1000);

                // } else if (payment_date > currant_date) {
                //     end_date_tmp = new Date(new Date().setMonth(currant_month - 1, payment_date))
                //     start_date_tmp = new Date(new Date().setMonth(currant_month - 2, payment_date))
                //     start_date = Math.round(start_date_tmp.setHours(0, 0, 0, 0) / 1000);
                //     end_date = Math.round(end_date_tmp.setHours(23, 59, 59, 999) / 1000);
                // } else if (payment_date < currant_date) {
                //     end_date_tmp = new Date(new Date().setMonth(currant_month, payment_date))
                //     start_date_tmp = new Date(new Date().setMonth(currant_month - 1, payment_date))
                //     start_date = Math.round(start_date_tmp.setHours(0, 0, 0, 0) / 1000);
                //     end_date = Math.round(end_date_tmp.setHours(23, 59, 59, 999) / 1000);
                // }
            }
            /* else if (requestObject.user_payroll_rules == "4") {
                //console.log("one_setting", one_setting.settings.payroll_monthly_day)
                payroll_monthly_day_paidon = one_setting.settings.payroll_monthly_day.setting_value;
                let day_index = config.WEEK_ARRAY.indexOf(one_setting.settings.payroll_monthly_day.setting_value2)
                let currant_date = new Date().getDate();
                let currant_month = new Date().getMonth();
                let year_day_array = dayForMonth_year(day_index, payroll_monthly_day_paidon, new Date().getFullYear())
                //console.log("year_day_array", day_index, year_day_array)
                let todays_date = new Date().setHours(0, 0, 0, 0) / 1000;
                for (let m = 0; m < year_day_array.length; m++) {
                    if (todays_date == new Date(year_day_array[m]).setHours(0, 0, 0, 0) / 1000) {
                        //console.log(new Date(todays_date * 1000),new Date(year_day_array[m-1]))
                        end_date_tmp = new Date(year_day_array[m - 1]).setHours(0, 0, 0, 0) / 1000
                        start_date_tmp = new Date(year_day_array[m - 2]).setHours(0, 0, 0, 0) / 1000
                        start_date = start_date_tmp;
                        end_date = end_date_tmp
                        break;
                    } else if (todays_date < new Date(year_day_array[m]).setHours(0, 0, 0, 0) / 1000) {
                        //console.log(new Date(year_day_array[m-1]),new Date(year_day_array[m-2]))
                        end_date_tmp = new Date(year_day_array[m - 1]).setHours(0, 0, 0, 0) / 1000
                        start_date_tmp = new Date(year_day_array[m - 2]).setHours(0, 0, 0, 0) / 1000
                        start_date = start_date_tmp;
                        end_date = end_date_tmp
                        break;
                    }
                }
                //console.log(new Date(start_date_tmp * 1000),new Date(end_date_tmp * 1000))
            } */
            else if (requestObject.user_payroll_rules == "5") {
                //console.log("one_setting.settings.payroll_semimonth", one_setting.settings.payroll_semimonth)
                let semimonthly = one_setting.settings.payroll_semimonth;
                let currant_date = new Date().getDate();
                let currant_month = new Date().getMonth();
                if (currant_date <= 15) {
                    var startOfMonth = new Date(new Date().setMonth(currant_month - 1)).setDate(16);
                    const endOfMonth = moment().date(0).endOf('month').format('YYYY-MM-DD');
                    start_date = Math.round(new Date(startOfMonth).setHours(0, 0, 0, 0) / 1000);
                    end_date = Math.round(new Date(endOfMonth).setHours(23, 59, 59, 999) / 1000);
                } else if (currant_date > 15) {
                    var startOfMonth = new moment().startOf('month').format('YYYY-MM-DD');
                    var endOfMonth = new Date().setDate(15);
                    start_date = Math.round(new Date(startOfMonth).setHours(0, 0, 0, 0) / 1000);
                    end_date = Math.round(new Date(endOfMonth).setHours(23, 59, 59, 999) / 1000);
                    console.log(start_date, end_date);
                }
                // if (currant_date == Number(semimonthly.setting_value)) {
                //     start_date_tmp = new Date(new Date().setMonth(currant_month - 1, Number(semimonthly.setting_value)))
                //     end_date_tmp = new Date(new Date().setMonth(currant_month - 1, Number(semimonthly.setting_value2)))
                //     start_date = Math.round(start_date_tmp.setHours(0, 0, 0, 0) / 1000);
                //     end_date = Math.round(end_date_tmp.setHours(23, 59, 59, 999) / 1000);
                // } else if (currant_date == Number(semimonthly.setting_value2)) {
                //     start_date_tmp = new Date(new Date().setMonth(currant_month - 1, Number(semimonthly.setting_value2)))
                //     end_date_tmp = new Date(new Date().setDate(Number(semimonthly.setting_value)))
                //     start_date = Math.round(start_date_tmp.setHours(0, 0, 0, 0) / 1000);
                //     end_date = Math.round(end_date_tmp.setHours(23, 59, 59, 999) / 1000);
                // } else if (currant_date < Number(semimonthly.setting_value)) {
                //     start_date_tmp = new Date(new Date().setMonth(currant_month - 1, Number(semimonthly.setting_value)))
                //     end_date_tmp = new Date(new Date().setMonth(currant_month - 1, Number(semimonthly.setting_value2)))
                //     start_date = Math.round(start_date_tmp.setHours(0, 0, 0, 0) / 1000);
                //     end_date = Math.round(end_date_tmp.setHours(23, 59, 59, 999) / 1000);
                // } else if (currant_date > Number(semimonthly.setting_value)) {
                //     start_date_tmp = new Date(new Date().setMonth(currant_month - 1, Number(semimonthly.setting_value2)))
                //     end_date_tmp = new Date(new Date().setDate(Number(semimonthly.setting_value)))
                //     start_date = Math.round(start_date_tmp.setHours(0, 0, 0, 0) / 1000);
                //     end_date = Math.round(end_date_tmp.setHours(23, 59, 59, 999) / 1000);
                // }
                // else if (currant_date < Number(semimonthly.setting_value2)) {

                // } else if (currant_date > Number(semimonthly.setting_value2)) {

                // }
                //console.log(start_date_tmp,end_date_tmp)
            }

            let query_project = [];
            if (requestObject.project_id) {
                for (let m = 0; m < requestObject.project_id.length; m++) {
                    query_project.push(ObjectID(requestObject.project_id[m]));
                }
            }
            let userConnection = connection_db_api.model(collectionConstant.USER, userSchema);
            let projectConnection = connection_db_api.model(collectionConstant.PROJECT, projectSchema);
            let weekOTHHour = 40;

            let dayWork = {
                $cond: [
                    {
                        $ne: ["$timecard_clock_out", 0]
                    },
                    {
                        $floor: {
                            $divide: [{
                                $subtract:
                                    [{ $subtract: ["$timecard_clock_out", "$timecard_clock_in"] }, { $subtract: ["$timecard_break_out", "$timecard_break_in"] }]
                            }, 60]
                        }
                    },
                    0
                ],
            };
            let dayRTH = {
                $cond: [
                    {
                        $eq: [dayWork, 0]
                    },
                    0,
                    {
                        $cond: [
                            {
                                $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }]
                            },
                            { $multiply: ["$project_rth_oth_dth.project_rth", 60] },
                            dayWork
                        ]
                    }
                ]
            };
            let dayDTH = {
                $cond: [
                    {
                        $eq: [dayWork, 0]
                    },
                    0,
                    {
                        $cond: [
                            {
                                $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_dth", 60] }]
                            },
                            {
                                $subtract: [dayWork, { $multiply: ["$project_rth_oth_dth.project_dth", 60] }]
                            },
                            0
                        ]
                    }
                ]
            };
            let dayOTH = {
                $cond: [
                    {
                        $eq: [dayWork, 0]
                    },
                    0,
                    {
                        $cond: [
                            {
                                $and: [
                                    { $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }] },
                                    { $lt: [{ $multiply: ["$project_rth_oth_dth.project_dth", 60] }, dayWork] },
                                ]
                            },
                            {
                                $subtract: [dayWork,
                                    {
                                        $add: [{ $multiply: ["$project_rth_oth_dth.project_rth", 60] }, dayDTH]
                                    }
                                ]
                            },
                            {
                                $cond: [
                                    {
                                        $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }]
                                    },
                                    {
                                        $subtract: [dayWork,
                                            {
                                                $multiply: ["$project_rth_oth_dth.project_rth", 60]
                                            }
                                        ]
                                    },
                                    0
                                ]
                            }
                        ]
                    }
                ]
            };
            let project_data = await projectConnection.aggregate([
                { $match: { is_delete: 0 } },
                { $match: { _id: { $in: query_project } } },
                {
                    $lookup: {
                        from: collectionConstant.PROJECT_SETTINGS,
                        localField: "_id",
                        foreignField: "project_id",
                        as: "project_setting"
                    }
                },
                { $unwind: "$project_setting" }
            ]);
            let all_user = await userConnection.aggregate([
                { $match: { is_delete: 0 } },
                { $match: { user_payroll_rules: requestObject.user_payroll_rules } },
                {
                    $lookup: {
                        from: collectionConstant.TIMECARDS,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        //, { $eq: ["$timecard_status", "Do Not Pay"] } 
                                        $and: [{ $eq: ["$timecard_employee_id", "$$id"] },
                                        { $eq: ["$is_delete", 0] },
                                        { $gte: ["$timecard_clock_in", start_date] },
                                        { $lte: ["$timecard_clock_in", end_date] },
                                        { $or: [{ $eq: ["$timecard_status", "Approved"] }, { $ne: ["$timecard_status", "Paid"] }] },
                                        { $in: ["$timecard_project_id", query_project] }]
                                    }
                                },
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.PROJECT,
                                    localField: "timecard_project_id",
                                    foreignField: "_id",
                                    as: "projects"
                                }
                            },
                            {
                                $unwind: "$projects"
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.PROJECT,
                                    // localField: "timecard_project_id",
                                    // foreignField: "_id",
                                    let: { id: "$timecard_project_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $eq: ["$_id", "$$id"] },
                                                is_delete: 0
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: collectionConstant.PROJECT_SETTINGS,
                                                localField: "_id",
                                                foreignField: "project_id",
                                                as: "project_setting",
                                            },

                                        },
                                        {
                                            $unwind: "$project_setting"
                                        },
                                        {
                                            $project: {
                                                project_rth: "$project_setting.settings.timecard.rth_oth_dth.regular_time",
                                                project_dth: "$project_setting.settings.timecard.rth_oth_dth.double_time",
                                                project_oth: "$project_setting.settings.timecard.rth_oth_dth.weekly_over_time",
                                                project_name: 1,
                                            }
                                        }
                                    ],
                                    as: "project_rth_oth_dth"
                                },
                            },
                            {
                                $unwind: "$project_rth_oth_dth"
                            },
                            {
                                $project: {
                                    _id: 1,
                                    timecard_clock_in: 1,
                                    timecard_location_id: 1,
                                    timecard_clockin_lat: 1,
                                    timecard_clockin_lng: 1,
                                    employee_name: 1,
                                    location_name: 1,
                                    timecard_clock_out: 1,
                                    timecard_clockout_lat: 1,
                                    timecard_clockout_lng: 1,
                                    timecard_break_in: 1,
                                    timecard_breakin_lat: 1,
                                    timecard_breakin_lng: 1,
                                    timecard_break_out: 1,
                                    timecard_breakout_lat: 1,
                                    timecard_breakout_lng: 1,
                                    timecard_status: 1,
                                    timecard_clock_in_picture: 1,
                                    timecard_clock_out_picture: 1,
                                    timecard_questions: 1,
                                    timecard_signaure: 1,
                                    timecard_note: 1,
                                    project_id: 1,
                                    project_name: 1,
                                    timecard_cost_code_id: 1,
                                    rth: dayRTH,
                                    oth: dayOTH,
                                    dth: dayDTH,
                                    dayWork: dayWork,
                                    timecard_created_at: 1,
                                    timecard_created_by: 1,
                                    timecard_updated_at: 1,
                                    timecard_updated_by: 1,
                                    timecard_type: 1,
                                    timecard_project_id: 1,
                                    project: "$projects",
                                    project_rth_oth_dth: "$project_rth_oth_dth"
                                }
                            }
                        ],
                        as: "timecard"
                    }
                }
            ]);

            let countQuery = {
                is_delete: 0,
                timecard_clock_in: { $gte: start_date, $lte: end_date },
                timecard_project_id: { $in: query_project },
                timecard_status: "",
            };
            countQuery["timecard_status"] = "Rejected";
            let rejectedCount = await timecardCollection.countDocuments(countQuery);

            countQuery["timecard_status"] = "Pending";
            console.log(countQuery);
            let pendingCount = await timecardCollection.countDocuments(countQuery);
            res.send({
                all_user, project_data, status: true,
                start_end_date: { start_date, end_date },
                countforstatus: { rejectedCount, pendingCount }
            });
        } catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

function dayforothernectday(month = 0, day = 0, date = 1) {
    var d = new Date();
    var sat = new Array();
    var onlyonetime = true;
    for (var j = month; j <= 1100; j++) {
        var getTot = daysInMonth(j, d.getFullYear());
        if (onlyonetime) {
            for (var i = date; i <= getTot; i++) {
                var newDate = new Date(d.getFullYear(), j, i);
                if (newDate.getDay() == day) {
                    sat.push(newDate);
                }
            }
            onlyonetime = false;
        } else {
            for (var i = 1; i <= getTot; i++) {
                var newDate = new Date(d.getFullYear(), j, i);
                if (newDate.getDay() == day) {
                    sat.push(newDate);
                }
            }
        }

    }
    return sat;
}

function arrayfortime(arrattmp) {
    var sat = new Array();
    for (var i = 0; i < arrattmp.length; i += 2) {  // take every second element
        sat.push(arrattmp[i]);
    }
    return sat;
}

function daysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

function dayForMonth_year(daycount, whichDay, getFullYear) {

    var d = new Date();
    var sat = new Array();
    for (var j = 0; j <= 11; j++) {
        var getTot = daysInMonth(j, getFullYear);
        for (var i = 1; i <= getTot; i++) {
            var newDate = new Date(getFullYear, j, i);
            if (newDate.getDay() == daycount && whichDay == "First") {
                sat.push(newDate);
                break;
            }
            if (newDate.getDay() == daycount && whichDay == "Second") {
                sat.push(new Date(getFullYear, j, i + 7));
                break;
            }
            if (newDate.getDay() == daycount && whichDay == "Third") {
                sat.push(new Date(getFullYear, j, i + 14));
                break;
            }
            if (newDate.getDay() == daycount && whichDay == "Forth") {
                sat.push(new Date(getFullYear, j, i + 21));
                break;
            }
            if (newDate.getDay() == daycount && whichDay == "Last" && this.counthowmanydaysonmonth(getFullYear, j, daycount) == 5) {

                sat.push(new Date(getFullYear, j, i + 28));
                break;
            }
            if (newDate.getDay() == daycount && whichDay == "Last" && this.counthowmanydaysonmonth(getFullYear, j, daycount) == 4) {

                sat.push(new Date(getFullYear, j, i + 21));
                break;
            }
        }
    }
    return sat;
}

function getCurrentMonthData(data, month) {
    var sat = new Array();
    for (var i = 0; i <= data.length - 1; i++) {

        if (data[i].getMonth() == month) {
            sat.push(data[i].getDate());
        }
    }
    return sat;
}
module.exports.savePayrollDate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let payrollCollection = connection_db_api.model(collectionConstant.PAYROLL, payrollSchema);
            if (requestObject._id) {
                let update_payroll = await payrollCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_payroll) {
                    res.send({ message: translator.getStr('PayrollUpdated'), data: update_payroll, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                let add_payroll = new payrollCollection(requestObject);
                let save_payroll = await add_payroll.save();
                if (save_payroll) {
                    payrollAddOnBudget(save_payroll, requestObject, decodedToken, translator);
                    for (let m = 0; m < requestObject.timecard_ids.length; m++) {
                        updateSatatus(requestObject.timecard_ids[m], decodedToken);
                        addTimecard_History("Update", { updated_id: requestObject.timecard_ids[m], timecard_status: "Paid" }, decodedToken);
                    }
                    res.send({ message: translator.getStr('PayrollAdded'), data: save_payroll, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

async function updateSatatus(_id, decodedToken) {
    let connection_db_api = await db_connection.connection_db_api(decodedToken);
    let timecardCollection = connection_db_api.model(collectionConstant.TIMECARDS, timecardSchema);
    let timecardObject = await timecardCollection.updateOne({ _id: ObjectID(_id) }, { timecard_status: "Paid" });
}

module.exports.saveInBudget = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let requestObject = req.body;
            payrollAddOnBudget("", requestObject, decodedToken, req.headers.language);
        } catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

async function payrollAddOnBudget(save_payroll, requestObject, decodedToken, translator) {

    let connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        let payrollCollection = connection_db_api.model(collectionConstant.PAYROLL, payrollSchema);
        let userConnection = connection_db_api.model(collectionConstant.USER, userSchema);
        let timecardCollection = connection_db_api.model(collectionConstant.TIMECARDS, timecardSchema);
        let user_ids = [], query_project = [], timecard_ids = [];
        let weekOTHHour = 40;

        let dayWork = {
            $cond: [
                {
                    $ne: ["$timecard_clock_out", 0]
                },
                {
                    $floor: {
                        $divide: [{
                            $subtract:
                                [{ $subtract: ["$timecard_clock_out", "$timecard_clock_in"] }, { $subtract: ["$timecard_break_out", "$timecard_break_in"] }]
                        }, 60]
                    }
                },
                0
            ],
        };
        let dayRTH = {
            $cond: [
                {
                    $eq: [dayWork, 0]
                },
                0,
                {
                    $cond: [
                        {
                            $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }]
                        },
                        { $multiply: ["$project_rth_oth_dth.project_rth", 60] },
                        dayWork
                    ]
                }
            ]
        };
        let dayDTH = {
            $cond: [
                {
                    $eq: [dayWork, 0]
                },
                0,
                {
                    $cond: [
                        {
                            $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_dth", 60] }]
                        },
                        {
                            $subtract: [dayWork, { $multiply: ["$project_rth_oth_dth.project_dth", 60] }]
                        },
                        0
                    ]
                }
            ]
        };
        let dayOTH = {
            $cond: [
                {
                    $eq: [dayWork, 0]
                },
                0,
                {
                    $cond: [
                        {
                            $and: [
                                { $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }] },
                                { $lt: [{ $multiply: ["$project_rth_oth_dth.project_dth", 60] }, dayWork] },
                            ]
                        },
                        {
                            $subtract: [dayWork,
                                {
                                    $add: [{ $multiply: ["$project_rth_oth_dth.project_rth", 60] }, dayDTH]
                                }
                            ]
                        },
                        {
                            $cond: [
                                {
                                    $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }]
                                },
                                {
                                    $subtract: [dayWork,
                                        {
                                            $multiply: ["$project_rth_oth_dth.project_rth", 60]
                                        }
                                    ]
                                },
                                0
                            ]
                        }
                    ]
                }
            ]
        };
        for (let m = 0; m < requestObject.users_ids.length; m++) {
            user_ids.push(ObjectID(requestObject.users_ids[m]));
        }
        for (let i = 0; i < requestObject.project_ids.length; i++) {
            query_project.push(ObjectID(requestObject.project_ids[i]));
        }
        for (let t = 0; t < requestObject.timecard_ids.length; t++) {
            timecard_ids.push(ObjectID(requestObject.timecard_ids[t]));
        }
        let timecard_data = await timecardCollection.aggregate([
            {
                $match: { _id: { $in: timecard_ids } }
            },
            {
                $lookup: {
                    from: collectionConstant.USER,
                    localField: "timecard_employee_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $lookup: {
                    from: collectionConstant.PROJECT,
                    // localField: "timecard_project_id",
                    // foreignField: "_id",
                    let: { id: "$timecard_project_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$id"] },
                                is_delete: 0
                            }
                        },
                        {
                            $lookup: {
                                from: collectionConstant.PROJECT_SETTINGS,
                                localField: "_id",
                                foreignField: "project_id",
                                as: "project_setting",
                            },

                        },
                        {
                            $unwind: "$project_setting"
                        },
                        {
                            $project: {
                                project_rth: "$project_setting.settings.timecard.rth_oth_dth.regular_time",
                                project_dth: "$project_setting.settings.timecard.rth_oth_dth.double_time",
                                project_oth: "$project_setting.settings.timecard.rth_oth_dth.weekly_over_time",
                                project_name: 1,
                            }
                        }
                    ],
                    as: "project_rth_oth_dth"
                },
            },
            {
                $unwind: "$project_rth_oth_dth"
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    data: {
                        rth: dayRTH,
                        oth: dayOTH,
                        dth: dayDTH,
                        total_rth: { $multiply: [{ $divide: [dayRTH, 60] }, "$user.usersalary"] },
                        total_oth: { $multiply: [{ $divide: [dayOTH, 60] }, { $multiply: ["$user.usersalary", 1.5] }] },
                        total_dth: { $multiply: [{ $divide: [dayDTH, 60] }, { $multiply: ["$user.usersalary", 2] }] },
                        total_salary_timecrad: { $multiply: [{ $divide: [dayWork, 60] }, "$user.usersalary"] },
                    },
                    _id: 1,
                    timecard_clock_in: 1,
                    timecard_location_id: 1,
                    timecard_clockin_lat: 1,
                    timecard_clockin_lng: 1,
                    employee_name: 1,
                    location_name: 1,
                    timecard_clock_out: 1,
                    timecard_clockout_lat: 1,
                    timecard_clockout_lng: 1,
                    timecard_break_in: 1,
                    timecard_breakin_lat: 1,
                    timecard_breakin_lng: 1,
                    timecard_break_out: 1,
                    timecard_breakout_lat: 1,
                    timecard_breakout_lng: 1,
                    timecard_status: 1,
                    timecard_clock_in_picture: 1,
                    timecard_clock_out_picture: 1,
                    timecard_questions: 1,
                    timecard_signaure: 1,
                    timecard_note: 1,
                    timecard_project_id: 1,
                    project_name: 1,
                    timecard_cost_code_id: 1,
                    rth: dayRTH,
                    oth: dayOTH,
                    dth: dayDTH,
                    dayWork: dayWork,
                    timecard_created_at: 1,
                    timecard_created_by: 1,
                    timecard_updated_at: 1,
                    timecard_updated_by: 1,
                    timecard_type: 1,
                }
            }, {
                $group: {
                    _id: "$timecard_project_id",
                    data: { $push: "$data" },
                    totalcount: { $sum: "$data.total_salary_timecrad" },
                    total_rth: { $sum: "$data.total_rth" },
                    total_oth: { $sum: "$data.total_oth" },
                    total_dth: { $sum: "$data.total_dth" }
                }
            }
        ]);

        for (let m = 0; m < timecard_data.length; m++) {
            let data = {
                payroll_amount: timecard_data[m].total_rth + timecard_data[m].total_oth + timecard_data[m].total_dth,
                project_id: timecard_data[m]._id,
                inserted_id: save_payroll._id,
                local_offset: requestObject.local_offset
            };
            activityController.addTodaysActivityCreatedDate("Payroll", data, decodedToken, requestObject.created_at, locale, requestObject.start_epoch);
        }
    } catch (e) {
        console.log(e);
    } finally {
        // connection_db_api.close();
    }
}

module.exports.getPayrollDatabase = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let payrollCollection = connection_db_api.model(collectionConstant.PAYROLL, payrollSchema);
            var col = [];
            col.push("created_at", "end_date", "noofemployee", "total_hours", "amount_paid");
            var start = parseInt(req.body.start);
            var perpage = parseInt(req.body.length);
            var columnData = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].column : '';
            var columntype = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].dir : '';
            var sort = {};
            if (req.body.draw == 1) {
                sort = { "created_at": -1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            var query = {
                $or: [{ "created_at": new RegExp(req.body.search.value, 'i') },
                { "end_date": new RegExp(req.body.search.value, 'i') },
                { "noofemployee": new RegExp(req.body.search.value, 'i') },
                { "total_hours": new RegExp(req.body.search.value, 'i') },
                { "amount_paid": new RegExp(req.body.search.value, 'i') }]
            };
            console.log(query);
            let payroll_data = await payrollCollection.aggregate([
                {
                    $lookup: {
                        from: collectionConstant.USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "users"
                    }
                },
                {
                    $unwind: "$users"
                },
                {
                    $project: {
                        "_id": 1,
                        "amount_paid": 1,
                        "total_rth": 1,
                        "total_oth": 1,
                        "total_dth": 1,
                        "total_hours": 1,
                        "noofemployee": 1,
                        "timecard_ids": 1,
                        "project_ids": 1,
                        "users_ids": 1,
                        "start_date": 1,
                        "end_date": 1,
                        "user_payroll_rules": 1,
                        "created_by": 1,
                        "created_at": 1,
                        "user_name": "$users.userfullname"
                    }
                },
                // {$match : query},
                { $sort: sort },
                { $limit: perpage + start },
                { $skip: start }
            ]);
            let count = await payrollCollection.countDocuments({});
            var dataResponce = {};
            dataResponce.data = payroll_data;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (req.body.search.value) ? payroll_data.length : count;
            res.json(dataResponce);
        } catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getpayrollinfo = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let payrollCollection = connection_db_api.model(collectionConstant.PAYROLL, payrollSchema);
            let userConnection = connection_db_api.model(collectionConstant.USER, userSchema);
            let user_ids = [], timecard_id = [];
            let weekOTHHour = 40;
            let dayWork = {
                $cond: [
                    {
                        $ne: ["$timecard_clock_out", 0]
                    },
                    {
                        $floor: {
                            $divide: [{
                                $subtract:
                                    [{ $subtract: ["$timecard_clock_out", "$timecard_clock_in"] }, { $subtract: ["$timecard_break_out", "$timecard_break_in"] }]
                            }, 60]
                        }
                    },
                    0
                ],
            };
            let dayRTH = {
                $cond: [
                    {
                        $eq: [dayWork, 0]
                    },
                    0,
                    {
                        $cond: [
                            {
                                $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }]
                            },
                            { $multiply: ["$project_rth_oth_dth.project_rth", 60] },
                            dayWork
                        ]
                    }
                ]
            };
            let dayDTH = {
                $cond: [
                    {
                        $eq: [dayWork, 0]
                    },
                    0,
                    {
                        $cond: [
                            {
                                $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_dth", 60] }]
                            },
                            {
                                $subtract: [dayWork, { $multiply: ["$project_rth_oth_dth.project_dth", 60] }]
                            },
                            0
                        ]
                    }
                ]
            };
            let dayOTH = {
                $cond: [
                    {
                        $eq: [dayWork, 0]
                    },
                    0,
                    {
                        $cond: [
                            {
                                $and: [
                                    { $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }] },
                                    { $lt: [{ $multiply: ["$project_rth_oth_dth.project_dth", 60] }, dayWork] },
                                ]
                            },
                            {
                                $subtract: [dayWork,
                                    {
                                        $add: [{ $multiply: ["$project_rth_oth_dth.project_rth", 60] }, dayDTH]
                                    }
                                ]
                            },
                            {
                                $cond: [
                                    {
                                        $gt: [dayWork, { $multiply: ["$project_rth_oth_dth.project_rth", 60] }]
                                    },
                                    {
                                        $subtract: [dayWork,
                                            {
                                                $multiply: ["$project_rth_oth_dth.project_rth", 60]
                                            }
                                        ]
                                    },
                                    0
                                ]
                            }
                        ]
                    }
                ]
            };
            console.log("requestObject", requestObject);
            for (let m = 0; m < requestObject.users_ids.length; m++) {

                user_ids.push(ObjectID(requestObject.users_ids[m]));
            }
            let query_project = [];
            for (let i = 0; i < requestObject.project_ids.length; i++) {

                query_project.push(ObjectID(requestObject.project_ids[i]));
            }
            for (let t = 0; t < requestObject.timecard_ids.length; t++) {

                timecard_id.push(ObjectID(requestObject.timecard_ids[t]));
            }
            let all_user = await userConnection.aggregate([
                { $match: { is_delete: 0 } },
                { $match: { _id: { $in: user_ids } } },
                {
                    $lookup: {
                        from: collectionConstant.TIMECARDS,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    _id: { $in: timecard_id },
                                    $expr: {
                                        //{ $eq: ["$timecard_status", "Paid"] }, { $eq: ["$timecard_status", "Do Not Pay"] } 
                                        $and: [{ $eq: ["$timecard_employee_id", "$$id"] },
                                        { $eq: ["$is_delete", 0] }]
                                    }
                                },
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.PROJECT,
                                    localField: "timecard_project_id",
                                    foreignField: "_id",
                                    as: "project"
                                }
                            },
                            {
                                $unwind: "$project"
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.PROJECT,
                                    // localField: "timecard_project_id",
                                    // foreignField: "_id",
                                    let: { id: "$timecard_project_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $eq: ["$_id", "$$id"] },
                                                is_delete: 0
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: collectionConstant.PROJECT_SETTINGS,
                                                localField: "_id",
                                                foreignField: "project_id",
                                                as: "project_setting",
                                            },

                                        },
                                        {
                                            $unwind: "$project_setting"
                                        },
                                        {
                                            $project: {
                                                project_rth: "$project_setting.settings.timecard.rth_oth_dth.regular_time",
                                                project_dth: "$project_setting.settings.timecard.rth_oth_dth.double_time",
                                                project_oth: "$project_setting.settings.timecard.rth_oth_dth.weekly_over_time",
                                                project_name: 1,
                                            }
                                        }
                                    ],
                                    as: "project_rth_oth_dth"
                                },
                            },
                            {
                                $unwind: "$project_rth_oth_dth"
                            },
                            {
                                $project: {
                                    _id: 1,
                                    timecard_clock_in: 1,
                                    timecard_location_id: 1,
                                    timecard_clockin_lat: 1,
                                    timecard_clockin_lng: 1,
                                    employee_name: 1,
                                    location_name: 1,
                                    timecard_clock_out: 1,
                                    timecard_clockout_lat: 1,
                                    timecard_clockout_lng: 1,
                                    timecard_break_in: 1,
                                    timecard_breakin_lat: 1,
                                    timecard_breakin_lng: 1,
                                    timecard_break_out: 1,
                                    timecard_breakout_lat: 1,
                                    timecard_breakout_lng: 1,
                                    timecard_status: 1,
                                    timecard_clock_in_picture: 1,
                                    timecard_clock_out_picture: 1,
                                    timecard_project_id: 1,
                                    timecard_questions: 1,
                                    timecard_signaure: 1,
                                    timecard_note: 1,
                                    project_id: 1,
                                    project_name: 1,
                                    timecard_cost_code_id: 1,
                                    rth: dayRTH,
                                    oth: dayOTH,
                                    dth: dayDTH,
                                    dayWork: dayWork,
                                    timecard_created_at: 1,
                                    timecard_created_by: 1,
                                    timecard_updated_at: 1,
                                    timecard_updated_by: 1,
                                    timecard_type: 1,
                                    project: "$project"
                                }
                            }
                        ],
                        as: "timecard"
                    }
                }
            ]);
            res.send({ data: all_user, message: "data", status: true });
        } catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};



var timecard_historySchema = require('./../../../../../model/history/timecard_history');
let historyCollectionConstant = require('./../../../../../config/historyCollectionConstant');

async function addTimecard_History(action, data, decodedToken) {
    let connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        let timecard_historyCollection = connection_db_api.model(historyCollectionConstant.TIMECARD_HISTORY, timecard_historySchema);
        data.action = action;
        data.created_at = Math.round(new Date().getTime() / 1000);
        data.created_by = decodedToken.UserData._id;
        let save_timecard_histories = new timecard_historyCollection(data);
        save_timecard_histories.save();
    } catch (e) {
        console.log("=====Timecard  History ERROR=========", e);
    } finally {
        ///connection_db_api.close();
    }
}