const SecretToken = process.env.SECRET_TOKEN;
const MongoUrl = process.env.PROD_MONGODB || process.env.MONGODB_LOCAL_URL || process.env.MONGO_URI;
const IsDevelopment = process.env.NODE_ENV === "development";
const Port = Number(process.env.PORT);
const ApiUrl = `${process.env.API_URL}`;

module.exports = {
	SecretToken,
	MongoUrl,
	IsDevelopment,
	Port,
	ApiUrl,
}