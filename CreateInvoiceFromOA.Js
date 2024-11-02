async function createInvFromOa(primaryControl) {
    var formContext = primaryControl;
    var OaID = formContext.getAttribute("erp_name") ? formContext.getAttribute("erp_name").getValue() : null;
    var OaCode = formContext.data.entity.getId();
    var gridControl = formContext.getControl("OAItemGrid");
    var selectedRows = gridControl.getGrid().getSelectedRows();
    console.log(OaCode);
    var CustCode = null, ContCode = null, ReqDelDate = null, SalesExec = null, CustOrd = null;

    if (selectedRows.getLength() <= 0) {
        showNoPendingRowSelected();
        document.body.style.cursor = 'default';
        return;
    }

    var PendingQty = 0;
    var validRows = [];
    var NewInvID = null;
    selectedRows.forEach(async function (selectedRow) {
        var rowData = selectedRow.getData();
        var oaQty = rowData.getEntity().attributes.getByName("erp_oaqty").getValue();
        var invQty = rowData.getEntity().attributes.getByName("erp_invoicedqty").getValue() ? rowData.getEntity().attributes.getByName("erp_invoicedqty").getValue() : 0;
        //console.log("OA Qty:" + oaQty + " InvQty :" + invQty);
        //Implement Logic for Rejection/Cancellation too

        if (invQty < oaQty) {
            PendingQty++;
            validRows.push(selectedRow);
        }
    });

    if (PendingQty == 0) {
        showNoRowSelected();
        document.body.style.cursor = 'default';
        return;
    }

    if (formContext.getAttribute("erp_customer") && formContext.getAttribute("erp_customer").getValue() !== null) {
        var CustID = formContext.getAttribute("erp_customer").getValue();
        CustCode = CustID[0].id;
    } else {
        console.error("Customer ID is null or undefined.");
    }

    if (formContext.getAttribute("erp_customercontact") && formContext.getAttribute("erp_customercontact").getValue() !== null) {
        var ContID = formContext.getAttribute("erp_customercontact").getValue();
        ContCode = ContID[0].id;
    } else {
        console.error("Contact ID is null or undefined.");
    }

    if (formContext.getAttribute("erp_salesexecutive") && formContext.getAttribute("erp_salesexecutive").getValue() !== null) {
        var SalesExecID = formContext.getAttribute("erp_salesexecutive").getValue();
        SalesExec = SalesExecID[0].id;
    } else {
        console.error("Sales Exec ID is null or undefined.");
    }

    if (formContext.getAttribute("erp_reqdeldate") && formContext.getAttribute("erp_reqdeldate").getValue() !== null) {
        ReqDelDate = formContext.getAttribute("erp_reqdeldate").getValue();
        var localToday = new Date(ReqDelDate);
        localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
        ReqDelDate = localToday.toISOString().split("T")[0];
    }

    if (formContext.getAttribute("erp_custorder") && formContext.getAttribute("erp_custorder").getValue() !== null) {
        var CustOrdID = formContext.getAttribute("erp_custorder").getValue();
        CustOrd = CustOrdID[0].id;

    } else {
        console.error("Customer Order is null or undefined.");
    }
    var cusOrdCode = CustOrd.replace(/[{}]/g, '');
    console.log("custOrd: " + cusOrdCode);

    let recordId = cusOrdCode; // Assuming cusOrdCode contains the GUID of the record
    let custOrdResult = await Xrm.WebApi.retrieveRecord("erp_order", recordId);

   
    let DelAdd1 = custOrdResult.erp_deliveryadd1;
    let DelAdd2 = custOrdResult.erp_deliveryadd2;
    let DelAdd3 = custOrdResult.erp_deliveryadd3;
    let DelCity = custOrdResult.erp_deliverycity;
    let DelState = custOrdResult.erp_deliverystate;
    let DelCountry = custOrdResult.erp_deliverycountry;
    let DelZip = custOrdResult.erp_deliveryzip;
    let DelPhone = custOrdResult.erp_deliveryphone;
    let DelInstr = custOrdResult.erp_deliveryinstruction;
    let SplInstr = custOrdResult.erp_specialinstruction;
    let DelInPart = custOrdResult.erp_deliverableinparts;


    var newRecord = {};
    if (OaCode) newRecord["erp_OrderAckRef@odata.bind"] = "/erp_orderacks(" + OaCode.replace(/[{}]/g, '') + ")";
    if (CustOrd) newRecord["erp_CustOrder@odata.bind"] = "/erp_orders(" + CustOrd.replace(/[{}]/g, '') + ")";
    if (CustCode) newRecord["erp_Customer@odata.bind"] = "/accounts(" + CustCode.replace(/[{}]/g, '') + ")";
    if (ContCode) newRecord["erp_CustContact@odata.bind"] = "/contacts(" + ContCode.replace(/[{}]/g, '') + ")";
    if (SalesExec) newRecord["erp_SalesExecutive@odata.bind"] = "/contacts(" + SalesExec.replace(/[{}]/g, '') + ")";
    if (DelAdd1) newRecord["erp_deliveryadd1"] = DelAdd1;
    if (DelAdd2) newRecord["erp_deliveryadd2"] = DelAdd2;
    if (DelAdd3) newRecord["erp_deliveryadd3"] = DelAdd3;
    if (DelCity) newRecord["erp_deliverycity"] = DelCity;
    if (DelState) newRecord["erp_deliverystate"] = DelState;
    if (DelCountry) newRecord["erp_deliverycountry"] = DelCountry;
    if (DelZip) newRecord["erp_deliveryzip"] = DelZip;
    if (DelPhone) newRecord["erp_deliveryphone"] = DelPhone;
    if (DelInstr) newRecord["erp_deliveryinstruction"] = DelInstr;
    if (SplInstr) newRecord["erp_specialinstruction"] = SplInstr;
     
    try {
        let result = await Xrm.WebApi.createRecord("erp_invoice", newRecord);
        console.log("Record created with ID: " + result.id);
        NewInvID = result.id;
    } catch (error) {
        console.error("Error creating record: ", error);
        document.body.style.cursor = 'default';
        return;
    }

      // Proceed with other logic only for valid rows
    validRows.forEach(async function (selectedRow) {
        var rowData = selectedRow.getData();
        var OAItemId = rowData.getEntity().getId().replace("{", "").replace("}", "");
       
        await createInvItems(OaCode, CustOrd, NewInvID, OAItemId);
    });
    await showAlertWithLink(NewInvID);
    await navigateToRecord("erp_invoice", NewInvID);
    document.body.style.cursor = 'default';
   
}

async function createInvItems(OAHeaderId, CustOrdID, InvHeaderId, OaItemId) {
    OAHeaderId = OAHeaderId.replace(/[{}]/g, '');
    CustOrdID = CustOrdID.replace(/[{}]/g, '');
    InvHeaderId = InvHeaderId.replace(/[{}]/g, '');
    OaItemId = OaItemId.replace(/[{}]/g, '');
    var query = `?$filter=erp_ordackitemid eq ${OaItemId}`;
    try{

        //Retrieve OAItem Records
        
        let oaItemResult = await Xrm.WebApi.retrieveMultipleRecords("erp_ordackitem", query);
        
        let recordCount = oaItemResult.entities.length;
        console.log(recordCount);
        
        //Loop through the records retrieved
        for (let record of oaItemResult.entities){
        
            let record = oaItemResult.entities[0];
            let IsCancelled = record.erp_iscancelled;
            let IsRejected = record.erp_isrejected;
            
            if (IsCancelled == true || IsRejected == true) {
                return;
            }

            //let OaItemId = OaItemId;
            let OaQty = record.erp_oaqty;
            let PrevInvQty = record.erp_invoicedqty ? record.erp_invoicedqty : 0;
            let ProductId = record._erp_productcoderefid_value.replace(/[{}]/g, '');

            let ProdName = record.erp_productname;
            let BalQty = OaQty - PrevInvQty;
            let UnitPrice = record.erp_unitprice;
            let DiscPercent = record.erp_discount;
            let TaxPercent = record.erp_tax;
            console.log("ProductCode: " + ProductId);
            let newRecord = {
                "erp_InvoiceRefID@odata.bind": "/erp_invoices(" + InvHeaderId + ")",
                "erp_OAItemRefID@odata.bind": "/erp_ordackitems(" + OaItemId + ")",
                "erp_ProductCode@odata.bind": "/erp_productmasters(" + ProductId +")",
                "erp_productname": ProdName,
                "erp_unitprice": UnitPrice,
                "erp_tax": TaxPercent,
                "erp_discount" : DiscPercent,
                "erp_oaqty" :OaQty,
                "erp_invqty": BalQty
            }

            try{
                let createResult = await Xrm.WebApi.createRecord("erp_invoiceitem", newRecord);
                console.log("Items Record created with ID: " + createResult.id);
            } catch (createError) {
                console.error("Error creating record: ", createError.message);
            }
        }
    } catch (error){
        console.error("Error retrieving OaItem records: ", error.message);
    }
}

async function showNoPendingRowSelected() {
    var alertStrings = {
        confirmButtonLabel: "OK",
        text: "Please Select At Least One Row for which Invoice is Pending",
        title: "No Item Selected from OA for Invoice"
    };
    var alertOptions = { height: 220, width: 360 };
    Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
        function success(result) {
            console.log("Alert dialog closed");
        },
        function error(error) {
            console.log(error.message);
        }
    );
}

async function showAlertWithLink(InvHeaderID) {
    var alertStrings = {
        confirmButtonLabel: "OK",
        text: "The Invoice Has been Created",
        title: "Invoice Created Successfully"
    };

    var alertOptions = { height: 220, width: 360 };

    await Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
        function success(result) {
            console.log("Alert dialog closed");
        },
        function error(error) {
            console.log(error.message);
        }
    );
}

function navigateToRecord(entityName, recordId) {
    var pageInput = {
        pageType: "entityrecord",
        entityName: entityName,
        entityId: recordId
    };
    var navigationOptions = {
        target: 1 // Opens in the same window
    };

    Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
        function success() {
            console.log("Navigation successful");
        },
        function error(error) {
            console.log("Navigation error: " + error.message);
        }
    );
}