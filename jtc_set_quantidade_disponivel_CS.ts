/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */




import { EntryPoints } from 'N/types'
import * as search from 'N/search'
import * as runtime from 'N/runtime'


export const fieldChanged: EntryPoints.Client.fieldChanged = (ctx: EntryPoints.Client.fieldChangedContext) => {
    try {
        const curr= ctx.currentRecord

        if (ctx.fieldId == "item") {
            const line = ctx.line
            console.log("line", line)

            const location = curr.getValue("location") 

            const getItem = curr.getCurrentSublistValue({
                fieldId: 'item',
                sublistId: ctx.sublistId
            })

            console.log("filed", getItem)

            const inventoryitemSearchObj = search.create({
                type: "inventoryitem",
                filters:
                [
                   ["type","anyof","InvtPart"], 
                   "AND", 
                   ["internalid","anyof", getItem], 
                   "AND", 
                   ["inventorylocation","anyof",location]
                ],
                columns:
                [
                   search.createColumn({name: "locationquantityavailable", label: "Location Available"})
                ]
             }).run().getRange({start: 0, end:1})
             const disponivel = inventoryitemSearchObj[0].getValue("locationquantityavailable")

             console.log("inventory", disponivel)
            if (!!disponivel) {

                if (Number(disponivel) > 0) {
                    curr.setCurrentSublistValue({
                        sublistId: ctx.sublistId,
                        fieldId: 'custcol_jtc_qtat_able',
                        value: disponivel
                    })
                } else {
                    alert("Você não quantidade disponível para esse item!")
                    curr.cancelLine({sublistId: ctx.sublistId})
                }
            } else {
                alert("Você não quantidade disponível para esse item!")
                curr.cancelLine({sublistId: ctx.sublistId})
            }
            
            


        }
        const currUser = runtime.getCurrentUser().role
        if (ctx.fieldId == 'custbodyjtc_com_ped' && currUser == 1454) {
            const currComissao = curr.getValue("custbodyjtc_com_ped")
            const parter = curr.getValue('partner')
            const comissao = search.lookupFields({
                id: parter,
                type: search.Type.PARTNER,
                columns: ['custentity3']
            }).custentity3

            if (!!comissao) {
                const numcomissao = Number(String(comissao).split('%')[0].replace(',', '.'))
                const numCurrentComissao = Number(String(currComissao).split('%')[0].replace(',', '.'))
                if (numCurrentComissao > numcomissao) {
                    alert("Comissão é maior que 3%")
                    curr.setValue({fieldId: 'custbodyjtc_com_ped', value: numcomissao})
                }
            }
        }

        if (ctx.fieldId == 'custbody_jtc_tipo_frete' && currUser == 1454) {
            const tipo_custom = curr.getValue("custbody_jtc_tipo_frete")

            curr.setValue({fieldId: 'custbody_enl_freighttype', value: tipo_custom})
        }


    } catch (error) {
        console.log("Erro", error)
    }
}
export const saveRecord: EntryPoints.Client.saveRecord = (ctx: EntryPoints.Client.saveRecordContext) => {
    const curr = ctx.currentRecord

    const atrado = Number(curr.getValue('custbody_jtc_total_em_atraso'))
    
    if (!!atrado) {
        alert("Cliente com atraso")
    }
    return true
}