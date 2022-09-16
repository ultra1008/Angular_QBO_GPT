var validator = require('./../../../../../controller/common/validationforrequest');

const saveTemplate = (req, res, next) => {
    const validationRule = {
        "template_name": "required",
        "status": "required",
        "note": "required"
    };
    validator(req.body, validationRule, {}, (erorr, status) => {
        if (!status) {
            res.send({ status: false, erorr: erorr });
        } else {
            next();
        }

    });
};

module.exports = { saveTemplate };
