/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as record from 'N/record'
import * as https from 'N/https'


export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        return search.create({
            type: "customerpayment",
            filters:
            [
               ["type","anyof","CustPymt"], 
               "AND", 
               ["account","anyof","1"], 
               "AND", 
               ["mainline","is","T"]
            ],
            columns:
            [
               search.createColumn({name: "trandate", label: "Data"}),
               search.createColumn({name: "tranid", label: "Número do documento"}),
               search.createColumn({name: "type", label: "Tipo"}),
               search.createColumn({name: "entity", label: "Nome"}),
               search.createColumn({name: "appliedtotransaction", label: "Aplicados à transação"})
            ]
         })


    } catch (error) {
        log.error("jtc_baixar_installmentst_on_bank_MR.getInputData", error)
    }
} 


export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    try {
        const values = JSON.parse(ctx.value)
        // log.debug("values", values)


        const paymentRec = record.load({
            type: record.Type.CUSTOMER_PAYMENT,
            id: values.id
        })

        const lines = paymentRec.getLineCount({sublistId: 'apply'})


        let idInvoice 
        let numInstallment

        for (var i =0; i < lines; i++) {
            const apply = paymentRec.getSublistValue({
                fieldId: 'apply',
                sublistId: 'apply',
                line: i
            })

            const doc = paymentRec.getSublistValue({
                fieldId: 'doc',
                sublistId: 'apply',
                line: i
            })
            const type = paymentRec.getSublistValue({
                fieldId: 'trantype',
                sublistId: 'apply',
                line: i
            })
            const refNumInstallment = paymentRec.getSublistValue({
                fieldId: 'installmentnumber',
                sublistId: 'apply',
                line: i
            })
            
            if (apply == "T" || apply == true) {
                if (type == 'CustInvc') {
                    idInvoice = doc
                    numInstallment = refNumInstallment

                    break
                }
            }
        }

        let nossoNumcorreto
        
        if (!!numInstallment) {
            log.debug(`INVOIDE : ${idInvoice}`, `INSTALLMENT: ${numInstallment}`)
            
            const searchParcelaCnab = search.create({
                type: CTS.PARCELA_CNAB.ID,
                filters: [
                    ["custrecord_dk_cnab_transacao", search.Operator.ANYOF, idInvoice]
                    // "AND", 
                    // ["custrecord_dk_cnab_utilizar_beneficiario","contains", numInstallment]
                ],
                columns: [
                    search.createColumn({name: CTS.PARCELA_CNAB.NUM_CONVENIO}),
                    search.createColumn({name: CTS.PARCELA_CNAB.NOSSO_NUMERO}),
                    search.createColumn({name: 'custrecord_dk_cnab_utilizar_beneficiario'})
                ]
            }).run().each(res => {

                const nosso_num = res.getValue({name:CTS.PARCELA_CNAB.NOSSO_NUMERO })
                const numParcela = Number(String(res.getValue({name: 'custrecord_dk_cnab_utilizar_beneficiario'})).split(' ')[1])

                log.debug(`Parcela ${numParcela} / ${numInstallment}`,  nosso_num)

                if ( Number(numInstallment) == numParcela ) {
                    nossoNumcorreto = nosso_num
                }
                return true
            })

        }
        if(!!nossoNumcorreto) {
            const data = getIntergrcaoBB()
            const token = getAccessToken(data.url_token, data.authorization)

            log.audit("nossoNumcorreto", nossoNumcorreto)
            const url = `https://api.bb.com.br/cobrancas/v2/boletos/${nossoNumcorreto}/baixar?gw-dev-app-key=4a5e515a85aa0cb8a74b71646d5ec025`

            const authObj = token.body.token_type + " " + token.body.access_token

            const headerArr = {};
            headerArr['Authorization'] = authObj;
            headerArr['Accept'] = 'application/json';

            const request = https.post({
                url: url,
                body: JSON.stringify({
                    "numeroConvenio":2202864
                }),
                headers: headerArr
            })

            log.audit("requst", request.body)
        }


        // const type = String(values.values.appliedtotransaction.text).split(" ")[0]

        // if (type == 'Contas') {
        //     const status = values.values['statusref.appliedToTransaction'].value
        //     if (status == 'paidInFull') {
        //         // log.debug("pago", values)

        //         const idInvoice = values.values.appliedtotransaction.value
        //         const data = getIntergrcaoBB()
        //         const token = getAccessToken(data.url_token, data.authorization)
                
        //         log.debug("INOVICE", idInvoice)

        //         const searchParcelaCnab = search.create({
        //             type: CTS.PARCELA_CNAB.ID,
        //             filters: [
        //                 ["custrecord_dk_cnab_transacao", search.Operator.ANYOF, idInvoice]
        //             ],
        //             columns: [
        //                 search.createColumn({name: CTS.PARCELA_CNAB.NUM_CONVENIO}),
        //                 search.createColumn({name: CTS.PARCELA_CNAB.NOSSO_NUMERO})
        //             ]
        //         }).run().each( res => {
        //             const nosso_num = res.getValue({name:CTS.PARCELA_CNAB.NOSSO_NUMERO })

        //             log.debug("parcar",  nosso_num)

        //             const url = `https://api.bb.com.br/cobrancas/v2/boletos/${nosso_num}/baixar?gw-dev-app-key=4a5e515a85aa0cb8a74b71646d5ec025`

        //             const authObj = token.body.token_type + " " + token.body.access_token

        //             const headerArr = {};
        //             headerArr['Authorization'] = authObj;
        //             headerArr['Accept'] = 'application/json';

        //             const request = https.post({
        //                 url: url,
        //                 body: JSON.stringify({
        //                     "numeroConvenio":2202864
        //                 }),
        //                 headers: headerArr
        //             })

        //             log.audit("requst", request.body)

        //             return true
        //         })

        //     }
        // }

        
        // log.debug("PROCESSO", 'FINALIZADO')
        



    } catch (error) {
        log.error("jtc_baixar_installmentst_on_bank_MR.map", error)
    }
}

const getAccessToken = (url_token, authorization) => {
    try {
        
        const urlObj = String(url_token);

        const bodyObj = {
                "grant_type": "client_credentials",
                "scope": "cobrancas.boletos-info cobrancas.boletos-requisicao"
        };

        const authObj = authorization; //* alterado basic pelo de produção;

        const headerArr = {};
        headerArr['Authorization'] = authObj;
        headerArr['Accept'] = 'application/json';

        const response = https.post({
                url: urlObj,
                body: bodyObj,
                headers: headerArr
        });


        return {
            body: JSON.parse(response.body),
        };

    } catch (e) {
            log.error('getAccessToken',e);
    }
}

const CTS = {
    INTEGRACAO_BB:{
        ID: 'customrecord_jtc_rt_integracao_bb',
        KEY: 'custrecord_jtc_int_bb_key',
        URL_TOKEN: 'custrecord_jtc_int_bb_url_token',
        AUTHORIZATION: 'custrecord_jtc_int_bb_authorization',
        CONTA: 'custrecord_jtc_int_bb_conta',
        AGENCIA: 'custrecord_jtc_int_bb_agencia'
    },

    PARCELA_CNAB: {
        ID: 'customrecord_dk_cnab_aux_parcela',
        TRANSACTION: 'custrecord_dk_cnab_transacao',
        NOSSO_NUMERO: 'custrecord_dk_cnab_nosso_numero',
        DATA_VENCIMENTO: 'custrecord_dk_cnab_dt_vencimento',
        PAGAMENTO: 'custrecord_dk_cnab_transacao_pg',
        BOLETO_PAGO: 'custrecord_jtc_int_boleto_pago',
        NUM_CONVENIO: 'custrecord_dk_cnab_numero_convenio'
    },
    INVOICE: {
        ID: 'invoice',
        INTERNALID: 'internalid',
        STATUS: 'approvalstatus'
    },
    CUSTOMER_PAYMENT: {
        ID: 'customerpayment',
        CONTA_BANCARIA: "custbody_jtc_cont_banc_inter",
        TRANDATE: 'trandate',
        DIFENCA_PAGO: 'custbody_jtc_int_dif_valor_org_pago',
        SUBLIST_INSTALL: {
            ID: 'apply',
            FIELDS: {
                REFNUM: 'refnum',
                APPLY: 'apply',
                DATA_VENCIMENTO: 'applyduedate'
            }
        }
    }
}

const getIntergrcaoBB = () => {
    try{
        const searchIntegracaoBB = search.create({
            type: CTS.INTEGRACAO_BB.ID,
            filters: [],
            columns: [
                search.createColumn({name: CTS.INTEGRACAO_BB.KEY}),
                search.createColumn({name: CTS.INTEGRACAO_BB.URL_TOKEN}),
                search.createColumn({name: CTS.INTEGRACAO_BB.AUTHORIZATION}),
                search.createColumn({name: CTS.INTEGRACAO_BB.CONTA}),
                search.createColumn({name: CTS.INTEGRACAO_BB.AGENCIA})
            ]
        }).run().getRange({start: 0, end: 1});

        if (searchIntegracaoBB.length > 0) {
            return {
                'key': searchIntegracaoBB[0].getValue({name: CTS.INTEGRACAO_BB.KEY}),
                'url_token': searchIntegracaoBB[0].getValue({name: CTS.INTEGRACAO_BB.URL_TOKEN}),
                'authorization': searchIntegracaoBB[0].getValue({name: CTS.INTEGRACAO_BB.AUTHORIZATION}),
            };
        } else {
            throw {
                'msg': 'cadastrar RT INTEGRACAO BB'
            };
        }
    } catch (e) {
        log.error('getIntergrcaoBB',e);
        throw e
    }

}
