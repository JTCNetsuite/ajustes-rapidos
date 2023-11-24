/**
 * @NApiVersion     2.x
 * @NScriptType     UserEventScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as email from 'N/email'


export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {
    try {
        
        const curr = ctx.newRecord

        const nome = curr.getValue("displayname")

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
                author: -5,
                body: `O item ${nome}, está abaixo do estoque mínimo.`,
                subject: 'Alerta de Estoque Mínimo Filial São Paulo',
                recipients: 'netsuite@jtcd.com.br   '
            })
            

        }  else {
            curr.setValue({fieldId: 'custitem_jtc_abaixo_do_estoque', value: false})
        }
        if (esq_06) {
            curr.setValue({fieldId: 'custitem_jtc_abaixo_do_estoque', value: true})
            
            email.send({
                author: -5,
                body: `O item ${nome}, está abaixo do estoque mínimo.`,
                subject: 'Alerta de Estoque Mínimo Filial Extrema',
                recipients: 'netsuite@jtcd.com.br   '
            })
            

        }  else {
            curr.setValue({fieldId: 'custitem_jtc_abaixo_do_estoque', value: false})
        }



    } catch (error) {
        log.error("jtc_send_email_estoque_minimo.beforeSubmit", error)
    }
}