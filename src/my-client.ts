import { ConnectorError, logger } from "@sailpoint/connector-sdk"
import {sra_auth, sra_GET_accounts, sra_GET_account, sra_GET_group_policies, sra_GET_account_groups,sra_create_account,sra_change_account,sra_change_account_status,sra_create_account_ent,sra_GET_account_groups_table,sra_GET_account_groups_with_table,sra_GET_security_providers,sra_GET_group_policy} from './sra-functions'


export class MyClient {
    private readonly instance?: string
    private readonly authUrl?: string
    private readonly client_id?: string
    private readonly client_secret?: string
    private readonly remoteSupport?: string
//    private readonly token?: string
//    private readonly identity?: string

    constructor(config: any) {
        // Fetch necessary properties from config.
        // Following properties actually do not exist in the config -- it just serves as an example.
        this.instance = config?.instance
        this.authUrl = config?.authUrl
        this.client_id = config?.client_id
        this.client_secret = config?.client_secret
        this.remoteSupport = config?.remoteSupport
    }

    async getProduct(): Promise<any> {

        return this.remoteSupport
    }


    async getAllAccounts(): Promise<any[]> {
        let res = await sra_auth(this.authUrl,this.client_id,this.client_secret)

        let resA = await sra_GET_accounts(this.instance,"Bearer "+res.data.access_token)

        let resB = await sra_GET_group_policies(this.instance,"Bearer "+res.data.access_token)

        let GPTable = await sra_GET_account_groups_table(this.instance,"Bearer "+res.data.access_token,resB.data)
        logger.info('GPTable : '+JSON.stringify(GPTable))

    // GET Security Providers
    let SPs = await sra_GET_security_providers(this.instance,"Bearer "+res.data.access_token)
    logger.info('SPs.data.length = '+SPs.data.length)

        logger.info('getAllAccounts remoteSupport = '+this.remoteSupport)
        const ret = []

        for (let index = 0; index < resA.data.length && (index) < resA.data.length; ++index) {
//            let resC = await sra_GET_account_groups(this.instance,"Bearer "+res.data.access_token,resA.data[index].id,resB.data)
            let resC = await sra_GET_account_groups_with_table(resA.data[index].id,GPTable)
            let spname = ''
            for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
//                logger.info('SPs.data[indexSP].id = '+SPs.data[indexSP].id+'    security_provider_id = '+resA.data[index].security_provider_id)
                if(SPs.data[indexSP].id == resA.data[index].security_provider_id){spname = SPs.data[indexSP].name}
            }

            let user = {}
            user = { 
                id: resA.data[index].id.toString(),
                username: resA.data[index].username,
                email_address: resA.data[index].email_address,
                enabled: resA.data[index].enabled,
                preferred_email_language: resA.data[index].preferred_email_language,
                public_display_name: resA.data[index].public_display_name,
                private_display_name: resA.data[index].private_display_name,
                failed_logins: resA.data[index].failed_logins,
                two_factor_required: resA.data[index].two_factor_required,
                security_provider_id: resA.data[index].security_provider_id,
                security_provider_name: spname,
                groups: resC
            }
            ret.push(user)
        }       

        return ret
    }

    async getAccount(identity: string): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let res = await sra_auth(this.authUrl,this.client_id,this.client_secret)

        let resA = await sra_GET_account(this.instance,"Bearer "+res.data.access_token,identity)
        let resB = await sra_GET_group_policies(this.instance,"Bearer "+res.data.access_token)

//        let resC = await sra_GET_account_groups(this.instance,"Bearer "+res.data.access_token,resA.data.id,resB.data)
// GET Group Policy members Table
let GPTable = await sra_GET_account_groups_table(this.instance,"Bearer "+res.data.access_token,resB.data)
// GET Security Providers
    let SPs = await sra_GET_security_providers(this.instance,"Bearer "+res.data.access_token)
let resC = await sra_GET_account_groups_with_table(resA.data.id,GPTable)
    let spname = ''
    for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
        if(SPs.data[indexSP].id == resA.data.security_provider_id){spname = SPs.data[indexSP].name}
    }

        return { 
                id: resA.data.id.toString(),
                username: resA.data.username,
                email_address: resA.data.email_address,
                enable: resA.data.enabled,
                preferred_email_language: resA.data.preferred_email_language,
                public_display_name: resA.data.public_display_name,
                private_display_name: resA.data.private_display_name,
                failed_logins: resA.data.failed_logins,
                two_factor_required: resA.data.two_factor_required,
                security_provider_id: resA.data.security_provider_id,
                security_provider_name: spname,
                groups: resC
            }
    }

    async createAccount(account: string): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let res = await sra_auth(this.authUrl,this.client_id,this.client_secret)

        let resA: any = await sra_create_account_ent(this.instance,this.remoteSupport,"Bearer "+res.data.access_token,account)
        logger.info(`myClient resA : ${JSON.stringify(resA)}`)
        logger.info(`remoteSupport : ${this.remoteSupport}`)
        let resB = await sra_GET_group_policies(this.instance,"Bearer "+res.data.access_token)
//        let resC = await sra_GET_account_groups(this.instance,"Bearer "+res.data.access_token,resA.id,resB.data)
// GET Group Policy members Table
let GPTable = await sra_GET_account_groups_table(this.instance,"Bearer "+res.data.access_token,resB.data)
// GET Security Providers
    let SPs = await sra_GET_security_providers(this.instance,"Bearer "+res.data.access_token)
let resC = await sra_GET_account_groups_with_table(resA.id,GPTable)
    let spname = ''
    for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
        if(SPs.data[indexSP].id == resA.security_provider_id){spname = SPs.data[indexSP].name}
    }

        return { 
                id: resA.id.toString(),
                username: resA.username,
                email_address: resA.email_address,
                enable: resA.enabled,
                preferred_email_language: resA.preferred_email_language,
                public_display_name: resA.public_display_name,
                private_display_name: resA.private_display_name,
                failed_logins: resA.failed_logins,
                two_factor_required: resA.two_factor_required,
                security_provider_id: resA.security_provider_id,
                security_provider_name: spname,
                groups: resC
            }
    }

    async changeAccount(account: string, change: any): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let res = await sra_auth(this.authUrl,this.client_id,this.client_secret)

//        throw new ConnectorError('Unknown account change op: ' + JSON.stringify(changes))        

//        changes.forEach((c: any) => {
            sra_change_account(this.instance,"Bearer "+res.data.access_token,account,change)
            logger.info(`forEach change : ${JSON.stringify(change)}`)
//        })

        let resB = await sra_GET_group_policies(this.instance,"Bearer "+res.data.access_token)
//        let resC = await sra_GET_account_groups(this.instance,"Bearer "+res.data.access_token,resA.data.id,resB.data)
// GET Group Policy members Table
let GPTable = await sra_GET_account_groups_table(this.instance,"Bearer "+res.data.access_token,resB.data)
// GET Security Providers
    let SPs = await sra_GET_security_providers(this.instance,"Bearer "+res.data.access_token)
    let resA = await sra_GET_account(this.instance,"Bearer "+res.data.access_token,account)
    let resC = await sra_GET_account_groups_with_table(resA.data.id,GPTable)
    let spname = ''
    for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
        if(SPs.data[indexSP].id == resA.data.security_provider_id){spname = SPs.data[indexSP].name}
    }
        
        return { 
                id: resA.data.id.toString(),
                username: resA.data.username,
                email_address: resA.data.email_address,
                enable: resA.data.enabled,
                preferred_email_language: resA.data.preferred_email_language,
                public_display_name: resA.data.public_display_name,
                private_display_name: resA.data.private_display_name,
                failed_logins: resA.data.failed_logins,
                two_factor_required: resA.data.two_factor_required,
                security_provider_id: resA.data.security_provider_id,
                security_provider_name: spname,
                groups: resC
            }
    }

    async changeAccountStatus(account: string, change: any): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let res = await sra_auth(this.authUrl,this.client_id,this.client_secret)
  
        let resB = await sra_GET_group_policies(this.instance,"Bearer "+res.data.access_token)
//        let resC = await sra_GET_account_groups(this.instance,"Bearer "+res.data.access_token,resA.data.id,resB.data)
// GET Group Policy members Table
let GPTable = await sra_GET_account_groups_table(this.instance,"Bearer "+res.data.access_token,resB.data)
// GET Security Providers
    let SPs = await sra_GET_security_providers(this.instance,"Bearer "+res.data.access_token)
    let resA = await sra_change_account_status(this.instance,"Bearer "+res.data.access_token,account,change)
    let resC = await sra_GET_account_groups_with_table(resA.data.id,GPTable)
    let spname = ''
    for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
        if(SPs.data[indexSP].id == resA.data.security_provider_id){spname = SPs.data[indexSP].name}
    }
        
        return { 
                id: resA.data.id.toString(),
                username: resA.data.username,
                email_address: resA.data.email_address,
                enable: resA.data.enabled,
                preferred_email_language: resA.data.preferred_email_language,
                public_display_name: resA.data.public_display_name,
                private_display_name: resA.data.private_display_name,
                failed_logins: resA.data.failed_logins,
                two_factor_required: resA.data.two_factor_required,
                security_provider_id: resA.data.security_provider_id,
                security_provider_name: spname,
                groups: resC
            }
    }

    async testConnection(): Promise<any> {

        let res = await sra_auth(this.authUrl,this.client_id,this.client_secret)


logger.info(`res : ${res}`)

return {}
}
async getAllEntitlements(): Promise<any[]> {
    let res = await sra_auth(this.authUrl,this.client_id,this.client_secret)

    let resA = await sra_GET_group_policies(this.instance,"Bearer "+res.data.access_token)

    return resA.data

}

async getEntitlement(identity: string): Promise<any[]> {
    let res = await sra_auth(this.authUrl,this.client_id,this.client_secret)

    let resA = await sra_GET_group_policy(this.instance,"Bearer "+res.data.access_token,identity)

    return resA.data

}

}
