module.exports = {
    PROJECT_SETTINGS: {
        "general": {
            "date_display": {
                "mm/dd/yyyy": true,
                "dd/mm/yyyy": false,
            },
            "timezone": {
                "title": "(UTC-05:00) Eastern Time (US & Canada)",
                'value': "Eastern Standard Time",
                "offset": -4
            },
            "weather_capture": {
                "title": "Every 6 Hours",
                "value": 6,
            },
            "temperature": {
                "f": true,
                "c": false,
            },
            "wind_speed": {
                "mph": true,
                "kph": false,
            },
            "precipitation": {
                "in": true,
                "mm": false,
            },
            "report_frequency": {
                "title": "Daily",
                "value": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                ],
            },
            "is_include_survey" : true
        },
        "daily_report": {
            "weather": true,
            "timecards": {
                "all": true,
                "rollover": true,
                "employee_contractor": true,
                "hours": true,
                "timecard_notes": true,
                "payroll_notes": true
            },
            "include_all_hours": false,
            "survey_questions": true,
            "notes": true,
            "quality_control_observation": true,
            "safety_observation": true,
            "hide_empty_sections": true,
            "record_time_date": {
                "all": true,
                "pictures": true,
                "all_entries": true
            },
            "material_used": true,
            "equipment_on_site": true,
            "attachments" : true,
            "small_tools": true,
            "check_list": {
                all: true,
                "inactive": true,
                "empty": true,
                "super_daily": true,
            },
            "safety_talks": true,
            "extra_material": true,
            "task": true,
        },
        "daily_report_external" :  {
            "weather": true,
            "timecards": {
                "all": true,
                "rollover": true,
                "employee_contractor": true,
                "hours": true,
                "timecard_notes": true,
                "payroll_notes": true
            },
            "include_all_hours": false,
            "survey_questions": true,
            "notes": true,
            "quality_control_observation": true,
            "safety_observation": true,
            "hide_empty_sections": true,
            "record_time_date": {
                "all": true,
                "pictures": true,
                "all_entries": true
            },
            "material_used": true,
            "equipment_on_site": true,
            "attachments" : true,
            "small_tools": true,
            "check_list": {
                all: true,
                "inactive": true,
                "empty": true,
                "super_daily": true,
            },
            "safety_talks": true,
            "extra_material": true,
            "task": true,
        },
        "survey_question_answer": [
            { "question": "Any accidents on site today ?", "category": 1 },
            { "question": "Any schedule delays occur ?", "category": 2 },
            { "question": "Any equipment rented on site ?", "category": 3 },
            { "question": "Any visitor on site ?", "category": 4 },
            { "question": "Did weather cause any delays ?", "category": 5 }
        ],
        "email_recipients": {
            "internal": [],
            "incident" : [],
            "external": {
                "timecard": true,
                "super_daily_index": false,
                "material_quantity": true,
                "equipment": true,
                "email": []
            },
            "send_report": {
                "as_signed": true,
                "specific_time": false,
                "time": 0 //12:00 AM
            }
        },
        "timecard": {
            "track_time": {
                "manually": true,
                "start_end_time": false,
                "application": false,
                "qr_code": false
            },
            "rth_oth_dth": {
                "regular_time": 8,
                "double_time": 13,
                "weekly_over_time": 40
            }
        },
        "cost_code": [],
        "workers": []
    }
}