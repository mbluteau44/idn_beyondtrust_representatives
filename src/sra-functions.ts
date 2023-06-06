// BeyondTrust Secure Remote Access functions
// Products:  Remote Support and Privileged Remote Access
// The only difference between RS and PRA:  RS has extra user attribute: private_display_name
import { ConnectorError, logger } from '@sailpoint/connector-sdk'

// =================================================
// GENERIC - Check OAuth Bearer Token expiration time
// =================================================
export async function check_token_expiration() {

// Check EXPIRATION_TIME
console.log('auth data before Auth = '+globalThis.__ACCESS_TOKEN)
let now = 0
now = Date.now();
console.log('now Time =        '+now)
console.log('Expiration Time = '+globalThis.__EXPIRATION_TIME)
const time_buffer = 100
let valid_token = 'valid'
if(!globalThis.__EXPIRATION_TIME){
    console.log('######### Expiration Time is undefined')
    valid_token = 'undefined'
}
else{
    if(globalThis.__EXPIRATION_TIME - time_buffer <= now){
        console.log('Expiration Time is in the past')
        valid_token = 'expired'
    }
    else{
        console.log('### Expiration Time is in the future:  No need to Re-Authenticate')
        valid_token = 'valid'
    }
}

return valid_token

}

// =================================================
// GENERIC - Smart Error Handling
// =================================================
export async function smart_error_handling(err: any) {
    //  This function is for replacing Axios generic errors with product specific errors messages and toubleshooting suggestions.

    console.log('############ We are in smart_error handling, error name = '+err.name+'    Error Message = '+err.message)
    // Smart Error Handling
    if(err.message.substr(0,21) == 'getaddrinfo ENOTFOUND'){
        throw new ConnectorError(err.message+'  ::  Verify the Source instance portion of the URL in Configuration')
    }   else if(err.message == 'Request failed with status code 401'){
        throw new ConnectorError(err.message+'  ::  Verify that the Source API account client_id and client_secret are valid in Configuration')
}   else if(err.message == 'Request failed with status code 403'){
            throw new ConnectorError(err.message+'  ::  Verify that the Source API account has required permissions.  Permission for BeyondTrust is: Allow access for Configuration API')
}   else if(err.message == 'Request failed with status code 404'){
            throw new ConnectorError(err.message+'  ::  Source instance responded, but there is a problem with the URL in Configuration')
    }    else{
        console.log('about to throw ConnectorError')
        throw new ConnectorError(err.name+'  ::  '+err.message)
    }
    }
    
// SRA Functions

// =================================================
// Authentication Simple
// =================================================
export async function sra_auth() {

        // set the Authorization header
    let base64data = Buffer.from(globalThis.__CLIENT_ID+':'+globalThis.__CLIENT_SECRET).toString('base64')
    const authorization = 'Basic '+base64data
    
    const axios = require('axios');
    const qs = require('querystring');
    const data = {
        grant_type: 'client_credentials'
    };
    // set the headers
    const config = {
        method: 'post',
        rejectUnauthorized: false,
        url: globalThis.__AUTHURL,
        data: qs.stringify(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authorization
        }
    };
    try{
        let resAuth = await axios(config)
        // Store session token in Global variable so it is available for other functions
        let now = 0
        now = Date.now();
        globalThis.__ACCESS_TOKEN = resAuth.data.access_token
        globalThis.__EXPIRATION_TIME = now + (resAuth.data.expires_in * 1000)    
        return resAuth
    }   catch (err:any) {
        await smart_error_handling(err)
    }
    
    }
    
// =================================================
// GET all Users 
// =================================================
export async function sra_GET_accounts(current_page: string,per_page: string) {

const axios = require('axios');
const qs = require('querystring');

// set the headers
const config = {
    method: 'get',
    rejectUnauthorized: false,
    url: globalThis.__INSTANCE + '/api/config/v1/user?current_page='+current_page+'&per_page='+per_page,
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
    }
};
let res = await axios(config)

  return res

}

// =================================================
// GET all Users Details
// =================================================
export async function sra_GET_accounts_details() {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'get',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/api/config/v1/user',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
let accounts1 = await sra_GET_accounts('1','100')
var accounts = accounts1.data

    // PAGINATION BEGIN
    const numberOfUsers = accounts1.headers['x-bt-pagination-total']
    const currentPage = accounts1.headers['x-bt-pagination-current-page']
    const perPage = accounts1.headers['x-bt-pagination-per-page']
    const lastPage = accounts1.headers['x-bt-pagination-last-page']
    console.log('Total # of Users = '+numberOfUsers+'  Last Page = '+lastPage+'  Current Page = '+currentPage+'  # per Page = '+perPage)
    if(parseInt(lastPage) > 1){
        for (let page = 2; page < parseInt(lastPage) + 1; ++page) {
            console.log('PAGINATION: Last Page = '+lastPage+'   We are working on Page # '+page)
            let accounts2 = await sra_GET_accounts(page.toString(),'100')
            accounts = accounts.concat(accounts2.data)
        }
    }
    // PAGINATION END
    console.log('accounts = '+JSON.stringify(accounts))

    let resGP = await sra_GET_group_policies()
    let GPTable = await sra_GET_account_groups_table(resGP.data)

// GET Security Providers
let SPs = await sra_GET_security_providers()

    const ret = []

    for (let index = 0; index < accounts.length && (index) < accounts.length; ++index) {
        let GroupMemberships = await sra_GET_account_groups_with_table(accounts[index].id,GPTable)
        let spname = ''
        for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
            if(SPs.data[indexSP].id == accounts[index].security_provider_id){spname = SPs.data[indexSP].name}
        }

        let user = {}
        user = { 
            id: accounts[index].id.toString(),
            username: accounts[index].username,
            email_address: accounts[index].email_address,
            enabled: accounts[index].enabled,
            preferred_email_language: accounts[index].preferred_email_language,
            public_display_name: accounts[index].public_display_name,
            private_display_name: accounts[index].private_display_name,
            failed_logins: accounts[index].failed_logins,
            two_factor_required: accounts[index].two_factor_required,
            security_provider_id: accounts[index].security_provider_id,
            security_provider_name: spname,
            groups: GroupMemberships
        }
        ret.push(user)
    }       
    
    return ret
    
    }
    
// =================================================
// GET Security Providers
// =================================================
export async function sra_GET_security_providers() {

    const axios = require('axios');
    const qs = require('querystring');

        const configGP = {
            method: 'get',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/api/config/v1/security-provider',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
            let resSP = await axios(configGP)
            return resSP

    }

// =================================================
// GET a User 
// =================================================
export async function sra_GET_account(id:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'get',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/api/config/v1/user/'+id,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    let res = await axios(config)

      return res

    }

// =================================================
// GET a User Details
// =================================================
export async function sra_GET_account_details(account:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    let resGP = await sra_GET_group_policies()
    // GET Group Policy members Table
    let GPTable = await sra_GET_account_groups_table(resGP.data)
    // GET Security Providers
        let SPs = await sra_GET_security_providers()
        let GroupMemberships = await sra_GET_account_groups_with_table(account.id,GPTable)
        let spname = ''
        for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
            if(SPs.data[indexSP].id == account.security_provider_id){spname = SPs.data[indexSP].name}
        }
            
            return { 
                    id: account.id.toString(),
                    username: account.username,
                    email_address: account.email_address,
                    enabled: account.enabled,
                    preferred_email_language: account.preferred_email_language,
                    public_display_name: account.public_display_name,
                    private_display_name: account.private_display_name,
                    failed_logins: account.failed_logins,
                    two_factor_required: account.two_factor_required,
                    security_provider_id: account.security_provider_id,
                    security_provider_name: spname,
                    groups: GroupMemberships
                }
        
    }

// =================================================
// GET global Group Policy memberships Table
// =================================================
export async function sra_GET_account_groups_table(GPs:any) {

    const axios = require('axios');
    const qs = require('querystring');

    // Iterate Group Policies
    let GPTable = []
    for (let indexGP = 0; indexGP < GPs.length && (indexGP) < GPs.length; ++indexGP) {
  // GET GroupPolicy members       
let GPmbrs = await sra_GET_group_policy_members(GPs[indexGP].id)
for (let index = 0; index < GPmbrs.data.length && (index) < GPmbrs.data.length; ++index) {

      if(GPmbrs.data[index].user_id){
        GPTable.push({"GPmbrid":GPmbrs.data[index].user_id,"security_provider_id":GPmbrs.data[index].security_provider_id,"GP_id":GPs[indexGP].id,"GP_name":GPs[indexGP].name})
      }
}
}
 
    return GPTable

    }

// =================================================
// GET Group Policy members
// =================================================
export async function sra_GET_group_policy_members(id:any) {
    const axios = require('axios');
    const qs = require('querystring');

  // GET GroupPolicy members       
  const configGPmbr = {
    method: 'get',
    rejectUnauthorized: false,
    url: globalThis.__INSTANCE + '/api/config/v1/group-policy/'+id+'/member',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
    }
};
let GPmbrs = await axios(configGPmbr)

  return GPmbrs
}
// =================================================
// GET a User Group Policy memberships using Table
// =================================================
export async function sra_GET_account_groups_with_table(identity:any, GPTable:any) {

    const axios = require('axios');
    const qs = require('querystring');
 
    // Iterate Group Policy Table
    let GPs = []
    for (let indexGPTable = 0; indexGPTable < GPTable.length && (indexGPTable) < GPTable.length; ++indexGPTable) {
  // GET Group Policy memberships for user_id       
      if(GPTable[indexGPTable].GPmbrid == identity){
        GPs.push(GPTable[indexGPTable].GP_id+':'+GPTable[indexGPTable].GP_name)
      }
}
 
    return GPs

    }

// =================================================
// GET Group Policies
// =================================================
export async function sra_GET_group_policies() {

    const axios = require('axios');
    const qs = require('querystring');

    const configGP = {
        method: 'get',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/api/config/v1/group-policy',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    console.log('sra_GET_group_policies about to call axios for resGP')
    let resGP = await axios(configGP)
    return resGP
    }

// =================================================
// GET Group Policy
// =================================================
export async function sra_GET_group_policy(id:any) {

    const axios = require('axios');
    const qs = require('querystring');

    const gpid = id.split(":")[0]

    const configGP = {
        method: 'get',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/api/config/v1/group-policy/'+gpid,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    let resGP = await axios(configGP)
      return resGP

    }
    
// =================================================
// Create a User with entitlements
// =================================================
export async function sra_create_account_ent(identity:any) {

    const axios = require('axios');
    const qs = require('querystring');

    let res = await sra_create_account(identity)

    // entitlements = Group Policies - using groups instead of entitlements
    let ret = {}

if (identity.groups){
    logger.info('identity.groups = '+identity.groups[0])
  
    const change = {"op": "Add","attribute": "groups","value": identity.groups[0]}
    let resEnt = await sra_change_account(res.id, change)

    logger.info('resEnt for Add Entitlement: '+change)
    ret = {
        "id": res.id.toString(),
        "username": res.username,
        "public_display_name": res.public_display_name,
        "private_display_name": res.private_display_name,
        "email_address": res.email_address,
        "preferred_email_language": res.preferred_email_language,
        "security_provider_id": res.security_provider_id,
        "two_factor_required": res.two_factor_required,
        "enabled": res.enabled,
        "groups": identity.groups
    }
}


    return ret
    
    }
// =================================================
// Create a User without entitlements - Expect IDN to send separate call for Entitlements
// =================================================
export async function sra_create_account(identity:any) {

    const axios = require('axios');
    const qs = require('querystring');

    let resA = await sra_GET_account("1")


    let data = {}
    if(!(resA.data.private_display_name)){
    data = {
        "username": identity.username,
        "public_display_name": identity.public_display_name,
        "email_address": identity.email_address,
        "enabled": true,
        "password": identity.password
    }
}
if(resA.data.private_display_name){
    data = {
        "username": identity.username,
        "public_display_name": identity.public_display_name,
        "private_display_name": identity.private_display_name,
        "email_address": identity.email_address,
        "enabled": true,
        "password": identity.password
    }
}

    // set the headers
    const config = {
        method: 'post',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/api/config/v1/user',
        data: data,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
    };
    let res = await axios(config)
    
    return res.data
    
    }

// =================================================
// Change a User Entitlements
// =================================================
export async function sra_change_account(account:any, change:any) {

    const axios = require('axios');
    const qs = require('querystring');

    // entitlements = Group Policies    
    if (change.attribute){
        const gpid = change.value.split(":")[0]
    let config_ent = {}
    let member_id = {}

    //Remove User from Group Policy
    if (change.op == "Remove" || change.op == "remove"){
        //Get Member ID via Group Policy Query
        member_id = {
            method: 'get',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/api/config/v1/group-policy/'+gpid+'/member',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
        let resM = await axios(member_id)
            let mbr_id = 0
        resM.data.forEach((element: { user_id: number; id: number; security_provider_id: number }) => {
            logger.info(`Remove Group Policy.  element.user_id = `+element.user_id+'   account = '+account)
            if(element.user_id == account){mbr_id = element.id}
        })
        //Use mbr_id to remove User from Group Policy
        config_ent = {
            method: 'delete',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/api/config/v1/group-policy/'+gpid+'/member/'+mbr_id,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
       }
    //Add User to Group Policy
    if (change.op == "Add" || change.op == "add"){
        config_ent = {
            method: 'post',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/api/config/v1/group-policy/'+gpid+'/member',
            data: {"security_provider_id":1,"user_id":parseInt(account)},
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
        }
       }


       let resEnt = await axios(config_ent)
 
       return {}


    }
    
}
    
// =================================================
// Change a User Status
// =================================================
export async function sra_change_account_status(account:any, change:any) {

    const axios = require('axios');
    const qs = require('querystring');

    // Disable Account    
if (change == "disable"){

        const status = {
            method: 'patch',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/api/config/v1/user/'+parseInt(account),
            data: {"enabled": false},
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }
      
    }
    let res = await axios(status)
    .catch(function (error:any) {
        if (error.response) {
          console.log('error data = '+JSON.stringify(error.response.data));
          console.log('error status = '+error.response.status);
          console.log('error headers = '+error.response.headers);
        }
        if(error.response.status == 401){
            console.log('#### error status = 401')
            // Change expiration time to a value in the past to trigger Re-Authentication
            globalThis.__EXPIRATION_TIME = 1682444930000
            let resAuth = sra_auth()
            let res2 = axios(status)
            return res2
        }
      });
    return res
}

if (change == "enable"){

    const status = {
        method: 'patch',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/api/config/v1/user/'+parseInt(account),
        data: {"enabled": true},
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
  
}
let res = await axios(status)
.catch(function (error:any) {
    if (error.response) {
      console.log('error data = '+JSON.stringify(error.response.data));
      console.log('error status = '+error.response.status);
      console.log('error headers = '+error.response.headers);
    }
    if(error.response.status == 401){
        console.log('#### error status = 401')
        // Change expiration time to a value in the past to trigger Re-Authentication
        globalThis.__EXPIRATION_TIME = 1682444930000
        let resAuth = sra_auth()
        let res2 = axios(status)
        return res2
    }
  });
return res
}

if (change == "unlock"){

    const status = {
        method: 'patch',
        rejectUnauthorized: false,
        url: globalThis.__INSTANCE + '/api/config/v1/user/'+parseInt(account),
        data: {"failed_logins": 0},
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
        }
  
}
let res = await axios(status)
.catch(function (error:any) {
    if (error.response) {
      console.log('error data = '+JSON.stringify(error.response.data));
      console.log('error status = '+error.response.status);
      console.log('error headers = '+error.response.headers);
    }
    if(error.response.status == 401){
        console.log('#### error status = 401')
        // Change expiration time to a value in the past to trigger Re-Authentication
        globalThis.__EXPIRATION_TIME = 1682444930000
        let resAuth = sra_auth()
        let res2 = axios(status)
        return res2
    }
  });
return res
}

    if (change == "delete"){
        const status = {
            method: 'delete',
            rejectUnauthorized: false,
            url: globalThis.__INSTANCE + '/api/config/v1/user/'+parseInt(account),
            headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer '+globalThis.__ACCESS_TOKEN
            }  
    }
    let res = await axios(status)
    return res
}

}
