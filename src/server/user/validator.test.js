const userValidator = require("./validator");

describe('validateLoginParams test', () => {
  test('should fail when username is missing', () => {
    const validation = userValidator.validateLoginParams({username: "", password: "123456"});  
    expect(validation.valid).toBeFalsy();
  });
  
  test('should fail when password is missing', () => {
    const validation = userValidator.validateLoginParams({username: "some_username", password: ""});  
    expect(validation.valid).toBeFalsy();
  });
  
  test('should pass when when we have params all ok', () => {
    const validation = userValidator.validateLoginParams({username: "some_username", password: "some_password"});  
    expect(validation.valid).toBeTruthy();
  });
});

describe('validateSignUpParams test', () => {
  test('should fail when username is missing', () => {
    const validation = userValidator.validateSignUpParams({username: "",  mail: "", password: "123456"});  
    expect(validation.valid).toBeFalsy();
  });

  test('should fail when mail is missing', () => {
    const validation = userValidator.validateSignUpParams({username: "some_username", mail: "", password: ""});  
    expect(validation.valid).toBeFalsy();
  });
  
  test('should fail when password is missing', () => {
    const validation = userValidator.validateSignUpParams({username: "some_username", mail: "some_mail", password: ""});  
    expect(validation.valid).toBeFalsy();
  });
  
  test('should pass when when we have params all ok', () => {
    const validation = userValidator.validateSignUpParams({username: "some_username", mail: "some_mail", password: "some_password"});  
    expect(validation.valid).toBeTruthy();
  });
});