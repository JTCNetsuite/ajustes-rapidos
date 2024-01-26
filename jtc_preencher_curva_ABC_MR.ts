/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */



import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as file from 'N/file'
import * as record from 'N/record'


export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        
        const fileCsv = file.load({id: 1063763}).getContents()

        // log.debug('file', fileCsv)

        const response = []

        const data = fileCsv.split(" ")[1].split("\n")
        // log.debug("data", data)
        data.pop()
        data.shift()
        for (var  i=0; i<data.length; i++) {
            // log.debug(`${i}`, data[i])
            const values = data[i].split(";")
            response.push({
                id: values[0],
                classificao: values[2]
            })
        }
        
        return response



    } catch (error) {
        log.error("jtc_preencher_curva_ABC_MR.getInputdata",error)
    }
}

export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    try {
        // log.debug("ctx", ctx.value)
        const item = JSON.parse(ctx.value)

        const idItem = item.id
        const classificao = String(item.classificao).split('\r')[0]
        let set
        if (classificao == 'A') {
            set = 1
        }
        if (classificao == 'B') {
            set = 2
        }

        if (classificao == 'C') {
            set = 3
        }


        const recItem = record.load({id: idItem, type: record.Type.LOT_NUMBERED_INVENTORY_ITEM})
        // invtclassification

        const lines = recItem.getLineCount({sublistId: 'locations'})

        for (var  i=0 ;  i < lines; i++) {
            const location = recItem.getSublistValue({
                fieldId:'location',
                sublistId: 'locations',
                line: i
            })

            if (location == 2 || location == "2") {

                recItem.setSublistValue({
                    fieldId: 'invtclassification',
                    line: i,
                    sublistId: 'locations',
                    value: set
                })
            }
        }

        const idReturn = recItem.save({ignoreMandatoryFields:  true})
        log.audit("id Return", idReturn)


    } catch (error) {
        log.error("jtc_preencher_curva_ABC_MR.map",error)
    }
}