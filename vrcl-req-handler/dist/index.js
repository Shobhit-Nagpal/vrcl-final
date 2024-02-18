"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_js_1 = require("@supabase/supabase-js");
require("dotenv/config");
const PROJECT_URL = process.env["SUPABASE_PROJECT_URL"] || "";
const ANON_KEY = process.env["SUPABASE_ANON_KEY"] || "";
const supabase = (0, supabase_js_1.createClient)(PROJECT_URL, ANON_KEY);
const app = (0, express_1.default)();
app.get("/*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const host = req.hostname;
    const id = host.split(".")[0];
    const filePath = req.path.slice(1);
    const { data, error } = yield supabase.storage.from("vercel").download(`dist/${id}/${filePath}`);
    if (error !== null || data === null) {
        return res.status(500).json({ error: error });
    }
    const contentType = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript";
    const content = Buffer.from(yield data.arrayBuffer());
    res.set("Content-Type", contentType);
    return res.send(content);
}));
app.listen(3001, () => {
    console.log(`App is running up on port 3001!`);
});
