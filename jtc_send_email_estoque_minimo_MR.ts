/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */



import {EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as record from 'N/record'
import * as email from 'N/email'

export const getInputData: EntryPoints.MapReduce.getInputData = () => {

    
	try {
        return search.create({
            type: search.Type.LOT_NUMBERED_INVENTORY_ITEM
        })
    } catch (error) {
        log.error("jtc_send_email_estoque_minimo_MR.getInputData",error)
    }
}


export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) =>  {
    try {

        log.debug("ctx", ctx.value)
        const values = JSON.parse(ctx.value)
        const curr = record.load({
            id: values.id,
            type: record.Type.LOT_NUMBERED_INVENTORY_ITEM
        })
        const nome = curr.getValue("displayname")
        const cod_item = curr.getValue("itemid")

        const lines = curr.getLineCount({sublistId: 'locations'})
        let esq_02 = false
        let esq_06 = false

        for (var i=0; i < lines; i++) {
            const location = curr.getSublistValue({
                sublistId: 'locations',
                fieldId: 'location',
                line:i
            })
            const qtde = curr.getSublistValue({
                fieldId: 'quantityonhand',
                sublistId: 'locations',
                line: i
            })
            const min_estq = curr.getSublistValue({
                fieldId: 'reorderpoint',
                sublistId: 'locations',
                line: i
            })

            if (location == 2 ) {
                if (qtde < min_estq) {
                    esq_02 = true
                }
            }

            if (location == 6) {
                if (qtde < min_estq) {
                    esq_06 = true
                }
            }
        }
        const emails = ['denis@jtcd.com.br', 'luciano@jtcd.com.br', 'rafael@jtcd.com.br']
        if (esq_02) {
            curr.setValue({fieldId: 'custitem_jtc_abaixo_do_estoque', value: true})
            
            email.send({
                author: 172,
                body: `O item ${cod_item} ${nome}, está abaixo do estoque mínimo.`,
                subject: 'Alerta de Estoque Mínimo Filial São Paulo',
                recipients: 'luciano@jtcd.com.br'
            })
            

        }  else {
            curr.setValue({fieldId: 'custitem_jtc_abaixo_do_estoque', value: false})
        }
        if (esq_06) {
            curr.setValue({fieldId: 'custitem_jtc_abaixo_do_estoque', value: true})
            
            email.send({
                author: 172,
                body: `O item ${cod_item} ${nome}, está abaixo do estoque mínimo.`,
                subject: 'Alerta de Estoque Mínimo Filial Extrema',
                recipients: 'luciano@jtcd.com.br'
            })
            

        }  else {
            curr.setValue({fieldId: 'custitem_jtc_abaixo_do_estoque', value: false})
        }

        curr.save()

        curr.save({ignoreMandatoryFields: true})



    } catch (error) {
        log.error("jtc_send_email_estoque_minimo_MR.map", error)
    }
}