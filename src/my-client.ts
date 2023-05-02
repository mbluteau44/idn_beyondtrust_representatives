import { ConnectorError, logger } from "@sailpoint/connector-sdk"
import {sra_auth, sra_GET_accounts, sra_GET_account, sra_GET_group_policies,sra_create_account,sra_change_account,sra_change_account_status,sra_create_account_ent,sra_GET_account_groups_table,sra_GET_account_groups_with_table,sra_GET_security_providers,sra_GET_group_policy,sra_GET_account_details,sra_GET_accounts_details,check_token_expiration} from './sra-functions'


export class MyClient {
    private readonly instance?: string
    private readonly authUrl?: string
    private readonly client_id?: string
    private readonly client_secret?: string
//    private readonly token?: string
//    private readonly identity?: string

    constructor(config: any) {
        // Fetch necessary properties from config.
        // Following properties actually do not exist in the config -- it just serves as an example.
        this.instance = config?.instance
        this.authUrl = config?.authUrl
        this.client_id = config?.client_id
        this.client_secret = config?.client_secret
        //Global Variables
        globalThis.__INSTANCE = config?.instance
        globalThis.__AUTHURL = config?.authUrl
        globalThis.__CLIENT_ID = config?.client_id
        globalThis.__CLIENT_SECRET = config?.client_secret
    }

    async getAllAccounts(): Promise<any[]> {

        // Check expiration time for Bearer token in Global variable
        let valid_token = await check_token_expiration()
        if((valid_token == 'undefined') || (valid_token == 'expired')){
            console.log('######### Expiration Time is undefined or in the past')
            let resAuth = await sra_auth()
            logger.info(`resAuth : ${JSON.stringify(resAuth.data)}`)
                }
        else if(valid_token == 'valid'){
            console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
            }

            // Declare account
            let accounts: any[] = []
            try{
                let resAccounts = await sra_GET_accounts_details()
                accounts = resAccounts
            }  catch (err:any) {
                console.log('##### Error name = '+err.name)
                console.log('##### Error message = '+err.message)
                if(err.message == 'Request failed with status code 401'){
                    console.log('#### error status = 401')
                    let resAuth2: any = await sra_auth()
                    logger.info(`resAuth2 : ${JSON.stringify(resAuth2.data)}`)
                    let resAccounts2 = await sra_GET_accounts_details()
                    accounts = resAccounts2
                    }
            }  finally{
                    return accounts
                    }

    }

    async getAccount(identity: string): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.

        // Check expiration time for Bearer token in Global variable
        let valid_token = await check_token_expiration()
        if((valid_token == 'undefined') || (valid_token == 'expired')){
            console.log('######### Expiration Time is undefined or in the past')
            let resAuth = await sra_auth()
                }
        else if(valid_token == 'valid'){
            console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
            }

            // Declare account
            let account = {}
            try{
                let resAccount = await sra_GET_account(identity)
                account = resAccount.data
            }  catch (err:any) {
                console.log('##### Error name = '+err.name)
                console.log('##### Error message = '+err.message)
                if(err.message == 'Request failed with status code 401'){
                    console.log('#### error status = 401')
                    let resAuth2: any = await sra_auth()
                    let resAccount2 = await sra_GET_account(identity)
                    account = resAccount2.data
                    }   else{throw new ConnectorError(err.name+'  ::  '+err.message)}
            }  finally{
                    let resAccount = await sra_GET_account_details(account)
                    return resAccount
                    }

    }

    async createAccount(account: string): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.

        // Check expiration time for Bearer token in Global variable
        let valid_token = await check_token_expiration()
        if((valid_token == 'undefined') || (valid_token == 'expired')){
            console.log('######### Expiration Time is undefined or in the past')
            let resAuth = await sra_auth()
            logger.info(`resAuth : ${JSON.stringify(resAuth.data)}`)
                }
        else if(valid_token == 'valid'){
            console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
            }

            // Declare account
            let addAccount = {}
            try{
                let resAccount = await sra_create_account_ent(account)
                addAccount = resAccount
            }  catch (err:any) {
                console.log('##### Error name = '+err.name)
                console.log('##### Error message = '+err.message)
                if(err.message == 'Request failed with status code 401'){
                    console.log('#### error status = 401')
                    let resAuth2: any = await sra_auth()
                    logger.info(`resAuth2 : ${JSON.stringify(resAuth2.data)}`)
                    let resAccounts2 = await sra_create_account_ent(account)
                    addAccount = resAccounts2
                    }
            }  finally{
                //let resAccount = await sra_GET_account_details(createAccount)
                return addAccount
                    }

    }

    async changeAccount(account: string, change: any): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.

        // Check expiration time for Bearer token in Global variable
        let valid_token = await check_token_expiration()
        if((valid_token == 'undefined') || (valid_token == 'expired')){
            console.log('######### Expiration Time is undefined or in the past')
            let resAuth = await sra_auth()
            logger.info(`resAuth : ${JSON.stringify(resAuth.data)}`)
                }
        else if(valid_token == 'valid'){
            console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
            }

            // Declare account
            try{
                let changeAccount = await sra_change_account(account,change)
            }  catch (err:any) {
                console.log('##### Error name = '+err.name)
                console.log('##### Error message = '+err.message)
                if(err.message == 'Request failed with status code 401'){
                    console.log('#### error status = 401')
                    let resAuth2: any = await sra_auth()
                    logger.info(`resAuth2 : ${JSON.stringify(resAuth2.data)}`)
                    let changeAccount2 = await sra_change_account(account,change)
                    }
            }  finally{
                let getAccount = await sra_GET_account(account)
                let resAccount = await sra_GET_account_details(getAccount.data)
                return resAccount
                        }
    }

    async changeAccountStatus(account: string, change: any): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.

        // Check expiration time for Bearer token in Global variable
        let valid_token = await check_token_expiration()
        if((valid_token == 'undefined') || (valid_token == 'expired')){
            console.log('######### Expiration Time is undefined or in the past')
            let resAuth = await sra_auth()
            logger.info(`resAuth : ${JSON.stringify(resAuth.data)}`)
                }
        else if(valid_token == 'valid'){
            console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
            }

            // Declare account
            try{
                let changeAccount = await sra_change_account_status(account,change)
            }  catch (err:any) {
                console.log('##### Error name = '+err.name)
                console.log('##### Error message = '+err.message)
                if(err.message == 'Request failed with status code 401'){
                    console.log('#### error status = 401')
                    let resAuth2: any = await sra_auth()
                    logger.info(`resAuth2 : ${JSON.stringify(resAuth2.data)}`)
                    let changeAccount2 = await sra_change_account_status(account,change)
                    }
            }  finally{
                let getAccount = await sra_GET_account(account)
                let resAccount = await sra_GET_account_details(getAccount.data)
                return resAccount
                        }

    }

    async testConnection(): Promise<any> {

        // Check expiration time for Bearer token in Global variable
        let valid_token = await check_token_expiration()
        if((valid_token == 'undefined') || (valid_token == 'expired')){
            console.log('######### Expiration Time is undefined or in the past')
            let resAuth = await sra_auth()
            logger.info(`resAuth : ${JSON.stringify(resAuth.data)}`)
                }
        else if(valid_token == 'valid'){
            console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
            }

        // TEST = GET Security Providers
        try{
        let SPs = await sra_GET_security_providers()
        logger.info(`Service Providers : ${JSON.stringify(SPs.data)}`)
    } catch (err:any) {
        console.log('##### Error name = '+err.name)
        console.log('##### Error message = '+err.message)
        if(err.message == 'Request failed with status code 401'){
            console.log('#### error status = 401')
            let resAuth2: any = await sra_auth()
            logger.info(`resAuth2 : ${JSON.stringify(resAuth2.data)}`)
            let SPs2 = await sra_GET_security_providers()
        }   else{throw new ConnectorError(err.name+'  ::  '+err.message)}
    }  finally{
        return {}
        }
    }

    async getAllEntitlements(): Promise<any[]> {
        // Check expiration time for Bearer token in Global variable
        let valid_token = await check_token_expiration()
        if((valid_token == 'undefined') || (valid_token == 'expired')){
            console.log('######### Expiration Time is undefined or in the past')
            let resAuth = await sra_auth()
            logger.info(`resAuth : ${JSON.stringify(resAuth.data)}`)
                }
        else if(valid_token == 'valid'){
            console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
            }

            // Declare entitlements
            let entitlements: any[] = []
            try{
                let resGP = await sra_GET_group_policies()
                entitlements = resGP.data
            }  catch (err:any) {
                console.log('##### Error name = '+err.name)
                console.log('##### Error message = '+err.message)
                if(err.message == 'Request failed with status code 401'){
                    console.log('#### error status = 401')
                    let resAuth2: any = await sra_auth()
                    let resGP2 = await sra_GET_group_policies()
                    entitlements = resGP2.data
                }
            }  finally{
                return entitlements
                        }

    }

    async getEntitlement(identity: string): Promise<any[]> {
        // Check expiration time for Bearer token in Global variable
        let valid_token = await check_token_expiration()
        if((valid_token == 'undefined') || (valid_token == 'expired')){
            console.log('######### Expiration Time is undefined or in the past')
            let resAuth = await sra_auth()
            logger.info(`resAuth : ${JSON.stringify(resAuth.data)}`)
                }
        else if(valid_token == 'valid'){
            console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
            }

            // Declare entitlement
            let entitlement:any = {}
            try{
                let resGP = await sra_GET_group_policy(identity)
                entitlement = resGP.data
            }  catch (err:any) {
                console.log('##### Error name = '+err.name)
                console.log('##### Error message = '+err.message)
                if(err.message == 'Request failed with status code 401'){
                    console.log('#### error status = 401')
                    let resAuth2: any = await sra_auth()
                    logger.info(`resAuth2 : ${JSON.stringify(resAuth2.data)}`)
                    let resGP2 = await sra_GET_group_policy(identity)
                    entitlement = resGP2.data
                }
            }  finally{
                return entitlement
                        }

    }

}
