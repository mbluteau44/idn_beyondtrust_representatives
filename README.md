<!DOCTYPE html>
<html>
<body>

<h1>SailPoint IdentityNow SaaS Connector SDK :: BeyondTrust Representatives</h1>

<h2>Remote Support and Privileged Remote Access</h2>
  
  The BeyondTrust Representatives connector has been created using the <a href="https://developer.sailpoint.com/idn/docs/saas-connectivity/">SailPoint IdentityNow SaaS Connector SDK</a>.
  
  Remote Support and Privileged Remote Access both include Representatives and the only difference between the 2 products is that Remote Support has an extra mandatory attribute:  private_display_name.  Below is a User in Privileged Remote Access. 
  
   <img src="images/sra-User.png" alt="SRA User">
  
  Group Policies are used as Groups with the Connector.
  
   <img src="images/sra-GroupPolicy.png" alt="SRA Group Policy">

   <img src="images/sra-GroupPolicy-2.png" alt="SRA Group Policy">
  
  An API service account needs to be created for the Connector.
  
   <img src="images/sra-api-config.png" alt="SRA API User configuration">

  API service account permissions.
  
   <img src="images/sra-api-account-permissions.png" alt="SRA API User configuration">

  The API documentation is available via the Management API section.
  
   <img src="images/sra-api-user.png" alt="SRA API User documentation">
  
  Connector Configuration in IdentityNow.
  
   <img src="images/idn-Config.png" alt="SRA Accounts in IdentityNow">
  
   SRA Accounts in IdentityNow.
  
   <img src="images/idn-Accounts.png" alt="SRA Accounts in IdentityNow">

  SRA Entitlements in IdentityNow.
  
   <img src="images/idn-Entitlements.png" alt="SRA Entitlements in IdentityNow">
 
  Representatives Connector - Create Account(provisioning policy) in IdentityNow.
  
   <img src="images/idn-CreateAccount.png" alt="Create Account in IdentityNow">
  

<h2>Code structure overview</h2>
  
  The BeyondTrust Representatives connector capabilities are managed within connector-spec.json.

  <img src="images/connector-spec.png" alt="connector-spec.json">
  
  The capability list is used by the IdentityNow instance.  The account and entitlement schemas, and the provisioning policy for new accounts created in SRA, are also included in connector-spec.json.
  
  src/index.ts leverages tools/util.ts to render responses back to IdentityNow connector.  We also need to determine if the connector is used against PRA or RS, by looking at the presence of the private_display_name attribute specific to Remote Support, and absent in PRA.

  <img src="images/index.png" alt="index.ts">


src/tools/util.ts includes functions specific to either PRA or Remote Support.

  <img src="images/util.png" alt="util.ts">
  
src/tools/util.ts leverage model/user.ts and /model/group.ts
  
  <img src="images/user.png" alt="user.ts">

  <img src="images/group.png" alt="group.ts">

/src/my-client.ts is called by index.ts for each capability.  Each capability start with a test for the Bearer Token, to determine if it is expired or undefined and require re-authentication.
  
   <img src="images/checkExpiration.png" alt="my-client.ts">
  
Global Variables are used to store the Bearer Token, so as long as the Connector is running, we can reuse the Bearer Token from previous calls, if it is not expired.
  
  <img src="images/globalVariables.png" alt="my-client.ts">

We also need to catch Unauthorized 401 error, which means the Bearer Token we have in Global Variables is invalid despite having a calculated Expiration Time in the future.  This condition can be triggered by changing the instance in configuration after having obtained a Bearer Token from another instance.
  
  <img src="images/catch401.png" alt="my-client.ts">
  
  Functions specific to SRA are located in /src/sra-functions.ts.
  
  This is the Authentication function leveraging Global Variables to make the Bearer Token and calculated Expiration Time available globally.
  
  <img src="images/function-auth.png" alt="sra-functions.ts">
  
  This is the GET User function:
  
  <img src="images/function-user.png" alt="sra-functions.ts">
  
  And this is the function that provides a User with details:
  
  <img src="images/function-userDetails.png" alt="sra-functions.ts">
  
  <h2>Load Testing 8-2000 users</h2>

  Test data was used to test Aggregation for up to 2000 users in SRA.  Each user is a member of 1 of 3 Group Policies.
  
  <img src="images/Aggregation_Time.png" alt="Aggregation Time">

  <img src="images/AccountsAggregation-15.png" alt="15 users">
  
  <img src="images/AccountsAggregation-102.png" alt="102 users">
  
  <img src="images/AccountsAggregation-500-1.png" alt="500 users">
  
  <img src="images/AccountsAggregation-1000-1.png" alt="1000 users">

  
  <img src="images/AccountsAggregation-2000-1.png" alt="2000 users">

<h2>Error handling</h2>
  
  <h3>Invalid host in Configuration:  Test Connection.</h3>
  
   <img src="images/Error-TestConnection-HostNotFound.png" alt="Host Not Found">
   
   But with Smart Error Handling function, we can present a more informative error message to the user:
   
   <img src="images/smartError-HostNotFound.png" alt="Host Not Found - Smart Error Handling">  

  <h3>Invalid credentials in Configuration:  Test Connection.</h3>
  
   <img src="images/Error-TestConnection-InvalidCredentials.png" alt="Invalid Credentials">
   
   But with Smart Error Handling, we are presenting a more informative message.
  
   <img src="images/smartError-401.png" alt="Invalid credentials - Smart Error Handling">
 
  <h3>Invalid non-expired Bearer Token.</h3>
  
  This condition is created by changing the Configuration to point to a different instance(requires 2 RS/PRA instances).
  The Connector logic first checks the expiration time, and assumes that the Bearer Token is still valid, so it attemps a call(e.g. GET User) 
  but the  call fails with Unauthorized 401 error.  The Connector handles this error condition by discarding the Bearer Token 
  and forcing re-authentication.
  
  Switching back and forth between instances and using Test Connection(within Configuration) should result in Success, because the Error condition is catched and handled by code.
  
   <img src="images/ErrorHandling-testConnection-Success.png" alt="Invalidating Bearer Token">

  <h3>Invalid URL path</h3>
  
  This can be created when the host portion of the URL is valid, but not the path.
 
   <img src="images/smartError-404.png" alt="Invalid URL path - Smart Error Handling">

  <h3>Missing permission in Source for API Account</h3>
  
  This can be created by a lack of permission in Source.
 
   <img src="images/smartError-403.png" alt="Missing permissions in source - Smart Error Handling">

  <h3>Trailing slash character in either instance or authentication URL</h3>
  
  Logic included in my-client.ts to remove trailing character to avoid error 405.
  
  <img src="images/error-trailingSlash.png" alt="Code to remove trailing slash">

  
</body>
</html>
