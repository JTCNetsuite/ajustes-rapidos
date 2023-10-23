/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */



import {EntryPoints} from  'N/types';
import * as search from 'N/search';
import * as log from 'N/log';
import * as record from 'N/record';


export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        return search.create({
            type: "vendorpayment",
            filters:
            [
                ["internalid", search.Operator.ANYOF, 91379],
                "AND",
               ["type","anyof","VendPymt"], 
               "AND", 
               ["mainline","is","T"]
            ],
            columns:
            [
               search.createColumn({name: "entity", label: "Nome"}),
               search.createColumn({name: "account", label: "Conta"}),
               search.createColumn({name: "amount", label: "Valor"}),
               search.createColumn({
                  name: "trandate",
                  sort: search.Sort.ASC,
                  label: "Data"
               })
            ]
         });
    } catch (error) {
        log.error("jtc_preencher_conta_despesa_MR.getInputData", error)
        throw error
    }
}
export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    try {
        const values = JSON.parse(ctx.value)
        log.debug("values", values)

        const id = values.id

        const recVendPayment = record.load({
            id:  id, 
            type: record.Type.VENDOR_PAYMENT
        })

        const idVendorBill = recVendPayment.getSublistValue({
            sublistId: 'apply',
            fieldId: 'doc',
            line: 0
        })
        log.debug("idVerdnor", idVendorBill)
        if (!!idVendorBill) {
            var vendorbillSearchObj = search.create({
                type: "vendorbill",
                filters:
                [
                   ["type","anyof","VendBill"], 
                   "AND", 
                   ["account","noneof","527"], 
                   "AND", 
                   ["line","equalto","1"], 
                   "AND", 
                   ["internalid","anyof", idVendorBill]
                ],
                columns:
                [
                   search.createColumn({name: "account", label: "Conta"})
                ]
             }).run().getRange({start: 0, end: 1});
             log.debug("vendorbillSearchObj", vendorbillSearchObj)
            //  if (vendorbillSearchObj.length > 0) {
                // const conta = vendorbillSearchObj[0].getValue({name:  "account"})

                log.debug("vendorbillSearchObj", vendorbillSearchObj[0])

                
                recVendPayment.setValue({fieldId: 'custbody_jtc_conta_de_despesa', value: 345})

                const idReturn = recVendPayment.save({ignoreMandatoryFields: true})

                log.audit("id returen", idReturn)
                
            //  }
        }

    } catch (error) {
        log.error("jtc_preencher_conta_despesa_MR.map", error)
    }
}
