let rescodeObj = {
    //resultcode
    Success : 200,
    Failed : 400,
    RequestCode : 404,
    AuthorityCode : 406,
    VerifyFailedCode : 500,

    //Success & Fail ERROR
    SuccessMessage : "Success",
    FailedMessage : "Failed",
    
    //CRUD ERROR
    CreateError : "Create Error",
    ReadError : "Read Error",
    UpdateError : "Update Error",
    DeleteError : "Delete Error",

    //jsonWebToken Verify ERROR
    VerifyFailError : "Verify Error",

    // Authority ERROR
    AuthorityError : "Authority Error"
};

module.exports = rescodeObj