/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */



import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as file from 'N/file'
import * as record from 'N/record'


// const createSearchFilter = (fieldId: string, innerSearchOperator: search.Operator, outerSearchOperator: string, values: any[]) => {
//     try {
//         const filters = [];
//         for (var i = 0; i < values.length; i++) {
//             if (i != values.length - 1) filters.push([fieldId, innerSearchOperator, values[i]], outerSearchOperator);
//             else filters.push([fieldId, innerSearchOperator, values[i]]);
//         }
//         // log.debug('filters', filters);
//         return filters;
//     } catch (e) {
//         log.error({ title: 'Error : createSearchFilter', details: e });
//         throw e;
//     }
// }


export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        return search.create({
            type: search.Type.CHECK,
            filters:
            [
            //    ["type","anyof","VendBill"], 
            //    "AND", 
               ["mainline","is","T"],
               "AND",
               ["trandate","after", "20/01/2024"],
               "AND",
               ["custbody_jtc_conta_de_despesa","anyof","@NONE@"]
            ],
            columns:
            [
               search.createColumn({name: "trandate", label: "Data"}),
               search.createColumn({name: "tranid", label: "Número do documento"}),
               search.createColumn({name: "entity", label: "Nome"}),
               search.createColumn({name: "amount", label: "Valor"}),
               search.createColumn({name: "custbody_jtc_conta_de_despesa", label: "Conta de Despesa"})
            ]
         });
         

    } catch (error) {
        log.error("jtc_baixar_contas_recebera_antigas_MR.getInputData", error)
    }
}


export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    try {
        log.debug("ctx", ctx.value)
        const data = JSON.parse(ctx.value)

        const id = data.id

        // const recVendorBIll = record.load({
        //     id: id,
        //     type: record.Type.VENDOR_BILL
        // })
        const recVendorBIll = record.load({
            id: id,
            type: record.Type.CHECK
        })

        const item =  recVendorBIll.getSublistValue({
            fieldId: 'item', 
            sublistId: 'item',
            line: 0
        })

        const getExpensseAccount = search.lookupFields({
            id: item,
            type: search.Type.SERVICE_ITEM,
            columns: [
                'expenseaccount'
            ]
        }).expenseaccount

        log.debug("expeseAccount", getExpensseAccount)

        if (!!getExpensseAccount) {

            if (getExpensseAccount[0].value != 527 ||  getExpensseAccount[0].value  != 112) {

                recVendorBIll.setValue({fieldId: 'custbody_jtc_conta_de_despesa', value: getExpensseAccount[0].value})
                const idReturn = recVendorBIll.save({ignoreMandatoryFields: true})
                log.audit("idReturn", idReturn)
            }


        }


    } catch (error) {
        log.error("jtc_baixar_contas_receber_antigas_MR.map", error)
    }
}



// export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
//     try {
//         log.debug("ctx", ctx.value)
//         const values = JSON.parse(ctx.value)
//         // 740

//         const invoiceRec = record.submitFields({
//             id: values.id,
//             type: record.Type.INVOICE,
//             values: {
//                 "approvalstatus": 2
//             }
//         })

//         if (!!invoiceRec) {
//             const customerPayment = record.transform({
//                 fromId: values.id,
//                 fromType: record.Type.INVOICE,
//                 toType: record.Type.CUSTOMER_PAYMENT
//             })
    
    
//             log.debug("date", values.values.duedate)
//             const date = String(values.values.duedate).split("/")
    
//             customerPayment.setValue({fieldId: 'account', value: 740})
//             customerPayment.setValue({fieldId: 'trandate', value: new Date(`${date[1]}/${date[0]}/${date[2]}`)})
    
//             const lines = customerPayment.getLineCount({sublistId: 'apply'})
    
            
//             for (var i = 0; i < lines; i++) {
//                 customerPayment.setSublistValue({
//                     fieldId: 'apply',
//                     sublistId: 'apply',
//                     line: i,
//                     value: false
//                 })
//             }
    
//             for (var i = 0; i < lines; i++) {
    
//                 const invoice = customerPayment.getSublistValue({
//                     fieldId: 'doc',
//                     sublistId: 'apply',
//                     line:i
//                 })
    
//                 if (invoice == values.id) {
//                     customerPayment.setSublistValue({
//                         fieldId: 'apply',
//                         sublistId: 'apply',
//                         line: i,
//                         value: true
//                     })
//                 }
                
//             }
    
//             const idCustomer = customerPayment.save({ignoreMandatoryFields: true})
    
//             log.audit("idCustomer", idCustomer)
//         }
        


//     } catch (error) {
//         log.error("jtc_baixar_contas_recebera_antigas_MR.map", error)
//     }
// }

