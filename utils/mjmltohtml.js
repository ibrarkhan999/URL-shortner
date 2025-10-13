import {readFile} from "fs/promises"
import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs"
import mjml2html from "mjml";
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);





export const getHtmlFromMjml = async (templete,data) => {
const mjml = await readFile(path.join(dirName,"..","emails",`${templete}.mjml`),"utf-8")

const filledTemplete = ejs.render(mjml,data)

return mjml2html(filledTemplete).html
}