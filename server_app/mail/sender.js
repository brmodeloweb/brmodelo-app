const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const templateLoader = require('./templateLoader');

const getPath = (email, recoveryCode) => {
  const baseurl = process.env.PROD_MAIL_ENV || 'http://localhost:3000';
  return `${baseurl}/#!/reset/${email}/${recoveryCode}`
}

const recovery = async (email, recoveryCode) => {
  return new Promise(async (resolve, reject) => {
    if(!process.env.PROD_MAIL_ENV) {
      return resolve(`reset link: ${getPath(email, recoveryCode)}`)
    }
    const data = {
      from: 'brmodeloweb@gmail.com',
      to: [email],
      subject: 'Recuperação de senha',
      html: templateLoader.loadRecovery(getPath(email, recoveryCode)),
    };
    const mg = mailgun.client({ username: 'api', key: process.env.PROD_MAILGUN_API_KEY });
    mg.messages.create('brmodeloweb.com', data)
      .then(msg => resolve(msg))
      .catch(err => reject(err));
  });
};

const sender = {
  recovery
};

module.exports = sender;