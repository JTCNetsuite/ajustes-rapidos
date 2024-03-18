/**
 * @NApiVersion     2.x
 * @NScriptType     UserEventScript
 * @NModuleScope    SameAccount
 * Notes:           10/04/2023 - 3rd version, obtido o access token e outros elementos da requisição.
 *                  07/06/2023 - 3nd version, attacehed files bank slip (xml e html).
 *                  09/06/2023 - 4th version, excluded function  to bank slip in xml.
 *                  12/06/2023 - 5th version, programming digitable line and bar code.
 *                  20/06/2023 - 7th version, forn cnpj.
 *                  21/06/2023 - 8th version, to send invoice to customer email
 *                  26/06/2023 - 9th version, to send invoice to customer email

 *
 */

define(['N/email', 'N/format', 'N/file', 'N/https', 'N/log', 'N/record', 'N/render', 'N/search'],
    function (email, format, file, https, log, record, render, search) {

        function afterSubmit(context) {

              if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {

                const nRecord = context.newRecord
                const id = nRecord.id
                const enviar = nRecord.getValue("custrecord_cnab_env_para_banco")
                if (enviar == "T" || enviar == true) {
                    accessToken(id)
                }
            
             }
        }

        function accessToken(idRec) {

            const urlObj = "https://oauth.bb.com.br/oauth/token"

            const bodyObj = {
                "grant_type": "client_credentials",
                "scope": "cobrancas.boletos-info cobrancas.boletos-requisicao"
            }

            const authObj = "Basic ZXlKcFpDSTZJalJtTlRWak56VXRNR015WVMwMFl5SXNJbU52WkdsbmIxQjFZbXhwWTJGa2IzSW" +
                "lPakFzSW1OdlpHbG5iMU52Wm5SM1lYSmxJam8wTlRJMk1Td2ljMlZ4ZFdWdVkybGhiRWx1YzNSaGJHRm" +
                "pZVzhpT2pGOTpleUpwWkNJNklqaGhOak13SWl3aVkyOWthV2R2VUhWaWJHbGpZV1J2Y2lJNk1Dd2lZMj" +
                "lrYVdkdlUyOW1kSGRoY21VaU9qUTFNall4TENKelpYRjFaVzVqYVdGc1NXNXpkR0ZzWVdOaGJ5STZNU3" +
                "dpYzJWeGRXVnVZMmxoYkVOeVpXUmxibU5wWVd3aU9qRXNJbUZ0WW1sbGJuUmxJam9pY0hKdlpIVmpZVz" +
                "hpTENKcFlYUWlPakUyT0RNd05USXdNRE00TmpsOQ==" //* alterado basic pelo de produção

            const headerArr = []
            headerArr['Authorization'] = authObj
            headerArr['Accept'] = 'application/json'

            const response = https.post({
                url: urlObj,
                body: bodyObj,
                headers: headerArr
            })

            log.debug({
                title: 'Linha 56 - retorno de requisição',
                details: response.body + '  -->  tipo de registro  ' + typeof response.body + ' --> tamanho: ' + response.body.length
            })

            const responseJSON = JSON.parse(response.body)
            const codeJSON = JSON.parse(response.code)
            const accessToken = responseJSON.access_token
            const tokenType = responseJSON.token_type
            const expires = responseJSON.expires_in
            const id = idRec
            const scope = responseJSON.scope

            registroBoleto(accessToken, tokenType, expires, scope, id)
            listarBoletos(accessToken, tokenType, expires, scope, id)

        } //* Fim  de accessToken. Requisição do access token para a API do BB

        function registroBoleto(accessTkn, tknTyp, exp, scp, idRec) {

            const accessToken = accessTkn
            const tokenType = tknTyp
            const expires = exp
            const scope = scp
            const id = idRec
            const key = "4a5e515a85aa0cb8a74b71646d5ec025"  //*Trocada pela chave de produção

            const authObj = tokenType + " " + accessToken

            const headerArr = []
            headerArr['Authorization'] = authObj
            headerArr['Accept'] = 'application/json'

            const urlBoleto = "https://api.bb.com.br/cobrancas/v2/boletos?gw-dev-app-key=" + key //*Trocada pela url de produção

            const boletoBody = makePayload(id);

            const response = https.post({
                url: urlBoleto,
                body: boletoBody,
                headers: headerArr
            })
            const bankCode = response.code;
            const responseBody = JSON.parse(response.body) //* Atenção ao parse
            const nossoNumero = responseBody.numero


            log.debug({
                title: " linha 102 -->  Retorno da requisição do registro do boleto.",
                details: "JSON de retorno da API do BB:   " + response.body + "  --> Código de retorno:  " + bankCode +
                    " --> id do Registro: " + id
            })

            //*dispara função para configurar os campos CÓDIGO DE RETORNO DO BANCO, LINHA DIGITÁVEL e email para administradores
            if (bankCode == 201) {

                const linhaDigitavel = responseBody.linhaDigitavel.toString()
                const codigoBarraNumerico = responseBody.codigoBarraNumerico.toString()

                log.debug({
                    title: ' --> linha 114 - código 201 - Boleto Bancário',
                    details: ' Código de retorno do banco:  ' + response.code + ' --> Linha digitável: ' + linhaDigitavel + '  --> Código de barras: ' + codigoBarraNumerico
                        + ' --> nosso numero:  ' + nossoNumero + '  --> id registro: ' + idRec
                })

                bankSlipCreated(bankCode, idRec, linhaDigitavel, codigoBarraNumerico, nossoNumero)
                bankSlipHTML(idRec) //* criar html do boleto
                //emailBankSlip(idRec) //* emviar boleto
                // bankSlipXML(idRec)  //* criar xml do boleto --> MUDAR DE FUNÇÃO NO FIM DO PROCESSO.

            }
            else if (response.code == 400) {

                bankSlipRejected(response.body, response.code, idRec, boletoBody.numeroTituloBeneficiario, JSON.parse(response.body).erros[0].mensagem)
                bankSlipHTML(idRec) //* criar html do boleto --> MUDAR DE FUNÇÃO NO FIM DO PROCESSO.
                //* bankSlipXML(idRec)  //* criar xml do boleto --> MUDAR DE FUNÇÃO NO FIM DO PROCESSO.
                //* emailBankSlip(id)

            }
            else {
                bankSlipDontCreated(response.code, idRec)
            }

        } //* Fim da função de cadastramento do boleto na API do BB.
        function listarBoletos(accessTkn, tknTyp, exp, scp, idRec) {

            const accessToken = accessTkn
            const tokenType = tknTyp
            const expires = exp
            const scope = scp
            const id = idRec
            const key = "4a5e515a85aa0cb8a74b71646d5ec025"  //*Trocada pela chave de produção

            const authObj = tokenType + " " + accessToken

            const headerArr = {}
            headerArr['Authorization'] = authObj
            headerArr['Accept'] = 'application/json'

            const listURL = "https://api.bb.com.br/cobrancas/v2/boletos?gw-dev-app-key=4a5e515a85aa0cb8a74b71646d5ec025&indicadorSituacao=B&agenciaBeneficiario=3221&contaBeneficiario=19570"
            const urlunicoBoleot = 'https://api.bb.com.br/cobrancas/v2/boletos/00022028640000000727?gw-dev-app-key=4a5e515a85aa0cb8a74b71646d5ec025&numeroConvenio=2202864'

            const response = https.get({
                url: listURL,
                body: "",
                headers: headerArr
            })

            const responseBody = response.body //* Atenção ao parse


            log.audit('responseBody',responseBody)
            log.audit('code', response.code)



        } //* Fim da função de cadastramento do boleto na API do BB.

        function makePayload(identity) {

            const recLoad = record.load({
                type: 'customrecord_dk_cnab_aux_parcela',
                id: identity,
                isDynamic: true
            })

            const body = {
                "numeroConvenio": recLoad.getValue('custrecord_dk_cnab_numero_convenio'),
                "numeroCarteira": recLoad.getValue('custrecord_dk_cnab_carteira'),
                "numeroVariacaoCarteira": recLoad.getValue('custrecord_dk_cnab_var_cart'),
                "codigoModalidade": recLoad.getValue('custrecord_dk_cnab_codigo_modalidade'),
                "dataEmissao": recLoad.getValue('custrecord_dk_cnab_dt_emiss'),
                "dataVencimento": recLoad.getValue('custrecord_dk_cnab_dt_vencimento'),
                "valorOriginal": recLoad.getValue('custrecord_dk_cnab_val_orig'),
                "valorAbatimento": recLoad.getValue('custrecord_dk_cnab_val_abt'),
                "quantidadeDiasProtesto": recLoad.getValue('custrecord_dk_cnab_dias_prot'),
                "quantidadeDiasNegativacao": recLoad.getValue('custrecord_dk_cnab_dias_negat'),
                "orgaoNegativador": recLoad.getValue('custrecord_dk_cnab_orgao_negativador'),
                "indicadorAceiteTituloVencido": (recLoad.getValue('custrecord_dk_cnab_aceite_vencido')).toUpperCase(),
                "numeroDiasLimiteRecebimento": recLoad.getValue('custrecord_dk_cnab_dias_lim_rec'),
                "codigoAceite": recLoad.getValue('custrecord_dk_cnab_codigo_aceite'),
                "codigoTipoTitulo": recLoad.getValue('custrecord_dk_cnab_cod_tip_tit'),
                "descricaoTipoTitulo": recLoad.getValue('custrecord_dk_cnab_descricao_titulo'),
                "indicadorPermissaoRecebimentoParcial": recLoad.getValue('custrecord_dk_cnab_recebimento_parcial'),
                "numeroTituloBeneficiario": recLoad.getValue('custrecord_dk_cnab_num_titbeneficiario'),
                "campoUtilizacaoBeneficiario": (recLoad.getValue('custrecord_dk_cnab_utilizar_beneficiario')).toUpperCase(), //Colocado em 09/05 o log
                "numeroTituloCliente": recLoad.getValue('custrecord_dk_cnab_nosso_numero'),
                "mensagemBloquetoOcorrencia": (recLoad.getValue('custrecord_dk_cnab_mensagem_bloqueto')).toUpperCase(),
                // "email": 'netsuite@jtcd.com.br',
                "desconto": {
                    "tipo": recLoad.getValue('custrecord_dk_cnab_desconto_tipo'),
                    "dataExpiracao": recLoad.getValue('custrecord_dk_cnab_desconto_expira'),
                    "porcentagem": recLoad.getValue('custrecord_dk_cnab_desconto_porcentagem'),
                    "valor": recLoad.getValue('custrecord_dk_cnab_desconto_valor')
                },
                "segundoDesconto": {
                    "dataExpiracao": recLoad.getValue('custrecord_dk_cnab_segdesc_expira'),
                    "porcentagem": recLoad.getValue('custrecord_dk_cnab_segdesc_porcentagem'),
                    "valor": recLoad.getValue('custrecord_dk_cnab_segdesc_valor')
                },
                "terceiroDesconto": {
                    "dataExpiracao": recLoad.getValue('custrecord_dk_cnab_tercdesc_expira'),
                    "porcentagem": recLoad.getValue('custrecord_dk_cnab_tercdesc_porcentagem'),
                    "valor": recLoad.getValue('custrecord_dk_cnab_tercdesc_valor')
                },
                "jurosMora": {
                    "tipo": recLoad.getValue('custrecord_dk_cnab_jurosmora_tipo'),
                    "porcentagem": recLoad.getValue('custrecord_dk_cnab_jurosmora_porcentagem'),
                    "valor": recLoad.getValue('custrecord_dk_cnab_jurosmora_valor')
                },
                "multa": {
                    "tipo": recLoad.getValue('custrecord_dk_cnab_multa_tipo'),
                    "data": recLoad.getValue('custrecord_dk_cnab_multa_data'),
                    "porcentagem": recLoad.getValue('custrecord_dk_cnab_multa_porcentagem'),
                    "valor": recLoad.getValue('custrecord_dk_cnab_multa_valor')
                },
                "pagador": {
                    "tipoInscricao": recLoad.getValue('custrecord_dk_cnab_pagador_tipoinscricao'),
                    "numeroInscricao": recLoad.getValue('custrecord_dk_cnab_pagador_num_inscricao'),
                    "nome": (recLoad.getValue('custrecord_dk_cnab_pagador_nome')).toUpperCase(),
                    "endereco": (recLoad.getValue('custrecord_dk_cnab_pagador_endereco')).toUpperCase(),
                    "cep": recLoad.getValue('custrecord_dk_cnab_pagador_cep'),
                    "cidade": (recLoad.getValue('custrecord_dk_cnab_pagador_cidade')).toUpperCase(),
                    "bairro": (recLoad.getValue('custrecord_dk_cnab_pagador_bairro')).toUpperCase(),
                    "uf": (recLoad.getValue('custrecord_dk_cnab_pagador_uf')).toUpperCase(),
                    "telefone": recLoad.getValue('custrecord_dk_cnab_pagador_telefone')
                },
                "beneficiarioFinal": {
                    "tipoInscricao": recLoad.getValue('custrecord_dk_cnab_benefi_tipo_inscricao'),
                    "numeroInscricao": recLoad.getValue('custrecord_dk_cnab_benfic_num_inscricao'),
                    "nome": (recLoad.getValue('custrecord_dk_cnab_benficiario_nome')).toUpperCase()
                },
                "indicadorPix": (recLoad.getValue('custrecord_dk_cnab_indicador_pix')).toUpperCase()
            }

            return JSON.stringify(body)

        }   //* Fim de makePayload. Montando body do boleto para envio para o BB.
        //*Extraindo dados do record type: customrecord_dk_cnab_aux_parcela. */

        function bankSlipCreated(code, idRec, digitableLine, barsCode, ourNumber) {

            // try {
            log.debug({
                title: ' linha 224 - bankSlipCreated',
                details: 'id da parcela ' + idRec + ' --> linha digitável: ' + digitableLine + ' --> código do banco: ' + code
            }) //*
            const cnpjPayer = payerCNPJ(idRec)
            const codeBank = (code + ' -> CRIADO BOLETO COM SUCESSO.').toString()
            const idBankSlip = idRec
            const nossoNumero = ourNumber
            const linhaDigitavel = digitableLine

            const senderId = -5
            // const emails = 'rogerio.rodrigues@dkcloud.com.br'


            const codigoDeBarrasNumerico = barsCode
            const mensagem = 'Linha Editável:  ' + linhaDigitavel + '\nNosso Número: ' + nossoNumero + '\nCNPJ do Pagador: ' + cnpjPayer + ''
            const subject = 'CÓDIGO ' + code + ' -> CRIADO BOLETO COM SUCESSO.' + ' - > NOSSO NÚMERO: ' + nossoNumero + '. Linha digitável' + linhaDigitavel
                + 'CNPJ Cliente: ' + cnpjPayer

            log.debug({
                title: 'linha 243 - function bankSlipCreated',
                details: 'linha editável: ' + linhaDigitavel + ' --> Código de barras: ' + codigoDeBarrasNumerico + ' --> código de retorno do banco: ' + codeBank +
                    ' --> id do boleto bancário:  ' + idRec + ' --> CNPJ Pagador:  ' + cnpjPayer
            })

            // email.send({

            //     author: senderId,
            //     recipients: emails,
            //     subject: subject,
            //     body: mensagem
            // })

            setBankSlipCreated(idBankSlip, linhaDigitavel, codeBank, codigoDeBarrasNumerico)

        }   //* Fim da function bankSlipCreated()

        function bankSlipRejected(body, code, idRec, nf_num, msg) {
            // ** arrumar mais pra frente
            try {
                // const parcelaCanb = record.load({
                //     id: idRec,
                //     type: 'customrecord_dk_cnab_aux_parcela'
                // })
                // const pedidoenviado = parcelaCanb.getValue("custrecord_cnab_env_para_banco")

                // log.debug({
                //     title: 'linha 264 - função bankSlipRejected - boleto rejeitado, os dados s seguir ---->',
                //     details: ' tipo do retorno do banco:  ' + typeof body + ' --> código do banco:  ' + code + ' --> id do registro: ' + idRec
                // })
                // if (pedidoenviado == "F" || pedidoenviado == true) {
                    const codeBank = code+' ' + msg
                //     const senderId = -5
                //         const bodyJSON = JSON.parse(body)
                //         const erros = bodyJSON.erros
                //         const mensagem = 'Atenção boleto não gerado para nf '+nf_num +'.   Código do erro: ' + code + '. Motivo: ' + erros[0].mensagem + '.'
                //         const emails = ['william@jtcd.com.br', 'netsuite@jtcd.com.br']
                //         const subject = 'CÓDIGO: ' + code + '   ->  REQUISIÇÃO INVÁLIDA: boleto já criado ou dados incorretos.'

                //         log.debug({
                //             title: 'linha 277 - função bankSlipRejected - boleto rejeitado, os dados s seguir ---->',
                //             details: ' campos do retorno do banco JSON:   ' + mensagem + '  --> tipo de dados:  ' + typeof mensagem
                //         })

                //         email.send({
                //             author: senderId,
                //             recipients: emails,
                //             subject: subject,
                //             body: mensagem
                //         })

                        setBankSlipError(idRec, codeBank)
                // }
                

            } catch (error) {
                log.debug('--> linha 292 >> funcão bankSlipRejected - email rejeitado >> o erro é:  ', error.message)
            }

        }   //* Fim da function bankSlipRejected()

        function bankSlipDontCreated(code, idRec) {

            try {
                log.debug({
                    title: 'linha 301 - função bankSlipDontCreated - boleto não criado, os dados a seguir ---->',
                    details: ' tipo do retorno do banco:  ' + typeof body + ' --> código do banco:  ' + code + ' --> id do registro: ' + idRec
                })

                const senderId = -5
                const bodyJSON = JSON.parse(body)
                const erros = bodyJSON.erros
                const emails = 'edison@jtcd.com.br, william@jtcd.com.br, cobranca@jtcd.com.br'

                var codeBank
                var mensagem
                var subject

                if (code == 401) {

                    codeBank = code + ' - REQUISIÇÃO NÃO ATUORIZADA: REVEJA DADOS DE ENVIO'
                    mensagem = 'Atenção boleto não gerado.   Código do erro: ' + code + '. Motivo: NÃO AUTORIZADO. A requisição requer autenticação do usuário.'
                    subject = 'CÓDIGO: ' + code + '  -> REQUISIÇÃO INVÁLIDA.'
                }
                if (code == 500) {

                    codeBank = code + ' - REQUISIÇÃO INVÁLIDA: SERVIÇO INDISPONÍVEL. FALHA SERVIDOR DO BANCO'
                    mensagem = 'Atenção boleto não gerado.   Código do erro: ' + code + '. ERRO INTERNO. O servidor encontrou uma condição inesperada que o impediu de atender a requisição.'
                    subject = 'CÓDIGO: ' + code + '  -> REQUISIÇÃO INVÁLIDA: FALHA DO SERVIDOR DO BANCO.'
                }
                if (code == 503) {

                    codeBank = code + ' - REQUISIÇÃO INVÁLIDA: SERVIÇO INDISPONÍVEL. FALHA SERVIDOR DO BANCO'
                    mensagem = 'Atenção boleto não gerado.   Código do erro: ' + code + '. Motivo: SERVIÇO INDISPONÍVEL. O servidor está impossibilitado de lidar com a requisição no momento. Tente mais tarde.'
                    subject = 'CÓDIGO: ' + code + '  -> REQUISIÇÃO INVÁLIDA: SERVIÇO INDISPONÍVEL. FALHA SERVIDOR DO BANCO'
                }

                log.debug({
                    title: 'linha 334 - função bankSlipDontCreated -  boleto não criado, os dados s seguir ---->',
                    details: ' campos do retorno do banco JSON:   ' + mensagem + '  --> tipo de dados:  ' + typeof mensagem
                })

                // email.send({

                //     author: senderId,
                //     recipients: emails,
                //     subject: subject,
                //     body: mensagem
                // })
                setBankSlipError(idRec, codeBank)

            } catch (error) {
                log.debug('--> linha 348 >> funcão bankSlipDontCreated - email rejeitado >> o erro é:  ', error.message)
            }

        } //* Fim da function bankSlipDontCreated

        function payerCNPJ(idRec) {

            const installment = record.load({
                type: 'customrecord_dk_cnab_aux_parcela',
                id: idRec
            })

            const payerCnpj = installment.getValue("custrecord_dk_cnab_pagador_num_inscricao")

            return payerCnpj

        } //* Fim da function payerCNPJ

        function setBankSlipCreated(idRec, linhaDigitavel, codeBank, barsCode) {
            try {

                log.debug({
                    title: 'linha 370 - function setBankSlipCreated',
                    details: ' --> id da parcela: ' + idRec + ' --> Código do Banco: ' + codeBank
                })

                var setBankSlip = record.load({
                    type: 'customrecord_dk_cnab_aux_parcela',
                    id: idRec,
                    isDynamic: true
                })
                setBankSlip.setValue({ fieldId: 'custrecord_dk_cnab_line_digitable', value: linhaDigitavel })
                setBankSlip.setValue({ fieldId: 'custrecord_dk_cnab_barcode', value: barsCode })
                setBankSlip.setValue({ fieldId: 'custrecord_dk_cnab_return_code', value: codeBank })
                setBankSlip.save()

            } catch (error) {
                log.debug('linha 385 - function setBankSlipCreated', error.message)
            }

        } //* Fim da faunction setBankSlipCreated() - Funcão ok - não mexer.

        function setBankSlipError(idRec, codeBank) {

            var setBankSlip = record.load({
                type: 'customrecord_dk_cnab_aux_parcela',
                id: idRec,
                isDynamic: true
            })

            setBankSlip.setValue({ fieldId: 'custrecord_dk_cnab_return_code', value: codeBank })
            setBankSlip.save()

        } //* Fim da faunction setBankSlipError() - Funcão ok - não mexer.

        function bankSlipHTML(idRec) {
            try {
                const setBankSlip = record.load({
                    type: 'customrecord_dk_cnab_aux_parcela',
                    id: idRec,
                    isDynamic: true
                })

                const digitableLine = setBankSlip.getValue('custrecord_dk_cnab_line_digitable')
                const dueDate = setBankSlip.getValue('custrecord_dk_cnab_dt_vencimento')
                const beneficiaryName = setBankSlip.getValue('custrecord_dk_cnab_benficiario_nome').toUpperCase()
                const beneficiaryCnpj = setBankSlip.getValue('custrecord_dk_cnab_benfic_num_inscricao')
                const beneficiaryAgency = '452' //*TROCAR PELO NÚMERO DA AGÊNCIA
                const invoiceDate = setBankSlip.getValue('custrecord_dk_cnab_dt_emiss')
                const invoiceNumber = setBankSlip.getValue('custrecord_dk_cnab_num_titbeneficiario')
                const kindDocument = setBankSlip.getValue('custrecord_dk_cnab_descricao_titulo')
                const bankSlipAcceptance = setBankSlip.getValue('custrecord_dk_cnab_codigo_aceite')
                const processingDate = setBankSlip.getValue('custrecord_dk_cnab_dt_emiss')
                const ourBankSlipNumber = setBankSlip.getValue('custrecord_dk_cnab_nosso_numero')
                const bankAccountNumber = setBankSlip.getValue('custrecord_dk_cnab_numero_convenio') //*TROCAR PELO NÚMERO DA CONTA BANCÁRIA
                const amountDue = setBankSlip.getValue('custrecord_dk_cnab_val_orig').toFixed(2)
                const installment = setBankSlip.getValue('custrecord_dk_cnab_mensagem_bloqueto')
                const interestRate = setBankSlip.getValue('custrecord_dk_cnab_jurosmora_porcentagem') //*taxa de juros a.m.
                const billingWallet = setBankSlip.getValue('custrecord_dk_cnab_carteira')
                const payerName = setBankSlip.getValue('custrecord_dk_cnab_pagador_nome').toUpperCase()
                const payerCnpj = setBankSlip.getValue('custrecord_dk_cnab_pagador_num_inscricao')
                const payerStreet = setBankSlip.getValue('custrecord_dk_cnab_pagador_endereco').toUpperCase()
                const payerCity = setBankSlip.getValue('custrecord_dk_cnab_pagador_cidade').toUpperCase()
                const payerUf = setBankSlip.getValue('custrecord_dk_cnab_pagador_uf').toUpperCase()
                const payerNeighborhood = setBankSlip.getValue('custrecord_dk_cnab_pagador_bairro').toUpperCase()
                const payerZipCode = setBankSlip.getValue('custrecord_dk_cnab_pagador_cep')
                const barsCode = setBankSlip.getValue('custrecord_dk_cnab_barcode').toString()
                const formatDigitableLine = formattedDigitableLine(digitableLine)

                const beneficiaryCnpjString = formatCNPJ(beneficiaryCnpj)
                const payerCnpjString = formatCNPJ(payerCnpj)
                const realBR = formatBRL(amountDue)

                log.debug({
                    title: 'linha 442 - cnpj convertidos em string',
                    details: 'JTC - cnpj: ' + beneficiaryCnpjString + '  >> Pagador cnpj: ' + payerCnpjString + '  >> R$ ' + realBR
                })

                // const requestbarcode = https.post({})

                var bankSlip = "<!DOCTYPE html>"
                bankSlip += "<html>"
                bankSlip += "<head>"
                bankSlip += "<script src=\"https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js\"></script>"
                bankSlip += "<meta charset=\"utf-8\">"
                bankSlip += "<!--Configurar para português - Produzio RGR -->"
                bankSlip += "<title>Boleto Bancário</title>"
                bankSlip += "<link rel=\"stylesheet\" href=\"boleto_bancario.css\">"
                bankSlip += "<!---Página - Boleto Bancário -->"
                bankSlip += "</head>"
                bankSlip += "<body style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">"
                bankSlip += "<h3>Ficha de Compensação</h3>"
                bankSlip += "<div>"
                bankSlip += "<table style=\"line-height: 250%;\">"
                bankSlip += "<tr style=\"width: 100%;\" class=\"tam_fonte\">"
                bankSlip += "<th style= \"border: 1px solid black;\ line-height: 250%; height: 70px;\"  colspan=\"2\"><img src=\"https://7414781.app.netsuite.com/core/media/media.nl?id=19580&c=7414781&h=8vnvtehOlslhPRNq6-AIuNA9Oz1eCVIj6tAe2aZdiZ0ThKjK\" alt=\"Banco do Brasil\" width=\"100%\" height=\"100%\"></th>"
                bankSlip += "<th style= \"border: 1px solid black; height: 30px;\"  class=\"head_fonts\">001-9</th>"
                bankSlip += "<th style= \"border: 1px solid black; height: 30px;\"  colspan=\"4\" class=\"head_fonts\">" + formatDigitableLine + "</th>"
                bankSlip += "</tr>"
                bankSlip += "<tr style=\"line-height: 0.2;  height: 20px;\">" //* alterado a altura pra 20 px
                bankSlip += "<td style= \"border: 1px solid black; height: 50px; width: 75%;\" colspan=\"5\" >" //* height modified
                bankSlip += "<label  style=\"font-size: 9px;\">Local de pagamento</label><br></br>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">Pagável em qualquer banco.</p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black; width: 25%\" colspan=\"2\">"
                bankSlip += "<label  style=\"font-size: 9px;\">Data de vencimento</label><br></br>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + dueDate + "</p>"
                bankSlip += "</td>"
                bankSlip += "</tr>"

                bankSlip += "<tr style=\"line-height: 0.2;  height: 30px;\">"
                bankSlip += "<td style= \"border: 1px solid black; width: 75%;\"  colspan=\"5\">"
                bankSlip += "<label style=\"font-size: 9px;\">Nome do Beneficiário/CNPJ/CPF</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + beneficiaryName + "/" + beneficiaryCnpjString + "</p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black; width: 25%\"  colspan=\"2\">"
                bankSlip += "<label style=\"font-size: 9px;\">AGÊNCIA/CÓDIGO BENEFICIÁRIO</label> "
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + beneficiaryAgency + "/" + bankAccountNumber + "</p>"
                bankSlip += "</td>"
                bankSlip += "</tr>"

                bankSlip += "<tr style=\"line-height: 0.2;  height: 30px;\">"
                bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
                bankSlip += "<label style=\"font-size: 9px;\">Data do Documento</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + invoiceDate + "</p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black;\" colspan=\"1\" class=\"col-10\">"
                bankSlip += "<label style=\"font-size: 9px;\">Número do Documento</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"> NFE: " + invoiceNumber + "</p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
                bankSlip += "<label  style=\"font-size: 9px;\">Espécie Documento</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + kindDocument + "</p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
                bankSlip += "<label style=\"font-size: 9px;\">Aceite</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + bankSlipAcceptance + "</p>"
                bankSlip += "</td>"
                bankSlip += "<td  style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\" >"
                bankSlip += "<label style=\"font-size: 9px;\">Data Processamento</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + processingDate + "</p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black; width: 25%\"  colspan=\"1\" >"
                bankSlip += "<label style=\"font-size: 9px;\">Nosso Número</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + ourBankSlipNumber + "</p>"
                bankSlip += "</td>"
                bankSlip += "</tr>"

                bankSlip += "<tr style=\"line-height: 0.2; height: 30px;\">"
                bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
                bankSlip += "<label style=\"font-size: 9px;\">Uso do Banco</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"><br></p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
                bankSlip += "<label style=\"font-size: 9px;\">Carteira</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + billingWallet + "</p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
                bankSlip += "<label style=\"font-size: 9px;\">Espécie Moeda</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">R$</p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
                bankSlip += "<label style=\"font-size: 9px;\">Quantidade de Moeda</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"><br>  </p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
                bankSlip += "<label style=\"font-size: 9px;\">X Valor</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"><br> </p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black; width: 25%\"  colspan=\"1\">"
                bankSlip += "<label style=\"font-size: 9px;\">Valor do Documento</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">R$" + realBR + "</p>"
                bankSlip += "</td></tr>"

                bankSlip += "<tr style=\"line-height: 0.2;  height: 30px;\">"
                bankSlip += "<td style= \"border: 1px solid black; width: 75%;\"  colspan=\"5\">"
                bankSlip += "<label style=\"font-size: 9px;\">Informações de Responsabilidade do Beneficiário</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + installment + "</p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black; width: 25%\"  colspan=\"2\">"
                bankSlip += "<label style=\"font-size: 9px;\">Desconto/Abatimento</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">R$ </p>"
                bankSlip += "</td></tr>"

                bankSlip += "<tr style=\"line-height: 0.2;  height: 30px;\">"
                bankSlip += "<td style= \"border: 1px solid black; width: 75%;\"  colspan=\"5\" >"
                bankSlip += "<label style=\"font-size: 9px;\">Informações de Responsabilidade do Beneficiário</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"><br></p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black; width: 25%\" colspan=\"2\">"
                bankSlip += "<label style=\"font-size: 9px;\">Juros/Multa: </label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + interestRate + "% a.m. </p>"
                bankSlip += "</td></tr>"

                bankSlip += "<tr style=\"line-height: 0.2;  height: 30px;\">"
                bankSlip += "<td style= \"border: 1px solid black; width: 75%;\"  colspan=\"5\">"
                bankSlip += "<label style=\"font-size: 9px;\">Informações de Responsabilidade do Beneficiário</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-weight: bold;\">Somente pagar boleto impresso da JTC Distribuidora. </p><p>Desconsidere qualquer mensagem sobre descontos nas duplicatas,</p> <p>que não venham com a extensão: @jtcd.com.br; Qualquer dificuldade em pagar o boleto entrar em contato pelo tel: (11) 3322-9300</p>"
                bankSlip += "</td>"
                bankSlip += "<td style= \"border: 1px solid black; width: 25%\"  colspan=\"2\">"
                bankSlip += "<label style=\"font-size: 9px;\">Valor Cobrado</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">R$</p>"
                bankSlip += "</td></tr>"

                bankSlip += "<tr style=\"line-height: 0.2;  height: 70px;\">"
                bankSlip += "<td style= \"border: 1px solid black; width: 100%;\" colspan=\"6\" >"
                bankSlip += "<label style=\"font-size: 9px;\">Nome do Pagador/CNPJ/CPF/Endereço</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + payerName + " - " + payerCnpjString + "</p>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + payerStreet + " - " + payerNeighborhood + "</p>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + payerCity + " - " + payerUf + " - " + payerZipCode + "</p>"
                bankSlip += "</td></tr>"

                bankSlip += "<tr style=\"line-height: 0.2; height: 10px;\">"
                bankSlip += "<td style= \"border: 1px solid black; line-height: 250%; line-height: 0.2;\"  colspan=\"6\">"
                bankSlip += "<label style=\"font-size: 9px;\">Código de Barras</label>"
                bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"> <br></p>"
                // bankSlip += "<barcode codetype=\"code128\" showtext=\"'" + digitableLine.toString() + "'\"/>" //*atenção ao barcode

                //* bankSlip += "<barcode codetype=\"code128\" showtext=\"false\" height=\"15px\" width=\"420px\" value=\"" + barsCode + "\"/>" //*atenção ao barcode
                // bankSlip += "<svg id=\"barcode\" ></svg>"
                const url = 'https://barcodes.pro/get/generator?f=svg&s=itf14&d='+barsCode+'&cm=url%28%23black%29&sf=0.9&sy=0.5&ts=10&th=10'
                const requesp = https.get({url: url})
                bankSlip += requesp.body
                // log.audit("reqqu", requesp.body)
                bankSlip += "<script>"
                bankSlip += "JsBarcode(\"#barcode\",'" + digitableLine.toString() + "', {"
                bankSlip += "format: \"CODE128\" ,"
                bankSlip += "displayValue: true,"
                bankSlip += "width: 1.48,"
                bankSlip += "height: 40,"
                bankSlip += "fontSize: 15,"
                bankSlip += "margin: 15"
                bankSlip += "})"
                bankSlip += "</script >"
                bankSlip += "</td></tr>"
                
                
                bankSlip += "</table>"
                bankSlip += "</div></body>"
                bankSlip += "</html>"
                
                const bankSlipObj = file.create({
                    name: ourBankSlipNumber.toString() + '.html',
                    fileType: file.Type.HTMLDOC,
                    contents: bankSlip,
                    description: 'Boleto bancário',
                    folder: 17
                })
                bankSlipObj.save()


                const senderId = -5
                // const emails = 'rogerio.rodrigues@dkcloud.com.br'
                const subject = 'HTML CRIADO BOLETO TESTE.' + ' - > NOSSO NÚMERO: ' + ourBankSlipNumber + '.'

                log.debug({
                    title: 'linha 613 --> function bankSlipHTML',
                    details: bankSlipObj
                })

                // email.send({

                //     author: senderId,
                //     recipients: emails,
                //     subject: subject,
                //     body: bankSlipObj
                // })

            }
            catch (error) {
                log.debug({
                    title: 'linha 628 - function bankSlipHTML',
                    details: 'O ERRO É:   ' + error.message
                })
            }

        } //* Fim da function bankSlipHTML()

        function emailBankSlip(id) { //* Formatar subject (titulo)

            const nossoNumero = getNossoNumero(id)
            const senderId = -5
            // const emails = 'denis@jtcd.com.br'
            const arrAttachSlip = getAttachSlip(nossoNumero)
            const bankSlipData = getBankSlipData(id)

            const emailCustomer = getEmailCustomer(id).toLowerCase()

            log.debug({
                title: 'linha 646 -- id CNAB e email do cliente  ',
                details: ' >> id do registro AUX CNAB:  ' + id + '  >> email do cliente: ' + emailCustomer
            })

            const subject = 'JTC  - nota fiscal:  ' + bankSlipData.notaFiscal + ' - envio de boleto bancário.'

            var mensagem = '\n Prezado cliente, \n\nEstá anexado o arquivo da " '
            mensagem += bankSlipData.parcela
            mensagem += ' " da sua compra de nota fiscal: " '
            mensagem += bankSlipData.notaFiscal + ' " com JTC Distribuidora.'

            const fileSearchObj = search.create({
                type: "file",
                filters:
                    [
                        ["name", "haskeywords", nossoNumero]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "ID interno" }),
                    ]
            })

            fileSearchObj.run().each(function (result) {

                const idArquivo = result.getValue({ name: "internalid", label: "ID interno" })
                const attachSlip = file.load({
                    id: idArquivo
                })

                // email.send({
                //     author: senderId,
                //     recipients: emails,
                //     subject: subject,
                //     body: mensagem,
                //     attachments: [attachSlip]
                // })
                // try {
                //     email.send({
                //         author: senderId,
                //         recipients: emailCustomer,
                //         subject: subject,
                //         body: mensagem,
                //         attachments: [attachSlip]
                //     })
                // } catch (error) {
                //     log.debug({
                //         title: 'linha 693 - function emailBankSlip - email para o cliente',
                //         details: 'O erro é: ' + error.message
                //     })
                // }

                return true;
            })

        } //* Fim function  emailBankSlip()

        function getAttachSlip(nossoNumero) {

            log.debug('linha 705 - function getAttachSlip', nossoNumero)

            var filesBankSlip = []

            const fileSearchObj = search.create({
                type: "file",
                filters:
                    [
                        ["name", "haskeywords", nossoNumero]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "ID interno" }),
                    ]
            });

            var searchResultCount = fileSearchObj.runPaged().count;
            log.debug("linha 722 - fileSearchObj result count", searchResultCount);

            fileSearchObj.run().each(function (result) {

                var arquivo = result.getValue({ name: "internalid", label: "ID interno" })
                filesBankSlip.push(arquivo)
                return true;
            });

            log.debug('linha 731- arquivo de boleto --> id = ', filesBankSlip)

            return filesBankSlip
        } //* Fim da function getAttachSlip()

        function getNossoNumero(id) {

            const rLoad = record.load({
                type: 'customrecord_dk_cnab_aux_parcela',
                id: id
            })

            return rLoad.getValue('custrecord_dk_cnab_nosso_numero')

        } //*Fim da function getNossoNumero(id)

        function formattedDigitableLine(digitableLine) {


            var concatDigitableLine
            var linhaDigitavel = digitableLine

            log.debug({
                title: ' linha 754 - function formattedDigitableLine',
                details: 'valor da linha digitável = ' + linhaDigitavel
            })

            const field_1_1 = linhaDigitavel.substr(0, 5)
            const field_1_2 = linhaDigitavel.substr(5, 5)
            const field_2_1 = linhaDigitavel.substr(10, 5)
            const field_2_2 = linhaDigitavel.substr(15, 6)
            const field_3_1 = linhaDigitavel.substr(21, 5)
            const field_3_2 = linhaDigitavel.substr(26, 6)
            const field_4 = linhaDigitavel.substr(32, 1)
            const field_5 = linhaDigitavel.substring(33)

            concatDigitableLine = field_1_1 + '.' + field_1_2 + ' ' + field_2_1 + '.' + field_2_2 + ' ' + field_3_1 + '.' + field_3_2
                + ' ' + field_4 + ' ' + field_5

            log.debug({
                title: ' linha 771 - function formattedDigitableLine',
                details: 'Linha digitável formatada = ' + concatDigitableLine
            })

            return concatDigitableLine

        } //* function formattedDigitableLine()

        function formatCNPJ(cnpj) {

            var cnpjStr = cnpj.toString()
            const cnpjSize = cnpjStr.length
            if (cnpjSize == 13) {

                cnpjStr = '0' + cnpjStr
            }

            return cnpjStr
        } //*  function formatCNPJ

        function formatBRL(valor) {

            const real = valor
            return format.format({ value: real, type: format.Type.FLOAT })
        }

        function getEmailCustomer(id) {

            const rLoad = record.load({
                type: 'customrecord_dk_cnab_aux_parcela',
                id: id
            })
            const contasReceber = rLoad.getValue('custrecord_dk_cnab_transacao')
            const idCustomer = getIdCustomer(contasReceber)
            const recCustomerEmail = getRecCustomerEmail(idCustomer)

            log.debug({
                title: ' linha 808 >> function getEmailCustomer()',
                details: ' o email cadastrado do cliente: ' + recCustomerEmail
            })

            return recCustomerEmail

        } //* Fim function getEmailCustomer() - obter email do cliente para enviar invoice ao cliente

        function getIdCustomer(idInvoice) {

            const recInvoice = record.load({
                type: record.Type.INVOICE,
                id: idInvoice
            })
            const idCustomer = recInvoice.getValue('companyid')

            log.debug({
                title: ' linha 825 >> function getIdCustomer()',
                details: ' o id cadastrado do cliente: ' + idCustomer
            })

            return idCustomer
        } //* Fim da function getIdCustomer()

        function getRecCustomerEmail(idCustomer) {

            const recCustomer = record.load({
                type: record.Type.CUSTOMER,
                id: idCustomer
            })

            const customerEmail = recCustomer.getValue('email')

            log.debug({
                title: ' linha 842 >> function getIdCustomer()',
                details: ' o email cadastrado do cliente: ' + customerEmail
            })

            return customerEmail

        } //* Fim function getRecCustomerEmail(idCustomer) - obtém email do registro do cliente

        function getBankSlipData(id) {

            const rLoad = record.load({
                type: 'customrecord_dk_cnab_aux_parcela',
                id: id
            })

            const installment = rLoad.getValue('custrecord_dk_cnab_seq_parcela').toUpperCase()
            const invoice = rLoad.getValue('custrecord_dk_cnab_num_titbeneficiario')

            log.debug({
                title: ' linha 861 >> function getBankSlipData()',
                details: ' >> id da parcela: ' + id + ' >> parcela:  ' + installment + ' >> nº nota fiscal:  ' + invoice
            })

            return {
                parcela: installment,
                notaFiscal: invoice
            }

        } //* function getBankSlipData(id)


        return {
            afterSubmit: afterSubmit
        }
    });