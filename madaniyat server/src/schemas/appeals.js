import { model, Schema, Types } from "mongoose";



const AppealSchema = new Schema({
 group : {
    type : Types.ObjectId
 },
 fullname : {
    type : String,
 },
 phone : {
    type : String,
    match : /^998([378]{2}|(9[013-57-9]))\d{7}$/
 },
 message : {
    type : String
 }
});


export default model('Appeals', AppealSchema)