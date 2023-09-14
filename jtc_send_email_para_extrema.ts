/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */
 

import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as email from 'N/email'
import * as record from 'N/record'
import * as file from 'N/file'

export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (ctx: EntryPoints.UserEvent.afterSubmitContext) => {
    try {
        
        const curr = ctx.newRecord

        const subsidiary = curr.getValue("subsidiary")
        const nf = curr.getValue('custbody_enl_fiscaldocnumber')
        const transportadora = curr.getValue('custbody_enl_carrierid')
        

        if (subsidiary == 7 || subsidiary == '7') {
            if (!!nf) {
                const searchXML = search.create({
                    type: search.Type.FOLDER,
                    filters: [
                        ['file.name', search.Operator.CONTAINS, nf],
                        "AND",
                        ["file.filetype", search.Operator.ANYOF, "XMLDOC"]
                    ],
                    columns: [
                        search.createColumn({
                            name: 'url',
                            join: 'file'
                        }),
                        search.createColumn({
                            name: 'internalid',
                            join: 'file'
                        })
                    ]
                }).run().getRange({start: 0, end:1})

                log.debug("searchXMl", searchXML)
                
                const recordTransportadora = record.load({
                    type: 'customrecord_enl_transportadoras',
                    id: transportadora
                })

                const fonecedor_trans = recordTransportadora.getValue("custrecord_enl_codigotransportadoras")
                
                const recordForncedor = record.load({
                    type: record.Type.VENDOR,
                    id: fonecedor_trans
                })

                const email_trans = String(recordForncedor.getValue('email'))

                log.debug("email transportador", email_trans)
                
                if (searchXML.length > 0 && !!email_trans) {
                    const idFile: any = searchXML[0].getValue({name: 'internalid', join: 'file'})
                    log.debug("idFile", idFile)

                    const fileXml = file.load({id: idFile})

                    const body = `Segue o anexo do Xml`
                   
                    email.send({
                        author: 4,
                        body: body,
                        subject: `NF ${nf}`,
                        recipients: [email_trans],
                        cc: ['denis@jtcd.com.br'],
                        attachments: [fileXml]
                    })

                    const invoice = record.load({type: record.Type.INVOICE, id: ctx.newRecord.id})

                    invoice.setValue({fieldId: 'custbody_jtc_envio_email_transportador', value: true})
                    invoice.save({ignoreMandatoryFields: true})

                }

                
                
            }
        }



    } catch (error) {
        log.error("jtc_send_email_para_extrema.afterSubmit", error)
    }
}
