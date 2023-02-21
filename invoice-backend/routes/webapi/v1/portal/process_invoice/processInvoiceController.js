var processInvoiceSchema = require('./../../../../../model/process_invoice');
var invoiceSchema = require('./../../../../../model/invoice');
var managementInvoiceSchema = require('./../../../../../model/management_invoice');
var managementPOSchema = require('./../../../../../model/management_po');
var vendorSchema = require('./../../../../../model/vendor');
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
                // console.log("insert_data: ", insert_data);
                if (insert_data) {
                    let apiObj = [];
                    for (let i = 0; i < insert_data.length; i++) {
                        apiObj.push({
                            document_id: insert_data[i]._id,
                            document_url: insert_data[i].pdf_url,
                        });
                    }
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

module.exports.importManagementInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let managementInvoiceCollection = connection_db_api.model(collectionConstant.MANAGEMENT_INVOICE, managementInvoiceSchema);
            let temp_invoices = await invoiceProcessCollection.find({ is_delete: 0 });
            let tempIds = [];
            temp_invoices.forEach((data) => {
                if (data.management_invoice_id != null && data.management_invoice_id != undefined && data.management_invoice_id != '') {
                    tempIds.push(ObjectID(data.management_invoice_id));
                }
            });
            let query;
            if (tempIds.length == 0) {
                query = { is_delete: 0 };
            } else {
                query = { is_delete: 0, _id: { $nin: tempIds } };
            }
            console.log("query: ", query);
            let invoices = await managementInvoiceCollection.find(query);
            let saveObj = [];
            for (let i = 0; i < invoices.length; i++) {
                saveObj.push({
                    management_invoice_id: invoices[i]._id,
                    pdf_url: invoices[i].pdf_url,
                    created_by: decodedToken.UserData._id,
                    created_at: Math.round(new Date().getTime() / 1000),
                    updated_by: decodedToken.UserData._id,
                    updated_at: Math.round(new Date().getTime() / 1000),
                });
            }
            let insert_data = await invoiceProcessCollection.insertMany(saveObj);
            if (insert_data) {
                let apiObj = [];
                for (let i = 0; i < insert_data.length; i++) {
                    apiObj.push({
                        document_id: insert_data[i]._id,
                        document_url: insert_data[i].pdf_url,
                    });
                }
                await sendInvoiceForProcess(apiObj);
                res.send({ message: 'Management Invoice imported successfully.', data: apiObj, status: true });
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

module.exports.importManagementPO = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let managementPOCollection = connection_db_api.model(collectionConstant.MANAGEMENT_PO, managementPOSchema);
            let temp_pos = await invoiceProcessCollection.find({ is_delete: 0 });
            let tempIds = [];
            temp_pos.forEach((data) => {
                if (data.management_po_id != null && data.management_po_id != undefined && data.management_po_id != '') {
                    tempIds.push(ObjectID(data.management_po_id));
                }
            });
            let query;
            if (tempIds.length == 0) {
                query = { is_delete: 0 };
            } else {
                query = { is_delete: 0, _id: { $nin: tempIds } };
            }
            let pos = await managementPOCollection.find(query);
            let saveObj = [];
            for (let i = 0; i < pos.length; i++) {
                saveObj.push({
                    management_po_id: pos[i]._id,
                    pdf_url: pos[i].po_url,
                    created_by: decodedToken.UserData._id,
                    created_at: Math.round(new Date().getTime() / 1000),
                    updated_by: decodedToken.UserData._id,
                    updated_at: Math.round(new Date().getTime() / 1000),
                });
            }
            let insert_data = await invoiceProcessCollection.insertMany(saveObj);
            if (insert_data) {
                let apiObj = [];
                for (let i = 0; i < insert_data.length; i++) {
                    apiObj.push({
                        document_id: insert_data[i]._id,
                        document_url: insert_data[i].pdf_url,
                    });
                }
                await sendInvoiceForProcess(apiObj);
                res.send({ message: 'Management PO imported successfully.', data: apiObj, status: true });
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
        request(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
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
            var queryString = `?customer_id=${decodedToken.companycode.toLowerCase()}`;
            for (let i = 0; i < get_invoice.length; i++) {
                queryString += `&document_id=${get_invoice[i]._id}`;
            }
            // queryString = '?customer_id=r-988514&document_id=63ef5856916b4b2d74acb59a';
            console.log("queryString: ", queryString);

            let get_data = await common.sendInvoiceForProcess(queryString);
            if (get_data.status) {
                for (const key in get_data.data) {
                    if (get_data.data[key] != null) {
                        for (let j = 0; j < get_data.data[key].length; j++) {
                            let documentType = get_data.data[key][j].document_type;
                            console.log("DOCUMENT TYPE :************", documentType);
                            if (documentType == 'INVOICE') {
                                var pages = get_data.data[key][j].document_pages;
                                var relatedDocuments = get_data.data[key][j].related_documents;

                                // Make invoice object
                                let invoiceObject = {
                                    assign_to: '',
                                    vendor: '',
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
                                    pdf_url: get_data.data[key][j].document_url,
                                    items: [],
                                    created_by: decodedToken.UserData._id,
                                    created_at: Math.round(new Date().getTime() / 1000),
                                    updated_by: decodedToken.UserData._id,
                                    updated_at: Math.round(new Date().getTime() / 1000),
                                    badge: {},
                                };
                                let items = [];
                                let invoiceIsDuplicate = false;
                                // Find invoice data
                                for (let i = 0; i < pages.length; i++) {
                                    let invoice_no = '';
                                    if (pages[i].fields.INVOICE_NUMBER != null) {
                                        invoice_no = pages[i].fields.INVOICE_NUMBER;
                                        invoiceObject.badge.invoice = true;
                                    }
                                    if (pages[i].fields.VENDOR_NAME != null) {
                                        let tmpVendor = await getAndCheckVendor(pages[i].fields.VENDOR_NAME.replace(/\n/g, " "), invoice_no, connection_db_api);
                                        if (tmpVendor.status) {
                                            if (tmpVendor.duplicate) {
                                                invoiceIsDuplicate = true;
                                            } else {
                                                invoiceObject.vendor = tmpVendor.data._id;
                                                invoiceObject.badge.vendor = true;
                                            }
                                        }
                                    }
                                    if (invoiceObject.vendor != '') {
                                        invoiceObject.invoice = invoice_no;
                                        if (pages[i].fields.INVOICE_DATE != null) {
                                            invoiceObject.invoice_date = pages[i].fields.INVOICE_DATE;
                                            invoiceObject.badge.invoice_date = true;
                                        }
                                        if (pages[i].fields.ORDER_DATE != null) {
                                            invoiceObject.order_date = pages[i].fields.ORDER_DATE;
                                            invoiceObject.badge.order_date = true;
                                        }
                                        if (pages[i].fields.PO_NUMBER != null) {
                                            invoiceObject.p_o = pages[i].fields.PO_NUMBER;
                                            invoiceObject.badge.p_o = true;
                                        }
                                        /* if (pages[i].fields.INVOICE_TO != null) {
                                            invoiceObject.invoice = pages[i].fields.INVOICE_TO;
                                            invoiceObject.   badge.vendor=true
                                        }
                                        if (pages[i].fields.ADDRESS != null) {
                                            invoiceObject.invoice = pages[i].fields.ADDRESS;
                                            invoiceObject.   badge.vendor=true
                                        } */
                                        if (pages[i].fields.SUBTOTAL != null) {
                                            invoiceObject.sub_total = pages[i].fields.SUBTOTAL;
                                            invoiceObject.badge.sub_total = true;
                                        }
                                        if (pages[i].fields.TOTAL != null) {
                                            invoiceObject.total = pages[i].fields.TOTAL;
                                            invoiceObject.badge.total = true;
                                        }
                                        if (pages[i].fields.TAX != null) {
                                            invoiceObject.tax_amount = pages[i].fields.TAX;
                                            invoiceObject.badge.tax_amount = true;
                                        }
                                        if (pages[i].fields.INVOICE_TOTAL != null) {
                                            invoiceObject.invoice_total = pages[i].fields.INVOICE_TOTAL;
                                            invoiceObject.badge.invoice_total = true;
                                        }

                                        /* if (pages[i].fields.VENDOR_ADDRESS != null) {
                                            invoiceObject.invoice = pages[i].fields.VENDOR_ADDRESS;
                                        }
                                        if (pages[i].fields.VENDOR_PHONE != null) {
                                            invoiceObject.invoice = pages[i].fields.VENDOR_PHONE;
                                        } */
                                        if (pages[i].fields.JOB_NUMBER != null) {
                                            invoiceObject.job_number = pages[i].fields.JOB_NUMBER;
                                            invoiceObject.badge.job_number = true;
                                        }
                                        if (pages[i].fields.DELIVERY_ADDRESS != null) {
                                            invoiceObject.delivery_address = pages[i].fields.DELIVERY_ADDRESS;
                                            invoiceObject.badge.delivery_address = true;
                                        }
                                        if (pages[i].fields.TERMS != null) {
                                            invoiceObject.terms = pages[i].fields.TERMS;
                                            invoiceObject.badge.terms = true;
                                        }
                                        if (pages[i].fields.DUE_DATE != null) {
                                            invoiceObject.due_date = pages[i].fields.DUE_DATE;
                                            invoiceObject.badge.due_date = true;
                                        }
                                        if (pages[i].fields.SHIP_DATE != null) {
                                            invoiceObject.ship_date = pages[i].fields.SHIP_DATE;
                                            invoiceObject.badge.ship_date = true;
                                        }
                                        if (pages[i].fields.CONTRACT_NUMBER != null) {
                                            invoiceObject.contract_number = pages[i].fields.CONTRACT_NUMBER;
                                            invoiceObject.badge.contract_number = true;
                                        }
                                        if (pages[i].fields.DISCOUNT != null) {
                                            invoiceObject.discount = pages[i].fields.DISCOUNT;
                                            invoiceObject.badge.discount = true;
                                        }
                                        if (pages[i].fields.ACCOUNT_NUMBER != null) {
                                            invoiceObject.account_number = pages[i].fields.ACCOUNT_NUMBER;
                                            invoiceObject.badge.account_number = true;
                                        }
                                        if (pages[i].expense_groups.length > 0) {
                                            if (pages[i].expense_groups[0].length > 0) {
                                                for (let k = 0; k < pages[i].expense_groups[0].length; k++) {
                                                    let item = pages[i].expense_groups[0][k];
                                                    items.push({
                                                        item: item.ITEM == null ? '' : item.ITEM,
                                                        product_code: item.PRODUCT_CODE == null ? '' : item.PRODUCT_CODE,
                                                        unit_price: item.UNIT_PRICE == null ? '' : item.UNIT_PRICE,
                                                        quantity: item.QUANTITY == null ? '' : item.QUANTITY,
                                                        price: item.PRICE == null ? '' : item.PRICE,
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                                // Check if invoice is duplicate and invoice vendor is available or not
                                if (!invoiceIsDuplicate && invoiceObject.vendor != '') {
                                    invoiceObject.items = items;
                                    let add_invoice = new invoiceCollection(invoiceObject);
                                    let save_invoice = await add_invoice.save();

                                    // Set process data and invoice process data to complete
                                    let updateInvoiceProcessObject = {
                                        invoice_id: save_invoice._id,
                                        status: 'Complete',
                                        document_type: get_data.data[key][j].document_type,
                                        process_data: get_data.data[key][j],
                                    };
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(key) }, updateInvoiceProcessObject);

                                    // Related documents
                                    for (let i = 0; i < relatedDocuments.length; i++) {
                                        // Check document id is available or not
                                        let get_related_doc = await invoiceProcessCollection.findOne({ _id: ObjectID(relatedDocuments[i].document_id) });
                                        if (get_related_doc) {
                                            let related_document_type = relatedDocuments[i].document_type;
                                            let related_doc_pages = relatedDocuments[i].document_pages;
                                            if (related_document_type == 'PACKING_SLIP') {
                                                // Set process data and related document process data to complete
                                                let updateRelatedDocObj = {
                                                    status: 'Complete',
                                                    document_type: related_document_type,
                                                    process_data: relatedDocuments[i],
                                                };
                                                await invoiceProcessCollection.updateOne({ _id: ObjectID(relatedDocuments[i].document_id) }, updateRelatedDocObj);
                                                // Make packing slip Object
                                                let packing_slip_obj = {
                                                    pdf_url: relatedDocuments[i].document_url,
                                                    document_id: relatedDocuments[i].document_id,
                                                    document_type: relatedDocuments[i].document_type,
                                                    date: "",
                                                    invoice_number: invoiceObject.invoice,
                                                    po_number: "",
                                                    ship_to_address: "",
                                                    vendor: ObjectID(invoiceObject.vendor),
                                                    received_by: "",
                                                    badge: {
                                                        invoice_number: true,
                                                        vendor: true
                                                    }
                                                };
                                                if (related_doc_pages[0].fields.DATE != null) {
                                                    packing_slip_obj.date = related_doc_pages[0].fields.DATE;
                                                    packing_slip_obj.badge.date = true;
                                                }
                                                if (related_doc_pages[0].fields.PO_NUMBER != null) {
                                                    packing_slip_obj.po_number = related_doc_pages[0].fields.PO_NUMBER;
                                                    packing_slip_obj.badge.po_number = true;
                                                }
                                                if (related_doc_pages[0].fields.SHIP_TO_ADDRESS != null) {
                                                    packing_slip_obj.ship_to_address = related_doc_pages[0].fields.SHIP_TO_ADDRESS;
                                                    packing_slip_obj.badge.ship_to_address = true;
                                                }
                                                if (related_doc_pages[0].fields.RECEIVED_BY != null) {
                                                    packing_slip_obj.received_by = related_doc_pages[0].fields.RECEIVED_BY;
                                                    packing_slip_obj.badge.received_by = true;
                                                }
                                                // Update packing slip to invoice
                                                let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(save_invoice._id) }, { has_packing_slip: true, packing_slip_data: packing_slip_obj });
                                            } else if (related_document_type == 'PURCHASE_ORDER') {
                                                // Set process data and related document process data to complete
                                                let updateRelatedDocObj = {
                                                    status: 'Complete',
                                                    document_type: related_document_type,
                                                    process_data: relatedDocuments[i],
                                                };
                                                await invoiceProcessCollection.updateOne({ _id: ObjectID(relatedDocuments[i].document_id) }, updateRelatedDocObj);
                                                // Make packing slip Object
                                                let po_obj = {
                                                    pdf_url: relatedDocuments[i].document_url,
                                                    document_id: relatedDocuments[i].document_id,
                                                    document_type: relatedDocuments[i].document_type,
                                                    date: "",
                                                    po_number: "",
                                                    customer_id: "",
                                                    terms: "",
                                                    delivery_date: "",
                                                    delivery_address: "",
                                                    due_date: "",
                                                    quote_number: "",
                                                    contract_number: "",
                                                    vendor_id: "",
                                                    vendor: "",
                                                    sub_total: "",
                                                    tax: "",
                                                    po_total: "",
                                                    items: [],
                                                    badge: {}
                                                };
                                                let tmpVendor = await getAndCheckVendorPO(related_doc_pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), connection_db_api);
                                                if (tmpVendor.status) {
                                                    po_obj.vendor = ObjectID(tmpVendor.data._id);
                                                    po_obj.badge.vendor = true;
                                                }
                                                if (po_obj.vendor != '') {
                                                    if (related_doc_pages[0].fields.PO_CREATE_DATE != null) {
                                                        po_obj.date = related_doc_pages[0].fields.PO_CREATE_DATE;
                                                        po_obj.badge.date = true;
                                                    }
                                                    if (related_doc_pages[0].fields.PO_NUMBER != null) {
                                                        po_obj.po_number = related_doc_pages[0].fields.PO_NUMBER;
                                                        po_obj.badge.po_number = true;
                                                    }
                                                    if (related_doc_pages[0].fields.CUSTOMER_ID != null) {
                                                        po_obj.customer_id = related_doc_pages[0].fields.CUSTOMER_ID;
                                                        po_obj.badge.customer_id = true;
                                                    }
                                                    if (related_doc_pages[0].fields.TERMS != null) {
                                                        po_obj.terms = related_doc_pages[0].fields.TERMS;
                                                        po_obj.badge.terms = true;
                                                    }
                                                    if (related_doc_pages[0].fields.DELIVERY_DATE != null) {
                                                        po_obj.delivery_date = related_doc_pages[0].fields.DELIVERY_DATE;
                                                        po_obj.badge.delivery_date = true;
                                                    }
                                                    if (related_doc_pages[0].fields.DELIVERY_ADDRESS != null) {
                                                        po_obj.delivery_address = related_doc_pages[0].fields.DELIVERY_ADDRESS;
                                                        po_obj.badge.delivery_address = true;
                                                    }
                                                    if (related_doc_pages[0].fields.DUE_DATE != null) {
                                                        po_obj.due_date = related_doc_pages[0].fields.DUE_DATE;
                                                        po_obj.badge.due_date = true;
                                                    }
                                                    if (related_doc_pages[0].fields.QUOTE_NUMBER != null) {
                                                        po_obj.quote_number = related_doc_pages[0].fields.QUOTE_NUMBER;
                                                        po_obj.badge.quote_number = true;
                                                    }
                                                    if (related_doc_pages[0].fields.CONTRACT_NUMBER != null) {
                                                        po_obj.contract_number = related_doc_pages[0].fields.CONTRACT_NUMBER;
                                                        po_obj.badge.contract_number = true;
                                                    }
                                                    if (related_doc_pages[0].fields.VENDOR_ID != null) {
                                                        po_obj.vendor_id = related_doc_pages[0].fields.VENDOR_ID;
                                                        po_obj.badge.vendor_id = true;
                                                    }
                                                    if (related_doc_pages[0].fields.SUBTOTAL != null) {
                                                        po_obj.sub_total = related_doc_pages[0].fields.SUBTOTAL;
                                                        po_obj.badge.sub_total = true;
                                                    }
                                                    if (related_doc_pages[0].fields.TAX != null) {
                                                        po_obj.tax = related_doc_pages[0].fields.TAX;
                                                        po_obj.badge.tax = true;
                                                    }
                                                    if (related_doc_pages[0].fields.PURCHASE_ORDER_TOTAL != null) {
                                                        po_obj.po_total = related_doc_pages[0].fields.PURCHASE_ORDER_TOTAL;
                                                        po_obj.badge.po_total = true;
                                                    }

                                                    let items = [];
                                                    if (related_doc_pages[0].expense_groups.length > 0) {
                                                        if (related_doc_pages[0].expense_groups[0].length > 0) {
                                                            for (let k = 0; k < related_doc_pages[0].expense_groups[0].length; k++) {
                                                                let item = related_doc_pages[0].expense_groups[0][k];
                                                                items.push({
                                                                    item: item.ITEM == null ? '' : item.ITEM,
                                                                    product_code: item.PRODUCT_CODE == null ? '' : item.PRODUCT_CODE,
                                                                    unit_price: item.UNIT_PRICE == null ? '' : item.UNIT_PRICE,
                                                                    quantity: item.QUANTITY == null ? '' : item.QUANTITY,
                                                                    price: item.PRICE == null ? '' : item.PRICE,
                                                                });
                                                            }
                                                        }
                                                    }
                                                    po_obj.items = items;
                                                    // Update po to invoice
                                                    let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(save_invoice._id) }, { has_po: true, po_data: po_obj });
                                                }
                                            } else if (related_document_type == 'QUOTE') {
                                                // Set process data and related document process data to complete
                                                let updateRelatedDocObj = {
                                                    status: 'Complete',
                                                    document_type: related_document_type,
                                                    process_data: relatedDocuments[i],
                                                };
                                                await invoiceProcessCollection.updateOne({ _id: ObjectID(relatedDocuments[i].document_id) }, updateRelatedDocObj);
                                                // Make packing slip Object
                                                let quote_obj = {
                                                    pdf_url: relatedDocuments[i].document_url,
                                                    document_id: relatedDocuments[i].document_id,
                                                    document_type: relatedDocuments[i].document_type,
                                                    date: "",
                                                    quote_number: "",
                                                    customer_id: "",
                                                    terms: "",
                                                    address: "",
                                                    vendor: "",
                                                    shipping_method: "",
                                                    sub_total: "",
                                                    tax: "",
                                                    quote_total: "",
                                                    receiver_phone: "",
                                                    items: [],
                                                    badge: {}
                                                };
                                                let tmpVendor = await getAndCheckVendorPO(related_doc_pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), connection_db_api);
                                                if (tmpVendor.status) {
                                                    quote_obj.vendor = ObjectID(tmpVendor.data._id);
                                                    quote_obj.badge.vendor = true;
                                                }
                                                if (quote_obj.vendor != '') {
                                                    if (related_doc_pages[0].fields.QUOTE_DATE != null) {
                                                        quote_obj.date = related_doc_pages[0].fields.QUOTE_DATE;
                                                        quote_obj.badge.date = true;
                                                    }
                                                    if (related_doc_pages[0].fields.QUOTE_NUMBER != null) {
                                                        quote_obj.quote_number = related_doc_pages[0].fields.QUOTE_NUMBER;
                                                        quote_obj.badge.quote_number = true;
                                                    }
                                                    if (related_doc_pages[0].fields.TERMS != null) {
                                                        quote_obj.terms = related_doc_pages[0].fields.TERMS;
                                                        quote_obj.badge.terms = true;
                                                    }
                                                    if (related_doc_pages[0].fields.ADDRESS != null) {
                                                        quote_obj.address = related_doc_pages[0].fields.ADDRESS;
                                                        quote_obj.badge.address = true;
                                                    }
                                                    if (related_doc_pages[0].fields.SHIPPING_METHOD != null) {
                                                        quote_obj.shipping_method = related_doc_pages[0].fields.SHIPPING_METHOD;
                                                        quote_obj.badge.shipping_method = true;
                                                    }
                                                    if (related_doc_pages[0].fields.SUB_TOTAL != null) {
                                                        quote_obj.sub_total = related_doc_pages[0].fields.SUB_TOTAL;
                                                        quote_obj.badge.sub_total = true;
                                                    }
                                                    if (related_doc_pages[0].fields.TAX != null) {
                                                        quote_obj.tax = related_doc_pages[0].fields.TAX;
                                                        quote_obj.badge.tax = true;
                                                    }
                                                    if (related_doc_pages[0].fields.QUOTE_ORDER_TOTAL != null) {
                                                        quote_obj.quote_total = related_doc_pages[0].fields.QUOTE_ORDER_TOTAL;
                                                        quote_obj.badge.quote_total = true;
                                                    }
                                                    if (related_doc_pages[0].fields.RECEIVER_PHONE != null) {
                                                        quote_obj.receiver_phone = related_doc_pages[0].fields.RECEIVER_PHONE;
                                                        quote_obj.badge.receiver_phone = true;
                                                    }

                                                    let items = [];
                                                    if (related_doc_pages[0].expense_groups.length > 0) {
                                                        if (related_doc_pages[0].expense_groups[0].length > 0) {
                                                            for (let k = 0; k < related_doc_pages[0].expense_groups[0].length; k++) {
                                                                let item = related_doc_pages[0].expense_groups[0][k];
                                                                items.push({
                                                                    item: item.ITEM == null ? '' : item.ITEM,
                                                                    product_code: item.PRODUCT_CODE == null ? '' : item.PRODUCT_CODE,
                                                                    unit_price: item.UNIT_PRICE == null ? '' : item.UNIT_PRICE,
                                                                    quantity: item.QUANTITY == null ? '' : item.QUANTITY,
                                                                    price: item.PRICE == null ? '' : item.PRICE,
                                                                });
                                                            }
                                                        }
                                                    }
                                                    quote_obj.items = items;
                                                    // Update po to invoice
                                                    let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(save_invoice._id) }, { has_quote: true, quote_data: quote_obj });
                                                }
                                            }
                                        }
                                    }
                                }
                            } else if (documentType == 'PACKING_SLIP') {
                                var pages = get_data.data[key][j].document_pages;
                                var relatedDocuments = get_data.data[key][j].related_documents;

                                // Check document id is available or not
                                let get_related_doc = await invoiceProcessCollection.findOne({ _id: ObjectID(get_data.data[key][j].document_id) });
                                // If document is there then process data
                                if (get_related_doc) {
                                    // Set process data and related document process data to complete
                                    let updatePackingSlipObj = {
                                        invoice_id: '',
                                        status: 'Process',
                                        document_type: documentType,
                                        process_data: get_data.data[key][j],
                                    };
                                    // Check document has related invoice or not
                                    let related_invoice = await getRelatedInvoiceOfDocument(relatedDocuments, connection_db_api);
                                    if (related_invoice.status) {
                                        updatePackingSlipObj.invoice_id = related_invoice.data._id;
                                        updatePackingSlipObj.status = 'Complete';
                                        // Make packing slip Object
                                        let packing_slip_obj = {
                                            pdf_url: get_data.data[key][j].document_url,
                                            document_id: get_data.data[key][j].document_id,
                                            document_type: get_data.data[key][j].document_type,
                                            date: "",
                                            invoice_number: "",
                                            po_number: "",
                                            ship_to_address: "",
                                            vendor: "",
                                            received_by: "",
                                            badge: {}
                                        };
                                        let invoice_no = '';
                                        if (pages[0].fields.INVOICE_NUMBER != null) {
                                            invoice_no = pages[0].fields.INVOICE_NUMBER;
                                            packing_slip_obj.badge.invoice_number = true;
                                        }
                                        if (pages[0].fields.VENDOR_NAME != null) {
                                            let tmpVendor = await getAndCheckVendor(pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), invoice_no, connection_db_api);
                                            if (tmpVendor.status) {
                                                packing_slip_obj.vendor = ObjectID(tmpVendor.data._id);
                                                packing_slip_obj.badge.vendor = true;
                                            }
                                        }
                                        if (packing_slip_obj.vendor != '') {
                                            if (pages[0].fields.DATE != null) {
                                                packing_slip_obj.date = pages[0].fields.DATE;
                                                packing_slip_obj.badge.date = true;
                                            }
                                            packing_slip_obj.invoice_number = invoice_no;
                                            if (pages[0].fields.PO_NUMBER != null) {
                                                packing_slip_obj.po_number = pages[0].fields.PO_NUMBER;
                                                packing_slip_obj.badge.po_number = true;
                                            }
                                            if (pages[0].fields.SHIP_TO_ADDRESS != null) {
                                                packing_slip_obj.ship_to_address = pages[0].fields.SHIP_TO_ADDRESS;
                                                packing_slip_obj.badge.ship_to_address = true;
                                            }
                                            if (pages[0].fields.RECEIVED_BY != null) {
                                                packing_slip_obj.received_by = pages[0].fields.RECEIVED_BY;
                                                packing_slip_obj.badge.received_by = true;
                                            }
                                            // Update packing slip to invoice
                                            let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(updatePackingSlipObj.invoice_id) }, { has_packing_slip: true, packing_slip_data: packing_slip_obj });
                                        }
                                    }
                                    // Update packing slip object
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(get_related_doc._id) }, updatePackingSlipObj);
                                }
                            } else if (documentType == 'PURCHASE_ORDER') {
                                var pages = get_data.data[key][j].document_pages;
                                var relatedDocuments = get_data.data[key][j].related_documents;

                                // Check document id is available or not
                                let get_related_doc = await invoiceProcessCollection.findOne({ _id: ObjectID(get_data.data[key][j].document_id) });
                                console.log("get_related_doc", get_related_doc);
                                // If document is there then process data
                                if (get_related_doc) {
                                    // Set process data and related document process data to complete
                                    let updatePOObj = {
                                        invoice_id: '',
                                        status: 'Process',
                                        document_type: documentType,
                                        process_data: get_data.data[key][j],
                                    };
                                    // Check document has related invoice or not
                                    let related_invoice = await getRelatedInvoiceOfDocument(relatedDocuments, connection_db_api);
                                    console.log("related_invoice: ********", related_invoice.status);
                                    if (related_invoice.status) {
                                        updatePOObj.invoice_id = related_invoice.data._id;
                                        updatePOObj.status = 'Complete';
                                        // Make packing slip Object
                                        let po_obj = {
                                            pdf_url: get_data.data[key][j].document_url,
                                            document_id: get_data.data[key][j].document_id,
                                            document_type: get_data.data[key][j].document_type,
                                            date: "",
                                            po_number: "",
                                            customer_id: "",
                                            terms: "",
                                            delivery_date: "",
                                            delivery_address: "",
                                            due_date: "",
                                            quote_number: "",
                                            contract_number: "",
                                            vendor_id: "",
                                            vendor: "",
                                            sub_total: "",
                                            tax: "",
                                            po_total: "",
                                            items: [],
                                            badge: {}
                                        };
                                        if (pages[0].fields.VENDOR_NAME != null) {
                                            let tmpVendor = await getAndCheckVendorPO(pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), connection_db_api);
                                            if (tmpVendor.status) {
                                                po_obj.vendor = ObjectID(tmpVendor.data._id);
                                                po_obj.badge.vendor = true;
                                            }
                                        }
                                        if (po_obj.vendor != '') {
                                            if (pages[0].fields.PO_CREATE_DATE != null) {
                                                po_obj.date = pages[0].fields.PO_CREATE_DATE;
                                                po_obj.badge.date = true;
                                            }
                                            if (pages[0].fields.PO_NUMBER != null) {
                                                po_obj.po_number = pages[0].fields.PO_NUMBER;
                                                po_obj.badge.po_number = true;
                                            }
                                            if (pages[0].fields.CUSTOMER_ID != null) {
                                                po_obj.customer_id = pages[0].fields.CUSTOMER_ID;
                                                po_obj.badge.customer_id = true;
                                            }
                                            if (pages[0].fields.TERMS != null) {
                                                po_obj.terms = pages[0].fields.TERMS;
                                                po_obj.badge.terms = true;
                                            }
                                            if (pages[0].fields.DELIVERY_DATE != null) {
                                                po_obj.delivery_date = pages[0].fields.DELIVERY_DATE;
                                                po_obj.badge.delivery_date = true;
                                            }
                                            if (pages[0].fields.DELIVERY_ADDRESS != null) {
                                                po_obj.delivery_address = pages[0].fields.DELIVERY_ADDRESS;
                                                po_obj.badge.delivery_address = true;
                                            }
                                            if (pages[0].fields.DUE_DATE != null) {
                                                po_obj.due_date = pages[0].fields.DUE_DATE;
                                                po_obj.badge.due_date = true;
                                            }
                                            if (pages[0].fields.QUOTE_NUMBER != null) {
                                                po_obj.quote_number = pages[0].fields.QUOTE_NUMBER;
                                                po_obj.badge.quote_number = true;
                                            }
                                            if (pages[0].fields.CONTRACT_NUMBER != null) {
                                                po_obj.contract_number = pages[0].fields.CONTRACT_NUMBER;
                                                po_obj.badge.contract_number = true;
                                            }
                                            if (pages[0].fields.VENDOR_ID != null) {
                                                po_obj.vendor_id = pages[0].fields.VENDOR_ID;
                                                po_obj.badge.vendor_id = true;
                                            }
                                            if (pages[0].fields.SUBTOTAL != null) {
                                                po_obj.sub_total = pages[0].fields.SUBTOTAL;
                                                po_obj.badge.sub_total = true;
                                            }
                                            if (pages[0].fields.TAX != null) {
                                                po_obj.tax = pages[0].fields.TAX;
                                                po_obj.badge.tax = true;
                                            }
                                            if (pages[0].fields.PURCHASE_ORDER_TOTAL != null) {
                                                po_obj.po_total = pages[0].fields.PURCHASE_ORDER_TOTAL;
                                                po_obj.badge.po_total = true;
                                            }

                                            let items = [];
                                            if (pages[0].expense_groups.length > 0) {
                                                if (pages[0].expense_groups[0].length > 0) {
                                                    for (let k = 0; k < pages[0].expense_groups[0].length; k++) {
                                                        let item = pages[0].expense_groups[0][k];
                                                        items.push({
                                                            item: item.ITEM == null ? '' : item.ITEM,
                                                            product_code: item.PRODUCT_CODE == null ? '' : item.PRODUCT_CODE,
                                                            unit_price: item.UNIT_PRICE == null ? '' : item.UNIT_PRICE,
                                                            quantity: item.QUANTITY == null ? '' : item.QUANTITY,
                                                            price: item.PRICE == null ? '' : item.PRICE,
                                                        });
                                                    }
                                                }
                                            }
                                            po_obj.items = items;
                                            console.log("po_obj", po_obj);
                                            // Update packing slip to invoice
                                            let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(updatePOObj.invoice_id) }, { has_po: true, po_data: po_obj });
                                        }
                                    }
                                    // Update packing slip object
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(get_related_doc._id) }, updatePOObj);
                                }
                            } else if (documentType == 'QUOTE') {
                                var pages = get_data.data[key][j].document_pages;
                                var relatedDocuments = get_data.data[key][j].related_documents;

                                // Check document id is available or not
                                let get_related_doc = await invoiceProcessCollection.findOne({ _id: ObjectID(get_data.data[key][j].document_id) });
                                // If document is there then process data
                                if (get_related_doc) {
                                    // Set process data and related document process data to complete
                                    let updateQuoteObj = {
                                        invoice_id: '',
                                        status: 'Process',
                                        document_type: documentType,
                                        process_data: get_data.data[key][j],
                                    };
                                    // Check document has related invoice or not
                                    let related_invoice = await getRelatedInvoiceOfDocument(relatedDocuments, connection_db_api);
                                    if (related_invoice.status) {
                                        updateQuoteObj.invoice_id = related_invoice.data._id;
                                        updateQuoteObj.status = 'Complete';
                                        // Make packing slip Object
                                        let quote_obj = {
                                            pdf_url: get_data.data[key][j].document_url,
                                            document_id: get_data.data[key][j].document_id,
                                            document_type: get_data.data[key][j].document_type,
                                            date: "",
                                            quote_number: "",
                                            customer_id: "",
                                            terms: "",
                                            address: "",
                                            vendor: "",
                                            shipping_method: "",
                                            sub_total: "",
                                            tax: "",
                                            quote_total: "",
                                            receiver_phone: "",
                                            items: [],
                                            badge: {},
                                        };
                                        if (pages[0].fields.VENDOR_NAME != null) {
                                            let tmpVendor = await getAndCheckVendorPO(pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), connection_db_api);
                                            if (tmpVendor.status) {
                                                quote_obj.vendor = ObjectID(tmpVendor.data._id);
                                                quote_obj.badge.vendor = true;
                                            }
                                        }
                                        if (quote_obj.vendor != '') {
                                            if (pages[0].fields.QUOTE_DATE != null) {
                                                quote_obj.date = pages[0].fields.QUOTE_DATE;
                                                quote_obj.badge.date = true;
                                            }
                                            if (pages[0].fields.QUOTE_NUMBER != null) {
                                                quote_obj.quote_number = pages[0].fields.QUOTE_NUMBER;
                                                quote_obj.badge.quote_number = true;
                                            }
                                            if (pages[0].fields.TERMS != null) {
                                                quote_obj.terms = pages[0].fields.TERMS;
                                                quote_obj.badge.terms = true;
                                            }
                                            if (pages[0].fields.ADDRESS != null) {
                                                quote_obj.address = pages[0].fields.ADDRESS;
                                                quote_obj.badge.address = true;
                                            }
                                            if (pages[0].fields.SHIPPING_METHOD != null) {
                                                quote_obj.shipping_method = pages[0].fields.SHIPPING_METHOD;
                                                quote_obj.badge.shipping_method = true;
                                            }
                                            if (pages[0].fields.SUB_TOTAL != null) {
                                                quote_obj.sub_total = pages[0].fields.SUB_TOTAL;
                                                quote_obj.badge.sub_total = true;
                                            }
                                            if (pages[0].fields.TAX != null) {
                                                quote_obj.tax = pages[0].fields.TAX;
                                                quote_obj.badge.tax = true;
                                            }
                                            if (pages[0].fields.QUOTE_ORDER_TOTAL != null) {
                                                quote_obj.quote_total = pages[0].fields.QUOTE_ORDER_TOTAL;
                                                quote_obj.badge.quote_total = true;
                                            }
                                            if (pages[0].fields.RECEIVER_PHONE != null) {
                                                quote_obj.receiver_phone = pages[0].fields.RECEIVER_PHONE;
                                                quote_obj.badge.receiver_phone = true;
                                            }

                                            let items = [];
                                            if (pages[0].expense_groups.length > 0) {
                                                if (pages[0].expense_groups[0].length > 0) {
                                                    for (let k = 0; k < pages[0].expense_groups[0].length; k++) {
                                                        let item = pages[0].expense_groups[0][k];
                                                        items.push({
                                                            item: item.ITEM == null ? '' : item.ITEM,
                                                            product_code: item.PRODUCT_CODE == null ? '' : item.PRODUCT_CODE,
                                                            unit_price: item.UNIT_PRICE == null ? '' : item.UNIT_PRICE,
                                                            quantity: item.QUANTITY == null ? '' : item.QUANTITY,
                                                            price: item.PRICE == null ? '' : item.PRICE,
                                                        });
                                                    }
                                                }
                                            }
                                            quote_obj.items = items;
                                            console.log("quote_obj", quote_obj);
                                            // Update packing slip to invoice
                                            let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(updateQuoteObj.invoice_id) }, { has_quote: true, quote_data: quote_obj });
                                        }
                                    }
                                    // Update packing slip object
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(get_related_doc._id) }, updateQuoteObj);
                                }
                            }
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

function getAndCheckVendor(vendorName, invoice_no, connection_db_api) {
    return new Promise(async function (resolve, reject) {
        let invoiceCollection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
        let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
        let get_vendor = await vendorCollection.findOne({ vendor_name: vendorName });
        if (get_vendor) {
            let one_invoice = await invoiceCollection.findOne({ vendor: ObjectID(get_vendor._id), invoice: invoice_no });
            if (one_invoice) {
                resolve({ status: true, duplicate: true, data: get_vendor });
            } else {
                resolve({ status: true, duplicate: false, data: get_vendor });
            }
        } else {
            resolve({ status: false });
        }
    });
};

function getAndCheckVendorPO(vendorName, connection_db_api) {
    return new Promise(async function (resolve, reject) {
        let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
        let get_vendor = await vendorCollection.findOne({ vendor_name: vendorName });
        if (get_vendor) {
            resolve({ status: true, data: get_vendor });
        } else {
            resolve({ status: false });
        }
    });
};

function getRelatedInvoiceOfDocument(documents, connection_db_api) {
    return new Promise(async function (resolve, reject) {
        let invoiceCollection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
        let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
        if (documents.length == 0) {
            resolve({ status: false });
        } else {
            let hasInvoiceData = false;
            let invoiceData;
            for (let i = 0; i < documents.length; i++) {
                if (documents[i].document_type == 'INVOICE') {
                    let one_process = await invoiceProcessCollection.findOne({ _id: ObjectID(documents[i].document_id) });
                    if (one_process) {
                        let one_invoice = await invoiceCollection.findOne({ _id: one_process.invoice_id });
                        if (one_invoice) {
                            hasInvoiceData = true;
                            invoiceData = one_invoice;
                            if (i == documents.length - 1) {
                                if (hasInvoiceData) {
                                    resolve({ status: true, data: invoiceData });
                                } else {
                                    resolve({ status: false });
                                }
                            }
                        } else {
                            if (i == documents.length - 1) {
                                if (hasInvoiceData) {
                                    resolve({ status: true, data: invoiceData });
                                } else {
                                    resolve({ status: false });
                                }
                            }
                        }
                    } else {
                        if (i == documents.length - 1) {
                            if (hasInvoiceData) {
                                resolve({ status: true, data: invoiceData });
                            } else {
                                resolve({ status: false });
                            }
                        }
                    }
                } else {
                    if (i == documents.length - 1) {
                        if (hasInvoiceData) {
                            resolve({ status: true, data: invoiceData });
                        } else {
                            resolve({ status: false });
                        }
                    }
                }
            }
        }
        /* let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
        let get_vendor = await vendorCollection.findOne({ vendor_name: vendorName });
        if (get_vendor) {
            let one_invoice = await invoiceCollection.findOne({ vendor: ObjectID(get_vendor._id), invoice: invoice_no });
            if (one_invoice) {
                resolve({ status: true, duplicate: true });
            } else {
                resolve({ status: true, duplicate: false, data: get_vendor });
            }
        } else {
            resolve({ status: false });
        } */
    });
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