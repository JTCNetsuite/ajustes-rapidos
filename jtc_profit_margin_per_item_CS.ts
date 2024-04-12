/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */




import { EntryPoints } from 'N/types'
import {lookupFields, Type} from 'N/search'



export const fieldChanged: EntryPoints.Client.fieldChanged = (ctx: EntryPoints.Client.fieldChangedContext) => {
    try {
        
        const curr = ctx.currentRecord
        if (ctx.fieldId == 'custcol_jtc_prec_uni_min') {

            const item = curr.getCurrentSublistValue({
                fieldId: 'item', 
                sublistId: 'item'
            })

            const price = Number(curr.getCurrentSublistValue({
                fieldId: 'custcol_jtc_prec_uni_min', 
                sublistId: 'item'
            }))


            const cost = Number(lookupFields({
                type: Type.LOT_NUMBERED_INVENTORY_ITEM,
                id: item,
                columns:[
                    'custitem_jtc_custo_medio'
                ]
            }).custitem_jtc_custo_medio)
            console.log('cost', cost)

            const percent = ((price / cost) - 1) * 100
            console.log(percent)
            try {
                curr.setCurrentSublistValue({
                    fieldId: 'custcol_jtc_profit_margin',
                    sublistId: 'item',
                    value: percent.toFixed(2)
                })
            } catch (error) {
                console.log('set', error)
            }

        }

        

    } catch (error) {
        console.log("jtc_profit_margin_per_item_Cs.fieldChanged", error)
    }
}


export const validateLine: EntryPoints.Client.validateLine = (ctx:EntryPoints.Client.validateLineContext) => {
    try {
        const curr = ctx.currentRecord
        
        if (ctx.sublistId == 'item') {
            console.log("sublist ITEM -----------------------")
            const currLine = curr.getCurrentSublistIndex

            const currentProfit = Number(curr.getValue("custbody_jtc_total_profit_margin"))

            const profit_margin = Number(curr.getCurrentSublistValue({
                fieldId: 'custcol_jtc_profit_margin',
                sublistId: 'item'
            }))

            curr.setValue({fieldId: 'custbody_jtc_total_profit_margin', value: (currentProfit + profit_margin).toFixed(2)})
            
            return true
        }
    } catch (error) {
        console.log("validadeLine", error)
    }
}

export const lineInit: EntryPoints.Client.lineInit = (ctx: EntryPoints.Client.lineInitContext) => {
    try {
        const curr = ctx.currentRecord
        if (ctx.sublistId == 'item') {
            console.log("sublist ITEM -----------------------")
            const currLine = curr.getCurrentSublistIndex

            const currentProfit = Number(curr.getValue("custbody_jtc_total_profit_margin"))

            const profit_margin = Number(curr.getCurrentSublistValue({
                fieldId: 'custcol_jtc_profit_margin',
                sublistId: 'item'
            }))

            if (!!profit_margin) {
                curr.setValue({fieldId: 'custbody_jtc_total_profit_margin', value: (currentProfit - profit_margin).toFixed(2)})
            }

            
        }



    } catch (error) {
        console.log('lineinit', error)
    }
}