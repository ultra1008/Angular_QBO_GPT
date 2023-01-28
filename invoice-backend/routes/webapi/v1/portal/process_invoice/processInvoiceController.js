var processInvoiceSchema = require('./../../../../../model/process_invoice');
var invoiceSchema = require('./../../../../../model/invoice');
var userSchema = require('./../../../../../model/user');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');
var request = require('request');

module.exports.getAllProcessInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let get_data = await invoiceProcessCollection.find({ is_delete: 0 });
            res.send({ message: 'Listing', data: get_data, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.saveInvoiceProcess = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            if (requestObject._id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_process = await invoiceProcessCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_process) {
                    res.send({ message: 'Invoice process updated successfully.', data: update_process, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                let saveObj = [];
                for (let i = 0; i < requestObject.pdf_urls.length; i++) {
                    saveObj.push({
                        pdf_url: requestObject.pdf_urls[i],
                        created_by: decodedToken.UserData._id,
                        created_at: Math.round(new Date().getTime() / 1000),
                        updated_by: decodedToken.UserData._id,
                        updated_at: Math.round(new Date().getTime() / 1000),
                    });
                }
                let insert_data = await invoiceProcessCollection.insertMany(saveObj);
                console.log("insert_data: ", insert_data);
                if (insert_data) {
                    console.log("here");
                    let apiObj = [];
                    for (let i = 0; i < insert_data.length; i++) {
                        apiObj.push({
                            document_id: insert_data[i]._id,
                            document_url: insert_data[i].pdf_url,
                        });
                    }
                    console.log("before call");
                    await sendInvoiceForProcess(apiObj);
                    /* const options = {
                        'method': 'POST',
                        'url': 'http://db-invoice.rovuk.us:8000/process',
                        'headers': {
                            'Content-Type': 'application/json',
                            'X-API-KEY': '4194168a-4a32-45d9-9d7c-0a730f887e7f'
                        },
                        rejectUnauthorized: false,
                        body: JSON.stringify({ documents: apiObj })
                    };
                    console.log("process body: ", JSON.stringify({ documents: apiObj }));
                    request(options, function (err, resp, body) {
                        if (err) {
                            // reject(err);
                        } else {
                            console.log("response: ", body);
                            // resolve({ body });
                        }
                    }); */
                    res.send({ message: 'Invoice for process added successfully.', data: apiObj, status: true });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

// Call API of Send Invoice for processing
function sendInvoiceForProcess(requestObject) {
    return new Promise(function (resolve, reject) {
        console.log("api call");
        var request = require('request');
        const options = {
            'method': 'POST',
            'url': 'http://db-invoice.rovuk.us:8000/process',
            'headers': {
                'Content-Type': 'application/json',
                'X-API-KEY': '4194168a-4a32-45d9-9d7c-0a730f887e7f'
            },
            rejectUnauthorized: false,
            body: JSON.stringify({ documents: requestObject })
        };
        console.log("process body: ", JSON.stringify({ documents: requestObject }));
        request(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                console.log("response: ", body);
                resolve({ body });
            }
        });
    });
};

module.exports.importProcessData = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let invoiceCollection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            let get_invoice = await invoiceProcessCollection.find({ is_delete: 0, status: 'Pending' });
            // var queryString = `?customer_id=demo-3`;
            var queryString = `?customer_id=${decodedToken.companycode.toLowerCase()}`;
            for (let i = 0; i < get_invoice.length; i++) {
                queryString += `&document_id=${get_invoice[i]._id}`;
            }
            // queryString = '?customer_id=r-988514&document_id=63d20aa95c496b27dc5eea74';
            console.log("queryString: ", queryString);

            let get_data = await common.sendInvoiceForProcess(queryString);
            if (get_data.status) {
                // let data = [];
                for (const key in get_data.data) {
                    if (get_data.data[key] != null) {
                        let updateObject = {
                            status: 'Complete',
                            document_type: get_data.data[key][0].document_type,
                            process_data: get_data.data[key][0],
                        };
                        await invoiceProcessCollection.updateOne({ _id: ObjectID(key) }, updateObject);
                        if (updateObject.document_type == 'INVOICE') {
                            var pages = get_data.data[key][0].document_pages;
                            let invoiceObject = {
                                assign_to: '',
                                vendor_name: '',
                                vendor_id: '',
                                customer_id: '',
                                invoice: '',
                                p_o: '',
                                invoice_date: '',
                                due_date: '',
                                order_date: '',
                                ship_date: '',
                                terms: '',
                                total_to_be_paid: '',
                                tax_rate: '',
                                tax_amount: '',
                                tax_id: '',
                                sub_total: '',
                                amount_due: '',
                                cost_code: '',
                                gl_account: '',
                                receiving_date: '',
                                notes: '',
                            };
                            for (let i = 0; i < pages.length; i++) {
                                if (pages[i].fields.INVOICE_NUMBER != null) {
                                    invoiceObject.invoice = pages[i].fields.INVOICE_NUMBER;
                                }
                                if (pages[i].fields.INVOICE_DATE != null) {
                                    invoiceObject.invoice_date = pages[i].fields.INVOICE_DATE;
                                }
                                if (pages[i].fields.ORDER_DATE != null) {
                                    invoiceObject.order_date = pages[i].fields.ORDER_DATE;
                                }
                                if (pages[i].fields.PO_NUMBER != null) {
                                    invoiceObject.p_o = pages[i].fields.PO_NUMBER;
                                }
                                /* if (pages[i].fields.INVOICE_TO != null) {
                                    invoiceObject.invoice = pages[i].fields.INVOICE_TO;
                                }
                                if (pages[i].fields.ADDRESS != null) {
                                    invoiceObject.invoice = pages[i].fields.ADDRESS;
                                } */
                                if (pages[i].fields.SUBTOTAL != null) {
                                    invoiceObject.sub_total = pages[i].fields.SUBTOTAL;
                                }
                                if (pages[i].fields.TOTAL != null) {
                                    invoiceObject.total = pages[i].fields.TOTAL;
                                }
                                if (pages[i].fields.TAX != null) {
                                    invoiceObject.tax_amount = pages[i].fields.TAX;
                                }
                                if (pages[i].fields.INVOICE_TOTAL != null) {
                                    invoiceObject.invoice_total = pages[i].fields.INVOICE_TOTAL;
                                }
                                if (pages[i].fields.VENDOR_NAME != null) {
                                    invoiceObject.vendor_name = pages[i].fields.VENDOR_NAME.replace(/\n/g, " ");
                                }
                                /* if (pages[i].fields.VENDOR_ADDRESS != null) {
                                    invoiceObject.invoice = pages[i].fields.VENDOR_ADDRESS;
                                }
                                if (pages[i].fields.VENDOR_PHONE != null) {
                                    invoiceObject.invoice = pages[i].fields.VENDOR_PHONE;
                                } */
                                if (pages[i].fields.JOB_NUMBER != null) {
                                    invoiceObject.job_number = pages[i].fields.JOB_NUMBER;
                                }
                                if (pages[i].fields.DELIVERY_ADDRESS != null) {
                                    invoiceObject.delivery_address = pages[i].fields.DELIVERY_ADDRESS;
                                }
                                if (pages[i].fields.TERMS != null) {
                                    invoiceObject.terms = pages[i].fields.TERMS;
                                }
                                if (pages[i].fields.DUE_DATE != null) {
                                    invoiceObject.due_date = pages[i].fields.DUE_DATE;
                                }
                                if (pages[i].fields.SHIP_DATE != null) {
                                    invoiceObject.ship_date = pages[i].fields.SHIP_DATE;
                                }
                                if (pages[i].fields.CONTRACT_NUMBER != null) {
                                    invoiceObject.contract_number = pages[i].fields.CONTRACT_NUMBER;
                                }
                                if (pages[i].fields.DISCOUNT != null) {
                                    invoiceObject.discount = pages[i].fields.DISCOUNT;
                                }
                                if (pages[i].fields.ACCOUNT_NUMBER != null) {
                                    invoiceObject.account_number = pages[i].fields.ACCOUNT_NUMBER;
                                }
                            }
                            let add_invoice = new invoiceCollection(invoiceObject);
                            let save_invoice = await add_invoice.save();
                            console.log("invoiceObject: ", invoiceObject);
                            console.log("save_invoice: ", save_invoice);
                        }
                    }
                }
            }
            res.send({ message: 'Processed invoice imported sucessfully.', data: get_data.data, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.deleteInvoiceProcess = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let ids = [];
            requestObject.ids.forEach((id) => {
                ids.push(ObjectID(id));
            });
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let invoiceProcessObject = await invoiceProcessCollection.remove({ _id: { $in: ids } });
            if (invoiceProcessObject) {
                res.send({ message: 'Invoice process deleted.', status: true });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};